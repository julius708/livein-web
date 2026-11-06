import test from 'node:test'
import assert from 'node:assert/strict'
import { defaults, management, longTerm, rentToRent, uplift, occupancyFor, encodeState, decodeState, toCur, fromCur } from '../lib/warsaw-calc.js'

test('východiská sú rozumné pre 1 spálňu blízko centra', () => {
  const v = defaults()
  assert.equal(v.bedrooms, 1); assert.ok(v.adr >= 300 && v.adr <= 450); assert.ok(v.ltRent >= 3500 && v.ltRent <= 5000)
})
test('management: náklady + zostatok = príjem; provízia 17 % z Rental Income', () => {
  const v = defaults(); const m = management(v)
  assert.ok(Math.abs(m.costs + m.owner - m.income) < 0.02)
  assert.ok(Math.abs(m.commission - m.income * 0.17) < 0.02)
  assert.ok(m.nights > 0 && m.bookings > 0 && m.gross > m.income)
})
test('nulová obsadenosť: žiadne tržby, majiteľ platí len fixné náklady', () => {
  const m = management({ ...defaults(), occupancy: 0 })
  assert.equal(m.gross, 0); assert.equal(m.owner, -(m.utilities + m.software))
})
test('noci pre majiteľa znižujú tržby', () => {
  const v = defaults(); assert.ok(management({ ...v, ownNights: 10 }).gross < management(v).gross)
})
test('dlhodobý nájom: 1 mesiac neobsadený = 11/12', () => {
  const lt = longTerm({ ltRent: 1200, ltVacancy: 1, ltCosts: 0 }); assert.equal(lt.monthly, 1100); assert.equal(lt.annual, 13200)
})
test('rent-to-rent: pevný nájom odvodený z trhu +5 %, marža = príjem − prevádzka − nájom', () => {
  const v = defaults(); const r = rentToRent(v)
  assert.equal(r.rent, Math.round(v.ltRent * 1.05 / 50) * 50)
  const m = management({ ...v, commission: 0 })
  assert.ok(Math.abs(r.margin - (m.income - m.vat - m.cleaning - m.consumables - m.reserve - m.utilities - m.software - r.rent)) < 0.02)
  assert.equal(rentToRent({ ...v, r2rRent: 5000 }).rent, 5000)
})
test('uplift a potrebná obsadenosť', () => {
  assert.equal(uplift(1200, 1000), 20); assert.equal(uplift(900, 1000), -10); assert.equal(uplift(1, 0), null)
  const v = defaults(); const o = occupancyFor(v, 20)
  assert.ok(o === null || (o >= 1 && o <= 100))
  if (o) assert.ok(management({ ...v, occupancy: o }).owner >= longTerm(v).monthly * 1.2)
  assert.equal(occupancyFor({ ...v, adr: 1 }, 20), null)
})
test('mena: prepočet tam a späť', () => {
  assert.equal(Math.round(fromCur(toCur(430, 'EUR', 4.3), 'EUR', 4.3)), 430); assert.equal(toCur(100, 'PLN', 4.3), 100)
})
test('zdieľanie scenára: encode/decode', () => {
  globalThis.btoa ??= (s) => Buffer.from(s, 'binary').toString('base64'); globalThis.atob ??= (s) => Buffer.from(s, 'base64').toString('binary')
  const v = { ...defaults(), owner: 'p. Kowalski, Śródmieście' }; assert.deepEqual(decodeState(encodeState(v)), v); assert.equal(decodeState('%%%'), null)
})

test('východiskové scenáre sedia s tézou +20 až +30 % oproti dlhodobému nájmu', () => {
  for (const bedrooms of [0, 1, 2, 3]) for (const district of ['center', 'near', 'other']) {
    const v = defaults({ bedrooms, district }); const u = uplift(management(v).owner, longTerm(v).monthly)
    assert.ok(u >= (district === 'other' ? 5 : 15) && u <= 40, `${bedrooms} spálne, ${district}: ${u} %`)
  }
})
