import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';

const base = 'https://diagram-source-studio.sociobot.in';
const browser = await chromium.launch();
const links = new Set();
for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-verification-11']) {
  const page = await browser.newPage();
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
      scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 30));
    }
  });
  for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.href))) links.add(href);
  await page.close();
}
await browser.close();

const checked = [];
for (const url of [...links].sort()) {
  if (!/^https?:/.test(url)) continue;
  try {
    const response = await fetch(url, { method: 'GET', redirect: 'manual', headers: { Range: 'bytes=0-0' } });
    const redirect = response.headers.get('location');
    const location = redirect ? (() => {
      const parsed = new URL(redirect);
      return parsed.hostname === 'checkout.dodopayments.com' ? `${parsed.origin}/session/<redacted>` : `${parsed.origin}${parsed.pathname}`;
    })() : null;
    checked.push({ url, status: response.status, location });
    await response.body?.cancel();
  } catch (error) {
    checked.push({ url, error: String(error) });
  }
}
await writeFile('.factory/verification-artifacts-11/link-crawl.json', JSON.stringify(checked, null, 2));
console.log(JSON.stringify(checked, null, 2));
