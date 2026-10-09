#!/usr/bin/env node
// Naplní Supabase databázu obsahom zo starého webu (data/*.json, content/**/*.md).
//
// Použitie (z koreňa repozitára):
//   npm run import:dry      # nič nezapisuje, vypíše prehľad a uloží náhľad do .cache/import-preview.json
//   npm run import          # zapíše do Supabase (potrebuje .env so SUPABASE_URL a SUPABASE_SERVICE_ROLE_KEY)
//
// Skript sa dá spustiť opakovane: záznamy páruje podľa slugu (upsert), varianty, obrázky
// a väzby produktu na kategórie/štítky pri každom behu nahradí aktuálnymi.
//
// Obrázky: cesty v DB smerujú do bucketu `media` na webové verzie (.webp) z obrazky-web/.
// Samotné súbory nahrá `npm run obrazky:upload`.

import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DRY = process.argv.includes('--dry')
const OLD_SITE = 'https://www.bylinkyspodtatier.sk'
const SITE_NAME_SUFFIX = / :: Bylinky spod Tatier$/

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://inisctjmatxfbxnjtwqz.supabase.co'
const MEDIA_BASE = `${SUPABASE_URL}/storage/v1/object/public/media/`

// kolekcie zo starého webu → štítky (nie kategórie)
const COLLECTION_TAGS = { 'Novinky': 'novinka', 'Ocenené produkty': 'ocenene', 'Sezónne produkty': 'sezonne' }
// stránky z content/stranky, ktoré nie sú obsahové (zoznamy riešia Nuxt stránky)
const SKIP_PAGES = new Set(['obchod', 'clanky'])

// ---------- pomocné funkcie ----------

const readJson = async (p) => JSON.parse(await readFile(path.join(ROOT, p), 'utf8'))

const slugify = (s) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** obrazky/produkty/x/x-01.jpg → produkty/x/x-01.webp (cesta v buckete media) */
const toStoragePath = (local) => local.replace(/^(\.\.\/)*obrazky\//, '').replace(/\.[a-z0-9]+$/i, '.webp')

let redirectMap = new Map()

/** prepíše v Markdowne lokálne obrázky na URL v Storage a odkazy na starý web na nové cesty */
function rewriteMarkdown(md) {
  return md
    .replace(/\]\(((?:\.\.\/)*obrazky\/[^)\s]+)\)/g, (_, p) => `](${MEDIA_BASE}${toStoragePath(p)})`)
    .replace(/\]\((https?:\/\/(?:www\.)?bylinkyspodtatier\.sk)?(\/[^)\s]*)\)/g, (m, host, p) => {
      const key = decodeURIComponent(p.split(/[?#]/)[0])
      const target = redirectMap.get(key)
      if (target) return `](${target})`
      return host ? m : `](${OLD_SITE}${p})`
    })
}

const SIZE_RE = /(\d+(?:[.,]\d+)?)\s*(ml|l|g|kg|ks)\b/gi

function normalizeSize(num, unit) {
  let n = parseFloat(num.replace(',', '.'))
  unit = unit.toLowerCase()
  if (unit === 'ml' && n >= 1000 && n % 1000 === 0) return `${n / 1000} l`
  if (unit === 'l' && n < 1) return `${Math.round(n * 1000)} ml`
  return `${String(n).replace('.', ',')} ${unit}`
}

/** "Plastová flaša 250ml" → { size_label: "250 ml", packaging: "plast" } */
export function parseVariantLabel(label) {
  const packaging = /skl/i.test(label) ? 'sklo' : /plast/i.test(label) ? 'plast' : null
  if (label.includes('+')) return { size_label: label.replace(/\s+/g, ' ').trim(), packaging } // kúry/balíčky
  const sizes = [...label.matchAll(SIZE_RE)]
  const size_label = sizes.length ? normalizeSize(sizes[0][1], sizes[0][2]) : label.trim()
  return { size_label, packaging }
}

/** pri produktoch bez variantov skúsi nájsť objem/hmotnosť v popise */
function sizeFromDescription(md) {
  const m = md.match(/\*\*(?:Objem|Váha|Hmotnosť)\s*:?\*\*:?\s*([^\n]+)/i)
  if (!m) return null
  const s = [...m[1].matchAll(SIZE_RE)]
  return s.length === 1 ? normalizeSize(s[0][1], s[0][2]) : null
}

function parseStores(md) {
  const stores = []
  for (const line of md.split('\n')) {
    if (!line.includes('**')) continue
    const urls = [...line.matchAll(/\]\((https?:[^)\s]+)\)/g)].map((m) => m[1])
    const text = line
      .replace(/\]\([^)]*\)/g, '')
      .replace(/[[\]*]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s+,/g, ',')
      .trim()
    if (!text || /^Partnersk/i.test(text)) continue
    const i = text.indexOf(',')
    const name = (i > 0 ? text.slice(0, i) : text).trim()
    const address = i > 0 ? text.slice(i + 1).trim() : null
    const cityMatch = address?.match(/\d{3}\s?\d{2}\s+(.+)$/)
    const city = cityMatch ? cityMatch[1].trim() : address && !/\d/.test(address) ? address : null
    const maps_url = urls.find((u) => /google\./.test(u)) ?? null
    const coords = maps_url?.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) ?? maps_url?.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    stores.push({
      name,
      address,
      city,
      maps_url,
      lat: coords ? Number(coords[1]) : null,
      lng: coords ? Number(coords[2]) : null,
      is_active: true,
    })
  }
  return stores
}

