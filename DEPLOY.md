# Élesítés

A `brandmuhely.hu` jelenleg egy WordPress oldalt szolgál ki az egyik
tárhelycsomagon. Az új oldal **egy másik, üres csomagra** kerül, és csak akkor
váltunk át, amikor már éles körülmények között kipróbáltuk.

---

## Miért így, és nem a WordPress fölé

Van egy második, **teljesen üres** csomagod (*Tárhely Mini 2 GB* — 0 domain,
0% felhasználva), és ezen **van SSH**. Ez három dolgot jelent:

- **Nem kell törölni semmit.** A régi oldal fut tovább, amíg az új el nem
  készül. Nincs visszafordíthatatlan lépés.
- **SFTP-vel tudunk feltölteni**, nem sima FTP-vel — a jelszó nem utazik
  titkosítatlanul a hálózaton.
- **Élesben tudjuk tesztelni** egy ideiglenes aldomainen, mielőtt bárki látná:
  a Cal.com naptárat, az űrlapot, az SSL-t, a sütisávot, a mérést.

A váltás így nem egy „töröljük és reméljük" pillanat, hanem egy átkapcsolás,
ami egy perc alatt visszafordítható.

---

## 1. Az üres csomag előkészítése

A Rackhost panelen, a *Tárhely Mini 2 GB* csomagnál:

### a) SSH bekapcsolása

Nyisd meg az **SSH** fület. Ott találod a **kiszolgáló nevét, a portot és a
felhasználónevet**. Ha van lehetőség **SSH kulcs** feltöltésére, azt használjuk
jelszó helyett — lásd 3. pont.

### b) A domain átvitele

A `brandmuhely.hu`-ra jelenleg senki nem érkezik és nincs rá hirdetés, ezért
nem kell teszt-aldomaint használni: rögtön az éles domainre telepítünk, csak
**indexelés nélkül**, amíg el nem készül minden.

1. A **régi** (WordPress) csomagról vedd le a `brandmuhely.hu` domaint.
2. Ezen a csomagon: **Domain** fül → *Domain hozzáadása* → `brandmuhely.hu`
   (és a `www` alias, ha külön kéri).
3. A **DNS zónák** menüben ellenőrizd, hogy az **A rekord** ennek a csomagnak
   az IP-címére mutat (a Domain fül *IP CÍM* oszlopa).
4. **Az MX rekordokhoz ne nyúlj** — azok a Google Workspace-re mutatnak, és a
   leveleződ ezeken múlik.

> A régi WordPress csomag érintetlen marad. Ha bármi gond van, a domaint
> egyetlen lépéssel visszateheted rá.

### c) HTTPS

A **Domain** fül *HTTPS* oszlopában kapcsold be a Let's Encrypt tanúsítványt.
Tanúsítvány nélkül a böngésző figyelmeztetni fog — egy hirdetésekkel foglalkozó
oldalnál ez azonnali hitelvesztés.

### d) PHP verzió

**Kész:** a csomag PHP 8.5-öt futtat, ami bőven megfelel. (Az űrlapkezelő
7.4-től felfelé elindul, és ha valaha túl régi verzióra váltana a beállítás,
nem néma hibával dől el, hanem kiírja, mit kell átállítani.)

### e) A csomag adatai — rögzítve

| | |
| --- | --- |
| Csomag | #64955 · Tárhely Mini |
| SSH kiszolgáló | `wh22.rackhost.hu` |
| SSH felhasználó | `c93146deploy` |
| Webgyökér | `web/brandmuhely.hu` |
| IP | `91.227.139.69` |
| PHP | 8.5 ✓ |

> Ha a deploy „no such directory" hibával áll le, próbáld a `DEPLOY_REMOTE_PATH`
> értékét `/web/brandmuhely.hu`-ra (perjellel) — attól függ, hova lép be az
> SSH felhasználó.

---

## 2. Feltöltés

### Automatikusan (ajánlott)

GitHub → *Settings → Secrets and variables → Actions*.

**Variables:**

| Név | Érték |
| --- | --- |
| `DEPLOY_PROTOCOL` | `sftp` |
| `SITE_ENV` | `staging` a teszt alatt, `production` élesítéskor |

**Secrets** (ezeket te töltöd ki, nekem soha ne küldd el őket):

| Név | Érték |
| --- | --- |
| `DEPLOY_HOST` | `wh22.rackhost.hu` |
| `DEPLOY_USER` | `c93146deploy` |
| `DEPLOY_SSH_KEY` | a privát kulcs tartalma (ha kulcsot használsz) |
| `DEPLOY_PASSWORD` | jelszó (csak ha nincs kulcs) |
| `DEPLOY_PORT` | általában `22` |
| `DEPLOY_REMOTE_PATH` | `web/brandmuhely.hu` |

Ezután a `main` branchre pusholva a GitHub Actions buildel, lefuttatja mind a
30+ ellenőrzést, és feltölt.

### SSH kulcs készítése (biztonságosabb, mint a jelszó)

