# portfolio-count – živý počet apartmánov pre web

Supabase Edge Function v projekte **LIVE-IN Core** (`lumshjqwpffhtcejzaac`).
Verejná adresa: `https://lumshjqwpffhtcejzaac.supabase.co/functions/v1/portfolio-count`
(bez JWT; funkcia nevracia nič iné než agregát, databázový kľúč ostáva len na serveri).

Odpoveď:

```json
{ "count": 137, "baseline": 69, "baseline_year": 2026, "filter": "active", "updated_at": "2026-11-04T20:30:00.000Z" }
```

## Konfigurácia (Supabase → Edge Functions → portfolio-count → Secrets)

| Premenná | Predvolené | Význam |
|---|---|---|
| `PORTFOLIO_FILTER` | `active` | `active` = `count(*) where active = true` (137), `active_in_scope` = aj `in_scope = true` (105), `in_scope` |
| `BASELINE_YEAR` | `2026` | východiskový rok |
| `BASELINE_COUNT` | `69` | počet apartmánov na začiatku východiskového roka (potvrdí majiteľ) |
| `ALLOWED_ORIGINS` | `https://live-in.international,https://www.live-in.international` | CORS |
| `ALLOWED_ORIGIN_SUFFIX` | `-pracovna-app.vercel.app` | náhľady Vercel; prázdne = vypnuté |
| `CACHE_SECONDS` | `3600` | cache odpovede (v pamäti funkcie aj `Cache-Control`) |

Rate limit: 60 požiadaviek za minútu na IP (429).

## Prelom roka

Po 1. januári nastav `BASELINE_YEAR` na nový rok a `BASELINE_COUNT` na stav k 1. januáru.
Web potom ukazuje „69 → N apartmánov od januára <rok>“ s novými hodnotami; kód sa nemení.

## Voliteľné (zatiaľ nevytvorené, mení databázu – potvrdiť s majiteľom)

Tabuľka `portfolio_snapshots (date date primary key, count int)` + denný cron (`pg_cron`) s `insert ... select count(*) from listings where active`,
aby sa dal neskôr zobraziť graf rastu po mesiacoch.

## Nasadenie

Zdroj je v tomto priečinku; nasadenie cez Supabase MCP / CLI: `supabase functions deploy portfolio-count --no-verify-jwt`.
