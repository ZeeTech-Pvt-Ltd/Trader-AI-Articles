// Browser-only data loader (moved from src/data/reviews/archive.js).
// Used only by the client-side search island, which fetches the public
// manifest lazily on first use.
import { buildArchive } from '../data/reviews/archive.js'

let manifestPromise = null
export function loadManifest() {
  // Module-level cache: StrictMode double-effects and re-navigations share
  // one fetch. Served from public/manifest.json (written by the generator).
  manifestPromise ??= fetch('/manifest.json')
    .then((res) => {
      if (!res.ok) throw new Error(`manifest ${res.status}`)
      return res.json()
    })
    .then((manifest) => buildArchive(manifest.articles ?? []))
  return manifestPromise
}
