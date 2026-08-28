import { expect, test } from '@playwright/test';

const sample = `flowchart LR
  café["Café ☕"] --> api[API]
  api --> db[(Database)]`;

test('@claim:demo-sandbox demo loads sample and does not save it as real data', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#source')).toHaveValue(/Diagram source/);
  await page.locator('#source').fill('flowchart LR\n  demo --> changed');
  expect(await page.evaluate(() => localStorage.getItem('real:diagram-source-studio:document'))).toBeNull();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#source')).toHaveValue(/Diagram source/);
});

test('@claim:private-local editor flow sends no diagram data off origin', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()); });
  await page.goto('/demo');
  await page.locator('#source').fill(sample);
  await expect(page.locator('#diagnostics')).toContainText('Preview rendered');
  await expect(page.locator('#preview svg text').filter({ hasText: 'Café' })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export SVG' }).click();
  await download;
  expect(external).toEqual([]);
});

test('@claim:editable-export SVG and PNG exports restore source byte for byte', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#source').fill(sample);
  await expect(page.locator('#diagnostics')).toContainText('Preview rendered');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export SVG' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const content = await import('node:fs/promises').then((fs) => fs.readFile(path!));
  await page.locator('#source').fill('flowchart LR\n  changed --> value');
  await page.locator('#file-input').setInputFiles({ name: 'roundtrip.svg', mimeType: 'image/svg+xml', buffer: content });
  await expect(page.locator('#source')).toHaveValue(sample);
  const pngDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG' }).click();
  const pngDownload = await pngDownloadPromise;
  const pngPath = await pngDownload.path();
  const png = await import('node:fs/promises').then((fs) => fs.readFile(pngPath!));
  await page.locator('#source').fill('flowchart LR\n  changed --> again');
  await page.locator('#file-input').setInputFiles({ name: 'roundtrip.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('#source')).toHaveValue(sample);
});

test('@claim:renderer-matrix licensed demo compares bundled Mermaid 10 and 11', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:diagram-source-studio', 'test-license');
    localStorage.setItem('sb_license_verdict:diagram-source-studio', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  await page.goto('/demo');
  await expect(page.locator('#diagnostics')).toContainText('Preview rendered');
  await page.getByRole('button', { name: 'Compare versions' }).click();
  await expect(page.locator('.matrix-result')).toHaveCount(2);
  await expect(page.getByRole('heading', { name: 'Mermaid 11.17.2' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mermaid 10.9.8' })).toBeVisible();
});

test('@claim:d2-preview compact D2 source renders nodes and arrows', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#engine').selectOption('d2');
  await page.locator('#source').fill('client: Client\napi: API\nclient -> api: request');
  await expect(page.locator('#diagnostics')).toContainText('Preview rendered');
  await expect(page.locator('#preview svg text')).toContainText(['request']);
});

test('@claim:offline-core demo reloads and edits without a network', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect(page.locator('#source')).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await page.locator('#source').fill('source: Offline source\ntarget: Preview\nsource -> target');
  await page.locator('#engine').selectOption('d2');
  await expect(page.locator('#diagnostics')).toContainText('Preview rendered');
});
