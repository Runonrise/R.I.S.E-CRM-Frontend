import { test, expect, type Page } from '@playwright/test';

// Routing: landing page at "/", CRM at "/app".
// Run against a dev server or `npx serve -s build -l 3000`:
//   npx playwright test tests/routing.spec.ts --project=chromium

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.beforeEach(async ({ page }) => {
  // Start logged out so /app shows the login screen, and stay offline.
  await page.addInitScript(() => {
    try { localStorage.removeItem('riq_auth_token'); } catch (e) {}
  });
  await page.route('**/api/**', (route) => route.abort());
});

async function expectLanding(page: Page) {
  await expect(page.locator('.rise-landing')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Spot churn before it happens' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Runonrise' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Launch App' }).first()).toBeVisible();
}

// App.css defines --brand-bright on :root. It should only exist on /app.
async function crmStylesLoaded(page: Page) {
  return page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--brand-bright').trim() !== ''
  );
}

test('"/" shows the landing page', async ({ page }) => {
  await page.goto(BASE_URL + '/');
  await expectLanding(page);
  expect(await crmStylesLoaded(page)).toBe(false);
});

test('Launch App goes to /app and shows the login screen', async ({ page }) => {
  await page.goto(BASE_URL + '/');
  await page.getByRole('link', { name: 'Launch App' }).first().click();
  await expect(page).toHaveURL(BASE_URL + '/app');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  expect(await crmStylesLoaded(page)).toBe(true);
});

test('going Back from /app does not carry CRM styles to "/"', async ({ page }) => {
  await page.goto(BASE_URL + '/');
  await page.getByRole('link', { name: 'Launch App' }).first().click();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(BASE_URL + '/');
  await expectLanding(page);
  expect(await crmStylesLoaded(page)).toBe(false);
});

test('refreshing /app stays on /app', async ({ page }) => {
  await page.goto(BASE_URL + '/app');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(BASE_URL + '/app');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('an unknown path returns to "/"', async ({ page }) => {
  await page.goto(BASE_URL + '/no/such/page');
  await expect(page).toHaveURL(BASE_URL + '/');
  await expectLanding(page);
});
