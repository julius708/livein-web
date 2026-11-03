// Pred buildom: ak chýba obsah (content/*.json), stiahne zdroj a extrahuje ho.
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
if (process.env.FORCE_FETCH === '1' || !fs.existsSync('content/sk.json')) {
  if (!fs.existsSync('.source/index.html')) execFileSync(process.execPath, ['scripts/fetch-source.mjs', '.source'], { stdio: 'inherit' })
  execFileSync(process.execPath, ['scripts/extract.mjs', '.source'], { stdio: 'inherit' })
} else console.log('content ready')
