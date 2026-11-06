import Link from 'next/link'
const X = {
  sk: { h: 'Varšava: kalkulačky', p: 'Dva nástroje pre tím vo Varšave.', m: ['Správa bytu (pre majiteľov)', 'Koľko zarobí byt so správou LIVE-IN, kam idú peniaze, PDF pre majiteľa. Dá sa zdieľať s majiteľmi.', 'Otvoriť kalkulačku správy'], r: ['Rent-to-rent (interné)', 'Návratnosť pre LIVE-IN, keď si byt prenajmeme: marža, bod zvratu, najvyšší nájom.', 'Otvoriť rent-to-rent'], agent: 'Režim agenta pre správu (sprievodca rozhovorom)' },
  pl: { h: 'Warszawa: kalkulatory', p: 'Dwa narzędzia dla zespołu w Warszawie.', m: ['Zarządzanie mieszkaniem (dla właścicieli)', 'Ile zarobi mieszkanie z zarządzaniem LIVE-IN, dokąd trafiają pieniądze, PDF dla właściciela. Można udostępniać właścicielom.', 'Otwórz kalkulator zarządzania'], r: ['Rent-to-rent (wewnętrzny)', 'Zwrot dla LIVE-IN, gdy wynajmujemy mieszkanie: marża, próg rentowności, najwyższy czynsz.', 'Otwórz rent-to-rent'], agent: 'Tryb agenta dla zarządzania (przewodnik rozmowy)' },
  en: { h: 'Warsaw: calculators', p: 'Two tools for the Warsaw team.', m: ['Apartment management (for owners)', 'What an apartment earns with LIVE-IN management, where the money goes, owner PDF. Shareable with owners.', 'Open management calculator'], r: ['Rent-to-rent (internal)', 'Return for LIVE-IN when we lease the apartment: margin, break-even, highest rent.', 'Open rent-to-rent'], agent: 'Agent mode for management (conversation guide)' },
}
const P = { sk: ['/varsava/sprava', '/varsava/rent-to-rent'], pl: ['/pl/warszawa/zarzadzanie', '/pl/warszawa/rent-to-rent'], en: ['/en/warsaw/management', '/en/warsaw/rent-to-rent'] }
export default function WarsawHub({ lang = 'sk' }) {
  const x = X[lang] || X.sk, [m, r] = P[lang] || P.sk
  return (
    <div className="lcalc wcalc"><div className="wrap">
      <header><div><span className="eyebrow">LIVE-IN · Warszawa</span><h1>{x.h}</h1><p>{x.p}</p></div></header>
      <div className="wc-hub">
        <section className="card"><span className="badge">01</span><h2>{x.m[0]}</h2><p className="muted">{x.m[1]}</p><Link className="full wc-cta" href={m}>{x.m[2]}</Link><p><Link className="muted" href={m + '?agent=1'}>🔒 {x.agent}</Link></p></section>
        <section className="card"><span className="badge">02</span><h2>{x.r[0]}</h2><p className="muted">{x.r[1]}</p><Link className="full wc-cta" href={r}>{x.r[2]}</Link></section>
      </div>
    </div></div>
  )
}
