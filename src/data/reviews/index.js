// Authoring source for the 31 handwritten reviews. App code and the build
// scripts no longer import this file - the archive is served from
// manifest.json + generated/chunk-NNN.json (see archive.js and
// scripts/gen/gen-reviews.mjs). After adding or editing a review here, run:
//   node scripts/gen/gen-reviews.mjs --manifest-only
import skvivrelanatom from './skvivrelanatom.js'
import skvalpugdonatom from './skvalpugdonatom.js'
import sfronundrunBtc from './sfronundrun-btc.js'
import dieFinance from './die-finance.js'
import qoinPrimeCapital from './qoin-prime-capital.js'
import vintyAi from './vinty-ai.js'
import ultratradeAi from './ultratrade-ai.js'
import keplerGroup from './kepler-group.js'
import digitalAssetResearch from './digital-asset-research.js'
import fierovaltrixAi from './fierovaltrix-ai.js'
import algoverseBot from './algoverse-bot.js'
import priors from './priors.js'
import seinavoraAi from './seinavora-ai.js'
import finarvex from './finarvex.js'
import skvaldrevoAiAt from './skvaldrevo-ai-at.js'
import theKryp from './the-kryp.js'
import legacyBitfundexAiApp from './legacy-bitfundex-ai-app.js'
import nexoProgreso from './nexo-progreso.js'
import capinexo from './capinexo.js'
import brentenaSolvario from './brentena-solvario.js'
import immediateBienestar from './immediate-bienestar.js'
import nordiqoApp from './nordiqo-app.js'
import nordiqoAi from './nordiqo-ai.js'
import pioneerKapitiumApp from './pioneer-kapitium-app.js'
import timberRendholtApp from './timber-rendholt-app.js'
import overagePilot from './overage-pilot.js'
import cerfinax from './cerfinax.js'
import observatoireGestion from './observatoire-gestion.js'
import nuqodi from './nuqodi.js'
import cryptoHostRadar from './crypto-host-radar.js'
import keniks from './keniks.js'

// Insertion order doubles as the listing order: new reviews are appended at the
// end, so they land on the next pagination page automatically.
const RAW = [
  skvivrelanatom,
  skvalpugdonatom,
  sfronundrunBtc,
  dieFinance,
  qoinPrimeCapital,
  vintyAi,
  ultratradeAi,
  keplerGroup,
  digitalAssetResearch,
  fierovaltrixAi,
  algoverseBot,
  priors,
  seinavoraAi,
  finarvex,
  skvaldrevoAiAt,
  theKryp,
  legacyBitfundexAiApp,
  nexoProgreso,
  capinexo,
  brentenaSolvario,
  immediateBienestar,
  nordiqoApp,
  nordiqoAi,
  pioneerKapitiumApp,
  timberRendholtApp,
  overagePilot,
  cerfinax,
  observatoireGestion,
  nuqodi,
  cryptoHostRadar,
  keniks,
]

// Overall rating = mean of the five scorecard dimensions, rounded to 1 dp.
// isoDate derives the machine-readable date for JSON-LD from the display date.
// path defaults to /trading/<slug>-review; a review can still override it.
// Every review's CTA buttons point at the Austerio campaign landing with
// ?f=<platform>&subid=BIT unless the review sets its own ctaUrl.
const computed = RAW.map((review) => {
  const dims = Object.values(review.scorecard)
  const rating = Math.round((dims.reduce((sum, d) => sum + d, 0) / dims.length) * 10) / 10
  const isoDate = new Date(`${review.date} UTC`).toISOString().slice(0, 10)
  const path = review.path || `/trading/${review.slug}-review`
  const ctaUrl =
    review.ctaUrl ||
    `https://austerio-smart-up.com/?f=${encodeURIComponent(review.name)}&subid=BIT`
  // Card excerpt: deck clamped to 125 characters, ellipsized on cut.
  const excerpt =
    review.deck.length > 125
      ? `${review.deck.slice(0, 125).trimEnd()}...`
      : review.deck
  return { ...review, rating, isoDate, path, ctaUrl, excerpt }
})

// Rating order - used for the top-rated list, featured review and related cards.
export const REVIEWS = [...computed].sort((a, b) => b.rating - a.rating)

// Listing order - used for the paginated review grid (page 1 / page 2 / …).
export const PAGINATED = computed

export const PAGE_SIZE = 9
export const TOTAL_PAGES = Math.ceil(PAGINATED.length / PAGE_SIZE)

export const getReview = (slug) => REVIEWS.find((r) => r.slug === slug)

export const FEATURED = REVIEWS[0]
