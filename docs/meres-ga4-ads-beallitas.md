# GA4 kulcsesemények és Google Ads konverzió — lépésről lépésre

> Állapot: **2026-10-11.** A menünevek a Google saját súgójából, aznapi
> állapotban — a GA4 és az Ads felülete gyakran átnevez dolgokat, és 2024-ben
> pont ez a része változott („konverzió" → „kulcsesemény").
>
> A menüneveket magyarul írom, zárójelben az angol eredetivel, mert a felület
> nyelvétől függ, melyiket látod.
>
> **Ami a Google doksijából van, és ami az én javaslatom, az külön jelölve.**
> Az attribúciós modellre és a konverziós ablakra a Google nem ad ajánlást —
> ott az én szakmai véleményem áll, és annak látszik.

Kiindulás: a GTM-konténer (`GTM-W9P4TKMB`) publikálva, benne GA4
`G-M72H36LQNJ`, és három esemény megy a GA4-be: `generate_lead`,
`book_appointment`, `cta_click`. A `cta_click` szándékosan nem lesz konverzió.

---

# ELŐBB EZT OLVASD EL — ügynökségi fiók csapdája

A Google Ads-fiókod összekötésénél **a saját hirdetési fiókodhoz kösd a GA4-et,
NE az ügyfélkezelő (manager / MCC) fiókhoz.** Két ok, mindkettő a Google saját
dokumentációjából:

1. **Auto-tagging.** Ha a kapcsolat létrehozásakor bekapcsolod az auto-tagginget
   egy manager-fiókon, az a Google szerint bekapcsol *„all Google Ads accounts
   directly linked to the manager account"* — vagyis **minden közvetlenül
   alatta lévő ügyfélfiókon.** Az ügyfeleid fiókjain nem a te dolgod ezt
   átállítani, és nem is biztos, hogy észrevennék, miért változott meg a
   mérésük.

2. **Adatlátás.** Manager-fiókra kötve: *„any data that you import from
   Analytics will be available to all of your client accounts."* Vagyis a saját
   weboldalad Analytics-adata elérhetővé válna az ügyfélfiókokban.

Szóval: **saját Ads-fiók, saját GA4 property.** Ha nincs még saját hirdetési
fiókod a Brandműhelynek, azt hozd létre előbb — ez amúgy is kell ahhoz, hogy
magadat hirdesd.

---

# „A" rész — GA4: a két kulcsesemény

## A0. Előbb nézd meg, nem-e már ott van

**Adminisztráció** (Admin) → **Adatmegjelenítés** (Data display) →
**Események** (Events).

Fülek: **Legutóbbi események** (Recent events) · **Kulcsesemények**
(Key events) · és a *Custom configurations* alatt **Egyéni események**
(Custom events).

Keresd a `generate_lead` és a `book_appointment` sort a „Legutóbbi események"
fülön. **Jó esély van rá, hogy már ott vannak** — amikor a GTM Preview-ban
teszteltél, azok a tagek valódi adatot küldtek a GA4-be.

## A1. Ha ott vannak: csillag, és kész

A sor jobb szélén a **csillag ikon** — ez a megjelölés kulcseseményként.
Kattints rá a `generate_lead` és a `book_appointment` sorban.

**A `cta_click`-et NE csillagozd.** Az mikrokonverzió. Ha kulcsesemény lesz,
és később bekerül az Ads-be, egy CTA-kattintás ugyanannyit fog nyomni a
licitálásnál, mint egy valódi ajánlatkérés — az algoritmus a kattintásra fog
optimalizálni, nem a megkeresésre. Riportban kulcsesemény nélkül is látod.

## A2. Ha nincsenek ott — javaslat: csinálj tesztkonverziót, aztán csillagozd

**Miért így:** egy kulcsesemény, ami soha nem tüzelt, semmit nem bizonyít. Ha
a mérés rossz, azt most akarod megtudni, nem akkor, amikor már költesz.

**És nem kell se űrlapot kitölteni, se foglalást csinálni.** Nyisd meg a
`brandmuhely.hu`-t, **fogadd el a sütiket**, aztán F12 → Console:

```js
dataLayer.push({ event: 'form_submit',      event_id: 'teszt-lead-1' });
dataLayer.push({ event: 'booking_complete', event_id: 'teszt-foglalas-1' });
```

