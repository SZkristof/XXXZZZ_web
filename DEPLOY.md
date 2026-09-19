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

### b) Ideiglenes aldomain

A **Domain** fülön → *Domain hozzáadása* → add hozzá:

```
uj.brandmuhely.hu
```

> A csomag `0 / 1 DB` domaint enged. Ha az aldomain elhasználja ezt az egy
> helyet, akkor inkább **rögtön a `brandmuhely.hu`-t** add hozzá ehhez a
> csomaghoz (lásd 5. pont) — csak akkor, ha már minden más kész. Ezt a panel
> alapján nem tudom eldönteni; nézd meg, elfogad-e aldomaint a limit terhére.

A **DNS zónák** menüben az `uj` aldomainhez vegyél fel egy **A rekordot**, ami
az új csomag IP-címére mutat (a Domain fül *IP CÍM* oszlopában látod).

### c) HTTPS

A **Domain** fül *HTTPS* oszlopában kapcsold be a Let's Encrypt tanúsítványt.
Tanúsítvány nélkül a böngésző figyelmeztetni fog — egy hirdetésekkel foglalkozó
oldalnál ez azonnali hitelvesztés.

### d) PHP verzió

A *PHP VERZIÓ* oszlopban állíts **8.1-et vagy újabbat**. Az űrlapkezelő
7.4-től felfelé elindul, de a 8.1+ a biztonságos választás — a régebbi
verziók már nem kapnak biztonsági javítást. Ha a beállítás túl régi, az űrlap
nem néma hibával dől el, hanem kiírja, mit kell átállítani.

---

## 2. Feltöltés

### Automatikusan (ajánlott)

GitHub → *Settings → Secrets and variables → Actions*.

**Variables:**

| Név | Érték |
| --- | --- |
| `DEPLOY_PROTOCOL` | `sftp` |

**Secrets** (ezeket te töltöd ki, nekem soha ne küldd el őket):

| Név | Érték |
| --- | --- |
| `DEPLOY_HOST` | az SSH fülön látható kiszolgáló |
| `DEPLOY_USER` | SSH felhasználónév |
| `DEPLOY_SSH_KEY` | a privát kulcs tartalma (ha kulcsot használsz) |
| `DEPLOY_PASSWORD` | jelszó (csak ha nincs kulcs) |
| `DEPLOY_PORT` | általában `22` |
| `DEPLOY_REMOTE_PATH` | a webgyökér útvonala (a Domain fül *KÖNYVTÁR* oszlopa) |

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

## 4. Tesztelés az aldomainen

Mielőtt bárki látná, az `uj.brandmuhely.hu` címen:

- [ ] Betölt, lakat ikon látszik
- [ ] Mobilon is rendben néz ki
- [ ] `/kapcsolat` — a Cal.com naptár betölt
- [ ] **Küldj egy teszt üzenetet az űrlapon → megérkezik a levél?** (a spam
      mappát is nézd meg)
- [ ] A sütisáv megjelenik, és a „Csak a szükségeseket" gomb működik
- [ ] `/nemletezo-oldal` → a saját 404 oldalunk jön
- [ ] `/kepzes`, `/ugynokseg`, `/arak`, `/blog` mind elérhető

> **Fontos:** az aldomaint zárd ki a keresőkből, amíg teszt. A
> `public/robots.txt` az éles domainre készült; a teszt időszakra a Rackhost
> panelen vagy egy ideiglenes `robots.txt`-vel tiltsd le az indexelést, hogy a
> Google ne indexelje kétszer ugyanazt a tartalmat.

---

## 5. Átkapcsolás az éles domainre

Csak akkor, ha a 4. pont minden sora kipipálva.

1. A **régi** (WordPress) csomagról vedd le a `brandmuhely.hu` domaint.
2. Az **új** csomaghoz add hozzá a `brandmuhely.hu`-t (és a `www`-t).
3. Kapcsold be rá a HTTPS-t.
4. Ellenőrizd a DNS-t: az **A rekord** az új csomag IP-jére mutasson.
   **Az MX rekordokhoz ne nyúlj** — azok a Google Workspace-re mutatnak, és a
   leveleződ ezeken múlik.
5. Töltsd fel újra (vagy futtasd a GitHub Actions deployt) az éles útvonalra.
6. Az `uj.brandmuhely.hu` aldomaint töröld, hogy ne maradjon duplikált tartalom.

### Visszaállás

Ha bármi gond van: tedd vissza a domaint a régi csomagra. A WordPress oldal
érintetlenül ott van — **nem töröltünk semmit**.

---

## 6. Élesítés után

- [ ] `https://www.brandmuhely.hu` betölt
- [ ] `http://brandmuhely.hu` → átirányít `https://www.brandmuhely.hu`-ra
- [ ] **A levelezés változatlanul működik** (küldj magadnak egy e-mailt)
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
