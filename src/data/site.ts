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
    href: '/oktatas',
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
    href: '/oktatas',
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


/* ------------------------------------------------------------------------ */
/* The agency offer — one retainer, published in full                        */
/*                                                                            */
/* The agency page used to argue that it could not publish a price, because   */
/* the work differs between a 50 000 Ft and a 2 000 000 Ft monthly budget.    */
/* Kristóf has since decided on one flat retainer, which makes that argument  */
/* obsolete — a published price is a stronger filter than any "kérjen         */
/* ajánlatot" button, and it does the qualifying before the call.             */
/*                                                                            */
/* NO VAT LINE. The ÁSZF states he is alanyi adómentes and charges no VAT, so  */
/* "+ ÁFA" would contradict a contractual document on the same site. If that   */
/* status ever changes, `legalEntity.vatStatus`, ÁSZF §3 and this comment all  */
/* have to move together.                                                     */
/* ------------------------------------------------------------------------ */

export const agencyOffer = {
  price: 250_000,
  period: 'hó',
  /** What the retainer buys, as the six things actually delivered. */
  blocks: [
    {
      id: 'strategia',
      name: 'Stratégia',
      points: [
        'Üzleti célok átbeszélése',
        'Célcsoportok és ajánlatok elemzése',
        'Google + Meta stratégia egyben',
        'Kampánystruktúra megtervezése',
        'Költségkeret elosztása a csatornák között',
      ],
    },
    {
      id: 'google',
      name: 'Google Ads',
      points: [
        'Search kampányok',
        'Performance Max',
        'Remarketing',
        'Kulcsszókezelés',
        'Hirdetésszövegek',
      ],
    },
    {
      id: 'meta',
      name: 'Meta Ads',
      points: [
        'Facebook és Instagram',
        'Új közönségek elérése',
        'Remarketing',
        'Kreatívtesztelés',
        'Célcsoport-tesztelés',
      ],
    },
    {
      id: 'optimalizalas',
      name: 'Folyamatos optimalizálás',
      body: 'Nem egyszer beállítom és otthagyom.',
      points: ['Figyelem', 'Elemzem', 'Tesztelem', 'Optimalizálom'],
    },
    {
      id: 'meres',
      name: 'Mérés és riportolás',
      points: [
        'Konverziókövetés beállítása',
        'Kampányeredmények',
        'CPA / CPL / ROAS',
        'Havi riport, magyarul',
        'Konkrét következő lépések',
      ],
    },
    {
      id: 'tamogatas',
      name: 'Proaktív szakmai támogatás',
      body: 'Nem neked kell észrevenned, ha valami nem működik. Szólok.',
      points: [
        'Szakmai javaslatok',
        'Gyors reakció',
        'Hosszú távú gondolkodás',
        'Üzleti szemlélet',
      ],
    },
  ],

  /* Saying what is NOT in the price raises trust rather than lowering it: a
     retainer with no stated edges reads as one that will grow an invoice. */
  includes: [
    'Google Ads kezelés',
    'Meta Ads kezelés',
    'Stratégia és kampányépítés',
    'Folyamatos optimalizálás',
    'Remarketing',
    'Konverziómérés és riportolás',
    'Havi konzultáció',
    'Folyamatos szakmai javaslatok',
  ],
  excludes: [
    { what: 'A hirdetési költés', note: 'Közvetlenül a Google és a Meta felé fizeted, a saját fiókodból.' },
    { what: 'Landing oldal készítése', note: 'Külön megrendelhető.' },
    { what: 'Videógyártás', note: 'Külön megrendelhető.' },
    { what: 'Komolyabb kreatívgyártás', note: 'Külön megrendelhető.' },
    { what: 'Webfejlesztés', note: 'Külön megrendelhető.' },
    { what: 'Egyedi tracking-fejlesztés', note: 'A szokásos mérési beállítás benne van.' },
  ],

  /** The symptoms a visitor recognises before they know what to buy. */
  symptoms: [
    'Már hirdetsz, de nem tudod pontosan, hogy jó helyre megy-e a pénz.',
    'A kampányaid működnek, de nincs időd folyamatosan optimalizálni őket.',
    'Van marketingesed, de nincs valódi hirdetési szakembered.',
    'Több érdeklődőt vagy vásárlást szeretnél ugyanabból a keretből.',
    'Két külön emberrel kell egyeztetned a Google és a Meta miatt.',
    'Egyszerűen le szeretnéd venni a hirdetéskezelést a válladról.',
  ],

  /** The hard part, spelled out. Starting a campaign is not the hard part. */
  hardParts: [
    'mit hirdessünk',
    'kinek',
    'milyen ajánlattal',
    'melyik csatornán',
    'milyen kampánystruktúrával',
    'milyen kreatívval',
    'milyen landing oldalra',
    'mennyiért',
    'és mit kezdjünk az adatokkal, amikor megérkeznek',
  ],

  process: [
    { title: 'Megismerem az üzleted', body: 'Célok, ajánlat, célcsoport, jelenlegi eredmények.' },
    { title: 'Átnézem, amid már van', body: 'Google Ads, Meta, mérés, landing oldal, kreatívok.' },
    { title: 'Elkészítem a stratégiát', body: 'Melyik csatornán, milyen kampányokkal és milyen üzenettel dolgozunk.' },
    { title: 'Elindítom vagy újratervezem', body: 'Kampányok, célzások, kreatívok, mérés.' },
    { title: 'Optimalizálok', body: 'Nem havonta egyszer nézek rá. Az adatok alapján folyamatosan döntök.' },
    { title: 'Megmutatom, mi történt', body: 'Havi riport, eredmények és a következő tesztek.' },
  ],

  /** A filter that works in both directions. Saying who this is not for is
   *  what makes the "igen" half believable. */
  fitFor: [
    'Már van működő terméked vagy szolgáltatásod',
    'Van értelmezhető hirdetési kereted',
    'Rendszeresen szeretnél hirdetni, nem kampányszerűen',
    'Hajlandó vagy adat alapján dönteni',
    'Van kapacitásod a beérkező érdeklődők kezelésére',
    'Hosszú távon szeretnéd építeni a rendszert',
  ],
  notFitFor: [
    'Még nincs kipróbált, működő ajánlatod',
    'Azt várod, hogy havi 50 000 Ft költésből milliókat csináljunk',
    'Nem tudsz vagy nem akarsz időt fordítani az együttműködésre',
    'Csak annyit szeretnél, hogy valaki egyszer beállítsa',
  ],
} as const;

