# Ami még hátravan

> Állapot: 2026-10-05. A kódból ellenőrizve, nem emlékezetből. Ahol „élesben
> ellenőrizve" szerepel, ott a brandmuhely.hu tényleges válaszát néztem meg.

A fontossági sorrend fentről lefelé. Az első két tétel az, ami ma pénzbe vagy
kockázatba kerül; a többi javítás.

---

## 1. Nincs semmilyen mérés kint — ez a legnagyobb hiány

**Élesben ellenőrizve: a brandmuhely.hu egyetlen mérőkódot sem tölt be.**
Se Google Analytics, se GTM-konténer, se Meta Pixel.

Ez azt jelenti, hogy jelenleg **nem tudod, hány látogatód van, honnan jönnek,
és melyik oldalról lesz megkeresés.** Ha hirdetni kezdesz, a Google és a Meta
sem fog konverziót látni — vagyis az algoritmus vakon optimalizál, ami pont az,
amit az ügyfeleidnek nem engedsz meg.

**A kód készen áll, csak be kell kapcsolni.** A `src/components/Analytics.astro`
Consent Mode v2-vel, EU-megfelelően van megírva: alapból minden tiltott, és csak
a süti-elfogadás után kapcsol. Az események is pusholódnak már a `dataLayer`-be
(`cta_click`, `booking_complete`, űrlapküldés) — csak nincs, ami fogadja őket.

**Amit tenned kell** (GitHub → repo → Settings → Secrets and variables →
Actions → Variables, ugyanott, ahol a `SITE_ENV`-et állítottad):

| változó | érték | megjegyzés |
|---|---|---|
| `PUBLIC_GTM_ID` | `GTM-XXXXXXX` | **ezt javaslom** — a GA4-et, a Google Ads-et és a Meta Pixelt utána a GTM felületén kezeled, kódmódosítás nélkül |

Ha nem akarsz GTM-et, akkor helyette külön-külön:
`PUBLIC_GA4_ID`, `PUBLIC_GOOGLE_ADS_ID`, `PUBLIC_META_PIXEL_ID`.
**A kettőt soha ne egyszerre** — minden konverziót duplán számolna.

Utána egy deploy, és szólj: leellenőrzöm élesben, hogy a consent előtt tényleg
nem tölt be semmit, utána viszont igen.

---

## 2. Az ÁSZF nem fedi le a hirdetéskezelést

Az ÁSZF tíz pontja **kizárólag az oktatásról szól**, sőt a 2. pont kifejezetten
kimondja: *„A szolgáltatás oktatás és szaktanácsadás, **nem hirdetéskezelés**."*

Közben a `/hirdeteskezeles` oldalon egy **havi 125 000 / 250 000 Ft-os,
két hónapos felmondási idejű** szolgáltatást árulsz, aminek nincs se ÁSZF-
fejezete, se szerződésmintája a site-on. A weboldal ígér valamit, amit semmilyen
dokumentum nem támaszt alá.

Amit fednie kellene: a havi díj és a számlázás rendje, a két hónapos felmondás,
kinek a tulajdonában marad a hirdetési fiók és az adat, mi van benne és mi nincs
(ez a lista már megvan az oldalon), a hirdetési költés elkülönítése, titoktartás,
felelősség (különösen: nem ígérsz eredményt).

**Én meg tudom írni a vázat** a már kint lévő feltételekből — de utána nézesd át
jogásszal. Szólj, ha nekiálljak.

---

## 3. Hiányzó kép: a megosztási előnézet

`/img/og-default.jpg` — **a kód hivatkozik rá, a fájl nem létezik. Élesben 404.**

Ez az a kép, ami akkor jelenik meg, ha valaki Facebookon, LinkedInen vagy
Messengerben megosztja az oldalad linkjét. Most nincs előnézet, vagy a platform
választ magának valamit. Facebook-hirdetési szakértőnél ez kínos.

Kell: **1200 × 630 px JPG**, a `public/img/og-default.jpg` néven. Ha Jay
arculati könyvéhez illőt szeretnél, szólj — össze tudom rakni a meglévő
elemekből (logó, terrakotta alap, állítás), vagy küldj sajátot.

*Mellékszál: a linkellenőrzőm ezt nem fogta meg, mert csak a `href`/`src`
attribútumokat nézi, az `og:image` meta taget nem. Ezt kijavítom — ugyanaz a
hiba, mint a kontrasztellenőrzőnél: amit nem ellenőriz semmi, az elromlik.*

