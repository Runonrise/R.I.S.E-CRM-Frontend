import { test, expect, type Page, type Locator } from '@playwright/test';
import path from 'path';

// One test per scene, so each one saves its own clip to demo/clips/<scene>.webm.
// Scenes follow demo/SCRIPT.md. Selectors come from the live app (roles and visible text).
//
// Data: every scene logs in as the backend's guest user (the seeded demo data).
// That seed uses real company names, and the Co-pilot page has more hardcoded in
// src/data/mockData.js, so this driver swaps them for made-up names before they
// reach the screen. It also swaps contact email domains for example.com.
// Nothing in src/ or the backend changes.

const API = process.env.DEMO_API_URL || 'http://127.0.0.1:5000';
const CLIPS_DIR = path.resolve(__dirname, 'clips');
const SHOW_CURSOR = process.env.DEMO_CURSOR !== '0';

// Names that are hardcoded in the Co-pilot mock data, including the short forms
// it uses in sentences ("Sun Life deal going cold").
const FIXED_ALIASES: Record<string, string> = {
  'Sun Life Financial': 'Harborview Financial',
  'Sun Life': 'Harborview',
  'Loblaw Companies': 'Fernwood Markets',
  'Loblaw': 'Fernwood',
  'TD Bank': 'Northgate Bank',
  'RBC Bank': 'Crestline Bank',
  'RBC': 'Crestline',
  'Bell Canada': 'Lumio Telecom',
  'Telus': 'Brightwire',
  'Manulife': 'Oakhaven Life',
  'Rogers': 'Kestrel Media',
};

const ALIAS_STEMS = [
  'Ashgrove', 'Birchway', 'Cobalt Ridge', 'Driftwood', 'Elmstead', 'Foxhollow', 'Glenmere', 'Hollins',
  'Ivybrook', 'Juniper Point', 'Kingsley Vale', 'Larkspur', 'Millbrook', 'Nettlefield', 'Orchard Hill',
  'Pebble Creek', 'Quillon', 'Rowanwood', 'Saltmarsh', 'Thornbury', 'Umberfield', 'Valemont', 'Wrenfield',
  'Yarrowby', 'Zellwood', 'Amberlane', 'Bramblecote', 'Clearwater Bay', 'Dunmore', 'Eastbrook',
];
const ALIAS_SUFFIXES = ['Group', 'Systems', 'Partners', 'Holdings', 'Works', 'Labs'];

function aliasPool(): string[] {
  const out: string[] = [];
  for (const suffix of ALIAS_SUFFIXES) for (const stem of ALIAS_STEMS) out.push(`${stem} ${suffix}`);
  return out;
}

let aliases: Record<string, string> = {};
let guestToken = '';

// Log in as guest once, read every company name the demo data contains, and
// give each one a made-up name. Same mapping for every scene.
test.beforeAll(async ({ request }) => {
  const auth = await request.post(`${API}/api/auth/guest`);
  expect(auth.ok(), 'guest login works (is the backend running with guest mode on?)').toBeTruthy();
  guestToken = (await auth.json()).token;

  const headers = { Authorization: `Bearer ${guestToken}` };
  const names = new Set<string>();
  for (const route of ['/api/db/clients', '/api/db/deals']) {
    const res = await request.get(`${API}${route}`, { headers });
    if (!res.ok()) continue;
    for (const row of await res.json()) {
      for (const key of ['client_name', 'company_name', 'company']) {
        if (typeof row[key] === 'string' && row[key].trim()) names.add(row[key].trim());
      }
    }
  }

  aliases = { ...FIXED_ALIASES };
  const pool = aliasPool().filter((a) => !Object.values(FIXED_ALIASES).includes(a));
  [...names].sort().forEach((name) => {
    if (!aliases[name]) aliases[name] = pool.shift() || `Client ${Object.keys(aliases).length + 1}`;
  });
});

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyAliases(text: string, map: Record<string, string>) {
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  if (!keys.length) return text;
  const re = new RegExp(`(?<![\\w])(${keys.map(escapeRegExp).join('|')})(?![\\w])`, 'g');
  return text
    .replace(re, (m) => map[m] ?? m)
    .replace(/([\w.+-]+)@[\w-]+(\.[\w-]+)+/g, '$1@example.com');
}

