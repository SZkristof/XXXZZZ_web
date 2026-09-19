import type { APIRoute } from 'astro';
import { site } from '@/data/site';

/**
 * robots.txt, built to match the environment.
 *
 * Set PUBLIC_NOINDEX=1 for any deploy that is not the real domain — the
 * uj.brandmuhely.hu staging host above all. A staging copy that Google indexes
 * becomes duplicate content competing with the production site, and it is
 * remarkably hard to get back out of the index once it is in.
 */
const NOINDEX = import.meta.env.PUBLIC_NOINDEX === '1';

const production = `User-agent: *
Allow: /

Disallow: /api/
Disallow: /adatkezeles
Disallow: /aszf
Disallow: /cookie

Sitemap: ${site.url}/sitemap-index.xml
`;

// No sitemap line here on purpose: submitting a staging sitemap is the fastest
// way to get a staging host indexed.
const staging = `# Staging / test deploy — indexing disabled on purpose.
User-agent: *
Disallow: /
`;

export const GET: APIRoute = () =>
  new Response(NOINDEX ? staging : production, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
