"use client";

import { useState } from "react";
import { formatMoney, formatNumber, deviationFromCurve, curvePerM2 } from "@/lib/developer-projects";
import { Fill } from "./ui";

const signed = (v) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${formatNumber(Math.abs(v), 1)} %`);

export default function Comparison({ project, unit }) {
  const [otherId, setOtherId] = useState("");
  // Predvolene porovnáme s prvým iným apartmánom, aby tabuľka nebola prázdna.
  const others = project.units.filter((u) => u.id !== unit.id);
  const other = others.find((u) => u.id === otherId) || others[0];
  const m = project.market;
  const perM2 = (u) => (u && u.area && u.price ? u.price / u.area : null);
  const dev = (u) => (m ? deviationFromCurve(u, m.curve) : null);
  const cell = (fn, u) => (u ? fn(u) : "—");

  // Tabuľka s trhom: ponuky z analýzy + vybraný apartmán, zoradené podľa ceny za m².
  const marketRows = m
    ? [
        ...m.rows.map((r) => ({ ...r, perM2: r.price / r.area, own: false })),
        ...(perM2(unit) ? [{ label: `${unit.id} · ${project.name}`, kind: "vybraný apartmán", area: unit.area, price: unit.price, perM2: perM2(unit), own: true }] : []),
      ].sort((a, b) => b.perM2 - a.perM2)
    : [];
  const maxPer = marketRows.length ? Math.max(...marketRows.map((r) => r.perM2)) : 1;
  const curveNow = m && unit.area ? curvePerM2(m.curve, unit.area) : null;

  return (
    <div>
      {project.units.length > 1 ? (
        <>
          <label className="dp-pick">
            Porovnať {unit.id} s jednotkou
            <select value={other ? other.id : ""} onChange={(e) => setOtherId(e.target.value)}>
              {others.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.id} · {u.layout} · {u.area ? `${formatNumber(u.area)} m²` : "—"}
                  </option>
              ))}
            </select>
          </label>
          <div className="dp-table" tabIndex={0} role="region" aria-label="Porovnanie dvoch apartmánov">
            <table>
              <thead>
                <tr>
                  <th scope="col">Parameter</th>
                  <th scope="col">{unit.id}</th>
                  <th scope="col">{other ? other.id : "—"}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Plocha</th>
                  <td>{unit.area ? `${formatNumber(unit.area)} m²` : "—"}</td>
                  <td>{cell((u) => (u.area ? `${formatNumber(u.area)} m²` : "—"), other)}</td>
                </tr>
                <tr>
                  <th scope="row">Historická cena ({project.asOf})</th>
                  <td>{unit.price ? formatMoney(unit.price) : "—"}</td>
                  <td>{cell((u) => (u.price ? formatMoney(u.price) : "—"), other)}</td>
                </tr>
                <tr>
                  <th scope="row">Cena za m²</th>
                  <td>{perM2(unit) ? formatMoney(perM2(unit)) : "—"}</td>
                  <td>{cell((u) => (perM2(u) ? formatMoney(perM2(u)) : "—"), other)}</td>
                </tr>
                {m && (
                  <tr>
                    <th scope="row">Voči trhovej krivke</th>
                    <td>{signed(dev(unit))}</td>
                    <td>{cell((u) => signed(dev(u)), other)}</td>
                  </tr>
                )}
                <tr>
                  <th scope="row">Dispozícia</th>
                  <td>{unit.layout}</td>
                  <td>{cell((u) => u.layout, other)}</td>
                </tr>
                <tr>
                  <th scope="row">Podlažie</th>
                  <td>{unit.floor}</td>
                  <td>{cell((u) => u.floor, other)}</td>
                </tr>
                <tr>
                  <th scope="row">Orientácia</th>
                  <td>{unit.orientation}</td>
                  <td>{cell((u) => u.orientation, other)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="dp-note">
          Tabuľku jednotiek doplníme podľa aktuálneho cenníka a pôdorysov: <Fill>čaká na cenník od developera</Fill>
        </p>
      )}

      {m ? (
        <div className="dp-market">
          <h3>Cena za m² voči porovnateľným ponukám v Starom Meste</h3>
          <p className="dp-note">
            Stav: {m.asOf}. Trhová krivka ({m.curve.n} porovnateľných ponúk 18–46 m²): cena za m² = {formatMoney(m.curve.a)} − {formatMoney(m.curve.b)} × výmera.
            {curveNow ? ` Pre ${formatNumber(unit.area)} m² vychádza ${formatMoney(curveNow)} za m².` : ""}
            {perM2(unit) ? ` ${unit.id} je ${signed(dev(unit))} voči krivke (${formatMoney(perM2(unit))} za m²).` : ""}
          </p>
          <div className="dp-table" tabIndex={0} role="region" aria-label="Porovnanie ceny za m² s trhom">
            <table className="dp-mkt">
              <thead>
                <tr>
                  <th scope="col">Ponuka</th>
                  <th scope="col">Typ</th>
                  <th scope="col">m²</th>
                  <th scope="col">Cena</th>
                  <th scope="col">Cena za m²</th>
                </tr>
              </thead>
              <tbody>
                {marketRows.map((r) => (
                  <tr key={r.label} className={r.own ? "own" : ""}>
                    <th scope="row">{r.label}</th>
                    <td>{r.kind}</td>
                    <td>{formatNumber(r.area)}</td>
                    <td>{formatMoney(r.price)}</td>
                    <td>
                      <span className="dp-mbar" aria-hidden="true">
                        <i style={{ width: `${(r.perM2 / maxPer) * 100}%` }} />
                      </span>
                      <b>{formatMoney(r.perM2)}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="dp-note">{m.note}</p>
        </div>
      ) : (
        <p className="dp-note">
          Porovnanie s cenníkom a okolitými projektmi doplníme po dodaní cenníka a overení výmer, štandardu a dátumu ponuky: <Fill>na doplnenie</Fill>
        </p>
      )}
    </div>
  );
}
