# Ami még hátravan

> Állapot: **2026-10-11.** Minden tétel ellenőrizve: a kódból, a DNS-ből, és a
> brandmuhely.hu tényleges válaszából. A mérési rész a **publikált GTM-konténer
> letöltéséből** (`gtm.js?id=GTM-W9P4TKMB`) — tehát nem abból, amit a felületen
> láttál, hanem abból, ami élesben fut.
>
> A sorrend prioritás szerint. P1 = ma pénzbe vagy jogi kockázatba kerül.

---

## Ami a 2026-10-05-i lista óta elkészült

Hogy látszódjon, mi fogyott el:

| tétel | állapot |
|---|---|
| Mérés kint van-e | ✅ GTM `GTM-W9P4TKMB`, Consent Mode v2 **advanced** |
| GA4 | ✅ `G-M72H36LQNJ`, konfigurációs tag Initialization triggeren |
| 3 konverzió GA4-ben | ✅ `generate_lead`, `book_appointment`, `cta_click` (`cta_id` paraméterrel) |
| Meta Pixel | ✅ `963008246589280` — alap PageView + `Lead` + `Schedule`, `eventID`-vel |
| Consent-kapuzás | ✅ a 3 Meta-tag `ad_storage` + `ad_user_data` nélkül nem tüzel; a Google-tagek a **beépített** ellenőrzést használják (advanced mode megmarad) |
| Süti-dialógus | ✅ új, háromfüles, mobilon tesztelve |
| ÁSZF hirdetéskezelésre | ✅ 15 pont, „A"/„B" rész + közös rendelkezések |
| OG-megosztókép | ✅ `public/img/og-default.jpg`, 1200 × 630 px |
| `/ugynokseg` → `/hirdeteskezeles` | ✅ átnevezve + 301 |
| Régi WordPress-URL-ek | ✅ 410 Gone (nem 301 — nincs hova) |
| Indexelhetőség | ✅ noindex levéve, sitemap, canonical rendben |

---

# P1 — ez kerül most pénzbe vagy kockázatba

## 1. GA4: jelöld kulcseseménynek a kettőt · ~2 perc

GA4 → **Adminisztráció → Adatmegjelenítés → Események** → a `generate_lead` és a
`book_appointment` sorban a jobb oldali kapcsoló: **„Megjelölés
kulcseseményként"**.

Amíg ez nincs meg, a két konverzió csak sima esemény: a GA4 nem számolja
konverziónak, és **nem lehet átimportálni a Google Ads-be** sem. A tag tüzel, az
adat megy — csak nem konverzióként.

## 2. Google Ads konverzió: ez a lánc utolsó hiányzó szeme

A konténerben **nincs `AW-` tag**, és nincs Google Ads konverziókövetés sehol.
Vagyis: ha holnap Google Ads-et indítasz, **az algoritmus nem fog konverziót
látni** — pont az a helyzet, amit az ügyfeleidnél kijavítasz.

Két út, és az elsőt javaslom:

**A) GA4 → Google Ads importálás** (ehhez kell az 1. pont)
1. GA4 → Adminisztráció → **Termékkapcsolatok → Google Ads-kapcsolatok** → összekapcsolás
2. Google Ads → Célok → Konverziók → **Importálás → Google Analytics 4** → a két kulcsesemény
3. Egy tag kevesebb, és ugyanazt a számot látja a GA4 és az Ads.

**B) Külön Ads konverziótag a GTM-ben** — akkor kell, ha Ads-ben akarsz mérni
GA4 nélkül. Ekkor ügyelni kell, hogy ne számolj duplán.

Ha szólsz, az (B)-hez megírom a tag-lépéseket; az (A) tisztán a felületen megy.

## 3. ÁSZF: hagyd jóvá az öt szövegezett pontot, aztán jogász

Az ÁSZF-et a kinti feltételekből írtam, de **öt dolgot nem a site mondott,
hanem én szövegeztem meg.** Ezeket erősítsd meg vagy javítsd, mert szerződéses
kötelmek:

| hol | mit mondtam ki | ok |
|---|---|---|
| 7. pont | számla **a hó elején, 8 napos** fizetési határidővel | nem volt kint |
| 7. pont | késedelem esetén **8 napos írásos felszólítás után** felfüggesztés | nem volt kint |
| 10. pont | a 2 hónapos felmondási idő **a következő hónap 1-jén indul** | csak a „2 hónap" volt kint |
| 12. pont | a felelősség **egy havi díjban** maximálva | nem volt kint |
| 9. pont | GDPR 28. cikk szerinti **külön adatfeldolgozói megállapodás** | nem volt kint |

Utána **nézesse át jogász.** Havi 125–250 000 Ft-os, határozatlan idejű
szolgáltatást árulsz — ez az a dokumentum, ami vita esetén elő fog kerülni.

## 4. Hirdetéskezelési vélemény: nulla van

| felület | vélemény | eredmény |
|---|---|---|
| Oktatás | **2 db** (Demeter B., Németh T.) | 4 db |
| Hirdetéskezelés | **0 db** | 3 db |

A drágább szolgáltatásod mögött **egyetlen ügyfélszó sincs.** Egy jó vélemény
többet ér, mint bármilyen szövegezés.

A `docs/esettanulmany-sablon.md` megmondja, milyen formában kérd be. Jogilag
kötelező az **írásos hozzájárulás** — kitalált vagy engedély nélküli vélemény
Magyarországon jogszabálysértő (Fttv./GVH).

