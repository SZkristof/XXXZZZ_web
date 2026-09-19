/**
 * Single source of truth for business facts.
 * Edit prices, contact details and offers HERE — never in page markup.
 */

export const site = {
  name: 'Brandműhely',
  legalName: 'Szabó Kristóf E.V.',
  domain: 'www.brandmuhely.hu',
  url: 'https://www.brandmuhely.hu',
  locale: 'hu-HU',
  lang: 'hu',
  description:
    'Egyéni, 1 az 1-ben Meta, Google és LinkedIn hirdetési képzés magyar kis- és középvállalkozásoknak. A saját kampányaidat építed, 11 éves szakmai tapasztalattal a hátad mögött.',
} as const;

export const expert = {
  name: 'Szabó Kristóf',
  firstName: 'Kristóf',
  role: 'Paid media szakértő · Brandműhely',
  yearsExperience: 11,
  businessesTrained: 500,
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

export const brandsReassurance =
  'De az ügyfeleim többsége 3–15 fős vállalkozás, havi 30–250 000 Ft hirdetési kerettel.';

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
  tagline: string;
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
  opts: { tagline: string; bestFor: string; featured?: boolean; includes: string[] },
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
    tagline: opts.tagline,
    bestFor: opts.bestFor,
    includes: opts.includes,
  };
}

const COMMON_INCLUDES = [
  '60 perces, egyéni Google Meet konzultáció',
  'Minden alkalomról videófelvétel, ingyen',
  'A saját hirdetési fiókodban dolgozunk',
  'Konkrét feladatok két alkalom között',
];

export const packages: Package[] = [
  pkg('single', 'Egy alkalom', 1, 35_000, 1, {
    tagline: 'Kipróbálod, mielőtt elköteleződsz.',
    bestFor: 'Egy konkrét kérdés, egy elakadás, vagy egy gyors fiók-átnézés.',
    includes: COMMON_INCLUDES,
  }),
  pkg('five', '5 alkalmas csomag', 5, 140_000, 4, {
    tagline: 'A legtöbben ezzel kezdenek.',
    bestFor:
      'Nulláról felépíted a hirdetéseidet, vagy rendet raksz egy meglévő, gyengén teljesítő fiókban.',
    featured: true,
    includes: [...COMMON_INCLUDES, 'Egy platform: Meta, Google vagy LinkedIn'],
  }),
  pkg('ten', '10 alkalmas csomag', 10, 245_000, 7, {
    tagline: 'Két platform, a teljes út.',
    bestFor:
      'Komolyan skálázni akarsz, és két csatornát futtatnál párhuzamosan — jellemzően Meta + Google.',
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
    bestFor: 'Webshopok, szolgáltatások, helyi vállalkozások — ahol a vizualitás visz.',
  },
  {
    id: 'google',
    name: 'Google Ads',
    sub: 'Keresés, Display, Performance Max',
    bestFor: 'Amikor már keresnek rád — a kész vásárlási szándék lefölözése.',
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
  bookingUrl: 'https://cal.com/brandmuhely/konzultacio',
  bookingNamespace: 'konzultacio',
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
      'Átveszem a Meta, Google vagy LinkedIn kampányaidat: felépítés, mérés, optimalizálás, havi riport. A fiók végig a tiéd marad, és bármikor belenézhetsz.',
    points: [
      'A hirdetési fiók a te tulajdonodban marad',
      'Havi riport, magyarul, érthetően',
      'Nincs hűségidő',
      'Bármikor átválthatsz képzésre, ha inkább megtanulnád',
    ],
  },
  {
    // TODO: Kristóffal egyeztetendő — az arculati kézikönyv említi a
    // webfejlesztést, de ő eddig nem erősítette meg. Ha nem szolgáltatás,
    // ez az egy bejegyzés törölhető, a rendszer nem függ tőle.
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
];

export const nav = [
  { href: '/kepzes', label: 'Képzés' },
  { href: '/ugynokseg', label: 'Ügynökség' },
  { href: '/arak', label: 'Árak' },
  { href: '/rolam', label: 'Rólam' },
  { href: '/eredmenyek', label: 'Eredmények' },
  { href: '/blog', label: 'Blog' },
] as const;
