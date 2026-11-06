import SiteShell from '@/components/SiteShell'
import WarsawHub from '@/components/WarsawHub'
import '../../../warsaw.css'

export const metadata = { title: 'Warsaw · calculators | LIVE-IN', robots: { index: false, follow: false } }

export default function Page() {
  return (
    <SiteShell lang="en" route="kalkulacka" kind="calc">
      <WarsawHub lang="en" />
    </SiteShell>
  )
}