// Runs in the browser before the app loads.
function browserSetup({ token, map, showCursor }: { token: string; map: Record<string, string>; showCursor: boolean }) {
  try {
    localStorage.setItem('riq_auth_token', token);
    localStorage.setItem('riq_theme', 'dark');
    localStorage.setItem('riq_sidebar_collapsed', '0');
  } catch (e) {}

  // Swap hardcoded company names in visible text (the Co-pilot mock data).
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?<![\\w])(${keys.map(esc).join('|')})(?![\\w])`, 'g');
  const fixText = (node: Node) => {
    const v = node.nodeValue;
    if (!v) return;
    re.lastIndex = 0;
    if (!re.test(v)) return;
    node.nodeValue = v.replace(re, (m) => map[m] ?? m);
  };
  const walk = (root: Node) => {
    if (root.nodeType === Node.TEXT_NODE) { fixText(root); return; }
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = tw.nextNode())) fixText(n);
  };
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'characterData') fixText(r.target);
      r.addedNodes.forEach(walk);
    }
  }).observe(document, { subtree: true, childList: true, characterData: true });

  // Headless video has no pointer, so draw one that follows the mouse.
  if (!showCursor) return;
  const addCursor = () => {
    const el = document.createElement('demo-cursor');
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2.5l15 9.2-6.6 1.4 3.9 7.4-2.6 1.3-3.9-7.4L4 19z" fill="#fff" stroke="#0A0910" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    Object.assign(el.style, {
      position: 'fixed', left: '0', top: '0', zIndex: '2147483647', pointerEvents: 'none',
      transform: 'translate(-100px, -100px)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))',
      transition: 'scale 120ms ease-out', display: 'block',
    });
    document.documentElement.appendChild(el);
    window.addEventListener('mousemove', (e) => { el.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 2}px)`; }, true);
    window.addEventListener('mousedown', () => { el.style.scale = '0.85'; }, true);
    window.addEventListener('mouseup', () => { el.style.scale = '1'; }, true);
  };
  if (document.documentElement) addCursor();
  else document.addEventListener('DOMContentLoaded', addCursor);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(browserSetup, { token: guestToken, map: aliases, showCursor: SHOW_CURSOR });

  // Alias company names in API responses, so the email draft and the chat
  // answer are written with the made-up names too.
  await page.route(/\/api\/(?!auth\/)/, async (route) => {
    if (!route.request().url().startsWith(API)) return route.continue();
    const res = await route.fetch();
    const type = res.headers()['content-type'] || '';
    if (!type.includes('json')) return route.fulfill({ response: res });
    await route.fulfill({ response: res, body: applyAliases(await res.text(), aliases) });
  });

  // Start the pointer off to the right, where it won't cover anything.
  await page.mouse.move(1500, 700);
});

// Save each scene's clip under a readable name. A failed scene keeps no clip,
// so an error on screen never ends up in demo/clips/.
test.afterEach(async ({ page }, testInfo) => {
  const video = page.video();
  if (!video) return;
  await page.close();
  if (testInfo.status !== testInfo.expectedStatus) {
    await video.delete();
    return;
  }
  const slug = testInfo.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  await video.saveAs(path.join(CLIPS_DIR, `${slug}.webm`));
});

const QUESTION = 'Which clients are at risk?';

// Replies the backend or the chat widget give when the AI didn't answer.
const CHAT_ERROR_REPLY =
  /went wrong reaching the assistant|trouble reaching the AI service|isn't configured yet|GROQ_API_KEY|taking longer than expected|ran into trouble putting that answer|don't have an answer for that/i;

// ---------- helpers ----------

// offsetX lets the pointer rest beside a target instead of covering it.
async function glideTo(page: Page, target: Locator, steps = 28, offsetX = 0) {
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) throw new Error('target has no box');
  await page.mouse.move(box.x + box.width / 2 + offsetX, box.y + box.height / 2, { steps });
}

async function glideClick(page: Page, target: Locator) {
  await glideTo(page, target);
  await page.waitForTimeout(200);
  await target.click();
}

const hold = (page: Page, ms: number) => page.waitForTimeout(ms);

async function openApp(page: Page) {
  await page.goto('/app');
  await expect(page.getByText('Total clients')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('table')).toBeVisible();
}

function navButton(page: Page, name: string) {
  return page.getByRole('complementary').getByRole('button', { name, exact: true });
}

// The client drawer: the innermost block holding both its close button and its tabs.
function clientDrawer(page: Page) {
  return page
    .locator('div')
    .filter({ has: page.getByRole('button', { name: '×' }) })
    .filter({ has: page.getByRole('button', { name: 'AI Email' }) })
    .last();
}

