// Mobile performance probe: loads the home page and one article on a
// 375x812 viewport with Slow-4G network + CPU throttling (CDP), then reports
// transfer sizes, request counts and paint timings.
// Run with the dev server up: node scripts/perf-mobile.mjs
import { chromium } from 'file:///C:/Users/samee/node_modules/playwright/index.mjs'
import { readArchive } from './lib/archive-node.mjs'

const BASE = process.env.PERF_BASE || 'http://localhost:5188'
const archive = readArchive()
const article = archive.articles.find((r) => r.date === 'Sep 15, 2026')

async function measure(page, label) {
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0]
    const resources = performance.getEntriesByType('resource').filter((r) => r.transferSize > 0)
    const total = resources.reduce((s, r) => s + r.transferSize, 0)
    const big = resources
      .map((r) => ({ url: r.name.split('/').pop(), kb: Math.round(r.transferSize / 1024) }))
      .sort((a, b) => b.kb - a.kb)
      .slice(0, 8)
    return {
      totalKb: Math.round(total / 1024),
      requests: resources.length,
      ttfb: Math.round(nav.responseStart),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      load: Math.round(nav.loadEventEnd),
      big,
    }
  })
  const lcp = await page.evaluate(
    () =>
      new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entry = list.getEntries().pop()
          if (entry) resolve(Math.round(entry.startTime))
        }).observe({ type: 'largest-contentful-paint', buffered: true })
        setTimeout(() => resolve(null), 3000)
      }),
  )
  console.log(`\n=== ${label} ===`)
  console.log(`transferred: ${metrics.totalKb} KB in ${metrics.requests} requests`)
  console.log(`ttfb ${metrics.ttfb}ms · DOMContentLoaded ${metrics.domContentLoaded}ms · load ${metrics.load}ms · LCP ${lcp ?? 'n/a'}ms`)
  console.log(`largest assets (KB):`, metrics.big.map((b) => `${b.url} ${b.kb}`).join(' | '))
  return metrics
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({
  viewport: { width: 375, height: 812 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 3,
})
const cdp = await context.newCDPSession(await context.newPage())
await cdp.send('Network.enable')
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: (1.6 * 1024 * 1024) / 8, // Slow 4G
  uploadThroughput: (750 * 1024) / 8,
  latency: 150,
})
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })

// Cold home load.
{
  const page = await context.newPage()
  const t0 = Date.now()
  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForSelector('.review-card:not(.review-card--skeleton)', { timeout: 30000 })
  const tCards = Date.now() - t0
  await measure(page, `Home 375x812 Slow-4G (9 cards visible in ${tCards}ms)`)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  console.log('horizontal overflow:', overflow)
  await page.close()
}

// Article navigation (manifest cached, chunk fetch added).
{
  const page = await context.newPage()
  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForSelector('.review-card:not(.review-card--skeleton)', { timeout: 30000 })
  await page.evaluate(() => performance.clearResourceTimings())
  const t0 = Date.now()
  await page.goto(`${BASE}${article.path}`, { waitUntil: 'load' })
  await page.waitForSelector('.facts__row', { timeout: 30000 })
  const tFacts = Date.now() - t0
  await measure(page, `Article (${article.slug}) warm-nav Slow-4G (facts in ${tFacts}ms)`)
  await page.close()
}

await browser.close()
