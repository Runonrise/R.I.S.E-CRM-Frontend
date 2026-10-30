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
  await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete));
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

test('Watch demo scrolls to the demo section', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openLanding(page);
  const demo = page.locator('#demo');
  await expect(demo).not.toBeInViewport();
  await page.getByRole('link', { name: 'Watch demo' }).click();
  await expect(demo).toBeInViewport();
  await expect(page.getByRole('heading', { name: 'See it in action' })).toBeInViewport();
  await expect(demo).toBeFocused();
  // The heading sits below the sticky header, not under it.
  const headerBottom = await page.locator('header').evaluate((h) => h.getBoundingClientRect().bottom);
  const headingTop = await page.getByRole('heading', { name: 'See it in action' }).evaluate((h) => h.getBoundingClientRect().top);
  expect(headingTop).toBeGreaterThanOrEqual(headerBottom);
});

test('Watch demo works with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await openLanding(page);
  await page.getByRole('link', { name: 'Watch demo' }).click();
  await expect(page.getByRole('heading', { name: 'See it in action' })).toBeInViewport();
});