// Clients tab, "At Risk" filter, open the first client.
async function openAtRiskClient(page: Page) {
  await glideClick(page, navButton(page, 'Clients'));
  await expect(page.getByPlaceholder('Search client, software, or account manager…')).toBeVisible();
  await glideClick(page, page.getByRole('main').getByRole('button', { name: 'At Risk', exact: true }));
  const firstRow = page.getByRole('table').getByRole('rowgroup').nth(1).getByRole('row').first();
  await expect(firstRow).toBeVisible();
  await glideTo(page, firstRow.getByRole('cell').first());
  await hold(page, 700);
  await firstRow.getByRole('cell').first().click();
  const drawer = clientDrawer(page);
  await expect(drawer.getByText('At-risk', { exact: true })).toBeVisible();
  await hold(page, 400);
  return drawer;
}

// ---------- scenes ----------

test('01 landing hero', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await expect(page.getByRole('heading', { level: 1, name: 'Spot churn before it happens' })).toBeVisible();
  await hold(page, 3000);
});

test('02 dashboard kpis', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Spot churn before it happens' })).toBeVisible();
  await hold(page, 800);
  const hero = page.getByRole('region', { name: 'Spot churn before it happens' });
  await glideClick(page, hero.getByRole('link', { name: 'Launch App' }));
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByText('Total clients')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText('Value at risk')).toBeVisible();
  await hold(page, 1200);
  await glideTo(page, page.getByText('Total clients'), 22);
  await hold(page, 900);
  await glideTo(page, page.getByText('Value at risk'), 40);
  await hold(page, 4000);
});

test('03 client risk', async ({ page }) => {
  await openApp(page);
  const drawer = await openAtRiskClient(page);
  const pill = drawer.getByText('At-risk', { exact: true });
  await glideTo(page, pill, 22, ((await pill.boundingBox())?.width ?? 60) / 2 + 40);
  await hold(page, 5000);
});

test('04 retention trend', async ({ page }) => {
  await openApp(page);
  await glideClick(page, navButton(page, 'Analytics'));
  const chart = page.getByRole('img', { name: /^Retention trend over the last/ });
  await expect(chart).toBeVisible();
  await chart.evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  await hold(page, 1200);
  // Sweep across the line and stop on the latest month, where the dip is.
  const box = await chart.boundingBox();
  if (!box) throw new Error('chart has no box');
  const y = box.y + box.height * 0.45;
  await page.mouse.move(box.x + box.width * 0.12, y, { steps: 20 });
  await page.mouse.move(box.x + box.width * 0.95, y, { steps: 45 });
  await hold(page, 4000);
});

test('05 renewal email', async ({ page }) => {
  await openApp(page);
  const drawer = await openAtRiskClient(page);
  await glideClick(page, drawer.getByRole('button', { name: 'AI Email' }));
  await glideClick(page, drawer.getByRole('button', { name: 'Generate renewal email' }));
  const body = drawer.locator('textarea');
  await expect(body).toHaveValue(/\S/, { timeout: 60_000 });
  await expect(body).not.toHaveValue(/Could not generate the email/);
  await glideTo(page, body, 30);
  await hold(page, 6000);
});

test('06 ai copilot', async ({ page, request }) => {
  // Ask the backend first. If the AI can't answer, stop before recording the scene.
  const res = await request.post(`${API}/api/chatbot`, {
    headers: { Authorization: `Bearer ${guestToken}` },
    data: { message: QUESTION, history: [] },
    timeout: 90_000,
  });
  const reply = res.ok() ? String((await res.json()).content || '') : `HTTP ${res.status()}`;
  if (!res.ok() || CHAT_ERROR_REPLY.test(reply)) {
    throw new Error(`Co-pilot can't answer yet, so scene 6 was not recorded. Backend reply: "${reply}"`);
  }

  await openApp(page);
  await glideClick(page, navButton(page, 'AI Co-pilot'));
  await expect(page.getByRole('heading', { level: 1, name: 'AI Co-pilot' })).toBeVisible();
  await hold(page, 800);
  await glideClick(page, page.getByRole('button', { name: 'Open chat' }));
  const input = page.getByPlaceholder('Ask a question or request an action…');
  await glideClick(page, input);
  await input.pressSequentially(QUESTION, { delay: 55 });
  await glideClick(page, page.getByRole('button', { name: 'Send' }));
  // The answer is the bubble right after the question bubble.
  const answer = page.getByText(QUESTION, { exact: true }).locator('xpath=following-sibling::div[1]');
  await expect(answer).toBeVisible({ timeout: 90_000 });
  await expect(answer).not.toHaveText(/^\s*$/);
  await expect(answer, 'the Co-pilot reply is an answer, not an error').not.toHaveText(CHAT_ERROR_REPLY);
  await hold(page, 6000);
});
