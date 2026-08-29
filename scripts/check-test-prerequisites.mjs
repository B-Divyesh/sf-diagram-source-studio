import { spawnSync } from 'node:child_process';

const commands = [
  ['sh', ['--version']],
  ['sha256sum', ['--version']],
  ['pwsh', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.ToString()']]
];
const missing = commands.filter(([command, args]) => spawnSync(command, args, { stdio: 'ignore' }).error?.code === 'ENOENT').map(([command]) => command);
if (missing.length) {
  process.stderr.write(`Missing test prerequisite: ${missing.join(', ')}. See README.md > Test for setup instructions.\n`);
  process.exit(1);
}
