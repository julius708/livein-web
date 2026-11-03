'use client'
export default function MenuToggle({ label }) {
  return (
    <button className="menu-toggle" type="button" aria-label={label} aria-expanded="false" onClick={e => {
      const m = document.querySelector('.mobile-nav'); if (!m) return
      m.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', String(m.classList.contains('open')))
    }}>☰</button>
  )
}
