# Bylinky spod Tatier – nový web

Redizajn a migrácia e-shopu [bylinkyspodtatier.sk](https://www.bylinkyspodtatier.sk) z Webnode na vlastné riešenie.

Rodinná firma spod Tatier – 100 % BIO šťavy lisované za studena, tinktúry, sušené bylinky a plody, bylinné krémy a maste.

## Stav projektu

🚧 **Fáza 1 – migrácia obsahu a návrh** (prebieha)

- [x] Export obsahu zo starého webu (155 produktov, 16 kategórií, stránky, články)
- [x] Mapa 301 presmerovaní
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

## Plánovaná štruktúra repozitára

```
content/
  produkty/<kategoria>/<slug>.md   # produkty – YAML frontmatter + popis
  stranky/*.md                     # o nás, kontakt, doprava, obchodné podmienky…
  clanky/*.md                      # blog
data/
  produkty.json                    # všetky produkty (import do DB)
  kategorie.json                   # kategórie + poradie produktov
  web.json                         # kontakty, navigácia, pätička
  _redirects                       # 301 presmerovania pre Netlify
docs/
  NAPADY-REDIZAJN.md               # nápady a zoznam problémov v obsahu
scripts/
  stiahni-obrazky.ps1              # stiahnutie originálnych obrázkov
```

## Obrázky

Originálne obrázky (~490 MB, 382 súborov) **nebudú v gite**. Stiahneš ich skriptom:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/stiahni-obrazky.ps1
```

Zoznam obrázkov je v `obrazky-manifest.csv`. Priečinok `obrazky/` patrí do `.gitignore`.

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
