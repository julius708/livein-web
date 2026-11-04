// Živý počet apartmánov v správe pre web live-in.international.
// Vracia IBA agregát: { count, baseline, baseline_year, updated_at }. Žiadne názvy, adresy ani ID bytov.
// Databáza (LIVE-IN Core, public.listings) sa číta výhradne tu na serveri cez service role kľúč z prostredia.
//
// Konfigurácia cez premenné prostredia funkcie (Supabase → Edge Functions → Secrets), bez zásahu do kódu:
//   PORTFOLIO_FILTER  = active | active_in_scope | in_scope   (predvolené: active  → count(*) where active = true)
//   BASELINE_YEAR     = 2026   (východiskový rok)
//   BASELINE_COUNT    = 69     (počet apartmánov na začiatku východiskového roka; potvrdí majiteľ)
//   ALLOWED_ORIGINS   = https://live-in.international,https://www.live-in.international
//   ALLOWED_ORIGIN_SUFFIX = -pracovna-app.vercel.app   (náhľady Vercel; nastav prázdne pre vypnutie)
//   CACHE_SECONDS     = 3600
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const FILTER = (Deno.env.get("PORTFOLIO_FILTER") ?? "active").trim();
const BASELINE_YEAR = Number(Deno.env.get("BASELINE_YEAR") ?? "2026");
const BASELINE_COUNT = Number(Deno.env.get("BASELINE_COUNT") ?? "69");
const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ?? "https://live-in.international,https://www.live-in.international")
  .split(",").map((s) => s.trim()).filter(Boolean);
const ALLOWED_SUFFIX = (Deno.env.get("ALLOWED_ORIGIN_SUFFIX") ?? "-pracovna-app.vercel.app").trim();
const CACHE_SECONDS = Math.max(60, Number(Deno.env.get("CACHE_SECONDS") ?? "3600"));
const RATE_LIMIT = 60; // požiadaviek za minútu na IP

let cache: { at: number; body: string } | null = null;
const hits = new Map<string, { n: number; reset: number }>();

function originAllowed(origin: string | null): string | null {
  if (!origin) return null;
  if (ALLOWED.includes(origin)) return origin;
  if (ALLOWED_SUFFIX && origin.startsWith("https://") && origin.endsWith(ALLOWED_SUFFIX)) return origin;
  return null;
}

function cors(origin: string | null): Record<string, string> {
  const h: Record<string, string> = { "Vary": "Origin", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "content-type" };
  const o = originAllowed(origin);
  if (o) h["Access-Control-Allow-Origin"] = o;
  return h;
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || e.reset < now) { hits.set(ip, { n: 1, reset: now + 60_000 }); return false; }
  e.n += 1;
  return e.n > RATE_LIMIT;
}

async function countListings(): Promise<number> {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(url, key, { auth: { persistSession: false } });
  let q = sb.from("listings").select("guesty_id", { count: "exact", head: true });
  if (FILTER === "active" || FILTER === "active_in_scope") q = q.eq("active", true);
  if (FILTER === "in_scope" || FILTER === "active_in_scope") q = q.eq("in_scope", true);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const headers = { ...cors(origin), "Content-Type": "application/json; charset=utf-8", "Cache-Control": `public, max-age=${CACHE_SECONDS}` };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "GET") return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers });
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { ...headers, "Retry-After": "60" } });
  try {
    if (!cache || Date.now() - cache.at > CACHE_SECONDS * 1000) {
      const count = await countListings();
      const body = JSON.stringify({ count, baseline: BASELINE_COUNT, baseline_year: BASELINE_YEAR, filter: FILTER, updated_at: new Date().toISOString() });
      cache = { at: Date.now(), body };
    }
    return new Response(cache.body, { status: 200, headers });
  } catch (e) {
    console.error("portfolio-count", e);
    return new Response(JSON.stringify({ error: "unavailable" }), { status: 503, headers: { ...headers, "Cache-Control": "no-store" } });
  }
});
