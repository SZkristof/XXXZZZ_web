# E-mail sablonok

HTML levelek, amiket Kristóf küld ki. **Nem részei a weboldalnak** — az
Astro nem fordítja őket, a `public/` alatti képeket viszont használják.

## `oktatas-ajanlat.html` — első tájékoztató jelentkezőknek

### Mielőtt kiküldöd

1. **A logó képe csak deploy után él.** A levél a
   `https://brandmuhely.hu/img/logo-email.png` címre hivatkozik. A fájl a
   `public/img/` alatt van, tehát a következő main-re merge után kerül ki.
   Addig a levélben a logó helyén az „Brandműhely" alt szöveg látszik.
2. **Cseréld ki a `{{KERESZTNEV}}` helyőrzőt.** Egyetlen helyen van, a
   megszólításban. MiniCRM-ből küldve írd át a MiniCRM saját
   összefűző mezőjére; kézzel küldve egyszerűen írd át a névre.

### Amire a szerkesztésnél figyelni kell

Ez e-mail-HTML, nem weboldal. A szabályok mások, és a levelezőkliensek
nem bocsátanak meg:

- **Táblázatos elrendezés, inline stílusok.** A `<style>` blokk media
  query-i csak ráadás — a Gmail webes kliense továbbküldött levélnél kidobja
  a `<style>`-t, az Outlook pedig a media query-ket egyáltalán nem ismeri.
  Ezért minden, ami számít, inline is ott van. Ha módosítasz, mindkét
  helyen tedd meg.
- **Nincs flexbox, grid, `position`.** Az Outlook Word-motorral rajzol.
- **Nincs webfont.** Az arculat Archivo/Hanken Grotesk betűit a kliensek
  nem töltik le, ezért a stack `'Helvetica Neue', Arial` — ez az, ami a
  brand könyv saját tartalékja.
- **SVG nem használható.** A Gmail kiszűri, az Outlook nem rajzolja ki.
  Ezért van a logó PNG-ben (`scripts`-tel renderelve a site SVG-jéből,
  460×54, 5,4 KB).
- **Méretkorlát.** A Gmail a ~102 KB fölötti leveleket levágja és
  „[Message clipped]"-et ír. Ez a fájl **~33 KB**, tehát van hely, de
  képeket base64-ben beágyazni nem szabad.
- **Kép nélkül is működnie kell.** Sok kliens alapból blokkolja a képeket,
  ezért a levélben egyetlen kép van (a logó), minden más — a kártyák, a
  szalagok, az árak — háttérszínnel és szöveggel készül.

### Ellenőrizve

- 390 px és 800 px szélességen nincs vízszintes görgetés
- minden szöveg/háttér páros átmegy a WCAG AA-n (a leggyengébb 5,19:1,
  a fekete szöveg a terrakotta kártyán)
- a színek a brand könyvből: terracotta-500 és blue-500 **csak kitöltés**,
  soha nem betűszín; a kiemelt kártyán terrakotta alapon fekete típus,
  ahogy a „coaching" mód előírja

### Az árak forrása

A három csomag adata a `src/data/site.ts` `packages` tömbjével egyezik
(35 000 / 140 000 / 245 000 Ft). **Ha az oldalon változik az ár, ezt a
fájlt kézzel kell utánahúzni** — a levél nem a `site.ts`-ből épül.
