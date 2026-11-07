// Prepis hlasu pre Adama: nahrávka z mikrofónu (base64) → ElevenLabs Speech to Text (Scribe). Jazyk podľa stránky; bez jazyka Scribe rozpozná sám.
import { cors, LANGS } from "./_cors.js";

export const config = { api: { bodyParser: { sizeLimit: "12mb" } } };

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return res.status(503).json({ error: "stt_not_configured" });

  const b64 = (req.body && req.body.audio) || "";
  const mime = String((req.body && req.body.mime) || "audio/webm").slice(0, 60);
  if (!b64 || b64.length < 1000) return res.status(400).json({ error: "no_audio" });
  if (b64.length > 11 * 1024 * 1024) return res.status(413).json({ error: "too_long" });

  try {
    const bytes = Buffer.from(b64, "base64");
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: mime }), mime.includes("mp4") ? "audio.mp4" : "audio.webm");
    form.append("model_id", "scribe_v1");
    const l = String((req.body && req.body.lang) || "").toLowerCase().slice(0, 2).replace("cs", "cz");
    if (LANGS[l]) form.append("language_code", LANGS[l].stt);
    form.append("tag_audio_events", "false");
    const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": key }, body: form, signal: AbortSignal.timeout(25000) });
    if (!r.ok) return res.status(502).json({ error: "stt_failed", status: r.status });
    const j = await r.json();
    return res.status(200).json({ text: String(j.text || "").trim() });
  } catch (e) {
    return res.status(502).json({ error: "stt_failed" });
  }
}
