'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Po každej navigácii: jazyk dokumentu, animácie zo starého webu, formulár dopytu, hash odkazy zo starého webu.
export default function PageEffects({ lang, route, kind }) {
  const router = useRouter()
  useEffect(() => {
    document.documentElement.lang = lang === 'cz' ? 'cs' : lang
    const m = document.querySelector('.mobile-nav'); if (m) m.classList.remove('open')
    window.scrollTo(0, 0)
    // staré hash adresy (#sprava, #kalkulacka…) → nové URL
    const h = (location.hash || '').slice(1)
    if (route === 'home' && h && h !== 'home' && /^[a-z0-9-]+$/.test(h)) {
      const map = { vypocet: 'kalkulacka', clanky: 'poradna', clanok: 'clanok-model', reality: 'kontakt', predaj: 'kontakt', ponuky: 'kontakt' }
      const target = (lang === 'sk' ? '' : '/' + lang) + '/' + (map[h] || h)
      router.replace(target)
      return
    }
    // pohyb a animácie
    if (window.__liveinMotion) window.__liveinMotion.page(route); else window.__liveinMotionPending = route
    // tlačidlá „Posúdiť môj byt“ → modálny formulár
    const modal = document.querySelector('.modal')
    const openForm = type => {
      if (!modal) return
      const f = modal.querySelector('form'), select = modal.querySelector('#service')
      modal.hidden = false; document.body.style.overflow = 'hidden'
      if (f) { f.hidden = false; f.reset() }
      const s = modal.querySelector('.success'); if (s) s.hidden = true
      if (select && type) { const opt = [...select.options].find(o => o.value.toLowerCase().includes(type === 'kratkodoba' ? 'krát' : type === 'dlhodoba' ? 'dlh' : '')); if (opt) select.value = opt.value }
      const first = modal.querySelector('input[name=name]'); if (first) setTimeout(() => first.focus(), 30)
    }
    const closeForm = () => { if (!modal) return; modal.hidden = true; document.body.style.overflow = '' }
    const onClick = e => {
      const b = e.target.closest('[data-form]'); if (b) { e.preventDefault(); openForm(b.dataset.form); return }
      if (e.target.closest('.modal .close')) { closeForm(); return }
      if (e.target.classList && e.target.classList.contains('modal')) closeForm()
    }
    const onKey = e => { if (e.key === 'Escape' && modal && !modal.hidden) closeForm() }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey) }
  }, [lang, route, kind, router])
  return null
}
