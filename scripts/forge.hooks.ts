import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

import type { ForgeSimpleHookFn, ResolvedForgeConfig } from '@electron-forge/shared-types';

export const prePackage: ForgeSimpleHookFn<'prePackage'> = () => new Promise<void>((resolve) => {
  // Build the astro app
  const task = spawn('npx', ['astro', 'build'], {
    shell: true,
    cwd: path.join(__dirname, '..'),
  });

  task.on('exit', () => {
    resolve();
  });
});

// Move astro app to Electron's build directory
export const packageAfterCopy: ForgeSimpleHookFn<'packageAfterCopy'> = async (
  _: ResolvedForgeConfig,
  buildPath: string,
) => {
  const rendererDist = path.join(__dirname, '../dist');
  const target = path.join(buildPath, './.vite/www');

  await fs.cp(rendererDist, target, { recursive: true });
};
