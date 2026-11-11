# Developerské projekty – Lazaretská 15 a Arteria Living

Stav k 11. 11. 2026. Vetva `codex/developer-project-previews`. Všetko je pracovná ukážka na stretnutia, nie produkcia.

## Stránky
| Adresa | Čo to je | Komu sa dáva |
|---|---|---|
| `/projekty/lazaretska-15` | projektová stránka, 8 jednotiek s historickými cenami | Peter Valentín a jeho záujemcovia |
| `/projekty/arteria-living` | projektová stránka, modelová jednotka bez ceny | Lordship |
| `/projekty/prehlad-dopytov` | ukážka prehľadu dopytov, stavov a provízie (ukážkové dáta) | na stretnutí s developerom |
| `/projekty` | interný rozcestník | len LIVE-IN |

Projektové stránky na seba neodkazujú a nespomínajú sa navzájom. Rozcestník ani prehľad dopytov z nich nie sú dostupné. Všetky majú `noindex` do zverejnenia.

## Súbory
- `lib/developer-model.js` – čistý výpočet (prevádzka, financovanie, daň, sezónnosť, bod zvratu), formátovanie bez Intl.
- `lib/developer-projects.js` – údaje projektov, zdroje predpokladov, porovnanie s trhom.
- `components/DeveloperProject.js` a `components/developer/*` – stránka a jej časti.
- `tests/developer-projects.test.mjs` – 21 testov modelu a údajov.

## Kde sú pôvodné podklady (nájdené 11. 11. 2026)
- **Google Drive, zdieľaný disk LIVE-IN**: `Analyzy_a_prezentacie.md`, `03_partnerstva_a_investicne_podklady.md`, `08_prehlad_artefaktov.md`; priečinok `Lazaretska_15/index.html` s analýzou 8 apartmánov z 15. 9. 2026 (trh, ticket, právna forma, výnos, regulácia, riziká).
- **Claude artefakty**: „8 apartmánov Lazaretská“ (ID GtTWxXuQvt4nvnBr8FnrNZ), „Analýza trhu BA Staré Mesto“ (2G7bRLg3oyL4chhDyNcr4q), „Váš byt. Vyšší výnos.“ (LioVhvdGY1hkdRx8DUqZjQ).
- **Gmail Júliusa**: vlákno „Arteria living“ (24.–28. 4. 2026, návrh rental modelu a odmeny 15 %), „LIVE-IN inrentational“ (30. 4. 2026, referenčný apartmán Grösslingova, ročná sezónnosť), „Developerské projekty – Lazaretská 15 a Lordship | plán“ (10. 11. 2026) a „Ukážky projektových stránok“ (11. 11. 2026, HTML ukážka v knižnici ChatGPT).
- **Webová kalkulačka**: `content/sk.json` → `calc.script` (funkcia `calculate`).
- **Dôverné**: študijné podklady interiéru od Lordshipu (príloha „STUDIA INTERIERU“) sa nepoužili. Lordship požiadal, aby sa nešírili.

## Predpoklady kalkulačky
Vzorce ako vo webovej kalkulačke: 30-dňový mesiac, správa a DPH z Rental Income (tržby po portáloch), zaokrúhlenie na centy.

| Predpoklad | Hodnota | Zdroj |
|---|---|---|
| Cena za noc a obsadenosť | opatrný 71 € / 55 %, základný 75 € / 70 %, trhový medián 83 € / 72 % | PriceLabs 8. 11. 2026, referenčný apartmán 30. 4. 2026, kalkulačka |
| Dĺžka pobytu | 3,77 noci | kalkulačka, 1 126 rezervácií, snímka 12. 10. 2026 |
| Portály | 15 % | analýza z 15. 9. 2026 (webová kalkulačka predvolene 0 %) |
| Správa | Lazaretská 17 %, Arteria 15 % | bežná sadzba; návrh LIVE-IN pre Lordship z 27. 4. 2026 (nedohodnuté) |
| DPH | 5 % z Rental Income | podľa zadania v kalkulačke |
| Upratovanie | 32,5 € za pobyt, úhrada od hosťa 0 € | kalkulačka |
| Fixné náklady | 200 € mesačne | analýza z 15. 9. 2026 (2 400 €/rok) |
| Softvér | 50 € mesačne | kalkulačka (Guesty) |
| Zariadenie a vstupné náklady | 15 000 € | ilustračné, nahradiť ponukou |

