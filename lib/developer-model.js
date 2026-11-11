// Investičný model pre projektové stránky developerov (Lazaretská 15, Arteria Living).
// Základ prevzatý zo slovenskej kalkulačky LIVE-IN (content/sk.json → calc.script):
//   30-dňový mesiac · tržby = noci × cena · Rental Income = tržby − poplatky portálov ·
//   správa a DPH sa počítajú z Rental Income (zaokrúhlené na centy) · upratovanie podľa počtu pobytov.
// Navyše tri oddelené vrstvy: prevádzkový výsledok → financovanie → daň z príjmu.
// Všetko sú scenáre podľa zadaných predpokladov, nie prísľub výnosu.

export const MONTH_DAYS = 30
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']

// Mesačné čisté výsledky referenčného apartmánu LIVE-IN (Grösslingova, projekcia z 30. 4. 2026, spolu 13 525 €).
// Slúžia len na rozloženie ročného výsledku do mesiacov; ročný súčet sa nemení.
export const SEASON_NET = [615, 660, 930, 1070, 1320, 1370, 1480, 1480, 1350, 1030, 800, 1420]

const cent = (v) => Math.round((v + Number.EPSILON) * 100) / 100
// Percento zo sumy zaokrúhlenej na centy, rovnako ako v kalkulačke na webe.
const pct = (base, rate) => Math.round((Math.round(base * 100) * rate) / 100) / 100

// Polia kalkulačky: [kľúč, názov, jednotka, min, max, krok, skupina]
export const FIELDS = [
  { key: 'price', label: 'Kúpna cena', unit: '€', min: 0, max: 10000000, step: 1000, group: 'base' },
  { key: 'furnishing', label: 'Zariadenie a vstupné náklady', unit: '€', min: 0, max: 1000000, step: 500, group: 'base' },
  { key: 'adr', label: 'Cena za obsadenú noc', unit: '€', min: 0, max: 2000, step: 1, group: 'base', slider: [30, 250] },
  { key: 'occupancy', label: 'Obsadenosť dostupných nocí', unit: '%', min: 0, max: 100, step: 1, group: 'base', slider: [0, 100] },
  { key: 'own', label: 'Noci pre majiteľa / blokované za mesiac', unit: 'nocí', min: 0, max: 30, step: 1, group: 'base' },
  { key: 'stay', label: 'Priemerná dĺžka pobytu', unit: 'nocí', min: 1, max: 365, step: 0.01, group: 'costs' },
  { key: 'portal', label: 'Poplatky portálov', unit: '%', min: 0, max: 100, step: 0.5, group: 'costs' },
  { key: 'management', label: 'Správa LIVE-IN', unit: '%', min: 0, max: 100, step: 0.5, group: 'costs' },
  { key: 'vat', label: 'DPH v modeli', unit: '%', min: 0, max: 100, step: 0.5, group: 'costs' },
  { key: 'clean', label: 'Náklad na jedno upratovanie', unit: '€', min: 0, max: 1000, step: 0.5, group: 'costs' },
  { key: 'cleanPaid', label: 'Úhrada upratovania od hosťa na pobyt', unit: '€', min: 0, max: 1000, step: 0.5, group: 'costs' },
  { key: 'fixed', label: 'Energie, fond opráv, poistenie a dane / mes.', unit: '€', min: 0, max: 100000, step: 10, group: 'costs' },
  { key: 'software', label: 'Softvér (Guesty) / mes.', unit: '€', min: 0, max: 10000, step: 1, group: 'costs' },
]
// Nepovinné vrstvy: prázdne pole = vrstva sa nepočíta.
export const OPTIONAL_FIELDS = [
  { key: 'ltv', label: 'Hypotéka (% z kúpnej ceny)', unit: '%', min: 0, max: 100, step: 5, group: 'financing' },
  { key: 'rate', label: 'Úrok hypotéky p. a.', unit: '%', min: 0, max: 30, step: 0.1, group: 'financing' },
  { key: 'years', label: 'Splatnosť hypotéky', unit: 'rokov', min: 1, max: 40, step: 1, group: 'financing' },
  { key: 'taxRate', label: 'Sadzba dane z príjmu', unit: '%', min: 0, max: 60, step: 0.5, group: 'tax' },
]

