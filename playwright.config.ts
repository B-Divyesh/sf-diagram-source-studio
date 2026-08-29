import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // The constrained release worker can only keep one Mermaid/Axe Chromium
  // renderer tree alive reliably. Serial execution is deliberate: failures
  // are never retried or ignored, and every test still gets a fresh context.
  workers: 1,
  retries: 0,
  fullyParallel: false,
  timeout: 45_000,
  expect: { timeout: 15_000 },
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 60_000
  },
  reporter: [['list'], ['html', { open: 'never' }]]
});
