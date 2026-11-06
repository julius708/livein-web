import SiteShell from '@/components/SiteShell'
import WarsawManagement from '@/components/WarsawManagement'
import '../../../warsaw.css'

export const metadata = { title: 'What your Warsaw apartment earns | LIVE-IN', robots: { index: false, follow: false } }

export default function Page() {
  return (
    <SiteShell lang="en" route="kalkulacka" kind="calc">
      <WarsawManagement lang="en" />
    </SiteShell>
  )
}
