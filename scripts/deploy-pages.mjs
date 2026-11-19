import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');
const outDir = path.join(rootDir, 'out');
const nojekyllPath = path.join(outDir, '.nojekyll');

function run(cmd, args, cwd = rootDir) {
  execFileSync(cmd, args, { cwd, stdio: 'inherit' });
}

if (!fs.existsSync(outDir) || !fs.existsSync(nojekyllPath)) {
  run('npm', ['run', 'build:pages']);
}

if (!fs.existsSync(nojekyllPath)) {
  fs.writeFileSync(nojekyllPath, '');
}

const originUrl = execFileSync('git', ['remote', 'get-url', 'origin'], {
  cwd: rootDir,
  encoding: 'utf8',
}).trim();

const userName = (() => {
  try {
    return execFileSync('git', ['config', 'user.name'], {
      cwd: rootDir,
      encoding: 'utf8',
    }).trim();
  } catch {
    return '';
  }
})();

const userEmail = (() => {
  try {
    return execFileSync('git', ['config', 'user.email'], {
      cwd: rootDir,
      encoding: 'utf8',
    }).trim();
  } catch {
    return '';
  }
})();

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'otellia-ui-pages-'));

try {
  fs.cpSync(outDir, tempDir, { recursive: true });
  run('git', ['init', '-b', 'gh-pages'], tempDir);
  if (userName) run('git', ['config', 'user.name', userName], tempDir);
  if (userEmail) run('git', ['config', 'user.email', userEmail], tempDir);
  run('git', ['add', '-A'], tempDir);
  run('git', ['commit', '-m', 'GitHub Pages用ビルドを更新'], tempDir);
  run('git', ['push', '--force', originUrl, 'gh-pages:gh-pages'], tempDir);
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
