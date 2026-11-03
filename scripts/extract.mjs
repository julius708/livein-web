// Extrakcia obsahu zo starého statického webu (livein-release-20261013) do JSON pre Next.js.
// Spustenie: node scripts/extract.mjs <priečinok so stiahnutými HTML>
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import crypto from 'node:crypto'

const SRC = process.argv[2]
const OUT = path.resolve('content')
const PUB = path.resolve('public')
const LANGS = ['sk', 'en', 'de', 'es', 'pl', 'cz']
const OLD = '/livein-release-20261013/'

function fakeEl(store) {
  const classes = new Set()
  const el = new Proxy({}, {
    get(t, p) {
      if (p === 'innerHTML') return store.html || ''
      if (p === 'classList') return { add: (...c) => c.forEach(x => classes.add(x)), remove: () => {}, toggle: () => {}, contains: () => false }
      if (p === 'dataset') return store.dataset || (store.dataset = {})
      if (p === 'style') return new Proxy({}, { get: () => () => {}, set: () => true })
      if (p === 'children') return []
      if (p === 'hidden') return false
      if (p === 'querySelectorAll') return () => []
      if (p === 'querySelector') return () => fakeEl(store.child || (store.child = {}))
      if (p === 'insertAdjacentHTML') return (where, html) => { store.inserted = (store.inserted || '') + html }
      if (p === 'getBoundingClientRect') return () => ({ top: 0, bottom: 0 })
      if (p === 'closest') return () => fakeEl({})
      if (p === 'then') return undefined
      return () => fakeEl({})
    },
    set(t, p, v) { if (p === 'innerHTML') store.html = v; else store[p] = v; return true },
  })
  return el
}

function evalContentScript(src) {
  // odstráni boot (automatické spustenie route podľa hash)
  const cut = src.lastIndexOf('setMotion(motionEnabled);route(')
  const body = cut > 0 ? src.slice(0, cut) : src
  const mainStore = {}
  const stores = {}
  const document = {
    querySelector: sel => sel === 'main' ? fakeEl(mainStore) : fakeEl(stores[sel] || (stores[sel] = {})),
    querySelectorAll: () => [],
    getElementById: id => fakeEl(stores['#' + id] || (stores['#' + id] = {})),
    addEventListener: () => {},
    getComputedStyle: () => ({ top: '0' }),
    createElement: () => fakeEl({}),
    body: fakeEl({}),
    documentElement: fakeEl({}),
    activeElement: null,
  }
  const sandbox = {
    document,
    window: null,
    location: { hash: '', pathname: '/', href: 'https://live-in.international/' },
    history: { pushState: () => {} },
    matchMedia: () => ({ matches: false, addEventListener: () => {} }),
    IntersectionObserver: class { observe() {} disconnect() {} unobserve() {} },
    MutationObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    localStorage: { getItem: () => null, setItem: () => {} },
    scrollTo: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    crypto: { randomUUID: () => 'x' },
    innerHeight: 900,
    innerWidth: 1400,
    console,
    Intl, Number, Math, String, Array, Object, JSON, Date, URL, RegExp, Map, Set, Promise, setTimeout, clearTimeout,
  }
  sandbox.window = sandbox
  sandbox.globalThis = sandbox
  const ctx = vm.createContext(sandbox)
  vm.runInContext(body + `
;__export={contentData, route, faqRows: typeof faqRows!=='undefined'?faqRows:null, portfolioPhotos, home, realty, LIVEIN_OFFERS: typeof LIVEIN_OFFERS!=='undefined'?LIVEIN_OFFERS:[], subpagePhotos, filmScenes: typeof filmScenes!=='undefined'?filmScenes:null}`, ctx, { filename: 'content.js' })
  const ex = ctx.__export
  return { ex, mainStore }
}

function cutBetween(s, startRe, endRe) {
  const a = s.search(startRe); if (a < 0) throw new Error('start not found ' + startRe)
  const rest = s.slice(a)
  const b = rest.search(endRe); if (b < 0) throw new Error('end not found ' + endRe)
  return rest.slice(0, b)
}

