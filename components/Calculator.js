'use client'
import { useEffect, useRef } from 'react'
import Script from 'next/script'

// Kalkulačka: pôvodný výpočet beží v prehliadači, bez odosielania údajov.
export default function Calculator({ html, script, assets }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    window.__liveinAssets = assets
    try { new Function(script)() } catch (e) { console.error('calculator', e) }
  }, [script, assets])
  return (
    <div className="lcalc" ref={ref}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/report-lead.js" strategy="afterInteractive" />
    </div>
  )
}
