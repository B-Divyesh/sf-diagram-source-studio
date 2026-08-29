import { expect, test } from '@playwright/test';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);

const sample = `flowchart LR
  café["Café ☕"] --> api[API]
  api --> db[(Database)]`;

test('@claim:demo-sandbox demo loads sample and does not save it as real data', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/diagram-source-studio/verify**', (route) => route.fulfill({ json: { valid: true } }));
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#source')).toHaveValue(/Diagram source/);
  await page.locator('#source').fill('flowchart LR\n  demo --> changed');
  expect(await page.evaluate(() => localStorage.getItem('real:diagram-source-studio:document'))).toBeNull();
  await page.getByText('Have a license?').click();
  await page.locator('#license-token').fill('qa-demo-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Studio license active')).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('sb_license')))).toEqual([]);
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
  const crlfBom = `\ufeffflowchart LR\r\n  café["Café ☕"] --> api[API]\r\n  api --> db[(Database)]\r\n`;
  await page.locator('#file-input').setInputFiles({ name: 'windows.mmd', mimeType: 'text/plain', buffer: Buffer.from(crlfBom, 'utf8') });
  await expect(page.locator('#diagnostics')).toContainText('Preview rendered');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export SVG' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const content = await import('node:fs/promises').then((fs) => fs.readFile(path!));
  const markup = content.toString('utf8');
  const payload = JSON.parse(Buffer.from(markup.match(/<metadata[^>]*>([^<]+)<\/metadata>/)![1], 'base64').toString('utf8'));
  expect(Buffer.from(payload.source, 'base64').toString('utf8')).toBe(crlfBom);
  await page.locator('#source').fill('flowchart LR\n  changed --> value');
  await page.locator('#file-input').setInputFiles({ name: 'roundtrip.svg', mimeType: 'image/svg+xml', buffer: content });
  await expect(page.locator('#source')).toHaveValue(crlfBom.replace(/^\ufeff/, '').replace(/\r\n/g, '\n'));
  const pngDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG' }).click();
  const pngDownload = await pngDownloadPromise;
  const pngPath = await pngDownload.path();
  const png = await import('node:fs/promises').then((fs) => fs.readFile(pngPath!));
  let offset = 8;
  let pngSource = '';
  while (offset + 12 <= png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === 'tEXt' && data.subarray(0, 20).toString() === 'DiagramSourceStudio\0') {
      const pngPayload = JSON.parse(Buffer.from(data.subarray(20).toString(), 'base64').toString('utf8'));
      pngSource = Buffer.from(pngPayload.source, 'base64').toString('utf8');
      break;
    }
    offset += 12 + length;
  }
  expect(pngSource).toBe(crlfBom);
  await page.locator('#source').fill('flowchart LR\n  changed --> again');
  await page.locator('#file-input').setInputFiles({ name: 'roundtrip.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('#source')).toHaveValue(crlfBom.replace(/^\ufeff/, '').replace(/\r\n/g, '\n'));
});

test('@claim:renderer-matrix licensed demo compares bundled Mermaid 10 and 11', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/diagram-source-studio/verify**', (route) => route.fulfill({ json: { valid: true } }));
  await page.goto('/demo');
  await expect(page.locator('#diagnostics')).toContainText('Preview rendered');
  await page.getByText('Have a license?').click();
  await page.locator('#license-token').fill('recorded-valid-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Studio license active')).toBeVisible();
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

test('@claim:license-enforcement unverified tokens never enable Studio offline', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', { value: {} });
    localStorage.setItem('sb_license:diagram-source-studio', 'any-unverified-token');
  });
  await page.route('https://api.sociobot.in/api/v1/products/diagram-source-studio/verify**', (route) => route.abort('internetdisconnected'));
  await page.goto('/');
  await expect(page.getByText('Connect once to verify this license.')).toBeVisible();
  await page.getByRole('button', { name: 'Compare versions' }).click();
  await expect(page.locator('.matrix-result')).toHaveCount(0);
});

test('@claim:native-file-dialogs desktop shell exposes open and save actions', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, '__TAURI_INTERNALS__', { value: {} }));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Open file' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save source' })).toBeVisible();
});

