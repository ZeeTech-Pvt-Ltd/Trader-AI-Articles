// Assembles one generated article from the catalog entry + seeded variations.
import { latins, pick, pickN } from './rng.js'
import { POOLS } from './pools.js'
import { render, renderList } from './templates.js'
import { variationsFor } from './variations.js'

export function buildArticle(catalogEntry, index, rng) {
  const { slug, name, sourceDate, sourceReadTime } = catalogEntry
  const vars = variationsFor(rng, index, sourceDate, sourceReadTime)
  const ctx = {
    name,
    min: vars.minimumDeposit,
    assets: String(vars.assets),
    rating: vars.rating.toFixed(1),
  }

  const deck = render(latins(rng, POOLS.deck, 1)[0], ctx)
  const headline = render(latins(rng, POOLS.headline, 1)[0], ctx)
  const tagline = render(latins(rng, POOLS.tagline, 1)[0], ctx)
  const seoDescription = render(latins(rng, POOLS.seoDescription, 1)[0], ctx)

  const intro = [
    render(latins(rng, POOLS.introA, 1)[0], ctx),
    render(latins(rng, POOLS.introB, 1)[0], ctx),
    render(latins(rng, POOLS.introC, 1)[0], ctx),
  ]

  const whatItClaims = renderList(latins(rng, POOLS.claims, 5), ctx)
  const whatWeChecked = renderList(latins(rng, POOLS.checks, 6), ctx)

  const steps = [
    { title: 'Register', text: render(latins(rng, POOLS.stepTexts.register, 1)[0], ctx) },
    { title: 'Fund', text: render(latins(rng, POOLS.stepTexts.fund, 1)[0], ctx) },
    { title: 'Configure', text: render(latins(rng, POOLS.stepTexts.configure, 1)[0], ctx) },
  ]

  const pros = renderList(latins(rng, POOLS.pros, 4), ctx)
  const cons = renderList(latins(rng, POOLS.cons, 4), ctx)

  // Red flags: 3 for SAFE verdicts, 4 (with a caution-flavoured extra) for
  // CAUTION verdicts, so the caution mark always has visible teeth.
  const flagCount = vars.caution ? 4 : 3
  const redFlags = renderList(latins(rng, POOLS.redFlags, flagCount), ctx)
  if (vars.caution) {
    redFlags.push(render(pick(rng, POOLS.redFlagsCaution), ctx))
  }

  // Five FAQ pairs, always in shuffled-pool order with no repeats.
  const faqs = pickN(rng, POOLS.faqs, 5).map((pair) => ({
    q: render(pair.q, ctx),
    a: render(pair.a, ctx),
  }))

  const bottomLine = [
    render(latins(rng, POOLS.bottomA, 1)[0], ctx),
    render(latins(rng, POOLS.bottomB, 1)[0], ctx),
  ]
  if (vars.caution) bottomLine.push(render(pick(rng, POOLS.cautionLine), ctx))

  return {
    slug,
    keyword: name,
    name,
    tagline,
    headline,
    seoTitle: headline,
    seoDescription,
    deck,
    date: vars.date,
    readTime: vars.readTime,
    byline: vars.byline,
    accent: vars.accent,
    rating: vars.rating,
    assets: vars.assets,
    verdict: vars.verdict,
    targetMarket: pick(rng, POOLS.targetMarketVariants),
    minimumDeposit: vars.minimumDeposit,
    depositMethods: pick(rng, POOLS.depositMethodVariants),
    support: pick(rng, POOLS.supportVariants),
    scorecard: vars.scorecard,
    intro,
    whatItClaims,
    whatWeChecked,
    steps,
    pros,
    cons,
    redFlags,
    faqs,
    bottomLine,
  }
}
