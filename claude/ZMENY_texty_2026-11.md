> Aktualizácia 4. 11. 2026: konkrétne zoznamy miest boli z webu odstránené (pôsobíme po celom Slovensku; hero má animovanú cestu Bratislava → Košice → ďalej). Nižšie uvedené staršie znenia už neplatia.

# Úprava textov a obsahu webu live-in.international (vetva `web-texty-2026-11`)

Stav 4. 11. 2026. Nič z tejto vetvy nie je nasadené na produkciu; náhľad je Vercel preview vetvy.
Dizajn, layout, branding, animácie, galéria, video, Adam, logika formulárov a URL ostali bez zmeny.

## Zmenené súbory

| Súbor | Čo |
|---|---|
| `content/sk.json`, `content/en.json` | texty (home, pages, footer, modal, filmScenes, faqRows, nav, cta, title, description) |
| `public/motion/sk.js`, `public/motion/en.js` | popisky galérie a krokov starostlivosti (bez Higgsfieldu, kredit „Foto: thirring.sk“) |
| `public/lead/lead-form.sk.js`, `public/lead/lead-form.en.js` | nepovinné pole „Ide o:“ ide do textu dopytu; EN hlášky prepísané |
| `components/HomeExtras.js` (nový) | číselný pás (stats.json + živý počet) a sekcia recenzií (reviews.json); bez dát sa nevykreslia |
| `public/stats.json` (nový) | overené údaje pásu: rok 2018, 3 mestá; `rating`/`guests` = null (doplní majiteľ); endpoint živého počtu |
| `public/reviews.json` (nový) | prázdne pole → sekcia recenzií skrytá |
| `supabase/functions/portfolio-count/` (nový) | Edge Function + README (len agregát, service role kľúč len na serveri, cache 1 h, CORS, rate limit) |
| `app/web.css` | štýly pásu, odkazu pod modelmi a recenzií (len existujúce premenné a písmo) |
| `app/[[...slug]]/page.js` | pripojenie `HomeExtras` na úvodnej stránke |

## Počet apartmánov

- V obsahu webu (SK, EN, DE, ES, PL, CZ, meta, JSON-LD) **nebol** žiadny natvrdo napísaný počet apartmánov; nič netreba meniť.
- Živý počet: `public/stats.json` → `portfolio.endpoint` → Supabase Edge Function `portfolio-count`.
  Predvolene `count(*) where active = true` (dnes 137), `in_scope` = 105. Východisko `BASELINE_COUNT = 69`, `BASELINE_YEAR = 2026`.
  **Funkcia zatiaľ nie je nasadená** (nasadenie je zmena v produkčnom Supabase; potvrďte definíciu filtra a hodnotu 69). Kým vráti chybu, živý prvok sa nezobrazí a pás ukazuje len „Od roku 2018 · 3 mestá“.
- Poznámka mimo webu: Adam (znalostná báza asistenta) hovorí „približne 130 apartmánov“; Adam sa podľa zadania nemenil.

## Tabuľka zmien – SK

