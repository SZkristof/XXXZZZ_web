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
| `npm run verify` | Mind a 28 ellenőrzés (süti + űrlap) |
| `npm run verify:consent` | Böngészős ellenőrzés: a süti-hozzájárulás tényleg működik-e |
| `npm run verify:form` | A PHP űrlapkezelő végponttól végpontig tesztelve |
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

## Arculat

Az oldal a **Brandműhely arculati kézikönyv v4** ("Round 4 final") alapján
készült, amit Jay állított össze egy megosztott Claude artifactban. A rendszer
implementációja a `src/styles/global.css` fájlban van, és szándékosan szűk:

- **Tíz szín, semmi több.** Két primer (terrakotta, kék), mindegyikhez egy
  világosabb és egy sötétebb lépcső, plusz paper / white / black és egy
  signal szín. Nincs szürkeskála — a halványabb szöveg a ground saját
  szövegszíne csökkentett átlátszósággal.
- **Két szabály dönt el szinte mindent.** (1) Az 500-as lépcsők *kitöltések*,
  soha nem szöveg — terrakotta-500 a paperen 2,99:1. (2) A két primer soha nem
  szöveg egymáson (2,79:1 mindkét irányban). Terrakotta alapon a szöveg
  `black`, kék alapon `paper` vagy `terracotta-200`.
- **Egy lekerekítés** (`rounded-brand`, 4px) és **egy árnyék** (`shadow-shade`,
  plusz egyetlen erősebb lépcső). A fehér kártya csak az árnyéktól olvasható
  kártyaként — 1,12:1-re van a papertől.
- **Archivo 700** a címekhez (wdth 110–112), **Hanken Grotesk 200–300** a
  szöveghez. A 200-as súly kizárólag 24px felett használható.
- A kisbetűs címkék **eleve nagybetűvel vannak írva**, nem `text-transform`-mal
  — ez védi meg az `Ő` és `Ű` betűk kettős ékezetét.
- Tiltott: narancs/sárga (párt-asszociáció), zászlózöld a 80–160° sávban,
  platformkék, és az Inter / Poppins / Montserrat / Roboto betűtípusok.

A logó (**A Vágás**) inline SVG-ként a `src/components/Logo.astro` fájlban él,
pontosan a kézikönyv geometriájával: egy blokk, két 13°-os vágás, 48 egységből
8 szélesen — ami az Archivo 700 szárvastagsága ugyanazon a magasságon. A jel
mindig egyszínű, és mindig annak a felületnek a szövegszínét veszi fel, amin áll.

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

Az űrlapot a `public/api/contact.php` kezeli, **a saját szervereden** — így
látogatói adat nem hagyja el az EU-t, ami tisztább GDPR-helyzet, mint bármelyik
külsős űrlapszolgáltató.

### SMTP kötelező, nem opcionális

A `brandmuhely.hu` levelezése **Google Workspace**-en van. Emiatt a domain SPF
rekordja a Google-t hatalmazza fel arra, hogy `@brandmuhely.hu` címről küldjön —
a Rackhostot nem. Ha a PHP a Rackhost szerveréről küldene, a levél **elbukna az
SPF-en** és jellemzően spambe kerülne. Ezért az űrlap a Google saját SMTP-jén
küld (App Password-del), így az SPF, DKIM és DMARC is rendben van.

Beállítás a szerveren, egyszer:

```bash
cp api/config.local.example.php api/config.local.php
# majd töltsd ki az smtp_* mezőket
```

Részletes lépések: **[DEPLOY.md](./DEPLOY.md)** 5. pont.

### Beépített védelem

- honeypot mező (a botok kitöltik, ember sosem látja)
- IP-alapú rate limit — **csak sikeres beküldés után indul**, így egy elgépelt
  e-mail cím javítása nem zár ki senkit egy percre
- minden vezérlőkarakter kiszűrése az egysoros mezőkből (CRLF → nem lehet
  fejlécet injektálni), miközben az ékezetek (`ő`, `ű`) sértetlenek maradnak
- minden beérkező üzenet mentése a webgyökéren **kívüli** `_private/leads.csv`
  fájlba, plusz egy `Require all denied` őrfájl ugyanabba a mappába — így
  sikertelen levélküldés esetén sem vész el érdeklődő, és az adatok nem
  tölthetők le a webről

Ezt nem feltételezzük: a `npm run verify:form` 13 ellenőrzést futtat valódi PHP
szerveren, és a CI is lefuttatja minden deploy előtt.

## Deploy

**A teljes élesítési folyamat — a WordPress leváltásával együtt — itt van:
[DEPLOY.md](./DEPLOY.md).** Olvasd azt végig, mielőtt bármit törölnél a
szerveren.

Röviden: a `main` branchre pusholva a GitHub Actions buildel, lefuttatja mind a
28 ellenőrzést, és feltölt SFTP-n vagy FTPS-en.

Repository *Settings → Secrets and variables → Actions*:

| Variable | Érték |
| --- | --- |
| `DEPLOY_PROTOCOL` | `sftp` vagy `ftps` |

| Secret | Érték |
| --- | --- |
| `DEPLOY_HOST` | Rackhost szerver címe |
| `DEPLOY_USER` | felhasználónév |
| `DEPLOY_PASSWORD` | jelszó |
| `DEPLOY_PORT` | SFTP: `22`, FTPS: `21` |
| `DEPLOY_REMOTE_PATH` | a webgyökér útvonala |

Kézzel:

```bash
npm run build:prod
# a dist/ mappa TARTALMÁT töltsd fel a webgyökérbe
```

A `.htaccess` automatikusan bekerül a `dist/`-be: HTTPS-kényszerítés, `www`
kanonizálás, cache-fejlécek, gzip, biztonsági fejlécek, és a régi WordPress
végpontok (`wp-admin`, `wp-login.php`, `xmlrpc.php`) lezárása.

> A WordPress telepítést **el kell távolítani**, nem elég föléírni: egy ottmaradt,
> frissítetlen WP-mag futtatható PHP-vel valódi biztonsági kockázat. Lásd
> DEPLOY.md 2. pont. Előtte **készíts teljes mentést** — fájlok és adatbázis.

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
