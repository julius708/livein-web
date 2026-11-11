// Spoločné prvky projektových stránok.
// Fill = údaj, ktorý ešte treba doplniť (jantárová značka, rovnaká konvencia ako v ostatných appkách LIVE-IN).
export function Fill({ children }) {
  return <mark className="dp-fill">{children}</mark>
}

export function SectionHead({ kicker, title, em, children }) {
  return (
    <div className="dp-heading">
      <div>
        <div className="dp-kicker">{kicker}</div>
        <h2>
          {title}
          <br />
          <em>{em}</em>
        </h2>
      </div>
      {children}
    </div>
  )
}
