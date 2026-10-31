import { test, expect, type Page } from '@playwright/test';

// Landing page at "/": screenshots at four widths plus behavior checks.
// Run against a dev server or `npx serve -s build -l 3000`:
//   npx playwright test tests/landing.spec.ts --project=chromium
// Screenshots land in screenshots/landing (git-ignored).

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT = 'screenshots/landing';

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.removeItem('riq_auth_token'); } catch (e) {}
  });
  await page.route('**/api/**', (route) => route.abort());
});

// Record every layout shift from the first paint on.
async function trackLayoutShift(page: Page) {
  await page.addInitScript(() => {
    (window as any).__cls = 0;
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as any[]) {
          if (!e.hadRecentInput) (window as any).__cls += e.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}
  });
}

async function openLanding(page: Page) {
  await page.goto(BASE_URL + '/');
  await expect(page.getByRole('heading', { level: 1, name: 'Spot churn before it happens' })).toBeVisible();
  // Lazy images below the fold (the demo poster) load later, so skip them.
  await page.waitForFunction(() =>
    Array.from(document.images).every((i) => i.complete || i.loading === 'lazy')
  );
  await page.evaluate(() => document.fonts.ready);
}

for (const viewport of VIEWPORTS) {
  test(`landing ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await trackLayoutShift(page);
    await openLanding(page);

    // One h1, landmarks, alt text on every image.
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    expect(await page.locator('img:not([alt])').count()).toBe(0);

    // No sideways scroll.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);

    // No layout shift.
    const cls = await page.evaluate(() => (window as any).__cls);
    expect(cls).toBeLessThan(0.01);

    await page.screenshot({ path: `${OUT}/landing-${viewport.width}.png`, fullPage: true });
  });
}

test('mobile menu opens, closes with Escape, and links work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLanding(page);
  const menuButton = page.getByRole('button', { name: 'Menu' });
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await page.screenshot({ path: `${OUT}/landing-390-menu.png` });
  await page.keyboard.press('Escape');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(menuButton).toBeFocused();

  await menuButton.click();
  await page.locator('#rise-landing-menu').getByRole('link', { name: 'How it works' }).click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#how-it-works')).toBeInViewport();
});

test('Launch App goes to /app', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openLanding(page);
  await page.getByRole('main').getByRole('link', { name: 'Launch App' }).first().click();
  await expect(page).toHaveURL(BASE_URL + '/app');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('every Launch App link points to /app', async ({ page }) => {
  await openLanding(page);
  const links = page.getByRole('link', { name: 'Launch App', includeHidden: true });
  const count = await links.count();
  expect(count).toBeGreaterThanOrEqual(3);
  for (let i = 0; i < count; i++) {
    await expect(links.nth(i)).toHaveAttribute('href', '/app');
  }
});

// While VIDEO_URL is empty the demo is hidden and the hero's second button
// goes to "How it works". Once a video is set, Watch demo and the demo
// section's card both open the same video modal.
// These tests follow whichever state the build is in.
async function hasDemo(page: Page) {
  return (await page.locator('#demo').count()) > 0;
}

test('demo link and section match whether a video is set', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openLanding(page);
  const nav = page.getByRole('navigation', { name: 'Main' }).first();
  if (await hasDemo(page)) {
    await expect(nav.getByRole('link', { name: 'Demo' })).toBeVisible();
    await expect(page.getByRole('main').getByRole('button', { name: 'Watch demo' })).toBeVisible();
    await expect(page.locator('#demo').getByRole('button', { name: 'Play demo' })).toBeVisible();
  } else {
    await expect(nav.getByRole('link', { name: 'Demo', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Watch demo' })).toHaveCount(0);
    await expect(page.getByText(/coming soon/i)).toHaveCount(0);
    await expect(page.getByRole('main').getByRole('link', { name: 'See how it works' })).toBeVisible();
  }
});

// The hero button and the section card open one shared modal. Esc, the X,
// and a click outside each close it, and focus goes back to the opener.
async function checkDemoModal(page: Page) {
  const main = page.getByRole('main');
  const dialog = page.getByRole('dialog', { name: 'R.I.S.E CRM demo' });
  const hero = main.getByRole('button', { name: 'Watch demo' });
  const card = page.locator('#demo').getByRole('button', { name: 'Play demo' });
  const player = page.locator('.rise-landing__modal video, .rise-landing__modal iframe');

  // No player, so nothing downloads, until the modal opens.
  await expect(player).toHaveCount(0);

  await hero.click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(player).toHaveCount(1);
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(player).toHaveCount(0);
  await expect(hero).toBeFocused();
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');

  await card.scrollIntoViewIfNeeded();
  await card.click();
  await expect(dialog).toBeVisible();
  await expect(page.locator('dialog')).toHaveCount(1);
  await dialog.getByRole('button', { name: 'Close video' }).click();
  await expect(dialog).toBeHidden();
  await expect(card).toBeFocused();

  await card.click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(dialog).toBeHidden();
  await expect(card).toBeFocused();
}

async function checkSecondaryButton(page: Page) {
  if (await hasDemo(page)) {
    await checkDemoModal(page);
    return;
  }
  const target = page.locator('#how-it-works');
  const heading = page.getByRole('heading', { name: 'How it works' });
  await expect(heading).not.toBeInViewport();
  await page.getByRole('main').getByRole('link', { name: 'See how it works' }).click();
  await expect(heading).toBeInViewport();
  await expect(target).toBeFocused();
  // The heading sits below the sticky header, not under it.
  const headerBottom = await page.locator('header').evaluate((h) => h.getBoundingClientRect().bottom);
  const headingTop = await heading.evaluate((h) => h.getBoundingClientRect().top);
  expect(headingTop).toBeGreaterThanOrEqual(headerBottom);
}

test('hero secondary button scrolls to its section or opens the demo', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openLanding(page);
  await checkSecondaryButton(page);
});

test('hero secondary button works with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await openLanding(page);
  await checkSecondaryButton(page);
});
