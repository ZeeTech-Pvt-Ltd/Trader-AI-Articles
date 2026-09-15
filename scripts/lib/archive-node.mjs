// Node-side reader for the generated review archive (manifest + chunks).
// Shares buildArchive with the browser module so scripts see the exact same
// expanded review objects the app renders.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildArchive } from '../../src/data/reviews/archive.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const MANIFEST_PATH = join(ROOT, 'src', 'data', 'reviews', 'manifest.json')
const CHUNK_DIR = join(ROOT, 'src', 'data', 'reviews', 'generated')

export function readArchive() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  return buildArchive(manifest.articles)
}

export function readChunk(chunkId) {
  return JSON.parse(
    readFileSync(join(CHUNK_DIR, `chunk-${String(chunkId).padStart(3, '0')}.json`), 'utf8'),
  )
}
