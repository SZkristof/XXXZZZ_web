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
  /* The capture stops at # or ? so an anchor link is judged on its path —
     /oktatas#meta redirects exactly as /oktatas does. */
  for (const m of body.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const raw = m[1];
    const t = raw.replace(/\/$/, '') || '/';
    checked++;
    if (raw !== '/' && !raw.endsWith('/') && !isFile(raw)) {
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
