/**
 * Verifies every internal href in the build resolves to a real page or file,
 * AND that it points at the final URL rather than one that redirects.
 *
 * The first catches renamed routes and stale asset references — a preload
 * pointing at a font that was replaced. The second exists because 847 of 924
 * internal links once pointed at /arak when the server serves /arak/: every
 * click cost a 301 round trip, and Astro's viewport prefetch — the whole
 * point of which is to have the next page already in hand — was spending its
 * requests on redirects. Google's live test reported them as "Redirection
 * error" subresources, which is how it was found.
 *
 * `build.format: 'directory'` means a page IS a directory, so the trailing
 * slash is part of its address, not decoration.
 */
import { readFileSync, existsSync } from 'node:fs';
import { globSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';

const DIST = 'dist';
const html = globSync(`${DIST}/**/*.html`);

/* og:image and twitter:image are ABSOLUTE by spec — a relative one is
   ignored by every platform — so checking only paths that start with "/"
   skips them entirely. The origin is taken from the pages' own canonical
   rather than hardcoded, so it cannot drift from astro.config.mjs. */
const ORIGIN = (() => {
  for (const f of html) {
    const m = readFileSync(f, 'utf8').match(/rel="canonical" href="(https?:\/\/[^/"]+)/);
    if (m) return m[1];
  }
  return null;
})();
const routes = new Set();
for (const f of html) {
  const rel = relative(DIST, f);
  let r = basename(rel) === 'index.html' ? `/${dirname(rel)}` : `/${rel}`;
  r = r === '/.' ? '/' : r.replace(/\/$/, '');
  routes.add(r);
}

// Client-supplied assets not delivered yet. Empty now that the portraits
// have landed; add a path here only while its file is genuinely pending.
const PENDING_ASSETS = new Set([]);

const bad = [];
const redirecting = [];
let checked = 0;

/** A route is a directory; a file has an extension. Only routes take a slash. */
const isFile = (p) => /\.[a-z0-9]{2,5}$/i.test(p);
for (const f of html) {
  const rel = relative(DIST, f);
  let from = basename(rel) === 'index.html' ? `/${dirname(rel)}` : `/${rel}`;
  from = from === '/.' ? '/' : from.replace(/\/$/, '');
  const body = readFileSync(f, 'utf8');
  /* href/src AND the meta tags that name a URL. og:image was missing for
     months — every page pointed at /img/og-default.jpg, the file did not
     exist, and a shared link had no preview — because this only read href
     and src. A URL is a URL wherever the attribute sits.

     The capture stops at # or ? so an anchor link is judged on its path:
     /oktatas#meta redirects exactly as /oktatas does. */
  const own = ORIGIN
    ? new RegExp(`(?:href|src|content)="(?:${ORIGIN.replace(/[.*+?^$()|[\]\\]/g, '\\$&')})?(/[^"#?]*)`, 'g')
    : /(?:href|src|content)="(\/[^"#?]*)/g;

  for (const m of body.matchAll(own)) {
    const raw = m[1];
    const t = raw.replace(/\/$/, '') || '/';
    checked++;
    if (raw !== '/' && !raw.endsWith('/') && !isFile(raw) && !m[0].startsWith('content=')) {
      redirecting.push(`${from}  ->  ${raw}   (helyesen: ${raw}/)`);
    }
    if (routes.has(t)) continue;
    if (existsSync(join(DIST, t))) continue;
    // Server-side endpoints are not part of the static build.
    if (t.startsWith('/api/')) continue;
    // Client-supplied assets not delivered yet. Each <img> carries an
    // onerror that removes it, so a missing file degrades cleanly to the
    // designed placeholder. Delete an entry here once the real file lands.
    if (PENDING_ASSETS.has(t)) continue;
    bad.push(`${from}  ->  ${t}`);
  }
}

console.log(`Checked ${checked} internal links across ${html.length} pages.`);
if (bad.length) {
  console.error('\nBROKEN LINKS:');
  for (const b of [...new Set(bad)].sort()) console.error('  ' + b);
  process.exit(1);
}
if (redirecting.length) {
  const uniq = [...new Set(redirecting)].sort();
  console.error(
    `\nLINKS THAT REDIRECT (${redirecting.length} occurrences, ${uniq.length} distinct):`,
  );
  for (const b of uniq.slice(0, 40)) console.error('  ' + b);
  if (uniq.length > 40) console.error(`  ... and ${uniq.length - 40} more`);
  console.error(
    '\nEach one costs a 301 round trip per click and wastes the prefetch.',
  );
  process.exit(1);
}
console.log('No broken internal links, and none that redirect.');
