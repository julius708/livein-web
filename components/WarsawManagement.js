'use client'
import { useEffect, useMemo, useState } from 'react'
import { T, TG, defaults, management, longTerm, uplift, occupancyFor, RATE_DEFAULT, fmtMoney, encodeState, decodeState } from '@/lib/warsaw-calc'
import { Control, Profile, SLIDERS, COSTS, LT, fill, loadMeta, saveMeta } from './warsaw-ui'

const INTRO = {
  sk: 'Zadajte svoj byt a pozrite si, koľko môže priniesť so správou LIVE-IN: kam idú peniaze, koľko Vám ostane a ako to vychádza oproti dlhodobému nájmu. Výsledok si stiahnete ako PDF.',
  pl: 'Wpisz swoje mieszkanie i zobacz, ile może przynieść z zarządzaniem LIVE-IN: dokąd trafiają pieniądze, ile zostaje dla Ciebie i jak wypada wobec najmu długoterminowego. Wynik pobierzesz jako PDF.',
  en: 'Enter your apartment and see what it can bring with LIVE-IN management: where the money goes, what you keep and how it compares to a long-term lease. Download the result as a PDF.',
}
const H1 = { sk: ['Koľko zarobí Váš byt', 'so správou LIVE-IN.'], pl: ['Ile zarobi Twoje mieszkanie', 'z zarządzaniem LIVE-IN.'], en: ['What your apartment earns', 'with LIVE-IN management.'] }
const HOW = {
  sk: ['Ako to funguje', ['Posúdime byt a navrhneme prípravu.', 'Nafotíme ho a spustíme inzerciu na Airbnb a Booking s dynamickými cenami.', 'Staráme sa o hostí, upratovanie, bielizeň a údržbu.', 'Každý mesiac dostanete vyúčtovanie a peniaze.'], 'Posúdiť môj byt zadarmo'],
  pl: ['Jak to działa', ['Oceniamy mieszkanie i proponujemy przygotowanie.', 'Robimy zdjęcia i uruchamiamy oferty na Airbnb i Booking z dynamicznymi cenami.', 'Dbamy o gości, sprzątanie, pościel i naprawy.', 'Co miesiąc otrzymujesz rozliczenie i pieniądze.'], 'Bezpłatna ocena mieszkania'],
  en: ['How it works', ['We assess the apartment and propose preparation.', 'We photograph it and launch Airbnb and Booking listings with dynamic pricing.', 'We take care of guests, cleaning, linen and maintenance.', 'Every month you receive a statement and the money.'], 'Free apartment assessment'],
}

