import { SYSTEM_PROMPT, LANGUAGE_RULES } from "./kb.js";
import { cors, LANGS, normLang } from "./_cors.js";

// Adam odpovedá v jazyku návštevníka: jazyk stránky (sk/en/de/es/pl/cz) alebo jazyk, ktorým píše.
const MODELS = (process.env.ANTHROPIC_MODEL ? [process.env.ANTHROPIC_MODEL] : []).concat(["claude-sonnet-4-5", "claude-sonnet-5-5", "claude-3-7-sonnet-latest", "claude-3-5-haiku-latest"]);

function clean(t) {
  return t.replace(/\*\*?/g, "").replace(/^#+\s*/gm, "").replace(/^\s*[-•]\s+/gm, "").replace(/\n{3,}/g, "\n\n").trim();
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: "not_configured" });

  let messages = (req.body && req.body.messages) || [];
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: "no_messages" });
  messages = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 800) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return res.status(400).json({ error: "bad_messages" });

  const lang = normLang(req.body && req.body.lang);
  const system = SYSTEM_PROMPT + "\n\n" + LANGUAGE_RULES.replace("{LANG}", LANGS[lang].name);

  let lastErr = null;
  for (const model of MODELS) {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model, max_tokens: 520, temperature: 0.3, system, messages }),
        signal: AbortSignal.timeout(28000),
      });
      if (r.status === 404 || r.status === 400) { lastErr = await r.text(); if (/model/i.test(lastErr)) continue; return res.status(502).json({ error: "upstream", detail: lastErr.slice(0, 200) }); }
      if (!r.ok) { lastErr = await r.text(); if (r.status === 529 || r.status === 429) continue; return res.status(502).json({ error: "upstream", status: r.status }); }
      const j = await r.json();
      const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
      const reply = clean(text);
      if (!reply) return res.status(502).json({ error: "empty" });
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ reply, lang, model });
    } catch (e) { lastErr = String(e && e.message); }
  }
  return res.status(502).json({ error: "upstream", detail: String(lastErr || "").slice(0, 200) });
}
