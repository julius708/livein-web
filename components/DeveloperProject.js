"use client";

import { useState } from "react";
import { investmentResult } from "@/lib/developer-projects";
import "./developer-project.css";

const money = (v) =>
  new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);
const number = (v) =>
  new Intl.NumberFormat("sk-SK", { maximumFractionDigits: 2 }).format(v);
const fields = [
  ["price", "Kúpna cena (€)", 0, 10000000, 1000],
  ["furnishing", "Zariadenie a vstupné náklady (€)", 0, 1000000, 500],
  ["adr", "Cena za noc (€)", 0, 2000, 1],
  ["occupancy", "Obsadenosť (%)", 0, 100, 1],
  ["own", "Vlastné noci za mesiac", 0, 30, 1],
  ["stay", "Dĺžka pobytu (noci)", 1, 365, 0.1],
  ["portal", "Poplatky portálov (%)", 0, 100, 0.1],
  ["management", "Správa LIVE-IN (%)", 0, 100, 0.1],
  ["vat", "DPH v modeli (%)", 0, 100, 0.1],
  ["fixed", "Energie, rezerva a ostatné náklady / mes. (€)", 0, 100000, 10],
  ["software", "Softvér / mes. (€)", 0, 10000, 1],
  ["cleanCost", "Náklady na upratovanie / pobyt (€)", 0, 10000, 1],
  ["cleanPaid", "Upratovanie hradené hosťom / pobyt (€)", 0, 10000, 1],
];

