import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Mermaid bundles and Axe both hold a substantial renderer tree. Keep two
  // workers, but distribute individual tests so no Chromium process retains
  // every renderer-heavy page for the entire suite.
  workers: 2,
  fullyParallel: true,
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
