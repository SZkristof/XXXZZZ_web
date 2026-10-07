# Tárhely: Cloudflare elé, később

> **Elnapolt döntés, nem teendőlista.** Kristóf 2026-10-05-én jóváhagyta az
> irányt, de a kivitelezést későbbre tettük. Ez a fájl azért van, hogy amikor
> visszatérünk rá, ne kelljen újra kimérni és újra végiggondolni.

## Miért merült fel

A statikus oldalt lassan szolgálja ki a Rackhost megosztott tárhelye. Mérés
2026-10-05-én, 20 lekérés:

| mit kértem le | első bájt (TTFB) |
|---|---|
| `robots.txt` — 91 bájt, statikus szöveg | 0,49 – 1,22 s, **medián 0,82 s** |
| főoldal | 0,64 – 1,21 s |
| `google.com/robots.txt` (kontroll) | 0,10 – 0,50 s |

Egy 91 bájtos statikus fájlra közel egy másodperc. Nincs mit számolni rajta —
nincs adatbázis, nincs PHP, előre legenerált HTML. Ez tisztán a tárhely.

Ez két helyen fáj: a Core Web Vitals TTFB mutatóján (tehát a rangsorolásban),
és a látogatónál, aki minden kattintásnál megvárja.

**Figyelem a méréshez:** a fejlesztői konténer kimenő proxyja ennél a hosztnál
időnként elszakad (`ws_closed_mid_exchange`), és ez HTTP 000-ként látszik. Az
NEM a szerver hibája. Ha valaki újramér, előbb nézze meg a
`curl -sS "$HTTPS_PROXY/__agentproxy/status"` kimenetének `recentRelayFailures`
mezőjét, mielőtt a tárhelyre mutatna. Egyszer már majdnem rossz következtetésre
jutottam ezen.

## A javaslat: Cloudflare ELÉ, nem költözés

Két út volt a terítéken:

**A) Cloudflare a Rackhost elé** (ingyenes csomag, proxyzott DNS). Minden marad
a helyén, a Cloudflare élhálózata gyorsítótárazza a HTML-t. ← **ez a javaslat**

**B) Teljes költözés Cloudflare Pages / Netlify / Vercel irányba.** Natív
statikus kiszolgálás, elvileg szebb. **De eltörné a kapcsolati űrlapot.**

A döntő szempont a (B) ellen: a `public/api/contact.php` valódi PHP, és három
dolgot csinál, amit egy statikus hoszt nem tud:

- PHPMailer-rel SMTP-n küld levelet (`public/api/vendor/PHPMailer`)
- a lead-eket CSV-be írja a webgyökéren KÍVÜL (`api/_leads/leads.csv`)
- a hitelesítő adatok a szerveren élnek (`api/config.local.php`), nincsenek és
  nem is lehetnek a repóban

Ezt mind újra kellene írni szerverless függvényként, és a lead-tárolást
máshová tenni. Az önmagában egy projekt, a 17 db űrlapteszttel együtt
(`scripts/verify-form.sh`). Az (A) ennek a kockázatnak a töredékéért hozza a
sebességnyereség nagy részét — és visszafordítható: elég lekapcsolni a
narancssárga felhőt a DNS-rekordon.

## Amit az (A) megvalósításakor tudni kell

1. **A DNS-költözés a kockázatos rész, nem a weboldal.** A domain alatt él az
   `info@brandmuhely.hu`. Az MX-rekordokat, az SPF-et, a DKIM-et és a DMARC-ot
   pontosan át kell vinni, különben a levelezés áll le. Ezt előre írásban ki
   kell gyűjteni a Rackhost DNS-kezelőjéből, és tételesen összevetni utána.
   A levelezés fontosabb, mint a sebesség.

2. **A Cloudflare ingyenes csomagja alapból NEM gyorsítótárazza a HTML-t.**
   Enélkül a költözésnek nincs értelme — minden kérés ugyanúgy a Rackhostig
   megy. Kell egy Cache Rule: „Cache Everything" a HTML-re, Edge TTL-lel.

3. **A `/api/*` útvonalat ki kell venni a gyorsítótárból.** A POST amúgy sem
   gyorsítótárazódik, de egy explicit bypass szabály biztosabb — a
   `config.local.php` és a lead-CSV a Rackhoston marad.

4. **A deploy után üríteni kell a Cloudflare gyorsítótárát**, különben a
   kirakott változás nem látszik. Ezt a `.github/workflows/deploy.yml`-be kell
   beletenni egy lépésként, az SFTP után (Cloudflare API token + zóna-azonosító
   GitHub Secretként — soha nem a repóban).

5. **A `.htaccess` marad és működik.** A 301-ek (`/kepzes` → `/oktatas/`,
   `/ugynokseg` → `/hirdeteskezeles/`), a HTTPS- és a kanonikus-hoszt
   szabályok az origón futnak le, a Cloudflare átengedi őket.

6. **Mérés előtte-utána.** A fenti TTFB-táblázat a kiindulópont. Ha a Cache
   Rule jól áll, a medián tized másodperc alá megy. Ha nem megy le, akkor
   valamit nem gyorsítótáraz — a `cf-cache-status` válaszfejléc (`HIT` /
   `MISS` / `DYNAMIC`) mondja meg, melyiket.

## Mikor térjünk vissza rá

Nem sürgős, és most kifejezetten rossz időzítés lenne: a Google 2026-10-05-én
kezdte el először bejárni az oldalt (addig `noindex` alatt volt). Hagyni kell,
hogy az index felépüljön a mostani, stabil állapotról. Egy DNS-váltás közben
csak zavarná.

Ésszerű visszatérési pont: **amikor a Search Console-ban már megbízható
Core Web Vitals adat van** (kb. 4 hét valódi látogatóforgalom után). Akkor
látszik majd számokban, mennyit ér a váltás — és akkor már nem becslés alapján
döntünk.
