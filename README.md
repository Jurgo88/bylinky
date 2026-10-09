# Bylinky spod Tatier – nový web

Redizajn a migrácia e-shopu [bylinkyspodtatier.sk](https://www.bylinkyspodtatier.sk) z Webnode na vlastné riešenie.

Rodinná firma spod Tatier – 100 % BIO šťavy lisované za studena, tinktúry, sušené bylinky a plody, bylinné krémy a maste.

## Stav projektu

🚧 **Fáza 1 – migrácia obsahu a návrh** (prebieha)

- [x] Export obsahu zo starého webu (155 produktov, 16 kategórií, stránky, články)
- [x] Mapa 301 presmerovaní
- [x] Schéma databázy (Supabase)
- [x] Skript na optimalizáciu obrázkov
- [ ] Import produktov a obrázkov do Supabase
- [ ] Oprava preklepov a chýb v textoch (obsah textov zostáva)
- [ ] Zjednotenie variantov balení (objem × obal)
- [ ] Dizajn
- [ ] Implementácia
- [ ] Spustenie a presmerovanie domény

## Stack

| Vrstva | Technológia |
|---|---|
| Frontend | Nuxt 3 (Vue 3 + TypeScript) |
| Dáta / objednávky | Supabase |
| Hosting | Netlify |
| Obrázky | Netlify Image CDN (WebP/AVIF) |

## Štruktúra repozitára

```
content/
  produkty/<kategoria>/<slug>.md   # 155 produktov – YAML frontmatter + popis
  stranky/*.md                     # o nás, kontakt, doprava, obchodné podmienky…
  clanky/*.md                      # blog
data/
  produkty.json / produkty.csv     # všetky produkty (import do DB / Excel)
  kategorie.json                   # kategórie + poradie produktov
  web.json                         # kontakty, navigácia, pätička
  _redirects, redirecty.csv        # 301 presmerovania pre Netlify
docs/
  NAPADY-REDIZAJN.md               # nápady a zoznam problémov v obsahu
scripts/
  stiahni-obrazky.ps1              # stiahnutie originálnych obrázkov
  optimalizuj-obrazky.mjs          # zmenšenie obrázkov na web (WebP)
supabase/migrations/               # schéma databázy (Supabase)
obrazky-manifest.csv               # zoznam obrázkov: lokálna cesta → pôvodná URL
```

## Obrázky

Obrázky **nie sú v gite** (`obrazky/` a `obrazky-web/` sú v `.gitignore`).

**1. Stiahnutie originálov** (~490 MB, 382 súborov) do `obrazky/`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/stiahni-obrazky.ps1
```

**2. Zmenšenie na web** do `obrazky-web/` (WebP, max 1600 px, kvalita 80, otočenie podľa EXIF, bez metadát):

```bash
npm install
npm run obrazky:web
npm run obrazky:web -- --max 2000 --quality 85   # iné nastavenie
npm run obrazky:web -- --force                   # prepočítať všetko
```

Skript spracuje len nové alebo zmenené obrázky a vytvorí `obrazky-web/manifest.json` (originál → webová verzia, šírka, výška, veľkosť) pre nahratie do Supabase Storage.

## Formát produktu

```yaml
---
title: Medovka
slug: medovka
primary_category: Šťavy
categories: [Šťavy, Novinky]
price_from: 6.5
currency: EUR
in_stock: true
variants:
  - label: 200ml plast
    price: 6.5
images:
  - obrazky/produkty/medovka/medovka-01.jpg
old_url: https://www.bylinkyspodtatier.sk/p/medovka1/
---
Popis produktu v Markdowne…
```
