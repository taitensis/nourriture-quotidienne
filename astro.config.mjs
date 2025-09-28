import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://taitensis.github.io',
  base: '/nourriture-quotidienne/',

  integrations: [
    react(),
    mdx({
      syntaxHighlight: 'shiki',
      shikiConfig: { theme: 'github-dark' },
    }),
  ],
  i18n: {
    locales: ['en', 'fr', 'es', 'nl'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
    fallback: { fr: 'en', es: 'en', nl: 'en' },
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: { noExternal: ['@radix-ui/*'] },
  },

  build: { inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  security: { checkOrigin: true },
});
