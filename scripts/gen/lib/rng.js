// Deterministic RNG: the same slug always produces the same article bytes,
// so the generator is fully idempotent and re-runs never churn content.

export function hashString(str) {
  // FNV-1a 32-bit
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function rngFor(slug) {
  return mulberry32(hashString(slug))
}

export function int(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1))
}

export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

// Shuffled sample without replacement.
export function pickN(rng, arr, n) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

// Latin-square selection: items taken at (offset + i) % pool.length. Guarantees
// every pool item gets used a nearly equal number of times across thousands of
// articles, and items never repeat within one article (pool > count).
export function latins(rng, pool, count) {
  const offset = int(rng, 0, pool.length - 1)
  return Array.from({ length: count }, (_, i) => pool[(offset + i) % pool.length])
}
