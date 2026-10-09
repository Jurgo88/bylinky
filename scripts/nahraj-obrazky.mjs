#!/usr/bin/env node
// Nahrá webové verzie obrázkov z obrazky-web/ do Supabase Storage (bucket `media`).
//
// Použitie (z koreňa repozitára, po `npm run obrazky:web`):
//   npm run obrazky:upload               # nahrá všetko (prepíše existujúce)
//   npm run obrazky:upload -- --missing  # nahrá len tie, ktoré v buckete ešte nie sú
//
// Potrebuje .env so SUPABASE_URL a SUPABASE_SERVICE_ROLE_KEY (pozri .env.example).
// Cesta v buckete = cesta v obrazky-web/, napr. produkty/medovka/medovka-01.webp

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const WEB = path.join(ROOT, 'obrazky-web')
const BUCKET = 'media'
const CONCURRENCY = 6
const ONLY_MISSING = process.argv.includes('--missing')

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Chýba SUPABASE_URL alebo SUPABASE_SERVICE_ROLE_KEY v .env (pozri .env.example).')
  process.exit(1)
}
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const manifest = JSON.parse(
  await readFile(path.join(WEB, 'manifest.json'), 'utf8').catch(() => {
    console.error('Chýba obrazky-web/manifest.json. Najprv spusti: npm run obrazky:web')
    process.exit(1)
  }),
)
const files = Object.values(manifest).map((m) => m.web.replace(/^obrazky-web\//, ''))

async function existingPaths() {
  const found = new Set()
  async function list(prefix) {
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await db.storage.from(BUCKET).list(prefix, { limit: 1000, offset })
      if (error) throw error
      for (const item of data) {
        const p = prefix ? `${prefix}/${item.name}` : item.name
        if (item.id) found.add(p)
        else await list(p) // priečinok
      }
      if (data.length < 1000) break
    }
  }
  await list('')
  return found
}

const skip = ONLY_MISSING ? await existingPaths() : new Set()
const todo = files.filter((f) => !skip.has(f))
console.log(`Nahrávam ${todo.length} obrázkov do bucketu "${BUCKET}"${skip.size ? ` (${files.length - todo.length} už existuje)` : ''}`)

let next = 0
let done = 0
const errors = []
async function worker() {
  while (next < todo.length) {
    const rel = todo[next++]
    const body = await readFile(path.join(WEB, rel))
    const { error } = await db.storage.from(BUCKET).upload(rel, body, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: true,
    })
    if (error) errors.push(`${rel}: ${error.message}`)
    done++
    if (done % 20 === 0 || done === todo.length) process.stdout.write(`\r  ${done}/${todo.length}`)
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
process.stdout.write('\n')

console.log(`Hotovo: ${todo.length - errors.length} nahraných, ${errors.length} chýb`)
if (errors.length) {
  for (const e of errors) console.log('  ' + e)
  process.exitCode = 1
}
console.log(`Verejná URL: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/<cesta>`)