async function readMarkdownDir(dir) {
  const out = []
  for (const f of (await readdir(path.join(ROOT, dir))).filter((f) => f.endsWith('.md')).sort()) {
    const { data, content } = matter(await readFile(path.join(ROOT, dir, f), 'utf8'))
    out.push({ fm: data, body: content.trim() + '\n' })
  }
  return out
}

// ---------- príprava dát ----------

async function buildDataset() {
  const products = await readJson('data/produkty.json')
  const categoriesJson = await readJson('data/kategorie.json')
  const web = await readJson('data/web.json')

  const redirectsCsv = await readFile(path.join(ROOT, 'data/redirecty.csv'), 'utf8')
  redirectMap = new Map(
    redirectsCsv
      .replace(/^﻿/, '')
      .split(/\r?\n/)
      .slice(1)
      .filter(Boolean)
      .map((l) => l.split(';'))
      .map(([from, to]) => [decodeURIComponent(from), to]),
  )

  // kategórie (bez kolekcií) + kategórie, ktoré majú produkty, ale nie sú v menu (napr. Čaje)
  const categories = categoriesJson
    .filter((c) => !c.is_collection)
    .map((c, i) => ({ slug: c.slug, name: c.name, position: i + 1, is_published: true, _products: c.products }))
  for (const p of products) {
    for (const name of p.categories) {
      if (COLLECTION_TAGS[name] || categories.some((c) => c.name === name)) continue
      categories.push({ slug: slugify(name), name, position: categories.length + 1, is_published: false, _products: [] })
    }
  }
  const catByName = new Map(categories.map((c) => [c.name, c]))

  const productRows = products.map((p) => {
    const description_md = rewriteMarkdown(p.description_md)
    const variants = p.variants.length
      ? p.variants.map((v, i) => ({
          ...parseVariantLabel(v.label),
          sku: `${p.slug}-${slugify(v.label)}`.slice(0, 120),
          price: v.price,
          compare_at_price: v.compare_at_price ?? null,
          stock_qty: v.in_stock ? null : 0,
          is_active: true,
          position: i,
        }))
      : [
          {
            size_label: sizeFromDescription(p.description_md),
            packaging: null,
            sku: p.slug,
            price: p.price_from,
            compare_at_price: p.compare_at_price ?? null,
            stock_qty: p.in_stock ? null : 0,
            is_active: true,
            position: 0,
          },
        ]
    const cats = p.categories
      .filter((n) => !COLLECTION_TAGS[n])
      .map((n) => {
        const c = catByName.get(n)
        const pos = c._products.indexOf(p.slug)
        return { slug: c.slug, position: pos >= 0 ? pos : 999 }
      })
    return {
      row: {
        slug: p.slug,
        name: p.title,
        description_md,
        is_published: true,
        old_url: p.old_url,
      },
      primaryCategorySlug: catByName.get(p.primary_category)?.slug ?? null,
      categories: cats,
      tags: p.categories.filter((n) => COLLECTION_TAGS[n]).map((n) => COLLECTION_TAGS[n]),
      variants,
      images: p.images.map((img, i) => ({ storage_path: toStoragePath(img), alt: p.title, position: i })),
    }
  })

  const pageFiles = await readMarkdownDir('content/stranky')
  const pages = pageFiles
    .filter(({ fm }) => !SKIP_PAGES.has(fm.slug))
    .map(({ fm, body }) => ({
      slug: fm.slug,
      title: fm.title,
      body_md: rewriteMarkdown(body),
      seo_title: (fm.meta_title ?? '').replace(SITE_NAME_SUFFIX, '') || null,
      seo_description: fm.meta_description || null,
    }))

  const articleFiles = await readMarkdownDir('content/clanky')
  const articles = articleFiles.map(({ fm, body }) => {
    const cover = body.match(/^!\[[^\]]*\]\(([^)]+)\)\s*\n/)
    let rest = cover ? body.slice(cover[0].length) : body
    rest = rest.replace(/^\s*#\s+.+\n/, '').replace(/^\s*\d{2}\.\d{2}\.\d{4}\s*\n/, '')
    return {
      slug: fm.slug,
      title: fm.title,
      excerpt: fm.meta_description || null,
      body_md: rewriteMarkdown(rest.trim() + '\n'),
      cover_image_path: cover ? toStoragePath(cover[1]) : null,
      status: 'published',
      published_at: fm.date ? `${fm.date}T08:00:00+02:00` : null,
    }
  })

  const storesPage = pageFiles.find(({ fm }) => fm.slug === 'partnerske-predajne')
  const stores = storesPage ? parseStores(storesPage.body) : []

  const settings = [
    { key: 'contact', value: web.contact },
    { key: 'footer_md', value: rewriteMarkdown(web.footer_md) },
  ]

  return { categories, productRows, pages, articles, stores, settings }
}

