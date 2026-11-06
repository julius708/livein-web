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
