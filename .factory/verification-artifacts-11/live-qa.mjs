import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const base = 'https://diagram-source-studio.sociobot.in';
const out = '.factory/verification-artifacts-11';
const results = { checks: {}, routes: {}, axe: {}, requests: {}, errors: [] };
const browser = await chromium.launch();

function track(page, label, allow404 = false) {
  const errors = [];
  page.on('pageerror', error => errors.push(`page: ${String(error)}`));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    if (allow404 && /404|Failed to load resource/i.test(message.text())) return;
    errors.push(`console: ${message.text()}`);
  });
  results.errors.push({ label, errors });
  return errors;
}

for (const viewport of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'phone', width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  const errors = track(page, `first-${viewport.name}`);
  await page.goto(base, { waitUntil: 'networkidle' });
  const first = await page.evaluate(() => {
    const box = selector => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return rect ? { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right } : null;
    };
    return {
      scrollY,
      title: document.title,
      job: document.querySelector('h1')?.textContent?.trim(),
      audience: document.querySelector('.lede')?.textContent?.trim(),
      action: document.querySelector('.hero-actions a')?.textContent?.trim(),
      result: document.querySelector('.hero-actions span')?.textContent?.trim(),
      facts: [...document.querySelectorAll('.plain-facts li')].map(item => item.textContent?.trim()),
      actionBox: box('.hero-actions a'),
      resultBox: box('.hero-actions span'),
      factBoxes: [...document.querySelectorAll('.plain-facts li')].map(item => { const rect = item.getBoundingClientRect(); return { top: rect.top, bottom: rect.bottom }; }),
      viewport: { width: innerWidth, height: innerHeight },
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  results.checks[`first-${viewport.name}`] = { ...first, errors };
  await page.screenshot({ path: `${out}/live-root-${viewport.name}.png` });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await context.addInitScript(() => localStorage.setItem('real:qa-sentinel', 'REAL-DO-NOT-TOUCH'));
  const page = await context.newPage();
  const errors = track(page, 'desktop-demo');
  const requests = [];
  page.on('request', request => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.waitForURL(/demo=1|\/demo/);
  await page.locator('#diagnostics').waitFor();
  await page.getByText('Syntax parsed. Preview rendered.').waitFor();
  const sample = await page.locator('#source').inputValue();
  const banner = await page.getByText('Demo — sample data, nothing is saved').isVisible();
  const initialSvg = await page.locator('#preview svg').count();
  await page.locator('#source').fill('flowchart LR\n  client[Web client] --> api[Diagram API]\n  api --> git[(Git review)]');
  await page.getByText('Syntax parsed. Preview rendered.').waitFor();
  const svgDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export SVG' }).click();
  const svg = await svgDownload;
  const svgPath = await svg.path();
  const svgBytes = await import('node:fs/promises').then(fs => fs.readFile(svgPath));
  const svgText = svgBytes.toString('utf8');
  const metadata = JSON.parse(Buffer.from(svgText.match(/<metadata[^>]*>([^<]+)<\/metadata>/)[1], 'base64').toString('utf8'));
  const restored = Buffer.from(metadata.source, 'base64').toString('utf8');
  const pngDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG' }).click();
  const png = await pngDownload;
  const pngPath = await png.path();
  const pngBytes = await import('node:fs/promises').then(fs => fs.readFile(pngPath));
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByText('Syntax parsed. Preview rendered.').waitFor();
  const resetSource = await page.locator('#source').inputValue();
  const storage = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));

  await page.locator('#source').fill('');
  await page.locator('#diagnostics').getByText(/source is empty/i).waitFor();
  const empty = await page.locator('#diagnostics').textContent();
  await page.locator('#source').fill('flowchart LR\n  A --');
  await page.locator('#diagnostics').getByText(/renderer stopped/i).waitFor();
  const invalid = await page.locator('#diagnostics').textContent();
  await page.getByRole('button', { name: 'Load working sample' }).click();
  await page.getByText('Syntax parsed. Preview rendered.').waitFor();
  await page.locator('#engine').selectOption('d2');
  await page.locator('#source').fill('client: Café ☕\napi: 你好世界\nclient -> api: naïve route');
  await page.getByText('Syntax parsed. Preview rendered.').waitFor();
  const d2Text = await page.locator('#preview svg text').allTextContents();
  await page.locator('#source').fill('direction: right');
  await page.locator('#diagnostics').getByText(/No D2 nodes found/i).waitFor();
  const d2Invalid = await page.locator('#diagnostics').textContent();

  results.checks.demo = {
    banner, sampleBytes: Buffer.byteLength(sample), sample, initialSvg,
    svgBytes: svgBytes.length, svgMetadataSource: restored,
    pngBytes: pngBytes.length, pngSignature: pngBytes.subarray(0, 8).toString('hex'),
    resetRestored: resetSource === sample, sentinel: storage['real:qa-sentinel'], storageKeys: Object.keys(storage),
    empty, invalid, d2Text, d2Invalid, errors,
  };
  results.requests.demo = requests;
  await page.screenshot({ path: `${out}/live-demo-desktop.png`, fullPage: false });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = track(page, 'mobile-demo');
  await page.goto(`${base}/demo`);
  await page.getByText('Syntax parsed. Preview rendered.').waitFor();
  await page.keyboard.press('Tab');
  const firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.keyboard.press('Enter');
  const skipTarget = await page.evaluate(() => document.activeElement?.id);
  const previewTab = page.getByRole('tab', { name: 'Preview' });
  await previewTab.focus();
  await page.keyboard.press('ArrowLeft');
  const arrowFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.getByRole('tab', { name: 'Preview' }).click();
  const targets = await page.locator('a:visible,button:visible,select:visible,input:visible,summary:visible').evaluateAll(items => items.map(item => {
    const rect = item.getBoundingClientRect();
    return { text: item.textContent?.trim() || item.getAttribute('aria-label') || item.id, width: rect.width, height: rect.height };
  }));
  results.checks.mobileDemo = {
    firstFocus, skipTarget, arrowFocus, targets,
    minWidth: Math.min(...targets.map(x => x.width)), minHeight: Math.min(...targets.map(x => x.height)),
    overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), errors,
  };
  await page.screenshot({ path: `${out}/live-demo-phone.png`, fullPage: false });
  await context.close();
}

