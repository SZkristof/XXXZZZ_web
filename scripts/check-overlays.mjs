/**
 * Guards against the class of bug that silently ate the homepage's calls to
 * action on phones for weeks.
 *
 * The mobile action bar is fixed over the bottom of the viewport and was
 * hidden with a transform alone. On iOS a fixed, backdrop-filtered element
 * moved away by transform can still take touches over the area it would
 * occupy, so the bar sat invisibly on top of the hero's two buttons and
 * swallowed every tap. Nobody could see it. The owner could not reproduce it.
 * Chromium could not reproduce it either — it honours the transform — so a
 * hit test alone would not have caught it, and will not catch a regression.
 *
 * What catches it is asserting the PROPERTY rather than the behaviour: an
 * overlay that is meant to be hidden must compute to pointer-events: none,
 * so that no compositing quirk on any engine can leave it intercepting
 * input. That assertion is engine-independent, which is the whole point.
 *
 * The hit test below is kept as a second, weaker line: it catches the
 * ordinary case of something simply being laid out on top of a button.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { launchChromium } from './browser.mjs';

const PORT = 4466;
const PHONES = [
  [393, 852, 'iPhone 16 Pro'],
  [390, 844, 'iPhone 14'],
  [375, 667, 'iPhone SE'],
  [360, 640, 'kis Android'],
];
const PAGES = ['/', '/oktatas', '/ugynokseg', '/arak', '/kapcsolat'];

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp',
};
const server = createServer(async (req, res) => {
  let p = join('dist', decodeURIComponent(req.url.split('?')[0]));
  try { if ((await stat(p)).isDirectory()) p = join(p, 'index.html'); }
  catch { p = p.endsWith('.html') ? p : p + '/index.html'; }
  try {
    const buf = await readFile(p);
    res.writeHead(200, { 'Content-Type': TYPES[extname(p)] ?? 'application/octet-stream' });
    res.end(buf);
  } catch { res.writeHead(404); res.end('nf'); }
});

function audit() {
  const problems = [];

  // 1. Any fixed or sticky overlay that is not visible must also be out of
  //    hit-testing. "Invisible" is not enough; "invisible and inert" is.
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
    const r = el.getBoundingClientRect();
    const offscreen = r.bottom <= 0 || r.top >= innerHeight || r.width === 0 || r.height === 0;
    const invisible = cs.visibility === 'hidden' || cs.opacity === '0' || cs.display === 'none';
    if ((offscreen || invisible) && cs.pointerEvents !== 'none' && cs.display !== 'none') {
      problems.push(
        `rejtett/kilógó fix elem, de elkapja az érintést: ` +
        `${el.id ? '#' + el.id : el.tagName.toLowerCase()} ` +
        `(visibility=${cs.visibility}, pointer-events=${cs.pointerEvents})`,
      );
    }
  }

  // 2. Every call to action a visitor can actually SEE must be tappable.
  //    Buttons that are deliberately hidden — the mobile menu's own CTA sits
  //    in a collapsed, visibility:hidden panel but still has a layout box —
  //    are not failures, so visibility is checked before the hit test.
  for (const a of document.querySelectorAll('a.bm-btn')) {
    const visible = typeof a.checkVisibility === 'function'
      ? a.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true })
      : true;
    if (!visible) continue;
    const r = a.getBoundingClientRect();
    if (!r.width || r.bottom < 2 || r.top > innerHeight - 2) continue;
    const y = Math.min(Math.max(r.top + r.height / 2, 2), innerHeight - 2);
    const hit = document.elementFromPoint(r.left + r.width / 2, y);
    if (!hit || !a.contains(hit)) {
      const by = hit ? (hit.id ? '#' + hit.id : hit.tagName.toLowerCase()) : 'semmi';
      problems.push(`gomb nem koppintható: "${a.textContent.trim().slice(0, 34)}" takarja: ${by}`);
    }
  }
  return problems;
}

await new Promise((r) => server.listen(PORT, r));
const browser = await launchChromium();
let failed = 0;
try {
  for (const [w, h, name] of PHONES) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: h }, isMobile: true, hasTouch: true,
    });
    for (const path of PAGES) {
      const page = await ctx.newPage();
      await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle' });
      // The consent banner is a deliberate overlay; it is not what this checks.
      await page.evaluate(() => document.getElementById('consent')?.remove());
      await page.waitForTimeout(120);
      const problems = await page.evaluate(audit);
      if (problems.length) {
        failed += problems.length;
        console.log(`\n✗ ${path} — ${name} ${w}x${h}`);
        problems.forEach((p) => console.log(`   ${p}`));
      }
      await page.close();
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}

if (failed) {
  console.log(`\n${failed} probléma. Egy rejtett rétegre ragadt koppintás néma hiba: `
    + `a látogató csak annyit lát, hogy a gomb nem csinál semmit.`);
  process.exit(1);
}
console.log(`✓ Nincs takart CTA és nincs érintést fogó rejtett réteg `
  + `(${PAGES.length} oldal × ${PHONES.length} telefonméret).`);
