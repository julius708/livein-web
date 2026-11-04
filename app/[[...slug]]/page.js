import { notFound } from 'next/navigation'
import { LANGS, routes, resolveSlug, pageData, prefix, ASSETS } from '@/lib/site'
import SiteShell from '@/components/SiteShell'
import Calculator from '@/components/Calculator'
import PageEffects from '@/components/PageEffects'
import HomeExtras from '@/components/HomeExtras'

export const dynamicParams = false

export function generateStaticParams() {
  const out = [{ slug: [] }]
  for (const lang of LANGS) {
    const base = lang === 'sk' ? [] : [lang]
    if (lang !== 'sk') out.push({ slug: base })
    for (const r of routes(lang)) out.push({ slug: [...base, r] })
  }
  return out
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const r = resolveSlug(slug)
  if (!r) return {}
  const d = pageData(r.lang, r.route)
  if (!d) return {}
  const path = (prefix(r.lang) + '/' + r.route).replace(/\/$/, '') || '/'
  const languages = {}
  for (const l of LANGS) languages[l === 'cz' ? 'cs' : l] = (prefix(l) + '/' + r.route).replace(/\/$/, '') || '/'
  return { title: d.title, description: d.description, alternates: { canonical: path, languages } }
}

export default async function Page({ params }) {
  const { slug } = await params
  const r = resolveSlug(slug)
  if (!r) notFound()
  const d = pageData(r.lang, r.route)
  if (!d) notFound()
  const routeId = r.route || 'home'
  return (
    <SiteShell lang={r.lang} route={routeId} kind={d.kind}>
      {d.kind === 'calc' ? (
        <Calculator html={d.html} script={d.script} assets={ASSETS.replace(/\/$/, '')} />
      ) : d.kind === 'spolupraca' ? (
        <div className="route wrap lspol"><div className="lspol-main" dangerouslySetInnerHTML={{ __html: d.html }} /><p className="lspol-foot" dangerouslySetInnerHTML={{ __html: d.footer }} /></div>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: d.html }} />
      )}
      <PageEffects lang={r.lang} route={routeId} kind={d.kind} />
      {d.kind === 'home' && <HomeExtras lang={r.lang} />}
    </SiteShell>
  )
}