const isBlank = (x) => x === '' || x == null
const num = (x) => (isBlank(x) ? NaN : Number(x))

/** Overí vstupy zo stavu formulára. Vracia { ok, values, errors:[{key,label,msg}] }. */
export function readValues(raw) {
  const errors = []
  const values = {}
  for (const f of FIELDS) {
    const n = num(raw[f.key])
    if (!Number.isFinite(n)) errors.push({ key: f.key, label: f.label, msg: 'Doplňte číslo.' })
    else if (n < f.min || n > f.max) errors.push({ key: f.key, label: f.label, msg: `Zadajte hodnotu od ${f.min} do ${f.max} ${f.unit}.` })
    else values[f.key] = n
  }
  for (const f of OPTIONAL_FIELDS) {
    if (isBlank(raw[f.key])) { values[f.key] = null; continue }
    const n = num(raw[f.key])
    if (!Number.isFinite(n) || n < f.min || n > f.max) errors.push({ key: f.key, label: f.label, msg: `Zadajte hodnotu od ${f.min} do ${f.max} ${f.unit} alebo pole nechajte prázdne.` })
    else values[f.key] = n
  }
  return { ok: errors.length === 0, values, errors }
}

/** Jeden 30-dňový mesiac prevádzky (vzorce ako v kalkulačke na webe). */
export function operatingMonth(v) {
  const nights = ((MONTH_DAYS - v.own) * v.occupancy) / 100
  const gross = cent(nights * v.adr)
  const portal = cent((gross * v.portal) / 100)
  const income = cent(gross - portal) // Rental Income: základ pre správu aj DPH
  const management = pct(income, v.management)
  const vat = pct(income, v.vat)
  const bookings = nights / v.stay
  const cleanGross = cent(bookings * v.clean)
  const cleanRecovery = cent(bookings * v.cleanPaid)
  const cleaning = cent(cleanGross - cleanRecovery)
  const monthly = cent(income - management - vat - cleaning - v.software - v.fixed)
  return { nights, bookings, gross, portal, income, management, vat, cleanGross, cleanRecovery, cleaning, monthly }
}

/** Rozloženie ročného výsledku do 12 mesiacov. 'flat' = rovnako, 'profile' = podľa SEASON_NET. Súčet = annual presne. */
export function seasonalMonths(annual, mode = 'flat') {
  const total = SEASON_NET.reduce((a, b) => a + b, 0)
  const annualCents = Math.round(annual * 100)
  let used = 0
  return MONTHS.map((label, i) => {
    const share = mode === 'profile' ? SEASON_NET[i] / total : 1 / 12
    const cents = i < 11 ? Math.round(annualCents * share) : annualCents - used
    used += cents
    return { label, share, value: cents / 100 }
  })
}

/** Hypotéka: anuitná splátka, úroky a istina za prvý rok. */
export function loanTerms({ price, ltv, rate, years }) {
  const loan = cent((price * (ltv || 0)) / 100)
  const n = Math.round((years || 0) * 12)
  if (!(loan > 0) || !(n > 0) || !Number.isFinite(rate)) return { loan: loan > 0 ? loan : 0, payment: 0, annualDebt: 0, interestYear1: 0, principalYear1: 0, months: n > 0 ? n : 0 }
  const r = rate / 1200
  const payment = r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n))
  let balance = loan
  let interest = 0
  const k = Math.min(12, n)
  for (let i = 0; i < k; i++) { const it = balance * r; interest += it; balance -= payment - it }
  const annualDebt = payment * k
  return { loan, payment: cent(payment), annualDebt: cent(annualDebt), interestYear1: cent(interest), principalYear1: cent(annualDebt - interest), months: n }
}

