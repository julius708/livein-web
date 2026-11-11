import test from 'node:test'
import assert from 'node:assert/strict'
import { investmentResult, readValues, operatingMonth, breakEvenOccupancy, seasonalMonths, loanTerms, sensitivity, formatMoney, formatNumber, formatPercent, FIELDS, SEASON_NET } from '../lib/developer-model.js'
import { projects, deviationFromCurve, curvePerM2 } from '../lib/developer-projects.js'

const base = { price: 214000, furnishing: 15000, adr: 75, occupancy: 70, own: 0, stay: 3.77, portal: 15, management: 17, vat: 5, clean: 32.5, cleanPaid: 0, fixed: 200, software: 50, ltv: '', rate: '', years: '', taxRate: '' }
const read = (o = {}) => { const r = readValues({ ...base, ...o }); assert.ok(r.ok, JSON.stringify(r.errors)); return r.values }

test('SK kalkulačka: rovnaké vzorce (správa a DPH z Rental Income, zaokrúhlené na centy)', () => {
  // Hodnoty overené proti funkcii calculate() z content/sk.json (portal 0, fixed 0, správa 17 %, DPH 5 %, Guesty 50 €).
  const m = operatingMonth(read({ adr: 100, occupancy: 72, stay: 3, clean: 32.5, portal: 0, fixed: 0, management: 17 }))
  assert.equal(m.nights, 21.6)
  assert.equal(m.gross, 2160)
  assert.equal(m.income, 2160)
  assert.equal(m.management, 367.2)
  assert.equal(m.vat, 108)
  assert.equal(m.cleaning, 234)
  assert.equal(m.monthly, 2160 - 367.2 - 108 - 234 - 50)
})
test('správa sa počíta z Rental Income po portáloch, nie z hrubých tržieb', () => {
  const m = operatingMonth(read({ portal: 15 }))
  assert.equal(m.income, m.gross - m.portal)
  assert.equal(m.management, Math.round(Math.round(m.income * 100) * 17 / 100) / 100)
})
test('uhradené upratovanie od hosťa znižuje čistý náklad, nie tržby', () => {
  const a = operatingMonth(read({ cleanPaid: 0 })), b = operatingMonth(read({ cleanPaid: 32.5 }))
  assert.equal(b.cleaning, 0); assert.equal(b.income, a.income); assert.ok(b.monthly > a.monthly)
})
test('nulová obsadenosť: žiadne tržby ani upratovanie, iba fixné náklady', () => {
  const m = operatingMonth(read({ occupancy: 0 }))
  assert.equal(m.gross, 0); assert.equal(m.cleaning, 0); assert.equal(m.monthly, -250)
  assert.equal(breakEvenOccupancy(read({ occupancy: 0 })) > 0, true)
})
test('vlastné noci znižujú tržby; 30 vlastných nocí = nulové tržby', () => {
  assert.ok(operatingMonth(read({ own: 10 })).gross < operatingMonth(read()).gross)
  assert.equal(operatingMonth(read({ own: 30 })).gross, 0)
})
test('neplatné a prázdne vstupy sa odmietnu s popisom', () => {
  for (const bad of [{ price: '' }, { occupancy: 101 }, { occupancy: -1 }, { stay: 0 }, { adr: 'abc' }, { own: 31 }, { management: 150 }]) {
    const r = readValues({ ...base, ...bad }); assert.equal(r.ok, false, JSON.stringify(bad)); assert.ok(r.errors[0].msg.length > 5)
  }
  assert.equal(readValues({ ...base, ltv: 50, rate: 200 }).ok, false)
  assert.equal(readValues({ ...base, taxRate: -5 }).ok, false)
})
test('každé pole má rozumné hranice a krok', () => {
  for (const f of FIELDS) { assert.ok(f.min < f.max && f.step > 0, f.key) }
})
test('ročný výsledok = 12 mesiacov; súčet mesiacov v oboch režimoch sedí presne', () => {
  const v = read(), r = investmentResult(v)
  assert.equal(r.annual, Math.round(r.monthly * 12 * 100) / 100)
  for (const mode of ['flat', 'profile']) {
    const months = seasonalMonths(r.annual, mode)
    assert.equal(months.length, 12)
    assert.equal(Math.round(months.reduce((a, b) => a + b.value, 0) * 100), Math.round(r.annual * 100))
  }
  assert.equal(SEASON_NET.reduce((a, b) => a + b, 0), 13525)
  const flat = seasonalMonths(r.annual, 'flat'); assert.ok(flat.every((m) => Math.abs(m.value - r.monthly) < 0.011))
})
test('sezónny profil: júl a august najsilnejšie, január najslabší', () => {
  const m = seasonalMonths(12000, 'profile'), by = (l) => m.find((x) => x.label === l).value
  assert.ok(by('Júl') > by('Jan') && by('Aug') === by('Júl'))
})
test('investičný výnos = ročný prevádzkový výsledok / (cena + zariadenie)', () => {
  const r = investmentResult(read()); assert.ok(Math.abs(r.yield - (r.annual / 229000) * 100) < 1e-9)
  assert.equal(r.investment, 229000)
  assert.equal(investmentResult(read({ price: 0, furnishing: 0 })).yield, null)
})
test('bod zvratu: pri tejto obsadenosti je výsledok nula; nedosiahnuteľný = null', () => {
  const v = read(), be = breakEvenOccupancy(v)
  assert.ok(be > 0 && be < 100)
  assert.ok(Math.abs(operatingMonth({ ...v, occupancy: be }).monthly) < 0.5)
  assert.equal(breakEvenOccupancy(read({ adr: 0 })), null)
})
test('hypotéka: anuita, úroky prvého roka a nulový úrok', () => {
  const t = loanTerms({ price: 200000, ltv: 50, rate: 4, years: 25 })
  assert.equal(t.loan, 100000)
  assert.ok(Math.abs(t.payment - 527.84) < 0.05) // štandardná anuita 100 000 € / 4 % / 25 r.
  assert.ok(t.interestYear1 > 3900 && t.interestYear1 < 4000)
  assert.ok(Math.abs(t.annualDebt - (t.interestYear1 + t.principalYear1)) < 0.02)
  assert.equal(loanTerms({ price: 120000, ltv: 50, rate: 0, years: 10 }).payment, 500)
  assert.equal(loanTerms({ price: 100000, ltv: 0, rate: 4, years: 25 }).annualDebt, 0)
})
test('financovanie sa nepočíta, kým nie je úrok a splatnosť; daň len po zadaní sadzby', () => {
  assert.equal(investmentResult(read()).financing, null)
  assert.equal(investmentResult(read()).tax, null)
  const inc = investmentResult(read({ ltv: 50 })); assert.equal(inc.financing.incomplete, true); assert.equal(inc.financing.cashOnCash, null)
  const f = investmentResult(read({ ltv: 50, rate: 4.5, years: 25 })).financing
  assert.equal(f.incomplete, false); assert.equal(f.equity, 229000 - 107000)
  assert.ok(f.afterFinancing < investmentResult(read()).annual)
})
test('daň: základ = prevádzkový výsledok − úroky; nikdy záporná', () => {
  const r = investmentResult(read({ ltv: 60, rate: 5, years: 25, taxRate: 19 }))
  assert.equal(r.tax.base, Math.max(0, Math.round((r.annual - r.financing.interestYear1) * 100) / 100))
  assert.ok(r.tax.tax >= 0 && r.tax.afterTax <= r.financing.afterFinancing)
  const loss = investmentResult(read({ adr: 10, taxRate: 19 })); assert.equal(loss.tax.tax, 0)
  assert.equal(investmentResult(read({ taxRate: 0 })).tax.afterTax, investmentResult(read()).annual)
})
test('citlivosť: stred mriežky zodpovedá základnému scenáru', () => {
  const v = read({ occupancy: 70 }), g = sensitivity(v, { occs: [70], adrDeltas: [0] })
  assert.ok(Math.abs(g[0].cells[0].yield - investmentResult(v).yield) < 1e-9)
})
test('formátovanie: pevná medzera, desatinná čiarka, záporné čísla', () => {
  assert.equal(formatMoney(214000), '214 000 €')
  assert.equal(formatMoney(-1234.6), '−1 235 €')
  assert.equal(formatMoney(-0.2), '0 €')
  assert.equal(formatMoney(null), '—'); assert.equal(formatMoney(NaN), '—')
  assert.equal(formatNumber(31.08), '31,08'); assert.equal(formatNumber(3.5, 2), '3,5'); assert.equal(formatNumber(1234567.891, 1), '1 234 567,9')
  assert.equal(formatPercent(3.214), '3,2 %'); assert.equal(formatPercent(null), '—')
})

