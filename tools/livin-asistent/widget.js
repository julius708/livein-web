/* Adam – živý asistent LIVE-IN priamo na stránke.
   Dole žije malá postavička; po kliknutí sa otvorí chat okno. Dá sa presúvať a zbaliť.
   Vloženie: <script src="https://livin-asistent-dun.vercel.app/widget.js" defer></script>
   Jazyk: sk, cz, pl, en, de, es podľa stránky (main[data-lang], <html lang>) alebo atribútu data-lang na skripte. */
(function () {
  if (window.__adamWidget) return;
  window.__adamWidget = 1;
  var cs = document.currentScript, BASE = "https://livin-asistent-dun.vercel.app";
  try { BASE = new URL(cs.src).origin; } catch (e) {}
  var IMG = BASE + "/adam-avatar.webp"; // optimalizovaný avatar (460 px, WebP, ~32 kB namiesto 859 kB PNG)
  /* ---------- jazyk: podľa stránky (main[data-lang], <html lang>, data-lang na skripte), inak prehliadač ---------- */
  var I18N = {
    sk: { q: ["Koľko je provízia?", "Čo ak hosť zničí byt?", "Koľko môžem zarobiť?", "Ako funguje upratovanie?", "Ako začneme spolupracovať?", "Kedy dostanem výplatu?", "Ako sa dá zmluva ukončiť?", "Čo je nový zákon 133/2026?"],
      hello: "Ahoj, som Adam. Opýtajte sa ma na spoluprácu s LIVE-IN.", greet: "Ahoj, som Adam, virtuálny asistent LIVE-IN pre majiteľov bytov. Vyberte si otázku nižšie alebo sa opýtajte po svojom, aj hlasom.",
      err: "Prepáčte, teraz sa mi nepodarilo odpovedať. Napíšte nám prosím na management@live-in.international alebo zavolajte Júliusovi na +421 940 213 613.",
      title: "Kliknite a opýtajte sa Adama · chyťte a presuňte", alt: "Adam, asistent LIVE-IN", pill: "Opýtať sa Adama", dialog: "Chat s Adamom", sub: "Asistent LIVE-IN pre majiteľov bytov", mute: "Zapnúť alebo vypnúť hlas", min: "Zbaliť", ph: "Napíšte alebo povedzte…", qa: "Vaša otázka", mic: "Hovoriť", send: "Odoslať", foot: "Odpovedám len majiteľom bytov. Výnosy sú orientačné, nie záruka.",
      listening: "Počúvam… kliknite na mikrofón, keď dopoviete", blocked: "Prehliadač blokuje mikrofón. Povoľte ho v nastaveniach stránky (ikona zámku pri adrese) a skúste znova.", micfail: "Mikrofón sa nepodarilo spustiť. Napíšte mi otázku, prosím.", norec: "Nahrávanie v tomto prehliadači nejde. Napíšte mi otázku, prosím.", silent: "Nič som nepočul. Kliknite na mikrofón, povedzte otázku a kliknite znova.", transcribing: "Prepisujem…", nounderstand: "Nerozumel som. Skúste to povedať ešte raz, bližšie k mikrofónu.", nokey: "Prepis hlasu ešte nie je zapnutý. Napíšte mi otázku, prosím.", sttfail: "Prepis hlasu teraz zlyhal. Skúste znova alebo napíšte otázku.", srfail: "Rozpoznávanie reči zlyhalo. Napíšte mi otázku, prosím.", more: "Viac:", bcp: "sk-SK" },
    cz: { q: ["Kolik je provize?", "Co když host zničí byt?", "Kolik mohu vydělat?", "Jak funguje úklid?", "Jak začneme spolupracovat?", "Kdy dostanu výplatu?", "Jak lze smlouvu ukončit?", "Jak je to s legislativou?"],
      hello: "Ahoj, jsem Adam. Zeptejte se mě na spolupráci s LIVE-IN.", greet: "Ahoj, jsem Adam, virtuální asistent LIVE-IN pro majitele bytů. Vyberte si otázku níže nebo se zeptejte po svém, i hlasem.",
      err: "Omlouvám se, teď se mi nepodařilo odpovědět. Napište nám prosím na management@live-in.international nebo zavolejte Júliusovi na +421 940 213 613.",
      title: "Klikněte a zeptejte se Adama · chyťte a přesuňte", alt: "Adam, asistent LIVE-IN", pill: "Zeptat se Adama", dialog: "Chat s Adamem", sub: "Asistent LIVE-IN pro majitele bytů", mute: "Zapnout nebo vypnout hlas", min: "Sbalit", ph: "Napište nebo řekněte…", qa: "Vaše otázka", mic: "Mluvit", send: "Odeslat", foot: "Odpovídám jen majitelům bytů. Výnosy jsou orientační, ne záruka.",
      listening: "Poslouchám… klikněte na mikrofon, až domluvíte", blocked: "Prohlížeč blokuje mikrofon. Povolte ho v nastavení stránky (ikona zámku u adresy) a zkuste znovu.", micfail: "Mikrofon se nepodařilo spustit. Napište mi otázku, prosím.", norec: "Nahrávání v tomto prohlížeči nejde. Napište mi otázku, prosím.", silent: "Nic jsem neslyšel. Klikněte na mikrofon, řekněte otázku a klikněte znovu.", transcribing: "Přepisuji…", nounderstand: "Nerozuměl jsem. Zkuste to říct ještě jednou, blíž k mikrofonu.", nokey: "Přepis hlasu ještě není zapnutý. Napište mi otázku, prosím.", sttfail: "Přepis hlasu teď selhal. Zkuste znovu nebo napište otázku.", srfail: "Rozpoznávání řeči selhalo. Napište mi otázku, prosím.", more: "Více:", bcp: "cs-CZ" },
    pl: { q: ["Ile wynosi prowizja?", "Co jeśli gość zniszczy mieszkanie?", "Ile mogę zarobić?", "Jak działa sprzątanie?", "Jak zaczynamy współpracę?", "Kiedy dostanę wypłatę?", "Jak można zakończyć umowę?", "Czy działacie w Warszawie?"],
      hello: "Cześć, jestem Adam. Zapytaj mnie o współpracę z LIVE-IN.", greet: "Cześć, jestem Adam, wirtualny asystent LIVE-IN dla właścicieli mieszkań. Wybierz pytanie poniżej albo zapytaj po swojemu, także głosem.",
      err: "Przepraszam, teraz nie udało mi się odpowiedzieć. Napisz do nas na management@live-in.international lub zadzwoń do Juliusa: +421 940 213 613.",
      title: "Kliknij i zapytaj Adama · chwyć i przesuń", alt: "Adam, asystent LIVE-IN", pill: "Zapytaj Adama", dialog: "Czat z Adamem", sub: "Asystent LIVE-IN dla właścicieli mieszkań", mute: "Włącz lub wyłącz głos", min: "Zwiń", ph: "Napisz lub powiedz…", qa: "Twoje pytanie", mic: "Mów", send: "Wyślij", foot: "Odpowiadam tylko właścicielom mieszkań. Przychody są orientacyjne, nie gwarantowane.",
      listening: "Słucham… kliknij mikrofon, gdy skończysz", blocked: "Przeglądarka blokuje mikrofon. Zezwól w ustawieniach strony (ikona kłódki przy adresie) i spróbuj ponownie.", micfail: "Nie udało się uruchomić mikrofonu. Napisz pytanie, proszę.", norec: "Nagrywanie nie działa w tej przeglądarce. Napisz pytanie, proszę.", silent: "Nic nie usłyszałem. Kliknij mikrofon, powiedz pytanie i kliknij ponownie.", transcribing: "Zapisuję…", nounderstand: "Nie zrozumiałem. Powiedz to jeszcze raz, bliżej mikrofonu.", nokey: "Transkrypcja głosu nie jest jeszcze włączona. Napisz pytanie, proszę.", sttfail: "Transkrypcja głosu nie powiodła się. Spróbuj ponownie lub napisz pytanie.", srfail: "Rozpoznawanie mowy nie powiodło się. Napisz pytanie, proszę.", more: "Więcej:", bcp: "pl-PL" },
    en: { q: ["How much is the commission?", "What if a guest damages the flat?", "How much can I earn?", "How does cleaning work?", "How do we start?", "When do I get paid?", "How can the contract be ended?", "Do you operate in Warsaw?"],
      hello: "Hi, I'm Adam. Ask me about working with LIVE-IN.", greet: "Hi, I'm Adam, the LIVE-IN virtual assistant for apartment owners. Pick a question below or ask in your own words, by voice too.",
      err: "Sorry, I couldn't answer just now. Please e-mail management@live-in.international or call Július on +421 940 213 613.",
      title: "Click to ask Adam · drag to move", alt: "Adam, LIVE-IN assistant", pill: "Ask Adam", dialog: "Chat with Adam", sub: "LIVE-IN assistant for apartment owners", mute: "Voice on or off", min: "Minimise", ph: "Type or speak…", qa: "Your question", mic: "Speak", send: "Send", foot: "I only answer apartment owners. Income figures are indicative, not guaranteed.",
      listening: "Listening… click the microphone when you're done", blocked: "The browser is blocking the microphone. Allow it in the site settings (padlock icon next to the address) and try again.", micfail: "The microphone could not be started. Please type your question.", norec: "Recording doesn't work in this browser. Please type your question.", silent: "I didn't hear anything. Click the microphone, say your question and click again.", transcribing: "Transcribing…", nounderstand: "I didn't catch that. Please say it again, closer to the microphone.", nokey: "Voice transcription isn't enabled yet. Please type your question.", sttfail: "Voice transcription failed. Try again or type your question.", srfail: "Speech recognition failed. Please type your question.", more: "More:", bcp: "en-GB" },
    de: { q: ["Wie hoch ist die Provision?", "Was, wenn ein Gast die Wohnung beschädigt?", "Wie viel kann ich verdienen?", "Wie läuft die Reinigung?", "Wie starten wir?", "Wann bekomme ich die Auszahlung?", "Wie kann der Vertrag enden?", "Seid ihr in Warschau tätig?"],
      hello: "Hallo, ich bin Adam. Fragen Sie mich zur Zusammenarbeit mit LIVE-IN.", greet: "Hallo, ich bin Adam, der virtuelle Assistent von LIVE-IN für Wohnungseigentümer. Wählen Sie unten eine Frage oder fragen Sie frei, auch per Sprache.",
      err: "Entschuldigung, ich konnte gerade nicht antworten. Schreiben Sie an management@live-in.international oder rufen Sie Július an: +421 940 213 613.",
      title: "Klicken und Adam fragen · ziehen zum Verschieben", alt: "Adam, LIVE-IN Assistent", pill: "Adam fragen", dialog: "Chat mit Adam", sub: "LIVE-IN Assistent für Wohnungseigentümer", mute: "Stimme ein- oder ausschalten", min: "Minimieren", ph: "Schreiben oder sprechen…", qa: "Ihre Frage", mic: "Sprechen", send: "Senden", foot: "Ich antworte nur Wohnungseigentümern. Erträge sind Richtwerte, keine Garantie.",
      listening: "Ich höre zu… klicken Sie auf das Mikrofon, wenn Sie fertig sind", blocked: "Der Browser blockiert das Mikrofon. Erlauben Sie es in den Seiteneinstellungen (Schloss-Symbol) und versuchen Sie es erneut.", micfail: "Das Mikrofon konnte nicht gestartet werden. Bitte schreiben Sie Ihre Frage.", norec: "Aufnahme funktioniert in diesem Browser nicht. Bitte schreiben Sie Ihre Frage.", silent: "Ich habe nichts gehört. Klicken Sie auf das Mikrofon, sprechen Sie und klicken Sie erneut.", transcribing: "Transkribiere…", nounderstand: "Ich habe das nicht verstanden. Bitte noch einmal, näher am Mikrofon.", nokey: "Die Sprachtranskription ist noch nicht aktiviert. Bitte schreiben Sie Ihre Frage.", sttfail: "Die Transkription ist fehlgeschlagen. Versuchen Sie es erneut oder schreiben Sie.", srfail: "Spracherkennung fehlgeschlagen. Bitte schreiben Sie Ihre Frage.", more: "Mehr:", bcp: "de-DE" },
    es: { q: ["¿Cuánto es la comisión?", "¿Y si un huésped daña el piso?", "¿Cuánto puedo ganar?", "¿Cómo funciona la limpieza?", "¿Cómo empezamos?", "¿Cuándo cobro?", "¿Cómo se termina el contrato?", "¿Operáis en Varsovia?"],
      hello: "Hola, soy Adam. Pregúntame sobre colaborar con LIVE-IN.", greet: "Hola, soy Adam, el asistente virtual de LIVE-IN para propietarios de pisos. Elige una pregunta abajo o pregunta con tus palabras, también por voz.",
      err: "Lo siento, ahora no he podido responder. Escríbenos a management@live-in.international o llama a Július al +421 940 213 613.",
      title: "Haz clic y pregunta a Adam · arrastra para mover", alt: "Adam, asistente de LIVE-IN", pill: "Preguntar a Adam", dialog: "Chat con Adam", sub: "Asistente LIVE-IN para propietarios", mute: "Activar o desactivar la voz", min: "Minimizar", ph: "Escribe o habla…", qa: "Tu pregunta", mic: "Hablar", send: "Enviar", foot: "Solo respondo a propietarios de pisos. Los ingresos son orientativos, no garantizados.",
      listening: "Escuchando… pulsa el micrófono cuando termines", blocked: "El navegador bloquea el micrófono. Permítelo en la configuración del sitio (icono del candado) e inténtalo de nuevo.", micfail: "No se pudo iniciar el micrófono. Escribe tu pregunta, por favor.", norec: "La grabación no funciona en este navegador. Escribe tu pregunta, por favor.", silent: "No he oído nada. Pulsa el micrófono, di tu pregunta y vuelve a pulsar.", transcribing: "Transcribiendo…", nounderstand: "No lo he entendido. Repítelo, más cerca del micrófono.", nokey: "La transcripción de voz aún no está activada. Escribe tu pregunta, por favor.", sttfail: "La transcripción ha fallado. Inténtalo de nuevo o escribe la pregunta.", srfail: "El reconocimiento de voz ha fallado. Escribe tu pregunta, por favor.", more: "Más:", bcp: "es-ES" },
  };
  function detectLang() {
    var c = "";
    try { c = (cs && cs.getAttribute("data-lang")) || ""; } catch (e) {}
    if (!c) { var m = document.querySelector("main[data-lang]"); if (m) c = m.getAttribute("data-lang") || ""; }
    if (!c) c = document.documentElement.lang || "";
    if (!c) c = (navigator.language || "sk");
    c = String(c).toLowerCase().slice(0, 2); if (c === "cs") c = "cz";
    return I18N[c] ? c : "sk";
  }
  var LANG = detectLang(), T = I18N[LANG];
  var QUESTIONS = T.q, HELLO = T.hello, GREETING = T.greet, ERR = T.err;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  function sstore(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) {} return null; }

  var host = document.createElement("div");
  host.id = "adam-host";
  host.style.cssText = "position:fixed;z-index:2147483000;right:20px;bottom:16px;width:0;height:0;";
  var root = host.attachShadow({ mode: "open" });
  var FONT = 'ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  root.innerHTML =
    '<style>' +
    ':host{all:initial}*{box-sizing:border-box}' +
    '.col{position:absolute;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;font-family:' + FONT + ';color:#233E31;animation:wake .8s cubic-bezier(.2,1.3,.4,1) both}' +
    '@keyframes wake{from{transform:translateY(90px);opacity:0}to{transform:none;opacity:1}}' +
    '.adam{position:relative;overflow:hidden;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none;flex:0 0 auto}' +
    '.adam.drag{cursor:grabbing}.adam.in{cursor:default;touch-action:auto}' +
    '#bob{transform-origin:50% 100%;animation:breathe 7s ease-in-out infinite}' +
    '@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.006)}}' +
    '#nod{position:relative;transform-origin:50% 100%}' +
    '#nod img{display:block;width:100%;height:auto;pointer-events:none;-webkit-user-drag:none}' +
    '#mouth{position:absolute;left:39.58%;top:30.6%;width:19.44%;height:auto;pointer-events:none}' +
    '.pill{position:relative;z-index:2;margin-top:-16px;border:0;cursor:pointer;background:#173E2C;color:#fff;font:inherit;font-size:14px;font-weight:600;padding:9px 16px;border-radius:99px;box-shadow:0 6px 18px rgba(23,62,44,.35);white-space:nowrap}' +
    '.hello{position:absolute;right:0;bottom:100%;margin-bottom:12px;width:230px;max-width:calc(100vw - 24px);background:#fff;border:2.5px solid #173E2C;border-radius:18px;padding:10px 14px;font-size:15px;line-height:1.45;cursor:pointer;opacity:0;transform:translateY(6px) scale(.95);transition:opacity .3s,transform .3s;pointer-events:none;box-shadow:0 8px 24px rgba(23,62,44,.2)}' +
    '.hello.show{opacity:1;transform:none;pointer-events:auto}' +
    '.hello:after{content:"";position:absolute;bottom:-9px;right:40px;width:14px;height:14px;background:#fff;border-right:2.5px solid #173E2C;border-bottom:2.5px solid #173E2C;transform:rotate(45deg)}' +
    /* okno */
    '.win{position:fixed;right:16px;bottom:16px;width:min(400px,calc(100vw - 16px));height:calc(100vh - 32px);max-height:640px;display:none;flex-direction:column;background:#fff;border-radius:20px;overflow:hidden;font-family:' + FONT + ';color:#233E31;box-shadow:0 18px 60px rgba(23,62,44,.38),0 0 0 1px rgba(23,62,44,.1)}' +
    '.win.open{display:flex;animation:pop .28s ease both}' +
    '@keyframes pop{from{opacity:0;transform:translateY(24px) scale(.96)}to{opacity:1;transform:none}}' +
    '@media(max-width:699px){.win{left:8px;right:8px;bottom:8px;width:auto;height:calc(100vh - 16px);height:calc(100dvh - 16px);max-height:640px}}' +
    '.head{display:flex;align-items:flex-end;gap:12px;background:linear-gradient(#EEF3EA,#DCE8D6);padding:0 10px 0 8px;flex:0 0 auto;border-bottom:1px solid #cfdac9}' +
    '.ht{flex:1;align-self:center;min-width:0}.ht b{display:block;font-size:19px;color:#173E2C;line-height:1.2}.ht span{display:block;font-size:13px;color:#4f6657;line-height:1.35;margin-top:2px}' +
    '.hb{display:flex;gap:6px;align-self:flex-start;padding-top:10px}' +
    '.ib{flex:0 0 auto;width:36px;height:36px;border-radius:50%;border:0;display:grid;place-items:center;cursor:pointer;background:#fff;color:#173E2C;padding:0;box-shadow:0 0 0 1px rgba(23,62,44,.14)}' +
    '.ib svg{width:18px;height:18px}' +
    '.ib.send{background:#F46D16;color:#fff;box-shadow:none}.ib.rec{background:#F46D16;color:#fff;animation:pulse 1.1s infinite;box-shadow:none}' +
    '@keyframes pulse{50%{box-shadow:0 0 0 7px rgba(244,109,22,.22)}}' +
    '.msgs{flex:1 1 auto;min-height:0;overflow-y:auto;padding:14px 12px 6px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}' +
    '.m{max-width:90%;padding:10px 14px;border-radius:18px;font-size:16px;line-height:1.5;overflow-wrap:anywhere}' +
    '.m.a{align-self:flex-start;background:#F1F5EE;border-bottom-left-radius:5px}' +
    '.m.u{align-self:flex-end;background:#173E2C;color:#fff;border-bottom-right-radius:5px}.m a{color:#B84A08;font-weight:600;text-decoration:underline;text-underline-offset:2px}.m a.off{color:transparent}' +
    '.m .w{transition:color .12s}.m .w.off{color:transparent}' +
    '.dots span{display:inline-block;width:7px;height:7px;border-radius:50%;background:#173E2C;margin-right:4px;animation:d 1s infinite}' +
    '.dots span:nth-child(2){animation-delay:.15s}.dots span:nth-child(3){animation-delay:.3s}' +
    '@keyframes d{0%,100%{opacity:.25;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}' +
    '.chips{flex:0 0 auto;display:flex;flex-wrap:wrap;gap:6px;padding:6px 12px 8px;max-height:112px;overflow-y:auto;scrollbar-width:thin}' +
    '.chips.row{flex-wrap:nowrap;overflow-y:hidden;overflow-x:auto}' +
    '.chip{flex:0 0 auto;border:1px solid #cfd8cb;background:#f6f8f3;color:#173E2C;font:inherit;font-size:14px;line-height:1.2;padding:8px 12px;border-radius:99px;cursor:pointer;text-align:left}' +
    '.chip:hover{background:#e9f0e4;border-color:#173E2C}' +
    '.chips.row .chip{white-space:nowrap}' +
    'form{flex:0 0 auto;display:flex;gap:6px;align-items:center;margin:0;padding:4px 12px 0}' +
    'input{flex:1;min-width:0;border:1px solid #cfd8cb;border-radius:99px;padding:10px 14px;font:inherit;font-size:16px;color:#233E31;background:#fff;outline:none}' +
    'input:focus{border-color:#173E2C}' +
    '.foot{flex:0 0 auto;font-size:11px;color:#8a9a8f;text-align:center;padding:6px 12px 10px;line-height:1.3}' +
    '</style>' +
    '<div class="col" id="col">' +
      '<div class="hello" id="hello"></div>' +
      '<div id="miniSlot"><div class="adam" id="adam" title="' + T.title + '"><div id="bob"><div id="nod">' +
        '<img id="face" alt="' + T.alt + '" draggable="false" src="' + IMG + '"><canvas id="mouth" width="140" height="80"></canvas>' +
      '</div></div></div></div>' +
      '<button class="pill" id="pill" type="button">' + T.pill + '</button>' +
    '</div>' +
    '<div class="win" id="win" role="dialog" aria-label="' + T.dialog + '">' +
      '<div class="head"><div id="stageSlot"></div>' +
        '<div class="ht"><b>Adam</b><span>' + T.sub + '</span></div>' +
        '<div class="hb"><button class="ib" id="mute" type="button" aria-label="' + T.mute + '"></button>' +
        '<button class="ib" id="min" type="button" aria-label="' + T.min + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button></div>' +
      '</div>' +
      '<div class="msgs" id="msgs" aria-live="polite"></div>' +
      '<div class="chips" id="chips"></div>' +
      '<form id="f" autocomplete="off"><input id="q" type="text" placeholder="' + T.ph + '" maxlength="400" aria-label="' + T.qa + '">' +
        '<button class="ib" id="mic" type="button" aria-label="' + T.mic + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>' +
        '<button class="ib send" type="submit" aria-label="' + T.send + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>' +
      '<div class="foot">' + T.foot + '</div>' +
    '</div>';

  var $ = function (i) { return root.getElementById(i); };
  var col = $("col"), adam = $("adam"), face = $("face"), nod = $("nod"), cv = $("mouth"), g = cv.getContext("2d");
  var win = $("win"), msgs = $("msgs"), hello = $("hello"), pill = $("pill"), chipsEl = $("chips");
  var history = [], busy = false, muted = false, speakingNow = false, simMode = false, mouthO = 0, mouthW = 0, TL = null;
  var ICON_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  var ICON_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
  $("mute").innerHTML = ICON_ON;
  hello.textContent = HELLO;

  QUESTIONS.forEach(function (t) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = t;
    b.onclick = function () { ask(t); };
    chipsEl.appendChild(b);
  });

  /* ---------- veľkosť, poloha ---------- */
  var isOpen = false;
  function mobile() { return innerWidth < 700; }
  function sizes() {
    var aw = isOpen ? (mobile() ? 104 : 150) : (mobile() ? 100 : 124);
    adam.style.width = aw + "px"; adam.style.height = Math.round(aw * 1.3) + "px";
  }
  function setOpen(o) {
    if (o === isOpen) return;
    isOpen = o;
    store("adam-open", o ? "1" : "0");
    if (o) {
      hideHello();
      $("stageSlot").appendChild(adam); adam.classList.add("in");
      col.style.display = "none"; win.classList.add("open");
      sizes();
      if (!greeted) { greeted = true; showAdam(GREETING); if (!sstore("adam-g-" + LANG)) { sstore("adam-g-" + LANG, "1"); speak(GREETING); } else reveal(1); }
      if (!mobile()) setTimeout(function () { $("q").focus(); }, 60);
    } else {
      stopSpeech(true);
      $("miniSlot").appendChild(adam); adam.classList.remove("in");
      win.classList.remove("open"); col.style.display = "flex";
      sizes(); clampHost();
    }
  }
  var greeted = false;
  function clampHost() {
    var r = parseFloat(host.style.right) || 0, b = parseFloat(host.style.bottom) || 0;
    var cw = col.offsetWidth || 130, ch = col.offsetHeight || 200;
    r = Math.max(-cw * 0.35, Math.min(innerWidth - cw * 0.65, r));
    b = Math.max(-ch * 0.3, Math.min(innerHeight - 150, b));
    host.style.right = r + "px"; host.style.bottom = b + "px";
  }
  function initPos() {
    var saved = null;
    try { saved = JSON.parse(store("adam-pos") || "null"); } catch (e) {}
    if (saved && typeof saved.r === "number") { host.style.right = saved.r + "px"; host.style.bottom = saved.b + "px"; }
    else if (mobile()) { host.style.right = "8px"; host.style.bottom = "8px"; }
    else { host.style.right = "22px"; host.style.bottom = "14px"; }
    clampHost();
  }

  /* ---------- ťahanie malej postavy ---------- */
  (function () {
    var sx, sy, r0, b0, moved = 0, down = false;
    adam.addEventListener("pointerdown", function (e) {
      if (isOpen) return;
      down = true; moved = 0; sx = e.clientX; sy = e.clientY;
      r0 = parseFloat(host.style.right) || 0; b0 = parseFloat(host.style.bottom) || 0;
      try { adam.setPointerCapture(e.pointerId); } catch (_) {}
      adam.classList.add("drag");
    });
    adam.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
      if (moved > 5) { host.style.right = (r0 - dx) + "px"; host.style.bottom = (b0 - dy) + "px"; clampHost(); }
    });
    function up() {
      if (!down) return; down = false; adam.classList.remove("drag");
      if (moved > 5) { store("adam-pos", JSON.stringify({ r: parseFloat(host.style.right), b: parseFloat(host.style.bottom) })); return; }
      unlock(); setOpen(true);
    }
    adam.addEventListener("pointerup", up); adam.addEventListener("pointercancel", up);
    adam.addEventListener("click", function () { if (isOpen && speakingNow) stopSpeech(true); });
  })();

  /* ---------- správy v okne ---------- */
  var words = [], wordEls = [], thinkEl = null, lastN = -1, helloT = 0;
  function mk(tag, cls, txt) { var d = document.createElement(tag); if (cls) d.className = cls; if (txt) d.textContent = txt; return d; }
  function scrollEnd() { msgs.scrollTop = msgs.scrollHeight; }
  function addMsg(cls) { var d = mk("div", "m " + cls); msgs.appendChild(d); scrollEnd(); return d; }
  function showThinking(q) {
    if (q) addMsg("u").textContent = q;
    thinkEl = addMsg("a"); thinkEl.innerHTML = '<div class="dots"><span></span><span></span><span></span></div>';
    chipsEl.classList.add("row"); scrollEnd();
  }
  function showAdam(text) {
    var el = thinkEl || addMsg("a"); thinkEl = null; el.innerHTML = "";
    words = text.split(/\s+/).filter(Boolean); wordEls = []; lastN = -1;
    words.forEach(function (w, i) {
      var sp = i < words.length - 1 ? " " : "", s;
      var m = /^(https?:\/\/[^\s<>"']+?)([.,;:!?)\]]*)$/.exec(w);
      if (m) {
        s = mk("a", "w off", m[1].replace(/^https?:\/\//, "").replace(/\/$/, "") + m[2] + sp);
        s.href = m[1]; s.target = "_blank"; s.rel = "noopener";
      } else {
        if ((w === "Viac:" || w === T.more) && i > 0) el.appendChild(document.createElement("br"));
        s = mk("span", "w off", w + sp);
      }
      el.appendChild(s); wordEls.push(s);
    });
    scrollEnd();
  }
  function reveal(ratio) {
    var n = Math.ceil(words.length * Math.min(1, ratio));
    if (n === lastN) return; lastN = n;
    for (var i = 0; i < wordEls.length; i++) { if (i < n) wordEls[i].classList.remove("off"); else wordEls[i].classList.add("off"); }
    scrollEnd();
  }
  function showHello() { hello.classList.add("show"); clearTimeout(helloT); helloT = setTimeout(hideHello, 10000); }
  function hideHello() { hello.classList.remove("show"); clearTimeout(helloT); }
  hello.addEventListener("click", function () { unlock(); setOpen(true); });

  /* ---------- ústa podľa hlásky ---------- */
  function drawMouth(o, w) {
    g.clearRect(0, 0, 140, 80);
    if (o < 0.05) return;
    var a = Math.min(1, (o - 0.05) * 7), cx = 70, cy = 30, hw = 29 + 9 * w, h = 4 + o * 34;
    g.globalAlpha = a;
    function path() {
      g.beginPath(); g.moveTo(cx - hw, cy - 1);
      g.quadraticCurveTo(cx, cy - 5, cx + hw, cy - 1);
      g.quadraticCurveTo(cx, cy - 1 + h * 1.7, cx - hw, cy - 1); g.closePath();
    }
    path(); var gr = g.createLinearGradient(0, cy, 0, cy + h); gr.addColorStop(0, "#2a0d0d"); gr.addColorStop(1, "#4a1818"); g.fillStyle = gr; g.fill();
    g.save(); path(); g.clip();
    g.fillStyle = "#c5625b"; g.beginPath(); g.ellipse(cx, cy + h * 0.82, hw * 0.5, h * 0.3, 0, 0, 7); g.fill();
    g.fillStyle = "#f7f2ea"; g.fillRect(cx - hw + 5, cy - 6, 2 * hw - 10, Math.min(7, h * 0.3) + 3);
    g.restore();
    path(); g.lineWidth = 2.8; g.strokeStyle = "#a8604f"; g.stroke();
    g.globalAlpha = 1;
  }
  var VOW = { a: [.95, .2], "á": [.95, .2], "ä": [.8, .3], e: [.6, .7], "é": [.55, .7], i: [.32, 1], "í": [.3, 1], y: [.32, 1], "ý": [.3, 1], o: [.75, -.9], "ó": [.75, -.9], "ô": [.7, -.8], u: [.45, -1], "ú": [.45, -1] };
  function isLetter(c) { return c.toLowerCase() !== c.toUpperCase(); }
  function vis(ch, i) {
    var c = ch[i].toLowerCase();
    if (VOW[c]) return VOW[c];
    if (c === "m" || c === "b" || c === "p") return [0, 0];
    if (c === "f" || c === "v") return [.1, .4];
    if (!isLetter(c)) return [0.02, 0];
    for (var k = 1; k <= 3 && i + k < ch.length; k++) { var n = VOW[ch[i + k].toLowerCase()]; if (n) return [Math.max(.18, n[0] * .45), n[1] * .6]; }
    return [.2, .2];
  }
  function visAt(t) {
    var s = TL.s, ch = TL.c, lo = 0, hi = s.length - 1, idx = -1;
    while (lo <= hi) { var m = (lo + hi) >> 1; if (s[m] <= t) { idx = m; lo = m + 1; } else hi = m - 1; }
    if (idx < 0 || t > TL.e[idx] + 0.12) return { o: 0, w: 0, i: idx };
    var v = vis(ch, idx); return { o: v[0], w: v[1], i: idx };
  }

  /* ---------- zvuk ---------- */
  var A = new Audio(); A.preload = "auto"; A.playsInline = true;
  var SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
  var primed = false;
  function unlock() { if (primed) return; primed = true; try { A.src = SILENT; var p = A.play(); if (p && p.catch) p.catch(function () {}); } catch (_) {} }
  root.addEventListener("pointerdown", unlock, true);

  function loop() {
    var tO = 0, tW = 0, now = performance.now();
    if (speakingNow) {
      if (!simMode && TL) {
        var v = visAt(A.currentTime); tO = v.o; tW = v.w;
        if (v.i >= 0) reveal((v.i + 2) / TL.c.length);
      } else {
        var t = now / 1000; tO = 0.3 + 0.5 * Math.abs(Math.sin(t * 13)) * (0.55 + 0.45 * Math.sin(t * 3.3));
      }
    }
    if (window.__adamForce) { tO = window.__adamForce.o; tW = window.__adamForce.w; }
    mouthO += (tO - mouthO) * 0.3; mouthW += (tW - mouthW) * 0.25;
    drawMouth(mouthO, mouthW);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function stopSpeech(showAll) {
    speakingNow = false; simMode = false;
    try { A.pause(); } catch (_) {}
    try { speechSynthesis.cancel(); } catch (_) {}
    if (showAll) reveal(1);
  }
  function playAudio(url) {
    return new Promise(function (res, rej) {
      A.onended = function () { speakingNow = false; reveal(1); res(); };
      A.onerror = function () { speakingNow = false; rej(new Error("audio")); };
      A.src = url; simMode = false;
      var p = A.play();
      if (p && p.then) p.then(function () { speakingNow = true; }, function (e) { speakingNow = false; rej(e); });
      else speakingNow = true;
    });
  }
  function speechFallback(text) {
    return new Promise(function (res) {
      if (!("speechSynthesis" in window)) { reveal(1); return res(); }
      var u = new SpeechSynthesisUtterance(text.replace(/LIVE-IN/g, "Livin")); u.lang = T.bcp; u.rate = 1.02;
      u.onboundary = function (e) { if (e.charIndex != null) reveal(e.charIndex / text.length + 0.04); };
      u.onend = u.onerror = function () { speakingNow = false; simMode = false; reveal(1); res(); };
      simMode = true; speakingNow = true; speechSynthesis.speak(u);
    });
  }
  function b64blob(b64) {
    var bin = atob(b64), n = bin.length, u = new Uint8Array(n);
    for (var i = 0; i < n; i++) u[i] = bin.charCodeAt(i);
    return new Blob([u], { type: "audio/mpeg" });
  }
  async function speak(text) {
    if (muted) { reveal(1); return; }
    try {
      var r = await fetch(BASE + "/api/tts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: text }) });
      if (!r.ok) throw new Error("tts " + r.status);
      var j = await r.json(), al = j.alignment;
      TL = (al && al.characters && al.character_start_times_seconds) ? { c: al.characters, s: al.character_start_times_seconds, e: al.character_end_times_seconds } : null;
      await playAudio(URL.createObjectURL(b64blob(j.audio)));
    } catch (e) { TL = null; await speechFallback(text); }
  }

  /* ---------- chat ---------- */
  async function ask(q) {
    q = (q || "").trim(); if (!q || busy) return;
    unlock(); stopSpeech(true);
    busy = true; $("q").value = "";
    showThinking(q);
    history.push({ role: "user", content: q });
    var reply;
    try {
      var r = await fetch(BASE + "/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: history.slice(-12), lang: LANG }) });
      if (!r.ok) throw new Error("chat " + r.status);
      var j = await r.json(); reply = (j.reply || "").trim();
      if (!reply) throw new Error("empty");
      history.push({ role: "assistant", content: reply });
    } catch (e) { reply = ERR; history.pop(); }
    showAdam(reply);
    busy = false;
    await speak(reply.replace(/\s*(Viac|Více|Więcej|More|Mehr|Más):\s*https?:\/\/\S+/g, "").replace(/https?:\/\/\S+/g, "").trim() || reply);
  }
  $("f").addEventListener("submit", function (e) { e.preventDefault(); ask($("q").value); });
  $("mute").addEventListener("click", function () { muted = !muted; this.innerHTML = muted ? ICON_OFF : ICON_ON; if (muted) stopSpeech(true); });
  $("min").addEventListener("click", function () { setOpen(false); });
  pill.addEventListener("click", function () { unlock(); setOpen(true); });
  root.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen) setOpen(false); });

  /* ---------- mikrofón: nahrávka → prepis na serveri (ElevenLabs), záloha rozpoznávanie v prehliadači ---------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null, mr = null, recTimer = 0;
  var canRecord = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  if (!canRecord && !SR) $("mic").style.display = "none";
  function adamNote(t) { showAdam(t); reveal(1); }
  function setRecUI(on) { var btn = $("mic"); if (on) btn.classList.add("rec"); else btn.classList.remove("rec"); $("q").placeholder = on ? T.listening : T.ph; }
  function blobToB64(blob) { return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result).split(",")[1] || ""); }; fr.onerror = rej; fr.readAsDataURL(blob); }); }
  async function transcribe(blob) {
    var b64 = await blobToB64(blob);
    var r = await fetch(BASE + "/api/stt", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ audio: b64, mime: blob.type || "audio/webm", lang: LANG }) });
    if (r.status === 503) throw new Error("nokey");
    if (!r.ok) throw new Error("stt " + r.status);
    var j = await r.json(); return (j.text || "").trim();
  }
  function stopRec() { try { if (mr && mr.state !== "inactive") mr.stop(); } catch (_) {} }
  $("mic").addEventListener("click", async function () {
    unlock();
    if (mr) { stopRec(); return; }
    if (rec) { try { rec.stop(); } catch (_) {} return; }
    stopSpeech(true);
    if (canRecord) {
      var stream;
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (e) { adamNote(e && e.name === "NotAllowedError" ? T.blocked : T.micfail); return; }
      var mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].filter(function (m) { return window.MediaRecorder.isTypeSupported(m); })[0] || "";
      var chunks = [];
      try { mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); } catch (_) { stream.getTracks().forEach(function (t) { t.stop(); }); adamNote(T.norec); return; }
      setRecUI(true); $("q").value = "";
      mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = async function () {
        clearTimeout(recTimer); setRecUI(false); var rmime = mr.mimeType || mime || "audio/webm"; mr = null;
        stream.getTracks().forEach(function (t) { t.stop(); });
        var blob = new Blob(chunks, { type: rmime });
        if (blob.size < 800) { adamNote(T.silent); return; }
        $("q").value = T.transcribing;
        try {
          var text = await transcribe(blob);
          $("q").value = "";
          if (!text) { adamNote(T.nounderstand); return; }
          $("q").value = text; ask(text);
        } catch (e) {
          $("q").value = "";
          adamNote(e && e.message === "nokey" ? T.nokey : T.sttfail);
        }
      };
      mr.start();
      recTimer = setTimeout(stopRec, 20000);
      return;
    }
    rec = new SR(); rec.lang = T.bcp; rec.interimResults = false; rec.maxAlternatives = 1;
    setRecUI(true);
    rec.onresult = function (e) { var t = e.results[0][0].transcript; $("q").value = t; ask(t); };
    rec.onerror = function (e) { adamNote(e && e.error === "not-allowed" ? T.blocked : T.srfail); };
    rec.onend = function () { setRecUI(false); rec = null; };
    try { rec.start(); } catch (_) { setRecUI(false); rec = null; }
  });

  /* ---------- štart: Adam sa zobudí dole na stránke ---------- */
  var started = false;
  function start() {
    if (started) return; started = true;
    initPos(); sizes();
    if (store("adam-open") === "1" && !mobile()) { setOpen(true); return; }
    setTimeout(showHello, 1200);
  }
  addEventListener("resize", function () { sizes(); clampHost(); });
  function mount() {
    document.body.appendChild(host);
    sizes();
    if (face.complete) start(); else { face.onload = start; setTimeout(start, 2000); }
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
