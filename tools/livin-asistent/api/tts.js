import { cors } from "./_cors.js";

// Hlas Adama: ElevenLabs, model eleven_multilingual_v2 hovorí slovensky, česky, poľsky, anglicky, nemecky aj španielsky tým istým hlasom.
export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const key = process.env.ELEVENLABS_API_KEY;
  const voice = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voice) return res.status(503).json({ error: "tts_not_configured" });

  let text = ((req.body && req.body.text) || "").toString().slice(0, 900);
  text = text.replace(/LIVE-IN/g, "Livin");
  if (!text.trim()) return res.status(400).json({ error: "no_text" });

  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_64`, {
      method: "POST",
      headers: { "xi-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true },
      }),
      signal: AbortSignal.timeout(28000),
    });
    if (!r.ok) return res.status(502).json({ error: "tts_failed", status: r.status });
    const j = await r.json();
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ audio: j.audio_base64, alignment: j.alignment || j.normalized_alignment || null });
  } catch (e) {
    return res.status(502).json({ error: "tts_failed" });
  }
}
