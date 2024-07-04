import tailwind from '@astrojs/tailwind';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [tailwind(), vue()],
  srcDir: './src/renderer',
  vite: {
    server: {
      watch: {
        ignored: ['./src/main', './src/preload'],
      },
    },
  },
});
