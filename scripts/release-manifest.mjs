import { readdirSync, writeFileSync } from 'node:fs';
const version = process.argv[2] || 'v0.1.5';
const owner = 'B-Divyesh';
const repo = 'sf-diagram-source-studio';
const names = readdirSync('.').filter((name) => !['SHA256SUMS', 'latest.json'].includes(name));
const url = (name) => `https://github.com/${owner}/${repo}/releases/download/${version}/${encodeURIComponent(name)}`;
const pick = (pattern) => names.find((name) => pattern.test(name));
const assets = {
  macos_arm64: pick(/aarch64.*\.dmg$/i),
  macos_x64: pick(/(?:x64|x86_64).*\.dmg$/i),
  windows: pick(/\.msi$|setup.*\.exe$/i),
  linux_appimage: pick(/\.AppImage$/),
  linux_deb: pick(/\.deb$/)
};
const missing = Object.entries(assets).filter(([, name]) => !name).map(([key]) => key);
if (missing.length) throw new Error(`Missing required release assets: ${missing.join(', ')}`);
writeFileSync('latest.json', `${JSON.stringify({ version, assets: Object.fromEntries(Object.entries(assets).filter(([, name]) => name).map(([key, name]) => [key, { name, url: url(name) }])) }, null, 2)}\n`);
