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
 * Hidden text is deliberately INCLUDED, and LABELLED. The service tiles
 * carry two authored descriptions, one for phones and one for wider screens,
 * and both are copy someone has to be able to review — but a reviewer who
 * cannot tell which is which will "fix" a contradiction that does not exist,
 * or edit the line nobody sees. So each page is measured at both widths and
 * anything that shows at only one of them says so.
 */
import { createServer } from 'node:http';
import { readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { extname, join, dirname } from 'node:path';
import { launchChromium } from './browser.mjs';

const PORT = 4457;

/* The two widths the copy is written for. The phone one is an iPhone 16 Pro's
   CSS width, the desktop one is wide enough to clear every `lg:` breakpoint in
   the stylesheet — between them they decide which of a pair of authored
   strings a given reader actually gets. */
const VIEWPORTS = {
  desktop: { width: 1440, height: 1000 },
  phone: { width: 390, height: 844 },
};

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
    path: '/hirdeteskezeles',
    out: 'docs/hirdeteskezeles-szoveg.md',
    title: 'Brandműhely — a Hirdetéskezelés oldal teljes szövege',
    sections: [
      ['Nyitóblokk + ár', 'src/pages/hirdeteskezeles.astro'],
      ['Ismerős?', 'src/data/site.ts → agencyOffer.symptoms'],
      ['A probléma', 'src/pages/hirdeteskezeles.astro'],
      ['Mit kapsz — hat blokk', 'src/data/site.ts → agencyOffer.blocks'],
      ['Mi van benne, mi nincs', 'src/data/site.ts → agencyOffer.includes / excludes'],
      ['Hogyan dolgozunk', 'src/data/site.ts → agencyOffer.process'],
      ['Eredmények', 'src/components/Results.astro + src/data/proof.ts → results (half: ugynokseg)'],
      ['Szakterületek', 'src/components/Expertise.astro + src/data/site.ts → expertiseFields'],
      ['Miért én', 'src/pages/hirdeteskezeles.astro → why'],
      ['Ár', 'src/data/site.ts → agencyOffer.price / pricePerChannel'],
      ['Milyen ügyfeleket keresek', 'src/data/site.ts → agencyOffer.fitFor / notFitFor'],
      ['Gyakori kérdések', 'src/data/proof.ts → agencyFaqs'],
      ['Záró CTA', 'src/pages/hirdeteskezeles.astro'],
      ['A másik fele — oktatás', 'src/pages/hirdeteskezeles.astro'],
    ],
  },
  {
    path: '/arak',
    out: 'docs/arak-szoveg.md',
    title: 'Brandműhely — az Árak oldal teljes szövege',
    sections: [
      ['Csomagok és árak', 'src/components/Pricing.astro + src/data/site.ts → packages'],
      ['Három lehetőség + összehasonlítás', 'src/components/Comparison.astro'],
      ['Gyakori kérdések', 'src/data/proof.ts → faqs'],
      ['A másik fele — Hirdetéskezelés', 'src/components/AgencyHalf.astro + src/data/site.ts → agencyServices'],
    ],
  },
];

/** Tags every element with a stable index, so the same node can be looked up
 *  again after the viewport changes under it. */
function tagNodes() {
  let i = 0;
  for (const el of document.querySelectorAll('*')) el.setAttribute('data-cdi', String(i++));
}

/** Which tagged nodes are actually rendered at the current width. */
function visibleIds() {
  const out = [];
  for (const el of document.querySelectorAll('[data-cdi]')) {
    if (el.checkVisibility()) out.push(el.getAttribute('data-cdi'));
  }
  return out;
}

