"use client";

import { useRef } from "react";
import { formatMoney, formatNumber } from "@/lib/developer-projects";
import { Fill } from "./ui";

export default function UnitSelector({ project, unit, onSelect, onInterest }) {
  const detail = useRef(null);
  const perM2 = unit.area && unit.price ? unit.price / unit.area : null;

  function pick(u) {
    onSelect(u);
    // Na mobile je detail pod zoznamom: po výbere ho posunieme do zorného poľa.
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 800px)").matches) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() => detail.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
    }
  }

  return (
    <div className="dp-selector">
      <div className="dp-unitlist" role="group" aria-label="Výber apartmánu">
        {project.units.map((u) => (
          <button
            type="button"
            key={u.id}
            onClick={() => pick(u)}
            aria-pressed={unit.id === u.id}
            aria-controls="unit-detail"
            className={unit.id === u.id ? "selected" : ""}
          >
            <span>
              <strong>{u.id}</strong>
              <small>
                {u.layout} · {u.area ? `${formatNumber(u.area)} m²` : "výmera na doplnenie"}
              </small>
            </span>
            <b>
              {u.price ? formatMoney(u.price) : "Cena na doplnenie"}
              <small>{u.floor}</small>
            </b>
          </button>
        ))}
      </div>
      <article className="dp-unitdetail" id="unit-detail" ref={detail}>
        <p className="dp-sr" aria-live="polite">
          Vybraný apartmán {unit.id}
        </p>
        <div className="dp-detailhead">
          <h3>{unit.id}</h3>
          <span className="dp-pill">{unit.price ? `Historická cena k ${project.asOf}` : "Modelový výber"}</span>
        </div>
        <div className="dp-plan">
          <span aria-hidden="true">▤</span>
          <strong>
            <Fill>Pôdorys na doplnenie</Fill>
          </strong>
          <p>Tu sa zobrazí skutočný pôdorys vybranej jednotky, keď ho dodá developer.</p>
        </div>
        <dl className="dp-specs">
          <div>
            <dt>Úžitková plocha</dt>
            <dd>{unit.area ? `${formatNumber(unit.area)} m²` : <Fill>na doplnenie</Fill>}</dd>
          </div>
          <div>
            <dt>Dispozícia</dt>
            <dd>{unit.layout === "Na doplnenie" ? <Fill>na doplnenie</Fill> : unit.layout}</dd>
          </div>
          <div>
            <dt>Podlažie</dt>
            <dd>{unit.floor === "Na doplnenie" ? <Fill>na doplnenie</Fill> : unit.floor}</dd>
          </div>
          <div>
            <dt>Orientácia</dt>
            <dd>{unit.orientation === "Na doplnenie" ? <Fill>na doplnenie</Fill> : unit.orientation}</dd>
          </div>
          <div>
            <dt>Cena</dt>
            <dd>{unit.price ? formatMoney(unit.price) : <Fill>na doplnenie</Fill>}</dd>
          </div>
          <div>
            <dt>Cena za m²</dt>
            <dd>{perM2 ? formatMoney(perM2) : "—"}</dd>
          </div>
          <div>
            <dt>Dostupnosť</dt>
            <dd>
              <Fill>na potvrdenie</Fill>
            </dd>
          </div>
        </dl>
        <p className="dp-note">
          {unit.price
            ? `Cena je historická (${project.asOf}). Dostupnosť, konečná cena, DPH a štandard sa potvrdia podľa aktuálnej ponuky developera.`
            : "Cenník, výmery a pôdorysy dodá developer. Do tej doby slúži jednotka na predvedenie kalkulačky."}
        </p>
        <a href="#vynos" className="dp-button">
          Prepočítať {unit.id} <span aria-hidden="true">↗</span>
        </a>
        <a href="#zaujem" className="dp-secondary dp-block" onClick={() => onInterest("contact")}>
          Mám záujem o {unit.id}
        </a>
      </article>
    </div>
  );
}
