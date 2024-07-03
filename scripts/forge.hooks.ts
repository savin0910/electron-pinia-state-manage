import { fork } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

import type { ForgeSimpleHookFn, ResolvedForgeConfig } from '@electron-forge/shared-types';

// Build the Nuxt app
export const prePackage: ForgeSimpleHookFn<'prePackage'> = () => new Promise<void>((resolve) => {
  // use child process to avoid electron-forge esm issues
  const buildScript = path.join(__dirname, './build.mjs');
  const task = fork(buildScript, {
    stdio: 'ignore',
  });

  task.on('exit', (code) => {
    if (code === 0) {
      resolve();
    } else {
      process.stderr.write('Nuxt build failed\n');
      process.exit(1);
    }
  });
});

// Move the Nuxt build output to Electron's build directory
export const packageAfterCopy: ForgeSimpleHookFn<'packageAfterCopy'> = async (
  _: ResolvedForgeConfig,
  buildPath: string,
) => {
  const nuxtDist = path.join(__dirname, '../.output');
  const dist = path.join(buildPath, './.vite/build/nuxt');

  await fs.cp(nuxtDist, dist, { recursive: true });
};