test('Lazaretská 15: údaje sedia s analýzou z 15. 9. 2026 (8 jednotiek, 227,86 m², 1 653 000 €)', () => {
  const u = projects['lazaretska-15'].units
  assert.equal(u.length, 8)
  assert.equal(Math.round(u.reduce((a, b) => a + b.area, 0) * 100) / 100, 227.86)
  assert.equal(u.reduce((a, b) => a + b.price, 0), 1653000)
  assert.equal(Math.round(1653000 / 227.86), 7254)
  assert.ok(u.every((x) => x.id && x.area > 0 && x.price > 0))
})
test('odchýlka od trhovej krivky zodpovedá analýze (AP 13 −5,6 %, AP 12 +5,1 %)', () => {
  const p = projects['lazaretska-15'], by = (id) => p.units.find((u) => u.id === id)
  const near = (x, y) => Math.abs(x - y) < 0.3
  assert.ok(near(deviationFromCurve(by('AP 13'), p.market.curve), -5.6))
  assert.ok(near(deviationFromCurve(by('AP 12'), p.market.curve), 5.1))
  assert.ok(near(deviationFromCurve(by('AP 26'), p.market.curve), 0.5))
  const avg = p.units.reduce((a, u) => a + deviationFromCurve(u, p.market.curve), 0) / 8
  assert.ok(Math.abs(avg - -1.4) < 0.3, String(avg))
  assert.equal(deviationFromCurve({ area: null, price: null }, p.market.curve), null)
  assert.equal(Math.round(curvePerM2(p.market.curve, 30)), 7331)
})
test('porovnateľné ponuky: cena za m² zodpovedá uvedeným údajom z analýzy', () => {
  const rows = projects['lazaretska-15'].market.rows
  const expected = [9548, 8982, 8584, 8132, 7761, 7300, 6979, 6143, 6006, 6121]
  rows.forEach((r, i) => assert.ok(Math.abs(r.price / r.area - expected[i]) < 1.5, r.label))
})
test('Arteria Living: modelová jednotka bez ceny, projekt má vlastnú províziu 15 % a ilustračnú cenu', () => {
  const a = projects['arteria-living']
  assert.equal(a.units[0].price, null); assert.equal(a.calc.management, 15); assert.ok(a.calc.illustrativePrice > 0); assert.equal(a.market, null)
  assert.equal(projects['lazaretska-15'].calc.management, 17)
})
test('scenáre majú zdroj a platné hodnoty; východiská prejdú overením pre oba projekty', () => {
  for (const p of Object.values(projects)) {
    for (const s of p.calc.scenarios) { assert.ok(s.source.length > 20 && s.adr > 0 && s.occupancy > 0 && s.occupancy <= 100, s.id) }
    const c = p.calc, r = readValues({ price: 200000, furnishing: c.furnishing, adr: 75, occupancy: 70, own: c.own, stay: c.stay, portal: c.portal, management: c.management, vat: c.vat, clean: c.clean, cleanPaid: c.cleanPaid, fixed: c.fixed, software: c.software })
    assert.ok(r.ok, JSON.stringify(r.errors))
    assert.ok(investmentResult(r.values).annual > 0)
  }
})