test('@claim:offline-reference bundled syntax reference works without network', async ({ page, context }) => {
  await page.goto('/demo');
  await context.setOffline(true);
  await page.getByText('Offline syntax reference').click();
  await expect(page.locator('#reference-copy')).toContainText('A --> B');
  await page.locator('#engine').selectOption('d2');
  await expect(page.locator('#reference-copy')).toContainText('a -> b: label');
});

test('@claim:safe-svg exported previews remove active and external SVG content', async ({ page }) => {
  await page.goto('/demo');
  const result = await page.evaluate(async () => {
    const modulePath = '/src/diagram.ts';
    const { sanitizeSvg } = await import(/* @vite-ignore */ modulePath);
    return sanitizeSvg(`<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><a href="https://example.com"><text>x</text></a><foreignObject/><image href="https://example.com/a.png"/><rect onclick="alert(1)" style="fill:url(https://example.com/a.svg)"/><style>@import url(https://example.com/x.css); .x{fill:url(#safe)}</style></svg>`);
  });
  expect(result).not.toMatch(/<script|<a\b|foreignObject|https:\/\/|onclick/i);
  expect(result).toContain('url(#safe)');
});

test('@claim:no-tracking editor loads without telemetry or runtime CDNs', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()); });
  await page.goto('/demo');
  await page.locator('#source').fill(sample);
  await expect(page.locator('#diagnostics')).toContainText('Preview rendered');
  expect(external).toEqual([]);
});

test('@claim:unsigned-builds release workflow keeps unsigned builds explicit', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Desktop builds are unsigned until the project owner adds signing certificates.')).toBeVisible();
  const workflow = await readFile(resolve('.github/workflows/release.yml'), 'utf8');
  expect(workflow).not.toMatch(/APPLE_CERTIFICATE|WINDOWS_CERT_PFX/);
});

test('@claim:release-installers manifest URLs and shell installer match published filenames', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dss-release-'));
  const names = [
    'Diagram.Source.Studio_0.1.5_aarch64.dmg', 'Diagram.Source.Studio_0.1.5_x64.dmg',
    'Diagram.Source.Studio_0.1.5_x64_en-US.msi', 'diagram-source-studio_0.1.5_amd64.AppImage',
    'diagram-source-studio_0.1.5_amd64.deb'
  ];
  await Promise.all(names.map((name) => writeFile(join(root, name), name)));
  await exec(process.execPath, [resolve('scripts/release-manifest.mjs'), 'v0.1.5'], { cwd: root });
  const manifest = JSON.parse(await readFile(join(root, 'latest.json'), 'utf8')) as { assets: Record<string, { name: string; url: string }> };
  expect(Object.keys(manifest.assets)).toHaveLength(5);
  for (const asset of Object.values(manifest.assets)) {
    expect(asset.name).not.toContain(' ');
    expect(decodeURIComponent(new URL(asset.url).pathname.split('/').pop()!)).toBe(asset.name);
  }

  const appImage = join(root, names[3]);
  const checksum = await exec('sha256sum', [appImage]);
  await writeFile(join(root, 'SHA256SUMS'), `${checksum.stdout.trim().split(/\s+/)[0]}  ${names[3]}\n`);
  await writeFile(join(root, 'release.json'), JSON.stringify({ assets: [
    { browser_download_url: `file://${appImage}` },
    { browser_download_url: `file://${join(root, 'SHA256SUMS')}` }
  ] }, null, 2));
  const bin = join(root, 'bin'); await mkdir(bin);
  await exec('sh', [resolve('public/install.sh')], { env: { ...process.env, XDG_BIN_HOME: bin, DIAGRAM_SOURCE_STUDIO_RELEASE_API: `file://${join(root, 'release.json')}` } });
  expect(await readFile(join(bin, 'diagram-source-studio'), 'utf8')).toBe(names[3]);
});

test('@claim:studio-purchase the enabled $39 product uses Sociobot checkout', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('$39', { exact: true })).toBeVisible();
  await expect(page.getByText('One-time purchase', { exact: true })).toBeVisible();
  const eligibility = await page.evaluate(async () => {
    const modulePath = '/src/license.ts';
    const { checkoutUrl, studioProductEnabled } = await import(/* @vite-ignore */ modulePath);
    return {
      enabled: studioProductEnabled([{ slug: 'diagram-source-studio', price_minor: 3900, currency: 'USD' }]),
      wrongPrice: studioProductEnabled([{ slug: 'diagram-source-studio', price_minor: 1, currency: 'USD' }]),
      checkoutUrl
    };
  });
  expect(eligibility).toEqual({ enabled: true, wrongPrice: false, checkoutUrl: 'https://api.sociobot.in/api/v1/products/diagram-source-studio/checkout' });
});