Financovanie (úrok, splatnosť, podiel hypotéky) a daň z príjmu nemajú predvolenú hodnotu. Daň je zjednodušená: základ = prevádzkový výsledok mínus úroky z hypotéky.

## Otvorené body (rozhodnúť alebo doplniť)
1. **Portály 15 % verzus 0 % vo webovej kalkulačke.** Ak je cena za noc v portfóliu pred poplatkami, webová kalkulačka nadhodnocuje čistý výsledok o približne 15 % tržieb. Treba potvrdiť, aký základ majú PriceLabs a Guesty.
2. **Upratovanie.** Predvolene ho platí majiteľ. Ak hosť platí poplatok, výsledok je vyšší približne o 180 € mesačne.
3. **Správa 15 % pre Lordship** je návrh z apríla, nie dohoda.
4. Aktuálny cenník, dostupnosť, pôdorysy a vizualizácie od oboch developerov. Pre Lordship aj počet a typy jednotiek.
5. Ilustračná cena 150 000 € pre Arteria Living je len na predvedenie funkcie.
6. Text a odkaz na zásady spracúvania osobných údajov, príjemca dopytov u developera.
7. Zákon č. 133/2026 Z. z. o registri krátkodobého ubytovania a ďalšie právne údaje z analýzy treba pred zverejnením overiť.

## Evidencia dopytov (ďalšia fáza, nič z toho zatiaľ nebeží)
**Tok:** formulár → jeden záznam u LIVE-IN → HubSpot → úloha v Asane → (len so súhlasom) odovzdanie developerovi → stav dopytu → provízia → príležitosť na správu.

**Stav dopytu:** nový, kontaktovaný, obhliadka, rezervácia, predané, neúspešné.
**Provízia (samostatne):** očakávaná, nárok, fakturovaná, zaplatená. Sadzba, základ a moment vzniku nároku sa dohodnú s developerom.
**Správa po kúpe:** príležitosť, ponuka odoslaná, zmluva o správe.

**Samostatné dôvody a súhlasy:** prezentácia (e-mail a jeden následný e-mail po približne hodine), žiadosť o kontakt (telefón, súhlas s odovzdaním developerovi), marketing LIVE-IN (nepovinný, nezaškrtnutý). Otvorenie e-mailu alebo kliknutie nepotvrdzuje prečítanie PDF, preto sa to tak nesleduje ani netvrdí.

**Duplicity:** kľúč dopytu = e-mail (malé písmená) + projekt + apartmán, plus náhodný kľúč odoslania z prehliadača. Opakované odoslanie nevytvorí druhý dopyt ani e-mail. Formulár má pripraviť aj skrytú pascu pre roboty a obmedzenie počtu pokusov.

**Návrh tabuliek (neaplikované):**
```sql
create table dev_leads (
  id uuid primary key default gen_random_uuid(),
  project text not null, unit text,
  first_name text not null, last_name text not null, email text not null, phone text,
  wants_presentation boolean not null default false,
  wants_contact boolean not null default false,
  share_with_developer boolean not null default false,
  marketing_consent boolean not null default false,
  consent_text_version text not null,
  stage text not null default 'new',
  commission_status text not null default 'none',
  management_status text not null default 'none',
  hubspot_contact_id text, asana_task_gid text,
  idempotency_key text unique,
  created_at timestamptz not null default now()
);
create unique index dev_leads_dedupe on dev_leads (lower(email), project, coalesce(unit, ''));
create table dev_lead_events (id bigserial primary key, lead_id uuid references dev_leads, kind text, payload jsonb, created_at timestamptz default now());
create table dev_partners (id uuid primary key default gen_random_uuid(), project text not null, name text not null, notify_email text);
-- RLS: partner vidí len riadky svojho projektu, kde share_with_developer = true, a mení len stage.
```

**Potrebné na spustenie:** potvrdený príjemca dopytov, text súhlasov a zásad, dohoda o provízii, zápisové oprávnenia do HubSpotu a Asany (podľa e-mailu z 10. 11. 2026 čítanie kontaktov a obchodov v HubSpote funguje, zápis vyžaduje rozšírenie oprávnení).
