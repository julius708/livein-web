import SiteShell from '@/components/SiteShell'
import WarsawManagement from '@/components/WarsawManagement'
import '../../warsaw.css'

export const metadata = { title: 'Koľko zarobí Váš byt vo Varšave | LIVE-IN', robots: { index: false, follow: false } }

export default function Page() {
  return (
    <SiteShell lang="sk" route="kalkulacka" kind="calc">
      <WarsawManagement lang="sk" />
    </SiteShell>
  )
}
