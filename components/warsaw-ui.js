'use client'
import { toCur, fromCur } from '@/lib/warsaw-calc'

/** Jeden ovládací prvok (číslo + posuvník) v zvolenej mene. */
export function Control({ k, kind, min, max, step, label, v, cur, rate, onNum }) {
  const money = kind === 'money'
  const shown = money ? Math.round(toCur(v[k], cur, rate) * 100) / 100 : v[k]
  const mx = money ? Math.round(toCur(max, cur, rate)) : max, st = money && cur === 'EUR' ? Math.max(1, Math.round(step / rate)) : step
  const unit = money ? (cur === 'EUR' ? '€' : 'zł') : kind === '%' ? '%' : ''
  const onChange = (e) => { const x = Number(e.target.value); onNum(k, money ? Math.round(fromCur(x, cur, rate)) : x) }
  return (
    <div className="control">
      <label htmlFor={'w-' + k}>{label} {unit && <span>({unit})</span>}<input id={'w-' + k} type="number" min={min} max={mx} step={st} value={shown} onChange={onChange} /></label>
      <input type="range" aria-label={label} min={min} max={mx} step={st} value={Math.min(shown, mx)} onChange={onChange} />
    </div>
  )
}
export const SLIDERS = [['adr', 'money', 0, 2000, 10], ['occupancy', '%', 0, 100, 1], ['ownNights', 'n', 0, 30, 1], ['stay', 'n', 1, 30, 0.5]]
export const COSTS = [['portal', '%', 0, 30, 0.5], ['cleanCost', 'money', 0, 1000, 10], ['cleanPaid', 'money', 0, 1000, 10], ['consumables', 'money', 0, 200, 5], ['utilities', 'money', 0, 5000, 50], ['software', 'money', 0, 2000, 5], ['reserve', '%', 0, 15, 0.5], ['vat', '%', 0, 25, 1]]
export const LT = [['ltRent', 'money', 0, 30000, 50], ['ltVacancy', 'n', 0, 6, 0.5], ['ltCosts', 'money', 0, 5000, 50]]

export function Profile({ t, v, setProfile, num, meta, setMeta, showMeta }) {
  return (
    <>
      <div className="fields">
        <label>{t.district}<select value={v.district} onChange={(e) => setProfile('district', e.target.value)}>{Object.entries(t.districts).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        <label>{t.bedrooms}<select value={v.bedrooms} onChange={(e) => setProfile('bedrooms', Number(e.target.value))}>{t.beds.map((l, i) => <option key={i} value={i}>{l}</option>)}</select></label>
        <label>{t.standard}<select value={v.standard} onChange={(e) => setProfile('standard', e.target.value)}>{Object.entries(t.standards).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        <label>{t.area}<input type="number" min="10" max="500" value={v.area} onChange={(e) => num('area', Number(e.target.value))} /></label>
      </div>
      {showMeta && <div className="fields" style={{ marginTop: 14 }}>
        <label>{t.owner}<input type="text" value={meta.owner} placeholder={t.ownerPh} onChange={(e) => setMeta({ ...meta, owner: e.target.value })} /></label>
        <label>{t.preparedBy}<input type="text" value={meta.preparedBy} onChange={(e) => setMeta({ ...meta, preparedBy: e.target.value })} /></label>
        <label>{t.phone}<input type="tel" value={meta.phone} onChange={(e) => setMeta({ ...meta, phone: e.target.value })} /></label>
        <label>{t.email}<input type="email" value={meta.email} onChange={(e) => setMeta({ ...meta, email: e.target.value })} /></label>
      </div>}
    </>
  )
}
export const fill = (tpl, d) => tpl.replace(/\{(\w+)\}/g, (m, k) => (d[k] ?? m))
export const loadMeta = () => { try { return JSON.parse(localStorage.getItem('livein-warsaw-meta') || 'null') || {} } catch { return {} } }
export const saveMeta = (m) => { try { localStorage.setItem('livein-warsaw-meta', JSON.stringify(m)) } catch {} }
