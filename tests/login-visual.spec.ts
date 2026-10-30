import { test, expect } from '@playwright/test';

// Visual check of the login screen across widths and both themes, plus a
// guard against the relationship dots ending at radius 0.
// Run against a local dev server: npx playwright test tests/login-visual.spec.ts --project=chromium
// Screenshots land in screenshots/login (git-ignored).

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

const THEMES = ['dark', 'light'] as const;

for (const theme of THEMES) {
  for (const viewport of VIEWPORTS) {
    test(`login ${theme} ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.addInitScript((t) => {
        try {
          localStorage.removeItem('riq_auth_token');
          localStorage.setItem('riq_theme', t);
        } catch (e) {}
      }, theme);
      // Keep the shots stable and offline: no backend calls.
      await page.route('**/api/**', (route) => route.abort());

      await page.goto(BASE_URL + '/app');
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

      // Wait for the logo images to finish loading before shooting.
      await page.waitForFunction(() =>
        Array.from(document.images).every((img) => img.complete)
      );

      // The illustration panel (and its dots) only shows above 640px.
      if (viewport.width > 640) {
        await page.waitForTimeout(2000);
        const radii = await page
          .locator('[data-testid="relationship-node"]')
          .evaluateAll((els) => els.map((el) => parseFloat(el.getAttribute('r') || '0')));
        expect(radii).toHaveLength(4);
        for (const r of radii) expect(r).toBeGreaterThan(0);
        // Let the last dot finish settling before the screenshot.
        await page.waitForTimeout(500);
      } else {
        await page.waitForTimeout(500);
      }

      await page.screenshot({
        path: `screenshots/login/login-${theme}-${viewport.width}.png`,
        fullPage: true,
      });
    });
  }
}
