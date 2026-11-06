// Kalkulačka výnosnosti pre Varšavu: výpočet (čisté funkcie, bez DOM), východiská a texty v 3 jazykoch.
// Všetky sumy vnútri sú v PLN; prepočet na EUR je len zobrazenie.

export const RATE_DEFAULT = 4.3 // PLN za 1 EUR (NBP, jeseň 2026 ~4,25–4,30); v kalkulačke sa dá zmeniť

// Východiská z trhu (Varšava 2025/26: obsadenosť 65–68 %, 360–430 PLN/noc) a z nákladov LIVE-IN na Slovensku prepočítaných kurzom.
export const DISTRICTS = [
  { id: 'center', mult: 1.12, rentMult: 1.12 },  // Śródmieście, Powiśle, Stare Miasto
  { id: 'near', mult: 1.0, rentMult: 1.0 },      // Mokotów, Wola, Żoliborz, Ochota, Praga-Północ
  { id: 'other', mult: 0.85, rentMult: 0.88 },   // ostatné štvrte
]
export const BEDROOMS = [
  { id: 0, adr: 330, rent: 3000, clean: 140, m2: 30 },  // štúdio
  { id: 1, adr: 420, rent: 4000, clean: 160, m2: 45 },  // 1 spálňa (2 izby)
  { id: 2, adr: 560, rent: 5400, clean: 200, m2: 65 },  // 2 spálne (3 izby)
  { id: 3, adr: 720, rent: 7200, clean: 240, m2: 90 },  // 3 spálne
]
export const STANDARDS = [{ id: 'premium', mult: 1.15 }, { id: 'comfort', mult: 1 }, { id: 'basic', mult: 0.88 }]

/** Predvolené vstupy pre profil bytu. */
export function defaults({ district = 'near', bedrooms = 1, standard = 'comfort' } = {}) {
  const d = DISTRICTS.find((x) => x.id === district) || DISTRICTS[1]
  const b = BEDROOMS.find((x) => x.id === Number(bedrooms)) || BEDROOMS[1]
  const s = STANDARDS.find((x) => x.id === standard) || STANDARDS[1]
  return {
    district, bedrooms: b.id, standard, area: b.m2,
    adr: Math.round(b.adr * d.mult * s.mult / 10) * 10,
    occupancy: 68, ownNights: 0, stay: 3.5,
    portal: 15, cleanCost: b.clean, cleanPaid: b.clean, consumables: 15, // upratovanie štandardne platí hosť (cleaning fee)
    utilities: b.id >= 2 ? 750 : 550, software: 215, reserve: 2, vat: 8, commission: 17,
    ltRent: Math.round(b.rent * d.rentMult * (s.mult >= 1.15 ? 1.1 : s.mult < 1 ? 0.93 : 1) / 50) * 50,
    ltVacancy: 1, ltCosts: 0,
    r2rRent: 0, // 0 = odvodí sa z dlhodobého nájmu (×1,05)
  }
}

const r2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100

/** Mesačný výpočet pre model správy (management). Vstupy v PLN. */
export function management(v) {
  const nights = Math.max(0, (30 - v.ownNights) * v.occupancy / 100)
  const bookings = v.stay > 0 ? nights / v.stay : 0
  const gross = r2(nights * v.adr)
  const portal = r2(gross * v.portal / 100)
  const income = r2(gross - portal)
  const vat = r2(income * v.vat / 100)
  const commission = r2(income * v.commission / 100)
  const cleaning = r2(bookings * Math.max(0, v.cleanCost - v.cleanPaid))
  const consumables = r2(bookings * v.consumables)
  const reserve = r2(income * v.reserve / 100)
  const utilities = r2(v.utilities), software = r2(v.software)
  const costs = r2(vat + commission + cleaning + consumables + reserve + utilities + software)
  const owner = r2(income - costs)
  return { nights, bookings, gross, portal, income, vat, commission, cleaning, consumables, reserve, utilities, software, costs, owner, annual: r2(owner * 12) }
}

/** Dlhodobý prenájom z pohľadu majiteľa: nájom mínus neobsadenosť a vlastné náklady. */
export function longTerm(v) {
  const monthly = r2(v.ltRent * (12 - v.ltVacancy) / 12 - v.ltCosts)
  return { rent: v.ltRent, monthly, annual: r2(monthly * 12) }
}

/** Rent-to-rent: LIVE-IN je nájomca, majiteľ dostáva pevný nájom. Interný pohľad = marža LIVE-IN. */
export function rentToRent(v) {
  const rent = v.r2rRent > 0 ? v.r2rRent : Math.round(v.ltRent * 1.05 / 50) * 50
  const m = management({ ...v, commission: 0 })
  const margin = r2(m.income - m.vat - m.cleaning - m.consumables - m.reserve - m.utilities - m.software - rent)
  return { rent, ownerMonthly: rent, ownerAnnual: r2(rent * 12), margin, marginPct: m.income ? r2(margin / m.income * 100) : 0, revenue: m.income }
}

/** Porovnanie s dlhodobým prenájmom (v %). */
export function uplift(ownerMonthly, ltMonthly) {
  if (!ltMonthly) return null
  return r2((ownerMonthly - ltMonthly) / ltMonthly * 100)
}

/** Obsadenosť, pri ktorej správa dáva majiteľovi o `target` % viac než dlhodobý prenájom (alebo null, ak sa nedá do 100 %). */
export function occupancyFor(v, target = 20) {
  const need = longTerm(v).monthly * (1 + target / 100)
  for (let o = 1; o <= 100; o++) { if (management({ ...v, occupancy: o }).owner >= need) return o }
  return null
}

