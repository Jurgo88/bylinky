#!/usr/bin/env node
// Zmenší originálne obrázky z obrazky/ na webovú veľkosť a uloží ich ako WebP do obrazky-web/.
//
// Použitie (z koreňa repozitára):
//   npm install
//   npm run obrazky:web                     # predvolené: max 1600 px, kvalita 80
//   npm run obrazky:web -- --max 2000 --quality 85
//   npm run obrazky:web -- --force          # prepočíta aj už spracované
//
// Výstup:
//   obrazky-web/<rovnaká cesta>.webp        # napr. obrazky-web/produkty/medovka/medovka-01.webp
//   obrazky-web/manifest.json               # originál → web, rozmery, veľkosti (pre upload a <img width/height>)

import { readdir, stat, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'obrazky')
const OUT = path.join(ROOT, 'obrazky-web')
const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tif', '.tiff'])

const args = process.argv.slice(2)
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : def
}
const MAX = opt('max', 1600)
const QUALITY = opt('quality', 80)
const FORCE = args.includes('--force')
const CONCURRENCY = Math.max(1, Math.min(4, os.cpus().length - 1))

const toPosix = (p) => p.split(path.sep).join('/')
const mb = (b) => (b / 1024 / 1024).toFixed(1) + ' MB'

async function walk(dir) {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(p)))
    else if (EXT.has(path.extname(e.name).toLowerCase())) out.push(p)
  }
  return out
}

async function processOne(src) {
  const rel = path.relative(SRC, src)
  const dest = path.join(OUT, rel.replace(/\.[^.]+$/, '.webp'))
  const srcStat = await stat(src)

  if (!FORCE) {
    const destStat = await stat(dest).catch(() => null)
    if (destStat && destStat.mtimeMs >= srcStat.mtimeMs) {
      const meta = await sharp(dest).metadata()
      return { rel, dest, skipped: true, inBytes: srcStat.size, outBytes: destStat.size, width: meta.width, height: meta.height }
    }
  }

  await mkdir(path.dirname(dest), { recursive: true })
  const info = await sharp(src, { failOn: 'none' })
    .rotate()                                            // otočenie podľa EXIF
    .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 5, smartSubsample: true })
    .toFile(dest)                                        // metadáta (EXIF, GPS) sa neprenášajú

  return { rel, dest, skipped: false, inBytes: srcStat.size, outBytes: info.size, width: info.width, height: info.height }
}

async function main() {
  const files = await walk(SRC).catch(() => {
    console.error(`Priečinok ${SRC} neexistuje. Najprv stiahni obrázky: scripts\\stiahni-obrazky.ps1`)
    process.exit(1)
  })
  console.log(`Spracúvam ${files.length} obrázkov → ${toPosix(path.relative(ROOT, OUT))}/ (max ${MAX} px, kvalita ${QUALITY})`)

  const results = []
  const errors = []
  let next = 0
  let done = 0

  async function worker() {
    while (next < files.length) {
      const src = files[next++]
      try {
        results.push(await processOne(src))
      } catch (err) {
        errors.push({ file: toPosix(path.relative(ROOT, src)), error: err.message })
      }
      done++
      if (done % 20 === 0 || done === files.length) process.stdout.write(`\r  ${done}/${files.length}`)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  process.stdout.write('\n')

  results.sort((a, b) => a.rel.localeCompare(b.rel))
  const manifest = Object.fromEntries(
    results.map((r) => [
      'obrazky/' + toPosix(r.rel),
      { web: toPosix(path.relative(ROOT, r.dest)), width: r.width, height: r.height, bytes: r.outBytes },
    ]),
  )
  await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))

  const inTotal = results.reduce((s, r) => s + r.inBytes, 0)
  const outTotal = results.reduce((s, r) => s + r.outBytes, 0)
  const skipped = results.filter((r) => r.skipped).length
  console.log(`Hotovo: ${results.length - skipped} spracovaných, ${skipped} preskočených (už aktuálne), ${errors.length} chýb`)
  console.log(`Veľkosť: ${mb(inTotal)} → ${mb(outTotal)} (${inTotal ? Math.round((1 - outTotal / inTotal) * 100) : 0} % menej)`)
  if (errors.length) {
    console.log('Chyby:')
    for (const e of errors) console.log(`  ${e.file}: ${e.error}`)
    process.exitCode = 1
  }
}

main()
