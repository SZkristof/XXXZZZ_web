/**
 * Verifies every internal href in the build resolves to a real page or file.
 * Catches renamed routes and stale asset references — e.g. a preload pointing
 * at a font that was replaced.
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

const PENDING_ASSETS = new Set([
  '/img/kristof-portrait.jpg',
  '/img/kristof-about.jpg',
]);

const bad = [];
let checked = 0;
for (const f of html) {
  const rel = relative(DIST, f);
  let from = basename(rel) === 'index.html' ? `/${dirname(rel)}` : `/${rel}`;
  from = from === '/.' ? '/' : from.replace(/\/$/, '');
  const body = readFileSync(f, 'utf8');
  for (const m of body.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const t = m[1].replace(/\/$/, '') || '/';
    checked++;
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
console.log('No broken internal links.');
