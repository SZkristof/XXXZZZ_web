// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Static output: compiles to plain HTML/CSS/JS so it runs on any shared host
// (Rackhost) with no Node runtime, and stays portable to Vercel/Cloudflare.
export default defineConfig({
  // The server redirects www to the bare domain, so canonical URLs,
  // Open Graph tags, the sitemap and the JSON-LD @ids must all use the
  // bare domain too — a canonical pointing at a redirecting host is worse
  // than no canonical at all.
  site: 'https://brandmuhely.hu',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto', format: 'directory' },
  integrations: [sitemap({ i18n: { defaultLocale: 'hu', locales: { hu: 'hu-HU' } } })],
  vite: { plugins: [tailwindcss()] },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});
