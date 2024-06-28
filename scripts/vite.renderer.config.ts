import { defineConfig } from 'vite';

import { alias, pluginExposeRenderer } from './vite.base.config';

import type{ ConfigEnv, UserConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [pluginExposeRenderer(name)],
    resolve: {
      alias,
      preserveSymlinks: true,
    },
    clearScreen: false,
  } as UserConfig;
});
