# Élesítés: a WordPress leváltása

Ez a dokumentum a `brandmuhely.hu` jelenlegi WordPress oldaláról az új statikus
oldalra való átállást írja le. Olvasd végig, mielőtt bármit törölnél.

---

## 0. Mielőtt bármihez hozzányúlsz: mentés

**Ezt ne hagyd ki, akkor sem, ha a régi oldalt szemétnek tartod.**

A Rackhost paneljén (vagy FTP-n) mentsd le:

- [ ] a teljes webgyökeret (az 564 MB-ot), tömörítve, a saját gépedre
- [ ] a WordPress **adatbázist** (phpMyAdmin → Export → Gyors → SQL)

A mentés azért kell, mert visszaállni csak ebből tudsz, és mert lehet benne
olyan, amire most nem gondolsz: régi számlák, PDF-ek, képek, egy űrlap
beérkezett adatai.

> Tartsd meg a mentést legalább 3 hónapig.

---

## 1. Mit tudj meg a Rackhosttól

### a) SFTP vagy csak FTP?

A Rackhost vezérlőpultjában nézd meg a tárhely adatait. Amit keresel:

- **SSH / SFTP hozzáférés** — ha van, ezt használjuk (titkosított, ez az ajánlott)
- ha csak **FTP** van, akkor **FTPS**-t (FTP over TLS) használunk — ez is titkosított

Ha nem egyértelmű, írj a Rackhost ügyfélszolgálatnak:

> „A WP Tárhely Mini csomagomhoz elérhető SFTP (SSH) hozzáférés, vagy csak FTP?
> Ha csak FTP, támogatja-e az FTPS-t (explicit TLS)? Kérem a szerver nevét és a portot."

Sima, titkosítatlan FTP-t **ne** használjunk: a jelszó tisztán utazik a hálózaton.

### b) A webgyökér pontos útvonala

Jellemzően `/web`, `/public_html` vagy `/domains/brandmuhely.hu/public_html`.
Ez lesz a `DEPLOY_REMOTE_PATH`.

---

## 2. A régi WordPress eltávolítása

**Fontos: nem elég föléírni.** Ha a WordPress fájljai ott maradnak, egy régi,
frissítetlen WP-mag marad a szerveren, futtatható PHP-vel — ez valódi
biztonsági kockázat még akkor is, ha az oldal már nem hivatkozik rá.

A mentés után töröld a webgyökér **teljes tartalmát**, beleértve:

```
wp-admin/  wp-content/  wp-includes/  wp-*.php  xmlrpc.php  .htaccess
```

Az adatbázist is törölheted a panelen, ha biztos vagy benne — vagy hagyd meg
még pár hétig, és csak utána.

---

## 3. Átállás előtt: a régi oldal URL-jei

Ha a régi WordPress oldal aloldalai szerepelnek a Google találatai között, az
átállás után ezek 404-esek lesznek. Ezt átirányítással kezeljük.

**Mit csinálj:** keresd meg a Google-ben, hogy `site:brandmuhely.hu`, és írd fel
a találatok URL-jeit. Küldd át őket nekem, és beállítom az átirányításokat.

Ha nincs egy sem (nem volt indexelve), akkor nincs teendő.

Az átirányítások helye a `public/.htaccess` fájl `# --- Régi WordPress URL-ek ---`
szekciója.

---

## 4. Az új oldal feltöltése

### Automatikusan (ajánlott)

GitHub → *Settings → Secrets and variables → Actions*:

**Variables** fülön:

| Név | Érték |
| --- | --- |
| `DEPLOY_PROTOCOL` | `sftp` vagy `ftps` |

**Secrets** fülön:

| Név | Érték |
| --- | --- |
| `DEPLOY_HOST` | a Rackhost szerver neve |
| `DEPLOY_USER` | felhasználónév |
| `DEPLOY_PASSWORD` | jelszó |
| `DEPLOY_PORT` | SFTP: `22`, FTPS: `21` |
| `DEPLOY_REMOTE_PATH` | a webgyökér útvonala (1/b pont) |

Ezután a `main` branchre pusholva magától buildel és feltölt.

### Kézzel

```bash
npm run build:prod
```

A `dist/` mappa **tartalmát** töltsd fel a webgyökérbe (ne magát a `dist` mappát).

---

## 5. Szerveroldali beállítás (egyszer)

A feltöltés után, a szerveren:

```
api/config.local.example.php  →  másold  →  api/config.local.php
```

és töltsd ki. **Ebben az egy lépésben dől el, hogy megkapod-e az űrlapos
üzeneteket.**

### Miért kell SMTP?

A `brandmuhely.hu` levelezése **Google Workspace**-en van. Emiatt a domain SPF
rekordja a Google-t hatalmazza fel arra, hogy `@brandmuhely.hu` címről küldjön —
a Rackhostot nem.

Ha a PHP a Rackhost szerveréről küldi a levelet, az **elbukik az SPF-en**, és
jellemzően spambe kerül vagy elvész. Ezért az űrlap a Google saját SMTP-jén
küld, így az SPF, a DKIM és a DMARC is rendben van.

**Google App Password készítése:**

1. Kapcsold be a 2-lépcsős azonosítást az `info@brandmuhely.hu` fiókon
2. Menj a https://myaccount.google.com/apppasswords oldalra
3. Hozz létre egy jelszót (pl. „Brandműhely weboldal")
4. A kapott 16 karaktert írd a `smtp_pass` mezőbe

Ha az SMTP nincs beállítva, a rendszer visszaesik a sima `mail()` küldésre —
**és minden üzenet bekerül a `_private/leads.csv` fájlba is**, így akkor sem
veszik el érdeklődő, ha a levél nem érkezik meg.

---

## 6. Ellenőrzés élesítés után

- [ ] `https://www.brandmuhely.hu` betölt, lakat ikon látszik
- [ ] `http://brandmuhely.hu` → átirányít `https://www.brandmuhely.hu`-ra
- [ ] Mobilon is rendben néz ki
- [ ] `/kapcsolat` — a Cal.com naptár betölt
- [ ] Küldj egy teszt üzenetet az űrlapon → **megérkezik-e a levél?** (nézd meg
      a spam mappát is)
- [ ] A sütisáv megjelenik, és az „Csak a szükségeseket" gomb működik
- [ ] `/nemletezo-oldal` → a saját 404 oldalunk jön
- [ ] `https://www.brandmuhely.hu/sitemap-index.xml` elérhető
- [ ] **A levelezés változatlanul működik** (küldj magadnak egy e-mailt) —
      a DNS MX rekordokhoz nem nyúltunk, de ellenőrizd

### Google Search Console

- [ ] Add hozzá a `brandmuhely.hu` tulajdont (ha még nincs)
- [ ] Küldd be a sitemapet: `https://www.brandmuhely.hu/sitemap-index.xml`

---

## 7. Amihez NEM nyúlunk

**A DNS-hez.** Az A rekord már a Rackhostra mutat, az MX rekordok a Google-re.
Az átállás csak fájlcsere a szerveren — a levelezésed nem érintett.

Ha valaha átköltöztetnénk az oldalt (pl. Vercelre), **csak az A/CNAME rekordot
szabad módosítani, az MX rekordokat soha** — különben megáll a leveleződ.
