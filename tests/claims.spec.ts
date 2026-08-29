import { expect, test } from '@playwright/test';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);

const sample = `flowchart LR
  café["Café ☕"] --> api[API]
  api --> db[(Database)]`;

test('@claim:demo-sandbox demo loads sample and does not save it as real data', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/diagram-source-studio/verify**', (route) => route.fulfill({ json: { valid: true } }));
  await page.goto('/?demo=1');
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

test('@claim:native-file-dialogs desktop shell opens and saves exact source bytes through Tauri commands', async ({ page }) => {
  await page.addInitScript(() => {
    const initial = '\ufeffflowchart LR\r\n  native[Native café ☕] --> saved[Saved]\r\n';
    let saved = '';
    let openCount = 0;
    const calls: Array<{ command: string; args: Record<string, unknown> }> = [];
    Object.defineProperty(window, '__DSS_NATIVE_CALLS__', { value: calls });
    Object.defineProperty(window, '__TAURI_INTERNALS__', { value: {
      invoke: async (command: string, args: Record<string, unknown>) => {
        calls.push({ command, args });
        if (command === 'open_document') {
          openCount += 1;
          return { name: openCount === 1 ? 'native.mmd' : 'saved.mmd', contents: openCount === 1 ? initial : saved, binary: false };
        }
        if (command === 'save_document') { saved = String(args.contents); return true; }
        return false;
      }
    } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open file' }).click();
  await expect(page.locator('#source')).toHaveValue('flowchart LR\n  native[Native café ☕] --> saved[Saved]\n');
  await page.getByRole('button', { name: 'Save source' }).click();
  await expect(page.getByText('Source saved.')).toBeVisible();
  await page.getByRole('button', { name: 'Open file' }).click();
  await expect(page.locator('#source')).toHaveValue('flowchart LR\n  native[Native café ☕] --> saved[Saved]\n');
  const calls = await page.evaluate(() => (window as unknown as Window & { __DSS_NATIVE_CALLS__: Array<{ command: string; args: { name?: string; contents?: string } }> }).__DSS_NATIVE_CALLS__);
  expect(calls.map((call) => call.command)).toEqual(['open_document', 'save_document', 'open_document']);
  expect(calls[1].args).toEqual({ name: 'diagram.mmd', contents: '\ufeffflowchart LR\r\n  native[Native café ☕] --> saved[Saved]\r\n' });
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

test('@claim:release-installers workflow builds four platforms and both installers refuse bad checksums', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dss-release-'));
  const releaseCommit = '0123456789abcdef0123456789abcdef01234567';
  const names = [
    'Diagram.Source.Studio_0.1.5_aarch64.dmg', 'Diagram.Source.Studio_0.1.5_x64.dmg',
    'Diagram.Source.Studio_0.1.5_x64_en-US.msi', 'diagram-source-studio_0.1.5_amd64.AppImage',
    'diagram-source-studio_0.1.5_amd64.deb'
  ];
  await Promise.all(names.map((name) => writeFile(join(root, name), name)));
  await exec(process.execPath, [resolve('scripts/release-manifest.mjs'), 'v0.1.5', releaseCommit], { cwd: root });
  const manifest = JSON.parse(await readFile(join(root, 'latest.json'), 'utf8')) as { version: string; commit: string; assets: Record<string, { name: string; url: string }> };
  expect(manifest).toMatchObject({ version: 'v0.1.5', commit: releaseCommit });
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

  const workflow = await readFile(resolve('.github/workflows/release.yml'), 'utf8');
  expect(workflow).toContain('- os: ubuntu-latest');
  expect(workflow).toContain('- os: windows-latest');
  expect(workflow.match(/os: macos-latest/g)).toHaveLength(2);
  expect(workflow).toContain('aarch64-apple-darwin');
  expect(workflow).toContain('x86_64-apple-darwin');
  expect(workflow).toContain('tauri-apps/tauri-action@v0');
  expect(workflow).toContain('npm test');
  expect(workflow).toContain('verify:release');
  expect(workflow).toContain('"${GITHUB_SHA}"');
  expect(workflow).toContain('tag_name: ${{ needs.metadata.outputs.tag }}');

  const releaseTag = (await exec(process.execPath, [resolve('scripts/verify-release-version.mjs')])).stdout.trim();
  const packageVersion = JSON.parse(await readFile(resolve('package.json'), 'utf8')).version;
  expect(releaseTag).toBe(`v${packageVersion}`);
  const readme = await readFile(resolve('README.md'), 'utf8');
  expect(readme).toMatch(/PowerShell 7\s+\(`pwsh`\)/);

  const windowsName = names[2];
  const windowsPayload = Buffer.from('fixture MSI payload');
  const windowsHash = (await import('node:crypto')).createHash('sha256').update(windowsPayload).digest('hex');
  let mismatch = false;
  const server = createServer((request, response) => {
    const host = `http://${request.headers.host}`;
    if (request.url === '/release') {
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({ assets: [
        { name: windowsName, browser_download_url: `${host}/download/${windowsName}` },
        { name: 'SHA256SUMS', browser_download_url: `${host}/download/SHA256SUMS` }
      ] }));
      return;
    }
    if (request.url === `/download/${windowsName}`) { response.end(windowsPayload); return; }
    if (request.url === '/download/SHA256SUMS') {
      response.end(`${mismatch ? '0'.repeat(64) : windowsHash}  ${windowsName}\n`);
      return;
    }
    response.statusCode = 404; response.end();
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('fixture server did not bind');
  const powershellEnv = {
    ...process.env,
    DIAGRAM_SOURCE_STUDIO_RELEASE_API: `http://127.0.0.1:${address.port}/release`,
    DIAGRAM_SOURCE_STUDIO_TEST_NO_INSTALL: '1'
  };
  try {
    const success = await exec('pwsh', ['-NoProfile', '-File', resolve('public/install.ps1')], { env: powershellEnv });
    expect(success.stdout).toContain('Installed Diagram Source Studio after SHA256 verification.');
    mismatch = true;
    await expect(exec('pwsh', ['-NoProfile', '-File', resolve('public/install.ps1')], { env: powershellEnv })).rejects.toMatchObject({ stderr: expect.stringContaining('Checksum verification failed.') });
  } finally {
    await new Promise<void>((done, fail) => server.close((error) => error ? fail(error) : done()));
  }
});

test('@claim:studio-purchase checkout return saves, verifies, and unlocks Studio after the exact $39 offer is available', async ({ page, context }) => {
  let catalogRequests = 0;
  await page.addInitScript(() => { (window as Window & { __DSS_TEST_BILLING_API_BASE__?: string }).__DSS_TEST_BILLING_API_BASE__ = 'https://api.sociobot.in/api/v1'; });
  await page.route('https://api.sociobot.in/api/v1/products', (route) => {
    catalogRequests += 1;
    return route.fulfill({ json: { data: [{ slug: 'diagram-source-studio', price_minor: 3900, currency: 'USD' }] } });
  });
  await page.goto('/');
  const landingCheckout = page.getByRole('link', { name: 'Buy Studio' });
  await expect(landingCheckout).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/diagram-source-studio/checkout');
  await expect(page.getByText('$39 once', { exact: true })).toBeVisible();

  const desktop = await context.newPage();
  await desktop.addInitScript(() => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', { value: {} });
    (window as Window & { __DSS_TEST_BILLING_API_BASE__?: string }).__DSS_TEST_BILLING_API_BASE__ = 'https://api.sociobot.in/api/v1';
  });
  await desktop.route('**/api/v1/products', (route) => {
    catalogRequests += 1;
    return route.fulfill({ json: { data: [{ slug: 'diagram-source-studio', price_minor: 3900, currency: 'USD' }] } });
  });
  let verificationRequests = 0;
  await desktop.route('https://api.sociobot.in/api/v1/products/diagram-source-studio/verify**', (route) => {
    verificationRequests += 1;
    return route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } });
  });
  await desktop.goto('/');
  await expect(desktop.getByRole('link', { name: 'Buy Studio for $39 once' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/diagram-source-studio/checkout');
  await desktop.goto('/?license=returned-license-token');
  await expect(desktop).toHaveURL('http://127.0.0.1:4173/');
  await expect(desktop.getByText('Studio license active')).toBeVisible();
  expect(await desktop.evaluate(() => localStorage.getItem('sb_license:diagram-source-studio'))).toBe('returned-license-token');
  const verdict = JSON.parse(await desktop.evaluate(() => localStorage.getItem('sb_license_verdict:diagram-source-studio')) ?? '{}');
  expect(verdict).toMatchObject({ valid: true, token: 'returned-license-token' });
  expect(verificationRequests).toBe(1);
  await desktop.getByRole('button', { name: 'Compare versions' }).click();
  await expect(desktop.locator('.matrix-result')).toHaveCount(2);
  // One landing check plus one check for each native document load. The return
  // document is a new load and must re-check availability independently.
  expect(catalogRequests).toBe(3);
  const eligibility = await page.evaluate(async () => {
    const modulePath = '/src/license.ts';
    const { checkoutUrl, purchaseDeliveryReady, studioProductEnabled } = await import(/* @vite-ignore */ modulePath);
    return {
      catalogContract: studioProductEnabled([{ slug: 'diagram-source-studio', price_minor: 3900, currency: 'USD' }]),
      wrongPrice: studioProductEnabled([{ slug: 'diagram-source-studio', price_minor: 1, currency: 'USD' }]),
      checkoutUrl,
      purchaseDeliveryReady
    };
  });
  expect(eligibility).toEqual({
    catalogContract: true,
    wrongPrice: false,
    checkoutUrl: 'https://api.sociobot.in/api/v1/products/diagram-source-studio/checkout',
    purchaseDeliveryReady: true
  });
});

test('@claim:billing-catalog native startup checks the public catalog once and discloses it', async ({ page }) => {
  let catalogRequests = 0;
  await page.addInitScript(() => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', { value: {} });
    (window as Window & { __DSS_TEST_BILLING_API_BASE__?: string }).__DSS_TEST_BILLING_API_BASE__ = 'https://api.sociobot.in/api/v1';
  });
  await page.route('**/api/v1/products', (route) => {
    catalogRequests += 1;
    expect(route.request().method()).toBe('GET');
    expect(route.request().postData()).toBeNull();
    return route.fulfill({ json: { data: [{ slug: 'diagram-source-studio', price_minor: 3900, currency: 'USD' }] } });
  });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Buy Studio for $39 once' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/diagram-source-studio/checkout');
  expect(catalogRequests).toBe(1);
  const application = await readFile(resolve('src/main.ts'), 'utf8');
  expect(application).toContain('The landing page requests public release and purchase availability data.');
  const readme = await readFile(resolve('README.md'), 'utf8');
  expect(readme).toMatch(/The landing page requests public\s+release and purchase availability data\./);
});

test('@claim:license-verdict-one-day cached verification waits exactly one day before rechecking', async ({ page }) => {
  const checkedAt = 1_700_000_000_000;
  let verificationRequests = 0;
  await page.addInitScript((seed) => {
    if (!sessionStorage.getItem('dss-test-now')) sessionStorage.setItem('dss-test-now', String(seed));
    Date.now = () => Number(sessionStorage.getItem('dss-test-now'));
    Object.defineProperty(window, '__TAURI_INTERNALS__', { value: {} });
    localStorage.setItem('sb_license:diagram-source-studio', 'one-day-license');
    localStorage.setItem('sb_license_verdict:diagram-source-studio', JSON.stringify({ valid: true, token: 'one-day-license', checkedAt: seed }));
  }, checkedAt);
  await page.route('https://api.sociobot.in/api/v1/products/diagram-source-studio/verify**', (route) => {
    verificationRequests += 1;
    return route.fulfill({ json: { valid: true, reason: 'ok' } });
  });
  await page.goto('/');
  await expect(page.getByText('Studio license active')).toBeVisible();
  expect(verificationRequests).toBe(0);
  await page.evaluate((next) => sessionStorage.setItem('dss-test-now', String(next)), checkedAt + 86_399_999);
  await page.reload();
  await expect(page.getByText('Studio license active')).toBeVisible();
  expect(verificationRequests).toBe(0);
  await page.evaluate((next) => sessionStorage.setItem('dss-test-now', String(next)), checkedAt + 86_400_000);
  await page.reload();
  await expect.poll(() => verificationRequests).toBe(1);
});

test('@claim:refund-revocation a revoked verification response locks Studio comparison', async ({ page }) => {
  const checkedAt = 1_700_000_000_000;
  await page.addInitScript((seed) => {
    Date.now = () => seed + 86_400_000;
    Object.defineProperty(window, '__TAURI_INTERNALS__', { value: {} });
    localStorage.setItem('sb_license:diagram-source-studio', 'refunded-license');
    localStorage.setItem('sb_license_verdict:diagram-source-studio', JSON.stringify({ valid: true, token: 'refunded-license', checkedAt: seed }));
  }, checkedAt);
  let verificationRequests = 0;
  await page.route('https://api.sociobot.in/api/v1/products/diagram-source-studio/verify**', (route) => {
    verificationRequests += 1;
    return route.fulfill({ json: { valid: false, reason: 'revoked' } });
  });
  await page.goto('/');
  await expect(page.getByText('This license is no longer active.')).toBeVisible();
  expect(verificationRequests).toBe(1);
  await page.getByRole('button', { name: 'Compare versions' }).click();
  await expect(page.locator('.matrix-result')).toHaveCount(0);
  await expect(page.getByText('The side-by-side comparison is in the one-time Studio license.')).toBeVisible();
});

test('@claim:checkout-provider recorded checkout redirects to Dodo Payments', async () => {
  // @ts-expect-error The executable live verifier is intentionally plain ESM.
  const { verifyLiveBilling } = await import('../scripts/verify-live-billing.mjs');
  const apiBase = 'https://billing.test/api/v1';
  const product = {
    slug: 'diagram-source-studio',
    name: 'Diagram Source Studio License',
    price_minor: 3900,
    currency: 'USD',
    product_url: 'https://diagram-source-studio.sociobot.in/',
    checkout_url: `${apiBase}/products/diagram-source-studio/checkout`
  };
  let productEnabled = false;
  const billingFetch = async (input: URL | string) => {
    const url = String(input);
    if (url === `${apiBase}/products`) return new Response(JSON.stringify({ data: productEnabled ? [product] : [] }), { status: 200, headers: { 'content-type': 'application/json' } });
    if (url === product.checkout_url) return new Response(null, { status: 303, headers: { location: 'https://checkout.dodopayments.com/session/contract-test' } });
    throw new Error(`unexpected billing request: ${url}`);
  };
  const hostedCheckoutFetch = async (input: URL | string) => {
    expect(String(input)).toBe('https://checkout.dodopayments.com/session/contract-test');
    return new Response('<title>Checkout</title>', { status: 200 });
  };
  await expect(verifyLiveBilling(billingFetch, apiBase, hostedCheckoutFetch)).rejects.toThrow(/missing diagram-source-studio/);
  productEnabled = true;
  await expect(verifyLiveBilling(billingFetch, apiBase, hostedCheckoutFetch)).resolves.toMatchObject({
    slug: 'diagram-source-studio',
    price_minor: 3900,
    currency: 'USD',
    checkout_status: 303,
    checkout_host: 'checkout.dodopayments.com',
    checkout_page_status: 200
  });
});

test('@claim:no-sign-in a fresh demo edits and exports without authentication', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()); });
  await page.goto('/?demo=1');
  await page.locator('#source').fill(sample);
  await expect(page.locator('#diagnostics')).toContainText('Preview rendered');
  await expect(page.locator('input[type="password"], form [name*="email" i]')).toHaveCount(0);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export SVG' }).click();
  await download;
  expect(external).toEqual([]);
});

