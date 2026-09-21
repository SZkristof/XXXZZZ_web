/**
 * Single source of truth for business facts.
 * Edit prices, contact details and offers HERE — never in page markup.
 */

export const site = {
  name: 'Brandműhely',
  legalName: 'Szabó Kristóf E.V.',
  domain: 'brandmuhely.hu',
  url: 'https://brandmuhely.hu',
  locale: 'hu-HU',
  lang: 'hu',
  description:
    'Egyéni, 1 az 1-ben Meta, Google és LinkedIn hirdetési képzés magyar kis- és középvállalkozásoknak. A saját kampányaidat építed, 11 éves szakmai tapasztalattal a hátad mögött.',
} as const;

export const expert = {
  name: 'Szabó Kristóf',
  firstName: 'Kristóf',
  role: 'Facebook és Google szakértő · Oktató',
  yearsExperience: 11,
  /** Kristóf először 500-at mondott, később "több, mint 200"-at írt. A kisebbik,
   *  biztosan tartható számot használjuk mindenhol — ha az 500 is igazolható,
   *  elég ezt az egy sort átírni, minden felület követi. */
  businessesTrained: 200,
  shortBio:
    '11 éve élek abból, hogy hirdetési kampányok teljesítenek. Dolgoztam nemzetközi paid media csapatok élén és a legnagyobb magyar ügynökségeknél, olyan márkákon, amiket nap mint nap használsz.',
} as const;

/** Brands worked with. These build authority — but they also risk signalling
 *  "too expensive for me" to a 5-person company, so every surface that shows
 *  them must pair them with the small-business reassurance below. */
export const brands = [
  'Mizo',
  'Deutsche Telekom',
  'Rossmann',
  'Epson',
  'Sportfactory',
  'Football Factor',
] as const;

/** A főoldali bizalmi sáv fő állítása. Szándékosan szám, nem csillag:
 *  az arculati kézikönyvben nincs csillag-ikon, és egy értékelés-widget
 *  látszata valódi értékelések nélkül félrevezető lenne. */
export const socialProofClaim =
  'Több, mint 200 magyar vállalkozás választotta már a Brandműhely oktatásait.';

export const brandsReassurance =
  'Továbbá: Heaven Laser & Beauty Szépségszalon, TippTour Utazási Iroda, ' +
  'Mokambo Kávé, Prémium Kőszőnyeg, Caninashop.hu, Trend Építészet Group, ' +
  'StoreFront, Hell Cuts Barber & more, AzsuzsA a magyartanár, ' +
  "GRK's Greek Kitchen, Deuter Magyarország, Store for Explorers és még " +
  'sokan mások';

/* ------------------------------------------------------------------------ */
/* Pricing                                                                    */
/* ------------------------------------------------------------------------ */

export const SESSION_LENGTH_MIN = 60;
export const BASE_SESSION_PRICE = 35_000;

export type Package = {
  id: string;
  sessions: number;
  price: number;
  perSession: number;
  /** e.g. "4+1" — pay for 4, get 5. Honest, and it does the selling for us. */
  deal: string | null;
  dealExplainer: string | null;
  savings: number;
  name: string;
  /** The cut header band's label. Authored in uppercase, never text-transform. */
  band: string;
  tagline: string;
  /** Each package asks for the sale in its own words. */
  cta: string;
  featured: boolean;
  bestFor: string;
  includes: string[];
};

function pkg(
  id: string,
  name: string,
  sessions: number,
  price: number,
  paidSessions: number,
  opts: {
    band: string; tagline: string; cta: string;
    bestFor: string; featured?: boolean; includes: string[];
  },
): Package {
  const free = sessions - paidSessions;
  return {
    id,
    name,
    sessions,
    price,
    perSession: Math.round(price / sessions),
    deal: free > 0 ? `${paidSessions}+${free}` : null,
    dealExplainer:
      free > 0
        ? `${paidSessions} alkalmat fizetsz, ${sessions}-${sessions === 5 ? 'öt' : 'et'} kapsz.`
        : null,
    savings: sessions * BASE_SESSION_PRICE - price,
    featured: opts.featured ?? false,
    band: opts.band,
    tagline: opts.tagline,
    cta: opts.cta,
    bestFor: opts.bestFor,
    includes: opts.includes,
  };
}