/* ------------------------------------------------------------------------ */
/* Per-platform training pages                                                */
/*                                                                            */
/* One page per platform, each a self-contained sales page rather than a      */
/* chapter of /oktatas. The reason is search: people type "facebook hirdetés  */
/* egyéni oktatás", not "hirdetési képzés" — so the page that ranks has to be */
/* the one whose whole subject is that platform.                              */
/*                                                                            */
/* TIKTOK ÉS GOOGLE ANALYTICS — SZÁNDÉKOSAN NEM SZEREPEL A FŐOLDALON.        */
/* Kristóf mindkettőt oktatja, de csak annak akarja megmutatni, aki már az    */
/* Oktatás menüre kattintott. Ezért ez az öt kurzus KIZÁRÓLAG két helyen      */
/* jelenik meg: a fejléc Oktatás almenüjében és az /oktatas oldalon.          */
/* A `platforms` tömb (főoldali Platformok szekció) marad hármas — ne told    */
/* bele ezt a kettőt, és a főoldal egyetlen szekciója se olvassa a            */
/* `courses` tömböt.                                                          */
/* ------------------------------------------------------------------------ */

export type Course = {
  slug: string;
  /** Short label for the nav submenu. */
  navLabel: string;
  /** Full page title and H1 subject. */
  name: string;
  /** The platform as it is called in the product, for chips and schema. */
  platform: string;
  /** Half a sentence for the submenu and card grids. */
  summary: string;
  eyebrow: string;
  headline: string;
  lead: string;
  /** "Ismerős?" — the visitor recognises the symptom before the service. */
  symptoms: string[];
  /** What we actually go through together, in order. */
  curriculum: { title: string; body: string }[];
  /** What they can do on their own afterwards. */
  outcomes: string[];
  /** Platform-specific questions. The shared ones live in `faqs`. */
  faqs: { q: string; a: string }[];
};

