# Brandműhely — brandmuhely.hu

Egyéni (1 az 1-ben) Meta, Google és LinkedIn hirdetési képzés magyar KKV-knak.

Statikus weboldal **Astro 5 + TypeScript + Tailwind CSS 4** alapon. A build tiszta
HTML/CSS/JS-t állít elő, ezért bármilyen PHP-s tárhelyen (Rackhost) fut, Node.js
futtatókörnyezet nélkül — és bármikor átvihető Vercelre vagy Cloudflare Pagesre.

---

## Gyors indulás

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # dist/ mappába épít
npm run preview      # a legyártott oldal megtekintése
```

| Parancs | Mit csinál |
| --- | --- |
| `npm run dev` | Fejlesztői szerver |
| `npm run build` | Éles build a `dist/` mappába |
| `npm run build:prod` | Ugyanaz, de **leáll**, ha még placeholder vélemények vannak |
| `./scripts/subset-fonts.sh` | Újragenerálja a magyar betűkészlet-részhalmazokat |
| `npm run verify:consent` | Böngészős ellenőrzés: a süti-hozzájárulás tényleg működik-e |
| `npm run shots "/::home"` | Képernyőképek desktop + mobil nézetben |

---

## ⚠️ Élesítés előtti teendők

Ezek nélkül **nem szabad** élesíteni:

- [ ] **Valós vélemények és eredmények.** A `src/data/proof.ts` jelenleg kitalált
      adatokat tartalmaz. Kitalált vélemény publikálása Magyarországon jogszabálysértő
      (Fttv. / GVH, EU Omnibus irányelv). Csere után: `PROOF_IS_PLACEHOLDER = false`.
      Amíg ez `true`, a `npm run build:prod` **megtagadja** a buildet, és az oldalon
      látható fejlesztői figyelmeztetés jelenik meg.
- [ ] **Kristóf portréfotói** — lásd lentebb.
- [ ] **Cal.com link** beállítása (`contact.bookingUrl`).
- [ ] **GTM konténer azonosító** (`.env` → `PUBLIC_GTM_ID`).
- [ ] **Két szerződési feltétel megerősítése** a `src/data/site.ts` `terms` blokkjában:
      díjmentes átütemezés határideje (jelenleg 24 óra) és az alkalmak felhasználási
      ideje (jelenleg 6 hónap). Ezeket én javasoltam, nem te adtad meg.
- [ ] **Jogi átnézés.** Az ÁSZF és az adatkezelési tájékoztató szakmai sablon, a
      weboldal tényleges működését írja le — de nem jogi tanácsadás.

---

## Tartalom szerkesztése

Szinte minden üzleti adat **egy fájlban** van: `src/data/site.ts`

- árak és csomagok (`packages`) — a `4+1` / `7+3` konstrukció és a megtakarítás
  automatikusan számolódik, elég az árat és a fizetett alkalmak számát átírni
- a három program (`tracks`)
- platformok, elérhetőség, menü

A vélemények, eredmények és a GYIK: `src/data/proof.ts`

### Blogbejegyzés írása

Hozz létre egy `.md` fájlt a `src/content/blog/` mappában:

```markdown
---
title: "A bejegyzés címe"
description: "1-2 mondatos összefoglaló, ez jelenik meg a listában és a Google-ben."
pubDate: 2026-09-18
category: "Meta Ads"   # Meta Ads | Google Ads | LinkedIn Ads | Általános
readingMinutes: 5
draft: false
---