A saját gépeden:

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/brandmuhely_deploy
```

- A **publikus** kulcsot (`brandmuhely_deploy.pub`) töltsd fel a Rackhost SSH
  fülére.
- A **privát** kulcsot (`brandmuhely_deploy`, kiterjesztés nélkül) másold be
  teljes egészében a `DEPLOY_SSH_KEY` secretbe.
- A privát kulcsot soha ne küldd el senkinek, és ne tedd be a repóba.

### Kézzel

```bash
npm run build:prod
```

A `dist/` mappa **tartalmát** töltsd fel a webgyökérbe (ne magát a `dist` mappát).

---

## 3. Szerveroldali beállítás (egyszer)

A feltöltés után, a szerveren:

```
api/config.local.example.php  →  másold  →  api/config.local.php
```

**Ebben az egy lépésben dől el, hogy megkapod-e az űrlapos üzeneteket.**

### Miért kell SMTP?

A `brandmuhely.hu` levelezése **Google Workspace**-en van, ezért a domain SPF
rekordja a Google-t hatalmazza fel arra, hogy `@brandmuhely.hu` címről küldjön —
a Rackhostot nem. Ha a PHP a Rackhost szerveréről küldene, a levél elbukna az
SPF-en, és jellemzően spambe kerülne vagy elveszne. Ezért az űrlap a Google
saját SMTP-jén küld.

**Google App Password:**

1. Kapcsold be a 2-lépcsős azonosítást az `info@brandmuhely.hu` fiókon
2. https://myaccount.google.com/apppasswords
3. A kapott 16 karaktert írd az `smtp_pass` mezőbe

Ha az SMTP nincs beállítva, a rendszer visszaesik a sima `mail()` küldésre — és
minden üzenet bekerül egy CSV fájlba is, így akkor sem veszik el érdeklődő, ha a
levél nem érkezik meg.

A CSV elsődlegesen a webgyökér **fölé** kerül (`_private/leads.csv`). Ha a
tárhely `open_basedir`-rel a webgyökérbe zárja a PHP-t — osztott tárhelyen
gyakori —, automatikusan az `api/_leads/` mappába esik vissza, amibe a rendszer
`Require all denied` őrfájlt is tesz. Mindkét útvonalat teszt fedi.

> A deploy **soha nem törli** ezeket: az `api/_leads/**` és az
> `api/config.local.php` ki van zárva a szinkronból.

---

## 4. Tesztelés az éles domainen, indexelés nélkül

A `SITE_ENV` repository variable **alapértelmezésben `staging`**, ezért az
oldal már kint van, de:

- minden oldal `noindex, nofollow` fejlécet kap,
- a `robots.txt` `Disallow: /`-t ad vissza, sitemap nélkül,
- és a build elfogadja a még kitöltetlen (placeholder) véleményeket.

Így nyugodtan nézegethető és mutogatható, de a Google nem indexeli, és nem
kerülnek kitalált vélemények a keresőbe.

Ellenőrizd élesben:

- [ ] `https://brandmuhely.hu` betölt, lakat ikon látszik
- [ ] Mobilon is rendben néz ki
- [ ] `/kapcsolat` — a Cal.com naptár betölt
- [ ] **Küldj egy teszt üzenetet az űrlapon → megérkezik a levél?** (a spam
      mappát is nézd meg)
- [ ] A sütisáv megjelenik, és a „Csak a szükségeseket" gomb működik
- [ ] `/nemletezo-oldal` → a saját 404 oldalunk jön
- [ ] `/kepzes`, `/ugynokseg`, `/arak`, `/blog` mind elérhető
- [ ] **A levelezés változatlanul működik** (küldj magadnak egy e-mailt)

## 5. Élesítés (indexelés bekapcsolása)

Csak akkor, ha a 4. pont minden sora kipipálva **és** megvannak a valós
vélemények, eredmények és fotók.

1. Cseréld a kitalált adatokat a `src/data/proof.ts` fájlban, és állítsd:
   `PROOF_IS_PLACEHOLDER = false`
2. GitHub → *Settings → Secrets and variables → Actions → Variables*:
   állítsd a **`SITE_ENV`** értékét `production`-re
3. Push a `main` branchre (vagy indítsd kézzel a workflow-t)

Ettől a ponttól az oldal indexelhető. A `build:prod` **nem hajlandó lefutni**,
amíg a `PROOF_IS_PLACEHOLDER` értéke `true` — vagyis kitalált véleményekkel
fizikailag nem tud éles, indexelhető build készülni.

### Visszaállás

Ha bármi gond van: állítsd a `SITE_ENV`-et vissza `staging`-re (kikerül az
indexelésből), vagy tedd vissza a domaint a régi WordPress csomagra — azt
**nem töröltük**.

## 6. Élesítés után

- [ ] `https://www.brandmuhely.hu` betölt
- [ ] `http://brandmuhely.hu` → átirányít `https://www.brandmuhely.hu`-ra
- [ ] `https://www.brandmuhely.hu/robots.txt` — **már nem** `Disallow: /`
- [ ] A forrásban **nincs** `noindex` (böngészőben: jobb klikk → forrás)
- [ ] Google Search Console: add hozzá a tulajdont, küldd be a sitemapet
      (`https://www.brandmuhely.hu/sitemap-index.xml`)

### A régi WordPress

Ha az új oldal két hete stabilan fut, a régi csomagon a *Tartalom törlése*
gombbal takaríthatsz. **Előtte ments le mindent** (fájlok + adatbázis) — lehet
benne olyan, amire most nem gondolsz. A mentést tartsd meg legalább 3 hónapig.

Egy ottmaradt, frissítetlen WordPress futtatható PHP-vel valódi biztonsági
kockázat, ezért ha a csomagot nem használod tovább, ne hagyd rajta.

---

## 7. Amihez soha nem nyúlunk

**Az MX rekordokhoz.** A leveleződ a Google Workspace-en van. Az oldal
költöztetésekor **csak az A/CNAME rekord változhat** — az MX soha, különben
megáll a leveleződ.
