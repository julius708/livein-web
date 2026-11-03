import { LANGS, routes, prefix } from '@/lib/site'

const BASE = 'https://live-in.international'

export default function sitemap() {
  const out = []
  for (const lang of LANGS) {
    out.push({ url: BASE + (prefix(lang) || '/'), changeFrequency: 'weekly', priority: 1 })
    for (const r of routes(lang)) out.push({ url: `${BASE}${prefix(lang)}/${r}`, changeFrequency: 'monthly', priority: r.startsWith('clanok') ? 0.6 : 0.8 })
  }
  return out
}