export default function WarsawManagement({ lang = 'sk' }) {
  const t = T[lang] || T.sk, g = TG[lang] || TG.sk
  const [v, setV] = useState(() => ({ ...defaults(), commission: 17 }))
  const [cur, setCur] = useState('PLN')
  const [rate, setRate] = useState(RATE_DEFAULT)
  const [pdfLang, setPdfLang] = useState(lang === 'sk' ? 'pl' : lang)
  const [agent, setAgent] = useState(false)
  const [meta, setMeta] = useState({ preparedBy: '', phone: '', email: '', owner: '' })
  const [flash, setFlash] = useState('')

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search)
      let a = localStorage.getItem('livein-warsaw-agent') === '1'
      if (q.get('agent') === '1') { a = true; localStorage.setItem('livein-warsaw-agent', '1') }
      if (q.get('agent') === '0') { a = false; localStorage.removeItem('livein-warsaw-agent') }
      setAgent(a)
      const h = window.location.hash.slice(1)
      if (h) { const s = decodeState(h); if (s) { if (s.v) setV({ ...defaults(s.v), ...s.v }); if (s.cur) setCur(s.cur); if (s.rate) setRate(s.rate); if (s.pdfLang) setPdfLang(s.pdfLang); if (s.meta) setMeta((m) => ({ ...m, ...s.meta })) } }
      if (a) setMeta((m) => ({ ...m, ...loadMeta() }))
    } catch {}
  }, [])
  useEffect(() => { if (agent) saveMeta(meta) }, [meta, agent])

  const m = useMemo(() => management(v), [v])
  const lt = useMemo(() => longTerm(v), [v])
  const up = uplift(m.owner, lt.monthly)
  const need = useMemo(() => occupancyFor(v, 20), [v])
  const band = up === null ? '' : up < 0 ? 'neg' : up < 20 ? 'below' : up <= 30 ? 'ok' : 'above'
  const F = (pln, d = 0) => fmtMoney(pln, cur, rate, lang, d)
  const Fp = (pln, d = 0) => fmtMoney(pln, cur, rate, pdfLang, d)
  const setProfile = (k, val) => { const p = { district: v.district, bedrooms: v.bedrooms, standard: v.standard, [k]: val }; setV({ ...defaults(p), commission: v.commission, area: k === 'bedrooms' ? defaults(p).area : v.area }) }
  const num = (k, val) => setV({ ...v, [k]: Number.isFinite(val) ? val : 0 })
  const copy = async (withMeta) => {
    const s = encodeState({ v, cur, rate, pdfLang, ...(withMeta ? { meta } : {}) }); const url = location.origin + location.pathname + '#' + s
    try { await navigator.clipboard.writeText(url); setFlash(withMeta ? t.shared : g.ownerLinkDone); setTimeout(() => setFlash(''), 3000) } catch { prompt('URL', url) }
  }
  const toggleAgent = () => { const a = !agent; setAgent(a); try { a ? localStorage.setItem('livein-warsaw-agent', '1') : localStorage.removeItem('livein-warsaw-agent') } catch {} }
  const ctl = (row) => <Control key={row[0]} k={row[0]} kind={row[1]} min={row[2]} max={row[3]} step={row[4]} label={t[row[0]]} v={v} cur={cur} rate={rate} onNum={num} />
  const rowsM = ['gross', 'portal', 'income', 'vat', 'commission', 'cleaning', 'consumables', 'reserve', 'utilities', 'software', 'costs', 'owner']
  const pdfT = T[pdfLang] || T.pl
  const profileLabel = (tt) => `${tt.districts[v.district]} · ${tt.beds[v.bedrooms]} · ${tt.standards[v.standard]} · ${v.area} m²`
  const today = new Date().toLocaleDateString(pdfLang === 'pl' ? 'pl-PL' : pdfLang === 'en' ? 'en-GB' : 'sk-SK')
  const how = HOW[lang] || HOW.sk
  const D = { district: t.districts[v.district].split(' (')[0], lt: F(lt.monthly), occ: v.occupancy, adr: F(v.adr), gross: F(m.gross), owner: F(m.owner), annual: F(m.annual), uplift: up === null ? '—' : (up > 0 ? '+' : '') + Math.round(up) + ' %', need: need ? need + ' %' : t.needOccNo, needOcc: need ? need + ' %' : '—', commission: v.commission + ' %', stay: v.stay, diff: F(m.owner - lt.monthly), vat: v.vat + ' %' }
  const Table = ({ FF, tt }) => <table className="wc-table"><tbody>{rowsM.map((k) => <tr key={k} className={k === 'income' || k === 'costs' ? 'sub' : k === 'owner' ? 'total' : ''}><td>{tt.rows[k]}</td><td>{k !== 'gross' && k !== 'income' && k !== 'owner' && k !== 'costs' ? '−' : ''}{FF(m[k])}</td></tr>)}</tbody></table>

  return (
    <div className="lcalc wcalc">
      <div className="wrap">
        <header><div><span className="eyebrow">{t.eyebrow}</span><h1>{H1[lang][0]}<br /><em>{H1[lang][1]}</em></h1><p>{INTRO[lang]}</p></div></header>
        <div className="wc-top">
          <label>{t.currency}<select value={cur} onChange={(e) => setCur(e.target.value)}><option value="PLN">PLN (zł)</option><option value="EUR">EUR (€)</option></select></label>
          <label>{t.rate}<input type="number" min="3" max="6" step="0.01" value={rate} onChange={(e) => setRate(Number(e.target.value) || RATE_DEFAULT)} /></label>
          <label>{t.lang}<select value={pdfLang} onChange={(e) => setPdfLang(e.target.value)}><option value="pl">Polski</option><option value="sk">Slovenčina</option><option value="en">English</option></select></label>
          {agent && <label>{g.agentOn}<button type="button" className="secondary wc-agentbtn" onClick={toggleAgent}>{g.agentOff} →</button></label>}
        </div>
        {agent && <p className="wc-agentnote">🔒 {g.agentOn}: {g.agentHint}</p>}
        <div className="grid">
          <div className="editor">
            <section className="card">
              <span className="badge">{t.s1}</span><h2>{t.s1h}</h2><p className="muted">{t.s1p}</p>
              <Profile t={t} v={v} setProfile={setProfile} num={num} meta={meta} setMeta={setMeta} showMeta={agent} />
            </section>
            <section className="card">
              <span className="badge">{t.s2}</span><h2>{t.s2h}</h2><p className="muted">{t.s2p}</p>
              <div>{SLIDERS.map(ctl)}</div>
              <details open={agent}><summary>{t.ltH}</summary><div>{LT.map(ctl)}</div></details>
              <details open={agent}><summary>{t.costsH}</summary><div>{COSTS.map(ctl)}</div>{agent && ctl(['commission', '%', 0, 30, 1])}</details>
              <div className="actions"><button className="secondary" type="button" onClick={() => setV({ ...defaults({ district: v.district, bedrooms: v.bedrooms, standard: v.standard }), commission: 17 })}>{t.reset}</button>{agent ? <><button className="secondary" type="button" onClick={() => copy(false)}>{g.ownerLink}</button><button className="secondary" type="button" onClick={() => copy(true)}>{t.share}</button></> : <button className="secondary" type="button" onClick={() => copy(false)}>{t.share}</button>}</div>
              {flash && <p className="wc-flash" role="status">{flash}</p>}
              <small>{t.note}</small>
            </section>
          </div>
          <aside className="card result" id="result">
            <span className="badge">{t.resultBadge}</span>
            <p className="muted">{t.ownerMonthly}</p>
            <div className="amount" role="status" aria-live="polite">{F(m.owner)}</div>
            <p className="annual">{F(m.annual)} {t.ownerAnnual}</p>
            {up !== null && <div className={'wc-band ' + band}><b>{up > 0 ? '+' : ''}{Math.round(up)} %</b> {t.vsLt}{agent ? ' · ' + t.band[band] : ''}</div>}
            <p className="muted">{t.ltMonthly}: <b>{F(lt.monthly)}</b> ({F(lt.annual)} {t.ownerAnnual})</p>
            {agent && <p className="muted">{t.needOcc}: <b>{need ? need + ' %' : t.needOccNo}</b></p>}
            <p className="muted">{Math.round(m.nights)} {t.nights} · {m.bookings.toFixed(1)} {t.bookings} · {F(v.adr)} {t.perNight}</p>
            <h3>{t.breakdownH}</h3>
            <Table FF={F} tt={t} />
            <button className="full" type="button" onClick={() => window.print()}>{t.pdf}</button>
            <small>{t.pdfHint}</small>
            <h3>{how[0]}</h3>
            <ol className="wc-how">{how[1].map((x) => <li key={x}>{x}</li>)}</ol>
            {!agent && <a className="full wc-cta" href={(lang === 'sk' ? '' : '/' + lang) + '/posudenie'}>{how[2]}</a>}
          </aside>
        </div>

        {agent && (
          <section className="card wc-guide">
            <span className="badge">{g.agentOn}</span><h2>{g.guideH}</h2><p className="muted">{g.guideP}</p>
            <ol className="wc-steps">{g.steps.map(([h, body]) => <li key={h}><b>{h}</b><p>{fill(body, D)}</p></li>)}</ol>
            <h3>{g.objH}</h3>
            <div className="wc-obj">{g.objections.map(([q, a]) => <div key={q}><b>{q}</b><p>{fill(a, D)}</p></div>)}</div>
            <h3>{g.sendH}</h3><ul>{g.send.map((x) => <li key={x}>{x}</li>)}</ul>
            <p className="wc-never">⚠ {g.never}</p>
          </section>
        )}
      </div>

      <section className="wc-report" aria-hidden="true">
        <div className="wc-rhead"><div><span className="eyebrow">LIVE-IN International · Warszawa</span><h1>{pdfT.report.title}</h1><p>{pdfT.report.sub}</p></div><div className="wc-rmeta">{pdfT.report.date}: {today}{meta.preparedBy && <><br />{pdfT.preparedBy}: {meta.preparedBy}</>}{meta.phone && <><br />{meta.phone}</>}{meta.email && <><br />{meta.email}</>}</div></div>
        <div className="wc-rgrid">
          <div>
            <h2>{pdfT.report.property}</h2><p>{meta.owner && <><b>{meta.owner}</b><br /></>}{profileLabel(pdfT)}</p>
            <h2>{pdfT.report.assumptions}</h2>
            <table className="wc-table"><tbody>
              <tr><td>{pdfT.adr}</td><td>{Fp(v.adr)}</td></tr><tr><td>{pdfT.occupancy}</td><td>{v.occupancy} %</td></tr><tr><td>{pdfT.stay}</td><td>{v.stay}</td></tr>{v.ownNights > 0 && <tr><td>{pdfT.ownNights}</td><td>{v.ownNights}</td></tr>}
              <tr><td>{pdfT.portal}</td><td>{v.portal} %</td></tr><tr><td>{pdfT.cleanCost}</td><td>{Fp(v.cleanCost)}</td></tr><tr><td>{pdfT.utilities}</td><td>{Fp(v.utilities)}</td></tr><tr><td>{pdfT.vat}</td><td>{v.vat} %</td></tr><tr><td>{pdfT.commission}</td><td>{v.commission} %</td></tr><tr><td>{pdfT.ltRent}</td><td>{Fp(v.ltRent)}</td></tr><tr><td>{pdfT.ltVacancy}</td><td>{v.ltVacancy}</td></tr>
            </tbody></table>
          </div>
          <div>
            <div className="wc-rbig"><span>{pdfT.ownerMonthly}</span><b>{Fp(m.owner)}</b><small>{Fp(m.annual)} {pdfT.ownerAnnual}</small></div>
            <h2>{pdfT.breakdownH}</h2><Table FF={Fp} tt={pdfT} /><p className="wc-fine">{Math.round(m.nights)} {pdfT.nights} · {m.bookings.toFixed(1)} {pdfT.bookings}</p>
          </div>
        </div>
        <h2>{pdfT.report.comparison}</h2>
        <table className="wc-table wc-cmp"><thead><tr><th></th><th>{pdfT.report.lt}</th><th>{pdfT.report.mgmt}</th><th>{pdfT.report.diff}</th></tr></thead><tbody>
          <tr><td>{pdfT.report.monthly}</td><td>{Fp(lt.monthly)}</td><td>{Fp(m.owner)}</td><td>{up !== null ? (up > 0 ? '+' : '') + Math.round(up) + ' %' : '—'}</td></tr>
          <tr><td>{pdfT.report.annual}</td><td>{Fp(lt.annual)}</td><td>{Fp(m.annual)}</td><td>{Fp(m.annual - lt.annual)}</td></tr>
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