const COMMON_INCLUDES = [
  '60 perces, egyéni alkalom — online vagy személyesen Budapesten',
  'Minden alkalomról videófelvétel, ingyen',
  'A saját hirdetési fiókodban dolgozunk',
  'Konkrét feladatok két alkalom között',
];

export const packages: Package[] = [
  pkg('single', 'Egy alkalom', 1, 35_000, 1, {
    band: 'AUDIT, FIÓKVIZSGÁLAT',
    tagline: 'Konkrét probléma megoldása, kampány indítása',
    cta: 'Ez érdekel',
    bestFor: 'Egy konkrét kérdés, egy elakadás, vagy egy alapos fiók-átnézés.',
    includes: COMMON_INCLUDES,
  }),
  pkg('five', '5 alkalmas csomag', 5, 140_000, 4, {
    band: 'START CSOMAG',
    tagline: 'A legnépszerűbb.',
    cta: 'Ezt választom',
    bestFor:
      'Nulláról felépítjük a hirdetéseidet Facebookon vagy Google-n, rendet rakunk a meglévő, gyengén teljesítő fiókodban.',
    featured: true,
    includes: [...COMMON_INCLUDES, 'Egy platform: Meta, Google vagy LinkedIn'],
  }),
  pkg('ten', '10 alkalmas csomag', 10, 245_000, 7, {
    band: 'TELJES CSOMAG',
    tagline: 'Két platform, a teljes út.',
    cta: 'Ezt szeretném',
    bestFor:
      'Érdekel a Facebook és Google hirdetéskezelés világa. Komolyan skálázni akarsz, és két csatornát futtatnál párhuzamosan.',
    includes: [
      ...COMMON_INCLUDES,
      'Két platform párhuzamosan (pl. Meta + Google)',
      'Skálázási és mérési stratégia',
    ],
  }),
];

export const featuredPackage = packages.find((p) => p.featured)!;

/* ------------------------------------------------------------------------ */
/* Tracks — the three buyer situations, in their own words                     */
/* ------------------------------------------------------------------------ */

export type Track = {
  id: string;
  slug: string;
  label: string;
  /** First-person symptom. This is how the visitor self-identifies. */
  symptom: string;
  headline: string;
  description: string;
  outcomes: string[];
  recommended: string;
  recommendedLabel: string;
};

export const tracks: Track[] = [
  {
    id: 'start',
    slug: 'kezdo',
    label: 'Most kezdem',
    symptom: 'Tudom, hogy hirdetnem kéne, de fogalmam sincs, hol kezdjem.',
    headline: 'Nulláról az első működő kampányig',
    description:
      'Nem futtattál még hirdetést, vagy elindítottál egyet és nem történt semmi. Együtt felépítjük az alapoktól: fiók, mérés, célzás, kreatív, költségkeret. A végén egyedül is el tudsz indítani egy kampányt.',
    outcomes: [
      'Beállított, helyesen mérő hirdetési fiók',
      'Az első éles kampányod, élesben elindítva',
      'Érted, mire megy el minden forint',
      'Tudod, mit kell nézned hetente',
    ],
    recommended: 'five',
    recommendedLabel: '5 alkalmas csomag',
  },
  {
    id: 'fix',
    slug: 'optimalizalo',
    label: 'Futnak, de gyengén',
    symptom: 'Futnak a hirdetéseim, de nem hozzák, amit kéne — és nem tudom, miért.',
    headline: 'Átveszed az irányítást az ügynökségtől',
    description:
      'Dolgoztál már ügynökséggel, talán többel is, és az az érzésed, hogy elfolyik a keret. Átnézzük, ami fut, megkeressük, hol szivárog a pénz, és megtanulod magad optimalizálni — hogy ne kelljen többé senkiben vakon bíznod.',
    outcomes: [
      'Végigmegyünk a fiókodon, tételesen',
      'Megtalálod, hol folyik el a költés',
      'Önállóan optimalizálsz és tesztelsz',
      'Már nem kell vakon bízni senkiben',
    ],
    recommended: 'five',
    recommendedLabel: '5 alkalmas csomag',
  },
  {
    id: 'lead',
    slug: 'vezetoknek',
    label: 'Vezetőként',
    symptom: 'Nem én fogom csinálni — de látni akarom, mi történik a pénzemmel.',
    headline: 'Érted a számokat, anélkül hogy hirdetést kellene raknod',
    description:
      'Nem akarsz hirdetést építeni — van rá embered vagy ügynökséged. Azt akarod tudni, hogy jó számokat mutatnak-e, és mit kérdezz tőlük. Elmagyarázom a riportokat úgy, ahogy egy tulajdonosnak kell.',
    outcomes: [
      'Olvasod és érted a riportokat',
      'Tudod, mikor mondanak féligazságot',
      'A jó kérdéseket teszed fel a csapatnak',
      'Reális elvárásokat állítasz',
    ],
    recommended: 'single',
    recommendedLabel: '1–2 alkalom',
  },
];