export const courses: Course[] = [
  {
    slug: 'facebook-hirdetes-egyeni-oktatas',
    navLabel: 'Facebook (Meta) hirdetés',
    name: 'Facebook és Instagram hirdetés egyéni oktatás',
    platform: 'Meta Ads',
    summary: 'Facebook és Instagram kampányok a saját fiókodban, egyéni tempóban.',
    eyebrow: 'META ADS · EGYÉNI OKTATÁS',
    headline: 'Facebook hirdetés egyéni oktatás — a saját fiókodban',
    lead:
      'Nem videókat nézel egy tananyagban. Megosztod a képernyőd, és együtt építjük fel a Meta hirdetéseidet a saját vállalkozásodra: célzás, kreatív, költségkeret, mérés.',
    symptoms: [
      'Nyomtál már „Kiemelés" gombot, és nem tudod, mi lett belőle.',
      'Fut a hirdetésed, de fogalmad sincs, honnan jön az eredmény.',
      'Nem érted, mikor melyik kampánycélt kell választani.',
      'A Hirdetéskezelő felülete elsőre átláthatatlan.',
      'Nem tudod, mennyi pénzt érdemes betenni és mikor kell hozzányúlni.',
    ],
    curriculum: [
      { title: 'Fiók és jogosultságok rendbe téve', body: 'Business Manager, hirdetési fiók, oldalak és hozzáférések — úgy, hogy a fiók a tiéd maradjon és bárkit be tudj venni vagy ki tudj venni.' },
      { title: 'Mérés: pixel és konverziók', body: 'Meta pixel, konverziós események és a Conversions API alapjai. Enélkül a rendszer vakon optimalizál, és te is vakon döntesz.' },
      { title: 'Kampánycélok, amik valóban számítanak', body: 'Melyik célt mikor válaszd, és miért nem a „Kiemelés" a válasz. Forgalom, lead, vásárlás — melyik mit optimalizál valójában.' },
      { title: 'Célzás a gyakorlatban', body: 'Érdeklődési körök, Advantage+, egyedi és hasonmás közönségek. Mikor engedd a rendszerre, és mikor fogd vissza.' },
      { title: 'Kreatívok és szövegek', body: 'Mi működik ma kép és videó oldalon, hogyan állíts össze egy tesztelhető kreatívcsomagot, és mit írj a hirdetésbe.' },
      { title: 'Költségkeret és skálázás', body: 'Mennyivel indulj, mikor emelj, és hogyan ne öld meg a tanulófázist egy elhamarkodott módosítással.' },
      { title: 'Riport és döntés', body: 'Melyik három számot nézd hetente, mikor hagyd békén a kampányt, és mikor kell beavatkozni.' },
    ],
    outcomes: [
      'Önállóan indítasz kampányt, a megfelelő céllal',
      'Érted, mire megy el minden forint',
      'Tudsz kreatívot tesztelni, és tudod, mit mér a teszt',
      'Felismered, mikor kell hozzányúlni a kampányhoz és mikor nem',
    ],
    faqs: [
      { q: 'Kell hozzá Business Manager fiók?', a: 'Ha van, azzal dolgozunk. Ha nincs, az első alkalmon együtt hozzuk létre és állítjuk be — ez a teljes órából nagyjából húsz perc.' },
      { q: 'Instagram is benne van?', a: 'Igen. A Meta felületén ugyanaz a rendszer kezeli a Facebookot és az Instagramot, így a kettő együtt megy.' },
      { q: 'Mennyi hirdetési kerettel érdemes gyakorolni?', a: 'Napi 2–3 ezer forint már elég ahhoz, hogy éles adatot lássunk. Nem a keret nagysága számít a tanuláshoz, hanem hogy éles kampányon nézzük.' },
    ],
  },
  {
    slug: 'google-ads-egyeni-oktatas',
    navLabel: 'Google Ads',
    name: 'Google Ads egyéni oktatás',
    platform: 'Google Ads',
    summary: 'Keresési, Shopping és PMax kampányok a saját fiókodban.',
    eyebrow: 'GOOGLE ADS · EGYÉNI OKTATÁS',
    headline: 'Google Ads egyéni oktatás — arra, akik már keresnek rád',
    lead:
      'A Google-on nem kell felkelteni az érdeklődést: már keresik, amit árulsz. Az oktatáson azt építjük fel, hogyan találjanak meg téged, és ne a versenytársat — a saját fiókodban, a saját termékeiden.',
    symptoms: [
      'Elindítottál egy kampányt, és elvitte a keretet két nap alatt.',
      'Nem tudod, mely kulcsszavakra megy el valójában a pénz.',
      'A Performance Max fekete doboz, és nem mered kikapcsolni.',
      'Jönnek a kattintások, de nem lesz belőlük érdeklődő.',
      'Nem tudod, jól mér-e a konverziókövetésed.',
    ],
    curriculum: [
      { title: 'Fiókstruktúra, ami nem esik szét', body: 'Kampány, hirdetéscsoport, kulcsszó — hogyan épüljön, hogy fél év múlva is értsd, és lehessen benne optimalizálni.' },
      { title: 'Konverziómérés rendesen', body: 'Google Tag, konverziós műveletek, ezek nélkül a Google rossz dolgokra optimalizál. Itt dől el a kampány sorsa, nem a hirdetésszövegen.' },
      { title: 'Kulcsszavak és egyezési típusok', body: 'Pontos, kifejezés, széles — mit jelentenek ma, és hogyan ne engedd el a keretet kizáró kulcsszavak nélkül.' },
      { title: 'Hirdetésszövegek és eszközök', body: 'Reszponzív keresési hirdetés felépítése, címsorok, leírások, bővítmények — mit tesztelj és mit hagyj a rendszerre.' },
      { title: 'Performance Max józan ésszel', body: 'Mikor éri meg, mit kell etetni vele, és hogyan derítsd ki, mi történik benne valójában.' },
      { title: 'Licit és költségkeret', body: 'Manuális vagy automatikus licit, mikor melyik, és mennyi adat kell egy okos licitstratégiához.' },
      { title: 'Riport és optimalizálás', body: 'Keresési kifejezések átnézése, kizárás, és mit jelent, ha drágul a kattintás.' },
    ],
    outcomes: [
      'Felépítesz egy átlátható fiókstruktúrát',
      'Helyesen mérsz, és látod, mi hoz valódi konverziót',
      'Kizáró kulcsszavakkal megvéded a keretet',
      'Eldöntöd, hol éri meg PMax és hol nem',
    ],
    faqs: [
      { q: 'Webshopnak és szolgáltatásnak is jó?', a: 'Igen, de más felépítéssel. Webshopnál a Shopping és a feed kerül előtérbe, szolgáltatásnál a keresési kampány és az űrlapos konverzió — az első alkalmon eldöntjük, melyik a tiéd.' },
      { q: 'Kell hozzá Google Analytics?', a: 'Nem kötelező, de sokat segít. Ha nincs beállítva, jelezd — külön oktatáson át tudjuk nézni a mérést is.' },
      { q: 'Mennyi idő, mire eredményt látok?', a: 'A Google-nél is kell adat a tanuláshoz. Reálisan 2–4 hét, mire látszik az irány — az oktatás célja, hogy addig ne rontsd el türelmetlenségből.' },
    ],
  },
  {
    slug: 'linkedin-hirdetes-egyeni-oktatas',
    navLabel: 'LinkedIn hirdetés',
    name: 'LinkedIn hirdetés egyéni oktatás',
    platform: 'LinkedIn Ads',
    summary: 'B2B célzás pozíció, cégméret és iparág szerint.',
    eyebrow: 'LINKEDIN ADS · EGYÉNI OKTATÁS',
    headline: 'LinkedIn hirdetés egyéni oktatás — ha B2B-ben hirdetsz',
    lead:
      'A LinkedIn drága kattintásokat ad és cserébe olyan célzást, amit máshol nem kapsz meg: pozíció, cégméret, iparág. Az oktatáson azt nézzük meg, mikor éri meg ez a csere — és hogyan hozd ki belőle a maximumot.',
    symptoms: [
      'B2B-ben hirdetsz, és a Facebook nem hozza a megfelelő embereket.',
      'Megijedtél a LinkedIn kattintási áraitól.',
      'Nem tudod, hogyan célozz döntéshozóra.',
      'Elindítottál egy kampányt, és drágán hozott rossz leadeket.',
      'Nem tudod, mennyi kerettel van ennek egyáltalán értelme.',
    ],
    curriculum: [
      { title: 'Mikor éri meg LinkedIn — és mikor nem', body: 'Őszintén: sok vállalkozásnak nem éri meg. Először azt nézzük meg, a tiédnek megéri-e, mielőtt bármit beállítanánk.' },
      { title: 'Campaign Manager és a fiók beállítása', body: 'Hirdetési fiók, céloldal, Insight Tag, konverziókövetés.' },
      { title: 'Célzás, ami a LinkedIn igazi értéke', body: 'Pozíció, beosztási szint, cégméret, iparág, készségek — és hogyan ne szűkítsd annyira, hogy ne fusson a kampány.' },
      { title: 'Hirdetésformátumok', body: 'Egyképes, karusszel, videó, üzenethirdetés és lead gen űrlap — melyik mire való.' },
      { title: 'Lead gen űrlap vagy landing oldal?', body: 'Melyik hoz olcsóbb és melyik jobb minőségű leadet, és mitől függ a választás.' },
      { title: 'Költségkeret és licit', body: 'Mennyi a reális belépő, és hogyan ne égesd el az első hétben.' },
    ],
    outcomes: [
      'Eldöntöd, megéri-e neked a LinkedIn',
      'Döntéshozói célzást állítasz be',
      'Tudod, melyik formátum mire való',
      'Reális elvárásaid vannak a kattintási árról',
    ],
    faqs: [
      { q: 'Mennyi kerettel van értelme LinkedIn-en hirdetni?', a: 'A kattintás jellemzően sokszorosa a Meta-énak, így napi néhány ezer forint kevés. Az első beszélgetésen őszintén megmondom, ha a te keretedből több eredményt hozna a Meta vagy a Google.' },
      { q: 'Kell hozzá céges LinkedIn oldal?', a: 'Igen, hirdetni csak céges oldalról lehet. Ha nincs, az első alkalmon létrehozzuk.' },
    ],
  },
  {
    slug: 'tiktok-hirdetes-egyeni-oktatas',
    navLabel: 'TikTok hirdetés',
    name: 'TikTok hirdetés egyéni oktatás',
    platform: 'TikTok Ads',
    summary: 'Rövid videós kampányok, kreatív-központú megközelítéssel.',
    eyebrow: 'TIKTOK ADS · EGYÉNI OKTATÁS',
    headline: 'TikTok hirdetés egyéni oktatás — ahol a kreatív a célzás',
    lead:
      'A TikTokon nem a célzás dönt, hanem az első másodperc. Az oktatáson azt nézzük meg, hogyan készül olyan hirdetés, ami megállítja a görgetést — és hogyan mérd, hogy tényleg hozott-e.',
    symptoms: [
      'Látod, hogy mindenki TikTokozik, de nem tudod, neked megéri-e.',
      'Nincs kedved táncolni, és azt hiszed, enélkül nem megy.',
      'Feltöltöttél egy Facebook-videót, és nem működött.',
      'Nem tudod, hogyan mérd, mi jött a TikTokról.',
      'Nem tudod, mennyi kerettel érdemes kipróbálni.',
    ],
    curriculum: [
      { title: 'Megéri-e neked egyáltalán', body: 'Kinek való a TikTok és kinek nem. Ezzel kezdünk, mert a rossz platform a legdrágább hiba.' },
      { title: 'Fiók, pixel, mérés', body: 'TikTok Ads Manager, pixel, események — hogy ne csak megérzés legyen, mi működik.' },
      { title: 'A kreatív mint stratégia', body: 'Az első másodperc, a natív hangvétel, a felirat és a hang szerepe. Miért bukik el egy átemelt Facebook-videó.' },
      { title: 'Kampánytípusok és célzás', body: 'Mit válassz, és miért ad itt gyakran jobb eredményt a széles célzás.' },
      { title: 'Tesztelés rendszerben', body: 'Hány kreatívval indulj, meddig hagyd futni, és mi alapján dönts.' },
      { title: 'Költségkeret és skálázás', body: 'Reális belépő keret, és mikor érdemes emelni.' },
    ],
    outcomes: [
      'Eldöntöd, való-e neked a platform',
      'Felépítesz egy mérhető TikTok kampányt',
      'Tudod, mitől jó egy TikTok kreatív',
      'Nem Facebook-videókat töltesz fel',
    ],
    faqs: [
      { q: 'Kell hozzá, hogy én szerepeljek a videókban?', a: 'Nem. Sok jól teljesítő hirdetés terméket, folyamatot vagy képernyőfelvételt mutat. Azt nézzük meg, mi illik hozzád és a vállalkozásodhoz.' },
      { q: 'Csak fiataloknak hirdető cégeknek jó?', a: 'Ez már nem igaz, a korosztályi összetétel évek óta tolódik. Az első beszélgetésen megnézzük, a te vevőd fent van-e.' },
    ],
  },
  {
    slug: 'google-analytics-egyeni-oktatas',
    navLabel: 'Google Analytics (GA4)',
    name: 'Google Analytics 4 egyéni oktatás',
    platform: 'Google Analytics 4',
    summary: 'Mérés, konverziók és riportok — hogy tudd, mi történik valójában.',
    eyebrow: 'GOOGLE ANALYTICS 4 · EGYÉNI OKTATÁS',
    headline: 'Google Analytics egyéni oktatás — hogy ne találgass',
    lead:
      'Ez az egyetlen oktatás, ami nem hirdetésről szól — hanem arról, ami minden hirdetés alatt van. Ha rosszul mérsz, minden döntésed rossz adaton alapul, akármilyen jó a kampányod.',
    symptoms: [
      'Megnyitod a GA4-et, és fogalmad sincs, mit nézel.',
      'Nem egyezik a Google Ads és az Analytics száma.',
      'Nem tudod, hány érdeklődő jött valójában a hirdetésből.',
      'Valaki beállította, de nem tudod, jól van-e.',
      'Nem tudod, mit kellene hetente megnézned.',
    ],
    curriculum: [
      { title: 'Hogyan gondolkodik a GA4', body: 'Eseményalapú mérés a régi munkamenet-logika helyett. Ha ezt érted, a többi már csak felület.' },
      { title: 'Beállítás és ellenőrzés', body: 'Adatfolyam, Google Tag, Tag Manager alapok — és hogyan ellenőrizd, hogy tényleg mér.' },
      { title: 'Konverziók, amiket tényleg mérni akarsz', body: 'Űrlapküldés, hívás, vásárlás. Mit jelölj kulcseseménynek, és mit ne.' },
      { title: 'Forgalmi források és attribúció', body: 'Miért nem egyezik soha a Meta, a Google és a GA4 száma — és melyiknek mikor higgy.' },
      { title: 'UTM-paraméterek', body: 'Hogyan címkézd a kampányaidat, hogy fél év múlva is tudd, mi honnan jött.' },
      { title: 'Riportok, amiket tényleg használni fogsz', body: 'Három-négy riport, amit hetente megnézel — a többi zaj.' },
    ],
    outcomes: [
      'Érted, mit mér a GA4 és mit nem',
      'Ellenőrizni tudod a saját mérésed',
      'Helyesen címkézed a kampányaidat',
      'Tudod, melyik számnak mikor higgy',
    ],
    faqs: [
      { q: 'Ez hirdetési oktatás?', a: 'Nem, ez a mérésről szól. De minden hirdetési döntés ezen áll vagy bukik, ezért sokan ezzel kezdik.' },
      { q: 'Kell hozzá Google Tag Manager?', a: 'Nem kötelező, de az alapjait átvesszük, mert a legtöbb mérési feladat ezen keresztül a legegyszerűbb.' },
    ],
  },
];

