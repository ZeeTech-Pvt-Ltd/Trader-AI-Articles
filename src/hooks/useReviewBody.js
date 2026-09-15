import { useEffect, useState } from 'react'
import { loadChunk } from '../data/reviews/archive.js'

// Loads the full article body for a manifest entry by lazy-loading its chunk.
// Returns { status: 'idle' | 'loading' | 'ready' | 'error', body }.
export default function useReviewBody(entry) {
  const [state, setState] = useState({ status: entry ? 'loading' : 'idle', body: null })

  useEffect(() => {
    if (!entry) {
      setState({ status: 'idle', body: null })
      return undefined
    }
    let live = true
    setState({ status: 'loading', body: null })
    loadChunk(entry.chunkId)
      .then((chunk) => {
        if (!live) return
        const body = chunk?.[entry.slug]
        setState(body ? { status: 'ready', body } : { status: 'error', body: null })
      })
      .catch(() => {
        if (live) setState({ status: 'error', body: null })
      })
    return () => {
      live = false
    }
  }, [entry?.slug, entry?.chunkId])

  return state
}
