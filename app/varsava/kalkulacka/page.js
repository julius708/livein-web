import SiteShell from '@/components/SiteShell'
import WarsawHub from '@/components/WarsawHub'
import '../../warsaw.css'

export const metadata = { title: 'Varšava · kalkulačky | LIVE-IN', robots: { index: false, follow: false } }

export default function Page() {
  return (
    <SiteShell lang="sk" route="kalkulacka" kind="calc">
      <WarsawHub lang="sk" />
    </SiteShell>
  )
}
