import { test, expect, Page, request as pwRequest } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Final visual sweep of every CRM page and the shell overlays, at three
// widths in both themes. Needs the local backend (127.0.0.1:5000) and the
// dev server (localhost:3000) running.
//
//   npx playwright test tests/final-sweep.spec.ts --project=chromium --workers=2
//
// Screenshots go to screenshots/final. Each test also writes a JSON report
// to screenshots/final/_reports with console errors, failed requests,
// "RetainIQ" text, text running off screen or clipped, and low-contrast
// text, so the results can be reviewed in one place. Only RetainIQ text and
// page-level horizontal scroll fail the test; everything else is reported.

const APP_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://127.0.0.1:5000';
const OUT = 'screenshots/final';
const REPORTS = path.join(OUT, '_reports');

const WIDTHS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];
const THEMES = ['dark', 'light'] as const;

// page id -> sidebar label
const PAGES: Record<string, string> = {
  dashboard: 'Dashboard',
  customers: 'Clients',
  journey: 'Pipeline',
  alerts: 'Analytics',
  tasks: 'Tasks',
  contacts: 'Contacts',
  quotes: 'Quotes',
  sequences: 'Sequences',
  automations: 'Automations',
  copilot: 'AI Co-pilot',
};

let guestToken = '';

test.beforeAll(async () => {
  const ctx = await pwRequest.newContext();
  const res = await ctx.post(`${API_URL}/api/auth/guest`);
  expect(res.ok(), 'guest login on the local backend').toBeTruthy();
  guestToken = (await res.json()).token;
  await ctx.dispose();
  fs.mkdirSync(REPORTS, { recursive: true });
});

type Report = {
  consoleErrors: string[];
  failedRequests: string[];
  retainIQ: string[];
  offscreenText: string[];
  clippedText: string[];
  lowContrast: string[];
  horizontalScroll: boolean;
};

function watch(page: Page) {
  const r = { consoleErrors: [] as string[], failedRequests: [] as string[] };
  page.on('console', (m) => { if (m.type() === 'error') r.consoleErrors.push(m.text().slice(0, 300)); });
  page.on('pageerror', (e) => r.consoleErrors.push('pageerror: ' + String(e).slice(0, 300)));
  page.on('requestfailed', (req) => r.failedRequests.push(`${req.method()} ${req.url()} ${req.failure()?.errorText}`));
  page.on('response', (res) => { if (res.status() >= 400) r.failedRequests.push(`${res.request().method()} ${res.url()} ${res.status()}`); });
  return r;
}

async function open(page: Page, viewport: { width: number; height: number }, theme: string, opts: { asMember?: boolean } = {}) {
  await page.setViewportSize(viewport);
  await page.addInitScript(([t, token]) => {
    try {
      if (!sessionStorage.getItem('sweep-init')) {
        localStorage.clear();
        localStorage.setItem('riq_theme', t);
        localStorage.setItem('riq_sidebar_collapsed', '0');
        localStorage.setItem('riq_auth_token', token);
        sessionStorage.setItem('sweep-init', '1');
      }
    } catch (e) {}
  }, [theme, guestToken]);
  if (opts.asMember) {
    // The upload screen is hidden from guests. Show it by telling the
    // browser this session is a regular user; the real guest token still
    // backs every API call, and nothing is written to the backend.
    await page.route('**/api/auth/me', async (route) => {
      const res = await route.fetch();
      const body = await res.json();
      if (body && body.user) body.user.guest = false;
      await route.fulfill({ response: res, json: body });
    });
  }
  await page.goto(APP_URL + '/app');
  await page.waitForSelector('main');
}

async function goTo(page: Page, label: string, isMobile: boolean) {
  if (isMobile) await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: label, exact: true }).first().click();
  await settle(page);
}

async function settle(page: Page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1200);
}