/** Obsadenosť, pri ktorej je prevádzkový výsledok nula (null = ani pri 100 % nie je kladný). */
export function breakEvenOccupancy(v) {
  const f = (occupancy) => operatingMonth({ ...v, occupancy }).monthly
  const a = f(0)
  const slope = (f(100) - a) / 100
  if (!(slope > 0)) return null
  const be = -a / slope
  return be <= 100 ? be : null
}

/** Citlivosť ročného prevádzkového výnosu (% z investície) na cenu za noc a obsadenosť. */
export function sensitivity(v, { occs = [50, 60, 70, 80], adrDeltas = [-10, 0, 10] } = {}) {
  const investment = v.price + v.furnishing
  return adrDeltas.map((d) => {
    const adr = Math.max(0, v.adr + d)
    return { adr, cells: occs.map((occupancy) => { const annual = operatingMonth({ ...v, adr, occupancy }).monthly * 12; return { occupancy, annual, yield: investment > 0 ? (annual / investment) * 100 : null } }) }
  })
}

/** Celý model: prevádzka → (financovanie) → (daň). Vstup musí prejsť readValues. */
export function investmentResult(v, { season = 'flat' } = {}) {
  const month = operatingMonth(v)
  const annual = cent(month.monthly * 12)
  const investment = v.price + v.furnishing
  const out = {
    ...month,
    annual,
    investment,
    yield: investment > 0 ? (annual / investment) * 100 : null,
    breakEven: breakEvenOccupancy(v),
    months: seasonalMonths(annual, season),
    financing: null,
    tax: null,
  }
  const wantsLoan = v.ltv != null && v.ltv > 0
  let interest = 0
  if (wantsLoan) {
    const incomplete = v.rate == null || v.years == null
    const t = incomplete ? { loan: cent((v.price * v.ltv) / 100), payment: 0, annualDebt: 0, interestYear1: 0, principalYear1: 0 } : loanTerms(v)
    const equity = investment - t.loan
    const afterFinancing = cent(annual - t.annualDebt)
    interest = t.interestYear1
    out.financing = { ...t, incomplete, equity, afterFinancing, cashOnCash: !incomplete && equity > 0 ? (afterFinancing / equity) * 100 : null }
  }
  if (v.taxRate != null) {
    // Zjednodušený základ: prevádzkový výsledok mínus úroky z hypotéky v prvom roku. Odpisy, odpočty a právna forma sa nezohľadňujú.
    const base = Math.max(0, cent(annual - interest))
    const tax = cent((base * v.taxRate) / 100)
    const before = out.financing && !out.financing.incomplete ? out.financing.afterFinancing : annual
    out.tax = { rate: v.taxRate, base, tax, afterTax: cent(before - tax) }
  }
  return out
}

// ——— Formátovanie bez Intl, aby server a prehliadač vypísali presne to isté (bez rozdielov v ICU). ———
const NBSP = ' '
const group = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
export function formatMoney(v) {
  if (v == null || !Number.isFinite(v)) return '—'
  const r = Math.round(Math.abs(v))
  return `${v < 0 && r > 0 ? '−' : ''}${group(String(r))}${NBSP}€`
}
export function formatNumber(v, digits = 2) {
  if (v == null || !Number.isFinite(v)) return '—'
  const f = Math.round(Math.abs(v) * 10 ** digits) / 10 ** digits
  const [i, d] = f.toFixed(digits).split('.')
  const dec = d ? d.replace(/0+$/, '') : ''
  return `${v < 0 && f > 0 ? '−' : ''}${group(i)}${dec ? ',' + dec : ''}`
}
export const formatPercent = (v, digits = 1) => (v == null || !Number.isFinite(v) ? '—' : `${formatNumber(v, digits)}${NBSP}%`)