A GTM triggereit nem érdekli, honnan jött a push — pontosan úgy tüzelnek, mint
éles helyzetben. A süti-elfogadás azért kell, mert a Meta-tagek `ad_storage`
nélkül szándékosan nem tüzelnek.

**Miért nem az oldalon tesztelsz:** a `form_submit` csak sikeres szerverválasz
után tüzel (`res.ok && data.ok`), vagyis egy valódi küldés **e-mailt küld neked
és beírja a leadet a CSV-be**; a `booking_complete` a Cal.com
`bookingSuccessful` eseményére fut, tehát **valódi foglalást csinál a
naptáradban**, amit le kell mondanod.

Ellenőrzés: **Jelentések → Valós idejű** (Realtime) → *„Esemény szám esemény
neve szerint"* kártya. Pár percen belül ott a `generate_lead` és a
`book_appointment`. Amint megjelennek a „Legutóbbi események" fülön, csillagozd.

## A3. Vagy: vedd fel előre, név alapján

A Google kimondja, hogy ez működik: *„New events … might not show up right
away, but you can still mark them as key events ahead of time."*

1. **Adminisztráció → Adatmegjelenítés → Események**
2. **+ Esemény létrehozása** (+ Create event) — *ha nem látod a gombot, nincs
   hozzá jogosultságod*
3. **Esemény neve** (Event name): `generate_lead`
4. **Megjelölés kulcseseményként** (Mark as key event) → be
5. **Itt a buktató:** a *Choose how to create an event* kérdésnél
   **„Create with code"**. A **„Create without code" NEM jó** — az egy *másik*
   eseményből származtatna újat, vagyis megduplázná azt, amit a GTM már küld.
   Nálad a kód (a GTM) megvan, csak a nevet jelented be.
6. **Alapértelmezett kulcsesemény-érték** (Default key event value): hagyd
   üresen — nem küldünk értéket az eseménnyel.
