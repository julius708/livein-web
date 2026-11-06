import SiteShell from '@/components/SiteShell'
import WarsawManagement from '@/components/WarsawManagement'
import '../../../warsaw.css'

export const metadata = { title: 'Ile zarobi Twoje mieszkanie w Warszawie | LIVE-IN', robots: { index: false, follow: false } }

export default function Page() {
  return (
    <SiteShell lang="pl" route="kalkulacka" kind="calc">
      <WarsawManagement lang="pl" />
    </SiteShell>
  )
}
