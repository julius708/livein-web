# Prepnutie live-in.international na nový web (Vercel)

Stav 3. 11. 2026: DNS prepnuté, live-in.international beží na Verceli (projekt `livein-web`, team pracovna-app).
Domény `live-in.international` a `www.live-in.international` sú v projekte pridané a overené.
Starý WordPress web beží na GoDaddy (IP 160.153.0.183), DNS je v GoDaddy (ns51/ns52.domaincontrol.com).

## Čo zmeniť v GoDaddy → DNS (Moje domény → live-in.international → DNS)

| Typ | Názov | Hodnota | TTL |
|-----|-------|---------|-----|
| A | @ | 216.150.1.1 | 600 |
| A | @ | 216.150.16.1 | 600 |
| CNAME | www | 5630e9765462775a.vercel-dns-016.com | 600 |

- Existujúci záznam A @ → 160.153.0.183 vymazať (alebo prepísať).
- Existujúci CNAME www → live-in.international prepísať na hodnotu vyššie.
- Záznam `new` (CNAME) môže zostať alebo sa zmaže – doména `new.live-in.international` už nie je potrebná.
- Ostatné záznamy (MX pre e-mail, TXT, booking, app, testy…) nemeniť.

Vercel po zmene sám vystaví certifikát (do pár minút po propagácii DNS, max. cca 1 hodina).

## Po prepnutí
- `www.live-in.international` → presmeruje na `live-in.international` (308).
- Staré adresy WordPressu (/clanky, /o-nas, /sluzby, /nehnutelnost/…, články) sa presmerujú na nové stránky.
- Sitemap: https://live-in.international/sitemap.xml, robots.txt odkazuje naň.
- `new.live-in.international` z projektu odobratá (3. 11. 2026).
- GoDaddy WordPress hosting sa dá po overení vypnúť (zálohu článkov máme v novom webe v Poradni).
