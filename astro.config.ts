import tailwind from '@astrojs/tailwind';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

export default defineConfig({
  build: {
    assetsPrefix: 'app://www',
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    vue(),
  ],
  srcDir: './src/renderer',
  vite: {
    server: {
      watch: {
        ignored: ['./src/main', './src/preload'],
      },
    },
  },
});
