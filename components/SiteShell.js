import Script from 'next/script'
import { content, routeHref, LANGS, LANG_NAMES, prefix, transformHtml, OLD_ASSETS, ASSETS, LOGO } from '@/lib/site'
import MenuToggle from '@/components/MenuToggle'
import LangSwitch from '@/components/LangSwitch'

export default function SiteShell({ lang, route, kind, children }) {
  const c = content(lang)
  const nav = c.nav.filter(n => n.route !== 'reality')
  const mobile = c.mobileNav.filter(n => n.route !== 'reality')
  const home = routeHref(lang, 'home')
  const sameRoute = l => (prefix(l) + '/' + (route === 'home' || route === '404' ? '' : route)).replace(/\/$/, '') || '/'
  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <button className="motion-control" type="button" aria-pressed="false">{c.motionLabel}</button>
      <a className="skip" href="#main">{c.skipLabel}</a>
      <header className="top">
        <div className="wrap nav">
          <a className="logo" href={home} aria-label={c.logoAria}><img src={LOGO} alt="LIVE-IN International" width="112" height="49" /></a>
          {nav.map(n => <a key={n.route} className="navlink" data-route={n.route} href={routeHref(lang, n.route)} aria-current={route === n.route ? 'page' : undefined}>{n.label}</a>)}
          <button className="btn" type="button" data-form="sprava">{c.cta}</button>
          <LangSwitch lang={lang} hrefs={Object.fromEntries(LANGS.map(l => [l, sameRoute(l)]))} names={LANG_NAMES} />
          <MenuToggle label={c.menuAria} />
        </div>
      </header>
      {/* rozbaľovacie menu mimo hlavičky: plávajúci sklenený panel nad obsahom */}
      <nav className="mobile-nav" aria-label="Menu">
        {mobile.map(n => <a key={n.route} className="navlink" data-route={n.route} href={routeHref(lang, n.route)} aria-current={route === n.route ? 'page' : undefined}>{n.label}</a>)}
        <button className="btn" type="button" data-form="sprava">{c.cta}</button>
      </nav>
      <main id="main" tabIndex={-1} data-lang={lang} data-route={route}>
        {children}
      </main>
      <div dangerouslySetInnerHTML={{ __html: transformShell(c.footer, lang) }} />
      <div dangerouslySetInnerHTML={{ __html: c.modal }} />
      <div dangerouslySetInnerHTML={{ __html: c.viewer.split(OLD_ASSETS).join(ASSETS) }} />
      <Script src={`/motion/${lang}.js`} strategy="afterInteractive" />
      <Script src={`/lead/lead-form.${lang}.js`} strategy="afterInteractive" />
      <Script src="https://livin-asistent-dun.vercel.app/widget.js" strategy="lazyOnload" />
      <Script src="/livein-analytics.js" strategy="lazyOnload" />
      <Script src="/liquid.js" strategy="lazyOnload" />
    </>
  )
}

function transformShell(html, lang) {
  // päta: tlačidlá s data-route → odkazy, cesty k súborom
  return transformHtml(html, lang)
}