| Miesto | Pôvodný text | Nový text |
|---|---|---|
| Hero, podnadpis (aj scéna 01) | Vy ste mu dali podobu. My mu pomôžeme nájsť miesto v každodennom živote hostí. | Správa krátkodobých prenájmov v Bratislave a Košiciach a. Od prvého kroku po každodennú starostlivosť. |
| Hero, horný riadok | Správa prenájmov / Bratislava · Košice | Správa prenájmov / Bratislava · Košice |
| Hero, popis videa | Animovaná fotografia · Higgsfield | (odstránené; tlačidlo „Prehrať animovaný záber ▷“ ostáva) |
| Sekcia „Na chvíľu spomaľte“ | Vlastná fotografia LIVE-IN animovaná v Higgsfielde. | (odstránené; tlačidlo „Prehrať záber ▷“ ostáva) |
| aria-label videí | Animácia … vytvorená v Higgsfielde | Animovaný záber z apartmánu LIVE-IN |
| Pod úvodom (nové) | – | Od roku 2018 · 3 mestá: Bratislava, Košice, (mesto odstránené) · [69 → N apartmánov od januára 2026, živé] |
| Detail, zdroj fotky | Obývacia časť · Fotografia · thirring.sk pre LIVE-IN | Obývacia časť · Foto: thirring.sk |
| Detail, poznámka | Výber ukazuje rôzne interiéry. Fotografie nepredstavujú súvislú prehliadku jedného bytu ani zoznam dostupných ponúk. | Apartmány v správe LIVE-IN. Foto: thirring.sk |
| Starostlivosť, kredit | Fotografia · thirring.sk pre LIVE-IN | Foto: thirring.sk |
| Starostlivosť, „Byt s jasným plánom“ | Prejdeme stav, vybavenie a vhodný model prenájmu. Dohodneme rozsah a pripravíme pravdivú prezentáciu. | Najprv si spolu prejdeme byt: stav, vybavenie a to, ktorý model prenájmu mu sedí najlepšie. Potom pripravíme pravdivú prezentáciu a dohodneme, kto čo robí. |
| Starostlivosť, krok „Počas prenájmu“ (motion) | … Zodpovednosti a náklady podľa dohodnutého rozsahu. | Komunikácia s hosťami, rezervácie a starostlivosť medzi pobytmi. Zodpovednosti a náklady podľa toho, čo sme si dohodli. |
| Váš ďalší krok, úvod | Vyberieme model podľa nehnuteľnosti, dostupnosti a toho, čo od prenájmu očakávate. | Model vyberieme podľa bytu, jeho dostupnosti a toho, čo od prenájmu očakávate. |
| Karta Krátkodobá správa | Prezentácia, rezervácie, ceny a koordinácia medzi pobytmi v dohodnutom rozsahu. | Staráme sa o všetko medzi rezerváciou a odchodom hosťa: prezentácia bytu, rezervácie, ceny, príchody, upratovanie a komunikácia s hosťami. Vy máte prehľad, my prácu. |
| Karta Dlhodobá správa | Pomoc s prenajatím, odovzdaním a dohodnutou priebežnou starostlivosťou počas nájmu. | Pomôžeme Vám byt prezentovať, nájsť nájomníka, bezpečne ho odovzdať a postaráme sa o priebežné veci počas nájmu. |
| Pod modelmi (nové) | – | Zaujíma Vás, koľko by Váš byt zarobil? Spočítajte si to → (odkaz na /kalkulacka) |
| Blok 17 % | … Výpočet a samostatné náklady vysvetlíme v konkrétnej ponuke. | … V ponuke pre Váš byt vysvetlíme jej výpočet aj náklady, ktoré sa účtujú samostatne. |
| Galéria, popis | Obývacia časť · perspektíva | Obývacia časť · ďalší pohľad |
| Galéria, poznámka | Fotografie bytov a vizualizácie pripravovanej kancelárie LIVE-IN. Galéria nepredstavuje zoznam aktuálne dostupných ponúk. | Apartmány v správe LIVE-IN a vizualizácie pripravovanej kancelárie (označené ako vizualizácia). Foto: thirring.sk |
| Galéria, zdroje (motion) | Fotografia · thirring.sk pre LIVE-IN / Archív LIVE-IN · Higgsfield / Originál z archívu LIVE-IN na Drive | Foto: thirring.sk / Archív LIVE-IN / Archív LIVE-IN |
| Za galériou (nové) | – | sekcia „Čo hovoria hostia“ (skrytá, kým je reviews.json prázdny) |
| Realitné služby, popis fotky | Ilustračná fotografia z archívu · nie aktívna ponuka na predaj | Apartmán v správe LIVE-IN · nie je ponuka na predaj |
| Záver | Pošlite základné informácie. Prejdeme možnosti prenájmu a ďalší krok. | Pošlite nám základné informácie. Prejdeme možnosti prenájmu a dohodneme ďalší krok. |
| Hlavička, tlačidlo | Posúdiť môj byt | Pre majiteľov (otvára formulár pre majiteľov) |
| Hlavička a mobilné menu, položka | Ubytovanie | Pre hostí: rezervovať |
| Pätička, tlačidlá | Rezervovať ubytovanie · Kontakt | Pre majiteľov · Pre hostí: rezervovať |
| Meta description | (prázdne) | Správa krátkodobých prenájmov v Bratislave a Košiciach a. Od prvého kroku po každodennú starostlivosť. LIVE-IN International, od roku 2018. |
| Formulár (modal) | – | nové nepovinné pole „Ide o:“ (Som majiteľ / Hosť / Iné), hodnota sa pridá na začiatok textu dopytu; odosielanie a GDPR súhlas bez zmeny |
| Formulár, potvrdenie | Takto bude vyzerať potvrdenie po odoslaní. V prototype… | Ďakujeme. Váš dopyt sme prijali a ozveme sa Vám s ďalším krokom. |
| /sprava, úvod | … Pomôžeme Vám porovnať možnosti a zvoliť rozsah správy pre konkrétnu nehnuteľnosť. | … Porovnáme s Vami možnosti a odporučíme rozsah správy pre Váš byt. |
| /sprava, Krátkodobá správa | Vhodná pre zariadené byty s potenciálom kratších pobytov. Správa zahŕňa prácu s prezentáciou… | Pre zariadené byty vhodné na kratšie pobyty. Staráme sa o všetko medzi rezerváciou a odchodom hosťa: … Vy máte prehľad, my prácu. |
| /sprava, Dlhodobá správa | Vhodná pre majiteľov, ktorí preferujú dlhší nájomný vzťah. Pomôžeme s prezentáciou… | Pre majiteľov, ktorí chcú dlhší nájomný vzťah. Pomôžeme Vám byt prezentovať, nájsť nájomníka, bezpečne ho odovzdať a postaráme sa o priebežné veci počas nájmu. |
| /sprava, Fixný nájom | Fixný nájom ako individuálna alternatíva / Pri vhodnej nehnuteľnosti môže vedenie LIVE-IN posúdiť model fixného nájmu. Ide o osobitnú dohodu s vlastnými podmienkami. Nie je automatickou súčasťou služby správy. | Fixný nájom / Pri vhodnej nehnuteľnosti vieme ponúknuť aj fixný nájom. Ide o samostatnú dohodu s vlastnými podmienkami, nie o súčasť bežnej správy. |
| /sprava, Neviete, ktorý model vybrať? | Začnime Vaším cieľom: príjem, dostupnosť bytu, rozsah Vašej účasti a ochota investovať do vybavenia. Na základe týchto informácií pripravíme odporúčanie. | Začnime Vaším cieľom: príjem, dostupnosť bytu, Vaša účasť a ochota investovať do vybavenia. Podľa toho Vám odporučíme model. |
| /kratkodoba, úvod | Prenájom na kratšie pobyty znamená pravidelnú prácu… LIVE-IN prevezme dohodnutú správu a nastaví zodpovednosti tak, aby ste mali prehľad o svojej nehnuteľnosti. | Staráme sa o všetko medzi rezerváciou a odchodom hosťa: … Vy máte prehľad, my prácu. |
| /kratkodoba, od pripraveného bytu | Najprv posúdime stav a vybavenie. Navrhneme úpravy… Následne pripravíme prezentáciu a nastavíme ponuku… | Najprv si spolu prejdeme stav a vybavenie bytu a navrhneme úpravy… Potom pripravíme prezentáciu a spustíme ponuku… |
| /kratkodoba, počas prenajímania | Počas prenajímania spravujeme rezervácie, pracujeme s cenami a poskytujeme hosťom dohodnuté informácie. Medzi pobytmi koordinujeme upratovanie a bielizeň. Potrebnú údržbu riešime podľa schváleného rozsahu a rozpočtu. | Počas prenajímania spravujeme rezervácie, nastavujeme ceny a komunikujeme s hosťami. Medzi pobytmi zabezpečíme upratovanie a bielizeň. Údržbu riešime v rámci schváleného rozsahu a rozpočtu. |
| /kratkodoba, vyúčtovanie | Vo vyúčtovaní sa rozlišuje príjem z pobytov… Pri porovnávaní sledujeme rovnaké obdobie a rovnaký rozsah položiek. | Vo vyúčtovaní vidíte príjem z pobytov, jednotlivé náklady, províziu za správu a sumu pre Vás. Porovnávame vždy rovnaké obdobie a rovnaké položky. |
| /kratkodoba, vhodnosť | … Posúdenie Vám pomôže porovnať možnosti. | … Pri posúdení bytu porovnáme možnosti a odporučíme model. |
| /dlhodoba, úvod | Ak preferujete dlhší nájomný vzťah, pomôžeme Vám s prenajatím bytu a dohodnutou priebežnou správou. Rozsah nastavíme… | Pomôžeme Vám byt prezentovať, nájsť nájomníka, bezpečne ho odovzdať a postaráme sa o priebežné veci počas nájmu. Rozsah nastavíme… |
| /dlhodoba, príprava | Posúdime stav bytu a pripravíme prezentáciu. Koordinujeme komunikáciu so záujemcami a obhliadky. Dohodneme postup výberu nájomníka… Odovzdanie zaznamená… | Prejdeme stav bytu a pripravíme prezentáciu. Komunikujeme so záujemcami a organizujeme obhliadky. Dohodneme, ako vyberieme nájomníka… Pri odovzdaní zaznamenáme… |
| /dlhodoba, správa počas nájmu | Dohodnutá správa môže zahŕňať sledovanie platieb… Frekvenciu kontrol a schvaľovanie nákladov stanovíme v konkrétnej dohode. | Správa počas nájmu zahŕňa sledovanie platieb… Frekvenciu kontrol a schvaľovanie nákladov si určíme v dohode. |
| /dlhodoba, podmienky | Cenu a rozsah dlhodobej správy dostanete v individuálnej ponuke. Získate prehľad… | Cenu a rozsah dlhodobej správy dostanete v ponuke pre Váš byt. Jasne v nej uvidíte… |
| /ceny, 17 % | … V konkrétnej ponuke vysvetlíme jej výpočet, dohodnutý rozsah a ďalšie náklady spojené s prevádzkou. | … V ponuke pre Váš byt vysvetlíme jej výpočet, rozsah služby a náklady spojené s prevádzkou. |
| /ceny, dlhodobá | … pripravíme samostatnú cenovú ponuku. | … pripravíme samostatnú ponuku. |
| /faq, garantovaný nájom | Možnosť fixného nájmu posudzujeme individuálne. Dostupnosť, výška a záväzky závisia od konkrétnej ponuky a dohody. | Pri vhodnej nehnuteľnosti vieme ponúknuť aj fixný nájom. Ide o samostatnú dohodu s vlastnými podmienkami, nie o súčasť bežnej správy. |
| /faq, kde pôsobíte | Správu prenájmov predstavujeme pre Bratislavu a Košice. Pri inej lokalite nám pošlite dopyt; preveríme možnosti. | Správu prenájmov robíme v Bratislave a Košiciach a. Pri inej lokalite nám pošlite dopyt, preveríme možnosti. |
| /faq, ako rýchlo | Termín závisí od pripravenosti bytu a dohodnutého rozsahu. Konkrétny plán si stanovíme po posúdení. | Záleží na pripravenosti bytu a rozsahu služby. Konkrétny plán si stanovíme po posúdení bytu. |
| /kontakt | Správa nehnuteľností: Bratislava a Košice. | Správa nehnuteľností: Bratislava a Košice a. + dva riadky smerovania (hosť → ústredňa → zákaznícky servis; majiteľ → rovnaký kontakt → tím pre nové spolupráce) |
| /onas | … v Bratislave a Košiciach. / … do Bratislavy a Košíc. | … v Bratislave a Košiciach a. / … do Bratislavy a Košíc a. |

