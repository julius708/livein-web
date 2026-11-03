// Obsah webu a pomocné funkcie (server aj klient bez DOM).
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const ALL_LANGS = ['sk', 'en', 'de', 'es', 'pl', 'cz']
const CONTENT = {}
for (const l of ALL_LANGS) { try { CONTENT[l] = require('../content/' + l + '.json') } catch (e) { /* jazyk bez obsahu sa nevydá */ } }

export const LANGS = ALL_LANGS.filter(l => CONTENT[l])
export const LANG_NAMES = { sk: 'Slovenčina', en: 'English', de: 'Deutsch', es: 'Español', pl: 'Polski', cz: 'Čeština' }
export const OLD_ASSETS = '/livein-release-20261013/live-in-assets/'
// Súbory (fotky, videá): v produkcii z /assets, v náhľade môžu ísť z inej adresy.
export const ASSETS = (process.env.ASSET_BASE || '/assets').replace(/\/$/, '') + '/'
export const LOGO = process.env.LOGO_SRC || ASSETS + 'logo-white.png'

export function content(lang) { return CONTENT[lang] || CONTENT.sk }
export function prefix(lang) { return lang === 'sk' ? '' : '/' + lang }

// Staré hash trasy → nové URL. Skryté realitné trasy vedú na kontakt.
const ALIAS = { home: '', vypocet: 'kalkulacka', clanky: 'poradna', clanok: 'clanok-model', reality: 'kontakt', predaj: 'kontakt', ponuky: 'kontakt', posudenie: 'posudenie' }
export function routeHref(lang, route) {
  const r = route in ALIAS ? ALIAS[route] : route
  return (prefix(lang) + '/' + r).replace(/\/$/, '') || '/'
}

export const SPECIAL = ['kalkulacka', 'spolupraca']
export function routes(lang) {
  return [...Object.keys(content(lang).pages), ...SPECIAL]
}

// Rozloží URL segmenty na jazyk a trasu.
export function resolveSlug(slug) {
  const parts = Array.isArray(slug) ? slug.filter(Boolean) : []
  let lang = 'sk'
  if (parts.length && LANGS.includes(parts[0]) && parts[0] !== 'sk') lang = parts.shift()
  if (parts.length > 1) return null
  const route = parts[0] || ''
  if (route === '') return { lang, route: '' }
  if (route in ALIAS) return { lang, route: ALIAS[route] || '' }
  if (routes(lang).includes(route)) return { lang, route }
  return null
}

function escapeAttr(s) { return String(s).replace(/"/g, '&quot;') }

// Prevedie starý SPA obsah (tlačidlá s data-route, hash odkazy, cesty k súborom) na skutočné odkazy.
export function transformHtml(html, lang) {
  if (!html) return ''
  let out = html
  out = out.split(OLD_ASSETS).join(ASSETS)
  out = out.replace(/<button([^>]*?)\sdata-route="([^"]+)"([^>]*)>([\s\S]*?)<\/button>/g, (m, a, route, b, label) => {
    const attrs = (a + ' ' + b).replace(/\stype="button"/g, '').trim()
    return `<a ${attrs} data-route="${escapeAttr(route)}" href="${routeHref(lang, route)}">${label}</a>`.replace(/<a\s+data-route/, '<a data-route')
  })
  out = out.replace(/href="\/?#([a-z0-9-]+)"/g, (m, route) => `href="${routeHref(lang, route)}"`)
  out = out.replace(/href="\/livein-release-20261013\/(?:(en|de|es|pl|cz)\/)?spolupraca\.html"/g, (m, l) => `href="${routeHref(l || lang, 'spolupraca')}"`)
  out = out.replace(/href="\/livein-release-20261013\/(?:(en|de|es|pl|cz)\/)?LIVE-IN_interaktivna_kalkulacka_v21\.html"/g, (m, l) => `href="${routeHref(l || lang, 'kalkulacka')}"`)
  out = out.replace(/href="\.\/"/g, `href="${routeHref(lang, 'home')}"`)
  // relatívne odkazy z jazykových verzií (spolupraca.html, index.html#kontakt)
  out = out.replace(/href="spolupraca\.html"/g, `href="${routeHref(lang, 'spolupraca')}"`)
  out = out.replace(/href="index\.html#([a-z0-9-]+)"/g, (m, route) => `href="${routeHref(lang, route)}"`)
  out = out.replace(/href="index\.html"/g, `href="${routeHref(lang, 'home')}"`)
  return out
}

export function pageData(lang, route) {
  const c = content(lang)
  if (route === '') return { title: c.title, description: c.description, html: transformHtml(c.home, lang), kind: 'home' }
  if (route === 'kalkulacka') return { title: c.calc.title, description: c.description, html: transformHtml(c.calc.html, lang), kind: 'calc', script: c.calc.script }
  if (route === 'spolupraca') return { title: c.spolupraca.title, description: c.description, html: transformHtml(c.spolupraca.html, lang), footer: c.spolupraca.footer, kind: 'spolupraca' }
  const p = c.pages[route]
  if (!p) return null
  return { title: p.title + ' | LIVE-IN International', description: c.description, html: transformHtml(p.html, lang), kind: 'page' }
}
