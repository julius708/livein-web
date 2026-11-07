# Adam – asistent LIVE-IN (widget + API)

Zdrojový kód projektu **livin-asistent** na Verceli (prj_SJV9OKcfNeJTf1L6LbSaFsKHj74f, doména livin-asistent-dun.vercel.app).
Projekt nie je napojený na git; nasadzuje sa z tohto priečinka príkazom `vercel deploy --prod` (alebo cez Vercel API s týmito súbormi).
Tento priečinok sa do webu live-in.international nebuilduje, je tu len ako zdroj pravdy.

- `widget.js` – postavička a chat na stránke; jazyk berie z `main[data-lang]`, `<html lang>` alebo `data-lang` na `<script>` (sk, cz, pl, en, de, es).
- `api/kb.js` – znalostná báza (po slovensky) a pravidlá jazyka odpovede. Zmeny faktov sa robia tu.
- `api/chat.js` – Anthropic API, odpoveď v jazyku návštevníka; `api/tts.js` – hlas (ElevenLabs multilingual v2); `api/stt.js` – prepis hlasu (Scribe, jazyk podľa stránky).
- Premenné prostredia vo Verceli: ANTHROPIC_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID (voliteľne ANTHROPIC_MODEL, ELEVENLABS_MODEL, ALLOWED_ORIGINS).
