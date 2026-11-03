'use client'
import { useRouter } from 'next/navigation'

export default function LangSwitch({ lang, hrefs, names }) {
  const router = useRouter()
  return (
    <select className="livein-language" aria-label="Language" value={lang} onChange={e => router.push(hrefs[e.target.value])}>
      {Object.keys(hrefs).map(l => <option key={l} value={l}>{l.toUpperCase()} · {names[l]}</option>)}
    </select>
  )
}