for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-verification-11']) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = track(page, `route-${path}`, path.includes('missing'));
  const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  const structure = await page.evaluate(() => ({
    title: document.title,
    lang: document.documentElement.lang,
    h1: [...document.querySelectorAll('h1')].map(node => node.textContent?.trim()),
    main: document.querySelectorAll('main').length,
    header: document.querySelectorAll('header').length,
    footer: document.querySelectorAll('footer').length,
    headings: [...document.querySelectorAll('h1,h2,h3')].map(node => ({ level: Number(node.tagName[1]), text: node.textContent?.trim() })),
    canonical: document.querySelector('link[rel=canonical]')?.href,
    motion: [...document.querySelectorAll('*')].reduce((max, node) => Math.max(max, ...getComputedStyle(node).transitionDuration.split(',').map(value => parseFloat(value) || 0), ...getComputedStyle(node).animationDuration.split(',').map(value => parseFloat(value) || 0)), 0),
  }));
  results.routes[path] = { status: response?.status(), ...structure, errors };
  results.axe[path] = axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = track(page, 'license-invalid');
  await page.goto(`${base}/demo`);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.goto(`${base}/demo`);
  await page.getByText('Have a license?').click();
  await page.locator('#license-token').fill('not-a-valid-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await page.getByText('This license is no longer active.').waitFor();
  results.checks.invalidLicense = {
    notice: await page.locator('#license-state').textContent(),
    buyHref: await page.locator('#license-state a.buy-link').getAttribute('href'),
    errors,
  };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = track(page, 'offline');
  await page.goto(`${base}/demo`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#engine').selectOption('d2');
  await page.locator('#source').fill('source: Offline source\ntarget: Preview\nsource -> target');
  await page.getByText('Syntax parsed. Preview rendered.').waitFor();
  results.checks.offline = {
    sourceVisible: await page.locator('#source').isVisible(),
    diagnostics: await page.locator('#diagnostics').textContent(),
    caches: await page.evaluate(() => caches.keys()), errors,
  };
  await context.close();
}

await browser.close();
await writeFile(`${out}/live-product-qa.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
