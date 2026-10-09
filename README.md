# Bylinky spod Tatier – nový web

Redizajn a migrácia e-shopu [bylinkyspodtatier.sk](https://www.bylinkyspodtatier.sk) z Webnode na vlastné riešenie.

Rodinná firma spod Tatier – 100 % BIO šťavy lisované za studena, tinktúry, sušené bylinky a plody, bylinné krémy a maste.

## Stav projektu

🚧 **Fáza 1 – migrácia obsahu a návrh** (prebieha)

- [x] Export obsahu zo starého webu (155 produktov, 16 kategórií, stránky, články)
- [x] Mapa 301 presmerovaní
- [x] Schéma databázy (Supabase)
- [x] Skript na optimalizáciu obrázkov
- [x] Základ Nuxt projektu (katalóg, produkt, stránky, články, prihlásenie do adminu)
- [ ] Import produktov a obrázkov do Supabase
- [ ] Košík, objednávky, platby, Packeta
- [ ] Administrácia (produkty, stránky, objednávky)
- [ ] Oprava preklepov a chýb v textoch (obsah textov zostáva)
- [ ] Zjednotenie variantov balení (objem × obal)
- [ ] Dizajn
- [ ] Implementácia
- [ ] Spustenie a presmerovanie domény

## Stack

| Vrstva | Technológia |
|---|---|
| Frontend | Nuxt 4 (Vue 3 + TypeScript) |
| Dáta / objednávky | Supabase |
| Hosting | Netlify |
| Obrázky | Netlify Image CDN (WebP/AVIF) |

## Spustenie

Potrebuješ Node.js 22+.

```bash
npm install
cp .env.example .env        # doplň SUPABASE_SERVICE_ROLE_KEY (Supabase → Settings → API Keys → secret)
npm run dev                 # http://localhost:3000
```

### Prvé naplnenie databázy

```bash
# 1. originály obrázkov (~490 MB) → obrazky/
powershell -ExecutionPolicy Bypass -File scripts/stiahni-obrazky.ps1

# 2. webové verzie (WebP, max 1600 px) → obrazky-web/
npm run obrazky:web

# 3. obrázky → Supabase Storage (bucket media)
npm run obrazky:upload

# 4. produkty, kategórie, stránky, články, predajne → databáza
npm run import:dry          # najprv kontrola bez zápisu
npm run import
```

Import aj upload sa dajú spúšťať opakovane – existujúce záznamy aktualizujú podľa slugu.

### Prístup do administrácie

1. Supabase → Authentication → Users → **Add user** (e-mail + heslo majiteľky).
2. Pridaj jej rolu admin (SQL Editor):
   ```sql
   insert into profiles (user_id, role)
   select id, 'admin' from auth.users where email = 'majitelka@example.sk';
   ```
3. Prihlásenie: `/admin/login`.

## Štruktúra repozitára

```
app/                               # Nuxt aplikácia
  pages/                           # /, /kategoria/[slug], /produkty/[slug], /[slug], /clanky, /admin
  components/ composables/ utils/
  types/database.types.ts          # typy vygenerované zo Supabase
content/                           # pôvodný obsah zo starého webu (Markdown + YAML)
  produkty/<kategoria>/<slug>.md
  stranky/*.md  clanky/*.md
data/
  produkty.json / produkty.csv     # všetky produkty (zdroj pre import / Excel)
  kategorie.json  web.json
  _redirects, redirecty.csv        # 301 presmerovania (kópia v public/_redirects)
docs/NAPADY-REDIZAJN.md            # nápady a zoznam problémov v obsahu
scripts/
  stiahni-obrazky.ps1              # stiahnutie originálnych obrázkov
  optimalizuj-obrazky.mjs          # zmenšenie obrázkov na web (WebP)
  nahraj-obrazky.mjs               # upload do Supabase Storage
  importuj-data.mjs                # import obsahu do databázy
supabase/migrations/               # schéma databázy
obrazky-manifest.csv               # zoznam obrázkov: lokálna cesta → pôvodná URL
```

## Obrázky

Obrázky **nie sú v gite** (`obrazky/` a `obrazky-web/` sú v `.gitignore`). Na webe sa načítavajú zo Supabase Storage:
`https://inisctjmatxfbxnjtwqz.supabase.co/storage/v1/object/public/media/<cesta>.webp`

Nastavenia zmenšenia: `npm run obrazky:web -- --max 2000 --quality 85`, prepočítať všetko: `-- --force`.

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
