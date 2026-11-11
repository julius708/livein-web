// Údaje projektových stránok pre developerov. Všetko, čo čaká na potvrdenie, je označené (status, fill, asOf).
// Ceny Lazaretskej 15 sú historické (analýza LIVE-IN z 15. 9. 2026); Arteria Living zatiaľ nemá cenník ani pôdorysy.
export { investmentResult, operatingMonth, readValues, FIELDS, OPTIONAL_FIELDS, sensitivity, breakEvenOccupancy, seasonalMonths, loanTerms, formatMoney, formatNumber, formatPercent, MONTHS, SEASON_NET } from './developer-model.js'

// Zdroje použité v predpokladoch kalkulačky (každý má dátum).
export const SOURCES = {
  priceLabs: 'PriceLabs Market Data, 8. 11. 2026 (zdroj webovej kalkulačky LIVE-IN): Staré Mesto – širšie centrum, 1 spálňa, 290 listingov, medián 83 €/noc, rozpätie 71–98 €.',
  portfolio: 'Portfólio LIVE-IN (webová kalkulačka, posledných 12 mesiacov): Staré Mesto, 1 spálňa, 20 bytov, medián 68,72 €/noc.',
  reference: 'Referenčný apartmán LIVE-IN na Grösslingovej, projekcia z 30. 4. 2026: 75 €/noc a obsadenosť 70 %. LIVE-IN ju označila za konzervatívny, ale realistický priemer.',
  stay: 'Webová kalkulačka LIVE-IN: Bratislava, 1 spálňa, 1 126 nezrušených rezervácií, snímka z 12. 10. 2026 (realizácia pobytov nie je účtovne overená).',
  calc: 'Webová kalkulačka LIVE-IN (content/sk.json): predvolená hodnota.',
  analysis: 'Analýza LIVE-IN z 15. 9. 2026 (investičný apartmán v centre Bratislavy): fixné náklady 2 400 €/rok (energie, internet, údržba, poistenie, fond opráv, daň z nehnuteľností). Pre tento projekt treba potvrdiť.',
  feeDev: 'Zvýhodnená sadzba LIVE-IN pre projekty developerov: 15 % z Rental Income (bežná trhová sadzba je 17 %). Konkrétna sadzba sa dohodne s developerom.',
  brief: 'Zadanie LIVE-IN z 11. 11. 2026.',
}

const scenarios = (note = '') => [
  { id: 'cautious', label: 'Opatrný', adr: 90, occupancy: 60, source: `Cena o približne 8 % pod priemerom 98 € a obsadenosť 60 %, teda pod hodnotou AirDNA pre Bratislavu (66 %, 5. 11. 2026). Predpoklad LIVE-IN, nie údaj z trhu.${note}` },
  { id: 'base', label: 'Základný', adr: 98, occupancy: 70, source: `Priemerná cena za noc okolo 98 € bez poplatkov (zadanie LIVE-IN z 11. 11. 2026, predpoklad pre tieto apartmány). Obsadenosť 70 % ako v referenčnom apartmáne LIVE-IN na Grösslingovej (projekcia z 30. 4. 2026).${note}` },
  { id: 'high', label: 'Vyšší', adr: 105, occupancy: 75, source: `Horná hranica z analýzy LIVE-IN z 15. 9. 2026: cena do 105 € a obsadenosť do 75 %. Byty v správe LIVE-IN dosahujú v priemere okolo 80 %, nie je to garancia.${note}` },
]

// Rovnaké predpoklady pre obe ukážky; projekt prepíše len to, čo sa naozaj líši.
const baseCalc = {
  furnishing: 15000, own: 0, stay: 3.77, portal: 15, vat: 5, clean: 25, cleanPaid: 0, fixed: 200, software: 50,
  furnishingStatus: 'illustrative', // ilustračný predpoklad, nie ponuka
}