function extractLang(lang) {
  const dir = lang === 'sk' ? SRC : path.join(SRC, lang)
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8')
  const htmlLang = (html.match(/<html lang="([^"]+)"/) || [, lang])[1]
  const title = (html.match(/<title>([^<]*)<\/title>/) || [, ''])[1]
  const description = (html.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1]
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1])
  const content = scripts.find(s => s.includes('const contentData='))
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1])
  const header = cutBetween(html, /<header class="top">/, /<noscript>/)
  const footer = cutBetween(html, /<footer class="footer">/, /<div class="modal"/)
  const modal = cutBetween(html, /<div class="modal"/, /<(div|dialog|section)[^>]*class="photo-viewer/)
  const viewerStart = html.search(/<(div|dialog|section)[^>]*class="photo-viewer/)
  const viewerEnd = html.indexOf('<script>', viewerStart)
  const viewer = html.slice(viewerStart, viewerEnd)
  const { ex, mainStore } = evalContentScript(content)
  const pages = {}
  const skip = new Set(['reality', 'predaj', 'ponuky'])
  for (const p of ex.contentData) {
    if (skip.has(p.id) || /^J[a-zA-Z0-9-]{10}$/.test(p.id)) continue
    mainStore.html = ''; mainStore.child = {}
    try { ex.route(p.id, false) } catch (e) { if (!mainStore.html) throw e }
    let out = mainStore.html
    if (mainStore.child && mainStore.child.inserted) {
      // onas/kontakt: hero s videom kancelárie (route to vkladá do DOM)
      out = out.replace(/<section class="subhero">/, '<section class="subhero office-background" data-ambient-panel>' + mainStore.child.inserted)
    }
    pages[p.id] = { title: p.title, html: out }
  }
  mainStore.html = ''; mainStore.child = {}
  try { ex.route('home', false) } catch (e) { if (!mainStore.html) throw e }
  const home = mainStore.html
  // motion.js: segmenty zo starého skriptu (reveal, scroll, galéria, príbeh, kino, ambient videá)
  const seg1 = cutBetween(content, /const portfolioPhotos=/, /const photoGallery=/)
  const seg2 = cutBetween(content, /const motionQuery=/, /function calculateRental\(/)
  const seg3 = cutBetween(content, /const subpagePhotos=/, /setMotion\(motionEnabled\);route\(/)
  const motion = `/* LIVE-IN web – pohyb a animácie (prenesené zo starého webu, ${lang}) */\n(function(){\nconst main=document.querySelector('main');\nconst icon='';\n${seg1}\n${seg2}\n${seg3}\nwindow.__liveinMotion={page:function(id){try{installDynamics(id||'home');bindPhotos();updateScroll()}catch(e){console.warn('motion',e)}},setMotion:setMotion,syncAmbient:syncAmbient};\nif(window.__liveinMotionPending){window.__liveinMotion.page(window.__liveinMotionPending)}\n})();\n`
  // kalkulačka (samostatná stránka)
  const calcHtml = fs.readFileSync(path.join(dir, 'LIVE-IN_interaktivna_kalkulacka_v21.html'), 'utf8')
  const calc = {
    title: (calcHtml.match(/<title>([^<]*)<\/title>/) || [, ''])[1],
    style: (calcHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [, ''])[1],
    html: cutBetween(calcHtml, /<nav>/, /<script>/).replace(/^<nav>[\s\S]*?<\/nav>/, ''),
    script: ([...calcHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(b => b.includes('renderControls')) || ''),
  }
  const spolHtml = fs.readFileSync(path.join(dir, 'spolupraca.html'), 'utf8')
  const spolupraca = {
    title: (spolHtml.match(/<title>([^<]*)<\/title>/) || [, ''])[1],
    style: (spolHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [, ''])[1],
    html: cutBetween(spolHtml, /<main>/, /<footer>/),
    footer: cutBetween(spolHtml, /<footer>/, /<script/),
  }
  const nav = [...header.matchAll(/<button class="navlink" data-route="([^"]+)">([^<]*)<\/button>/g)].map(m => ({ route: m[1], label: m[2].trim() }))
  const desktopNav = nav.slice(0, header.indexOf('<nav class="mobile-nav"') > 0 ? [...cutBetween(header, /<div class="wrap nav">/, /<nav class="mobile-nav"/).matchAll(/class="navlink"/g)].length : nav.length)
  const mobileNav = [...cutBetween(header, /<nav class="mobile-nav"/, /<\/nav>/).matchAll(/<button class="navlink" data-route="([^"]+)">([^<]*)<\/button>/g)].map(m => ({ route: m[1], label: m[2].trim() }))
  const cta = (header.match(/<button class="btn" data-form="sprava">([^<]*)<\/button>/) || [, ''])[1].trim()
  const logoAria = (header.match(/class="logo" data-route="home" aria-label="([^"]*)"/) || [, 'LIVE-IN'])[1]
  const menuAria = (header.match(/class="menu-toggle" aria-label="([^"]*)"/) || [, 'Menu'])[1]
  const skipLabel = (html.match(/<a class="skip" href="#main">([^<]*)<\/a>/) || [, ''])[1]
  const motionLabel = (html.match(/<button class="motion-control"[^>]*>([^<]*)<\/button>/) || [, ''])[1]
  return {
    lang, htmlLang, title, description, logoAria, menuAria, skipLabel, motionLabel, cta,
    nav: desktopNav, mobileNav,
    pages, home, footer, modal, viewer, calc, spolupraca,
    faqRows: ex.faqRows, filmScenes: ex.filmScenes,
    _siteCss: styles.join('\n').split(OLD + 'live-in-assets/').join('/assets/'), _motion: motion.split(OLD + 'live-in-assets/').join('/assets/'),
  }
}

function prefixCss(css, pre) {
  function proc(block) {
    let out = '', i = 0
    while (i < block.length) {
      const o = block.indexOf('{', i); if (o < 0) { out += block.slice(i); break }
      const sel = block.slice(i, o).trim()
      let depth = 1, j = o + 1; while (j < block.length && depth > 0) { if (block[j] === '{') depth++; else if (block[j] === '}') depth--; j++ }
      const body = block.slice(o + 1, j - 1)
      if (sel.startsWith('@media') || sel.startsWith('@supports')) out += sel + '{' + proc(body) + '}'
      else if (sel.startsWith('@')) out += sel + '{' + body + '}'
      else out += sel.split(',').map(x => { x = x.trim(); if (!x) return x; if (/^(html|body|:root)\b/.test(x)) return pre + x.replace(/^(html|body|:root)/, ''); return pre + ' ' + x }).filter(Boolean).join(',') + '{' + body + '}'
      i = j
    }
    return out
  }
  return proc(css)
}

fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(path.join(PUB, 'motion'), { recursive: true }); fs.mkdirSync(path.join(PUB, 'lead'), { recursive: true })
for (const f of ['report-lead.js', 'livein-analytics.js']) if (fs.existsSync(path.join(SRC, f))) {
  let t = fs.readFileSync(path.join(SRC, f), 'utf8')
  if (f === 'report-lead.js') t = t.replace("new URL('./',document.currentScript.src)", "new URL((window.__liveinAssets||'/assets')+'/',location.href)").split("'live-in-assets/").join("'")
  fs.writeFileSync(path.join(PUB, f), t)
}
let cssHash = null
for (const lang of LANGS) {
  const d = extractLang(lang)
  const h = crypto.createHash('sha1').update(d._siteCss).digest('hex').slice(0, 8)
  if (!cssHash) {
    cssHash = h
    fs.writeFileSync(path.join('app', 'site-base.css'), d._siteCss)
    fs.writeFileSync(path.join('app', 'calc.css'), '/* Kalkulačka – štýly zo samostatnej stránky, s prefixom .lcalc */\n' + prefixCss(d.calc.style, '.lcalc').split(OLD + 'live-in-assets/').join('/assets/'))
    fs.writeFileSync(path.join('app', 'spolupraca.css'), '/* Podmienky spolupráce – štýly zo samostatnej stránky, s prefixom .lspol */\n' + prefixCss(d.spolupraca.style, '.lspol').split(OLD + 'live-in-assets/').join('/assets/'))
  }
  const leadSrc = path.join(lang === 'sk' ? SRC : path.join(SRC, lang), 'lead-form.js')
  if (fs.existsSync(leadSrc)) fs.copyFileSync(leadSrc, path.join(PUB, 'lead', 'lead-form.' + lang + '.js'))
  fs.writeFileSync(path.join(PUB, 'motion', lang + '.js'), d._motion)
  const { _siteCss, _motion, ...json } = d
  fs.writeFileSync(path.join(OUT, lang + '.json'), JSON.stringify(json))
  console.log(lang, 'pages', Object.keys(d.pages).length, 'home', d.home.length, 'nav', d.nav.length, 'mobile', d.mobileNav.length, 'css', h, h === cssHash ? '' : 'CSS DIFFERS', 'calc', d.calc.html.length, d.calc.script.length, 'motion', d._motion.length)
}
