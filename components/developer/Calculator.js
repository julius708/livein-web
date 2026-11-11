"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FIELDS,
  OPTIONAL_FIELDS,
  SOURCES,
  readValues,
  investmentResult,
  sensitivity,
  formatMoney,
  formatNumber,
  formatPercent,
} from "@/lib/developer-projects";
import { Fill } from "./ui";

const HINTS = {
  adr: "Priemer, ktorý hosť skutočne zaplatí za noc počas celého roka (letné aj zimné ceny spolu), nie cenníková cena v sezóne.",
  occupancy: "Podiel ponúkaných nocí, ktoré sú obsadené. Nie je to garancia.",
  own: "Znižujú počet nocí ponúkaných na prenájom.",
  stay: "Určuje počet upratovaní: rezervácie = obsadené noci ÷ dĺžka pobytu.",
  portal: "Odpočítame od tržieb. Správa a DPH sa počítajú z Rental Income po odpočítaní poplatkov.",
  cleanPaid: "Zadajte len vtedy, ak poplatok od hosťa nie je už v cene za noc. Inak by sa započítal dvakrát.",
  fixed: "Energie, internet, poistenie, fond opráv, daň z nehnuteľnosti a rezerva na opravy.",
  furnishing: "Ilustračný predpoklad. Nahradí ho ponuka podľa štandardu vybavenia.",
  ltv: "Banky financujú nebytové priestory zvyčajne nižším podielom než byty (60–80 %, podľa analýzy z 15. 9. 2026; treba overiť v banke).",
  rate: "Nie je predvyplnené. Doplňte podľa ponuky banky.",
  years: "Nie je predvyplnené. Doplňte podľa ponuky banky.",
  taxRate: "Nie je predvyplnené, závisí od právnej formy a situácie kupujúceho. Doplňte podľa daňového poradcu.",
};
const GROUPS = [
  ["base", "Cena a obsadenosť", true],
  ["costs", "Poplatky a prevádzkové náklady", true],
];

function startRaw(project, unit) {
  const c = project.calc;
  const s = c.scenarios.find((x) => x.id === "base") || c.scenarios[0];
  return {
    price: unit.price ?? "",
    furnishing: c.furnishing,
    adr: s.adr,
    occupancy: s.occupancy,
    own: c.own,
    stay: c.stay,
    portal: c.portal,
    management: c.management,
    vat: c.vat,
    clean: c.clean,
    cleanPaid: c.cleanPaid,
    fixed: c.fixed,
    software: c.software,
    ltv: "",
    rate: "",
    years: "",
    taxRate: "",
  };
}

function Field({ f, raw, set, error, withRange }) {
  const id = `dp-f-${f.key}`;
  const invalid = Boolean(error);
  const val = raw[f.key];
  return (
    <div className="dp-field">
      <label htmlFor={id}>
        {f.label} ({f.unit})
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={f.min}
        max={f.max}
        step={f.step}
        value={val}
        aria-invalid={invalid}
        aria-describedby={`${id}-d`}
        onChange={(e) => set(f.key, e.target.value)}
      />
      {withRange && (
        <input
          type="range"
          aria-label={`${f.label}, posuvník`}
          min={f.slider ? f.slider[0] : f.min}
          max={f.slider ? f.slider[1] : f.max}
          step={f.step}
          value={val === "" || !Number.isFinite(Number(val)) ? (f.slider ? f.slider[0] : f.min) : Math.min(Math.max(Number(val), f.slider ? f.slider[0] : f.min), f.slider ? f.slider[1] : f.max)}
          onChange={(e) => set(f.key, e.target.value)}
          className="dp-range"
        />
      )}
      <small id={`${id}-d`} className={invalid ? "dp-err" : ""}>
        {invalid ? error.msg : HINTS[f.key] || ""}
      </small>
    </div>
  );
}

