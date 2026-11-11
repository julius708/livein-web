"use client";

import { useState } from "react";
import { SERVICES } from "@/lib/developer-projects";
import UnitSelector from "./developer/UnitSelector";
import Calculator from "./developer/Calculator";
import Comparison from "./developer/Comparison";
import InterestForm from "./developer/InterestForm";
import { Fill, SectionHead } from "./developer/ui";
import "./developer-project.css";

export default function DeveloperProject({ project, projectId }) {
  const [unit, setUnit] = useState(project.units[0]);
  const [seed, setSeed] = useState(null); // tlačidlá „Mám záujem“ predvyplnia formulár
  const ask = (purpose) => setSeed({ purpose, n: Date.now() });

  return (
    <div className="dp">
      <a className="dp-skip" href="#obsah">
        Prejsť na obsah
      </a>
      <div className="dp-preview">PRACOVNÁ UKÁŽKA · podklady a výpočty čakajú na potvrdenie</div>
      <header className="dp-nav">
        <a href="/" aria-label="LIVE-IN úvod">
          <img src="/assets/logo-transparent.png" alt="LIVE-IN International" />
        </a>
        <nav aria-label="Projektové menu">
          <a href="#projekt" className="dp-opt">Projekt</a>
          <a href="#apartmany" className="dp-opt">Apartmány</a>
          <a href="#vynos">Kalkulačka</a>
          <a href="#porovnanie" className="dp-opt">Porovnanie</a>
          <a href="#zaujem" className="dp-button dp-small" onClick={() => ask("presentation")}>
            Mám záujem <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>
      <main id="obsah">
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
                Vybrať apartmán <span aria-hidden="true">↗</span>
              </a>
              <a className="dp-secondary" href="#vynos">
                Prepočítať investíciu ↓
              </a>
              <a className="dp-secondary" href="#zaujem" onClick={() => ask("presentation")}>
                Vyžiadať prezentáciu
              </a>
            </div>
            <p className="dp-partner">
              {project.partnerLine}
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
                <Fill>Priestor pre schválenú vizualizáciu projektu</Fill>
              </span>
            </div>
            <span className="dp-caption">Koncept prezentácie · grafika LIVE-IN</span>
          </div>
        </section>
        <ul className="dp-facts dp-wrap" aria-label="Základné údaje">
          {project.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>

        <section className="dp-wrap dp-section" id="projekt">
          <SectionHead kicker="01 / Projekt a developer" title="Čo kupujete a" em="od koho.">
            <p>Údaje k {project.asOf}. Čo ešte chýba, je označené jantárovo.</p>
          </SectionHead>
          <div className="dp-aboutgrid">
            <div>
              {project.aboutProject.map((t) => (
                <p key={t} className="dp-lead">{t}</p>
              ))}
              {project.operator && <p className="dp-lead">{project.operator}</p>}
            </div>
            <div className="dp-devcard">
              <div className="dp-kicker">Developer a partner</div>
              <h3>{project.partner}</h3>
              <p>Predaj apartmánov a obchodné podmienky rieši developer. LIVE-IN zabezpečuje evidenciu záujemcov a prevádzku apartmánov po kúpe.</p>
              <ul className="dp-fills">
                {project.fills.map((x) => (
                  <li key={x}><Fill>{x}</Fill></li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="dp-wrap dp-section" id="apartmany">
          <SectionHead kicker="02 / Vyberte si svoj priestor" title="Každý apartmán má" em="svoj príbeh.">
            <p>{project.source}</p>
          </SectionHead>
          <UnitSelector project={project} unit={unit} onSelect={setUnit} onInterest={ask} />
        </section>

        <section className="dp-location" id="lokalita">
          <div className="dp-wrap dp-locationgrid">
            <div>
              <div className="dp-kicker">03 / Lokalita</div>
              <h2>
                Bratislava.
                <br />
                <em>V jej centre.</em>
              </h2>
              <p>
                {project.location}. Pešie vzdialenosti, dopravu a vybavenosť doplníme z overených podkladov: <Fill>na doplnenie</Fill>
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.mapQuery)}`}
                target="_blank"
                rel="noreferrer"
              >
                Pozrieť lokalitu na mape ↗
              </a>
            </div>
            <div className="dp-valuecards">
              {SERVICES.slice(0, 3).map(([t, d], i) => (
                <article key={t}>
                  <span>0{i + 1}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="dp-wrap dp-section" id="vynos">
          <SectionHead kicker="04 / Projektová kalkulačka" title="Čísla pre váš" em="ďalší krok.">
            <p>
              Vychádza z logiky webovej kalkulačky LIVE-IN. Zvoľte scenár, upravte predpoklady a pozrite sa na zdroj každého čísla.
            </p>
          </SectionHead>
          <Calculator project={project} unit={unit} onInterest={ask} />
        </section>

        <section className="dp-wrap dp-section dp-compare" id="porovnanie">
          <div className="dp-kicker">05 / Porovnanie</div>
          <h2>
            Porovnajte si
            <br />
            <em>konkrétne možnosti.</em>
          </h2>
          <Comparison project={project} unit={unit} />
        </section>

        <section className="dp-wrap dp-section" id="sluzby">
          <SectionHead kicker="06 / Čo zabezpečí LIVE-IN a čo overiť" title="Od záujmu po" em="prevádzku.">
            <p>Kontrolný zoznam je neutrálny podklad pred rezerváciou, nie hodnotenie developera.</p>
          </SectionHead>
          <div className="dp-twocol">
            <div>
              <h3>Čo zabezpečí LIVE-IN</h3>
              <ol className="dp-cards">
                {SERVICES.map(([t, d]) => (
                  <li key={t}>
                    <b>{t}</b>
                    <span>{d}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3>Čo si overiť pred rezerváciou</h3>
              <ol className="dp-cards">
                {project.checklist.map(([t, d]) => (
                  <li key={t}>
                    <b>{t}</b>
                    <span>{d}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="dp-interest" id="zaujem">
          <div className="dp-wrap dp-interestgrid">
            <div>
              <div className="dp-kicker">07 / Ďalší krok</div>
              <h2>
                Od záujmu
                <br />
                <em>k osobnému rozhovoru.</em>
              </h2>
              <p>
                Vyberte si prezentáciu alebo kontakt k apartmánu. Pri ostrej prevádzke sa dopyt zaeviduje u LIVE-IN a len ak o to požiadate, odovzdá sa developerovi.
              </p>
              <ol>
                <li>Registrácia dopytu pri konkrétnom projekte</li>
                <li>Potvrdenie prijatia a dohodnutie kontaktu</li>
                <li>Obhliadka a rezervácia s developerom</li>
              </ol>
              <div className="dp-presentation">
                <b>Prezentácia projektu</b>
                <span>
                  <Fill>PDF prezentáciu doplní developer alebo LIVE-IN</Fill> Zatiaľ ju vieme poslať na vyžiadanie.
                </span>
              </div>
            </div>
            <InterestForm project={project} projectId={projectId} unit={unit} seed={seed} />
          </div>
        </section>
      </main>
      <footer className="dp-wrap dp-footer">
        <span>LIVE-IN International · {project.name}</span>
        <span>Ukážka na stretnutie · november 2026</span>
      </footer>
    </div>
  );
}