/* ------------------------------------------------------------------------ */
/* Platforms                                                                  */
/* ------------------------------------------------------------------------ */

export const platforms = [
  {
    id: 'meta',
    name: 'Meta Ads',
    sub: 'Facebook &amp; Instagram',
    bestFor: 'Webshopok, szolgáltatások, helyi vállalkozások — itt szinte mindenkinek ajánlott hirdetni.',
  },
  {
    id: 'google',
    name: 'Google Ads',
    sub: 'Keresés, Shopping, PMax',
    bestFor: 'Keresési, vásárlási szándék elkapása vevőszerzés céljából.',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Ads',
    sub: 'B2B célzás',
    bestFor: 'B2B, ahol pozíció, cégméret és iparág szerint kell célozni.',
  },
] as const;

/* ------------------------------------------------------------------------ */
/* Contact                                                                    */
/* ------------------------------------------------------------------------ */

export const contact = {
  email: 'info@brandmuhely.hu',
  phone: '+36 70 670 2600',
  phoneHref: '+36706702600',
  /** Cal.com booking link. Syncs to Google Calendar and generates Meet links,
   *  but unlike Google's native scheduler it fires a completion event we can
   *  track as a conversion in Google Ads and Meta. */
  bookingUrl: 'https://cal.com/brandmuhely/30min',
  bookingNamespace: '30min',
  bookingDurationMin: 30,
} as const;

/** Nyilvános cégadatok. Az Ekertv. 4. § alapján a székhelyet is közzé kell tenni. */
export const legalEntity = {
  name: 'Szabó Kristóf E.V.',
  form: 'egyéni vállalkozó',
  address: '1105 Budapest, Kőrösi Csoma Sándor út 41.',
  addressParts: {
    street: 'Kőrösi Csoma Sándor út 41.',
    city: 'Budapest',
    postalCode: '1105',
    country: 'HU',
  },
  taxNumber: '59629207-1-42',
  registrationNumber: '57675563',
  bankAccount: '11773102-00355166',
  /** A 9. számjegy (1) alanyi adómentességre utal — Kristóffal egyeztetendő. */
  vatStatus: 'alanyi adómentes',
  hosting: 'Rackhost Zrt., 6000 Kecskemét, Sudár utca 1/A',
} as const;

/**
 * Szerződési feltételek számszerű részletei.
 * FIGYELEM: ezek javasolt alapértékek, Kristóffal megerősítendők.
 */
export const terms = {
  /** Ennyi órával korábban díjmentes az átütemezés. */
  freeRescheduleHours: 24,
  /** Ennyi hónapon belül kell felhasználni a megvásárolt alkalmakat. */
  validityMonths: 6,
} as const;

/* ------------------------------------------------------------------------ */
/* The two halves                                                             */
/*                                                                            */
/* Brandműhely is ONE brand with two halves that share everything. What        */
/* separates them is which colour a section is in — never a second logo.       */
/* Képzés is the main business and carries terracotta; Ügynökség carries blue. */
/* ------------------------------------------------------------------------ */

