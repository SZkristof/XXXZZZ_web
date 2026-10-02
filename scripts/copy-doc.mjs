/**
 * Generates one Markdown file per listed page — the copy, in page order, for
 * review outside the codebase. Add a page to PAGES below and it is covered;
 * do not write a second script, or the two will drift and nobody will know
 * which is current, which is the exact problem this exists to prevent.
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
 * One entry per page. `sections` labels each <section> in document order and
 * says which file its copy lives in, so a reader can go straight there.
 *
 * The labels come from this list, the sections come from the rendered page.
 * If someone adds or removes a section without updating the list, the counts
 * stop matching and the generated file says so at the top rather than
 * silently mislabelling everything after the change.
 */
const PAGES = [
  {
    path: '/',
    out: 'docs/fooldal-szoveg.md',
    title: 'Brandműhely — a főoldal teljes szövege',
    sections: [
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
    ],
  },
  {
    path: '/ugynokseg',
    out: 'docs/ugynokseg-szoveg.md',
    title: 'Brandműhely — a Hirdetéskezelés oldal teljes szövege',
    sections: [
      ['Nyitóblokk + ár', 'src/pages/ugynokseg.astro'],
      ['Ismerős?', 'src/data/site.ts → agencyOffer.symptoms'],
      ['A probléma', 'src/pages/ugynokseg.astro + site.ts → agencyOffer.hardParts'],
      ['Mit kapsz — hat blokk', 'src/data/site.ts → agencyOffer.blocks'],
      ['Mi van benne, mi nincs', 'src/data/site.ts → agencyOffer.includes / excludes'],
      ['Hogyan dolgozunk', 'src/data/site.ts → agencyOffer.process'],
      ['Eredmények', 'src/components/Results.astro + src/data/proof.ts → results (half: ugynokseg)'],
      ['Akikkel már dolgoztam', 'src/components/Brands.astro + src/data/site.ts → brands'],
      ['Miért én', 'src/pages/ugynokseg.astro → why'],
      ['Ár', 'src/data/site.ts → agencyOffer.price'],
      ['Kinek való, kinek nem', 'src/data/site.ts → agencyOffer.fitFor / notFitFor'],
      ['Gyakori kérdések', 'src/data/proof.ts → agencyFaqs'],
      ['Záró CTA', 'src/pages/ugynokseg.astro'],
      ['A másik fele — oktatás', 'src/pages/ugynokseg.astro'],
    ],
  },
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

      /* A list item often holds a thing and a note about it as two sibling
         spans, usually one wrapper down past an icon. textContent runs them
         together ("A hirdetési költés Közvetlenül a Google..."), so descend
         through single-child wrappers and, when a level's children account
         for ALL of the text, join them with a dash. The equality guard is
         what keeps a paragraph with inline <strong> in running prose from
         being chopped up the same way. */
      const labelled = (node) => {
        const squash = (t) => t.replace(/\s+/g, '');
        for (let depth = 0; depth < 6; depth++) {
          const kids = [...node.children].filter((c) => clean(c));
          if (kids.length === 1) { node = kids[0]; continue; }
          if (kids.length > 1 && squash(kids.map(clean).join('')) === squash(clean(node))) {
            return kids.map(clean).join(' — ');
          }
          return null;
        }
        return null;
      };
      const text = labelled(el) ?? clean(el);
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

function render(cfg, sections, when, commit) {
  const L = [];
  L.push(`# ${cfg.title}`);
  L.push('');
  L.push('> **Ez a fájl generált.** A `npm run copy:doc` állítja elő a lefordított');
  L.push('> oldalból, tehát mindig azt mutatja, ami tényleg kint van. Ne szerkeszd');
  L.push('> közvetlenül — a következő futtatás felülírja. Ha szöveget akarsz');
  L.push('> változtatni, jelöld meg itt és szólj, vagy írd át a „forrás" alatt');
  L.push('> megnevezett fájlban.');
  L.push('');
  L.push(`Generálva: ${when}${commit ? ` · \`${commit}\`` : ''}`);
  L.push('');
  L.push('Ahol két szöveg van ugyanarra a helyre — telefonra egy rövid, nagyobb');
  L.push('képernyőre a teljes —, ott mindkettő szerepel: mindkettőt látja valaki.');
  L.push('');

  if (sections.length !== cfg.sections.length) {
    L.push('---');
    L.push('');
    L.push(`> ⚠️ **A szekciók száma megváltozott** (${sections.length} az oldalon,`);
    L.push(`> ${cfg.sections.length} a generátorban). A lenti címek és forrásmegjelölések`);
    L.push('> ettől a ponttól elcsúszhatnak — a `SECTION_SOURCES` listát frissíteni kell');
    L.push('> a `scripts/copy-doc.mjs` fájlban.');
    L.push('');
  }

  sections.forEach((sec, i) => {
    const [title, source] = cfg.sections[i] ?? [`${i + 1}. szekció`, 'ismeretlen'];
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
  L.push('- A többi oldal szövegét. Amelyikre van generált fájl, azt a');
  L.push('  `docs/` mappában találod; a többihez szólj, és felveszem a listára.');
  L.push('- A fejléc és a lábléc szövegét — ezek minden oldalon azonosak.');
  L.push('- Az oldalcímeket és meta-leírásokat, amiket a Google talál meg.');
  L.push('');
  return L.join('\n') + '\n';
}

const commit = process.env.GITHUB_SHA?.slice(0, 7) ?? '';
const when = new Date().toISOString().slice(0, 10);

await new Promise((r) => server.listen(PORT, r));
const browser = await launchChromium();
let drifted = 0;
try {
  for (const cfg of PAGES) {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${PORT}${cfg.path}`, { waitUntil: 'networkidle' });
    // The consent banner is chrome, not page copy.
    await page.evaluate(() => document.getElementById('consent')?.remove());
    const sections = await page.evaluate(extract);
    await mkdir(dirname(cfg.out), { recursive: true });
    await writeFile(cfg.out, render(cfg, sections, when, commit), 'utf8');
    const blocks = sections.flatMap((s) => s.blocks).length;
    console.log(`✓ ${cfg.out} — ${sections.length} szekció, ${blocks} szövegblokk`);
    if (sections.length !== cfg.sections.length) {
      drifted++;
      console.warn(
        `  ⚠ ${cfg.path}: ${sections.length} szekció van, a generátor ${cfg.sections.length}-t vár. ` +
        'Frissítsd a PAGES listát a scripts/copy-doc.mjs fájlban.',
      );
    }
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
if (drifted) process.exitCode = 0; // a figyelmeztetés elég, a fájl így is használható
