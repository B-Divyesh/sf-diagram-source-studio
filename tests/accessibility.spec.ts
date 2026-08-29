import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-page']) {
  test(`accessibility baseline for ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.route('https://api.sociobot.in/api/v1/products', (route) => route.fulfill({ json: { data: [] } }));
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Diagram Source Studio/);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('mobile editor keeps both panes keyboard reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await page.getByRole('tab', { name: 'Preview' }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'Source' })).toBeFocused();
  await expect(page.locator('#source')).toBeVisible();
  await page.getByRole('tab', { name: 'Source' }).press('ArrowRight');
  await expect(page.locator('#preview')).toBeVisible();
});

test('mobile accessibility baseline has no serious or critical violations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('https://api.sociobot.in/api/v1/products', (route) => route.fulfill({ json: { data: [] } }));
  await page.goto('/demo');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('landing primary action is visible on a common laptop viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  const action = page.getByRole('link', { name: 'Try it with sample data' });
  const box = await action.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThanOrEqual(768);
  await expect(page.locator('.plain-facts')).toBeInViewport();
});

test('mobile navigation and demo actions meet 44px touch targets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const target of [page.locator('.site-header .wordmark'), page.getByRole('link', { name: 'Demo' }), page.getByRole('link', { name: 'Privacy' }).first()]) {
    const box = await target.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByRole('link', { name: 'Demo' }).click();
  for (const target of [page.getByRole('button', { name: 'Reset demo' }), page.getByRole('link', { name: 'Start for real' })]) {
    const box = await target.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByRole('tab', { name: 'Preview' }).click();
  for (const target of [page.locator('#version'), page.getByRole('button', { name: 'Compare versions' })]) {
    const box = await target.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test('static host configuration keeps known app paths and returns a designed 404 for unknown paths', async () => {
  const config = JSON.parse(await (await import('node:fs/promises')).readFile('public/staticwebapp.config.json', 'utf8'));
  expect(config.navigationFallback).toBeUndefined();
  expect(config.routes.map((route: { route: string; rewrite: string }) => route.route)).toEqual(expect.arrayContaining(['/demo', '/privacy', '/terms']));
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  for (const file of ['demo.html', 'privacy.html', 'terms.html', '404.html']) {
    await expect((await import('node:fs/promises')).readFile(file, 'utf8')).resolves.toContain('<div id="app"></div>');
  }
});

test('SPA routes update canonical and social metadata', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://diagram-source-studio.sociobot.in/privacy');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Privacy — Diagram Source Studio');
  await page.getByRole('link', { name: 'Download' }).click();
  await expect(page).toHaveURL(/\/#downloads$/);
  await expect(page.locator('#downloads')).toBeInViewport();
});

test('@regression:skip-link is the first keyboard stop on initial desktop and mobile loads', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('@regression:demo defers the Mermaid renderer until source changes', async ({ page }) => {
  const rendererRequests: string[] = [];
  page.on('request', (request) => { if (request.url().includes('/vendor/mermaid-')) rendererRequests.push(request.url()); });
  await page.goto('/demo');
  await expect(page.locator('#diagnostics')).toContainText('Preview rendered');
  expect(rendererRequests).toEqual([]);
  const rendererRequest = page.waitForRequest('**/vendor/mermaid-11.min.js');
  await page.locator('#source').fill('flowchart LR\n  changed --> renderer');
  await rendererRequest;
  await expect(page.locator('#diagnostics')).toContainText('Preview rendered');
  expect(rendererRequests).toEqual([expect.stringContaining('/vendor/mermaid-11.min.js')]);
});
