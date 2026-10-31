import { defineConfig } from '@playwright/test';

// Capture driver for the silent demo video (see demo/SCRIPT.md).
// Run with: npm run demo:capture
// Needs the Flask backend running on 127.0.0.1:5000 with guest mode on.
// The CRA dev server on :3001 is started automatically if it isn't up yet.

const BASE_URL = process.env.DEMO_BASE_URL || 'http://localhost:3001';
const SIZE = { width: 1920, height: 1080 };

export default defineConfig({
  testDir: '.',
  testMatch: 'walkthrough.spec.ts',
  // Playwright clears this folder at the start of every run.
  outputDir: 'clips',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    browserName: 'chromium',
    viewport: SIZE,
    deviceScaleFactor: 2,
    colorScheme: 'dark',
    video: { mode: 'on', size: SIZE },
    launchOptions: { slowMo: 250 },
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
  },
  webServer: {
    command: 'npm start',
    url: BASE_URL,
    cwd: '..',
    env: { PORT: '3001', BROWSER: 'none' },
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
