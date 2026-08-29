import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const playwright = resolve('node_modules/@playwright/test/cli.js');
const supplied = process.argv.slice(2);

function run(args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(process.execPath, [playwright, 'test', ...args], { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) resolveRun();
      else reject(new Error(`Playwright ${signal ? `ended with ${signal}` : `exited ${code}`}`));
    });
  });
}

// A Mermaid renderer retains a large DOM/compiler graph. Chromium can crash on
// the constrained release worker after many independent render sessions even
// though each test context is closed. Run every public claim in a fresh
// Playwright process: no retries, no skipped tests, and no shared renderer.
if (supplied.length) {
  await run(supplied);
} else {
  const claims = JSON.parse(await readFile('.factory/claims.json', 'utf8'));
  await run(['tests/accessibility.spec.ts', '--grep-invert', '@regression:']);
  for (const claim of claims) await run(['--grep', `@claim:${claim.id}`]);
  await run(['--grep', '@regression:']);
}
