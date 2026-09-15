// Numeric facts and editorial parameters per article, all seeded by slug.
import { int, pick } from './rng.js'

export const BYLINES = [
  'George Soros',
  'Jesse Livermore',
  'Paul Tudor Jones',
  'Jim Simons',
  'Stanley Druckenmiller',
  'chris coverdale',
  'Takashi Kotegawa',
  'Shay Huang',
  'Adam Khoo',
]

export const ACCENTS = [
  '#e11d48', '#92400e', '#b91c1c', '#0f766e', '#1d4ed8', '#7c3aed',
  '#be185d', '#c2410c', '#047857', '#0369a1', '#a21caf', '#b45309',
  '#dc2626', '#4338ca', '#15803d', '#9d174d', '#ea6a1f', '#0e7490',
  '#6d28d9', '#b91c1c', '#155e75', '#9a3412', '#4d7c0f', '#7e22ce',
]

const DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

// Scorecard dims jittered around the target rating with offsets that sum to
// zero, so the mean of the five dims is exactly the target (to 1 dp) while
// each dim stays within a believable band.
function scorecardFor(rng, target) {
  const maxUp = Math.min(0.3, 4.7 - target)
  const maxDown = Math.min(0.3, target - 3.6)
  const stepsUp = Math.round(maxUp * 10)
  const stepsDown = Math.round(maxDown * 10)
  for (let attempt = 0; attempt < 30; attempt++) {
    const offsets = []
    let sum = 0
    for (let i = 0; i < 4; i++) {
      const max = i % 2 === 0 ? stepsUp : stepsDown
      const min = i % 2 === 0 ? -stepsDown : -stepsUp
      const o = int(rng, min, max)
      offsets.push(o)
      sum += o
    }
    const last = -sum
    if (last >= -stepsDown && last <= stepsUp) {
      const raw = [offsets[0], offsets[1], offsets[2], offsets[3], last].map(
        (o) => Math.round((target + o / 10) * 10) / 10,
      )
      // Clamp defensively and repair the mean if a clamp bit.
      const dims = raw.map((d) => Math.min(4.7, Math.max(3.6, d)))
      const err = Math.round((target * 5 - dims.reduce((s, d) => s + d, 0)) * 10) / 10
      if (err !== 0) dims[4] = Math.round((dims[4] + err) * 10) / 10
      return { easeOfUse: dims[0], features: dims[1], transparency: dims[2], security: dims[3], support: dims[4] }
    }
  }
  // Deterministic fallback: four dims at target, one a tenth off.
  return { easeOfUse: target, features: target, transparency: target, security: target, support: Math.round((target - 0.1) * 10) / 10 }
}

export function variationsFor(rng, index, sourceDate, sourceReadTime) {
  const depositRoll = rng()
  const minimumDeposit = depositRoll < 0.15 ? 'US$200' : depositRoll < 0.85 ? 'US$250' : 'US$300'
  const assets = int(rng, 8, 12)
  const targetRating = Math.round((4.0 + int(rng, 0, 6) * 0.1) * 10) / 10
  const scorecard = scorecardFor(rng, targetRating)
  const rating = Math.round(
    ((scorecard.easeOfUse + scorecard.features + scorecard.transparency + scorecard.security + scorecard.support) / 5) * 10,
  ) / 10

  const date = sourceDate && /^[A-Z][a-z]{2} \d{1,2}, 2026$/.test(sourceDate)
    ? sourceDate
    : `Sep ${pick(rng, DAYS)}, 2026`
  const readTime = sourceReadTime && /^\d{1,2} min read$/.test(sourceReadTime)
    ? sourceReadTime
    : `${int(rng, 8, 11)} min read`

  const byline = BYLINES[index % BYLINES.length]
  const accent = pick(rng, ACCENTS)
  const caution = rng() < 0.03
  const verdict = caution ? 'CAUTION - LIMITED DISCLOSURE' : 'SAFE - WITH CONDITIONS'

  return { minimumDeposit, assets, scorecard, rating, date, readTime, byline, accent, caution, verdict }
}
