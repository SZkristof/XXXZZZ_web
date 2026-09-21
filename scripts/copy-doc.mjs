/**
 * Generates docs/fooldal-szoveg.md — the homepage copy, in page order, for
 * review outside the codebase.
 *
 * This exists because a hand-written copy document is stale the moment
 * anyone touches a string, and a stale copy document is worse than none: two
 * plausible versions of the same text with nothing to say which is current.
 * So it is derived, never authored. Regenerate with `npm run copy:doc`.
 *
 * It reads the BUILT page through a real browser rather than parsing the
 * .astro sources, for two reasons. The copy is spread across three places —
 * src/data/site.ts, src/data/proof.ts and the components — and computed
 * values (per-session prices, savings, the "4+1" labels) only exist once
 * rendered. What the DOM holds is what a visitor gets.
 *
 * Hidden text is deliberately INCLUDED. The service tiles carry two
 * authored descriptions, one for phones and one for wider screens, and both
 * are copy someone has to be able to review.
 */
import { createServer } from 'node:http';
import { readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { extname, join, dirname } from 'node:path';
import { launchChromium } from './browser.mjs';

const PORT = 4457;
const OUT = 'docs/fooldal-szoveg.md';

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.xml': 'application/xml',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
};

const server = createServer(async (req, res) => {
  let p = join('dist', decodeURIComponent(req.url.split('?')[0]));
  try {
    if ((await stat(p)).isDirectory()) p = join(p, 'index.html');
  } catch {
    p = p.endsWith('.html') ? p : p + '/index.html';
  }
  try {
    const buf = await readFile(p);
    res.writeHead(200, { 'Content-Type': TYPES[extname(p)] ?? 'application/octet-stream' });
    res.end(buf);
  } catch {
    res.writeHead(404);
    res.end('nf');
  }
});

/**
 * The section order on the homepage comes from the page itself, so the
 * labels in the document cannot drift from what is rendered. If someone adds
 * or removes a section without updating this list, the counts stop matching
 * and the document says so rather than silently mislabelling everything
 * after the change.
 */
const SECTION_SOURCES = [
  ['Hero — nyitóblokk', 'src/components/Hero.astro'],
  ['Bizalmi sáv', 'src/components/SocialProof.astro + src/data/site.ts'],
  ['Szolgáltatások', 'src/data/site.ts → services'],
  ['Hirdetéskezelés egyéni oktatás', 'src/components/CourseIntro.astro'],
  ['Három lehetőség + összehasonlítás', 'src/components/Comparison.astro'],
  ['Hogyan működik?', 'src/components/HowItWorks.astro'],
  ['Platformok', 'src/components/Platforms.astro + src/data/site.ts → platforms'],
  ['Eredmények', 'src/components/Results.astro + src/data/proof.ts → results'],
  ['Vélemények', 'src/components/Testimonials.astro + src/data/proof.ts → testimonials'],
  ['Árak', 'src/components/Pricing.astro + src/data/site.ts → packages'],
  ['Gyakori kérdések', 'src/data/proof.ts → faqs'],
  ['A másik fele — Ügynökség', 'src/components/AgencyHalf.astro + src/data/site.ts → agencyServices'],
];