---

# P2 — tartalom, amit csak te tudsz megcsinálni

## 5. A tananyagok szakmai átnézése

Az öt kurzusoldalhoz (`/oktatas/facebook`, `google-ads`, `linkedin`, `tiktok`,
`google-analytics`) **én írtam a tematikát — ez az én feltételezésem arról, mit
tanítasz.** Olvasd végig, és ahol nem stimmel, jelöld meg.

A szövegek a `src/data/site.ts` → `courses` tömbben vannak. Ha kérsz, csinálok
belőle szerkeszthető md-fájlt, mint a `/arak` és a `/hirdeteskezeles`
oldalaknál.

## 6. Cal.com minősítő kérdések

A 30 perces konzultáció foglalásakor négy kérdés: mivel foglalkozik, mennyit
költ most hirdetésre, mi a cél, hirdetett-e már. **Ezt a Cal.com saját
felületén kell beállítani**, a weboldalról nem vezérelhető.

---

# P3 — technikai, rövid

## 7. brandműhely.hu: a Rackhost-ticket még nincs elküldve

Ellenőrizve ma:

| domain | IP | mit szolgál ki |
|---|---|---|
| `brandmuhely.hu` | 91.227.139.69 | a weboldal |
| `brandműhely.hu` (`xn--brandmhely-6fc.hu`) | **91.227.139.235** | Rackhost parkoló oldal, HTTP-n |

Más IP-n áll, tehát **a `.htaccess` átirányító szabálya nem tud lefutni** — a
kérés el sem jut ide. A szabály kint van és működni fog, amint a domain erre a
tárhelyre mutat.

Amit a ticketben kérni kell: a `brandműhely.hu` **alias domainként** a
`brandmuhely.hu` tárhelyére, **ugyanarra a dokumentumgyökérre**, és egy
Let's Encrypt tanúsítvány, ami **a csupasz és a www alakot is** fedi.
**Az MX-rekordokhoz ne nyúljanak** — az `info@brandmuhely.hu` alatta él.

## 8. DMARC: `p=none` → `p=quarantine`

Ellenőrizve ma: `v=DMARC1; p=none; rua=mailto:info@brandmuhely.hu`

A `p=none` csak megfigyel, nem véd — bárki küldhet a nevedben, és a fogadó
nem dobja el. A levelezésed minden ellenőrzése átmegy, tehát léphetsz:
`p=quarantine`, majd 2–4 hét után `p=reject`. DNS-módosítás, a Rackhost
felületén.

## 9. Második GTM-adminisztrátor

Jelenleg egyetlen fiók kezeli a konténert. Ha az hozzáférhetetlenné válik, a
mérés is. GTM → Adminisztráció → Felhasználókezelés.

## 10. Maradék git-ág: `origin/claude/write-probe`

Egy GitHub-kimaradás alatt keletkezett, tartalma nincs. Törölhető — én 403-at
kapok rá, neked a GitHub felületén egy kattintás (Branches → kuka).

---

# P4 — később, vagy amit én tudok elvinni

## 11. Meta Conversions API szerveroldalról

A `public/api/contact.php` már most küld levelet SMTP-n (PHPMailer), tehát a
kimenő HTTP-kérés megy. Ebből **extra szolgáltatás nélkül** tudok CAPI-hívást
csinálni: az űrlapos lead akkor is megérkezik a Metához, ha a böngészőben
blokkolja valami a pixelt. A `eventID` már most generálódik mindkét oldalon, a
deduplikáció tehát megoldott.

Ami ehhez kell tőled: egy **rendszerhasználói access token** a Meta Events
Managerből. **Ez nem chatbe, hanem közvetlenül a szerverre megy**, az
`api/config.local.php`-ba.

## 12. Cloudflare a Rackhost elé

Elnapolva, lásd `docs/tarhely-cloudflare.md`. A mai mérés: a főoldal TTFB
**1,47 s** — ez továbbra is a tárhely, nem a kód. Visszatérési pont kb.
**2026. november**, amikor a Search Console-ban lesz valódi Core Web Vitals
adat, és nem becslésből döntünk.

## 13. Blog

Két bejegyzés van (`google-ads-pmax-mire-figyelj`,
`meta-koltsegkeret-kis-budget`). A technikai rész kész — RSS, strukturált adat,
design. Ha tartod a havi 1–2 írást, fél év alatt érezhető lesz az organikus
forgalomban. Nem hiba, hanem elmaradó haszon.

---

## Összefoglalva: kinél van a labda

**Nálad, sorrendben:**
1. GA4 kulcsesemények (2 perc) → 2. Google Ads konverzió-importálás
3. Az öt ÁSZF-pont jóváhagyása → jogász
4. Hirdetéskezelési vélemény bekérése, írásos hozzájárulással
5. Tananyagok átnézése
6. Cal.com kérdések
7. Rackhost-ticket a brandműhely.hu-ra
8. DMARC `p=quarantine`
9. Második GTM-admin, és a `write-probe` ág törlése

**Nálam, ha szólsz:**
1. Meta CAPI a `contact.php`-ból
2. Google Ads konverziótag a GTM-ben, ha a (B) utat választod
3. A kurzustematikák szerkeszthető md-ben
4. Cloudflare, novemberben
