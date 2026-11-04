'use client'
import { useEffect } from 'react'

// Číselný pás pod úvodom (stats.json + živý počet apartmánov z koncového bodu) a sekcia recenzií (reviews.json).
// Obe časti sa vykreslia len vtedy, keď majú overené dáta; pri chybe alebo prázdnej odpovedi ostanú skryté.

const L = {
  sk: { journey: 'Naša cesta od januára 2023 · apartmány v správe', today: 'Dnes', origin: 'LIVE-IN od roku {y} ({c})', since: 'Na Slovensku od januára {y}', cities: '{n} mestá: {list}', growth: '{b} → {n} apartmánov od januára {y}', tip: 'Stav k {d}. Rastieme každý mesiac.', rating: 'Ø {r} z 5 podľa hostí', guests: '{n}+ hostí privítaných', reviewsEyebrow: 'Hostia', reviewsTitle: 'Čo hovoria hostia' },
  en: { journey: 'Our journey since January 2023 · apartments under management', today: 'Today', origin: 'LIVE-IN since {y} ({c})', since: 'In Slovakia since January {y}', cities: '{n} cities: {list}', growth: '{b} → {n} apartments since January {y}', tip: 'As of {d}. Growing every month.', rating: 'Ø {r} out of 5 from guests', guests: '{n}+ guests welcomed', reviewsEyebrow: 'Guests', reviewsTitle: 'What guests say' },
  de: { journey: 'Unser Weg seit Januar 2023 · Apartments in Verwaltung', today: 'Heute', origin: 'LIVE-IN seit {y} ({c})', since: 'In der Slowakei seit Januar {y}', cities: '{n} Städte: {list}', growth: '{b} → {n} Apartments seit Januar {y}', tip: 'Stand {d}. Wir wachsen jeden Monat.', rating: 'Ø {r} von 5 laut Gästen', guests: '{n}+ Gäste empfangen', reviewsEyebrow: 'Gäste', reviewsTitle: 'Das sagen unsere Gäste' },
  es: { journey: 'Nuestro camino desde enero de 2023 · apartamentos gestionados', today: 'Hoy', origin: 'LIVE-IN desde {y} ({c})', since: 'En Eslovaquia desde enero de {y}', cities: '{n} ciudades: {list}', growth: '{b} → {n} apartamentos desde enero de {y}', tip: 'Datos a {d}. Crecemos cada mes.', rating: 'Ø {r} de 5 según los huéspedes', guests: '{n}+ huéspedes recibidos', reviewsEyebrow: 'Huéspedes', reviewsTitle: 'Lo que dicen los huéspedes' },
  pl: { journey: 'Nasza droga od stycznia 2023 · apartamenty w zarządzaniu', today: 'Dziś', origin: 'LIVE-IN od {y} roku ({c})', since: 'Na Słowacji od stycznia {y}', cities: '{n} miasta: {list}', growth: '{b} → {n} apartamentów od stycznia {y}', tip: 'Stan na {d}. Rośniemy co miesiąc.', rating: 'Ø {r} na 5 według gości', guests: '{n}+ powitanych gości', reviewsEyebrow: 'Goście', reviewsTitle: 'Co mówią goście' },
  cz: { journey: 'Naše cesta od ledna 2023 · apartmány ve správě', today: 'Dnes', origin: 'LIVE-IN od roku {y} ({c})', since: 'Na Slovensku od ledna {y}', cities: '{n} města: {list}', growth: '{b} → {n} apartmánů od ledna {y}', tip: 'Stav k {d}. Rosteme každý měsíc.', rating: 'Ø {r} z 5 podle hostů', guests: '{n}+ přivítaných hostů', reviewsEyebrow: 'Hosté', reviewsTitle: 'Co říkají hosté' },
}
const LOCALE = { sk: 'sk-SK', en: 'en-GB', de: 'de-DE', es: 'es-ES', pl: 'pl-PL', cz: 'cs-CZ' }

