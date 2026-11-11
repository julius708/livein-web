"use client";

import { useMemo, useState } from "react";
import { projects, formatMoney } from "@/lib/developer-projects";
import { Fill } from "./ui";
import "../developer-project.css";

export const STAGES = [
  ["new", "Nový"],
  ["contacted", "Kontaktovaný"],
  ["viewing", "Obhliadka"],
  ["reserved", "Rezervácia"],
  ["sold", "Predané"],
  ["lost", "Neúspešné"],
];
export const COMMISSION = [
  ["none", "Zatiaľ nie"],
  ["expected", "Očakávaná"],
  ["entitled", "Nárok"],
  ["invoiced", "Fakturovaná"],
  ["paid", "Zaplatená"],
];
export const MANAGEMENT = [
  ["none", "Zatiaľ nie"],
  ["opportunity", "Príležitosť na správu"],
  ["offered", "Ponuka odoslaná"],
  ["signed", "Zmluva o správe"],
];

// Ukážkové dopyty bez skutočných osôb. Slúžia len na predvedenie toku stavov a provízie.
const SAMPLE = [
  { id: 1, who: "Záujemca A", unit: "AP 13", stage: "new", shared: true, source: "Databáza LIVE-IN", commission: "none", management: "none" },
  { id: 2, who: "Záujemca B", unit: "AP 14", stage: "contacted", shared: true, source: "Marketingový e-mail", commission: "none", management: "none" },
  { id: 3, who: "Záujemca C", unit: "AP 26", stage: "viewing", shared: true, source: "Verejný odkaz", commission: "none", management: "none" },
  { id: 4, who: "Záujemca D", unit: "AP 10", stage: "reserved", shared: true, source: "Databáza LIVE-IN", commission: "expected", management: "none" },
  { id: 5, who: "Záujemca E", unit: "AP 1", stage: "sold", shared: true, source: "Databáza LIVE-IN", commission: "entitled", management: "opportunity" },
  { id: 6, who: "Záujemca F", unit: "AP 100", stage: "lost", shared: true, source: "Verejný odkaz", commission: "none", management: "none" },
  { id: 7, who: "Záujemca G", unit: "AP 12", stage: "new", shared: false, source: "Verejný odkaz", commission: "none", management: "none" },
];

const label = (list, id) => (list.find((x) => x[0] === id) || [])[1] || id;