export const halves = [
  {
    id: 'kepzes',
    name: 'Képzés',
    href: '/kepzes',
    tone: 'terracotta',
    tagline: 'Te csinálod, én vezetlek.',
    summary:
      'Egyéni alkalmak a saját hirdetési fiókodban. A végén magad tudod vinni a kampányaidat.',
  },
  {
    id: 'ugynokseg',
    name: 'Ügynökség',
    href: '/ugynokseg',
    tone: 'blue',
    tagline: 'Nincs rá időd? Csináljuk mi.',
    summary:
      'Kampánykezelés és webfejlesztés — ugyanaz a szakmai munka, csak nem neked kell elvégezned.',
  },
] as const;

export type AgencyService = {
  id: string;
  name: string;
  body: string;
  points: string[];
};

export const agencyServices: AgencyService[] = [
  {
    id: 'kampanykezeles',
    name: 'Kampánykezelés',
    body:
      'Átveszem a Meta, Google vagy LinkedIn kampányaidat: tervezés, stratégia, felépítés, mérés, optimalizálás, heti/havi riport. A fiók végig a tiéd marad, és bármikor belenézhetsz.',
    points: [
      'A hirdetési fiók a te tulajdonodban marad',
      'Havi riport, magyarul, érthetően',
      'Nincs hűségidő',
      'Bármikor átválthatsz képzésre, ha inkább megtanulnád',
    ],
  },
  {
    /* Kristóf megerősítette (2026-09): a webfejlesztés valódi ügynökségi
       szolgáltatás, ahogy az arculati kézikönyv is sorolja. */
    id: 'webfejlesztes',
    name: 'Webfejlesztés',
    body:
      'Gyors, mérhető weboldal vagy landing oldal, ami a hirdetéseidhez készül — nem sablonból. A sebesség közvetlenül olcsóbbá teszi a kattintásaidat.',
    points: [
      'Gyors betöltés, jó Core Web Vitals',
      'Helyesen beállított konverziómérés',
      'A hirdetési üzenetre hangolt landing oldal',
      'GDPR-megfelelő süti- és mérési beállítás',
    ],
  },
  {
    id: 'egyszeri-beallitas',
    name: 'Egyszeri kampány- és fiókbeállítás',
    body:
      'Rövid együttműködés: 24–48 órán belül felépítem az első kampányokat az általad megadott adatok alapján, aztán a tiéd. Nincs havidíj és nincs folytatási kötelezettség.',
    points: [
      'Fiókstruktúra és mérés beállítása',
      'Az első kampányok felépítése, indításra készen',
      'Egyszeri díj, nincs havidíj',
      'A fiók és minden hozzáférés a tiéd marad',
    ],
  },
  {
    id: 'audit',
    name: 'Digitális marketing audit, fiókvizsgálat',
    body:
      'Fiókvizsgálat, kampányelemzés és hatékonyságnövelési javaslatok. Megkapod írásban, mit érdemes átalakítani — akkor is, ha utána egyedül csinálod tovább.',
    points: [
      'Tételes fiók- és kampányátvizsgálás',
      'Hol folyik el a költés, és miért',
      'Írásos javaslatcsomag, prioritási sorrendben',
      'Nem kötelező utána együtt dolgoznunk',
    ],
  },
  {
    id: 'technikai',
    name: 'Technikai beállítás és mérés-audit',
    body:
      'Google Analytics, Google Tag Manager, konverziómérés, shopping feedek. Ha sejted, hogy rossz a mérésed, de nem tudod, mit csinálj: az ingyenes hibafeltárás után kapsz árajánlatot a javításra.',
    points: [
      'Ingyenes hibafeltárás, utána árajánlat',
      'GA4 és GTM beállítás vagy átvizsgálás',
      'Konverziómérés Meta és Google oldalon',
      'Shopping feed hibák javítása',
    ],
  },
];

/* ------------------------------------------------------------------------ */
/* Services — the six entry points shown on the homepage                      */
/*                                                                            */
/* This is the homepage's routing layer, not a price list: every tile has to   */
/* land somewhere real, so each href points at a section that exists. The      */
/* workshop tile goes to the contact form because there is no workshop page    */
/* yet — better an honest enquiry than a link to nothing.                      */
/* ------------------------------------------------------------------------ */

