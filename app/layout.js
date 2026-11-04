import './site-base.css'
import './glass.css'
import './web.css'
import './polish.css'
import { Figtree } from 'next/font/google'

// Písmo webu (Figtree) sa servíruje z vlastnej domény: žiadna požiadavka na Google Fonts, žiadny posun textu pri načítaní.
const figtree = Figtree({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700', '800'], display: 'swap', variable: '--font-figtree' })

export const metadata = {
  metadataBase: new URL('https://live-in.international'),
  title: 'LIVE-IN International',
  icons: { icon: '/assets/favicon.svg' },
}

export const viewport = { themeColor: '#173E2C', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }) {
  return (
    <html lang="sk" className={figtree.variable}>
      <body>{children}</body>
    </html>
  )
}
