import SiteShell from '@/components/SiteShell'
import WarsawCalc from '@/components/WarsawCalc'
import '../../../warsaw.css'

export const metadata = { title: 'Kalkulator rentowności · Warszawa | LIVE-IN', robots: { index: false, follow: false } }

export default function Page() {
  return (
    <SiteShell lang="pl" route="kalkulacka" kind="calc">
      <WarsawCalc lang="pl" />
    </SiteShell>
  )
}
