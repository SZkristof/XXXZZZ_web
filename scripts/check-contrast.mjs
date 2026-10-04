/**
 * Renders every page and measures the ACTUAL contrast of visible text against
 * the background it really sits on — compositing rgba text over its nearest
 * opaque ancestor background.
 *
 * This exists because a token migration can leave light text on a light ground:
 * the markup looks plausible, the build passes, and the text is simply
 * invisible. Screenshots do not reliably catch it either — faint text reads as
 * a design choice.
 *
 * Thresholds are WCAG AA: 4.5:1 for body text, 3:1 for large text
 * (>=24px, or >=18.66px when bold).
 *
 * COLOURS ARE READ THROUGH A CANVAS, NOT A REGEX. This used to match
 * `rgb()`/`rgba()` and skip anything else — and under Tailwind v4 the opacity
 * modifier (`text-black/80`) compiles to `color-mix(in oklab, ...)`, which
 * computes to `oklab(0.2196 0.0025 0.0028 / 0.8)`. So every single element
 * carrying an alpha-modified colour — which is most of the body text on the
 * site — parsed as null and was silently skipped, and the checker reported a
 * clean run while measuring almost nothing. Painting the colour onto a 1x1
 * canvas and reading the pixel back handles every colour space the browser
 * can parse, now and later.
 *
 * A colour that still cannot be read is REPORTED, never skipped. A test that
 * quietly measures less than it claims is worse than no test: it is a test
 * that lies in the direction of "everything is fine".
 */
import { launchChromium } from './browser.mjs';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { globSync } from 'node:fs';
import { relative, dirname, basename } from 'node:path';

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.xml': 'application/xml',
  '.txt': 'text/plain', '.jpg': 'image/jpeg', '.png': 'image/png',
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
await new Promise((r) => server.listen(4455, r));

const routes = globSync('dist/**/*.html').map((f) => {
  const rel = relative('dist', f);
  let r = basename(rel) === 'index.html' ? `/${dirname(rel)}` : `/${rel}`;
  return r === '/.' ? '/' : r.replace(/\/$/, '');
});

const browser = await launchChromium();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const AUDIT = () => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const SENTINEL = '#ff00ff';
  const cache = new Map();

  /** [r, g, b, a] in sRGB, for any colour the browser can parse. */
  const parse = (c) => {
    if (!c) return null;
    if (cache.has(c)) return cache.get(c);

    let v = null;
    const m = c.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/);
    if (m) {
      const raw = m[4];
      const a = raw === undefined ? 1
        : raw.endsWith('%') ? parseFloat(raw) / 100
        : +raw;
      v = [+m[1], +m[2], +m[3], a];
    } else {
      /* fillStyle keeps its previous value when handed something it cannot
         parse, so the sentinel is what tells the two cases apart. */
      ctx.fillStyle = SENTINEL;
      ctx.fillStyle = c;
      if (ctx.fillStyle !== SENTINEL || /^(#f0f|#ff00ff|magenta)$/i.test(c.trim())) {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillRect(0, 0, 1, 1);
        const d = ctx.getImageData(0, 0, 1, 1).data;
        v = [d[0], d[1], d[2], d[3] / 255];
      }
    }
    cache.set(c, v);
    return v;
  };
  const over = (fg, bg) => fg.slice(0, 3).map((c, i) => c * fg[3] + bg[i] * (1 - fg[3]));
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const s = getComputedStyle(n);
      const c = parse(s.backgroundColor);
      if (c && c[3] > 0.95) return c.slice(0, 3);
      // A translucent layer still tints what is behind it.
      if (c && c[3] > 0) {
        const behind = (() => {
          let m = n.parentElement;
          while (m) {
            const cc = parse(getComputedStyle(m).backgroundColor);
            if (cc && cc[3] > 0.95) return cc.slice(0, 3);
            m = m.parentElement;
          }
          return [255, 255, 255];
        })();
        return over(c, behind);
      }
      n = n.parentElement;
    }
    return [255, 255, 255];
  };

  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    // Only elements holding their own visible text.
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(' ')
      .trim();
    if (!own) continue;

    /* Decorative text hidden from assistive technology is exempt — WCAG
       1.4.3 covers text that conveys meaning, and axe takes the same view.
       The one instance here is a 192px watermark "B" at 4% white behind a
       photograph on /rolam, which is a texture, not a word anyone reads. */
    if (el.closest('[aria-hidden="true"]')) continue;

    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none') continue;
    const op = parseFloat(s.opacity);
    if (op === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;

    const fg = parse(s.color);
    if (!fg) {
      // Unreadable rather than passing. See the note at the top of the file.
      out.push({
        text: own.slice(0, 48), unreadable: s.color,
        cls: (el.getAttribute('class') || '').slice(0, 60), tag: el.tagName.toLowerCase(),
      });
      continue;
    }
    const bg = bgOf(el);
    // Element opacity multiplies the text alpha against its own background.
    const eff = over([fg[0], fg[1], fg[2], fg[3] * op], bg);
    const cr = ratio(eff, bg);

    const size = parseFloat(s.fontSize);
    const bold = parseInt(s.fontWeight, 10) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;

    if (cr < need) {
      out.push({
        text: own.slice(0, 48),
        cr: Math.round(cr * 100) / 100,
        need,
        size: Math.round(size),
        cls: (el.getAttribute('class') || '').slice(0, 60),
        tag: el.tagName.toLowerCase(),
      });
    }
  }
  return out;
};

let failures = 0;
for (const route of routes.sort()) {
  await page.goto(`http://localhost:4455${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.getElementById('consent')?.remove());
  // Open every <details> so collapsed copy is measured too.
  await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
  await page.waitForTimeout(150);
  const bad = await page.evaluate(AUDIT);
  if (bad.length) {
    failures += bad.length;
    console.error(`\n✗ ${route}`);
    for (const b of bad) {
      if (b.unreadable) {
        console.error(`   ?:1 UNREADABLE COLOUR ${b.unreadable} <${b.tag}> "${b.text}"`);
      } else {
        console.error(`   ${b.cr}:1 (needs ${b.need}) ${b.size}px <${b.tag}> "${b.text}"`);
      }
      if (b.cls) console.error(`      class: ${b.cls}`);
    }
  } else {
    console.log(`✓ ${route}`);
  }
}

await browser.close();
server.close();

if (failures) {
  console.error(`\n${failures} contrast failure(s). Text below AA is often text nobody can read.`);
  process.exit(1);
}
console.log('\nAll text meets WCAG AA contrast against its actual background.');
