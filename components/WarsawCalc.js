'use client'
import { useEffect, useMemo, useState } from 'react'
import { T, defaults, management, longTerm, rentToRent, uplift, occupancyFor, RATE_DEFAULT, toCur, fromCur, fmtMoney, encodeState, decodeState } from '@/lib/warsaw-calc'

const SLIDERS = [
  ['adr', 'money', 0, 2000, 10], ['occupancy', '%', 0, 100, 1], ['ownNights', 'n', 0, 30, 1], ['stay', 'n', 1, 30, 0.5],
]
const COSTS = [
  ['portal', '%', 0, 30, 0.5], ['cleanCost', 'money', 0, 1000, 10], ['cleanPaid', 'money', 0, 1000, 10], ['consumables', 'money', 0, 200, 5],
  ['utilities', 'money', 0, 5000, 50], ['software', 'money', 0, 2000, 5], ['reserve', '%', 0, 15, 0.5], ['vat', '%', 0, 25, 1], ['commission', '%', 0, 30, 1],
]
const LT = [['ltRent', 'money', 0, 30000, 50], ['ltVacancy', 'n', 0, 6, 0.5], ['ltCosts', 'money', 0, 5000, 50]]
const R2R = [['r2rRent', 'money', 0, 30000, 50]]
const PROFILE_KEYS = ['district', 'bedrooms', 'standard']