// ---------- zápis do Supabase ----------

async function writeToSupabase(ds) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!process.env.SUPABASE_URL || !key) {
    console.error('Chýba SUPABASE_URL alebo SUPABASE_SERVICE_ROLE_KEY v .env (pozri .env.example).')
    process.exit(1)
  }
  const { createClient } = await import('@supabase/supabase-js')
  const db = createClient(process.env.SUPABASE_URL, key, { auth: { persistSession: false } })
  const check = (res, what) => {
    if (res.error) throw new Error(`${what}: ${res.error.message}`)
    return res.data
  }

  // kategórie
  const cats = check(
    await db.from('categories').upsert(ds.categories.map(({ _products, ...c }) => c), { onConflict: 'slug' }).select('id, slug'),
    'categories',
  )
  const catId = new Map(cats.map((c) => [c.slug, c.id]))

  const tags = check(await db.from('tags').select('id, slug'), 'tags')
  const tagId = new Map(tags.map((t) => [t.slug, t.id]))

  // produkty
  const prods = check(
    await db
      .from('products')
      .upsert(
        ds.productRows.map((p) => ({ ...p.row, primary_category_id: catId.get(p.primaryCategorySlug) ?? null })),
        { onConflict: 'slug' },
      )
      .select('id, slug'),
    'products',
  )
  const prodId = new Map(prods.map((p) => [p.slug, p.id]))
  const ids = [...prodId.values()]

  // väzby a podriadené záznamy – nahradiť aktuálnymi
  for (const table of ['product_categories', 'product_tags', 'product_images']) {
    check(await db.from(table).delete().in('product_id', ids), `${table} delete`)
  }
  // varianty: upsert podľa sku (objednávky na ne môžu odkazovať, preto nemazať)
  const variants = ds.productRows.flatMap((p) => p.variants.map((v) => ({ ...v, product_id: prodId.get(p.row.slug) })))
  check(await db.from('product_variants').upsert(variants, { onConflict: 'sku' }), 'product_variants')
  const keepSkus = new Set(variants.map((v) => v.sku))
  const existing = check(await db.from('product_variants').select('id, sku').in('product_id', ids), 'variants select')
  const stale = existing.filter((v) => !keepSkus.has(v.sku)).map((v) => v.id)
  if (stale.length) check(await db.from('product_variants').update({ is_active: false }).in('id', stale), 'variants deactivate')

  check(
    await db.from('product_categories').insert(
      ds.productRows.flatMap((p) =>
        p.categories.map((c) => ({ product_id: prodId.get(p.row.slug), category_id: catId.get(c.slug), position: c.position })),
      ),
    ),
    'product_categories',
  )
  const tagRows = ds.productRows.flatMap((p) => p.tags.map((t) => ({ product_id: prodId.get(p.row.slug), tag_id: tagId.get(t) })))
  if (tagRows.length) check(await db.from('product_tags').insert(tagRows), 'product_tags')
  check(
    await db
      .from('product_images')
      .insert(ds.productRows.flatMap((p) => p.images.map((i) => ({ ...i, product_id: prodId.get(p.row.slug) })))),
    'product_images',
  )

  // obsah
  check(await db.from('pages').upsert(ds.pages, { onConflict: 'slug' }), 'pages')
  check(await db.from('articles').upsert(ds.articles, { onConflict: 'slug' }), 'articles')
  check(await db.from('stores').delete().gte('id', 0), 'stores delete')
  check(await db.from('stores').insert(ds.stores), 'stores')
  check(await db.from('settings').upsert(ds.settings, { onConflict: 'key' }), 'settings')
}

// ---------- spustenie ----------

const ds = await buildDataset()
const variantCount = ds.productRows.reduce((s, p) => s + p.variants.length, 0)
const imageCount = ds.productRows.reduce((s, p) => s + p.images.length, 0)
console.log(
  `Kategórie: ${ds.categories.length} · Produkty: ${ds.productRows.length} · Varianty: ${variantCount} · ` +
    `Obrázky produktov: ${imageCount} · Stránky: ${ds.pages.length} · Články: ${ds.articles.length} · Predajne: ${ds.stores.length}`,
)

if (DRY) {
  await mkdir(path.join(ROOT, '.cache'), { recursive: true })
  await writeFile(path.join(ROOT, '.cache/import-preview.json'), JSON.stringify(ds, null, 2))
  console.log('Režim --dry: nič sa nezapísalo. Náhľad: .cache/import-preview.json')
} else {
  await writeToSupabase(ds)
  console.log('Import dokončený.')
}
