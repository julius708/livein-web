"use client";

import { useEffect, useRef, useState } from "react";
import { Fill } from "./ui";

// Verzia textov súhlasov. Pri ostrej prevádzke sa uloží spolu s dopytom, aby bolo vidieť, čo záujemca potvrdil.
export const CONSENT_VERSION = "2026-11-demo";
const emailOk = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
const phoneOk = (s) => (s.match(/\d/g) || []).length >= 8 && /^[+()\d\s/-]+$/.test(s);
const newKey = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `k-${Date.now()}-${Math.random().toString(36).slice(2)}`);

export default function InterestForm({ project, projectId, unit, seed }) {
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", phone: "", unitId: unit.id, presentation: true, contact: false, share: false, marketing: false });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null);
  const key = useRef(null);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  // Výber apartmánu a tlačidlá „Mám záujem“ predvyplnia formulár.
  useEffect(() => { setF((x) => ({ ...x, unitId: unit.id })); setSent(null); }, [unit.id]);
  useEffect(() => {
    if (!seed) return;
    setF((x) => (seed.purpose === "contact" ? { ...x, contact: true } : { ...x, presentation: true }));
    setSent(null);
  }, [seed]);

  function validate() {
    const e = {};
    if (!f.firstName.trim()) e.firstName = "Zadajte meno.";
    if (!f.lastName.trim()) e.lastName = "Zadajte priezvisko.";
    if (!emailOk(f.email.trim())) e.email = "Zadajte e-mail v tvare meno@domena.sk.";
    if (!f.presentation && !f.contact) e.purpose = "Vyberte aspoň jeden dôvod: prezentáciu alebo kontakt.";
    if (f.contact && !phoneOk(f.phone.trim())) e.phone = "Pre kontakt je potrebný telefón (aspoň 8 číslic, napr. +421 900 000 000).";
    if (f.contact && !f.share) e.share = `Pre kontakt potvrďte odovzdanie dopytu developerovi (${project.partner}).`;
    return e;
  }

  function submit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => document.getElementById("dp-form-errors")?.focus());
      return;
    }
    if (!key.current) key.current = newKey(); // opakované odoslanie toho istého dopytu = ten istý kľúč
    setSent({
      idempotencyKey: key.current,
      project: projectId,
      unit: f.unitId,
      contact: { firstName: f.firstName.trim(), lastName: f.lastName.trim(), email: f.email.trim().toLowerCase(), phone: f.contact ? f.phone.trim() : f.phone.trim() || null },
      purposes: { presentation: f.presentation, contactRequest: f.contact },
      consents: { shareWithDeveloper: f.contact && f.share, marketing: f.marketing, textVersion: CONSENT_VERSION },
    });
  }

  const err = (k) => errors[k];
  const errCount = Object.keys(errors).length;

  return (
    <form onSubmit={submit} noValidate>
      <span className="dp-pill">Demo formulár · údaje sa neodosielajú</span>
      <p className="dp-note">Na predvedenie použite skúšobné údaje. Nič sa neukladá ani neposiela.</p>
      {errCount > 0 && (
        <div role="alert" id="dp-form-errors" tabIndex={-1} className="dp-errbox">
          <strong>Opravte, prosím:</strong>
          <ul>{Object.values(errors).map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      )}
      <div className="dp-inputs">
        <div className="dp-field">
          <label htmlFor="dp-fn">Meno</label>
          <input id="dp-fn" name="firstName" autoComplete="given-name" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} aria-invalid={Boolean(err("firstName"))} />
        </div>
        <div className="dp-field">
          <label htmlFor="dp-ln">Priezvisko</label>
          <input id="dp-ln" name="lastName" autoComplete="family-name" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} aria-invalid={Boolean(err("lastName"))} />
        </div>
      </div>
      <div className="dp-field">
        <label htmlFor="dp-em">E-mail</label>
        <input id="dp-em" name="email" type="email" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} aria-invalid={Boolean(err("email"))} />
      </div>
      <div className="dp-field">
        <label htmlFor="dp-ph">Telefón{f.contact ? " (potrebný pre kontakt)" : " (nepovinný)"}</label>
        <input id="dp-ph" name="phone" type="tel" autoComplete="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={Boolean(err("phone"))} />
      </div>
      <div className="dp-field">
        <label htmlFor="dp-unit">Apartmán, o ktorý máte záujem</label>
        <select id="dp-unit" name="unit" value={f.unitId} onChange={(e) => set("unitId", e.target.value)}>
          {project.units.map((u) => <option key={u.id} value={u.id}>{u.id}</option>)}
          <option value="">Zatiaľ neviem, chcem prezentáciu projektu</option>
        </select>
      </div>

      <fieldset className="dp-purposes">
        <legend>Čo si prajete? Každý dôvod je samostatný.</legend>
        <label className="dp-checkbox">
          <input type="checkbox" checked={f.presentation} onChange={(e) => set("presentation", e.target.checked)} />
          <span>
            <b>Pošlite mi prezentáciu projektu.</b> Použijeme e-mail len na zaslanie prezentácie a na jeden krátky následný e-mail približne o hodinu, v ktorom môžete položiť otázky alebo požiadať o kontakt. Nejde o marketing.
          </span>
        </label>
        <label className="dp-checkbox">
          <input type="checkbox" checked={f.contact} onChange={(e) => set("contact", e.target.checked)} />
          <span>
            <b>Chcem, aby ma kontaktovali.</b> Dohodneme obhliadku alebo rezerváciu. Potrebujeme telefón.
          </span>
        </label>
        {f.contact && (
          <label className="dp-checkbox dp-sub">
            <input type="checkbox" checked={f.share} onChange={(e) => set("share", e.target.checked)} aria-invalid={Boolean(err("share"))} />
            <span>
              Súhlasím, aby LIVE-IN odovzdala môj dopyt (meno, priezvisko, e-mail, telefón a zvolený apartmán) developerovi {project.partner} na účely obhliadky, rezervácie a predaja. <Fill>príjemca dopytov na potvrdenie</Fill>
            </span>
          </label>
        )}
        <label className="dp-checkbox">
          <input type="checkbox" checked={f.marketing} onChange={(e) => set("marketing", e.target.checked)} />
          <span>
            Nepovinné: chcem dostávať novinky o investičných apartmánoch od LIVE-IN. Súhlas môžem kedykoľvek odvolať. Bez zaškrtnutia žiadny marketing nepošleme.
          </span>
        </label>
      </fieldset>
      <p className="dp-note">
        Spracúvanie osobných údajov: <Fill>text a odkaz na zásady na doplnenie</Fill>
      </p>
      <button className="dp-button" type="submit">
        Predviesť registráciu záujmu <span aria-hidden="true">↗</span>
      </button>
      {sent && (
        <div role="status" className="dp-confirm">
          <strong>Ukážka dopytu je pripravená. Nič sa neodoslalo.</strong>
          <p>
            {project.name} · {sent.unit || "bez konkrétneho apartmánu"} · nový záujemca
          </p>
          <ol className="dp-flow">
            <li><b>Uložené u LIVE-IN</b> – kontakt a dopyt v HubSpote, jeden záznam aj pri opakovanom odoslaní.</li>
            <li><b>Pracovná úloha v Asane</b> – tím LIVE-IN vie, kto a kedy má záujemcu osloviť.</li>
            {sent.purposes.presentation && <li><b>Prezentácia e-mailom</b> a približne o hodinu krátky následný e-mail s možnosťou otázok alebo kontaktu.</li>}
            {sent.purposes.contactRequest && <li><b>Odovzdanie developerovi</b> {project.partner} len s vaším súhlasom. Developer rieši obhliadku, rezerváciu a predaj.</li>}
            <li><b>Stav dopytu</b> sa sleduje: kontaktovaný, obhliadka, rezervácia, predané alebo neúspešné.</li>
          </ol>
          <details>
            <summary>Čo by sa pri ostrej prevádzke uložilo (ukážka)</summary>
            <pre className="dp-pre">{JSON.stringify(sent, null, 2)}</pre>
          </details>
        </div>
      )}
    </form>
  );
}
