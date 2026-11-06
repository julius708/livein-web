import SiteShell from '@/components/SiteShell'
import WarsawCalc from '@/components/WarsawCalc'
import '../../../warsaw.css'

export const metadata = { title: 'Returns calculator · Warsaw | LIVE-IN', robots: { index: false, follow: false } }

export default function Page() {
  return (
    <SiteShell lang="en" route="kalkulacka" kind="calc">
      <WarsawCalc lang="en" />
    </SiteShell>
  )
}
