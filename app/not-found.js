import SiteShell from '@/components/SiteShell'

export default function NotFound() {
  return (
    <SiteShell lang="sk" route="404" kind="page">
      <div className="route wrap"><section className="subhero"><div className="eyebrow">LIVE-IN</div><h1>Stránka sa nenašla.</h1><p>Odkaz je neplatný alebo sa stránka presunula. <a href="/">Späť na úvod</a></p></section></div>
    </SiteShell>
  )
}
