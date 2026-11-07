// Spoločný CORS allowlist pre všetky API Adama.
const ALLOWED = (process.env.ALLOWED_ORIGINS || "https://live-in.international,https://www.live-in.international,https://new.live-in.international")
  .split(",").map((s) => s.trim());
export function cors(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED.includes(origin) || origin.endsWith(".vercel.app")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
// Jazyky, ktoré Adam ovláda: kód widgetu → názov, kód pre prepis hlasu (ElevenLabs Scribe), kód pre prehliadač.
export const LANGS = {
  sk: { name: "slovenčina", stt: "slk", bcp: "sk-SK" },
  cz: { name: "čeština", stt: "ces", bcp: "cs-CZ" },
  pl: { name: "polski", stt: "pol", bcp: "pl-PL" },
  en: { name: "English", stt: "eng", bcp: "en-GB" },
  de: { name: "Deutsch", stt: "deu", bcp: "de-DE" },
  es: { name: "español", stt: "spa", bcp: "es-ES" },
};
export function normLang(l) { l = String(l || "").toLowerCase().slice(0, 2); if (l === "cs") l = "cz"; return LANGS[l] ? l : "sk"; }
