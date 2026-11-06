import SiteShell from '@/components/SiteShell'
import WarsawRentToRent from '@/components/WarsawRentToRent'
import '../../../warsaw.css'

export const metadata = { title: 'Rent-to-rent Warszawa · wewnętrzny | LIVE-IN', robots: { index: false, follow: false } }

export default function Page() {
  return (
    <SiteShell lang="pl" route="kalkulacka" kind="calc">
      <WarsawRentToRent lang="pl" />
    </SiteShell>
  )
}
