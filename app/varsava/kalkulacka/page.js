import SiteShell from '@/components/SiteShell'
import WarsawCalc from '@/components/WarsawCalc'
import '../../warsaw.css'

export const metadata = { title: 'Kalkulačka výnosnosti · Varšava | LIVE-IN', robots: { index: false, follow: false } }

export default function Page() {
  return (
    <SiteShell lang="sk" route="kalkulacka" kind="calc">
      <WarsawCalc lang="sk" />
    </SiteShell>
  )
}
