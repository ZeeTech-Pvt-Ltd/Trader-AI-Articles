// Server-side review archive access for Next.js. Reads the generated
// manifest.json + chunk files directly from disk (fs), reusing the pure
// buildArchive/dimsToObject/ctaUrlFor/reviewCountFor helpers from
// src/data/reviews/archive.js.
import { cache } from 'react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildArchive } from '../data/reviews/archive.js'

const MANIFEST = join(process.cwd(), 'src', 'data', 'reviews', 'manifest.json')
const CHUNK_DIR = join(process.cwd(), 'src', 'data', 'reviews', 'generated')

function loadArchive() {
  return buildArchive(JSON.parse(readFileSync(MANIFEST, 'utf8')).articles ?? [])
}

// Dev: re-read every request so generator re-runs show up without a restart.
// Build/start: memoize once per worker (the 1.3MB manifest parses once).
const getArchive =
  process.env.NODE_ENV === 'development'
    ? loadArchive
    : () => {
        globalThis.__taiArchive ??= loadArchive()
        return globalThis.__taiArchive
      }

export const readArchive = cache(getArchive)

export const readChunk = cache((chunkId) =>
  JSON.parse(
    readFileSync(join(CHUNK_DIR, `chunk-${String(chunkId).padStart(3, '0')}.json`), 'utf8'),
  ),
)

export const getReviewByPath = cache((path) => readArchive().byPath.get(path) ?? null)
export const getReviewBySlug = cache((slug) => readArchive().bySlug.get(slug) ?? null)
export const getReviewByKeyword = cache((keyword) => readArchive().byKeyword.get(keyword) ?? null)

// Merged manifest entry + body chunk (what useReviewBody produced client-side).
export const getReviewFull = cache((entry) =>
  entry ? { ...entry, ...(readChunk(entry.chunkId)?.[entry.slug] ?? {}) } : null,
)
