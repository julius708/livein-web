import SiteShell from '@/components/SiteShell'
import WarsawHub from '@/components/WarsawHub'
import '../../../warsaw.css'

export const metadata = { title: 'Warszawa · kalkulatory | LIVE-IN', robots: { index: false, follow: false } }

export default function Page() {
  return (
    <SiteShell lang="pl" route="kalkulacka" kind="calc">
      <WarsawHub lang="pl" />
    </SiteShell>
  )
}