export default function Calculator({ project, unit, onInterest }) {
  const c = project.calc;
  const [raw, setRaw] = useState(() => startRaw(project, unit));
  const [scenarioId, setScenarioId] = useState("base");
  const [season, setSeason] = useState("flat");
  const [illustrative, setIllustrative] = useState(false);

  // Zmena jednotky prenesie jej cenu do kalkulačky, ostatné úpravy ostanú.
  useEffect(() => {
    setRaw((r) => ({ ...r, price: unit.price ?? "" }));
    setIllustrative(false);
  }, [unit.id, unit.price]);

  const set = (key, value) => {
    setRaw((r) => ({ ...r, [key]: value }));
    if (key === "adr" || key === "occupancy") setScenarioId("custom");
    if (key === "price") setIllustrative(false);
  };
  const applyScenario = (s) => {
    setScenarioId(s.id);
    setRaw((r) => ({ ...r, adr: s.adr, occupancy: s.occupancy }));
  };
  const reset = () => {
    setRaw(startRaw(project, unit));
    setScenarioId("base");
    setSeason("flat");
    setIllustrative(false);
  };

  const parsed = useMemo(() => readValues(raw), [raw]);
  const result = useMemo(() => (parsed.ok ? investmentResult(parsed.values, { season }) : null), [parsed, season]);
  const grid = useMemo(() => (parsed.ok ? sensitivity(parsed.values) : null), [parsed]);
  const errorOf = (key) => parsed.errors.find((e) => e.key === key);
  const scenario = c.scenarios.find((s) => s.id === scenarioId);
  const noPrice = raw.price === "";
  const fin = result?.financing;
  const maxBar = result ? Math.max(1, ...result.months.map((m) => Math.abs(m.value))) : 1;

  const rows = [
    ["Kúpna cena", unit.price ? `${formatMoney(unit.price)} (jednotka ${unit.id})` : illustrative ? `${formatMoney(c.illustrativePrice)} (ilustračná)` : "nezadaná", unit.price ? "historické" : "doplniť", unit.price ? `Historická cena k ${project.asOf}, treba potvrdiť u developera.` : "Cena jednotky zatiaľ nie je známa. Zadajte ju alebo použite ilustračnú cenu na predvedenie."],
    ["Zariadenie a vstupné náklady", formatMoney(Number(raw.furnishing)), "ilustračné", "Ilustračný predpoklad LIVE-IN, nie ponuka. Nahradí ho rozpočet podľa štandardu vybavenia."],
    ["Cena za noc a obsadenosť", `${formatMoney(Number(raw.adr))} · ${formatNumber(Number(raw.occupancy), 1)} %`, scenario ? "zdroj" : "vlastné", scenario ? scenario.source : "Vlastná hodnota zadaná používateľom."],
    ["Dĺžka pobytu", `${formatNumber(Number(raw.stay))} noci`, "zdroj", SOURCES.stay],
    ["Poplatky portálov", `${formatNumber(Number(raw.portal), 1)} %`, "predpoklad", "Predpoklad analýzy LIVE-IN z 15. 9. 2026 (provízia platforiem 15 %). Webová kalkulačka LIVE-IN predvolene počíta 0 %, lebo v nej sa zadáva cena už po odpočítaní poplatkov."],
    ["Správa LIVE-IN", `${formatNumber(Number(raw.management), 1)} % z Rental Income`, "predpoklad", c.managementSource],
    ["DPH v modeli", `${formatNumber(Number(raw.vat), 1)} % z Rental Income`, "predpoklad", "Podľa zadania vo webovej kalkulačke LIVE-IN. Pre konkrétneho investora treba overiť s účtovníkom."],
    ["Upratovanie", `${formatNumber(Number(raw.clean))} € za pobyt, úhrada od hosťa ${formatNumber(Number(raw.cleanPaid))} €`, "zdroj", "Webová kalkulačka LIVE-IN: menší byt 30–35 €. Úhrada od hosťa je predvolene 0 €."],
    ["Energie, fond opráv a ďalšie", `${formatMoney(Number(raw.fixed))} mesačne`, "zdroj", SOURCES.analysis],
    ["Softvér", `${formatMoney(Number(raw.software))} mesačne`, "zdroj", "Guesty 50 € mesačne (webová kalkulačka LIVE-IN)."],
    ["Modelový rok", "12 × 30 dní = 360 nocí", "predpoklad", "Rovnako ako webová kalkulačka LIVE-IN. Skutočný rok má 365 dní, preto je model mierne opatrný."],
    ["Rozloženie roka", season === "profile" ? "podľa profilu LIVE-IN" : "rovnomerne", "predpoklad", season === "profile" ? "Mesačné výsledky referenčného apartmánu LIVE-IN na Grösslingovej (projekcia z 30. 4. 2026, spolu 13 525 €). Mení len rozloženie, ročný súčet ostáva." : "Každý mesiac rovnako."],
  ];

  return (
    <div className="dp-calculator">
      <div className="dp-calc-main">
        <div className="dp-sumbar" aria-live="polite" aria-atomic="true">
          <span>Prevádzkový výsledok mesačne</span>
          <strong>{result ? formatMoney(result.monthly) : "Doplňte vstupy"}</strong>
          <small>{result ? `${formatMoney(result.annual)} ročne · ${formatPercent(result.yield, 2)} z investície` : "Zadajte platné hodnoty"}</small>
        </div>
        <h3>Scenár pre {unit.id}</h3>
        <div className="dp-scen" role="group" aria-label="Scenár ceny a obsadenosti">
          {c.scenarios.map((s) => (
            <button type="button" key={s.id} aria-pressed={scenarioId === s.id} onClick={() => applyScenario(s)}>
              {s.label}
              <small>
                {formatMoney(s.adr)} · {s.occupancy} %
              </small>
            </button>
          ))}
        </div>
        <p className="dp-note dp-source">
          <b>{scenario ? `${scenario.label}: ` : "Vlastné hodnoty: "}</b>
          {scenario ? scenario.source : "Cena za noc alebo obsadenosť sú upravené. Zdroj uvádzame len pri predvolených scenároch."}
        </p>
        {noPrice && c.illustrativePrice && (
          <div className="dp-illus">
            <Fill>Cena jednotky na doplnenie</Fill>
            <button
              type="button"
              className="dp-secondary"
              onClick={() => {
                setRaw((r) => ({ ...r, price: c.illustrativePrice }));
                setIllustrative(true);
              }}
            >
              Vyskúšať s ilustračnou cenou {formatMoney(c.illustrativePrice)}
            </button>
          </div>
        )}
        {illustrative && <p className="dp-note dp-warn">Ilustračná cena na predvedenie funkcie, nie ponuka ani cenník.</p>}
        {GROUPS.map(([g, title, open]) => (
          <details className="dp-group" key={g} open={open}>
            <summary>{title}</summary>
            <div className="dp-inputs">
              {FIELDS.filter((f) => f.group === g).map((f) => (
                <Field key={f.key} f={f} raw={raw} set={set} error={errorOf(f.key)} withRange={f.key === "adr" || f.key === "occupancy"} />
              ))}
            </div>
          </details>
        ))}
        <details className="dp-group">
          <summary>Financovanie a daň z príjmu (nepovinné)</summary>
          <p className="dp-note">
            Prázdne polia sa nepočítajú. Daň je zjednodušená: základ = prevádzkový výsledok mínus úroky z hypotéky. Odpisy, odpočty a právnu formu kupujúceho nezohľadňujeme. Nejde o daňové ani investičné poradenstvo.
          </p>
          <div className="dp-inputs">
            {OPTIONAL_FIELDS.map((f) => (
              <Field key={f.key} f={f} raw={raw} set={set} error={errorOf(f.key)} />
            ))}
          </div>
        </details>
        <div className="dp-actions">
          <button type="button" className="dp-secondary dp-linkbtn" onClick={reset}>
            Obnoviť východiskové hodnoty
          </button>
        </div>
        {!parsed.ok && (
          <div role="alert" className="dp-errbox">
            <strong>Opravte vstupy:</strong>
            <ul>
              {parsed.errors.map((e) => (
                <li key={e.key}>
                  <a href={`#dp-f-${e.key}`}>{e.label}</a>: {e.msg}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <aside className="dp-result" aria-label="Výsledok scenára">
        <div className="dp-kicker">Orientačný scenár{scenario ? ` · ${scenario.label}` : ""}</div>
        <p>1 · Prevádzkový výsledok mesačne</p>
        <strong>{result ? formatMoney(result.monthly) : "Doplňte vstupy"}</strong>
        <p>{result ? `${formatMoney(result.annual)} ročne · pred financovaním a daňou z príjmu` : "Zadajte platnú cenu a predpoklady."}</p>
        {result && (
          <>
            <dl>
              <div>
                <dt>Celková investícia</dt>
                <dd>{formatMoney(result.investment)}</dd>
              </div>
              <div>
                <dt>Prevádzkový výnos z investície</dt>
                <dd>{formatPercent(result.yield, 2)}</dd>
              </div>
              <div>
                <dt>Bod zvratu obsadenosti</dt>
                <dd>{result.breakEven == null ? "nedosiahnuteľný" : formatPercent(result.breakEven, 0)}</dd>
              </div>
            </dl>
            <details className="dp-breakdown">
              <summary>Rozpis mesiaca</summary>
              <dl>
                <div>
                  <dt>Obsadené noci / mesiac</dt>
                  <dd>{formatNumber(result.nights, 1)}</dd>
                </div>
                <div>
                  <dt>Tržby z nocí</dt>
                  <dd>{formatMoney(result.gross)}</dd>
                </div>
                <div>
                  <dt>Portály</dt>
                  <dd>{`− ${formatMoney(result.portal)}`}</dd>
                </div>
                <div>
                  <dt>Rental Income</dt>
                  <dd>{formatMoney(result.income)}</dd>
                </div>
                <div>
                  <dt>Správa LIVE-IN</dt>
                  <dd>{`− ${formatMoney(result.management)}`}</dd>
                </div>
                <div>
                  <dt>DPH v modeli</dt>
                  <dd>{`− ${formatMoney(result.vat)}`}</dd>
                </div>
                <div>
                  <dt>Upratovanie (po úhrade hosťom)</dt>
                  <dd>{`− ${formatMoney(result.cleaning)}`}</dd>
                </div>
                <div>
                  <dt>Energie, fond opráv a softvér</dt>
                  <dd>{`− ${formatMoney(Number(raw.fixed) + Number(raw.software))}`}</dd>
                </div>
              </dl>
            </details>
            {fin && (
              <div className="dp-layer">
                <p>2 · Po financovaní (pred daňou)</p>
                {fin.incomplete ? (
                  <small>Doplňte úrok a splatnosť hypotéky.</small>
                ) : (
                  <>
                    <b>{formatMoney(fin.afterFinancing)} ročne</b>
                    <dl>
                      <div>
                        <dt>Hypotéka · vlastné zdroje</dt>
                        <dd>{`${formatMoney(fin.loan)} · ${formatMoney(fin.equity)}`}</dd>
                      </div>
                      <div>
                        <dt>Mesačná splátka · ročne</dt>
                        <dd>{`${formatMoney(fin.payment)} · ${formatMoney(fin.annualDebt)}`}</dd>
                      </div>
                      <div>
                        <dt>Z toho úroky v 1. roku</dt>
                        <dd>{formatMoney(fin.interestYear1)}</dd>
                      </div>
                      <div>
                        <dt>Výnos z vlastných zdrojov</dt>
                        <dd>{formatPercent(fin.cashOnCash, 2)}</dd>
                      </div>
                    </dl>
                  </>
                )}
              </div>
            )}
            {result.tax && (
              <div className="dp-layer">
                <p>{fin ? "3" : "2"} · Po dani z príjmu (zjednodušene)</p>
                <b>{formatMoney(result.tax.afterTax)} ročne</b>
                <dl>
                  <div>
                    <dt>Základ dane · daň {formatNumber(result.tax.rate, 1)} %</dt>
                    <dd>{`${formatMoney(result.tax.base)} · ${formatMoney(result.tax.tax)}`}</dd>
                  </div>
                </dl>
              </div>
            )}
          </>
        )}
        <a href="#zaujem" className="dp-button" onClick={() => onInterest("contact")}>
          Chcem individuálne posúdenie <span aria-hidden="true">↗</span>
        </a>
        <small>Výsledok je scenár podľa zadaných hodnôt, nie prísľub výnosu.</small>
      </aside>

      {result && (
        <section className="dp-calc-more" aria-label="Rozloženie roka, citlivosť a predpoklady">
          <div className="dp-moreblock">
            <div className="dp-morehead">
              <h4>Rozloženie ročného výsledku po mesiacoch</h4>
              <div className="dp-seg" role="group" aria-label="Rozloženie roka">
                <button type="button" aria-pressed={season === "flat"} onClick={() => setSeason("flat")}>
                  Rovnomerne
                </button>
                <button type="button" aria-pressed={season === "profile"} onClick={() => setSeason("profile")}>
                  Profil LIVE-IN
                </button>
              </div>
            </div>
            <ol className="dp-bars">
              {result.months.map((m) => (
                <li key={m.label} title={`${m.label}: ${formatMoney(m.value)}`}>
                  <span className="dp-barval">{formatNumber(m.value / 1000, 1)}</span>
                  <span className={`dp-bar${m.value < 0 ? " neg" : ""}`} style={{ height: `${Math.max(4, Math.round((Math.abs(m.value) / maxBar) * 120))}px` }} />
                  <small>{m.label}</small>
                  <span className="dp-sr">{formatMoney(m.value)}</span>
                </li>
              ))}
            </ol>
            <p className="dp-note">
              Hodnoty v tisícoch €. Profil vychádza z mesačných výsledkov referenčného apartmánu LIVE-IN na Grösslingovej (projekcia z 30. 4. 2026). Mení len rozloženie, nie ročný súčet.
            </p>
          </div>
          <details className="dp-moreblock">
            <summary>Citlivosť: prevádzkový výnos z investície podľa ceny za noc a obsadenosti</summary>
            <div className="dp-table">
              <table>
                <caption className="dp-sr">Ročný prevádzkový výnos z investície v %</caption>
                <thead>
                  <tr>
                    <th scope="col">Cena za noc ↓ · obsadenosť →</th>
                    {grid[0].cells.map((x) => (
                      <th scope="col" key={x.occupancy}>{x.occupancy} %</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grid.map((row) => (
                    <tr key={row.adr}>
                      <th scope="row">{formatMoney(row.adr)}</th>
                      {row.cells.map((x) => (
                        <td key={x.occupancy}>{formatPercent(x.yield, 1)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="dp-note">Ostatné predpoklady ostávajú podľa aktuálneho scenára. Pred financovaním a daňou z príjmu.</p>
          </details>
          <details className="dp-moreblock" open>
            <summary>Predpoklady a zdroje tohto scenára</summary>
            <div className="dp-table">
              <table className="dp-assume">
                <thead>
                  <tr>
                    <th scope="col">Predpoklad</th>
                    <th scope="col">Hodnota</th>
                    <th scope="col">Stav</th>
                    <th scope="col">Zdroj a poznámka</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([label, value, status, source]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      <td>{value}</td>
                      <td>
                        <span className={`dp-tag ${status === "ilustračné" || status === "doplniť" ? "warn" : status === "zdroj" ? "ok" : ""}`}>{status}</span>
                      </td>
                      <td>{source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="dp-note">
              Model rozlišuje prevádzkový výsledok, financovanie a daň z príjmu. Správa a DPH sa počítajú z Rental Income (tržby po odpočítaní poplatkov portálov), sumy sa zaokrúhľujú na centy rovnako ako vo webovej kalkulačke LIVE-IN. Pri dani a financovaní ide o zjednodušený odhad, nie poradenstvo.
            </p>
          </details>
        </section>
      )}
    </div>
  );
}