// Look for text problems in the rendered page.
async function inspect(page: Page) {
  return page.evaluate(() => {
    const out = { retainIQ: [] as string[], offscreenText: [] as string[], clippedText: [] as string[], lowContrast: [] as string[], horizontalScroll: false };
    const vw = window.innerWidth;
    out.horizontalScroll = document.documentElement.scrollWidth > vw + 1;

    const bodyText = document.body.innerText + ' ' + document.title;
    const m = bodyText.match(/.{0,40}retain\s*-?\s*iq.{0,40}/gi);
    if (m) out.retainIQ.push(...m);

    const parse = (c: string): number[] | null => {
      let mm = c.match(/rgba?\(([^)]+)\)/);
      if (mm) {
        const p = mm[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
      }
      mm = c.match(/color\(srgb ([^)]+)\)/);
      if (mm) {
        const p = mm[1].split(/[ /]+/).filter(Boolean).map(Number);
        return [p[0] * 255, p[1] * 255, p[2] * 255, p.length > 3 ? p[3] : 1];
      }
      return null;
    };
    const lum = (c: number[]) => {
      const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const blend = (top: number[], bottom: number[]) => {
      const a = top[3];
      return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1];
    };
    const bgOf = (el: Element | null): number[] | null => {
      const layers: number[][] = [];
      let n: Element | null = el;
      while (n) {
        const cs = getComputedStyle(n);
        if (cs.backgroundImage && cs.backgroundImage !== 'none') return null; // gradients, images: skip
        const c = parse(cs.backgroundColor);
        if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break; }
        n = n.parentElement;
      }
      let base = [255, 255, 255, 1];
      for (let i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base);
      return base;
    };
    const describe = (el: Element) => {
      const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50);
      return `<${el.tagName.toLowerCase()}> "${t}"`;
    };

    const all = Array.from(document.querySelectorAll('body *'));
    for (const el of all) {
      const hasOwnText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent || '').trim().length > 1);
      if (!hasOwnText) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (el.closest('[aria-hidden="true"]')) continue;

      // Text inside a sideways-scrolling container (tables, the pipeline
      // board) is meant to extend past the screen.
      let scroller: Element | null = el.parentElement;
      while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowX)) scroller = scroller.parentElement;
      if (!scroller && (rect.right > vw + 1 || rect.left < -1)) out.offscreenText.push(`${describe(el)} x=${Math.round(rect.left)}..${Math.round(rect.right)}`);

      const clips = cs.overflow === 'hidden' || cs.overflowX === 'hidden';
      if (clips && el.scrollWidth > el.clientWidth + 1 && cs.textOverflow !== 'ellipsis') {
        out.clippedText.push(`${describe(el)} ${el.scrollWidth}>${el.clientWidth}`);
      }

      // Contrast against the composited background (skipped over gradients).
      let fg = parse(cs.color);
      const bg = bgOf(el);
      if (!fg || !bg) continue;
      // Ancestor opacity fades text; fold it in.
      let op = 1; let n: Element | null = el;
      while (n) { op *= Number(getComputedStyle(n).opacity); n = n.parentElement; }
      fg = blend([fg[0], fg[1], fg[2], fg[3] * op], bg);
      const L1 = lum(fg), L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const size = parseFloat(cs.fontSize);
      const bold = Number(cs.fontWeight) >= 700;
      const large = size >= 24 || (bold && size >= 18.66);
      const need = large ? 3 : 4.5;
      const disabled = (el.closest('button, input, select, textarea') as HTMLButtonElement | null)?.disabled;
      // Faded on purpose (done tasks, lost deals, paused rules) is tagged so
      // it can be told apart from real misses.
      if (!disabled && ratio < need) out.lowContrast.push(`${describe(el)} ${ratio.toFixed(2)}:1 (needs ${need})${op < 1 ? ' [faded]' : ''}`);
    }
    for (const k of ['offscreenText', 'clippedText', 'lowContrast'] as const) out[k] = Array.from(new Set(out[k])).slice(0, 40);
    return out;
  });
}

async function shoot(page: Page, name: string) {
  // <main> scrolls inside a 100dvh shell, so a fullPage shot only gets the
  // first screen. Grow the viewport to the content height for the shot.
  const vp = page.viewportSize()!;
  const contentH = await page.evaluate(() => {
    const m = document.querySelector('main');
    return m ? m.scrollHeight + (window.innerHeight - m.clientHeight) : document.body.scrollHeight;
  });
  const h = Math.min(Math.max(vp.height, contentH), 7000);
  if (h !== vp.height) { await page.setViewportSize({ width: vp.width, height: h }); await page.waitForTimeout(400); }
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  if (h !== vp.height) await page.setViewportSize(vp);
}

