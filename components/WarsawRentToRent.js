'use client'
import { useEffect, useMemo, useState } from 'react'
import { T, TR, r2rDefaults, r2rReturn, breakEvenOccupancy, maxRentFor, sensitivity, RATE_DEFAULT, fmtMoney, encodeState, decodeState } from '@/lib/warsaw-calc'
import { Control, Profile, SLIDERS, COSTS, fill, loadMeta, saveMeta } from './warsaw-ui'

export default function WarsawRentToRent({ lang = 'sk' }) {
  const t = T[lang] || T.sk, r = TR[lang] || TR.sk
  const [v, setV] = useState(() => r2rDefaults())
  const [cur, setCur] = useState('PLN')
  const [rate, setRate] = useState(RATE_DEFAULT)
  const [meta, setMeta] = useState({ preparedBy: '', phone: '', email: '', owner: '' })
  const [flash, setFlash] = useState('')
  useEffect(() => {
    try {
      const h = window.location.hash.slice(1)
      if (h) { const s = decodeState(h); if (s) { if (s.v) setV({ ...r2rDefaults(s.v), ...s.v }); if (s.cur) setCur(s.cur); if (s.rate) setRate(s.rate); if (s.meta) setMeta((m) => ({ ...m, ...s.meta })) } }
      else setMeta((m) => ({ ...m, ...loadMeta() }))
    } catch {}
  }, [])
  useEffect(() => { saveMeta(meta) }, [meta])
  const res = useMemo(() => r2rReturn(v), [v])
  const be = useMemo(() => breakEvenOccupancy(v), [v])
  const max25 = useMemo(() => maxRentFor(v, 25), [v]), max20 = useMemo(() => maxRentFor(v, 20), [v])
  const sens = useMemo(() => sensitivity(v), [v])
  const F = (pln, d = 0) => fmtMoney(pln, cur, rate, lang, d)
  const setProfile = (k, val) => { const p = { district: v.district, bedrooms: v.bedrooms, standard: v.standard, [k]: val }; const d = r2rDefaults(p); setV({ ...d, area: k === 'bedrooms' ? d.area : v.area }) }
  const num = (k, val) => setV({ ...v, [k]: Number.isFinite(val) ? val : 0 })
  const ctl = (row, label) => <Control key={row[0]} k={row[0]} kind={row[1]} min={row[2]} max={row[3]} step={row[4]} label={label || t[row[0]]} v={v} cur={cur} rate={rate} onNum={num} />
  const share = async () => { const s = encodeState({ v, cur, rate, meta }); const url = location.origin + location.pathname + '#' + s; try { await navigator.clipboard.writeText(url); setFlash(t.shared); setTimeout(() => setFlash(''), 2500) } catch { prompt('URL', url) } }
  const verdict = res.margin < 0 ? 'neg' : res.marginPct >= 25 && res.payback !== null && res.payback <= 12 ? 'good' : res.marginPct >= 15 || (res.payback !== null && res.payback <= 24) ? 'ok' : 'weak'
  const vClass = { good: 'ok', ok: 'below', weak: 'above', neg: 'neg' }[verdict]
  const today = new Date().toLocaleDateString(lang === 'pl' ? 'pl-PL' : lang === 'en' ? 'en-GB' : 'sk-SK')
  const rows = [['income', res.income], ['vat', -res.vat], ['cleaning', -res.cleaning], ['consumables', -res.consumables], ['reserve', -res.reserve], ['utilities', -res.utilities], ['software', -res.software]]
  const Body = () => (
    <>
      <table className="wc-table"><tbody>
        {rows.map(([k, val]) => <tr key={k}><td>{t.rows[k]}</td><td>{val < 0 ? '−' : ''}{F(Math.abs(val))}</td></tr>)}
        <tr className="sub"><td>{r.operating}</td><td>{F(res.operating)}</td></tr>
        <tr><td>{r.rent}</td><td>−{F(res.rent)}</td></tr>
        <tr className="total"><td>{r.margin}</td><td>{F(res.margin)}</td></tr>
      </tbody></table>
      <table className="wc-table"><tbody>
        <tr><td>{r.invest}</td><td>{F(res.invest)}</td></tr>
        <tr><td>{r.payback}</td><td>{res.payback !== null ? `${res.payback} ${r.months}` : r.never}</td></tr>
        <tr><td>{r.roi}</td><td>{res.roi !== null ? res.roi + ' %' : '—'}</td></tr>
        <tr><td>{r.breakEven}</td><td>{be !== null ? be + ' %' : '—'}</td></tr>
        <tr><td>{r.maxRent}</td><td>{F(max25)} <small className="muted">({r.maxRent20} {F(max20)})</small></td></tr>
        <tr><td>{r.ltNote}</td><td>{F(v.ltRent)}</td></tr>
      </tbody></table>
      <h3>{r.sensH}</h3>
      <table className="wc-table wc-sens"><thead><tr><th>%</th>{sens[0].cells.map((c) => <th key={c.d}>{c.d > 0 ? '+' : ''}{c.d} %</th>)}</tr></thead><tbody>{sens.map((row) => <tr key={row.occ}><td>{row.occ} %</td>{row.cells.map((c) => <td key={c.d} className={c.margin < 0 ? 'neg' : c.margin / (res.income || 1) >= 0.25 ? 'good' : ''}>{F(c.margin)}</td>)}</tr>)}</tbody></table>
      <p className="eko-fine muted">{r.sensNote}</p>
    </>
  )
  return (
    <div className="lcalc wcalc">
      <div className="wrap">
        <header><div><span className="eyebrow">{t.eyebrow}</span><h1>{r.h1}<br /><em>{r.h1em}</em></h1><p>{r.intro}</p></div></header>
        <div className="wc-top">
          <label>{t.currency}<select value={cur} onChange={(e) => setCur(e.target.value)}><option value="PLN">PLN (zł)</option><option value="EUR">EUR (€)</option></select></label>
          <label>{t.rate}<input type="number" min="3" max="6" step="0.01" value={rate} onChange={(e) => setRate(Number(e.target.value) || RATE_DEFAULT)} /></label>
        </div>
        <div className="grid">
          <div className="editor">
            <section className="card"><span className="badge">{t.s1}</span><h2>{t.s1h}</h2><p className="muted">{t.s1p}</p><Profile t={t} v={v} setProfile={setProfile} num={num} meta={meta} setMeta={setMeta} showMeta /></section>
            <section className="card">
              <span className="badge">{r.s3}</span><h2>{r.rent}</h2>
              {ctl(['r2rRent', 'money', 0, 30000, 50], r.rent)}{ctl(['ltRent', 'money', 0, 30000, 50], r.ltNote)}{ctl(['deposit', 'n', 0, 6, 1], r.deposit)}{ctl(['setup', 'money', 0, 200000, 500], r.setup)}{ctl(['agentFee', 'money', 0, 50000, 100], r.agentFee)}
            </section>
            <section className="card">
              <span className="badge">{t.s2}</span><h2>{t.s2h}</h2><p className="muted">{t.s2p}</p>
              <div>{SLIDERS.map((x) => ctl(x))}</div>
              <details open><summary>{t.costsH}</summary><div>{COSTS.map((x) => ctl(x))}</div></details>
              <div className="actions"><button className="secondary" type="button" onClick={() => setV(r2rDefaults({ district: v.district, bedrooms: v.bedrooms, standard: v.standard }))}>{t.reset}</button><button className="secondary" type="button" onClick={share}>{flash || t.share}</button></div>
              <small>{t.note}</small>
            </section>
          </div>
          <aside className="card result" id="result">
            <span className="badge">{r.badge}</span>
            <p className="muted">{r.margin}</p>
            <div className="amount" role="status" aria-live="polite">{F(res.margin)}</div>
            <p className="annual">{F(res.annual)} {r.annual} · {res.marginPct} % {r.marginPct}</p>
            <div className={'wc-band ' + vClass}>{r.verdict[verdict]}</div>
            <Body />
            <button className="full" type="button" onClick={() => window.print()}>{r.pdf}</button>
            <h3>{r.tipsH}</h3><ul className="wc-tips">{r.tips.map((x) => <li key={x}>{x}</li>)}</ul>
          </aside>
        </div>
      </div>
      <section className="wc-report" aria-hidden="true">
        <div className="wc-rhead"><div><span className="eyebrow">LIVE-IN International · Warszawa · {r.badge}</span><h1>{r.h1} {r.h1em}</h1><p>{meta.owner}{meta.owner ? ' · ' : ''}{t.districts[v.district]} · {t.beds[v.bedrooms]} · {v.area} m²</p></div><div className="wc-rmeta">{today}{meta.preparedBy && <><br />{meta.preparedBy}</>}</div></div>
        <div className="wc-rgrid"><div><div className="wc-rbig"><span>{r.margin}</span><b>{F(res.margin)}</b><small>{F(res.annual)} {r.annual} · {res.marginPct} % {r.marginPct}</small></div><p>{r.verdict[verdict]}</p><h2>{t.report.assumptions}</h2><table className="wc-table"><tbody><tr><td>{t.adr}</td><td>{F(v.adr)}</td></tr><tr><td>{t.occupancy}</td><td>{v.occupancy} %</td></tr><tr><td>{t.stay}</td><td>{v.stay}</td></tr><tr><td>{t.portal}</td><td>{v.portal} %</td></tr><tr><td>{t.cleanCost}</td><td>{F(v.cleanCost)}</td></tr><tr><td>{t.utilities}</td><td>{F(v.utilities)}</td></tr><tr><td>{t.vat}</td><td>{v.vat} %</td></tr><tr><td>{r.deposit}</td><td>{v.deposit}</td></tr><tr><td>{r.setup}</td><td>{F(v.setup)}</td></tr></tbody></table></div><div><Body /></div></div>
      </section>
    </div>
  )
}
