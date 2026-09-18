/**
 * ⚠️  PLACEHOLDER PROOF DATA  ⚠️
 *
 * Every entry below is INVENTED for layout purposes. Publishing invented
 * testimonials or results is illegal in Hungary (Fogyasztóvédelmi tv. / GVH
 * rules on misleading commercial practice, and the EU Omnibus directive),
 * not merely bad taste.
 *
 * Replace each entry with a real one, then set PROOF_IS_PLACEHOLDER = false.
 * While it is true, the build prints a loud warning and `npm run build:prod`
 * refuses to complete.
 */
export const PROOF_IS_PLACEHOLDER = true;

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  track: string;
  initials: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      'Két ügynökség után azt hittem, a baj velem van. Kiderült, hogy egyszerűen nem mérte senki rendesen, mi történik. A harmadik alkalom után már én találtam meg, melyik kampány viszi el a keretet.',
    name: 'Placeholder Anna',
    role: 'ügyvezető',
    company: 'PLACEHOLDER Kft.',
    track: 'Futnak, de gyengén',
    initials: 'PA',
  },
  {
    quote:
      'Soha nem hirdettem még. Azt vártam, hogy technikai lesz és nem fogom érteni. Ehelyett végig a saját termékeimről beszéltünk, és az ötödik alkalomra élesben ment az első kampányom.',
    name: 'Placeholder Béla',
    role: 'tulajdonos',
    company: 'PLACEHOLDER Bt.',
    track: 'Most kezdem',
    initials: 'PB',
  },
  {
    quote:
      'Nem én rakom a hirdetéseket, van rá emberem. De eddig nem tudtam, mit kérdezzek tőle. Most már tudom, és ez a két alkalom többet ért, mint az elmúlt egy év riportjai.',
    name: 'Placeholder Csaba',
    role: 'ügyvezető',
    company: 'PLACEHOLDER Zrt.',
    track: 'Vezetőként',
    initials: 'PC',
  },
  {
    quote:
      'A felvételek miatt nem kellett jegyzetelnem, végig tudtam figyelni. Utólag háromszor visszanéztem azt a részt, ahol a közönségeket állítottuk be.',
    name: 'Placeholder Dóra',
    role: 'marketinges',
    company: 'PLACEHOLDER Kft.',
    track: 'Most kezdem',
    initials: 'PD',
  },
];

export type Result = {
  industry: string;
  size: string;
  platform: string;
  metric: string;
  from: string;
  to: string;
  timeframe: string;
  note: string;
};

export const results: Result[] = [
  {
    industry: 'Webshop · sportfelszerelés',
    size: '6 fő',
    platform: 'Meta Ads',
    metric: 'ROAS',
    from: '1,8×',
    to: '4,3×',
    timeframe: '9 hét',
    note: 'A költés nem nőtt — a szerkezet változott meg.',
  },
  {
    industry: 'Szolgáltatás · fogászat',
    size: '11 fő',
    platform: 'Google Ads',
    metric: 'Egy érdeklődő ára',
    from: '9 400 Ft',
    to: '3 100 Ft',
    timeframe: '6 hét',
    note: 'Kereső kampányok újraépítése, kizáró kulcsszavakkal.',
  },
  {
    industry: 'B2B · ipari beszállító',
    size: '24 fő',
    platform: 'LinkedIn Ads',
    metric: 'Havi minősített lead',
    from: '3 db',
    to: '17 db',
    timeframe: '3 hónap',
    note: 'Pozíció és cégméret szerinti célzás, új üzenettel.',
  },
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: 'Nem értek a technikához. Ez baj?',
    a: 'Nem. Az ügyfeleim többsége soha nem állított be hirdetést. Együtt kattintunk végig mindent, és ha valami nem világos, addig maradunk rajta, amíg az lesz. Nincs olyan kérdés, ami túl alap.',
  },
  {
    q: 'Havi 30–50 ezer forintot tudok hirdetésre költeni. Ez neked kicsi?',
    a: 'Nem. Az ügyfeleim jelentős része ebben a sávban van, és pont itt számít a legtöbbet, hogy jó helyre megy a pénz. Kis kerettel nincs mozgástér a hibázásra — ezért éri meg megtanulni.',
  },
  {
    q: 'Miben más ez, mint egy online kurzus?',
    a: 'Egy kurzus általánosságban beszél. Itt a te hirdetési fiókodat nyitjuk meg, a te termékeidet nézzük, és a te kereteddel számolunk. Ha elakadsz, azonnal kérdezel, nem egy fórumon három nap múlva.',
  },
  {
    q: 'Mi van, ha a végén mégis inkább kiszerveznénk?',
    a: 'Akkor is jobban jársz, mintha most szerveznéd ki: tudni fogod, mit kérsz számon. És ha tényleg ez a jó döntés, szólj — ezt is meg tudom oldani.',
  },
  {
    q: 'Mennyi idő alatt végzünk az 5 alkalommal?',
    a: 'Jellemzően 5 hét, heti egy alkalommal. Ha sietsz, heti kettővel 3 hét alatt is megvan. Ennél sűrűbben nem javaslom — a két alkalom között dolgozni is kell a kampányokon.',
  },
  {
    q: 'Kapok felvételt az alkalmakról?',
    a: 'Igen, mindegyikről, felár nélkül. Az alkalom végén küldöm. Nem kell jegyzetelned, és bármikor visszanézheted.',
  },
  {
    q: 'Egyszerre több platformot is tanulhatok?',
    a: 'Igen. Az 5 alkalmas csomag egy platformra épül, a 10 alkalmasba kettő fér bele — a leggyakoribb páros a Meta és a Google.',
  },
  {
    q: 'Mi történik az ingyenes konzultáción?',
    a: '30 perc, Google Meeten. Elmondod, mivel foglalkozol és hol tartasz, én pedig megmondom, tudok-e segíteni. Ha úgy látom, hogy nem, azt is megmondom — nem adok el neked olyat, aminek nincs értelme.',
  },
];