test('@claim:billing-catalog native startup checks the public catalog once and discloses it', async ({ page }) => {
  let catalogRequests = 0;
  await page.addInitScript(() => Object.defineProperty(window, '__TAURI_INTERNALS__', { value: {} }));
  await page.route('**/api/v1/products', (route) => {
    catalogRequests += 1;
    expect(route.request().method()).toBe('GET');
    expect(route.request().postData()).toBeNull();
    return route.fulfill({ json: { data: [{ slug: 'diagram-source-studio', price_minor: 3900, currency: 'USD' }] } });
  });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Buy Studio for $39 once' })).toBeVisible();
  expect(catalogRequests).toBe(1);
  const application = await readFile(resolve('src/main.ts'), 'utf8');
  expect(application).toContain('The app checks the public Sociobot catalog once to show purchase availability.');
  const readme = await readFile(resolve('README.md'), 'utf8');
  expect(readme).toContain("checks Sociobot's public catalog once");
});

test('checkout return stores, verifies, and unlocks the Studio matrix in the desktop shell', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, '__TAURI_INTERNALS__', { value: {} }));
  await page.route('https://api.sociobot.in/api/v1/products/diagram-source-studio/verify**', (route) => route.fulfill({
    json: { valid: true, reason: 'ok', expires_at: null }
  }));
  await page.goto('/?license=returned-license-token');
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(page.getByText('Studio license active')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('sb_license:diagram-source-studio'))).toBe('returned-license-token');
  const verdict = JSON.parse(await page.evaluate(() => localStorage.getItem('sb_license_verdict:diagram-source-studio')) ?? '{}');
  expect(verdict).toMatchObject({ valid: true, token: 'returned-license-token' });
  await page.getByRole('button', { name: 'Compare versions' }).click();
  await expect(page.locator('.matrix-result')).toHaveCount(2);
});

test('live billing verifier fails for the missing product and accepts the exact checkout contract', async () => {
  let productEnabled = false;
  const server = createServer((request, response) => {
    if (request.url === '/api/v1/products') {
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({ data: productEnabled ? [{
        slug: 'diagram-source-studio',
        name: 'Diagram Source Studio License',
        price_minor: 3900,
        currency: 'USD',
        product_url: 'https://diagram-source-studio.sociobot.in/',
        checkout_url: `http://127.0.0.1:${(server.address() as { port: number }).port}/api/v1/products/diagram-source-studio/checkout`
      }] : [] }));
      return;
    }
    if (request.url === '/api/v1/products/diagram-source-studio/checkout') {
      response.writeHead(303, { location: 'https://checkout.dodopayments.com/session/contract-test' });
      response.end();
      return;
    }
    response.writeHead(404).end();
  });
  await new Promise<void>((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
  const address = server.address() as { port: number };
  const env = { ...process.env, SOCIOBOT_API_BASE: `http://127.0.0.1:${address.port}/api/v1` };
  try {
    await expect(exec(process.execPath, [resolve('scripts/verify-live-billing.mjs')], { env })).rejects.toThrow(/missing diagram-source-studio/);
    productEnabled = true;
    const result = await exec(process.execPath, [resolve('scripts/verify-live-billing.mjs')], { env });
    expect(JSON.parse(result.stdout)).toMatchObject({
      slug: 'diagram-source-studio',
      price_minor: 3900,
      currency: 'USD',
      checkout_status: 303,
      checkout_host: 'checkout.dodopayments.com'
    });
  } finally {
    await new Promise<void>((resolveClose, rejectClose) => server.close((error) => error ? rejectClose(error) : resolveClose()));
  }
});

test('SPA route remount keeps one export handler', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByRole('link', { name: 'Demo' }).click();
  await expect(page.locator('#diagnostics')).toContainText('Preview rendered');
  const downloads: string[] = [];
  page.on('download', (download) => downloads.push(download.suggestedFilename()));
  await page.getByRole('button', { name: 'Export SVG' }).click();
  await expect.poll(() => downloads).toEqual(['diagram.svg']);
});

test('purchase action only appears when the billing catalog enables the product', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Purchases are temporarily unavailable.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy Studio' })).toHaveCount(0);
});