/** Runs in the page. Walks each section and returns a flat block list. */
function extract() {
  const MODE = { shared: 'semleges', coaching: 'képzés (terrakotta)', agency: 'ügynökség (kék)' };
  const clean = (el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  const WALK = 'h1, h2, h3, h4, p, li, dt, dd, figcaption, blockquote, .bm-btn > span, summary';

  return [...document.querySelectorAll('main section, body > section')].map((sec) => {
    const blocks = [];
    const seenNodes = new Set();

    /* Repeated copy is deduped PER CARD, not per section. The three package
       cards share most of their feature list word for word, and a
       section-wide dedupe quietly emptied the second and third one — which
       is exactly the list someone rewriting the pricing page needs to see.
       A card, a table row or a <details> is its own scope; anything outside
       one falls back to the section. */
    const SCOPE = '.card, article, figure, details, tr, dl > div';
    const scopes = new Map();
    const scopeFor = (el) => {
      const key = el.closest(SCOPE) ?? sec;
      if (!scopes.has(key)) scopes.set(key, new Map());
      return scopes.get(key);
    };

    /* Every distinct string is listed once per section. Two things in the
       page render the same copy twice on purpose: the comparison table has a
       stacked card version for phones, and a couple of buttons are repeated
       for the mobile layout. Both would otherwise appear twice here for no
       reader benefit.

       This is text equality, not element identity, which matters: the
       service tiles ALSO have a mobile and a desktop version, but those are
       two different authored strings, so both survive. */

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
        blocks.push({ kind: 'table', rows, idxs: [el.getAttribute('data-cdi')] });
        el.querySelectorAll('*').forEach((n) => seenNodes.add(n));
        /* The phone layout repeats this table as stacked cards. They are NOT
           suppressed: they carry their own column labels ("Marketinges" on
           its own, against "Marketinges · Kiszervezed" in the header), those
           are separately authored strings, and the width markers say which
           reader gets which. */
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
      if (!text) continue;
      /* The same string rendered twice — a button repeated for the mobile
         layout — is one block, but it is one block that BOTH widths show.
         Folding the duplicate's id into the block it repeats is what stops
         it being reported as phone-only. */
      const seenText = scopeFor(el);
      const already = seenText.get(text);
      if (already) {
        already.idxs.push(el.getAttribute('data-cdi'));
        el.querySelectorAll('*').forEach((n) => seenNodes.add(n));
        continue;
      }
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
      const block = { kind, text, href, idxs: [el.getAttribute('data-cdi')] };
      seenText.set(text, block);
      blocks.push(block);
    }

    return { id: sec.id || null, mode: MODE[sec.getAttribute('data-theme')] ?? null, blocks };
  });
}

/** Which widths show a block: 'phone', 'desktop', or '' for both (which is
 *  almost everything). */
function widthOf(block, seen) {
  const on = (w) => block.idxs?.some((i) => seen[w].has(i));
  const d = on('desktop');
  const p = on('phone');
  if (d && !p) return 'desktop';
  if (p && !d) return 'phone';
  return '';
}

const WIDTH_SUFFIX = {
  phone: ' *(csak telefonon)*',
  desktop: ' *(csak nagy képernyőn)*',
};

/* A banner for a RUN of single-width blocks. The phone version of the
   comparison table is twenty-four lines long; tagging every one of them
   turns the marker into wallpaper, and a reader stops seeing it. */
const WIDTH_BANNER = {
  phone: '**▸ Az alábbiak csak telefonon látszanak.**',
  desktop: '**▸ Az alábbiak csak nagy képernyőn látszanak.**',
  '': '**▸ Innentől újra mindkettőn.**',
};

