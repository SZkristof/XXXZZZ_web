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
    role: 'tulajdonos',
    company: 'Szépségipar',
    half: 'kepzes',
    initials: 'DB',
  },
  {
    // Trimmed from a longer message; wording unchanged. Consent on record.
    quote:
      'Korábban az volt a problémám, hogy szerettem volna több új vendéget szerezni, de nem voltam biztos benne, hogyan érdemes Facebookon hirdetnem. 15 nap után 19 ember töltötte ki az űrlapot, közülük 12-vel már beszéltem, és 10-en azóta a vendégeim lettek. Most egy kicsit le is kellett állítanom a hirdetést, mert annyi új jelentkező érkezett, hogy nem győztem őket fogadni.',
    name: 'Németh T.',
    role: 'tulajdonos',
    company: 'Fitness',
    half: 'kepzes',
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
    industry: 'Szolgáltatás · Fitness',
    platform: 'Facebook egyéni oktatás',
    metric: 'Új fizető vendég',
    to: '10',
    timeframe: '15 nap',
    note: '19 űrlapkitöltésből. A hirdetést le kellett állítani, mert nem győzte fogadni a jelentkezőket.',
  },
  {
    industry: 'Szolgáltatás · Szépségipar',
    platform: 'Facebook egyéni oktatás',
    metric: 'Költség/vásárlás',
    from: '3 500 Ft',
    to: '1 800 Ft',
    timeframe: '2 hónap',
    note: 'Az Advantage+ kikapcsolásával és konkrét célzási stratégiákkal sikerült javítani a vásárlásonkénti költséget.',
  },
  {
    industry: 'Webshop · Sport',
    platform: 'Facebook és Google hirdetéskezelés',
    metric: 'Black Friday bevétel',
    to: '18 millió Ft',
    timeframe: '1 nap',
    note: 'Black Friday és karácsonyi akciók kampánykezelésére kértek fel, ahol 1 nap alatt értük el a közel teljes évi bevételt.',
  },
  {
    industry: 'Oktatás',
    platform: 'Facebook egyéni oktatás',
    metric: 'Költség / lead',
    to: '40 Ft',
    timeframe: 'napi 700 Ft keretből',
    note: 'Kecskeméti ügyfelemnek napi 700 forintból kellett hírlevél-feliratkozókat szereznünk egy „csali" e-mail kampányhoz.',
  },
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: 'Még soha nem hirdettem. Így is jelentkezhetek?',
    // A kérdés átfogalmazásakor a válasz nyitó "Nem."-je az ellenkezőjét
    // kezdte jelenteni ("nem jelentkezhetsz"), ezért igenlőre fordítva.
    a: 'Persze. Az ügyfeleim többsége soha nem állított be hirdetést. Együtt kattintunk végig mindent, és ha valami nem világos, átbeszéljük — nincs buta kérdés. Ha már hirdettél, akkor a szintednek megfelelően haladunk a hirdetéskezelésben, és komplexebb módszereket mutatok.',
  },
  {
    q: 'Havi 30–50 ezer forintot tudok hirdetésre költeni. Ez elég?',
    a: 'Az ügyfeleim jelentős része ebben a sávban van, és pont itt számít a legtöbbet, hogy jó helyre menjen a pénz. Kis kerettel nincs mozgástér a hibázásra — ezért éri meg megtanulni jól hirdetni.',
  },
  {
    q: 'Miben más ez, mint egy online kurzus?',
    a: 'Egy csoportos online kurzus általánosságban tanít meg az alapokra. Az én egyéni oktatásaimon a te hirdetési fiókodat nyitjuk meg, a te termékeidet és szolgáltatásaidat nézzük át, és a te kereteddel állítunk be hirdetéseket. Ha elakadsz, azonnal tudsz kérdezni, nem egy Facebook-csoportban kapsz választ három nap múlva.',
  },
  {
    q: 'Mi van, ha a végén mégis inkább kiszerveznénk?',
    a: 'Akkor is jobban jársz, mintha most szerveznéd ki: tudni fogod, mit kérsz számon. És ha tényleg ez a jó döntés, szólj — természetesen ezzel is foglalkozunk.',
  },
  {
    q: 'Mennyi idő alatt végzünk az 5 alkalommal?',
    a: 'Jellemzően 5 hét, heti egy alkalommal. Ha sietsz, heti kettővel 2–3 hét alatt is megtanulhatod a hirdetéskezelést. Ennél sűrűbben nem javaslom — a két alkalom között érdemes pihenni, mert elég intenzívek az órák.',
  },
  {
    q: 'Kapok felvételt az alkalmakról?',
    a: 'Igen, mindegyikről, felár nélkül. Az alkalom végén, legkésőbb másnap kiküldöm e-mailben. Nem kell jegyzetelned, és bármikor visszanézheted.',
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