export type NavItem = {
  href: string;
  label: string;
  /** A submenu. The parent stays a real link — a dropdown whose trigger goes
   *  nowhere strands anyone on a keyboard or a touch device. */
  children?: { href: string; label: string }[];
};

export const nav: NavItem[] = [
  {
    href: '/oktatas',
    label: 'Oktatás',
    children: courses.map((c) => ({ href: `/oktatas/${c.slug}`, label: c.navLabel })),
  },
  { href: '/ugynokseg', label: 'Hirdetéskezelés' },
  { href: '/arak', label: 'Árak' },
  { href: '/rolam', label: 'Rólam' },
  { href: '/eredmenyek', label: 'Eredmények' },
  { href: '/blog', label: 'Blog' },
];

/* ------------------------------------------------------------------------ */
/* Arguments shared by every course page                                      */
/*                                                                            */
/* These do not change per platform, so they live here once rather than being */
/* repeated five times in `courses`.                                          */
/* ------------------------------------------------------------------------ */

export const whyOneToOne = [
  {
    t: 'A te fiókod, a te termékeid',
    b: 'Nem demó-fiókban kattintgatunk. A saját hirdetési fiókodban dolgozunk, a saját termékeiden — ami az óra végén ott marad élesben.',
  },
  {
    t: 'Csak rád megy az idő',
    b: 'Nincs húsz ember, akinek a kérdéseit végig kell hallgatnod. Ahol már otthon vagy, átugorjuk; ahol elakadsz, ott maradunk.',
  },
  {
    t: 'Azonnal kérdezhetsz',
    b: 'Nem egy fórumon kapsz választ három nap múlva. Ha valami nem világos, ott helyben tisztázzuk.',
  },
  {
    t: 'Naprakész, nem felvett tananyag',
    b: 'A felületek havonta változnak. Élőben azt látod, ami MA van a képernyőn, nem azt, ami tavaly volt.',
  },
];