export default function PipelineDemo() {
  const project = projects["lazaretska-15"];
  const price = (unit) => (project.units.find((u) => u.id === unit) || {}).price || 0;
  const [leads, setLeads] = useState(SAMPLE);
  const [view, setView] = useState("livein"); // livein | developer
  const [rate, setRate] = useState("");
  const [log, setLog] = useState([]);

  const visible = view === "developer" ? leads.filter((l) => l.shared) : leads;
  const change = (id, field, value, text) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
    const list = { stage: STAGES, commission: COMMISSION, management: MANAGEMENT }[field];
    setLog((x) => [`${text}: ${label(list, value)}`, ...x].slice(0, 6));
  };
  const rateNum = rate !== "" && Number.isFinite(Number(rate)) && Number(rate) >= 0 && Number(rate) <= 20 ? Number(rate) : null;
  const sums = useMemo(() => {
    const out = {};
    for (const [id] of COMMISSION) out[id] = { n: 0, amount: 0 };
    for (const l of leads) {
      out[l.commission].n += 1;
      if (rateNum != null) out[l.commission].amount += (price(l.unit) * rateNum) / 100;
    }
    return out;
  }, [leads, rateNum]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="dp">
      <div className="dp-preview">PRACOVNÁ UKÁŽKA · ukážkové dopyty bez skutočných osôb · nič sa neukladá</div>
      <header className="dp-nav">
        <a href="/" aria-label="LIVE-IN úvod">
          <img src="/assets/logo-transparent.png" alt="LIVE-IN International" />
        </a>
        <nav aria-label="Menu ukážky">
          <a href="/projekty">Ukážky projektov</a>
        </nav>
      </header>
      <main id="obsah" className="dp-wrap dp-section">
        <div className="dp-kicker">Ukážka · prehľad dopytov</div>
        <h1 className="dp-pipe-h1">
          Kde je každý dopyt
          <span>a čo nám z neho patrí.</span>
        </h1>
        <p className="dp-intro">
          Takto by vyzeral prehľad pre LIVE-IN a pre developera. Dopyt sa eviduje jednorazovo, má jeden stav a developer vidí len dopyty, ktoré mu záujemca dovolil odovzdať.
        </p>
        <div className="dp-seg" role="group" aria-label="Pohľad">
          <button type="button" aria-pressed={view === "livein"} onClick={() => setView("livein")}>
            Pohľad LIVE-IN (všetky dopyty)
          </button>
          <button type="button" aria-pressed={view === "developer"} onClick={() => setView("developer")}>
            Pohľad developera (len odovzdané)
          </button>
        </div>

        <ul className="dp-funnel" aria-label="Počty dopytov podľa stavu">
          {STAGES.map(([id, name]) => (
            <li key={id}>
              <b>{visible.filter((l) => l.stage === id).length}</b>
              <span>{name}</span>
            </li>
          ))}
        </ul>

        <div className="dp-table" role="region" aria-label="Dopyty" tabIndex={0}>
          <table className="dp-pipe">
            <thead>
              <tr>
                <th scope="col">Záujemca</th>
                <th scope="col">Apartmán</th>
                <th scope="col">Zdroj</th>
                <th scope="col">Stav dopytu</th>
                {view === "livein" && <th scope="col">Provízia LIVE-IN</th>}
                {view === "livein" && <th scope="col">Správa po kúpe</th>}
                <th scope="col">Odovzdané developerovi</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((l) => (
                <tr key={l.id}>
                  <th scope="row">{l.who} <small className="dp-tag">ukážka</small></th>
                  <td>{l.unit}</td>
                  <td>{l.source}</td>
                  <td>
                    <select aria-label={`Stav dopytu ${l.who}`} value={l.stage} onChange={(e) => change(l.id, "stage", e.target.value, `${l.who} (${l.unit}) → stav`)}>
                      {STAGES.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </select>
                  </td>
                  {view === "livein" && (
                    <td>
                      <select aria-label={`Provízia ${l.who}`} value={l.commission} onChange={(e) => change(l.id, "commission", e.target.value, `${l.who} → provízia`)}>
                        {COMMISSION.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                      </select>
                    </td>
                  )}
                  {view === "livein" && (
                    <td>
                      {l.stage === "sold" ? (
                        <select aria-label={`Správa po kúpe ${l.who}`} value={l.management} onChange={(e) => change(l.id, "management", e.target.value, `${l.who} → správa`)}>
                          {MANAGEMENT.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                        </select>
                      ) : (
                        "—"
                      )}
                    </td>
                  )}
                  <td>{l.shared ? "Áno, so súhlasom" : "Nie (len prezentácia)"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {view === "developer" && <p className="dp-note">Developer vidí len dopyty, pri ktorých záujemca potvrdil odovzdanie, a nemení províziu LIVE-IN. Dopyt „Záujemca G“ si vyžiadal len prezentáciu, preto tu nie je.</p>}

        {view === "livein" && (
          <section className="dp-moreblock" aria-label="Provízia">
            <h3>Provízia LIVE-IN</h3>
            <p className="dp-note">
              Stavy provízie sa sledujú oddelene od stavu dopytu: očakávaná, nárok, fakturovaná, zaplatená. Sadzbu, základ (s DPH alebo bez) a moment vzniku nároku treba dohodnúť s developerom: <Fill>dohodnutá provízia na doplnenie</Fill>
            </p>
            <label className="dp-pick">
              Sadzba provízie na vyskúšanie (%)
              <input type="number" min="0" max="20" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="napr. 3" />
            </label>
            <ul className="dp-funnel">
              {COMMISSION.filter(([id]) => id !== "none").map(([id, name]) => (
                <li key={id}>
                  <b>{rateNum != null ? formatMoney(sums[id].amount) : sums[id].n}</b>
                  <span>{name}{rateNum != null ? ` · ${sums[id].n}×` : ""}</span>
                </li>
              ))}
            </ul>
            <p className="dp-note">Sadzba nie je dohodnutá. Zadané číslo slúži len na vyskúšanie výpočtu z historických cien jednotiek (provízia = cena jednotky × sadzba).</p>
          </section>
        )}

        {log.length > 0 && (
          <section className="dp-moreblock" aria-label="História zmien">
            <h3>História zmien (ukážka)</h3>
            <ul className="dp-cards">{log.map((x, i) => <li key={i}><span>{x}</span></li>)}</ul>
          </section>
        )}

        <section className="dp-moreblock" aria-label="Pravidlá">
          <h3>Pravidlá, ktoré platia pri ostrej prevádzke</h3>
          <ul className="dp-cards">
            <li><b>Jeden dopyt, jeden záznam</b><span>Rovnaký e-mail, projekt a apartmán nevytvoria druhý dopyt ani druhý e-mail, ani pri opakovanom odoslaní.</span></li>
            <li><b>Odovzdanie len so súhlasom</b><span>Developer dostane len dopyty, pri ktorých záujemca potvrdil odovzdanie. Prezentácia a marketing sú samostatné dôvody.</span></li>
            <li><b>Stav a provízia sú samostatné</b><span>Stav dopytu aktualizuje developer alebo LIVE-IN. Províziu vedie len LIVE-IN.</span></li>
            <li><b>Po kúpe príležitosť na správu</b><span>Predaný apartmán sa označí ako príležitosť na správu a sleduje sa ponuka a zmluva.</span></li>
          </ul>
        </section>
      </main>
      <footer className="dp-wrap dp-footer">
        <span>LIVE-IN International · ukážka prehľadu dopytov</span>
        <span>Ukážka na stretnutie · november 2026</span>
      </footer>
    </div>
  );
}