export const CURRENCIES = { PLN: { code: 'PLN', symbol: 'zł' }, EUR: { code: 'EUR', symbol: '€' } }
export const toCur = (pln, cur, rate) => (cur === 'EUR' ? pln / rate : pln)
export const fromCur = (val, cur, rate) => (cur === 'EUR' ? val * rate : val)
export function fmtMoney(pln, cur, rate, lang = 'sk', digits = 0) {
  const loc = lang === 'pl' ? 'pl-PL' : lang === 'en' ? 'en-GB' : 'sk-SK'
  return new Intl.NumberFormat(loc, { style: 'currency', currency: cur, maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(toCur(pln, cur, rate))
}

/** Zakóduje/dekóduje scenár do URL (zdieľanie medzi kolegami). */
export function encodeState(s) { try { return btoa(unescape(encodeURIComponent(JSON.stringify(s)))) } catch { return '' } }
export function decodeState(str) { try { const o = JSON.parse(decodeURIComponent(escape(atob(str)))); return o && typeof o === 'object' ? o : null } catch { return null } }

export const T = {
  sk: {
    eyebrow: 'LIVE-IN · Varšava', h1: 'Výnosnosť bytu vo Varšave', h1em: 'spočítaná za minútu.',
    intro: 'Interný nástroj pre tím LIVE-IN. Porovnáva správu krátkodobého prenájmu, model rent-to-rent a klasický dlhodobý nájom. Výsledok sa dá uložiť ako PDF pre majiteľa.',
    s1: '01 / BYT', s1h: 'Profil bytu', s1p: 'Predvyplníme cenu za noc, upratovanie a dlhodobý nájom podľa štvrte a veľkosti. Všetko sa dá prepísať.',
    district: 'Štvrť', districts: { center: 'Centrum (Śródmieście, Powiśle, Staré Mesto)', near: 'Blízko centra (Mokotów, Wola, Żoliborz, Ochota, Praga)', other: 'Ostatné štvrte' },
    bedrooms: 'Spálne', beds: ['Štúdio', '1 spálňa (2 izby)', '2 spálne (3 izby)', '3 spálne'],
    standard: 'Štandard', standards: { premium: 'Prémiový', comfort: 'Komfortný', basic: 'Základný' }, area: 'Rozloha (m²)',
    s2: '02 / PREDPOKLADY', s2h: 'Čo ak…?', s2p: 'Posuňte čokoľvek, výsledok sa prepočíta hneď.',
    adr: 'Cena za obsadenú noc', occupancy: 'Obsadenosť', ownNights: 'Noci pre majiteľa (mesačne)', stay: 'Priemerná dĺžka pobytu (nocí)',
    costsH: 'Poplatky a prevádzkové náklady', portal: 'Poplatky platforiem (Airbnb, Booking)', cleanCost: 'Jedno upratovanie', cleanPaid: 'Upratovanie hradené hosťom (na pobyt, vo Varšave bežné)', consumables: 'Spotrebný materiál na pobyt', utilities: 'Energie, internet, czynsz (mesačne)', software: 'Softvér a kanály (mesačne)', reserve: 'Rezerva na údržbu (% z príjmu)', vat: 'DPH z ubytovania', commission: 'Provízia LIVE-IN',
    ltH: 'Dlhodobý prenájom na porovnanie', ltRent: 'Trhový mesačný nájom', ltVacancy: 'Neobsadené mesiace za rok', ltCosts: 'Náklady majiteľa pri dlhodobom nájme (mesačne)',
    r2rH: 'Rent-to-rent (LIVE-IN ako nájomca)', r2rRent: 'Pevný nájom pre majiteľa (0 = odvodiť z trhu +5 %)',
    model: 'Model', models: { mgmt: 'Správa (provízia 17 %)', r2r: 'Rent-to-rent (pevný nájom)' },
    currency: 'Mena', rate: 'Kurz PLN/€', lang: 'Jazyk PDF', internal: 'Interný pohľad (marža LIVE-IN, nie je v PDF)',
    reset: 'Obnoviť východiská', share: 'Skopírovať odkaz na scenár', shared: 'Odkaz skopírovaný', pdf: 'Stiahnuť PDF pre majiteľa', pdfHint: 'Otvorí sa tlač: vyberte „Uložiť ako PDF“.',
    resultBadge: 'ORIENTAČNÝ SCENÁR', ownerMonthly: 'Majiteľ mesačne', ownerAnnual: 'ročne', vsLt: 'oproti dlhodobému nájmu', ltMonthly: 'Dlhodobý nájom mesačne',
    band: { ok: 'V cieľovom pásme +20 až +30 %', above: 'Nad cieľovým pásmom, overte predpoklady', below: 'Pod cieľom +20 %', neg: 'Správa vychádza horšie než dlhodobý nájom' },
    needOcc: 'Obsadenosť potrebná na +20 %', needOccNo: 'nedosiahnuteľné pri týchto predpokladoch',
    breakdownH: 'Kam idú peniaze (mesačne)', rows: { gross: 'Tržby z nocí', portal: 'Poplatky platforiem', income: 'Príjem z prenájmu (Rental Income)', vat: 'DPH z ubytovania', commission: 'Provízia LIVE-IN', cleaning: 'Upratovanie a bielizeň', consumables: 'Spotrebný materiál', reserve: 'Rezerva na údržbu', utilities: 'Energie, internet, czynsz', software: 'Softvér a kanály', costs: 'Náklady spolu', owner: 'Zostatok pre majiteľa' },
    nights: 'obsadených nocí', bookings: 'rezervácií', perNight: 'za noc',
    r2rOwner: 'Pevný nájom pre majiteľa', r2rNote: 'Majiteľ dostáva pevnú sumu každý mesiac, bez ohľadu na obsadenosť. Energie, upratovanie a prevádzku hradí LIVE-IN.', margin: 'Marža LIVE-IN mesačne', marginPct: 'z príjmu',
    preparedBy: 'Pripravil', phone: 'Telefón', email: 'E-mail', owner: 'Majiteľ / byt (do PDF)', ownerPh: 'napr. p. Kowalski, ul. Marszałkowska 10',
    note: 'Modelový výpočet pred daňou z príjmu majiteľa. Východiská: trhové dáta Varšava 2025/26 (obsadenosť 65–68 %, 360–430 PLN za noc), náklady LIVE-IN prepočítané zo Slovenska. Skutočný výsledok závisí od bytu, sezóny a dohodnutého rozsahu.',
    report: { title: 'Výnosnosť bytu: krátkodobý prenájom so správou LIVE-IN', sub: 'Orientačný výpočet pre majiteľa', date: 'Dátum', property: 'Byt', assumptions: 'Predpoklady', comparison: 'Porovnanie s dlhodobým nájmom', lt: 'Dlhodobý nájom', mgmt: 'Správa LIVE-IN', r2r: 'Rent-to-rent LIVE-IN', diff: 'Rozdiel', monthly: 'mesačne', annual: 'ročne', what: 'Čo zahŕňa správa LIVE-IN', includes: ['Príprava bytu a profesionálne fotografie', 'Inzercia na Airbnb a Booking.com, dynamické ceny', 'Komunikácia s hosťami 7 dní v týždni, check-in a check-out', 'Upratovanie, bielizeň a koordinácia údržby medzi pobytmi', 'Mesačné vyúčtovanie: príjmy, náklady, obsadenosť'], next: 'Ďalší krok', nextText: 'Bezplatné posúdenie bytu a konkrétna ponuka s rozsahom služby, cenou a spôsobom vyúčtovania.', disclaimer: 'Tento dokument je orientačný model, nie ponuka ani garancia výnosu. Čísla vychádzajú z uvedených predpokladov a trhových priemerov; skutočný výsledok závisí od bytu, sezóny a dohodnutých podmienok. Sumy sú pred daňou z príjmu majiteľa.' },
  },
  pl: {
    eyebrow: 'LIVE-IN · Warszawa', h1: 'Rentowność mieszkania w Warszawie', h1em: 'policzona w minutę.',
    intro: 'Narzędzie wewnętrzne zespołu LIVE-IN. Porównuje zarządzanie najmem krótkoterminowym, model rent-to-rent i klasyczny najem długoterminowy. Wynik można zapisać jako PDF dla właściciela.',
    s1: '01 / MIESZKANIE', s1h: 'Profil mieszkania', s1p: 'Wstępnie wypełnimy cenę za dobę, sprzątanie i czynsz najmu według dzielnicy i wielkości. Wszystko można zmienić.',
    district: 'Dzielnica', districts: { center: 'Centrum (Śródmieście, Powiśle, Stare Miasto)', near: 'Blisko centrum (Mokotów, Wola, Żoliborz, Ochota, Praga)', other: 'Pozostałe dzielnice' },
    bedrooms: 'Sypialnie', beds: ['Kawalerka', '1 sypialnia (2 pokoje)', '2 sypialnie (3 pokoje)', '3 sypialnie'],
    standard: 'Standard', standards: { premium: 'Premium', comfort: 'Komfortowy', basic: 'Podstawowy' }, area: 'Powierzchnia (m²)',
    s2: '02 / ZAŁOŻENIA', s2h: 'Co jeśli…?', s2p: 'Zmień cokolwiek, wynik przeliczy się od razu.',
    adr: 'Cena za zajętą dobę', occupancy: 'Obłożenie', ownNights: 'Noce dla właściciela (miesięcznie)', stay: 'Średnia długość pobytu (nocy)',
    costsH: 'Opłaty i koszty operacyjne', portal: 'Prowizje platform (Airbnb, Booking)', cleanCost: 'Jedno sprzątanie', cleanPaid: 'Sprzątanie płacone przez gościa (za pobyt, standard)', consumables: 'Materiały eksploatacyjne na pobyt', utilities: 'Media, internet, czynsz (miesięcznie)', software: 'Oprogramowanie i kanały (miesięcznie)', reserve: 'Rezerwa na naprawy (% przychodu)', vat: 'VAT od zakwaterowania', commission: 'Prowizja LIVE-IN',
    ltH: 'Najem długoterminowy do porównania', ltRent: 'Rynkowy czynsz miesięczny', ltVacancy: 'Miesiące pustostanu w roku', ltCosts: 'Koszty właściciela przy najmie długoterminowym (miesięcznie)',
    r2rH: 'Rent-to-rent (LIVE-IN jako najemca)', r2rRent: 'Stały czynsz dla właściciela (0 = z rynku +5 %)',
    model: 'Model', models: { mgmt: 'Zarządzanie (prowizja 17 %)', r2r: 'Rent-to-rent (stały czynsz)' },
    currency: 'Waluta', rate: 'Kurs PLN/€', lang: 'Język PDF', internal: 'Widok wewnętrzny (marża LIVE-IN, nie trafia do PDF)',
    reset: 'Przywróć założenia', share: 'Kopiuj link do scenariusza', shared: 'Link skopiowany', pdf: 'Pobierz PDF dla właściciela', pdfHint: 'Otworzy się okno drukowania: wybierz „Zapisz jako PDF”.',
    resultBadge: 'SCENARIUSZ ORIENTACYJNY', ownerMonthly: 'Właściciel miesięcznie', ownerAnnual: 'rocznie', vsLt: 'względem najmu długoterminowego', ltMonthly: 'Najem długoterminowy miesięcznie',
    band: { ok: 'W docelowym przedziale +20 do +30 %', above: 'Powyżej przedziału, sprawdź założenia', below: 'Poniżej celu +20 %', neg: 'Zarządzanie wypada gorzej niż najem długoterminowy' },
    needOcc: 'Obłożenie potrzebne do +20 %', needOccNo: 'nieosiągalne przy tych założeniach',
    breakdownH: 'Gdzie trafiają pieniądze (miesięcznie)', rows: { gross: 'Przychód z noclegów', portal: 'Prowizje platform', income: 'Przychód z najmu (Rental Income)', vat: 'VAT od zakwaterowania', commission: 'Prowizja LIVE-IN', cleaning: 'Sprzątanie i pościel', consumables: 'Materiały eksploatacyjne', reserve: 'Rezerwa na naprawy', utilities: 'Media, internet, czynsz', software: 'Oprogramowanie i kanały', costs: 'Koszty razem', owner: 'Kwota dla właściciela' },
    nights: 'zajętych nocy', bookings: 'rezerwacji', perNight: 'za dobę',
    r2rOwner: 'Stały czynsz dla właściciela', r2rNote: 'Właściciel otrzymuje stałą kwotę co miesiąc, niezależnie od obłożenia. Media, sprzątanie i obsługę pokrywa LIVE-IN.', margin: 'Marża LIVE-IN miesięcznie', marginPct: 'przychodu',
    preparedBy: 'Przygotował', phone: 'Telefon', email: 'E-mail', owner: 'Właściciel / mieszkanie (do PDF)', ownerPh: 'np. p. Kowalski, ul. Marszałkowska 10',
    note: 'Model przed podatkiem dochodowym właściciela. Założenia: dane rynkowe Warszawa 2025/26 (obłożenie 65–68 %, 360–430 PLN za dobę), koszty LIVE-IN przeliczone ze Słowacji. Rzeczywisty wynik zależy od mieszkania, sezonu i uzgodnionego zakresu.',
    report: { title: 'Rentowność mieszkania: najem krótkoterminowy z zarządzaniem LIVE-IN', sub: 'Orientacyjna kalkulacja dla właściciela', date: 'Data', property: 'Mieszkanie', assumptions: 'Założenia', comparison: 'Porównanie z najmem długoterminowym', lt: 'Najem długoterminowy', mgmt: 'Zarządzanie LIVE-IN', r2r: 'Rent-to-rent LIVE-IN', diff: 'Różnica', monthly: 'miesięcznie', annual: 'rocznie', what: 'Co obejmuje zarządzanie LIVE-IN', includes: ['Przygotowanie mieszkania i profesjonalne zdjęcia', 'Oferty na Airbnb i Booking.com, dynamiczne ceny', 'Komunikacja z gośćmi 7 dni w tygodniu, zameldowanie i wymeldowanie', 'Sprzątanie, pościel i koordynacja napraw między pobytami', 'Miesięczne rozliczenie: przychody, koszty, obłożenie'], next: 'Następny krok', nextText: 'Bezpłatna ocena mieszkania i konkretna oferta z zakresem usługi, ceną i sposobem rozliczenia.', disclaimer: 'Dokument jest modelem orientacyjnym, nie ofertą ani gwarancją przychodu. Liczby wynikają z podanych założeń i średnich rynkowych; rzeczywisty wynik zależy od mieszkania, sezonu i uzgodnionych warunków. Kwoty przed podatkiem dochodowym właściciela.' },
  },
  en: {
    eyebrow: 'LIVE-IN · Warsaw', h1: 'Warsaw apartment returns', h1em: 'calculated in a minute.',
    intro: 'Internal LIVE-IN tool. Compares short-term rental management, the rent-to-rent model and a classic long-term lease. The result can be saved as a PDF for the owner.',
    s1: '01 / APARTMENT', s1h: 'Apartment profile', s1p: 'We prefill nightly rate, cleaning and long-term rent by district and size. Everything can be changed.',
    district: 'District', districts: { center: 'City centre (Śródmieście, Powiśle, Old Town)', near: 'Near centre (Mokotów, Wola, Żoliborz, Ochota, Praga)', other: 'Other districts' },
    bedrooms: 'Bedrooms', beds: ['Studio', '1 bedroom', '2 bedrooms', '3 bedrooms'],
    standard: 'Standard', standards: { premium: 'Premium', comfort: 'Comfort', basic: 'Basic' }, area: 'Area (m²)',
    s2: '02 / ASSUMPTIONS', s2h: 'What if…?', s2p: 'Move anything, the result updates instantly.',
    adr: 'Rate per occupied night', occupancy: 'Occupancy', ownNights: 'Owner nights (per month)', stay: 'Average stay (nights)',
    costsH: 'Fees and operating costs', portal: 'Platform fees (Airbnb, Booking)', cleanCost: 'One cleaning', cleanPaid: 'Cleaning paid by guest (per stay, standard in Warsaw)', consumables: 'Consumables per stay', utilities: 'Utilities, internet, building fee (monthly)', software: 'Software and channels (monthly)', reserve: 'Maintenance reserve (% of income)', vat: 'VAT on accommodation', commission: 'LIVE-IN commission',
    ltH: 'Long-term lease for comparison', ltRent: 'Market monthly rent', ltVacancy: 'Vacant months per year', ltCosts: "Owner's costs under long-term lease (monthly)",
    r2rH: 'Rent-to-rent (LIVE-IN as tenant)', r2rRent: 'Fixed rent to owner (0 = market +5 %)',
    model: 'Model', models: { mgmt: 'Management (17 % commission)', r2r: 'Rent-to-rent (fixed rent)' },
    currency: 'Currency', rate: 'Rate PLN/€', lang: 'PDF language', internal: 'Internal view (LIVE-IN margin, not in PDF)',
    reset: 'Reset defaults', share: 'Copy scenario link', shared: 'Link copied', pdf: 'Download PDF for owner', pdfHint: 'The print dialog opens: choose “Save as PDF”.',
    resultBadge: 'INDICATIVE SCENARIO', ownerMonthly: 'Owner per month', ownerAnnual: 'per year', vsLt: 'vs. long-term lease', ltMonthly: 'Long-term lease per month',
    band: { ok: 'Within the +20 to +30 % target band', above: 'Above the target band, verify assumptions', below: 'Below the +20 % target', neg: 'Management is worse than a long-term lease' },
    needOcc: 'Occupancy needed for +20 %', needOccNo: 'not reachable with these assumptions',
    breakdownH: 'Where the money goes (monthly)', rows: { gross: 'Nightly revenue', portal: 'Platform fees', income: 'Rental Income', vat: 'VAT on accommodation', commission: 'LIVE-IN commission', cleaning: 'Cleaning and linen', consumables: 'Consumables', reserve: 'Maintenance reserve', utilities: 'Utilities, internet, building fee', software: 'Software and channels', costs: 'Total costs', owner: 'Owner payout' },
    nights: 'occupied nights', bookings: 'bookings', perNight: 'per night',
    r2rOwner: 'Fixed rent to owner', r2rNote: 'The owner receives a fixed amount every month regardless of occupancy. Utilities, cleaning and operations are paid by LIVE-IN.', margin: 'LIVE-IN margin per month', marginPct: 'of income',
    preparedBy: 'Prepared by', phone: 'Phone', email: 'E-mail', owner: 'Owner / apartment (for PDF)', ownerPh: 'e.g. Mr Kowalski, Marszałkowska 10',
    note: 'Model before the owner’s income tax. Assumptions: Warsaw market data 2025/26 (occupancy 65–68 %, PLN 360–430 per night), LIVE-IN costs converted from Slovakia. Actual results depend on the apartment, season and agreed scope.',
    report: { title: 'Apartment returns: short-term rental with LIVE-IN management', sub: 'Indicative calculation for the owner', date: 'Date', property: 'Apartment', assumptions: 'Assumptions', comparison: 'Comparison with long-term lease', lt: 'Long-term lease', mgmt: 'LIVE-IN management', r2r: 'LIVE-IN rent-to-rent', diff: 'Difference', monthly: 'per month', annual: 'per year', what: 'What LIVE-IN management includes', includes: ['Apartment preparation and professional photos', 'Listings on Airbnb and Booking.com, dynamic pricing', 'Guest communication 7 days a week, check-in and check-out', 'Cleaning, linen and maintenance coordination between stays', 'Monthly statement: income, costs, occupancy'], next: 'Next step', nextText: 'Free apartment assessment and a concrete offer with scope, price and settlement method.', disclaimer: 'This document is an indicative model, not an offer or a guarantee of income. Figures derive from the stated assumptions and market averages; actual results depend on the apartment, season and agreed terms. Amounts are before the owner’s income tax.' },
  },
}

/* ---------- Rent-to-rent: návratnosť pre agenta ---------- */
/** Prevádzkový výsledok LIVE-IN ako nájomcu (bez provízie), vstupy v PLN. */
export function r2rOperating(v) {
  const m = management({ ...v, commission: 0 })
  const operating = r2(m.income - m.vat - m.cleaning - m.consumables - m.reserve - m.utilities - m.software)
  return { ...m, operating }
}
/** Rent-to-rent s investíciou: marža, návratnosť vstupnej investície, bod zvratu. */
export function r2rReturn(v) {
  const o = r2rOperating(v)
  const rent = v.r2rRent > 0 ? v.r2rRent : Math.round(v.ltRent * 1.05 / 50) * 50
  const margin = r2(o.operating - rent)
  const invest = r2((v.setup || 0) + rent * (v.deposit || 0) + (v.agentFee || 0))
  const payback = margin > 0 ? Math.ceil(invest / margin) : null
  const marginPct = o.income ? r2(margin / o.income * 100) : 0
  const annual = r2(margin * 12)
  const roi = invest > 0 ? r2(annual / invest * 100) : null
  return { ...o, rent, margin, marginPct, annual, invest, payback, roi }
}
/** Obsadenosť, pri ktorej je marža nulová (bod zvratu), alebo null. */
export function breakEvenOccupancy(v) {
  for (let o = 0; o <= 100; o++) { if (r2rReturn({ ...v, occupancy: o }).margin >= 0) return o }
  return null
}
/** Najvyšší nájom pre majiteľa, pri ktorom ostane cieľová marža (% z príjmu). */
export function maxRentFor(v, targetPct = 25) {
  const o = r2rOperating(v)
  return Math.max(0, Math.floor((o.operating - o.income * targetPct / 100) / 50) * 50)
}
/** Citlivosť marže: obsadenosť × cena za noc. */
export function sensitivity(v, occs = [50, 60, 70, 80], adrs = [-10, 0, 10]) {
  return occs.map((occ) => ({ occ, cells: adrs.map((d) => ({ d, margin: r2rReturn({ ...v, occupancy: occ, adr: Math.round(v.adr * (1 + d / 100)) }).margin })) }))
}
export function r2rDefaults(profile) { const d = defaults(profile); return { ...d, r2rRent: Math.round(d.ltRent * 1.05 / 50) * 50, deposit: 1, setup: d.bedrooms >= 2 ? 25000 : 15000, agentFee: 0 } }

/* ---------- Texty: sprievodca pre agenta a rent-to-rent ---------- */
export const TG = {
  sk: {
    agentOn: 'Režim agenta', agentOff: 'Pohľad majiteľa', agentHint: 'Majiteľ vidí len kalkulačku a PDF. Sprievodca a interné polia sú len pre teba.',
    ownerLink: 'Skopírovať odkaz pre majiteľa', ownerLinkDone: 'Odkaz pre majiteľa skopírovaný (bez interných častí)',
    guideH: 'Ako to vysvetliť majiteľovi', guideP: 'Postup rozhovoru s číslami z tohto scenára. Hovor v jeho číslach, nie v percentách.',
    steps: [
      ['Otvorenie (30 sekúnd)', 'Nehovorte o Airbnb, hovorte o jeho byte: „Váš byt v {district} dnes pri dlhodobom nájme prinesie okolo {lt} mesačne. Chcem Vám ukázať, koľko môže priniesť so správou LIVE-IN a kam presne idú peniaze.“'],
      ['Ukážte hrubé tržby a hneď ich znížte', 'Majiteľ neverí vysokým číslam. Povedzte: „Pri {occ} % obsadenosti a {adr} za noc sú tržby {gross}. To nie je Váš zisk. Odpočítame poplatky platforiem, DPH, prevádzku a našu províziu.“ Potom ukážte riadok po riadku tabuľku Kam idú peniaze.'],
      ['Zostatok pre majiteľa', '„Po všetkých nákladoch Vám ostane {owner} mesačne, {annual} ročne. To je {uplift} oproti dlhodobému nájmu.“ Ak je rozdiel pod 20 %, nepreháňajte: povedzte, že pri tomto byte je to menej, a ukážte, pri akej obsadenosti by to bolo +20 % ({need}).'],
      ['Naša provízia', '„Provízia je {commission} z príjmu z prenájmu, nie z Vášho zostatku. Platíte ju len z toho, čo byt naozaj zarobí. Keď byt nezarába, nezarábame ani my.“ Toto je najsilnejší argument proti strachu z poplatkov.'],
      ['Čo za to dostane', 'Prečítajte zoznam: príprava a fotografie, inzercia na Airbnb a Booking, dynamické ceny, hostia 7 dní v týždni, upratovanie a bielizeň, mesačné vyúčtovanie. „Vy nerobíte nič. Dostanete peniaze a výpis.“'],
      ['Uzavretie', 'Nepýtajte sa „chcete?“. Dajte ďalší krok: „Pošlem Vám tento výpočet v PDF a prídem byt pozrieť, aby sme čísla spresnili. Hodí sa Vám utorok alebo štvrtok?“ Posúdenie je bezplatné a nezáväzné.'],
    ],
    objH: 'Námietky majiteľov a odpovede',
    objections: [
      ['„17 % je veľa.“', 'Porovnajte zostatok, nie percento: {owner} so správou oproti {lt} pri dlhodobom nájme. Provízia je už v tomto čísle odpočítaná.'],
      ['„Hostia mi zničia byt.“', 'Overení hostia cez platformy, kódové zámky, fotodokumentácia po každom pobyte, rezerva na údržbu je vo výpočte. Dlhodobý nájomník je v byte 12 mesiacov bez kontroly, hostia odchádzajú po {stay} nociach a byt sa upratuje po každom.'],
      ['„Čo keď bude nízka sezóna?“', 'Ukážte posuvník obsadenosti: „Pri {needOcc} obsadenosti ste stále na +20 %. Varšava má celoročný dopyt, trh je na 65 až 68 %.“ Nesľubujte obsadenosť, ukážte citlivosť.'],
      ['„Chcem byt občas používať.“', 'Nastavte Noci pre majiteľa a ukážte nový výsledok. Pri dlhodobom nájme byt používať nemôže vôbec.'],
      ['„Musím doplniť vybavenie.“', 'Pravda. Povedzte, čo chýba, a ukážte, za koľko mesiacov rozdiel oproti dlhodobému nájmu ({diff} mesačne) investíciu vráti.'],
      ['„Dane a DPH?“', 'Vo výpočte je DPH {vat}. Daň z príjmu je rovnaká téma pri oboch modeloch, odporučte účtovníka, nehádajte.'],
      ['„Ešte si to rozmyslím.“', 'V poriadku. Pošlite PDF a odkaz na kalkulačku, nech si posúva čísla sám, a dohodnite termín, kedy zavoláte. Zapíšte do CRM.'],
    ],
    never: 'Nesľubujte konkrétny výnos ani obsadenosť, vždy „orientačný model“. Nezľavujte z provízie a nesľubujte fixný nájom, to rozhoduje vedenie. Výšku nájmu pre rent-to-rent s majiteľom neriešte v tejto kalkulačke.',
    sendH: 'Čo poslať majiteľovi', send: ['PDF z tohto scenára (tlačidlo Stiahnuť PDF).', 'Odkaz pre majiteľa, kde si môže posúvať čísla sám.', 'Krátky e-mail: 3 vety, číslo zostatku, rozdiel oproti dlhodobému nájmu, termín obhliadky.'],
  },
  pl: {
    agentOn: 'Tryb agenta', agentOff: 'Widok właściciela', agentHint: 'Właściciel widzi tylko kalkulator i PDF. Przewodnik i pola wewnętrzne są tylko dla Ciebie.',
    ownerLink: 'Kopiuj link dla właściciela', ownerLinkDone: 'Link dla właściciela skopiowany (bez części wewnętrznych)',
    guideH: 'Jak to wytłumaczyć właścicielowi', guideP: 'Przebieg rozmowy z liczbami z tego scenariusza. Mów jego liczbami, nie procentami.',
    steps: [
      ['Otwarcie (30 sekund)', 'Nie mów o Airbnb, mów o jego mieszkaniu: „Pańskie mieszkanie w {district} przy najmie długoterminowym daje dziś około {lt} miesięcznie. Chcę pokazać, ile może dać z zarządzaniem LIVE-IN i dokąd dokładnie trafiają pieniądze.”'],
      ['Pokaż przychód brutto i od razu go obniż', 'Właściciel nie wierzy w wysokie liczby. Powiedz: „Przy obłożeniu {occ} % i {adr} za dobę przychód to {gross}. To nie jest Pański zysk. Odejmujemy prowizje platform, VAT, koszty operacyjne i naszą prowizję.” Potem pokaż wiersz po wierszu tabelę Gdzie trafiają pieniądze.'],
      ['Kwota dla właściciela', '„Po wszystkich kosztach zostaje Panu {owner} miesięcznie, {annual} rocznie. To {uplift} względem najmu długoterminowego.” Jeśli różnica jest poniżej 20 %, nie przesadzaj: powiedz, że przy tym mieszkaniu jest mniej, i pokaż, przy jakim obłożeniu byłoby +20 % ({need}).'],
      ['Nasza prowizja', '„Prowizja to {commission} przychodu z najmu, nie z Pańskiej kwoty. Płaci Pan tylko z tego, co mieszkanie naprawdę zarobi. Gdy mieszkanie nie zarabia, my też nie.” To najmocniejszy argument na strach przed opłatami.'],
      ['Co dostaje w zamian', 'Przeczytaj listę: przygotowanie i zdjęcia, oferty na Airbnb i Booking, dynamiczne ceny, goście 7 dni w tygodniu, sprzątanie i pościel, miesięczne rozliczenie. „Pan nie robi nic. Dostaje Pan pieniądze i rozliczenie.”'],
      ['Zamknięcie', 'Nie pytaj „czy chce Pan?”. Podaj następny krok: „Wyślę Panu tę kalkulację w PDF i przyjadę obejrzeć mieszkanie, żeby doprecyzować liczby. Pasuje wtorek czy czwartek?” Ocena jest bezpłatna i niezobowiązująca.'],
    ],
    objH: 'Obiekcje właścicieli i odpowiedzi',
    objections: [
      ['„17 % to dużo.”', 'Porównaj kwotę, nie procent: {owner} z zarządzaniem wobec {lt} przy najmie długoterminowym. Prowizja jest już w tej kwocie odjęta.'],
      ['„Goście zniszczą mi mieszkanie.”', 'Zweryfikowani goście przez platformy, zamki na kod, dokumentacja zdjęciowa po każdym pobycie, rezerwa na naprawy jest w kalkulacji. Najemca długoterminowy jest w mieszkaniu 12 miesięcy bez kontroli, goście wyjeżdżają po {stay} nocach, a mieszkanie jest sprzątane po każdym.'],
      ['„A co w niskim sezonie?”', 'Pokaż suwak obłożenia: „Przy {needOcc} obłożenia nadal jest +20 %. Warszawa ma popyt cały rok, rynek jest na 65 do 68 %.” Nie obiecuj obłożenia, pokaż wrażliwość.'],
      ['„Chcę czasem korzystać z mieszkania.”', 'Ustaw Noce dla właściciela i pokaż nowy wynik. Przy najmie długoterminowym nie może korzystać wcale.'],
      ['„Muszę doposażyć mieszkanie.”', 'Prawda. Powiedz, czego brakuje, i pokaż, po ilu miesiącach różnica względem najmu długoterminowego ({diff} miesięcznie) zwróci inwestycję.'],
      ['„Podatki i VAT?”', 'W kalkulacji jest VAT {vat}. Podatek dochodowy to ten sam temat w obu modelach, poleć księgowego, nie zgaduj.'],
      ['„Muszę to przemyśleć.”', 'W porządku. Wyślij PDF i link do kalkulatora, żeby sam przesuwał liczby, i umów termin telefonu. Zapisz w CRM.'],
    ],
    never: 'Nie obiecuj konkretnego przychodu ani obłożenia, zawsze „model orientacyjny”. Nie obniżaj prowizji i nie obiecuj stałego czynszu, o tym decyduje zarząd. Wysokości czynszu rent-to-rent nie omawiaj z właścicielem w tym kalkulatorze.',
    sendH: 'Co wysłać właścicielowi', send: ['PDF z tego scenariusza (przycisk Pobierz PDF).', 'Link dla właściciela, gdzie sam może przesuwać liczby.', 'Krótki e-mail: 3 zdania, kwota dla właściciela, różnica względem najmu długoterminowego, termin oględzin.'],
  },
  en: {
    agentOn: 'Agent mode', agentOff: 'Owner view', agentHint: 'The owner sees only the calculator and the PDF. The guide and internal fields are for you only.',
    ownerLink: 'Copy link for the owner', ownerLinkDone: 'Owner link copied (without internal parts)',
    guideH: 'How to explain it to the owner', guideP: 'Conversation flow with the numbers of this scenario. Speak in their numbers, not in percentages.',
    steps: [
      ['Opening (30 seconds)', 'Do not talk about Airbnb, talk about their apartment: “Your apartment in {district} brings about {lt} a month on a long-term lease today. I want to show you what it can bring with LIVE-IN management and exactly where the money goes.”'],
      ['Show gross revenue and reduce it immediately', 'Owners do not trust big numbers. Say: “At {occ} % occupancy and {adr} per night, revenue is {gross}. That is not your profit. We deduct platform fees, VAT, operations and our commission.” Then walk through the Where the money goes table line by line.'],
      ['Owner payout', '“After all costs you keep {owner} a month, {annual} a year. That is {uplift} versus a long-term lease.” If the difference is below 20 %, do not oversell: say it is less for this apartment and show the occupancy needed for +20 % ({need}).'],
      ['Our commission', '“The commission is {commission} of rental income, not of your payout. You pay only from what the apartment really earns. When the apartment does not earn, neither do we.” This is the strongest answer to fear of fees.'],
      ['What they get', 'Read the list: preparation and photos, Airbnb and Booking listings, dynamic pricing, guests 7 days a week, cleaning and linen, monthly statement. “You do nothing. You receive the money and the statement.”'],
      ['Closing', 'Do not ask “do you want it?”. Give the next step: “I will send you this calculation as a PDF and come to see the apartment so we can refine the numbers. Tuesday or Thursday?” The assessment is free and non-binding.'],
    ],
    objH: 'Owner objections and answers',
    objections: [
      ['“17 % is a lot.”', 'Compare the payout, not the percentage: {owner} with management versus {lt} on a long-term lease. The commission is already deducted in that number.'],
      ['“Guests will wreck my apartment.”', 'Verified guests via platforms, code locks, photo documentation after every stay, a maintenance reserve is in the calculation. A long-term tenant sits in the apartment 12 months unchecked; guests leave after {stay} nights and the apartment is cleaned after each one.'],
      ['“What about low season?”', 'Show the occupancy slider: “At {needOcc} occupancy you are still at +20 %. Warsaw has year-round demand, the market runs at 65 to 68 %.” Do not promise occupancy, show sensitivity.'],
      ['“I want to use the apartment sometimes.”', 'Set Owner nights and show the new result. With a long-term lease they cannot use it at all.'],
      ['“I would have to buy furniture.”', 'True. Say what is missing and show in how many months the difference versus a long-term lease ({diff} a month) pays it back.'],
      ['“Taxes and VAT?”', 'VAT {vat} is in the calculation. Income tax is the same topic in both models; recommend an accountant, do not guess.'],
      ['“I need to think about it.”', 'Fine. Send the PDF and the calculator link so they can move the numbers themselves, and agree when you will call. Log it in the CRM.'],
    ],
    never: 'Never promise a specific income or occupancy, always “indicative model”. Do not discount the commission or promise a fixed rent; management decides that. Do not discuss rent-to-rent rent levels with the owner in this calculator.',
    sendH: 'What to send the owner', send: ['The PDF of this scenario (Download PDF button).', 'The owner link where they can move the numbers themselves.', 'A short e-mail: 3 sentences, the payout figure, the difference versus a long-term lease, a viewing date.'],
  },
}

export const TR = {
  sk: {
    h1: 'Rent-to-rent vo Varšave', h1em: 'návratnosť pre LIVE-IN.', intro: 'Interná kalkulačka pre agenta. LIVE-IN si byt prenajme, zaplatí majiteľovi pevný nájom a prevádzkuje ho. Tu vidíš maržu, návratnosť vstupnej investície a koľko nájmu si môžeme dovoliť.',
    s3: '03 / NÁJOM A INVESTÍCIA', rent: 'Nájom pre majiteľa (mesačne)', deposit: 'Kaucia (počet nájmov)', setup: 'Vstupná investícia (vybavenie, staging, foto)', agentFee: 'Provízia agenta / jednorazové náklady',
    margin: 'Marža LIVE-IN mesačne', annual: 'ročne', marginPct: 'z príjmu z prenájmu', operating: 'Prevádzkový výsledok pred nájmom', invest: 'Vstupná investícia spolu', payback: 'Návratnosť investície', months: 'mesiacov', never: 'nevráti sa (záporná marža)', roi: 'Ročný výnos z investície',
    breakEven: 'Bod zvratu (obsadenosť)', maxRent: 'Najvyšší nájom pri marži 25 %', maxRent20: 'pri marži 20 %', ltNote: 'Trhový dlhodobý nájom', sensH: 'Citlivosť marže (mesačne)', sensNote: 'Riadky obsadenosť, stĺpce cena za noc.',
    verdict: { good: 'Dobrý obchod: marža nad 25 % a návratnosť do 12 mesiacov.', ok: 'Prijateľné: marža 15 až 25 % alebo návratnosť do 24 mesiacov. Vyjednaj nižší nájom alebo dlhšiu zmluvu.', weak: 'Slabé: marža pod 15 %. Ponúkni majiteľovi najviac uvedený nájom alebo radšej model správy.', neg: 'Nerob: záporná marža pri týchto predpokladoch.' },
    tipsH: 'Ako vyjednávať s majiteľom', tips: ['Začni od trhového nájmu, nie od našej maržy. Ponuka +0 až +5 % nad trh je pre majiteľa lákavá: pevný príjem, bez neobsadenosti, bez starostí.', 'Pýtaj si dlhšiu zmluvu (3 až 5 rokov) a výpovednú lehotu aspoň 3 mesiace, inak sa vstupná investícia nevráti.', 'Dohodni, kto platí energie a czynsz. V tejto kalkulačke ich platí LIVE-IN, ak ich prevezme majiteľ, marža rastie o túto sumu.', 'Zariadený byt = nižšia vstupná investícia. Nezariadený byt vyjednávaj s nižším nájmom alebo s prvými mesiacmi zadarmo.', 'Majiteľovi neukazuj našu maržu. Ukáž mu istotu: pevný nájom každý mesiac, aj keď je byt prázdny.'],
    pdf: 'Stiahnuť interný výpočet (PDF)', badge: 'INTERNÝ VÝPOČET',
  },
  pl: {
    h1: 'Rent-to-rent w Warszawie', h1em: 'zwrot dla LIVE-IN.', intro: 'Kalkulator wewnętrzny dla agenta. LIVE-IN wynajmuje mieszkanie, płaci właścicielowi stały czynsz i je obsługuje. Tu widzisz marżę, zwrot z inwestycji początkowej i na jaki czynsz możemy sobie pozwolić.',
    s3: '03 / CZYNSZ I INWESTYCJA', rent: 'Czynsz dla właściciela (miesięcznie)', deposit: 'Kaucja (liczba czynszów)', setup: 'Inwestycja początkowa (wyposażenie, staging, zdjęcia)', agentFee: 'Prowizja agenta / koszty jednorazowe',
    margin: 'Marża LIVE-IN miesięcznie', annual: 'rocznie', marginPct: 'przychodu z najmu', operating: 'Wynik operacyjny przed czynszem', invest: 'Inwestycja początkowa razem', payback: 'Zwrot z inwestycji', months: 'miesięcy', never: 'brak zwrotu (ujemna marża)', roi: 'Roczny zwrot z inwestycji',
    breakEven: 'Próg rentowności (obłożenie)', maxRent: 'Najwyższy czynsz przy marży 25 %', maxRent20: 'przy marży 20 %', ltNote: 'Rynkowy czynsz długoterminowy', sensH: 'Wrażliwość marży (miesięcznie)', sensNote: 'Wiersze obłożenie, kolumny cena za dobę.',
    verdict: { good: 'Dobry deal: marża powyżej 25 % i zwrot do 12 miesięcy.', ok: 'Akceptowalne: marża 15 do 25 % lub zwrot do 24 miesięcy. Negocjuj niższy czynsz lub dłuższą umowę.', weak: 'Słabo: marża poniżej 15 %. Zaproponuj właścicielowi najwyżej podany czynsz albo model zarządzania.', neg: 'Nie rób: ujemna marża przy tych założeniach.' },
    tipsH: 'Jak negocjować z właścicielem', tips: ['Zacznij od czynszu rynkowego, nie od naszej marży. Oferta +0 do +5 % powyżej rynku jest dla właściciela atrakcyjna: stały dochód, bez pustostanu, bez zmartwień.', 'Proś o dłuższą umowę (3 do 5 lat) i okres wypowiedzenia co najmniej 3 miesiące, inaczej inwestycja początkowa się nie zwróci.', 'Ustal, kto płaci media i czynsz administracyjny. W tym kalkulatorze płaci LIVE-IN; jeśli przejmie je właściciel, marża rośnie o tę kwotę.', 'Mieszkanie umeblowane = niższa inwestycja początkowa. Nieumeblowane negocjuj z niższym czynszem lub pierwszymi miesiącami gratis.', 'Nie pokazuj właścicielowi naszej marży. Pokaż mu pewność: stały czynsz co miesiąc, nawet gdy mieszkanie stoi puste.'],
    pdf: 'Pobierz kalkulację wewnętrzną (PDF)', badge: 'KALKULACJA WEWNĘTRZNA',
  },
  en: {
    h1: 'Rent-to-rent in Warsaw', h1em: 'return for LIVE-IN.', intro: 'Internal calculator for the agent. LIVE-IN leases the apartment, pays the owner a fixed rent and operates it. Here you see the margin, payback of the initial investment and how much rent we can afford.',
    s3: '03 / RENT AND INVESTMENT', rent: 'Rent to owner (monthly)', deposit: 'Deposit (number of rents)', setup: 'Initial investment (furnishing, staging, photos)', agentFee: 'Agent fee / one-off costs',
    margin: 'LIVE-IN margin per month', annual: 'per year', marginPct: 'of rental income', operating: 'Operating result before rent', invest: 'Total initial investment', payback: 'Investment payback', months: 'months', never: 'never (negative margin)', roi: 'Annual return on investment',
    breakEven: 'Break-even occupancy', maxRent: 'Highest rent at 25 % margin', maxRent20: 'at 20 % margin', ltNote: 'Market long-term rent', sensH: 'Margin sensitivity (monthly)', sensNote: 'Rows occupancy, columns nightly rate.',
    verdict: { good: 'Good deal: margin above 25 % and payback within 12 months.', ok: 'Acceptable: margin 15 to 25 % or payback within 24 months. Negotiate a lower rent or a longer contract.', weak: 'Weak: margin below 15 %. Offer the owner at most the rent shown, or prefer the management model.', neg: 'Do not do it: negative margin with these assumptions.' },
    tipsH: 'How to negotiate with the owner', tips: ['Start from market rent, not from our margin. An offer of +0 to +5 % above market is attractive: fixed income, no vacancy, no worries.', 'Ask for a longer contract (3 to 5 years) and a notice period of at least 3 months, otherwise the initial investment does not pay back.', 'Agree who pays utilities and the building fee. In this calculator LIVE-IN pays them; if the owner takes them over, the margin grows by that amount.', 'Furnished apartment = lower initial investment. For unfurnished, negotiate a lower rent or the first months free.', 'Do not show the owner our margin. Show certainty: fixed rent every month, even when the apartment is empty.'],
    pdf: 'Download internal calculation (PDF)', badge: 'INTERNAL CALCULATION',
  },
}
