// Zoznam súborov kódu pre nasadenie bez git (obsah sa stiahne a extrahuje počas buildu).
import fs from 'node:fs'
import crypto from 'node:crypto'
const out = []
const files = ['package.json', 'next.config.mjs', 'vercel.json', 'jsconfig.json', 'app/layout.js', 'app/[[...slug]]/page.js', 'app/not-found.js', 'app/web.css', 'app/glass.css', 'lib/site.js', 'components/SiteShell.js', 'components/MenuToggle.js', 'components/LangSwitch.js', 'components/PageEffects.js', 'components/Calculator.js', 'scripts/extract.mjs', 'scripts/fetch-source.mjs', 'scripts/prepare.mjs']
for (const f of files) { const buf = fs.readFileSync(f); out.push({ file: f, data: buf.toString('utf8'), encoding: 'utf-8', size: buf.length, sha: crypto.createHash('sha1').update(buf).digest('hex') }) }
fs.mkdirSync('.preview', { recursive: true })
fs.writeFileSync('.preview/files.json', JSON.stringify(out.map(({ file, data, encoding }) => ({ file, data, encoding }))))
console.log(out.map(o => o.size + '\t' + o.file).join('\n'), '\nTOTAL', out.reduce((a, o) => a + o.size, 0))