7. **Számlálási módszer** (Counting method): hagyd alapértelmezetten
   („Once per event").
8. **Létrehozás** (Create)

Ugyanez `book_appointment`-tel.

## A4. Amit tudni kell

| | |
|---|---|
| **Jogosultság** | A Google oldala **önmagával ellentmond**: létező esemény csillagozásához „Editor or above", új esemény felvételéhez „Marketer or above", egy harmadik helyen „Viewer or above". Adminisztrátort egyik sem kér. Mivel te hoztad létre a property-t, ez nálad nem kérdés. |
| **Visszamenőleg nem hat** | *„Marking an event as a key event affects reports from time of creation. It doesn't change historic data."* A csillagozás előtti adat nem lesz utólag konverzió. Ezért most érdemes, nem a hirdetés indításakor. |
| **Mennyi idő** | Valós időben **pár perc**, normál riportokban **akár 24 óra**. |
| **Limit** | 30 kulcsesemény standard property-n. Kettőt használsz. |

## A5. Amit NE

- **Ne csillagozd a `cta_click`-et.**
- **Ne hozz létre „Create without code" eseményt** `generate_lead` névre.
- **Ne vedd fel a `form_submit` / `booking_complete` nevet kulcseseményként.**
  Azok a *dataLayer* eseménynevei a GTM-ben; a GA4 felé már `generate_lead` és
  `book_appointment` néven mennek. A `form_submit` a GA4-ben meg sem jelenik.

---

# „B" rész — Google Ads: a konverzió

## B0. Előfeltételek

A Google szerint ehhez kell:
- a GA4 és az Ads **összekötve** (B1)
- **auto-tagging bekapcsolva** az Ads-fiókban
- GA4-ben **adminisztrátor vagy szerkesztő** a property-n
- az importáláshoz **legalább „Marketer" szint**
- Ads-ben **adminisztrátori hozzáférés**

## B1. Összekötés — ez a GA4-ben történik

**Adminisztráció** (Admin) → **Termékkapcsolatok** (Product links) →
**Google Ads-kapcsolatok** (Google Ads links)

1. **Kapcsolás** (Link)
2. **Google Ads-fiókok kiválasztása** (Choose Google Ads accounts) → **a SAJÁT
   fiókod**, nem a manager (lásd a dokumentum elején)
3. **Megerősítés** (Confirm) → **Tovább** (Next)
4. **Enable Personalized Advertising** — *a Google szerint alapból be van
   kapcsolva.* Hagyd be, ha remarketingezni is akarsz. Lásd viszont B5-öt: ez
   mellékhatással jár.
5. **Enable Auto-Tagging** — nyisd ki és kapcsold be. **Csak a saját fiókodon**
   (manager-fiókon minden alatta lévő ügyfélfiókra kiterjedne).
6. **Tovább** (Next) → átnézed → **Beküldés** (Submit)

Az Ads→GA4 irányú adat a Google szerint **48 órán belül** jelenik meg a
riportokban. (A másik irányra, vagyis hogy az importált konverzió mikor kezd
adatot mutatni az Ads-ben, **a dokumentáció nem ad számot** — nem is találok ki
egyet.)

## B2. A konverzió létrehozása — ITT PONTOSÍTÁS

Korábban azt írtam, hogy ez az Ads-ben történik (*Célok → Konverziók →
Összefoglaló → Új konverziós művelet → Importálás*). **A Google súgója ma már
nem ezt dokumentálja**, hanem egy **GA4-ben** futó folyamatot. Az Ads-oldali
importálás varázsló a felületen továbbra is ott van, de a vonatkozó súgóoldalak
nem írják le — tehát ezt próbáld előbb:

**GA4-ben: Reklám** (Advertising) → *Tools* → **Konverziókezelés**
(Conversion management)

1. **Új konverzió** (New conversion) → **Tovább** (Next)
2. Válaszd ki az Ads-fiókot, amelyikben a konverzió létrejön
3. Válaszd ki a `generate_lead` és a `book_appointment` kulcseseményt
   — *figyelem: amit itt az „Events" szekcióból választasz, az a Google szerint
   automatikusan kulcseseménnyé lesz jelölve a GA4-ben is*
4. Ha kérdezi, add meg a **Conversion category**-t
5. **Tovább** → átnézed → **Mentés** (Save)

**Fontos fenntartás, szó szerint a Google oldaláról:** *„This feature may not
be available to your Google Analytics property."* Ha nem találod a
Konverziókezelést, akkor az Ads-oldali importálás varázslót keresd:
**Célok** (Goals) → **Konverziók** (Conversions) → **Összefoglaló** (Summary) →
új konverziós művelet → importálás Google Analytics 4 property-ből.

## B3. A CSAPDA: alapból „secondary", vagyis nem licitál rá

Ez a legfontosabb pont az egész dokumentumban.

A GA4-ből létrehozott konverziók **alapértelmezésben „secondary" (másodlagos)
műveletek.** A Google szerint: *„secondary actions are for observation only"* —
az „All conversions" oszlopban látszanak, de **a licitálásnál nem számítanak.**

Vagyis ha itt megállsz, **minden be lesz kötve, az adat meg is jön, és az
algoritmus mégsem fog konverzióra optimalizálni.** Pontosan az a helyzet, amit
el akartunk kerülni.

**Át kell állítani elsődlegesre, és ez CSAK az Ads-ben lehetséges** (a Google
kimondja: *„can only be updated to primary in Google Ads"*):

**Google Ads → Célok** (Goals) → **Konverziók** (Conversions) →
**Összefoglaló** (Summary) → megkeresed a célt → **Cél szerkesztése**
(Edit goal) → *Conversion action optimization* szekció → **Elsődleges**
(Primary) → **Mentés** (Save)

Mindkettőnél: `generate_lead` → Primary, `book_appointment` → Primary.

*Miért secondary alapból: a Google szerint azért, hogy ne számolja kétszer
ugyanazt az eseményt a licitálásnál, ha a fiókban már van Analytics-property-ből
származó cél. Nálad nincs, tehát át lehet állítani.*

## B4. „Count": állítsd „One"-ra

A **Count** beállítás azt mondja meg, egy hirdetéskattintás után hány
konverziót számol.

A Google ajánlása lead-generálásra **egyértelmű**: **„One conversion"** —
*„a good choice if you're not interested in the number of sales, but instead
whether or not a certain kind of lead was generated"*, mert egy
hirdetéskattintásból normál esetben csak egy egyedi lead ér értéket.

**És ezt át kell állítani**, mert az importált konverziós műveleteknél az
alapértelmezés a Google szerint **„Every conversion"**.

**Ads → Célok → Konverziók → Összefoglaló** → rákattintasz a konverziós művelet
nevére → **Beállítások szerkesztése** (Edit settings) → **Count** → **One** →
**Mentés** → **Kész**

## B5. Amit a linkelés után érdemes visszanézni

A Google szerint, ha az **Enable Personalized Advertising** be van kapcsolva és
van összekötött Ads-fiók, a GA4 **magától kulcseseménnyé jelöli** ezeket:
`add_to_cart`, `add_to_wishlist`, `begin_checkout`, **`session_start`**,
`view_item`, `view_item_list`, `view_search_results`.

Neked ezek közül **egyik sem értelmes konverzió** — nincs webshopod, és a
`session_start` szó szerint annyit jelent, hogy „valaki megnyitotta az oldalt".
Nézd meg a **Kulcsesemények** fülön a linkelés után, és **semmiképp ne engedd,
hogy ezek bekerüljenek az Ads-be konverzióként.** Ha mégis bekerülnének,
állítsd őket „Secondary"-ra az Ads-ben.

## B6. Konverziós ablak és attribúció — itt nincs Google-ajánlás

**A Google egyik vonatkozó oldala sem ajánl attribúciós modellt vagy
konverziós ablakot lead-generálásra.** Ezért az alábbi **az én szakmai
javaslatom**, nem hivatkozás:

| beállítás | javaslat | miért |
|---|---|---|
| **Click-through conversion window** | hagyd a 30 napos alapértelmezésen, és ha azt látod, hogy sokan 1 hónap után foglalnak, vidd 60-ra | a 125–250 e Ft/hó szolgáltatásnál a döntés hetekig érik; a Google annyit mond, hogy *„windows of at least 7 days are recommended"* |
| **Attribúciós modell** | hagyd az Ads mai alapértelmezésén (adatvezérelt) | kevés konverziónál a modellválasztás amúgy is alig tér el a last-clicktől; nem itt van a nyereség |
| **Channel eligibility** | **Google Paid Channels** (ez 2023 júniusa óta az alapértelmezés új kapcsolatnál) | ha „Paid and organic channels"-re állítod, akkor a Google szerint a **Count** és a konverziós ablak **csak a GA4-ben** állítható, az Ads-ben nem — ez később bezavar |

## B7. Türelem a licitálással

A Google **7–14 napos tanulási fázist** ír a Smart Biddingnél, és azt, hogy
alatta ne nyúlkálj a költségkeretbe, a CPA/ROAS célokhoz és a konverziós
célokhoz, mert a tanulási ablak újraindul.

Tehát: állítsd be egyszer, rendesen, aztán **két hétig ne javítsd meg.**

---

# Ellenőrzőlista

- [ ] GA4: `generate_lead` kulcsesemény ⭐
- [ ] GA4: `book_appointment` kulcsesemény ⭐
- [ ] GA4: `cta_click` **nem** kulcsesemény
- [ ] Saját (nem manager) Ads-fiók kötve a GA4-hez
- [ ] Auto-tagging be, **csak** a saját fiókon
- [ ] Két konverzió létrehozva az Ads-ben
- [ ] Mindkettő **Primary**-ra állítva (ez külön lépés, és ez marad le)
- [ ] Mindkettő **Count = One**
- [ ] A „Kulcsesemények" fül átnézve: nem jött-e be `session_start` és társai
- [ ] Két hétig nem nyúlok hozzá

---

## Mi marad nálam

- A `cta_click` ma a CTA-kattintások kb. tizedét látja: a `data-track`
  attribútum csak a `sticky-cta` és a `footer-cta` elemen van kint, miközben
  **18 link mutat a `/kapcsolat`-ra**. A GA4-ben az fog kirajzolódni, hogy a
  hero CTA-ra senki nem kattint — ez félrevezető adat, nem hiányzó.
  Kijavítható GTM-módosítás nélkül: a meglévő `DLV - cta_id` változó és a
  `CE - cta_click` trigger a többi linket is elkapja, csak nevet kell adni
  nekik.
- Meta Conversions API a `contact.php`-ból, ha kéred.
- Ha nem a GA4-importálást választod, hanem külön Google Ads konverziótagot a
  GTM-ben: megírom a tag-lépéseket. Akkor viszont a kettőt soha nem egyszerre,
  mert duplán számolna.
