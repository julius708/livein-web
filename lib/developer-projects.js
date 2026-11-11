export const projects = {
  "lazaretska-15": {
    name: "Lazaretská 15",
    location: "Bratislava · Staré Mesto",
    partner: "Projekt Petra Valentína",
    headline: "Malý priestor. Veľká mestská adresa.",
    intro:
      "Vyberte si apartmán, pozrite si jeho parametre a preskúmajte model prenájmu so správou LIVE-IN.",
    source:
      "Historická analýza z 15. 9. 2026. Ceny a dostupnosť čakajú na potvrdenie developera.",
    facts: [
      "8 jednotiek v historickej ponuke",
      "23–34 m²",
      "Centrum Bratislavy",
    ],
    units: [
      {
        id: "AP 13",
        area: 31.08,
        price: 214000,
        floor: "2. NP",
        layout: "1+kk",
        orientation: "Východ · vnútroblok",
      },
      {
        id: "AP 14",
        area: 27.11,
        price: 191000,
        floor: "2. NP",
        layout: "1+kk",
        orientation: "Východ · vnútroblok",
      },
      {
        id: "AP 10",
        area: 30.04,
        price: 216000,
        floor: "2. NP",
        layout: "1+kk",
        orientation: "Západ · ulica",
      },
      {
        id: "AP 26",
        area: 33.09,
        price: 240000,
        floor: "4.–5. NP",
        layout: "2+kk · mezanín",
        orientation: "Západ · ulica",
      },
      {
        id: "AP 100",
        area: 23.26,
        price: 172000,
        floor: "1. NP",
        layout: "1+kk",
        orientation: "Západ · ulica",
      },
      {
        id: "AP 20",
        area: 24.09,
        price: 189000,
        floor: "3. NP",
        layout: "1+kk",
        orientation: "Západ · ulica",
      },
      {
        id: "AP 12",
        area: 24.9,
        price: 197000,
        floor: "2. NP",
        layout: "1+kk",
        orientation: "Západ · ulica",
      },
      {
        id: "AP 1",
        area: 34.29,
        price: 234000,
        floor: "1. NP",
        layout: "1+kk",
        orientation: "Západ · ulica",
      },
    ],
  },
  "arteria-living": {
    name: "Arteria Living",
    location: "Bratislava · Cintorínska / Rajská",
    partner: "Lordship",
    headline: "Investícia v centre. Prevádzka v dobrých rukách.",
    intro:
      "Návrh prezentácie projektu s prepojením predaja investorom a následnej správy apartmánov pod značkou LIVE-IN.",
    source:
      "Podľa komunikácie z apríla 2026 približne 80 apartmánov v troch domoch. Aktuálny rozsah a ponuku doplní Lordship.",
    facts: [
      "Približne 80 apartmánov podľa podkladov",
      "3 domy",
      "Model správy pre investorov",
    ],
    units: [
      {
        id: "Modelová jednotka",
        area: null,
        price: null,
        floor: "Na doplnenie",
        layout: "Na doplnenie",
        orientation: "Na doplnenie",
      },
    ],
  },
};

// Rovnaký základ výpočtu ako slovenská kalkulačka LIVE-IN v content/sk.json.
// Percentá a vstupy sú v ukážke upraviteľné, aby sa dali potvrdiť pre projekt.
export function investmentResult(v) {
  const nights = (Math.max(0, 30 - v.own) * v.occupancy) / 100;
  const gross = nights * v.adr;
  const portal = (gross * v.portal) / 100;
  const income = gross - portal;
  const management = (income * v.management) / 100;
  const vat = (income * v.vat) / 100;
  const cleaning = (nights / v.stay) * (v.cleanCost - v.cleanPaid);
  const monthly = income - management - vat - cleaning - v.fixed - v.software;
  const investment = v.price + v.furnishing;
  return {
    nights,
    gross,
    portal,
    income,
    management,
    vat,
    cleaning,
    monthly,
    annual: monthly * 12,
    investment,
    yield: investment > 0 ? ((monthly * 12) / investment) * 100 : null,
  };
}