Kontakty ostali: info@live-in.international, +421 2 3233 9005, Čermeľská cesta 3, Košice. Osobné číslo ani WhatsApp nepribudli.
„Konkrétny rozsah a zodpovednosti si nastavíme pred začiatkom spolupráce.“ ostáva raz (sekcia Za dobrým pobytom).

## Tabuľka zmien – EN (ručne prepísané, britská angličtina)

| Miesto | Pôvodný text | Nový text |
|---|---|---|
| Title | Rental management and real estate services \| LIVE-IN International | Short-term rental management in Bratislava a Košice and \| LIVE-IN International |
| Meta description | (prázdne) | Short-term rental management in Bratislava a Košice and, from the first step to everyday care. LIVE-IN International, since 2018. |
| Hlavička, tlačidlo | Assess my apartment | For owners |
| Menu | Counseling office / Accommodation | Guides / For guests: book a stay |
| Hero | You gave it form. We will help him find a place in the everyday life of the guests. | Short-term rental management in Bratislava a Košice and, from the first step to everyday care. |
| Hero, horný riadok | Space for life / Lease management, Bratislava · Košice | Space for living / Rental management, Bratislava · Košice |
| Hero, kapitola 03 | Caring | Care |
| Hero, popis videa | Animated photo · Higgsfield | (odstránené) |
| Scény filmu | The place where / remains. · Behind the scene · Own LIVE-IN interiors… · Lease management from preparation to billing. With the range that we agree… | A place where / you want to stay. · Behind the scenes · LIVE-IN interiors, ready for the next stay. · Rental management from preparation to the monthly statement, with a scope we agree for your apartment. |
| Detail | Not everything fits in the ad. However… / A true photo helps the prospect understand what awaits him. / Everyday trifles / A place for dining, organization… | Not everything fits in a listing. A good presentation starts with what is really in the apartment. / An honest photo shows a prospective guest what to expect. / Everyday details / A place to eat, somewhere for everything and practical equipment. |
| Detail, poznámka | The selection shows different interiors. The photos do not represent a continuous tour… | Apartments managed by LIVE-IN. Photo: thirring.sk |
| Spomaľte | A space that has an atmosphere / For a moment slow down. / Care is shown in the details. / Custom photo LIVE-IN animated in Higgsfield. | A space with atmosphere / Take a moment to slow down. / Care shows in the details. / (odstránené) |
| Starostlivosť | What you can't see in the photo / The daily work is arranged for her. / To operate. / BEFORE LAUNCHING / We will go over the condition… / We will set the specific scope… | What the photo doesn’t show / Behind it is the everyday work we agree on. / Run. / BEFORE LAUNCH / First we walk through the apartment together: its condition, its equipment and which rental model suits it best. Then we prepare an honest presentation and agree who does what. / We agree the exact scope and responsibilities before we start. |
| Váš ďalší krok | Decision for a specific apartment / We will choose a model according to… / Presentation, reservations, prices and coordination between stays within the agreed scope. / Help with renting, handing over and agreed ongoing care… / I am interested / LONGER LEASE | A decision for your apartment / We choose the model based on the property, its availability and what you expect from renting it out. / We look after everything between booking and checkout: presenting your apartment, reservations, pricing, arrivals, cleaning and guest communication. You keep the overview, we do the work. / We help you present your apartment, find a tenant, hand it over properly and take care of the day-to-day during the tenancy. / I’m interested / LONGER LETS |
| Pod modelmi (nové) | – | Curious what your apartment could earn? Work it out → |
| 17 % | … We will explain the calculation and separate costs in a specific offer. / 17% of Rental Income. The calculator model additionally deducts… | … Your offer explains how it is calculated and which costs are charged separately. / 17% of rental income. The calculator also deducts 5% VAT, €50 a month for Guesty and the costs you enter. |
| Galéria | LIVE-IN premises / The space which speaks for itself. / Our apartments and visualizations… One emphasis… / Prepared bedroom · detail of the space / Prepared dining · kitchen / Interior · another view / Living area · perspective / Rest area · Sky Park / City view · Sky Park / Visualization… / poznámka o galérii | LIVE-IN spaces / Space that speaks for itself. / Our apartments and visualisations of the new office. The same emphasis on space and detail. / Prepared bedroom / Dining corner / Living area · another view / Living area / Lounge · Sky Park / City view from Sky Park / Visualisation… / Apartments managed by LIVE-IN and visualisations of the upcoming office (marked as visualisations). Photo: thirring.sk |
| Reality, kalkulačka, poradňa, záver | Sale and purchase have their own procedure and inquiries… / Illustrative photo from the archive · not an active offer for sale / And what they say numbers? / LIVE-IN counseling / A practical read for every stage of home ownership. / Decision making / Let's open options. / Send basic information. We will go over… | Buying and selling follow their own process. Step into the LIVE-IN property section. / Apartment managed by LIVE-IN · not for sale / And what do the numbers say? / LIVE-IN guides / Practical reading for every stage of owning an apartment. / Deciding / Let’s open up the options. / Send us the basics. We’ll go through the rental options and the next step. |
| Pätička | For the owners / Advice and articles / Price and range / Rent calculator / Let's talk / Book accommodation · Contact / … main company and common business name… | For owners / Guides and articles / Price and scope / Rental calculator / Let’s talk / For owners · For guests: book a stay / … parent company and the trading name also used by… The contracting entity is named in your agreement. |
| Formulár | Let's start with the interview / Introduce us to your apartment. / Send us basic data. We will use them… / City of real estate / I want to advise / Send an inquiry / súhlas / potvrdenie | Let’s start a conversation / Tell us about your apartment. / Send us the basics. We use them only to handle your enquiry. / City of the property / I’d like advice / Send enquiry / I agree to my details being used to handle this enquiry… / Thank you. We have received your enquiry… + nové pole „Regarding: I’m an owner / Guest / Other“ |
| FAQ (home) | … he needs suitable equipment … / Possibilities of personal use will be agreed… | … it needs suitable furnishing and equipment … / Personal use is agreed in advance… (všetky 4 odpovede prepísané) |
| Názvy stránok | Prices and range / How cooperation works / Apartment assessment and enquiry form / Accommodation for guests / Let's start with the interview. / A good lease starts… / články | Prices and scope / How it works / Apartment assessment / Book a stay / Let’s start a conversation. / Good renting starts with understanding. / An apartment ready for its first guest. · Short-term or long-term letting? · Your first short-term let in Bratislava. · What to prepare before handing your apartment over to management. · Fewer things. A better-prepared apartment. · AI designs the mood. We check the reality. |
| /sprava, /kratkodoba, /dlhodoba, /ceny, /postup, /kontakt, /hostia, /faq, /onas, /posudenie | strojový preklad (napr. „Explore the counseling center“, „Back to the introduction“, „Agree on the management of a long-term lease“, „How much does short term management cost?“) | ručne prepísané odseky podľa SK zmien; „Back to home“, „Explore the guides“, „Arrange long-term management“, „Fixed rent“ blok a „Not sure which model to choose?“ podľa zadania, kontakt so smerovaním, (mesto odstránené) doplnená |