export type Service = {
  id: string;
  name: string;
  body: string;
  /** Mobilon két csempe fér egymás mellé, ott a hosszú leírás olvashatatlan.
   *  Ez az egy mondat megy ki telefonon, a teljes szöveg sm-től felfelé. */
  short: string;
  href: string;
  cta: string;
  /** terracotta = képzés oldal, blue = ügynökségi oldal. */
  tone: 'terracotta' | 'blue';
};

export const services: Service[] = [
  {
    id: 'oktatas',
    name: 'Egyéni hirdetéskezelés oktatás',
    body:
      'Saját tempóban sajátíthatod el az otthonod kényelméből a hirdetéskezelés fortélyait. Megtanítalak rendszerben gondolkodni, miközben igazi kampányokat hozunk létre a vállalkozásod számára — az eredményeket pedig együtt vizsgáljuk meg utána.',
    short:
      'Együtt építjük meg a kampányaidat, a te fiókodban.',
    href: '/kepzes',
    cta: 'Az oktatásról',
    tone: 'terracotta',
  },
  {
    id: 'kampanykezeles',
    name: 'Teljes körű hirdetéskezelés, fiókmenedzsment',
    body:
      'Ha kiszerveznéd a marketinged, vagy megbízható partnert keresel, aki nem csak hirdetést kezel, hanem stratégiailag gondolkodik együtt a cégeddel — akkor valószínűleg egymást keressük.',
    short:
      'Ha megbízható stratégiai partnert keresel.',
    href: '/ugynokseg#kampanykezeles',
    cta: 'Kampánykezelés',
    tone: 'blue',
  },
  {
    id: 'egyszeri-beallitas',
    name: 'Egyszeri kampány- és fiókbeállítás',
    body:
      'Rövid együttműködési lehetőség, ahol egyszeri fiók- és kampánybeállítást végzünk el a legjobb tudásunk szerint, az általad megadott adatok alapján.',
    short:
      'Gyors hirdetésindítás, akár 24 órán belül.',
    href: '/ugynokseg#egyszeri-beallitas',
    cta: 'Részletek',
    tone: 'blue',
  },
  {
    id: 'audit',
    name: 'Digitális marketing audit, fiókvizsgálat',
    body:
      'Fiókvizsgálat, kampányelemzés, hatékonyságnövelési lehetőségek felkutatása és javaslattétel a jobb eredmények elérése érdekében.',
    short:
      'Átvizsgálom a fiókod, és megmondom, hol égeted el a pénzt.',
    href: '/ugynokseg#audit',
    cta: 'Kérek auditot',
    tone: 'blue',
  },
  {
    id: 'technikai',
    name: 'Mérések beállítása, audit',
    body:
      'Google Analytics, Google Tag Manager, shopping feedek. Sejted, hogy rossz a mérésed, de nem tudod, mit csinálj pontosan? Hívj nyugodtan: ingyenes hibafeltárás után kapsz árajánlatot a javításra.',
    short:
      'GA4, GTM, mérés, feedek. Ingyenes hibafeltárással indulunk.',
    href: '/ugynokseg#technikai',
    cta: 'Hibafeltárás',
    tone: 'blue',
  },
  {
    id: 'workshop',
    name: 'Online workshopok',
    body:
      'Gyakorlatorientált, élő és visszanézhető csoportos alkalmak, ahol egy-egy témát és újdonságot dolgozunk fel a digitális marketing területéről.',
    short:
      'Élő és visszanézhető csoportos alkalmak, egy-egy témára.',
    href: '/kapcsolat?tema=workshop',
    cta: 'Szólj, ha indul',
    tone: 'terracotta',
  },
];

export const nav = [
  { href: '/kepzes', label: 'Egyéni Oktatás' },
  { href: '/ugynokseg', label: 'Hirdetéskezelés' },
  { href: '/arak', label: 'Árak' },
  { href: '/rolam', label: 'Rólam' },
  { href: '/eredmenyek', label: 'Eredmények' },
  { href: '/blog', label: 'Blog' },
] as const;
