/* LIVE-IN client-side report. Creates a document only; never sends or downloads data. */
(function () {
  'use strict';
  const scriptURL = document.currentScript && document.currentScript.src;
  const baseURL = new URL('.', scriptURL || document.baseURI);
  const assetsURL = new URL('live-in-assets/', baseURL);
  const locales = { sk: 'sk-SK', en: 'en-GB', de: 'de-DE', es: 'es-ES', pl: 'pl-PL', cs: 'cs-CZ' };
  const copy = {
    sk: {
      title: 'Potenciál vášho bytu', kicker: 'VÁŠ INDIVIDUÁLNY SCENÁR', prepared: 'Pripravené pre', date: 'Vytvorené',
      net: 'Modelový mesačný zostatok po zadaných nákladoch', period: 'Scenár na 30 dní',
      metrics: ['Cena za obsadenú noc', 'Obsadenosť dostupných nocí', 'Obsadené noci'],
      profile: 'Váš byt', bedrooms: 'Spálne', guests: 'Kapacita hostí', area: 'Rozloha',
      breakdown: 'Príjmy a náklady', rows: ['Modelové tržby', 'Poplatky portálov', 'Modelový Rental Income', 'Správa · 17 %', 'DPH · 5 % z Rental Income', 'Upratovanie spolu', 'Úhrady upratovania od hostí', 'Guesty / mesiac', 'Ďalšie zadané náklady', 'Modelový mesačný zostatok'],
      assumptions: 'Predpoklady', stay: 'Priemerná dĺžka pobytu', nights: 'nocí', own: 'Vlastné / blokované noci', bookings: 'Modelový počet rezervácií',
      source: 'Podklady a rozsah', noEvidence: 'Podklady k porovnateľným bytom neboli priložené. Hodnoty sú predpoklady scenára.',
      disclaimer: 'Orientačný scenár, nie garantovaný výnos ani vyúčtovanie. Nezahŕňa hypotéku, daň z príjmu ani nezadané náklady. Obsadenosť a náklady sú predpoklady. Jeden mesiac nepredpovedá ročný výsledok.',
      settings: { center: 'centrum', outside: 'mimo centra', comfort: 'komfortný štandard', premium: 'prémiový štandard', basic: 'základný štandard' }
    },
    en: {
      title: 'Your apartment’s potential', kicker: 'YOUR PERSONAL SCENARIO', prepared: 'Prepared for', date: 'Created',
      net: 'Modelled monthly balance after the entered costs', period: '30-day scenario',
      metrics: ['Price per occupied night', 'Occupancy of available nights', 'Occupied nights'],
      profile: 'Your apartment', bedrooms: 'Bedrooms', guests: 'Guest capacity', area: 'Floor area',
      breakdown: 'Income and costs', rows: ['Modelled gross revenue', 'Platform fees', 'Modelled Rental Income', 'Management · 17%', 'VAT · 5% of Rental Income', 'Total cleaning costs', 'Cleaning payments from guests', 'Guesty / month', 'Other entered costs', 'Modelled monthly balance'],
      assumptions: 'Assumptions', stay: 'Average stay', nights: 'nights', own: 'Personal / blocked nights', bookings: 'Modelled bookings',
      source: 'Evidence and scope', noEvidence: 'Comparable-apartment evidence was not supplied. The values are scenario assumptions.',
      disclaimer: 'An indicative scenario, not a guaranteed return or a statement. Excludes mortgage payments, income tax and costs not entered. Occupancy and costs are assumptions. One month does not predict annual results.',
      settings: { center: 'city centre', outside: 'outside the centre', comfort: 'comfort standard', premium: 'premium standard', basic: 'basic standard' }
    },
    de: {
      title: 'Das Potenzial Ihrer Wohnung', kicker: 'IHR INDIVIDUELLES SZENARIO', prepared: 'Erstellt für', date: 'Erstellt am',
      net: 'Modellierter Monatssaldo nach den eingegebenen Kosten', period: 'Szenario für 30 Tage',
      metrics: ['Preis je belegter Nacht', 'Auslastung verfügbarer Nächte', 'Belegte Nächte'],
      profile: 'Ihre Wohnung', bedrooms: 'Schlafzimmer', guests: 'Gästekapazität', area: 'Wohnfläche',
      breakdown: 'Einnahmen und Kosten', rows: ['Modellierter Bruttoumsatz', 'Portalgebühren', 'Modelliertes Rental Income', 'Verwaltung · 17 %', 'MwSt. · 5 % des Rental Income', 'Reinigungskosten gesamt', 'Reinigungszahlungen der Gäste', 'Guesty / Monat', 'Weitere eingegebene Kosten', 'Modellierter Monatssaldo'],
      assumptions: 'Annahmen', stay: 'Durchschnittliche Aufenthaltsdauer', nights: 'Nächte', own: 'Eigene / gesperrte Nächte', bookings: 'Modellierte Buchungen',
      source: 'Datengrundlage und Umfang', noEvidence: 'Es wurden keine Vergleichsdaten beigefügt. Die Werte sind Annahmen des Szenarios.',
      disclaimer: 'Unverbindliches Szenario, keine garantierte Rendite oder Abrechnung. Ohne Hypothek, Einkommensteuer und nicht eingegebene Kosten. Auslastung und Kosten sind Annahmen. Ein Monat erlaubt keine Jahresprognose.',
      settings: { center: 'Stadtzentrum', outside: 'außerhalb des Zentrums', comfort: 'Komfortstandard', premium: 'Premiumstandard', basic: 'Basisstandard' }
    },
    es: {
      title: 'El potencial de su apartamento', kicker: 'SU ESCENARIO PERSONALIZADO', prepared: 'Preparado para', date: 'Creado el',
      net: 'Saldo mensual estimado después de los gastos introducidos', period: 'Escenario de 30 días',
      metrics: ['Precio por noche ocupada', 'Ocupación de noches disponibles', 'Noches ocupadas'],
      profile: 'Su apartamento', bedrooms: 'Dormitorios', guests: 'Capacidad de huéspedes', area: 'Superficie',
      breakdown: 'Ingresos y gastos', rows: ['Ingresos brutos estimados', 'Comisiones de los portales', 'Rental Income estimado', 'Gestión · 17 %', 'IVA · 5 % del Rental Income', 'Limpieza total', 'Limpieza pagada por los huéspedes', 'Guesty / mes', 'Otros gastos introducidos', 'Saldo mensual estimado'],
      assumptions: 'Supuestos', stay: 'Estancia media', nights: 'noches', own: 'Noches propias / bloqueadas', bookings: 'Reservas estimadas',
      source: 'Datos de referencia y alcance', noEvidence: 'No se han adjuntado datos de apartamentos comparables. Los valores son supuestos del escenario.',
      disclaimer: 'Escenario orientativo, no una rentabilidad garantizada ni una liquidación. Excluye hipoteca, impuesto sobre la renta y gastos no introducidos. La ocupación y los gastos son supuestos. Un mes no predice el resultado anual.',
      settings: { center: 'centro', outside: 'fuera del centro', comfort: 'nivel confort', premium: 'nivel prémium', basic: 'nivel básico' }
    },
    pl: {
      title: 'Potencjał Twojego mieszkania', kicker: 'TWÓJ INDYWIDUALNY SCENARIUSZ', prepared: 'Przygotowano dla', date: 'Utworzono',
      net: 'Modelowe saldo miesięczne po wprowadzonych kosztach', period: 'Scenariusz na 30 dni',
      metrics: ['Cena za zajętą noc', 'Obłożenie dostępnych nocy', 'Zajęte noce'],
      profile: 'Twoje mieszkanie', bedrooms: 'Sypialnie', guests: 'Maks. liczba gości', area: 'Powierzchnia',
      breakdown: 'Przychody i koszty', rows: ['Modelowy przychód brutto', 'Opłaty portali', 'Modelowy Rental Income', 'Zarządzanie · 17%', 'VAT · 5% Rental Income', 'Łączne koszty sprzątania', 'Opłaty za sprzątanie od gości', 'Guesty / miesiąc', 'Inne wprowadzone koszty', 'Modelowe saldo miesięczne'],
      assumptions: 'Założenia', stay: 'Średnia długość pobytu', nights: 'nocy', own: 'Własne / zablokowane noce', bookings: 'Modelowa liczba rezerwacji',
      source: 'Dane źródłowe i zakres', noEvidence: 'Nie dołączono danych porównywalnych mieszkań. Wartości są założeniami scenariusza.',
      disclaimer: 'Scenariusz orientacyjny, nie gwarantowany zwrot ani rozliczenie. Bez rat kredytu, podatku dochodowego i niewprowadzonych kosztów. Obłożenie i koszty są założeniami. Jeden miesiąc nie prognozuje wyniku rocznego.',
      settings: { center: 'centrum', outside: 'poza centrum', comfort: 'standard komfortowy', premium: 'standard premium', basic: 'standard podstawowy' }
    },
    cs: {
      title: 'Potenciál vašeho bytu', kicker: 'VÁŠ INDIVIDUÁLNÍ SCÉNÁŘ', prepared: 'Připraveno pro', date: 'Vytvořeno',
      net: 'Modelový měsíční zůstatek po zadaných nákladech', period: 'Scénář na 30 dní',
      metrics: ['Cena za obsazenou noc', 'Obsazenost dostupných nocí', 'Obsazené noci'],
      profile: 'Váš byt', bedrooms: 'Ložnice', guests: 'Kapacita hostů', area: 'Plocha',
      breakdown: 'Příjmy a náklady', rows: ['Modelové tržby', 'Poplatky portálů', 'Modelový Rental Income', 'Správa · 17 %', 'DPH · 5 % z Rental Income', 'Úklid celkem', 'Úhrady úklidu od hostů', 'Guesty / měsíc', 'Další zadané náklady', 'Modelový měsíční zůstatek'],
      assumptions: 'Předpoklady', stay: 'Průměrná délka pobytu', nights: 'nocí', own: 'Vlastní / blokované noci', bookings: 'Modelový počet rezervací',
      source: 'Podklady a rozsah', noEvidence: 'Podklady ke srovnatelným bytům nebyly přiloženy. Hodnoty jsou předpoklady scénáře.',
      disclaimer: 'Orientační scénář, nikoli garantovaný výnos nebo vyúčtování. Nezahrnuje hypotéku, daň z příjmů ani nezadané náklady. Obsazenost a náklady jsou předpoklady. Jeden měsíc nepředpovídá roční výsledek.',
      settings: { center: 'centrum', outside: 'mimo centrum', comfort: 'komfortní standard', premium: 'prémiový standard', basic: 'základní standard' }
    }
  };
  const costAssumptions = {
    sk: ['Hostia / rezervácia', 'Upratovanie / pobyt', 'Úhrada hosťa / pobyt', 'Portály'],
    en: ['Guests / booking', 'Cleaning / stay', 'Guest contribution / stay', 'Platforms'],
    de: ['Gäste / Buchung', 'Reinigung / Aufenthalt', 'Gästebeitrag / Aufenthalt', 'Portale'],
    es: ['Huéspedes / reserva', 'Limpieza / estancia', 'Aporte del huésped / estancia', 'Portales'],
    pl: ['Goście / rezerwacja', 'Sprzątanie / pobyt', 'Wpłata gościa / pobyt', 'Portale'],
    cs: ['Hosté / rezervace', 'Úklid / pobyt', 'Úhrada hosta / pobyt', 'Portály']
  };
  const assetCache = new Map();
  async function asset(path) {
    if (!assetCache.has(path)) {
      const task = fetch(new URL(path, assetsURL).href, { credentials: 'same-origin' }).then(response => {
        if (!response.ok) throw new Error('Report asset unavailable: ' + path);
        return response.arrayBuffer();
      }).catch(error => { assetCache.delete(path); throw error; });
      assetCache.set(path, task);
    }
    return assetCache.get(path);
  }
  function base64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
    return btoa(binary);
  }
  function clean(value) { return String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function number(value, key) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError('Invalid report value: ' + key);
    return value;
  }
  window.liveinBuildReport = async function (snapshot, contact, locale) {
    const langKey = String(locale || document.documentElement.lang || 'sk').toLowerCase().split('-')[0];
    const lang = langKey === 'cz' ? 'cs' : (copy[langKey] ? langKey : 'sk');
    const t = copy[lang], intl = locales[lang];
    if (!snapshot || !snapshot.values || !snapshot.result || !snapshot.profile) throw new TypeError('A complete calculator snapshot is required.');
    const profile = snapshot.profile, v = snapshot.values, r = snapshot.result;
    for (const key of ['gross', 'portal', 'income', 'management', 'vat', 'cleanGross', 'cleanRecovery', 'net', 'nights', 'bookings']) number(r[key], key);
    for (const key of ['adr', 'occupancy', 'own', 'stay', 'fixed', 'avgGuests', 'clean', 'cleanPaid', 'portal']) number(v[key], key);
    const date = new Date(snapshot.createdAt);
    if (!Number.isFinite(date.getTime())) throw new TypeError('A valid snapshot date is required.');
    const PDF = window.jspdf && window.jspdf.jsPDF;
    if (!PDF) throw new Error('The PDF library is not loaded.');
    const [regular, bold, logo] = await Promise.all([asset('fonts/report-regular.ttf'), asset('fonts/report-bold.ttf'), asset('logo-transparent.png')]);
    const doc = new PDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true });
    doc.addFileToVFS('LiveinRegular.ttf', base64(regular));
    doc.addFileToVFS('LiveinBold.ttf', base64(bold));
    doc.addFont('LiveinRegular.ttf', 'Livein', 'normal');
    doc.addFont('LiveinBold.ttf', 'Livein', 'bold');
    doc.setFont('Livein', 'normal');
    doc.setProperties({ title: 'LIVE-IN · ' + t.title, subject: t.period, author: 'LIVE-IN International', creator: 'LIVE-IN calculator' });
    if (doc.setLanguage) doc.setLanguage(intl);
    const C = { green: '#173e2c', cream: '#f6f2ea', accent: '#b86529', muted: '#5d685e', line: '#d9dfd3', white: '#ffffff' };
    const money = value => new Intl.NumberFormat(intl, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Object.is(value, -0) ? 0 : value).replace(/[\u00a0\u202f]/g, ' ');
    const decimal = (value, digits = 1) => new Intl.NumberFormat(intl, { maximumFractionDigits: digits }).format(value).replace(/[\u00a0\u202f]/g, ' ');
    function text(value, x, y, size, options) {
      options = options || {};
      doc.setFont('Livein', options.bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      doc.setTextColor(options.color || C.green);
      doc.text(clean(value), x, y, { align: options.align || 'left', baseline: 'alphabetic' });
    }
    function paragraph(value, x, y, width, maxHeight, size, minSize, color) {
      doc.setFont('Livein', 'normal');
      let lines, lineHeight;
      do {
        doc.setFontSize(size);
        lines = doc.splitTextToSize(clean(value), width);
        lineHeight = size * 0.352778 * 1.32;
        if (lines.length * lineHeight <= maxHeight) break;
        size -= 0.2;
      } while (size >= minSize);
      if (lines.length * lineHeight > maxHeight) throw new RangeError('Report text exceeds one-page layout.');
      doc.setTextColor(color || C.muted);
      doc.text(lines, x, y, { lineHeightFactor: 1.32 });
      return lines.length * lineHeight;
    }
    function fitted(value, x, y, width, size, options) {
      doc.setFont('Livein', options && options.bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      while (doc.getTextWidth(clean(value)) > width && size > 7) { size -= 0.25; doc.setFontSize(size); }
      text(value, x, y, size, options);
    }
    const logoBytes = new Uint8Array(logo);
    const image = doc.getImageProperties(logoBytes);
    const logoWidth = 36, logoHeight = logoWidth * image.height / image.width;
    doc.setFillColor(C.cream); doc.rect(0, 0, 210, 297, 'F');
    doc.addImage(logoBytes, 'PNG', 16, 9, logoWidth, logoHeight);
    text(t.date + ' ' + new Intl.DateTimeFormat(intl, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Bratislava' }).format(date), 194, 18, 8, { align: 'right', color: C.muted });
    doc.setDrawColor(C.line); doc.line(16, 33, 194, 33);
    text(t.kicker, 16, 41, 8, { bold: true, color: C.accent });
    fitted(t.title, 16, 51, 178, 22, { bold: true });
    const name = clean(contact && contact.name);
    fitted(name ? t.prepared + ' ' + name : t.period, 16, 57, 178, 8.5, { color: C.muted });
    doc.setFillColor(C.green); doc.roundedRect(16, 62, 178, 33, 3, 3, 'F');
    paragraph(t.net, 22, 69, 161, 8, 9, 8, C.white);
    fitted(money(r.net), 22, 86, 127, 28, { bold: true, color: C.white });
    fitted(t.period, 188, 89, 47, 7.5, { align: 'right', color: '#e4eadf' });
    const metricValues = [money(v.adr), decimal(v.occupancy) + ' %', decimal(r.nights)];
    for (let i = 0; i < 3; i++) {
      const x = 16 + i * 61;
      doc.setFillColor(C.white); doc.roundedRect(x, 100, 56, 23, 2, 2, 'F');
      paragraph(t.metrics[i], x + 4, 106, 48, 7, 7.1, 6.6, C.muted);
      fitted(metricValues[i], x + 4, 117, 48, 14, { bold: true });
    }
    text(t.profile, 16, 131, 10, { bold: true });
    const city = { bratislava: 'Bratislava', kosice: 'Košice', trnava: 'Trnava', presov: 'Prešov' }[clean(profile.city).toLowerCase()] || clean(profile.city);
    const settingsKeys = { 'Centrum': 'center', 'V centre': 'center', 'center': 'center', 'centre': 'center', 'Mimo centra': 'outside', 'outside': 'outside', 'Komfortný': 'comfort', 'comfort': 'comfort', 'Prémiový': 'premium', 'premium': 'premium', 'Základný': 'basic', 'basic': 'basic' };
    const setting = value => t.settings[settingsKeys[clean(value)]] || clean(value);
    const profileLine = [city, t.bedrooms + ': ' + clean(profile.bedrooms), t.area + ': ' + clean(profile.area) + ' m²', t.guests + ': ' + clean(profile.guests)].join('  ·  ');
    paragraph(profileLine, 16, 137, 178, 7.5, 8.3, 7.4);
    fitted([setting(profile.location), setting(profile.standard)].filter(Boolean).join(' · '), 16, 146, 178, 8, { color: C.muted });
    text(t.breakdown, 16, 156, 10, { bold: true });
    const rows = [r.gross, -r.portal, r.income, -r.management, -r.vat, -r.cleanGross, r.cleanRecovery, -50, -v.fixed, r.net];
    rows.forEach((amount, i) => {
      const y = 164 + i * 5.25;
      const total = i === rows.length - 1;
      if (total) { doc.setFillColor('#e6ecdf'); doc.roundedRect(16, y - 3.8, 178, 7, 1, 1, 'F'); }
      else if (i === 2) { doc.setDrawColor(C.line); doc.line(16, y - 4.2, 194, y - 4.2); }
      fitted(t.rows[i], 20, y, 123, 8.4, { bold: total || i === 2 });
      text(money(amount), 190, y, 8.6, { align: 'right', bold: total || i === 2 });
    });
    text(t.assumptions, 16, 224, 8.4, { bold: true, color: C.accent });
    paragraph(t.stay + ': ' + decimal(v.stay, 2) + ' ' + t.nights + ' · ' + t.own + ': ' + decimal(v.own) + ' · ' + t.bookings + ': ' + decimal(r.bookings, 2), 16, 229, 178, 9, 7.4, 6.8);
    const a = costAssumptions[lang];
    paragraph(a[0] + ': ' + decimal(v.avgGuests, 2) + ' · ' + a[1] + ': ' + money(v.clean) + ' · ' + a[2] + ': ' + money(v.cleanPaid) + ' · ' + a[3] + ': ' + decimal(v.portal, 2) + ' %', 16, 235, 178, 7, 7.2, 6.5);
    text(t.source, 16, 243, 8.4, { bold: true, color: C.accent });
    paragraph(clean(snapshot.evidence) || t.noEvidence, 16, 248, 178, 24, 7.3, 6.5);
    doc.setDrawColor(C.line); doc.line(16, 275, 194, 275);
    paragraph(t.disclaimer, 16, 280, 178, 10, 7, 6.5, C.green);
    text('LIVE-IN International', 16, 293, 7, { bold: true });
    text('live-in.international · 1 / 1', 194, 293, 7, { align: 'right', color: C.muted });
    return doc;
  };
})();