/**
 * A real filter, not a persuasion trick. Competitor pages run a "ne vedd meg,
 * ha…" list whose every line is "…ha nem akarsz jobb eredményt" — which
 * filters nobody and insults the reader. These four actually turn people
 * away, which is what makes the other list believable.
 */
export const courseNotFor = [
  'Azt várod, hogy én állítsam be helyetted — akkor a hirdetéskezelés való neked, nem az oktatás.',
  'Nincs időd a két alkalom között foglalkozni a kampányokkal.',
  'Még nincs terméked vagy szolgáltatásod, amit hirdetni lehetne.',
  'Egy órában szeretnél mindent megtanulni, és utána magadra hagyva boldogulni.',
];

/** The three terms that most often decide a purchase, in one place. */
export const courseTerms = [
  { t: 'Ez a végösszeg', b: 'Alanyi adómentes szolgáltatóként számlázok, így áfa nem jön rá. Amit az árnál látsz, annyit fizetsz.' },
  { t: 'A felvétel benne van', b: 'Minden alkalomról videófelvétel készül, és az óra után megkapod. Nem felár.' },
  { t: `${terms.validityMonths} hónapod van`, b: `A megvásárolt alkalmakat ${terms.validityMonths} hónapon belül kell felhasználni, tehát nem kell egy hónapba besűríteni.` },
];