A szöveg innen, sima Markdownban.
```

A fájlnév lesz az URL: `meta-tippek.md` → `/blog/meta-tippek`.

---

## Képek

Tedd a `public/img/` mappába:

| Fájl | Méret | Hol jelenik meg |
| --- | --- | --- |
| `kristof-portrait.jpg` | 1200×1500 | Főoldal hero |
| `kristof-about.jpg` | 900×1125 | Rólam oldal |
| `og-default.jpg` | 1200×630 | Közösségi megosztás előnézete |
| `apple-touch-icon.png` | 180×180 | iOS kezdőképernyő |

Amíg nincs fotó, a keret egy monogramos placeholdert mutat — nem törik el a layout.
A hero portré a legfontosabb hiányzó elem: 1 az 1-ben szolgáltatásnál az arc adja el a
szolgáltatást.

---

## Mérés — Google Tag Manager

Hozz létre egy `.env` fájlt a gyökérben:

```
PUBLIC_GTM_ID=GTM-XXXXXXX
```

Ezután a GA4-et, a Google Ads konverziókat és a Meta Pixelt **a GTM felületén**
add hozzá — új mérőkódhoz nem kell újra deployolni az oldalt.

Ha valamiért nem GTM-et használnál, a közvetlen mérőkódok is támogatottak
(`PUBLIC_GA4_ID`, `PUBLIC_GOOGLE_ADS_ID`, `PUBLIC_META_PIXEL_ID`). **GTM mellett
hagyd őket üresen**, különben minden konverzió kétszer számolódna.

### Consent Mode v2

A mérés alapértelmezetten *tiltott* állapotban indul, és a hozzájárulási
beállítások **a GTM betöltése előtt** kerülnek beállításra — így hozzájárulás
nélkül semmilyen azonosításra alkalmas süti nem kerül elhelyezésre. Az elutasítás
pontosan ugyanolyan könnyű, mint az elfogadás; ezt a NAIH és az EDPB is megköveteli.

Ez nem feltételezés: a `npm run verify:consent` valódi böngészőben ellenőrzi
(15 teszt), hogy elutasítás után nem íródik süti, és hogy az elfogadás helyesen
frissíti a hozzájárulást.

### dataLayer események

| Esemény | Mikor | Hasznos paraméter |
| --- | --- | --- |
| `booking_complete` | Cal.com foglalás sikeres | `method` |
| `form_submit` | Kapcsolati űrlap elküldve | `method` |
| `cta_click` | Bármelyik CTA gombra kattintás | `cta_id` |
| `consent_update` | A látogató módosítja a süti-beállítást | `bm_consent` |

GTM-ben ezekre az eseménynevekre állíts be Custom Event triggert. A `cta_id`
értéke pl. `hero-primary`, `pricing-five`, `sticky-cta` — így látszik, melyik
gomb hozza ténylegesen a foglalásokat.

## Kapcsolati űrlap (PHP)

Az űrlapot a `public/api/contact.php` kezeli, **a saját szervereden** — így látogatói
adat nem hagyja el az EU-t, ami tisztább GDPR-helyzet, mint bármelyik külsős űrlapszolgáltató.

Szerveren egyszer beállítandó:

```bash
cp api/config.local.example.php api/config.local.php
# majd szerkeszd: 'to' és 'from' cím
```

A `from` cím **a saját domainoden** legyen (`no-reply@brandmuhely.hu`), különben az SPF
miatt a levelek spambe kerülnek.

Beépítve: honeypot mező, IP-alapú rate limit (1 küldés / perc), fejléc-injekció elleni
védelem, és minden beérkező üzenet mentése a webgyökéren **kívüli** `_private/leads.csv`
fájlba — így egy sikertelen e-mail küldés esetén sem vész el érdeklődő.

---

## Deploy

### Automatikus (ajánlott)

A `main` branchre pusholva a GitHub Actions buildel és SFTP-vel feltölt.
Állítsd be a repo *Settings → Secrets and variables → Actions* alatt:

| Secret | Érték |
| --- | --- |
| `SFTP_HOST` | Rackhost szerver címe |
| `SFTP_USER` | SFTP felhasználónév |
| `SFTP_PASSWORD` | SFTP jelszó |
| `SFTP_PORT` | általában `22` |
| `SFTP_REMOTE_PATH` | pl. `/web` vagy `/public_html` |

### Kézi

```bash
npm run build:prod
# a dist/ mappa TARTALMÁT töltsd fel a webgyökérbe
```

A `.htaccess` automatikusan bekerül a `dist/`-be: HTTPS-kényszerítés, `www` kanonizálás,
cache-fejlécek, gzip és biztonsági fejlécek. **Feltétel:** a Let's Encrypt tanúsítvány
legyen bekapcsolva a Rackhost paneljén.

> A WordPress telepítést nem kell megtartani. Ez az oldal statikus: nincs adatbázis,
> nincs admin belépés, nincs mit feltörni, és nincs havi biztonsági frissítés.
> **Élesítés előtt készíts teljes biztonsági mentést a jelenlegi tárhely tartalmáról.**

---

## Teljesítmény

Fizetett forgalomra épült: a betöltési sebesség befolyásolja a Google Ads
minőségi mutatóját, az pedig közvetlenül a kattintási költséget.

- **~1 kB JavaScript** (gzip) az egész oldalon
- **91 kB betűkészlet** a 200 kB helyett — a `scripts/subset-fonts.sh` a magyar
  karakterkészletre szabja őket (`ő`, `ű` a Latin Extended-A blokkból)
- Betűk **saját szerverről**: a Google Fonts CDN-ről töltés EU-s látogatói IP-t küldene
  egy amerikai szerverre, amit európai bíróságok többször GDPR-sértésnek minősítettek
- Nincs képkeret-ugrálás: minden képnek fix `width`/`height` aránya van

---

## Nyelv

Az oldal magyar. A szerkezet előkészített arra, hogy az angol verzió később
hozzáadható legyen az `astro.config.mjs` i18n blokkjának bővítésével — a szövegek a
komponensekben vannak, így a fordítás nem igényel újraírást, csak kiszervezést.
