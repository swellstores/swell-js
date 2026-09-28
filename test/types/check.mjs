// Packs swell-js, installs the tarball into a clean project and type-checks
// consumers under each module resolution mode, with library checking enabled.
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const tsc = join(root, 'node_modules/.bin/tsc');
const dir = mkdtempSync(join(tmpdir(), 'swell-js-types-'));

const consumers = [
  ['nodenext', 'nodenext', 'esm.mts'],
  ['nodenext', 'nodenext', 'cjs.cts'],
  ['esnext', 'bundler', 'bundler.ts'],
  ['commonjs', 'node10', 'bundler.ts'],
  ['commonjs', 'node10', 'cjs.cts'],
  ['commonjs', 'node10', 'global.ts', ['--types', 'swell-js']],
];

try {
  execFileSync('npm', ['pack', '--pack-destination', dir], { cwd: root });
  const filename = readdirSync(dir).find((name) => name.endsWith('.tgz'));

  writeFileSync(join(dir, 'package.json'), '{ "private": true }');
  execFileSync(
    'npm',
    ['install', '--no-audit', '--no-fund', '--omit=dev', `./${filename}`],
    { cwd: dir, stdio: 'inherit' },
  );

  for (const [module, moduleResolution, file, extra = []] of consumers) {
    copyFileSync(join(here, file), join(dir, file));
    console.log(
      `tsc --module ${module} --moduleResolution ${moduleResolution} ${file}`,
    );
    execFileSync(
      tsc,
      [
        '--noEmit',
        '--strict',
        '--esModuleInterop',
        '--target',
        'es2022',
        '--module',
        module,
        '--moduleResolution',
        moduleResolution,
        ...extra,
        file,
      ],
      { cwd: dir, stdio: 'inherit' },
    );
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