export const projects = {
  'lazaretska-15': {
    name: 'Lazaretská 15',
    location: 'Bratislava · Staré Mesto',
    partner: 'Peter Valentín',
    partnerLine: 'Projekt Petra Valentína',
    headline: 'Malý priestor. Veľká mestská adresa.',
    intro: 'Vyberte si apartmán, pozrite si jeho parametre a preskúmajte model prenájmu so správou LIVE-IN.',
    source: 'Historická analýza z 15. 9. 2026. Ceny a dostupnosť čakajú na potvrdenie developera.',
    asOf: '15. 9. 2026',
    mapQuery: 'Lazaretská 15 Bratislava',
    facts: ['8 jednotiek v historickej ponuke', '23–34 m²', 'Staré Mesto, Bratislava'],
    aboutProject: [
      'Rekonštrukcia historického domu v Starom Meste, predávaná ako malé apartmány vhodné na bývanie aj na prenájom.',
      'Osem apartmánov s výmerou 23–34 m². Sedem z ôsmich má historickú cenu pod 240 000 €.',
    ],
    fills: ['Právny subjekt developera a referencie', 'Harmonogram výstavby a odovzdania', 'Schválené vizualizácie a pôdorysy', 'Aktuálny cenník a dostupnosť'],
    units: [
      { id: 'AP 13', area: 31.08, price: 214000, floor: '2. NP', layout: '1+kk', orientation: 'Východ · vnútroblok' },
      { id: 'AP 14', area: 27.11, price: 191000, floor: '2. NP', layout: '1+kk', orientation: 'Východ · vnútroblok' },
      { id: 'AP 10', area: 30.04, price: 216000, floor: '2. NP', layout: '1+kk', orientation: 'Západ · ulica' },
      { id: 'AP 26', area: 33.09, price: 240000, floor: '4.–5. NP', layout: '2+kk · mezanín', orientation: 'Západ · ulica' },
      { id: 'AP 100', area: 23.26, price: 172000, floor: '1. NP · prízemie', layout: '1+kk', orientation: 'Západ · ulica' },
      { id: 'AP 20', area: 24.09, price: 189000, floor: '3. NP', layout: '1+kk', orientation: 'Západ · ulica' },
      { id: 'AP 12', area: 24.9, price: 197000, floor: '2. NP', layout: '1+kk', orientation: 'Západ · ulica' },
      { id: 'AP 1', area: 34.29, price: 234000, floor: '1. NP · prízemie', layout: '1+kk', orientation: 'Západ · ulica' },
    ],
    calc: { ...baseCalc, management: 15, managementSource: SOURCES.feeDev, scenarios: scenarios(), illustrativePrice: null },
    // Porovnanie s trhom: doložené údaje z analýzy z 15. 9. 2026 (inzerované ceny, nie transakčné).
    market: {
      asOf: 'september 2026',
      curve: { a: 8471, b: 38, n: 28 }, // €/m² = a − b × výmera (regresia 27 porovnateľných ponúk 18–46 m²)
      note: 'Údaje z analýzy LIVE-IN z 15. 9. 2026. Ide o inzerované ceny, nie o skutočne dosiahnuté predajné ceny. Pred ostrým použitím ich treba overiť.',
      rows: [
        { label: 'UNO Poštová · apartmán s terasou', kind: 'rekonštrukcia', area: 41.86, price: 399681 },
        { label: 'UNO Poštová · 1+kk apartmán', kind: 'rekonštrukcia', area: 34.4, price: 308966 },
        { label: 'Metropolis · Bottova · 1i byt', kind: 'novostavba', area: 43.1, price: 369990 },
        { label: 'Vydrica · Žižkova · 1,5i byt', kind: 'novostavba 2025', area: 40.2, price: 326900 },
        { label: 'Krížna · garzónka s parkovaním', kind: 'inzerát', area: 23.0, price: 178500 },
        { label: 'Nám. 1. mája · garzónka', kind: 'inzerát', area: 30.0, price: 219000 },
        { label: 'Svetlá (Bôrik) · zrekonštruovaná garzónka', kind: 'inzerát', area: 25.36, price: 176990 },
        { label: 'Lazaretská · garzónka v existujúcom dome', kind: 'inzerát', area: 35.0, price: 215000 },
        { label: 'Panorama City · Landererova · apartmán', kind: 'novostavba', area: 44.12, price: 265000 },
        { label: 'Obchodná 39 · 1i byt po rekonštrukcii', kind: 'inzerát', area: 42.31, price: 259000 },
      ],
    },
    checklist: [
      ['Zápis na liste vlastníctva a účel užívania', 'Rozhoduje o hypotéke, dani z nehnuteľnosti a o tom, či je krátkodobý prenájom bez sporu. Treba písomné potvrdenie od developera.'],
      ['Harmonogram a zabezpečenie zálohy', 'Termín dokončenia a odovzdania, forma zabezpečenia zálohy (viazaný účet alebo notárska úschova) a sankcie za omeškanie.'],
      ['Záväzná tolerancia plochy', 'Plochy v katalógu sú orientačné. Pri 23–34 m² je jeden meter rozdiel približne 7 000–8 000 € v hodnote.'],
      ['Štandard vybavenia a mesačné poplatky', 'Rozpis štandardu, energetická trieda, výška poplatkov a fond opráv.'],
      ['Registrácia jednotky krátkodobého ubytovania', 'Zákon č. 133/2026 Z. z. platí od 1. 1. 2027; existujúci prevádzkovatelia sa registrujú do 28. 2. 2027 (podľa analýzy z 15. 9. 2026, treba overiť).'],
    ],
    operator: null,
    reportLabel: 'Peter Valentín',
  },
  'arteria-living': {
    name: 'Arteria Living',
    location: 'Bratislava · Cintorínska / Rajská',
    partner: 'Lordship',
    partnerLine: 'Projekt Lordship',
    headline: 'Investícia v centre. Prevádzka v dobrých rukách.',
    intro: 'Návrh prezentácie projektu s prepojením predaja investorom a následnej správy apartmánov pod značkou LIVE-IN.',
    source: 'Podľa komunikácie z apríla 2026 približne 80 apartmánov v troch domoch. Aktuálny rozsah a ponuku doplní Lordship.',
    asOf: 'apríl 2026',
    mapQuery: 'Cintorínska Rajská Bratislava',
    facts: ['Približne 80 apartmánov podľa podkladov', '3 domy', 'Model správy pre investorov'],
    aboutProject: [
      'Tri bytové domy s približne 80 apartmánmi v centre Bratislavy na Cintorínskej a Rajskej ulici (podľa komunikácie z 24. 4. 2026).',
      'Navrhovaný model: byty predávané individuálnym investorom, ktorí ich zveria do spoločného prenájmu pod jedným operátorom. Rozsah a podmienky potvrdí Lordship.',
    ],
    fills: ['Aktuálny počet a typy jednotiek', 'Cenník, pôdorysy a dostupnosť', 'Schválené vizualizácie projektu', 'Podmienky rental poolu a odmena operátora'],
    units: [
      { id: 'Modelová jednotka', area: null, price: null, floor: 'Na doplnenie', layout: 'Na doplnenie', orientation: 'Na doplnenie' },
    ],
    calc: {
      ...baseCalc, management: 15, managementSource: SOURCES.feeDev, scenarios: scenarios(' Typ a veľkosť jednotiek doplní Lordship, cenu za noc potom prepočítame.'),
      illustrativePrice: 190000,
    },
    market: null,
    checklist: [
      ['Podmienky rental poolu', 'Rozdelenie príjmov medzi investorov, odmena operátora (LIVE-IN navrhla 15 % z výnosu, nie je dohodnuté) a ukončenie spolupráce.'],
      ['Zápis na liste vlastníctva a účel užívania', 'Rozhoduje o hypotéke, dani z nehnuteľnosti a o tom, či je krátkodobý prenájom bez sporu.'],
      ['Harmonogram a zabezpečenie zálohy', 'Termín dokončenia a odovzdania, forma zabezpečenia zálohy a sankcie za omeškanie.'],
      ['Štandard vybavenia a mesačné poplatky', 'Rozpis štandardu, energetická trieda, výška poplatkov a fond opráv.'],
      ['Registrácia jednotky krátkodobého ubytovania', 'Zákon č. 133/2026 Z. z. platí od 1. 1. 2027 (podľa analýzy z 15. 9. 2026, treba overiť).'],
    ],
    operator: 'Rental pool pod jedným operátorom: každý investor má osobný prístup iba k svojim apartmánom, príjmy a vyúčtovania sa vedú za každého vlastníka zvlášť (návrh LIVE-IN z 27. 4. 2026).',
    reportLabel: 'Lordship',
  },
}

