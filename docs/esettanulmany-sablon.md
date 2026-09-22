# Esettanulmány-sablon

Ez a fájl azt mondja meg, **mit kell összegyűjtened** egy esettanulmányhoz, és
hova kerül az oldalon. Nem generált fájl — ezt nyugodtan szerkeszd.

> **Miért nem töltöttem ki lorem ipsummal az éles oldalt.** Kitalált
> ügyféleredményt Magyarországon nem lehet közzétenni: az Fttv. szerint
> megtévesztő kereskedelmi gyakorlat, és a GVH bírságolja. A projektben
> emiatt van egy `PROOF_IS_PLACEHOLDER` kapcsoló, ami leállítja az éles
> buildet, ha kamu adat kerülne ki. A szerkezet viszont kész és vár — amint
> megvan az adat, tíz percbe telik betenni.

---

## Amit egy esettanulmányhoz össze kell szedned

Hat mező. Ennyi elég, és ennél több nem fér el olvashatóan egy kártyán.

| Mező | Mit írj bele | Példa (a meglévő valódi esetből) |
|---|---|---|
| **Iparág** | Iparág, soha nem cégnév — kivéve ha írásban hozzájárult | `Webshop · Sport` |
| **Platform** | Mivel dolgoztunk | `Facebook és Google hirdetéskezelés` |
| **Mutató** | MI javult. Egy mutató, nem három | `Black Friday bevétel` |
| **Honnan** | Kiinduló érték. Elhagyható, ha egyszeri szám | `3 500 Ft / vásárlás` |
| **Hova** | A kártya nagy száma | `18 millió Ft` |
| **Mennyi idő** | Időtáv vagy feltétel | `1 nap` · `napi 700 Ft keretből` |
| **Magyarázat** | 1–2 mondat: mit csináltunk, amitől ez lett | „Black Friday és karácsonyi akciók kampánykezelésére kértek fel…" |

**Ami nélkül nem tehetem ki:** honnan jön a szám (képernyőkép a fiókból elég
nekem, nem kerül ki), és hogy az ügyfél hozzájárult-e, ha felismerhető lenne.

---

## Ha részletesebb esettanulmányt írsz

Ha egy-egy esetet hosszabban kibontanál, ez a váz működik — ugyanaz, ami az
ügynökségi oldalon is:

1. **A kiinduló helyzet.** Mi volt, mielőtt elkezdtétek. Számokkal, ha van.
2. **A probléma.** Mi nem működött, és miért. Ez a legfontosabb rész — itt
   ismer magára az olvasó.
3. **Mit csináltál.** Konkrétan. „Optimalizáltuk a kampányt" semmit nem mond;
   „kikapcsoltuk az Advantage+-t és külön kampányt vittünk a meglévő
   vásárlókra" mond valamit.
4. **Az eredmény.** Szám, időtáv, és hogy mihez képest.
5. **Mi volt a fordulópont.** Egy mondat arról, mi hozta a változást. Ez az,
   amit a versenytársak sosem írnak le, és ettől hiteles.

Egy ilyen hosszabb eset kaphat saját aloldalt is (`/eredmenyek/<slug>`), ha
lesz belőle 3–4. Szólj, és megépítem.

---

## Hol jelennek meg

| Hol | Mi jelenik meg | Megjegyzés |
|---|---|---|
| Főoldal → Eredmények | Minden eset, fél szerint szűrés nélkül | 4 esetnél kettesével áll |
| `/ugynokseg` | **Csak** a hirdetéskezelési esetek | Most 1 db |
| `/eredmenyek` | Minden eset | |

Minden eset meg van jelölve, melyik félhez tartozik (`half: 'kepzes'` vagy
`'ugynokseg'`) — ezért nem érvel az ügynökségi oldal képzési számokkal.

**Jelenleg 1 hirdetéskezelési és 3 képzési eset van.** Az ügynökségi oldal
legerősebb szekciója ezért most a leggyengébb.

---

## Hova kerül a kódban

`src/data/proof.ts` → `results` tömb. Egy új bejegyzés így néz ki:

```ts
{
  half: 'ugynokseg',              // vagy 'kepzes'
  industry: 'Webshop · Divat',
  platform: 'Meta Ads',
  metric: 'ROAS',
  from: '1,8',                    // elhagyható
  to: '4,2',
  timeframe: '3 hónap',           // "alatt" automatikusan kerül mögé,
                                  // ha számmal kezdődik
  note: 'Külön kampány a meglévő vásárlókra, és a katalógus feedet rendbe tettük.',
}
```
