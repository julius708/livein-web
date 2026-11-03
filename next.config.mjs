/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  async redirects() {
    const langs = ['en', 'de', 'es', 'pl', 'cz']
    const r = [
      { source: '/livein-release-20261013', destination: '/', permanent: true },
      { source: '/livein-release-20261013/index.html', destination: '/', permanent: true },
      { source: '/livein-release-20261013/spolupraca.html', destination: '/spolupraca', permanent: true },
      { source: '/livein-release-20261013/LIVE-IN_interaktivna_kalkulacka_v21.html', destination: '/kalkulacka', permanent: true },
      { source: '/livein-release-20261013/live-in-assets/:path*', destination: '/assets/:path*', permanent: true },
      { source: '/vypocet', destination: '/kalkulacka', permanent: true },
      { source: '/kalkulacka/', destination: '/kalkulacka', permanent: true },
    ]
    for (const l of langs) {
      r.push({ source: `/livein-release-20261013/${l}`, destination: `/${l}`, permanent: true })
      r.push({ source: `/livein-release-20261013/${l}/index.html`, destination: `/${l}`, permanent: true })
      r.push({ source: `/livein-release-20261013/${l}/spolupraca.html`, destination: `/${l}/spolupraca`, permanent: true })
      r.push({ source: `/livein-release-20261013/${l}/LIVE-IN_interaktivna_kalkulacka_v21.html`, destination: `/${l}/kalkulacka`, permanent: true })
    }
    return r
  },
  async headers() {
    return [
      { source: '/assets/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, immutable' }] },
      { source: '/motion/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=3600' }] },
    ]
  },
}
export default nextConfig