export default function WarsawCalc({ lang = 'sk' }) {
  const t = T[lang] || T.sk
  const [v, setV] = useState(() => defaults())
  const [cur, setCur] = useState('PLN')
  const [rate, setRate] = useState(RATE_DEFAULT)
  const [model, setModel] = useState('mgmt')
  const [pdfLang, setPdfLang] = useState(lang === 'sk' ? 'pl' : lang)
  const [internal, setInternal] = useState(false)
  const [meta, setMeta] = useState({ preparedBy: '', phone: '', email: '', owner: '' })
  const [flash, setFlash] = useState('')

  // načítanie zdieľaného scenára z URL a kontaktov z prehliadača
  useEffect(() => {
    try {
      const h = window.location.hash.slice(1)
      if (h) { const s = decodeState(h); if (s) { if (s.v) setV({ ...defaults(s.v), ...s.v }); if (s.cur) setCur(s.cur); if (s.rate) setRate(s.rate); if (s.model) setModel(s.model); if (s.pdfLang) setPdfLang(s.pdfLang); if (s.meta) setMeta((m) => ({ ...m, ...s.meta })) } }
      const saved = JSON.parse(localStorage.getItem('livein-warsaw-meta') || 'null'); if (saved && !h) setMeta((m) => ({ ...m, ...saved }))
    } catch {}
  }, [])
  useEffect(() => { try { localStorage.setItem('livein-warsaw-meta', JSON.stringify(meta)) } catch {} }, [meta])

  const m = useMemo(() => management(v), [v])
  const lt = useMemo(() => longTerm(v), [v])
  const r2r = useMemo(() => rentToRent(v), [v])
  const ownerMonthly = model === 'mgmt' ? m.owner : r2r.ownerMonthly
  const up = uplift(ownerMonthly, lt.monthly)
  const need = useMemo(() => occupancyFor(v, 20), [v])
  const band = up === null ? '' : up < 0 ? 'neg' : up < 20 ? 'below' : up <= 30 ? 'ok' : 'above'
  const F = (pln, d = 0) => fmtMoney(pln, cur, rate, lang, d)
  const Fp = (pln, d = 0) => fmtMoney(pln, cur, rate, pdfLang, d)
  const setProfile = (k, val) => { const p = { ...Object.fromEntries(PROFILE_KEYS.map((x) => [x, v[x]])), [k]: val }; setV({ ...defaults(p), area: k === 'bedrooms' ? defaults(p).area : v.area }) }
  const num = (k, val) => setV({ ...v, [k]: Number.isFinite(val) ? val : 0 })
  const share = async () => { const s = encodeState({ v, cur, rate, model, pdfLang, meta }); const url = location.origin + location.pathname + '#' + s; history.replaceState(null, '', '#' + s); try { await navigator.clipboard.writeText(url); setFlash(t.shared); setTimeout(() => setFlash(''), 2500) } catch { prompt('URL', url) } }
  const unit = (kind) => kind === 'money' ? (cur === 'EUR' ? '€' : 'zł') : kind === '%' ? '%' : ''
  const Control = ([k, kind, min, max, step]) => {
    const money = kind === 'money'
    const shown = money ? Math.round(toCur(v[k], cur, rate) * 100) / 100 : v[k]
    const mx = money ? Math.round(toCur(max, cur, rate)) : max, st = money && cur === 'EUR' ? Math.max(1, Math.round(step / rate)) : step
    const onChange = (e) => { const x = Number(e.target.value); num(k, money ? Math.round(fromCur(x, cur, rate)) : x) }
    return (
      <div className="control" key={k}>
        <label htmlFor={'w-' + k}>{t[k]} {unit(kind) && <span>({unit(kind)})</span>}<input id={'w-' + k} type="number" min={min} max={mx} step={st} value={shown} onChange={onChange} /></label>
        <input type="range" aria-label={t[k]} min={min} max={mx} step={st} value={Math.min(shown, mx)} onChange={onChange} />
      </div>
    )
  }
  const rowsM = ['gross', 'portal', 'income', 'vat', 'commission', 'cleaning', 'consumables', 'reserve', 'utilities', 'software', 'costs', 'owner']
  const pdfT = T[pdfLang] || T.pl
  const profileLabel = (tt) => `${tt.districts[v.district]} · ${tt.beds[v.bedrooms]} · ${tt.standards[v.standard]} · ${v.area} m²`
  const today = new Date().toLocaleDateString(pdfLang === 'pl' ? 'pl-PL' : pdfLang === 'en' ? 'en-GB' : 'sk-SK')

  return (
    <div className="lcalc wcalc">
      <div className="wrap">
        <header>
          <div><span className="eyebrow">{t.eyebrow}</span><h1>{t.h1}<br /><em>{t.h1em}</em></h1><p>{t.intro}</p></div>
        </header>
        <div className="wc-top">
          <label>{t.model}<select value={model} onChange={(e) => setModel(e.target.value)}><option value="mgmt">{t.models.mgmt}</option><option value="r2r">{t.models.r2r}</option></select></label>
          <label>{t.currency}<select value={cur} onChange={(e) => setCur(e.target.value)}><option value="PLN">PLN (zł)</option><option value="EUR">EUR (€)</option></select></label>
          <label>{t.rate}<input type="number" min="3" max="6" step="0.01" value={rate} onChange={(e) => setRate(Number(e.target.value) || RATE_DEFAULT)} /></label>
          <label>{t.lang}<select value={pdfLang} onChange={(e) => setPdfLang(e.target.value)}><option value="pl">Polski</option><option value="sk">Slovenčina</option><option value="en">English</option></select></label>
        </div>
        <div className="grid">
          <div className="editor">
            <section className="card">
              <span className="badge">{t.s1}</span><h2>{t.s1h}</h2><p className="muted">{t.s1p}</p>
              <div className="fields">
                <label>{t.district}<select value={v.district} onChange={(e) => setProfile('district', e.target.value)}>{Object.entries(t.districts).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
                <label>{t.bedrooms}<select value={v.bedrooms} onChange={(e) => setProfile('bedrooms', Number(e.target.value))}>{t.beds.map((l, i) => <option key={i} value={i}>{l}</option>)}</select></label>
                <label>{t.standard}<select value={v.standard} onChange={(e) => setProfile('standard', e.target.value)}>{Object.entries(t.standards).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
                <label>{t.area}<input type="number" min="10" max="500" value={v.area} onChange={(e) => num('area', Number(e.target.value))} /></label>
              </div>
              <div className="fields" style={{ marginTop: 14 }}>
                <label>{t.owner}<input type="text" value={meta.owner} placeholder={t.ownerPh} onChange={(e) => setMeta({ ...meta, owner: e.target.value })} /></label>
                <label>{t.preparedBy}<input type="text" value={meta.preparedBy} onChange={(e) => setMeta({ ...meta, preparedBy: e.target.value })} /></label>
                <label>{t.phone}<input type="tel" value={meta.phone} onChange={(e) => setMeta({ ...meta, phone: e.target.value })} /></label>
                <label>{t.email}<input type="email" value={meta.email} onChange={(e) => setMeta({ ...meta, email: e.target.value })} /></label>
              </div>
            </section>
            <section className="card">
              <span className="badge">{t.s2}</span><h2>{t.s2h}</h2><p className="muted">{t.s2p}</p>
              <div>{SLIDERS.map(Control)}</div>
              <details open><summary>{t.costsH}</summary><div>{COSTS.map(Control)}</div></details>
              <details open><summary>{t.ltH}</summary><div>{LT.map(Control)}</div></details>
              <details open={model === 'r2r'}><summary>{t.r2rH}</summary><div>{R2R.map(Control)}</div><label className="wc-check"><input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> {t.internal}</label></details>
              <div className="actions"><button className="secondary" type="button" onClick={() => setV(defaults({ district: v.district, bedrooms: v.bedrooms, standard: v.standard }))}>{t.reset}</button><button className="secondary" type="button" onClick={share}>{flash || t.share}</button></div>
              <small>{t.note}</small>
            </section>
          </div>
          <aside className="card result" id="result">
            <span className="badge">{t.resultBadge}</span>
            <p className="muted">{model === 'mgmt' ? t.ownerMonthly : t.r2rOwner}</p>
            <div className="amount" role="status" aria-live="polite">{F(ownerMonthly)}</div>
            <p className="annual">{F(ownerMonthly * 12)} {t.ownerAnnual}</p>
            {up !== null && <div className={'wc-band ' + band}><b>{up > 0 ? '+' : ''}{Math.round(up)} %</b> {t.vsLt} · {t.band[band]}</div>}
            <p className="muted">{t.ltMonthly}: <b>{F(lt.monthly)}</b> ({F(lt.annual)} {t.ownerAnnual})</p>
            {model === 'mgmt' && <p className="muted">{t.needOcc}: <b>{need ? need + ' %' : t.needOccNo}</b></p>}
            {model === 'mgmt' ? (
              <>
                <p className="muted">{Math.round(m.nights)} {t.nights} · {m.bookings.toFixed(1)} {t.bookings} · {F(v.adr)} {t.perNight}</p>
                <h3>{t.breakdownH}</h3>
                <table className="wc-table"><tbody>{rowsM.map((k) => <tr key={k} className={k === 'income' || k === 'costs' ? 'sub' : k === 'owner' ? 'total' : ''}><td>{t.rows[k]}</td><td>{k === 'portal' || (k !== 'gross' && k !== 'income' && k !== 'owner' && k !== 'costs') ? '−' : ''}{F(m[k])}</td></tr>)}</tbody></table>
              </>
            ) : (
              <>
                <p className="muted">{t.r2rNote}</p>
                {internal && <table className="wc-table"><tbody><tr><td>{t.rows.income}</td><td>{F(r2r.revenue)}</td></tr><tr><td>{t.rows.vat} + {t.rows.cleaning} + {t.rows.utilities} + {t.rows.software}</td><td>−{F(r2r.revenue - r2r.margin - r2r.rent)}</td></tr><tr><td>{t.r2rOwner}</td><td>−{F(r2r.rent)}</td></tr><tr className="total"><td>{t.margin}</td><td>{F(r2r.margin)} ({r2r.marginPct} % {t.marginPct})</td></tr></tbody></table>}
              </>
            )}
            <button className="full" type="button" onClick={() => window.print()}>{t.pdf}</button>
            <small>{t.pdfHint}</small>
          </aside>
        </div>
      </div>

      {/* PDF / tlač: len tento blok, v jazyku majiteľa */}
      <section className="wc-report" aria-hidden="true">
        <div className="wc-rhead"><div><span className="eyebrow">LIVE-IN International · Warszawa</span><h1>{pdfT.report.title}</h1><p>{pdfT.report.sub}</p></div><div className="wc-rmeta">{pdfT.report.date}: {today}{meta.preparedBy && <><br />{pdfT.preparedBy}: {meta.preparedBy}</>}{meta.phone && <><br />{meta.phone}</>}{meta.email && <><br />{meta.email}</>}</div></div>
        <div className="wc-rgrid">
          <div>
            <h2>{pdfT.report.property}</h2>
            <p>{meta.owner && <><b>{meta.owner}</b><br /></>}{profileLabel(pdfT)}</p>
            <h2>{pdfT.report.assumptions}</h2>
            <table className="wc-table"><tbody>
              <tr><td>{pdfT.adr}</td><td>{Fp(v.adr)}</td></tr><tr><td>{pdfT.occupancy}</td><td>{v.occupancy} %</td></tr><tr><td>{pdfT.stay}</td><td>{v.stay}</td></tr>{v.ownNights > 0 && <tr><td>{pdfT.ownNights}</td><td>{v.ownNights}</td></tr>}
              <tr><td>{pdfT.portal}</td><td>{v.portal} %</td></tr><tr><td>{pdfT.cleanCost}</td><td>{Fp(v.cleanCost)}</td></tr><tr><td>{pdfT.utilities}</td><td>{Fp(v.utilities)}</td></tr><tr><td>{pdfT.vat}</td><td>{v.vat} %</td></tr>{model === 'mgmt' && <tr><td>{pdfT.commission}</td><td>{v.commission} %</td></tr>}<tr><td>{pdfT.ltRent}</td><td>{Fp(v.ltRent)}</td></tr><tr><td>{pdfT.ltVacancy}</td><td>{v.ltVacancy}</td></tr>
            </tbody></table>
          </div>
          <div>
            <div className="wc-rbig"><span>{model === 'mgmt' ? pdfT.ownerMonthly : pdfT.r2rOwner}</span><b>{Fp(ownerMonthly)}</b><small>{Fp(ownerMonthly * 12)} {pdfT.ownerAnnual}</small></div>
            {model === 'mgmt' ? (
              <><h2>{pdfT.breakdownH}</h2><table className="wc-table"><tbody>{rowsM.map((k) => <tr key={k} className={k === 'income' || k === 'costs' ? 'sub' : k === 'owner' ? 'total' : ''}><td>{pdfT.rows[k]}</td><td>{k !== 'gross' && k !== 'income' && k !== 'owner' && k !== 'costs' ? '−' : ''}{Fp(m[k])}</td></tr>)}</tbody></table><p className="wc-fine">{Math.round(m.nights)} {pdfT.nights} · {m.bookings.toFixed(1)} {pdfT.bookings}</p></>
            ) : <p>{pdfT.r2rNote}</p>}
          </div>
        </div>
        <h2>{pdfT.report.comparison}</h2>
        <table className="wc-table wc-cmp"><thead><tr><th></th><th>{pdfT.report.lt}</th><th>{model === 'mgmt' ? pdfT.report.mgmt : pdfT.report.r2r}</th><th>{pdfT.report.diff}</th></tr></thead><tbody>
          <tr><td>{pdfT.report.monthly}</td><td>{Fp(lt.monthly)}</td><td>{Fp(ownerMonthly)}</td><td>{up !== null ? (up > 0 ? '+' : '') + Math.round(up) + ' %' : '—'}</td></tr>
          <tr><td>{pdfT.report.annual}</td><td>{Fp(lt.annual)}</td><td>{Fp(ownerMonthly * 12)}</td><td>{Fp(ownerMonthly * 12 - lt.annual)}</td></tr>
        </tbody></table>
        <div className="wc-rgrid">
          <div><h2>{pdfT.report.what}</h2><ul>{pdfT.report.includes.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h2>{pdfT.report.next}</h2><p>{pdfT.report.nextText}</p><p><b>live-in.international</b></p></div>
        </div>
        <p className="wc-fine">{pdfT.report.disclaimer}</p>
      </section>
    </div>
  )
}