---

## 4. Bizonyítékok — itt a legnagyobb a tartalmi hiány

| mi | mennyi van | mi hiányzik |
|---|---|---|
| Vélemények | **2 db, mindkettő oktatás** | **Hirdetéskezelésre nulla.** Az ügynökségi oldalon egyetlen ügyfélszó sincs. |
| Eredmények | 4 oktatás + 3 hirdetéskezelés | Több hirdetéskezelési eset |
| Logók | 6 nagyvállalat (/rolam) | — |

A hirdetéskezelés a drágább szolgáltatásod, és ott van a legkevesebb bizonyíték.
Egyetlen jó ügyfélvélemény többet ér, mint bármilyen szövegezés.

A `docs/esettanulmany-sablon.md` megmondja, milyen formában kell bekérni, és mi
kell hozzá jogilag (**írásos hozzájárulás** — kitalált vagy engedély nélküli
vélemény Magyarországon jogszabálysértő, Fttv./GVH).

---

## 5. A tananyagokat szakmailag át kell nézned

Az öt kurzusoldalhoz (`/oktatas/...`) én írtam tematikavázlatot:
Facebook, Google Ads, LinkedIn, TikTok, Google Analytics.

**Ez az én szakmai feltételezésem arról, mit tanítasz — nem a te tananyagod.**
Olvasd végig, és ahol nem stimmel, jelöld meg. A szövegek a
`src/data/site.ts` → `courses` tömbben vannak, de ha kérsz, generálok belőle
szerkeszthető md-fájlt, mint a többi oldalnál.

---

## 6. Cal.com minősítő kérdések

Megbeszéltük, hogy a 30 perces konzultáció foglalásakor négy kérdést érdemes
feltenni, hogy felkészülten ülj le (mivel foglalkozik, mennyit költ most
hirdetésre, mi a cél, hirdetett-e már). **Ezt a Cal.com saját felületén neked
kell beállítanod**, a weboldalról nem vezérelhető.

---

## 7. Blog: 2 bejegyzés

`google-ads-pmax-mire-figyelj` és `meta-koltsegkeret-kis-budget`.

Nem hiba, de a blog az a felület, ami hosszú távon hozza az organikus
forgalmat. Ha tartod a havi 1-2 írást, fél év alatt érezhető lesz. A technikai
része kész (RSS, strukturált adat, a design megvan) — csak írni kell.

---

## 8. Technikai apróságok

- **DMARC** — jelenleg `p=none`, ami csak megfigyel, nem véd. A levelezés
  rendben van (minden ellenőrzés átmegy), tehát léphetünk: `p=quarantine`,
  majd 2-4 hét múlva `p=reject`. Ez DNS-módosítás, neked kell.
- **Régi WordPress-URL-ek** — a Search Console mutatta, hogy a Google emlékszik
  `/category/egyeb/feed/` és `/courses/...` típusú címekre, amik most 404-ek.
  Amint megjelenik a „Nem található" lista, küldd el, és megírom a 301-eket.
- **Cloudflare** — elnapolva, lásd `docs/tarhely-cloudflare.md`. Visszatérés
  kb. 4 hét múlva, amikor lesz valódi Core Web Vitals adat.
- **Az og:image ellenőrzése** a linkellenőrzőben — lásd a 3. pontot.

---

## Amit én tudok elvinni, ha szólsz

1. ÁSZF-fejezet a hirdetéskezelésre (váz, utána jogász)
2. OG-megosztókép az arculat alapján
3. A kurzustematikák szerkeszthető md-ben
4. A linkellenőrző kiterjesztése az og:image-re
5. 301-ek a régi WordPress-címekre (ha megjön a lista)
6. A mérés élesben ellenőrzése, miután beállítottad a GTM-azonosítót

## Amit csak te tudsz megcsinálni

1. `PUBLIC_GTM_ID` beállítása (1. pont) — **ez a legsürgősebb**
2. OG-kép, ha sajátot szeretnél
3. Hirdetéskezelési ügyfélvélemények bekérése, írásos hozzájárulással
4. A tananyagok szakmai átnézése
5. Cal.com kérdések
6. DMARC DNS-rekord
7. ÁSZF jogi jóváhagyatása
