# Nápady na redizajn a migráciu – Bylinky spod Tatier

## 1. Čo treba opraviť ešte pred spustením (riziká)

**Zdravotné tvrdenia v popisoch produktov.** V popisoch je napr. „protinádorový účinok“ (7×), „liečba chronických ochorení (rakovina, Parkinsonova choroba)“ (RA), „bojuje proti rakovine“ (vitamínové shoty), „lieč…“ (47 produktov). Pri potravinách a doplnkoch EÚ (nariadenie 1924/2006) povoľuje len schválené zdravotné tvrdenia a choroby sa nesmú spomínať ako niečo, čo produkt lieči. Kontroly ŠVPS/SOI to vedia pokutovať. Pri prepisovaní textov odporúčam:
- zmazať tvrdenia o liečbe chorôb (rakovina, Parkinson, astma, …),
- zvyšok preformulovať do bezpečnejšej podoby („tradične sa používa pri…“, „v ľudovom liečiteľstve…“),
- finálne znenie nechať pozrieť niekomu, kto sa v tejto oblasti vyzná.

**Recenzie sú z vzorovej šablóny.** Stránka Recenzie obsahuje texty „Jana K.“, „Martin P.“ a „Rodina Nováková“ s fotkou z Pexels. Vyzerá to ako ukážkový obsah z Webnode. Na nový web ich neprenášaj. Namiesto nich napoj skutočné Google recenzie (odkaz `share.google/…` je v `stranky/recenzie.md`).

**Ďalšie zvyšky zo šablóny:**
- meta popis kategórií Šťavy a Novinky je lorem ipsum („Aut fugit sed quia…“),
- článok o Černici má URL `clanok-s-tipmi-pre-upravu-textov`,
- Sezónne produkty sú prázdna kategória,
- „Nové vedenie od 01.11.2023“ je na úvode stále ako hlavná správa.

**Preklepy:** „dorčenie“, „zahraničiaje“, „varinty“, „štavu“, „Hydatačný“, „(c ena s DPH)“. Ďalej „flaša“ vs. „fľaša“ a „1000ML“ vs. „1L“ vs. „Krabica 1l“.

## 2. Štruktúra katalógu

- **Kategórie a štítky zvlášť:** kategórie by boli Šťavy, Tinktúry, Bylinky, Plody, Krémy a maste, Oleje, Smoothie, Müsli a sladkosti, Knihy, Poukážky. Novinka, Ocenené (Great Taste 2026), Sezónne a TOP produkt by fungovali ako štítky alebo odznaky. V JSON-e to už je rozdelené (`categories` vs. `collections`).
- **Zjednotené varianty:** atribút *Balenie* (250 ml / 500 ml / 1 l) × *Obal* (plast / sklo). Teraz je to 20 rôznych textových labelov, ktoré sa nedajú filtrovať.
- **Filtrovanie podľa účelu** (imunita, spánok a nervy, trávenie, detox, pleť a vlasy, pre deti). Ľudia hľadajú „na čo“, nie „čo“. Dá sa to otagovať z existujúcich popisov, ideálne poloautomaticky cez AI.
- **Štruktúrované polia namiesto voľného textu:** zloženie, dávkovanie, objem/hmotnosť, spôsob užívania, skladovanie. V popisoch sú, ale neštruktúrovane, takže sa dajú vytiahnuť skriptom.
- 13 produktov má veľmi krátky popis (Kašeľ, Žlčník, Pečeň, Dar zdravia I/II, …). 5 produktov nemá vlastný obrázok (Lymfa, Alergie, Jarný čaj, Ženský čaj, Čaj na ukľudnenie).

## 3. Funkcie, ktoré dávajú zmysel

- **Kúry a predplatné:** už teraz predávajú „Kúra na 10/21 dní“. Opakovaná dodávka každých 3–4 týždne so zľavou prinesie pravidelný príjem.
- **Zostav si balíček:** vitamínové shoty a dvojbalenia „šťava + žihľava“ sa dajú zovšeobecniť (vyber 2–4 šťavy, zľava za balíček).
- **Mapa predajní a trhov:** 15+ partnerských predajní a farmárske trhy (Stará tržnica BA každú sobotu). Mapa s filtrom podľa mesta a kalendár trhov, kde budú budúcu sobotu.
- **Doprava:** Packeta / Z-BOX (na Slovensku dnes štandard) a doprava zdarma nad určitú sumu. Teraz je len Pošta 4 € a GLS 3,65 €.
- **Ocenenia ako dôvera:** Great Taste 2026 viditeľne na produkte aj na úvode.
- **Príbeh a pôvod:** rodinná firma, Liptov, stará mama, zber pod Tatrami. Na stránke O nás to je, ale rozhádzané. Z toho sa dá spraviť silná úvodná sekcia a krátky „ako vzniká šťava“ (zber → lisovanie za studena → fľaša).
- **Blog/Herbár:** dva články sú dobrý základ. Ku každej bylinke patrí článok a k článku súvisiace produkty, čo pomôže aj SEO.
- **Veľkoobchod/B2B:** kontakt spomína veľkoobchod. Stačí jednoduchý formulár „staň sa partnerskou predajňou“.

## 4. Technické

- **Presmerovania 301 sú nutnosť**, inak sa stratí SEO. Mapa je v `data/_redirects` (Netlify formát), 177 pravidiel.
- **Optimalizácia obrázkov:** originály majú 341+ MB, niektoré PNG 10 MB. Pri builde generuj WebP/AVIF v 2–3 veľkostiach (Netlify Image CDN, `@nuxt/image` alebo `sharp`). Fotky produktov (DSC_78xx) sú kvalitné a jednotné, tie stoja za to použiť ako hlavné.
- **SEO:** schema.org `Product` + `Offer` (cena, dostupnosť), `Organization`, `LocalBusiness` pre predajne. Unikátne meta popisy, keďže dnes sú prázdne alebo lorem ipsum.
- **Stack:** Nuxt 3 + Supabase (produkty, objednávky) + Netlify. Pri malom e-shope zvážiť aj headless riešenie, napr. Shopify alebo Medusa, kvôli platbám a fakturácii. Napojenie na SuperFaktúru alebo iKros rieši účtovníkov problém.
- **Právne:** obchodné podmienky a GDPR treba aktualizovať na nového prevádzkovateľa/platobnú bránu. Cookie lišta s reálnou kategorizáciou (teraz sú tam dva GTM kontajnery).