export default function DeveloperProject({ project, projectId }) {
  const [unit, setUnit] = useState(project.units[0]);
  const [values, setValues] = useState({
    price: project.units[0].price ?? "",
    furnishing: 15000,
    adr: 70,
    occupancy: 65,
    own: 0,
    stay: 3,
    portal: 15,
    management: 17,
    vat: 5,
    fixed: 220,
    software: 50,
    cleanCost: 45,
    cleanPaid: 45,
  });
  const [comparison, setComparison] = useState("");
  const [sent, setSent] = useState(false);
  const valid = fields.every(
    ([key, , min, max]) =>
      values[key] !== "" &&
      Number.isFinite(Number(values[key])) &&
      Number(values[key]) >= min &&
      Number(values[key]) <= max,
  );
  const result = valid
    ? investmentResult(
        Object.fromEntries(
          Object.entries(values).map(([k, v]) => [k, Number(v)]),
        ),
      )
    : null;
  const comparator = project.units.find((u) => u.id === comparison);
  function selectUnit(selected) {
    setUnit(selected);
    setValues((v) => ({ ...v, price: selected.price ?? "" }));
    setSent(false);
  }
  return (
    <div className="dp">
      <div className="dp-preview">
        PRACOVNÁ UKÁŽKA · podklady a výpočty čakajú na potvrdenie
      </div>
      <header className="dp-nav">
        <a href="/" aria-label="LIVE-IN úvod">
          <img src="/assets/logo-transparent.png" alt="LIVE-IN International" />
        </a>
        <nav aria-label="Projektové menu">
          <a href="#apartmany">Apartmány</a>
          <a href="#vynos">Kalkulačka</a>
          <a href="#zaujem" className="dp-button dp-small">
            Mám záujem ↗
          </a>
        </nav>
      </header>
      <main>
        <section className="dp-hero dp-wrap">
          <div>
            <div className="dp-kicker">{project.location}</div>
            <h1>
              {project.name}
              <span>{project.headline}</span>
            </h1>
            <p className="dp-intro">{project.intro}</p>
            <div className="dp-actions">
              <a className="dp-button" href="#apartmany">
                Vybrať apartmán <span>↗</span>
              </a>
              <a className="dp-secondary" href="#vynos">
                Prepočítať investíciu ↓
              </a>
            </div>
            <p className="dp-partner">
              Projekt · {project.partner}
              <br />
              Návrh predaja a správy · LIVE-IN International
            </p>
          </div>
          <div className="dp-editorial">
            <div className="dp-arch">
              <span className="dp-arch-label">{project.name}</span>
              <strong>
                Vlastníte.
                <br />
                <em>My sa staráme.</em>
              </strong>
              <span className="dp-arch-foot">
                Priestor pre schválenú vizualizáciu projektu
              </span>
            </div>
            <span className="dp-caption">
              Koncept prezentácie · grafika LIVE-IN
            </span>
          </div>
        </section>
        <div className="dp-facts dp-wrap">
          {project.facts.map((f) => (
            <p key={f}>{f}</p>
          ))}
        </div>
        <section className="dp-wrap dp-section" id="apartmany">
          <div className="dp-heading">
            <div>
              <div className="dp-kicker">01 / Vyberte si svoj priestor</div>
              <h2>
                Každý apartmán má
                <br />
                <em>svoj príbeh.</em>
              </h2>
            </div>
            <p>{project.source}</p>
          </div>
          <div className="dp-selector">
            <div className="dp-unitlist" aria-label="Výber apartmánu">
              {project.units.map((u) => (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => selectUnit(u)}
                  aria-pressed={unit.id === u.id}
                  className={unit.id === u.id ? "selected" : ""}
                >
                  <span>
                    <strong>{u.id}</strong>
                    <small>
                      {u.layout} ·{" "}
                      {u.area
                        ? `${number(u.area)} m²`
                        : "Výmeru doplní developer"}
                    </small>
                  </span>
                  <b>
                    {u.price ? money(u.price) : "Cena na doplnenie"}
                    <small>{u.floor}</small>
                  </b>
                </button>
              ))}
            </div>
            <article className="dp-unitdetail" aria-live="polite">
              <div className="dp-detailhead">
                <h3>{unit.id}</h3>
                <span className="dp-pill">
                  {unit.price ? "Historická ponuka" : "Modelový výber"}
                </span>
              </div>
              <div className="dp-plan">
                <span>▤</span>
                <strong>Pôdorys doplní developer</strong>
                <p>Tu sa zobrazí skutočný pôdorys vybranej jednotky.</p>
              </div>
              <dl className="dp-specs">
                <div>
                  <dt>Úžitková plocha</dt>
                  <dd>
                    {unit.area ? `${number(unit.area)} m²` : "Na doplnenie"}
                  </dd>
                </div>
                <div>
                  <dt>Dispozícia</dt>
                  <dd>{unit.layout}</dd>
                </div>
                <div>
                  <dt>Podlažie</dt>
                  <dd>{unit.floor}</dd>
                </div>
                <div>
                  <dt>Orientácia</dt>
                  <dd>{unit.orientation}</dd>
                </div>
              </dl>
              <p className="dp-note">
                Dostupnosť, konečná cena, DPH a štandard sa potvrdia podľa
                aktuálnej ponuky.
              </p>
              <a href="#vynos" className="dp-button">
                Prepočítať {unit.id} ↗
              </a>
            </article>
          </div>
        </section>
        <section className="dp-location">
          <div className="dp-wrap dp-locationgrid">
            <div>
              <div className="dp-kicker">02 / Lokalita a hodnota</div>
              <h2>
                Bratislava.
                <br />
                <em>V jej centre.</em>
              </h2>
              <p>
                {project.location}. Podrobnú mapu, pešie vzdialenosti,
                vybavenosť a argumenty pre konkrétnu jednotku doplníme z
                overených podkladov.
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(projectId === "lazaretska-15" ? "Lazaretská 15 Bratislava" : "Cintorínska Rajská Bratislava")}`}
                target="_blank"
                rel="noreferrer"
              >
                Pozrieť lokalitu na mape ↗
              </a>
            </div>
            <div className="dp-valuecards">
              <article>
                <span>01</span>
                <h3>Projekt a konkrétna jednotka</h3>
                <p>
                  Pôdorys, plocha, štandard a stav ponuky pri každom apartmáne.
                </p>
              </article>
              <article>
                <span>02</span>
                <h3>Prevádzka s LIVE-IN</h3>
                <p>
                  Príprava prenájmu, rezervácie, komunikácia a reporting podľa
                  dohodnutého rozsahu.
                </p>
              </article>
              <article>
                <span>03</span>
                <h3>Rozhodnutie s číslami</h3>
                <p>
                  Upraviteľné predpoklady a rozpis nákladov pre vybranú
                  jednotku.
                </p>
              </article>
            </div>
          </div>
        </section>
        <section className="dp-wrap dp-section" id="vynos">
          <div className="dp-heading">
            <div>
              <div className="dp-kicker">03 / Projektová kalkulačka</div>
              <h2>
                Čísla pre váš
                <br />
                <em>ďalší krok.</em>
              </h2>
            </div>
            <p>
              Modelový výpočet vychádza z logiky slovenskej kalkulačky LIVE-IN.
              Predvolené prevádzkové hodnoty slúžia na predvedenie funkcie.
            </p>
          </div>
          <div className="dp-calculator">
            <div>
              <h3>Scenár pre {unit.id}</h3>
              <div className="dp-inputs">
                {fields.map(([key, label, min, max, step]) => (
                  <label key={key}>
                    {label}
                    <input
                      type="number"
                      min={min}
                      max={max}
                      step={step}
                      value={values[key]}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, [key]: e.target.value }))
                      }
                    />
                  </label>
                ))}
              </div>
              <p className="dp-note">
                Počítame 30-dňový modelový mesiac a 12 rovnakých mesiacov.
                Doplňte sezónnosť, financovanie a daň z príjmu pri finálnom
                posúdení. Sadzba DPH a poplatky sú upraviteľné predpoklady.
              </p>
            </div>
            <aside className="dp-result" aria-live="polite">
              <div className="dp-kicker">Orientačný scenár</div>
              <p>Prevádzkový výsledok mesačne</p>
              <strong>
                {result ? money(result.monthly) : "Doplňte vstupy"}
              </strong>
              <p>
                {result
                  ? `${money(result.annual)} ročne · pred financovaním a daňou z príjmu`
                  : "Zadajte platnú cenu a predpoklady."}
              </p>
              <dl>
                <div>
                  <dt>Celková investícia</dt>
                  <dd>{result ? money(result.investment) : "—"}</dd>
                </div>
                <div>
                  <dt>Modelový ročný výnos</dt>
                  <dd>
                    {result?.yield != null ? `${number(result.yield)} %` : "—"}
                  </dd>
                </div>
                <div>
                  <dt>Tržby z nocí / mesiac</dt>
                  <dd>{result ? money(result.gross) : "—"}</dd>
                </div>
                <div>
                  <dt>Portály</dt>
                  <dd>{result ? money(result.portal) : "—"}</dd>
                </div>
                <div>
                  <dt>Správa LIVE-IN</dt>
                  <dd>{result ? money(result.management) : "—"}</dd>
                </div>
                <div>
                  <dt>DPH v modeli</dt>
                  <dd>{result ? money(result.vat) : "—"}</dd>
                </div>
                <div>
                  <dt>Upratovanie po úhrade hosťom</dt>
                  <dd>{result ? money(result.cleaning) : "—"}</dd>
                </div>
                <div>
                  <dt>Ostatné náklady a softvér</dt>
                  <dd>
                    {valid
                      ? money(Number(values.fixed) + Number(values.software))
                      : "—"}
                  </dd>
                </div>
              </dl>
              <a href="#zaujem" className="dp-button">
                Chcem individuálne posúdenie ↗
              </a>
              <small>
                Výsledok je scenár podľa zadaných hodnôt, nie prísľub výnosu.
              </small>
            </aside>
          </div>
        </section>
        <section className="dp-wrap dp-section dp-compare">
          <div className="dp-kicker">04 / Porovnanie</div>
          <h2>
            Porovnajte si
            <br />
            <em>konkrétne možnosti.</em>
          </h2>
          {project.units.length > 1 ? (
            <>
              <label>
                Porovnať s jednotkou{" "}
                <select
                  value={comparison}
                  onChange={(e) => setComparison(e.target.value)}
                >
                  <option value="">Vyberte apartmán</option>
                  {project.units
                    .filter((u) => u.id !== unit.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.id}
                      </option>
                    ))}
                </select>
              </label>
              <div className="dp-table">
                <table>
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>{unit.id}</th>
                      <th>{comparator?.id || "Vyberte jednotku"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Plocha</th>
                      <td>{number(unit.area)} m²</td>
                      <td>
                        {comparator ? `${number(comparator.area)} m²` : "—"}
                      </td>
                    </tr>
                    <tr>
                      <th>Historická cena</th>
                      <td>{money(unit.price)}</td>
                      <td>{comparator ? money(comparator.price) : "—"}</td>
                    </tr>
                    <tr>
                      <th>Cena za m²</th>
                      <td>{money(unit.price / unit.area)}</td>
                      <td>
                        {comparator
                          ? money(comparator.price / comparator.area)
                          : "—"}
                      </td>
                    </tr>
                    <tr>
                      <th>Orientácia</th>
                      <td>{unit.orientation}</td>
                      <td>{comparator?.orientation || "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p>
              Tabuľku jednotiek doplníme podľa aktuálneho cenníka a pôdorysov
              Lordshipu.
            </p>
          )}
          <p className="dp-note">
            Porovnanie s inými projektmi doplníme po overení cenníkov, výmer,
            štandardu a dátumu ponuky.
          </p>
        </section>
        <section className="dp-interest" id="zaujem">
          <div className="dp-wrap dp-interestgrid">
            <div>
              <div className="dp-kicker">05 / Ďalší krok</div>
              <h2>
                Od záujmu
                <br />
                <em>k osobnému rozhovoru.</em>
              </h2>
              <p>
                Vyberte si prezentáciu alebo kontakt k apartmánu. Pri ostrej
                prevádzke sa dopyt zaeviduje u LIVE-IN a podľa vašej požiadavky
                odovzdá predajnému tímu.
              </p>
              <ol>
                <li>Registrácia dopytu pri konkrétnom projekte</li>
                <li>Potvrdenie prijatia a dohodnutie kontaktu</li>
                <li>Obhliadka a rezervácia s developerom</li>
              </ol>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <span className="dp-pill">
                Demo formulár · údaje sa neodosielajú
              </span>
              <p className="dp-note">Na predvedenie použite skúšobné údaje.</p>
              <div className="dp-inputs">
                <label>
                  Meno
                  <input name="firstName" required autoComplete="given-name" />
                </label>
                <label>
                  Priezvisko
                  <input name="lastName" required autoComplete="family-name" />
                </label>
              </div>
              <label>
                E-mail
                <input
                  name="email"
                  required
                  type="email"
                  autoComplete="email"
                />
              </label>
              <label>
                Telefón pre spätný kontakt
                <input name="phone" type="tel" autoComplete="tel" />
              </label>
              <label>
                Čo vás zaujíma?
                <select name="interest">
                  <option>Prezentácia projektu</option>
                  <option>Kontakt k apartmánu {unit.id}</option>
                  <option>Obhliadka</option>
                  <option>Správa po kúpe</option>
                </select>
              </label>
              <label className="dp-checkbox">
                <input type="checkbox" required />V ukážke potvrdzujem
                simulovanú žiadosť o kontakt k projektu {project.name}.
              </label>
              <button className="dp-button" type="submit">
                Predviesť registráciu záujmu ↗
              </button>
              {sent && (
                <div role="status" className="dp-confirm">
                  <strong>Ukážka dopytu je pripravená.</strong>
                  <p>
                    {project.name} · {unit.id} · nový záujemca
                  </p>
                  <p>
                    Produkčné prepojenie HubSpot → Asana → developer sa doplní
                    po potvrdení príjemcu a pravidiel formulára.
                  </p>
                </div>
              )}
            </form>
          </div>
        </section>
      </main>
      <footer className="dp-wrap dp-footer">
        <span>LIVE-IN International · {project.name}</span>
        <span>Ukážka na stretnutie · november 2026</span>
        <a
          href={
            projectId === "lazaretska-15"
              ? "/projekty/arteria-living"
              : "/projekty/lazaretska-15"
          }
        >
          Druhý projekt ↗
        </a>
      </footer>
    </div>
  );
}
