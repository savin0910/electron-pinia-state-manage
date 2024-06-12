import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

import { alias, pluginExposeRenderer } from './vite.base.config.mjs';

// https://vitejs.dev/config
export default defineConfig((env) => {
  /** @type {import('vite').ConfigEnv<'renderer'>} */
  const forgeEnv = env;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  /** @type {import('vite').UserConfig} */
  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [
      vue(),
      pluginExposeRenderer(name),
    ],
    resolve: {
      alias,
      preserveSymlinks: true,
    },
    clearScreen: false,
  };
});