function render(cfg, sections, when, commit, seen) {
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
  L.push('**Telefon és nagy képernyő.** Az oldal néhány helyen két szöveget tart');
  L.push('ugyanarra a pontra: telefonra egy rövidebbet, nagyobb képernyőre a');
  L.push('teljeset. Mindkettő szerepel ebben a fájlban, és ami csak az egyiken');
  L.push('látszik, azt megjelölöm:');
  L.push('');
  L.push('- *(csak telefonon)* — ezt a szöveget csak telefonról olvassák.');
  L.push('- *(csak nagy képernyőn)* — ezt csak laptopról/asztali gépről.');
  L.push('- jelölés nélkül: mindenki ezt látja.');
  L.push('');
  L.push(`Mérve ${VIEWPORTS.phone.width} px (telefon) és ${VIEWPORTS.desktop.width} px`);
  L.push('(nagy képernyő) szélességen.');
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
    /* Runs of same-width blocks, so a long single-width stretch gets one
       banner instead of a marker on every line. A run of one keeps the
       inline suffix — a banner either side of a single line reads worse. */
    const widths = sec.blocks.map((b) => widthOf(b, seen));
    const runLength = widths.map((_, i) => {
      let n = 1;
      while (widths[i + n] === widths[i]) n++;
      return n;
    });
    let bannerWidth = '';

    let inList = false;
    sec.blocks.forEach((b, i) => {
      const isItem = b.kind === 'li' || b.kind === 'dt';
      if (inList && !isItem && b.kind !== 'dd') L.push('');
      inList = isItem;

      /* A run of 2+ opens with a banner; the run before it has to be closed
         again when the page goes back to showing everything. */
      const banner = runLength[i] > 1 || widths[i] === '' ? widths[i] : null;
      if (banner !== null && banner !== bannerWidth) {
        if (inList) L.push('');
        if (banner !== '' || bannerWidth !== '') {
          L.push(WIDTH_BANNER[banner]);
          L.push('');
        }
        bannerWidth = banner;
        inList = false;
      }
      const w = widths[i] === bannerWidth ? '' : (WIDTH_SUFFIX[widths[i]] ?? '');

      switch (b.kind) {
        case 'table': {
          if (!b.rows.length) break;
          if (w) { L.push(`*(táblázat —${w.replace(/[*()]/g, '').replace(/^ csak/, ' csak')})*`); L.push(''); }
          const width = Math.max(...b.rows.map((r) => r.length));
          const pad = (r) => [...r, ...Array(width - r.length).fill('')];
          L.push(`| ${pad(b.rows[0]).join(' | ')} |`);
          L.push(`|${' --- |'.repeat(width)}`);
          for (const r of b.rows.slice(1)) L.push(`| ${pad(r).join(' | ')} |`);
          L.push('');
          break;
        }
        case 'h1': L.push(`### H1 — ${b.text}${w}`); L.push(''); break;
        case 'h2': L.push(`### H2 — ${b.text}${w}`); L.push(''); break;
        case 'h3': case 'h4': L.push(`**${b.text}**${w}`); L.push(''); break;
        case 'label': L.push(`**Címke:** \`${b.text}\`${w}`); L.push(''); break;
        case 'button':
          L.push(`**Gomb:** \`${b.text}\`${b.href ? ` → ${b.href}` : ''}${w}`); L.push(''); break;
        case 'q': L.push(`**K: ${b.text}**${w}`); L.push(''); break;
        case 'dt': L.push(`- **${b.text}**${w}`); break;
        case 'dd': L.push(`  ${b.text}${w}`); L.push(''); break;
        case 'li': L.push(`- ${b.text}${w}`); break;
        case 'sr': L.push(`*(csak képernyőolvasónak: ${b.text})*`); L.push(''); break;
        default: L.push(b.text + w); L.push(''); break;
      }
    });
    if (inList) L.push('');
    if (bannerWidth !== '') { L.push(''); L.push(WIDTH_BANNER['']); L.push(''); }
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
    const page = await browser.newPage({ viewport: VIEWPORTS.desktop });
    await page.goto(`http://localhost:${PORT}${cfg.path}`, { waitUntil: 'networkidle' });
    // The consent banner is chrome, not page copy.
    await page.evaluate(() => document.getElementById('consent')?.remove());
    await page.evaluate(tagNodes);

    /* Visibility is measured at each width before anything is extracted, so
       the two readings describe the same DOM. Desktop goes last on purpose:
       the extraction below then runs against the layout the labels assume. */
    const seen = {};
    for (const [name, vp] of [['phone', VIEWPORTS.phone], ['desktop', VIEWPORTS.desktop]]) {
      await page.setViewportSize(vp);
      seen[name] = new Set(await page.evaluate(visibleIds));
    }

    const sections = await page.evaluate(extract);
    await mkdir(dirname(cfg.out), { recursive: true });
    await writeFile(cfg.out, render(cfg, sections, when, commit, seen), 'utf8');
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
