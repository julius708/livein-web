// Stiahne zdrojové HTML a skripty starého webu (na build bez git / bez obsahu v repozitári).
import fs from 'node:fs'
import path from 'node:path'
const BASE = process.env.SOURCE_BASE || 'https://www.live-in.international/livein-release-20261013/'
const OUT = process.argv[2] || '.source'
const LANGS = ['sk', 'en', 'de', 'es', 'pl', 'cz']
async function get(rel, dest) {
  const r = await fetch(BASE + rel, { headers: { 'cache-control': 'no-cache' } })
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + rel)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()))
}
for (const l of LANGS) {
  const p = l === 'sk' ? '' : l + '/'
  for (const f of ['index.html', 'spolupraca.html', 'LIVE-IN_interaktivna_kalkulacka_v21.html', 'lead-form.js']) await get(p + f, path.join(OUT, p, f))
}
for (const f of ['report-lead.js', 'livein-analytics.js']) await get(f, path.join(OUT, f))
console.log('source fetched to', OUT)
