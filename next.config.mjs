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
    // Staré adresy WordPress webu (live-in.international do 11/2026) → nové stránky
    const wp = [
      ['/clanky', '/poradna'], ['/o-nas', '/onas'], ['/sluzby', '/sprava'], ['/kurz', '/poradna'],
      ['/na-predaj', '/kontakt'], ['/nehnutelnost', '/kontakt'], ['/nehnutelnost/:path*', '/kontakt'],
      ['/kategoria-nehnutelnosti/:path*', '/kontakt'],
      ['/en/about-us-2', '/en/onas'], ['/en/articles', '/en/poradna'], ['/en/contact', '/en/kontakt'],
      ['/en/course', '/en/poradna'], ['/en/services-2', '/en/sprava'], ['/en/for-sale', '/en/kontakt'],
      ['/en/real-estate', '/en/kontakt'], ['/en/real-estate/:path*', '/en/kontakt'], ['/en/real-estate-category/:path*', '/en/kontakt'],
      ['/wp-content/:path*', '/'], ['/wp-admin/:path*', '/'], ['/feed', '/'],
    ]
    for (const [source, destination] of wp) r.push({ source, destination, permanent: true })
    // Články WordPressu mali v adrese emoji – stačí zhoda zvyšku adresy
    const wpPosts = [
      ['airbnb-v-bratislave-kompletny-sprievodca-pre-zaciatocnikov', '/clanok-bratislava'],
      ['ako-pripravit-nehnutelnost-na-kratkodoby-prenajom-checklist-od-expertov', '/clanok-priprava'],
      ['kratkodoby-vs-dlhodoby-prenajom-preco-mozete-zarobit-az-o-30-viac', '/clanok-model'],
      ['airbnb-in-bratislava-complete-guide-for-beginners', '/en/clanok-bratislava'],
      ['how-to-prepare-real-estate-for-short-term-rent-checklist-from-experts', '/en/clanok-priprava'],
      ['short-term-vs-long-term-rental-why-you-can-earn-up-to-30-more', '/en/clanok-model'],
    ]
    for (const [tail, destination] of wpPosts) {
      r.push({ source: `/:slug(.*${tail})`, destination, permanent: true })
      r.push({ source: `/en/:slug(.*${tail})`, destination, permanent: true })
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
