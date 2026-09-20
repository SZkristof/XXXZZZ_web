/**
 * Real, consented proof.
 *
 * Every entry below is from a named client who gave written permission to
 * publish it. Publishing invented testimonials is unlawful in Hungary
 * (Fttv. / GVH, and the EU Omnibus directive) — so while
 * PROOF_IS_PLACEHOLDER is true, `npm run build:prod` refuses to build and the
 * pages show a visible developer warning.
 *
 * Adding a new entry: quotes are trimmed for length but never reworded, and
 * nothing goes in without the client's consent on record.
 */
export const PROOF_IS_PLACEHOLDER = false;

/** Which half of the business the work belonged to. */
export type Half = 'kepzes' | 'ugynokseg';

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  half: Half;
  /** Optional: only set when the client's situation clearly matches a track. */
  track?: string;
  initials: string;
};

export const testimonials: Testimonial[] = [
  {
    // Trimmed from a longer message; wording unchanged. Consent on record.
    quote:
      'Azzal kerestem meg őket, hogy segítsenek végre átlátni, hogy a jelenlegi hirdetéseink valóban jól működnek-e. Kristóf nagyon részletesen végigment a marketingünkön — és ami számomra különösen hasznos volt: nemcsak elmondta, mit kellene másképp csinálnunk, hanem együtt át is szerkesztettük és optimalizáltuk a kampányokat. Nem általános marketingelmélet volt, hanem kifejezetten a saját vállalkozásunkra szabott, gyakorlatias segítség.',
    name: 'Demeter B.',
    role: 'ügyvezető és tulajdonos',
    company: 'Heaven Laser & Beauty',
    half: 'kepzes',
    initials: 'DB',
  },
  {
    // Trimmed from a longer message; wording unchanged. Consent on record.
    quote:
      'Korábban az volt a problémám, hogy szerettem volna több új vendéget szerezni, de nem voltam biztos benne, hogyan érdemes Facebookon hirdetnem. 15 nap után 19 ember töltötte ki az űrlapot, közülük 12-vel már beszéltem, és 10-en azóta a vendégeim lettek. Most egy kicsit le is kellett állítanom a hirdetést, mert annyi új jelentkező érkezett, hogy nem győztem őket fogadni.',
    name: 'Németh T.',
    role: 'tulajdonos',
    company: 'Naturalpilates',
    half: 'ugynokseg',
    initials: 'NT',
  },
];

export type Result = {
  industry: string;
  /** Optional: only when the client stated it. */
  size?: string;
  platform: string;
  metric: string;
  /** Optional: some results are a single figure, not a before/after move. */
  from?: string;
  to: string;
  timeframe: string;
  note: string;
};

export const results: Result[] = [
  {
    // Figures as reported by the client in the testimonial above.
    industry: 'Szolgáltatás · pilates stúdió',
    platform: 'Meta Ads',
    metric: 'Új vendég',
    to: '10',
    timeframe: '15 nap',
    note: '19 űrlapkitöltésből. A hirdetést le kellett állítani, mert nem győzte fogadni a jelentkezőket.',
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
