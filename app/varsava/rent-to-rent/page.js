import SiteShell from '@/components/SiteShell'
import WarsawRentToRent from '@/components/WarsawRentToRent'
import '../../warsaw.css'

export const metadata = { title: 'Rent-to-rent Varšava · interné | LIVE-IN', robots: { index: false, follow: false } }

export default function Page() {
  return (
    <SiteShell lang="sk" route="kalkulacka" kind="calc">
      <WarsawRentToRent lang="sk" />
    </SiteShell>
  )
}
