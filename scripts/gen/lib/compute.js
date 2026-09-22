// The computed-field formulas, mirrored from src/data/reviews/index.js so the
// generated articles derive rating/isoDate/path/ctaUrl/excerpt identically.
// A validator in gen-reviews.mjs re-checks every entry against these.

export function ratingOf(scorecard) {
  const dims = Object.values(scorecard)
  return Math.round((dims.reduce((sum, d) => sum + d, 0) / dims.length) * 10) / 10
}

export function isoDateOf(date) {
  return new Date(`${date} UTC`).toISOString().slice(0, 10)
}

export function pathOf(slug) {
  return `/trading/${slug}-review`
}

export function ctaUrlOf(name) {
  return `https://austerio-smart-up.com/?f=${encodeURIComponent(name)}&subid=BIT&src=TAI`
}

export function excerptOf(deck) {
  return deck.length > 125 ? `${deck.slice(0, 125).trimEnd()}...` : deck
}