## Čo ostalo / čo musí doplniť majiteľ

- **Edge Function `portfolio-count` nie je nasadená** (potvrdiť `PORTFOLIO_FILTER` a `BASELINE_COUNT = 69`, potom nasadiť podľa README). Tabuľka `portfolio_snapshots` nevytvorená (voliteľné, mení databázu).
- `public/stats.json`: doplniť `rating` (Ø z Guesty) a `guests` (počet privítaných hostí); kým sú `null`, nezobrazia sa.
- `public/reviews.json`: doplniť recenzie hostí (polia `text`, `author_first_name`, `apartment_label`, `source`, `rating`, `date`); kým je prázdny, sekcia sa nevykreslí.
- EN: prepísaný úvod, všetky hlavné podstránky, pätička, formulár, FAQ a menu. Články v Poradni (`clanok-*`, `poradna`), kalkulačka a stránka Podmienky spolupráce ostali v pôvodnom (strojovom) preklade – odporúčam samostatný prechod.
- DE/ES/PL/CZ verzie neboli súčasťou zadania; ostali bez zmeny textov (okrem odkazu na Facebook v pätičke z inej úlohy).
- Verejná kalkulačka existuje (`/kalkulacka`), odkaz pod modelmi na ňu smeruje; nič sa nestavalo nanovo.