test('@claim:free-editor-diagnostics reports malformed Mermaid, recovers, and exports', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.locator('#diagnostics')).toContainText('Preview rendered');
  await page.locator('#source').fill('flowchart LR\n  broken -->');
  await expect(page.locator('#diagnostics')).toHaveClass(/error/);
  await expect(page.getByRole('button', { name: 'Load working sample' })).toBeVisible();
  await page.getByRole('button', { name: 'Load working sample' }).click();
  await expect(page.locator('#diagnostics')).toContainText('Preview rendered');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export SVG' }).click();
  await download;
});

test('@claim:startup-network landing requests only public release and purchase data', async ({ page }) => {
  const external: Array<{ url: string; method: string; body: string | null }> = [];
  await page.addInitScript(() => { (window as Window & { __DSS_TEST_BILLING_API_BASE__?: string }).__DSS_TEST_BILLING_API_BASE__ = 'https://api.sociobot.in/api/v1'; });
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push({ url: request.url(), method: request.method(), body: request.postData() });
  });
  await page.route('https://api.github.com/repos/B-Divyesh/sf-diagram-source-studio/releases?per_page=1', (route) => route.fulfill({ json: [] }));
  await page.route('https://api.sociobot.in/api/v1/products', (route) => route.fulfill({ json: { data: [] } }));
  await page.goto('/');
  await expect.poll(() => external.map((request) => request.url).sort()).toEqual([
    'https://api.github.com/repos/B-Divyesh/sf-diagram-source-studio/releases?per_page=1',
    'https://api.sociobot.in/api/v1/products'
  ]);
  expect(external).toEqual(expect.arrayContaining([
    { url: 'https://api.github.com/repos/B-Divyesh/sf-diagram-source-studio/releases?per_page=1', method: 'GET', body: null },
    { url: 'https://api.sociobot.in/api/v1/products', method: 'GET', body: null }
  ]));
  expect(JSON.stringify(external)).not.toContain('Diagram source');
});

test('@regression:route-remount keeps one export handler', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByRole('link', { name: 'Demo' }).click();
  await expect(page.locator('#diagnostics')).toContainText('Preview rendered');
  const downloads: string[] = [];
  page.on('download', (download) => downloads.push(download.suggestedFilename()));
  await page.getByRole('button', { name: 'Export SVG' }).click();
  await expect.poll(() => downloads).toEqual(['diagram.svg']);
});

test('@regression:catalog-unavailable purchase action explains an unavailable billing catalog', async ({ page }) => {
  await page.addInitScript(() => { (window as Window & { __DSS_TEST_BILLING_API_BASE__?: string }).__DSS_TEST_BILLING_API_BASE__ = 'https://api.sociobot.in/api/v1'; });
  await page.route('https://api.sociobot.in/api/v1/products', (route) => route.fulfill({ status: 503 }));
  await page.goto('/');
  await expect(page.getByText('Studio checkout is unavailable right now. Try again shortly; the free editor still works.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy Studio' })).toHaveCount(0);
});
