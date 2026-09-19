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
 */
import { chromium } from 'playwright';
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

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const AUDIT = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? [.../* rgb */ [+m[1], +m[2], +m[3]], m[4] === undefined ? 1 : +m[4]] : null;
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

    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none') continue;
    const op = parseFloat(s.opacity);
    if (op === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;

    const fg = parse(s.color);
    if (!fg) continue;
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
      console.error(`   ${b.cr}:1 (needs ${b.need}) ${b.size}px <${b.tag}> "${b.text}"`);
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