/** Runs in the page. Walks each section and returns a flat block list. */
function extract() {
  const MODE = { shared: 'semleges', coaching: 'képzés (terrakotta)', agency: 'ügynökség (kék)' };
  const clean = (el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  const WALK = 'h1, h2, h3, h4, p, li, dt, dd, figcaption, blockquote, .bm-btn > span, summary';

  return [...document.querySelectorAll('main section, body > section')].map((sec) => {
    const blocks = [];
    const seenNodes = new Set();

    /* Every distinct string is listed once per section. Two things in the
       page render the same copy twice on purpose: the comparison table has a
       stacked card version for phones, and a couple of buttons are repeated
       for the mobile layout. Both would otherwise appear twice here for no
       reader benefit.

       This is text equality, not element identity, which matters: the
       service tiles ALSO have a mobile and a desktop version, but those are
       two different authored strings, so both survive. */
    const seenText = new Set();

    /* Not every piece of copy lives in a block-level text element. The
       headline price on a package card and the figure on a result card are
       spans inside a layout div — and they are the most important numbers on
       the page, so a document that omitted them would be worse than useless.

       Hence a single pass over EVERY element in document order, classifying
       each as a block (emitted whole, subtree consumed), a table, or an
       orphan leaf carrying text of its own. */
    const carriesText = (el) => [...el.children].some((c) => clean(c));

    for (const el of sec.querySelectorAll('*')) {
      if (seenNodes.has(el)) continue;
      if (el.closest('svg')) continue;

      if (el.tagName === 'TABLE') {
        /* A header cell holds a title and a sub-label in two spans. Running
           them together gives "Marketinges Kiszervezed"; the separator keeps
           them readable as the two things they are. */
        const cellText = (cell) => {
          const parts = [...cell.children].map(clean).filter(Boolean);
          return parts.length > 1 ? parts.join(' · ') : clean(cell);
        };
        const rows = [...el.querySelectorAll('tr')].map((tr) =>
          [...tr.querySelectorAll('th, td')].map(cellText),
        );
        blocks.push({ kind: 'table', rows });
        el.querySelectorAll('*').forEach((n) => seenNodes.add(n));
        /* Seed the dedupe with each cell AND its parts, so the phone layout's
           stacked cards — which repeat the column names on their own — do not
           come through as orphaned bullets after the table. */
        for (const cell of el.querySelectorAll('th, td')) {
          seenText.add(cellText(cell));
          seenText.add(clean(cell));
          [...cell.children].map(clean).forEach((t) => t && seenText.add(t));
        }
        continue;
      }

      const isBlock = el.matches(WALK);
      if (isBlock) {
        // A wrapper whose text is made of nested blocks; they speak for it.
        if (el.querySelector(WALK)) continue;
      } else {
        /* Skip only if a block ancestor already spoke for this text. A block
           that is merely a layout WRAPPER (a grid <li> holding a card) did
           not — it was skipped above — so its orphan children, such as the
           tile's own link label, still need emitting. */
        const blockAncestor = el.closest(WALK);
        if (blockAncestor && !blockAncestor.querySelector(WALK)) continue;
        if (carriesText(el)) continue;
      }

      const text = clean(el);
      if (!text || seenText.has(text)) continue;
      seenText.add(text);
      el.querySelectorAll('*').forEach((n) => seenNodes.add(n));

      const tag = el.tagName.toLowerCase();
      let kind = 'text';
      if (/^h[1-4]$/.test(tag)) kind = tag;
      else if (el.classList.contains('t-label')) kind = 'label';
      else if (el.matches('.bm-btn > span')) kind = 'button';
      else if (tag === 'dt') kind = 'dt';
      else if (tag === 'dd') kind = 'dd';
      else if (tag === 'li') kind = 'li';
      else if (tag === 'summary') kind = 'q';
      else if (el.classList.contains('sr-only')) kind = 'sr';

      const href = el.matches('.bm-btn > span') ? el.parentElement.getAttribute('href') : null;
      blocks.push({ kind, text, href });
    }

    return { id: sec.id || null, mode: MODE[sec.getAttribute('data-theme')] ?? null, blocks };
  });
}

function render(sections, when, commit) {
  const L = [];
  L.push('# Brandműhely — a főoldal teljes szövege');
  L.push('');
  L.push('> **Ez a fájl generált.** A `npm run copy:doc` állítja elő a lefordított');
  L.push('> oldalból, tehát mindig azt mutatja, ami tényleg kint van. Ne szerkeszd');
  L.push('> közvetlenül — a következő futtatás felülírja. Ha szöveget akarsz');
  L.push('> változtatni, jelöld meg itt és szólj, vagy írd át a „forrás" alatt');
  L.push('> megnevezett fájlban.');
  L.push('');
  L.push(`Generálva: ${when}${commit ? ` · \`${commit}\`` : ''}`);
  L.push('');
  L.push('A rövid és a hosszú változat is szerepel ott, ahol két szöveg van:');
  L.push('a szolgáltatás-csempéken telefonon az egysoros jelenik meg, tablettől');
  L.push('felfelé a teljes leírás. Mindkettőt valakinek át kell tudnia nézni.');
  L.push('');

  if (sections.length !== SECTION_SOURCES.length) {
    L.push('---');
    L.push('');
    L.push(`> ⚠️ **A szekciók száma megváltozott** (${sections.length} az oldalon,`);
    L.push(`> ${SECTION_SOURCES.length} a generátorban). A lenti címek és forrásmegjelölések`);
    L.push('> ettől a ponttól elcsúszhatnak — a `SECTION_SOURCES` listát frissíteni kell');
    L.push('> a `scripts/copy-doc.mjs` fájlban.');
    L.push('');
  }

  sections.forEach((sec, i) => {
    const [title, source] = SECTION_SOURCES[i] ?? [`${i + 1}. szekció`, 'ismeretlen'];
    L.push('---');
    L.push('');
    L.push(`## ${i + 1}. ${title}`);
    L.push('');
    const meta = [`*Forrás: ${source}*`];
    if (sec.mode) meta.push(`*Mód: ${sec.mode}*`);
    if (sec.id) meta.push(`*Horgony: \`#${sec.id}\`*`);
    L.push(meta.join(' · '));
    L.push('');

    // A list item emits no trailing blank line, so consecutive items stay one
    // list — which means the block after a list has to close it, or Markdown
    // swallows the next line into the last bullet.
    let inList = false;
    for (const b of sec.blocks) {
      const isItem = b.kind === 'li' || b.kind === 'dt';
      if (inList && !isItem && b.kind !== 'dd') L.push('');
      inList = isItem;

      switch (b.kind) {
        case 'table': {
          if (!b.rows.length) break;
          const width = Math.max(...b.rows.map((r) => r.length));
          const pad = (r) => [...r, ...Array(width - r.length).fill('')];
          L.push(`| ${pad(b.rows[0]).join(' | ')} |`);
          L.push(`|${' --- |'.repeat(width)}`);
          for (const r of b.rows.slice(1)) L.push(`| ${pad(r).join(' | ')} |`);
          L.push('');
          break;
        }
        case 'h1': L.push(`### H1 — ${b.text}`); L.push(''); break;
        case 'h2': L.push(`### H2 — ${b.text}`); L.push(''); break;
        case 'h3': case 'h4': L.push(`**${b.text}**`); L.push(''); break;
        case 'label': L.push(`**Címke:** \`${b.text}\``); L.push(''); break;
        case 'button':
          L.push(`**Gomb:** \`${b.text}\`${b.href ? ` → ${b.href}` : ''}`); L.push(''); break;
        case 'q': L.push(`**K: ${b.text}**`); L.push(''); break;
        case 'dt': L.push(`- **${b.text}**`); break;
        case 'dd': L.push(`  ${b.text}`); L.push(''); break;
        case 'li': L.push(`- ${b.text}`); break;
        case 'sr': L.push(`*(csak képernyőolvasónak: ${b.text})*`); L.push(''); break;
        default: L.push(b.text); L.push(''); break;
      }
    }
    if (inList) L.push('');
  });

  L.push('---');
  L.push('');
  L.push('## Amit ez a fájl nem mutat');
  L.push('');
  L.push('- Az aloldalak szövegét (`/kepzes`, `/ugynokseg`, `/arak`, `/rolam`,');
  L.push('  `/eredmenyek`, `/kapcsolat`, `/blog`, jogi oldalak).');
  L.push('- A fejléc és a lábléc szövegét — ezek minden oldalon azonosak.');
  L.push('- Az oldalcímeket és meta-leírásokat, amiket a Google talál meg.');
  L.push('');
  return L.join('\n') + '\n';
}

const commit = process.env.GITHUB_SHA?.slice(0, 7) ?? '';
await new Promise((r) => server.listen(PORT, r));
const browser = await launchChromium();
try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  // The consent banner is chrome, not page copy.
  await page.evaluate(() => document.getElementById('consent')?.remove());
  const sections = await page.evaluate(extract);
  const when = new Date().toISOString().slice(0, 10);
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, render(sections, when, commit), 'utf8');
  const words = sections.flatMap((s) => s.blocks).length;
  console.log(`✓ ${OUT} — ${sections.length} szekció, ${words} szövegblokk`);
  if (sections.length !== SECTION_SOURCES.length) {
    console.warn(
      `⚠ A szekciók száma ${sections.length}, a generátor ${SECTION_SOURCES.length}-t vár. ` +
      'Frissítsd a SECTION_SOURCES listát a scripts/copy-doc.mjs fájlban.',
    );
  }
} finally {
  await browser.close();
  server.close();
}