function save(name: string, report: Report) {
  fs.writeFileSync(path.join(REPORTS, `${name}.json`), JSON.stringify(report, null, 2));
}

for (const theme of THEMES) {
  for (const vp of WIDTHS) {
    const isMobile = vp.width <= 640;

    for (const [id, label] of Object.entries(PAGES)) {
      test(`${id} ${theme} ${vp.width}`, async ({ page }) => {
        const name = `${id}-${theme}-${vp.width}`;
        const log = watch(page);
        await open(page, vp, theme);
        await goTo(page, label, isMobile);
        const found = await inspect(page);
        await shoot(page, name);
        const report = { ...log, ...found };
        save(name, report);
        expect(found.retainIQ, 'RetainIQ text on screen').toEqual([]);
        expect(found.horizontalScroll, 'page scrolls sideways').toBe(false);
      });
    }

    test(`upload ${theme} ${vp.width}`, async ({ page }) => {
      const name = `upload-${theme}-${vp.width}`;
      const log = watch(page);
      await open(page, vp, theme, { asMember: true });
      if (isMobile) await page.getByRole('button', { name: 'Open navigation' }).click();
      await page.getByRole('button', { name: 'Change data' }).first().click();
      await settle(page);
      const found = await inspect(page);
      await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
      save(name, { ...log, ...found });
      expect(found.retainIQ, 'RetainIQ text on screen').toEqual([]);
      expect(found.horizontalScroll, 'page scrolls sideways').toBe(false);
    });

    test(`shell ${theme} ${vp.width}`, async ({ page }) => {
      const prefix = `shell-${theme}-${vp.width}`;
      const log = watch(page);
      const merged: Report = { consoleErrors: [], failedRequests: [], retainIQ: [], offscreenText: [], clippedText: [], lowContrast: [], horizontalScroll: false };
      const step = async (label: string) => {
        const f = await inspect(page);
        for (const k of ['retainIQ', 'offscreenText', 'clippedText', 'lowContrast'] as const) merged[k].push(...f[k].map((s) => `[${label}] ${s}`));
        merged.horizontalScroll = merged.horizontalScroll || f.horizontalScroll;
        await page.screenshot({ path: path.join(OUT, `${prefix}-${label}.png`) });
      };

      await open(page, vp, theme);
      await settle(page);

      if (isMobile) {
        await page.getByRole('button', { name: 'Open navigation' }).click();
        await page.waitForTimeout(400);
        await step('nav-open');
        await page.getByRole('button', { name: 'Close navigation' }).click();
      } else {
        await page.getByRole('button', { name: 'Collapse sidebar' }).click();
        await page.waitForTimeout(500);
        await step('sidebar-collapsed');
        await page.getByRole('button', { name: 'Expand sidebar' }).click();
        await page.waitForTimeout(500);
        await step('sidebar-expanded');
      }

      await page.keyboard.press('Control+k');
      await page.getByPlaceholder('Search or type a command...').waitFor();
      await page.waitForTimeout(400);
      await step('command-palette');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);

      await page.getByRole('button', { name: 'Notifications' }).click();
      await page.waitForTimeout(600);
      await step('notifications');
      await page.getByRole('button', { name: 'Notifications' }).click();
      await page.waitForTimeout(300);

      await page.getByRole('button', { name: 'Open chat' }).click();
      await page.waitForTimeout(700);
      await step('chat');
      // On phones the panel covers the launcher, so use the panel's own close button.
      await page.getByRole('button', { name: 'Close chat' }).last().click();
      await page.waitForTimeout(400);

      if (isMobile) await page.getByRole('button', { name: 'Open navigation' }).click();
      await page.getByRole('button', { name: 'Toggle theme' }).click();
      await page.waitForTimeout(500);
      const after = await page.evaluate(() => document.body.dataset.theme);
      expect(after).toBe(theme === 'dark' ? 'light' : 'dark');
      await step('theme-toggled');

      save(prefix, { ...log, ...merged });
      expect(merged.retainIQ, 'RetainIQ text on screen').toEqual([]);
    });
  }
}