function fill(t, v) { return t.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m)) }
function fmt(n, lang) { return new Intl.NumberFormat(LOCALE[lang] || 'sk-SK').format(n).replace(/\s/g, ' ') }
function reducedMotion() {
  return (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.classList.contains('no-motion') || document.body.classList.contains('no-motion')
}
// Jednoduché počítadlo od východiskového čísla k aktuálnemu (bez knižnice). Pri vypnutých animáciách sa zobrazí rovno výsledok.
function countUp(el, from, to, lang) {
  if (reducedMotion() || to <= from) { el.textContent = fmt(to, lang); return }
  const start = performance.now(), dur = 1400
  const step = now => {
    const p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3)
    el.textContent = fmt(Math.round(from + (to - from) * e), lang)
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
function isNum(v) { return typeof v === 'number' && Number.isFinite(v) }

async function getJson(url, init) {
  const r = await fetch(url, init)
  if (!r.ok) throw new Error('HTTP ' + r.status)
  return r.json()
}

// Cesta s míľnikmi (stats.json → milestones) + bod „Dnes“ zo živého počtu. Bez živého počtu sa zobrazia len historické míľniky.
function renderJourney(holder, cfg, live, lang, t) {
  const ms = Array.isArray(cfg.milestones) ? cfg.milestones.filter(m => m && typeof m.label === 'string' && isNum(m.count)) : []
  const old = holder.parentNode && holder.parentNode.querySelector('.stats-journey')
  if (old) old.remove()
  if (ms.length < 2) return
  const nodes = ms.map(m => ({ label: m.label, count: m.count }))
  if (live) nodes.push({ label: t.today, count: live.count, live: true, from: nodes[nodes.length - 1].count })
  const box = document.createElement('section'); box.className = 'stats-journey'; box.setAttribute('aria-label', t.journey)
  const head = document.createElement('p'); head.className = 'stats-journey-head'; head.textContent = t.journey
  const track = document.createElement('ol'); track.className = 'stats-journey-track'; track.style.setProperty('--n', String(nodes.length))
  for (const n of nodes) {
    const li = document.createElement('li')
    const b = document.createElement('b'); b.textContent = fmt(n.count, lang)
    const sp = document.createElement('span'); sp.textContent = n.label
    li.append(b, sp)
    if (n.live) {
      li.className = 'is-live'
      const when = live.updated_at ? new Date(live.updated_at) : new Date()
      li.title = fill(t.tip, { d: when.toLocaleDateString(LOCALE[lang] || 'sk-SK') })
      countUp(b, n.from, n.count, lang)
    }
    track.appendChild(li)
  }
  box.append(head, track)
  holder.insertAdjacentElement('afterend', box)
}

async function renderStats(holder, lang) {
  const t = L[lang] || L.sk
  let cfg
  try { cfg = await getJson('/stats.json', { cache: 'no-cache' }) } catch (e) { return }
  if (!cfg || typeof cfg !== 'object') return
  const items = []
  if (isNum(cfg.origin_year)) items.push({ text: fill(t.origin, { y: cfg.origin_year, c: ({ sk: 'Londýn', en: 'London', de: 'London', es: 'Londres', pl: 'Londyn', cz: 'Londýn' })[lang] || cfg.origin_city || 'Londýn' }) })
  if (isNum(cfg.slovakia_since)) items.push({ text: fill(t.since, { y: cfg.slovakia_since }) })
  if (Array.isArray(cfg.cities) && cfg.cities.length) items.push({ text: fill(t.cities, { n: cfg.cities.length, list: cfg.cities.join(', ') }) })
  // živý počet apartmánov: iba agregát z koncového bodu, nikdy natvrdo
  let live = null
  const ep = cfg.portfolio && cfg.portfolio.enabled !== false && cfg.portfolio.endpoint
  if (ep) {
    try {
      const d = await getJson(ep, { cache: 'default' })
      if (d && isNum(d.count) && d.count > 0 && isNum(d.baseline) && isNum(d.baseline_year)) live = d
    } catch (e) { live = null }
  }
  if (live) items.push({ live })
  if (isNum(cfg.rating) && cfg.rating > 0) items.push({ text: fill(t.rating, { r: new Intl.NumberFormat(LOCALE[lang] || 'sk-SK', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(cfg.rating) }) })
  if (isNum(cfg.guests) && cfg.guests > 0) items.push({ text: fill(t.guests, { n: fmt(cfg.guests, lang) }) })
  if (!items.length) return
  holder.textContent = ''
  items.forEach((it, i) => {
    if (i) { const sep = document.createElement('span'); sep.className = 'stats-sep'; sep.setAttribute('aria-hidden', 'true'); sep.textContent = '·'; holder.appendChild(sep) }
    const span = document.createElement('span')
    if (it.live) {
      const d = it.live
      span.className = 'stats-live'
      span.tabIndex = 0
      const when = d.updated_at ? new Date(d.updated_at) : new Date()
      span.title = fill(t.tip, { d: when.toLocaleDateString(LOCALE[lang] || 'sk-SK') })
      const parts = fill(t.growth, { b: fmt(d.baseline, lang), n: '\u0000', y: d.baseline_year }).split('\u0000')
      span.appendChild(document.createTextNode(parts[0]))
      const b = document.createElement('b'); b.textContent = fmt(d.baseline, lang); span.appendChild(b)
      span.appendChild(document.createTextNode(parts[1] || ''))
      countUp(b, d.baseline, d.count, lang)
    } else span.textContent = it.text
    holder.appendChild(span)
  })
  holder.hidden = false
  renderJourney(holder, cfg, live, lang, t)
}

async function renderReviews(holder, lang) {
  const t = L[lang] || L.sk
  let list
  try { list = await getJson('/reviews.json', { cache: 'no-cache' }) } catch (e) { return }
  if (!Array.isArray(list)) return
  const ok = list.filter(r => r && typeof r.text === 'string' && r.text.trim()).slice(0, 3)
  if (!ok.length) return
  holder.textContent = ''
  const eyebrow = document.createElement('div'); eyebrow.className = 'eyebrow'; eyebrow.textContent = t.reviewsEyebrow
  const h2 = document.createElement('h2'); h2.textContent = t.reviewsTitle
  const grid = document.createElement('div'); grid.className = 'journal-grid reviews-grid'
  for (const r of ok) {
    const card = document.createElement('article'); card.className = 'journal-card'
    const q = document.createElement('blockquote')
    const p = document.createElement('p'); p.textContent = r.text.trim(); q.appendChild(p)
    const meta = [r.author_first_name, r.apartment_label, r.source].filter(x => typeof x === 'string' && x.trim()).join(' · ')
    const dateStr = r.date ? new Date(r.date).toLocaleDateString(LOCALE[lang] || 'sk-SK', { year: 'numeric', month: 'long' }) : ''
    const f = document.createElement('footer')
    f.textContent = [meta, isNum(r.rating) ? r.rating + '/5' : '', dateStr].filter(Boolean).join(' · ')
    q.appendChild(f); card.appendChild(q); grid.appendChild(card)
  }
  holder.append(eyebrow, h2, grid)
  holder.hidden = false
}

export default function HomeExtras({ lang }) {
  useEffect(() => {
    let alive = true
    const stats = document.querySelector('[data-stats-band]')
    const reviews = document.querySelector('[data-reviews]')
    if (stats) renderStats(stats, lang).catch(() => {})
    if (reviews) renderReviews(reviews, lang).catch(() => {})
    return () => { alive = false }
  }, [lang])
  return null
}
