import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const packageLock = JSON.parse(await readFile('package-lock.json', 'utf8'));
const tauri = JSON.parse(await readFile('src-tauri/tauri.conf.json', 'utf8'));
const cargoToml = await readFile('src-tauri/Cargo.toml', 'utf8');
const cargoLock = await readFile('src-tauri/Cargo.lock', 'utf8');
const cargoVersion = cargoToml.match(/^version = "([^"]+)"/m)?.[1];
const lockedVersion = cargoLock.match(/\[\[package\]\]\nname = "diagram-source-studio"\nversion = "([^"]+)"/)?.[1];
const versions = new Map([
  ['package.json', packageJson.version],
  ['package-lock.json', packageLock.version],
  ['package-lock root', packageLock.packages?.['']?.version],
  ['tauri.conf.json', tauri.version],
  ['Cargo.toml', cargoVersion],
  ['Cargo.lock', lockedVersion]
]);
const expected = packageJson.version;
const mismatches = [...versions].filter(([, version]) => version !== expected);
if (mismatches.length) {
  throw new Error(`Release versions differ from ${expected}: ${mismatches.map(([file, version]) => `${file}=${version ?? 'missing'}`).join(', ')}`);
}

const expectedTag = `v${expected}`;
if (process.env.GITHUB_REF_TYPE === 'tag' && process.env.GITHUB_REF_NAME !== expectedTag) {
  throw new Error(`Release tag ${process.env.GITHUB_REF_NAME} does not match app version ${expectedTag}.`);
}
process.stdout.write(`${expectedTag}\n`);
