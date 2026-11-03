import './site-base.css'
import './glass.css'
import './web.css'

export const metadata = {
  metadataBase: new URL('https://live-in.international'),
  title: 'LIVE-IN International',
  icons: { icon: '/assets/favicon.svg' },
}

export const viewport = { themeColor: '#173E2C', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }) {
  return (
    <html lang="sk">
      <body>{children}</body>
    </html>
  )
}
