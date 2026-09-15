import { useEffect, useState } from 'react'
import { loadManifest } from '../data/reviews/archive.js'

// Loads the review archive manifest once per session. Returns null until the
// manifest resolves - pages render their skeleton in that window.
export default function useArchive() {
  const [archive, setArchive] = useState(null)
  useEffect(() => {
    let live = true
    loadManifest().then((a) => {
      if (live) setArchive(a)
    })
    return () => {
      live = false
    }
  }, [])
  return archive
}
