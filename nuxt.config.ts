import path from 'node:path';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    '@': '/',
  },
  app: {
    head: {
      meta: [
        // <meta name="viewport" content="width=device-width, initial-scale=1">
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 'http-equiv': 'content-security-policy', content: 'default-src \'self\' \'unsafe-inline\'' },
      ],
    },
    keepalive: true,
  },
  css: [
    '~/renderer/styles/base.css',
  ],
  devtools: { enabled: true },
  dir: {
    app: 'renderer/app',
    assets: 'renderer/assets',
    layouts: 'renderer/layouts',
    middleware: 'renderer/middleware',
    modules: 'renderer/modules',
    pages: 'renderer/pages',
    plugins: 'renderer/plugins',
    public: 'public',
  },
  modules: [
    '@pinia/nuxt',
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  srcDir: 'src',
  vite: {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
  },
});