// Čo LIVE-IN zabezpečí pre projekt (obsah vychádza z návrhu LIVE-IN z 27. 4. 2026).
export const SERVICES = [
  ['Predaj investorom', 'Dopyty z databázy LIVE-IN a z marketingu sa evidujú na jednom mieste. Developer dostane len dopyty, o ktoré záujemca požiadal.'],
  ['Prevádzka po kúpe', 'Príprava a fotografie, listingy na Airbnb, Booking.com a Vrbo, cenotvorba cez PriceLabs, komunikácia s hosťami, upratovanie, prádlo, údržba a reporting.'],
  ['Prehľad pre majiteľa', 'Osobný prístup k príjmom, obsadenosti a kalendáru rezervácií a mesačný výpis s prehľadom príjmov a nákladov.'],
  ['Prehľad pre developera', 'Stav každého dopytu od kontaktu po predaj a evidencia provízie. Pripravuje sa v ďalšej fáze.'],
]

/** Trhová krivka z analýzy: orientačná cena za m² pre výmeru. */
export const curvePerM2 = (curve, area) => curve.a - curve.b * area
/** Odchýlka ceny za m² jednotky od trhovej krivky v %. */
export function deviationFromCurve(unit, curve) {
  if (!unit || !unit.area || !unit.price) return null
  return ((unit.price / unit.area) / curvePerM2(curve, unit.area) - 1) * 100
}
