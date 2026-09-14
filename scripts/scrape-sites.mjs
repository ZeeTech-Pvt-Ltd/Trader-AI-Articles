// One-off research helper: renders each platform site in headless Chrome and
// dumps the visible text so review copy can be written from real published content.
import { chromium } from 'file:///C:/Users/samee/node_modules/playwright/index.mjs'
import { writeFileSync } from 'node:fs'

const SITES = [
  'https://austeriosmart-up.com',
  'https://dorivo-au.net',
  'https://lyravestgrove-au.com',
  'https://polar-zinsmere.com',
  'https://zephgain-au.com',
  'https://bright-kapitune-au.com',
  'https://gemwealth-holm.com',
  'https://rendaven.com',
]

const out = {}
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

for (const url of SITES) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(6000) // let SPA content paint
    const title = await page.title()
    const text = await page.evaluate(() => {
      // trim scripts/styles noise, keep readable copy
      const el = document.body.cloneNode(true)
      el.querySelectorAll('script, style, noscript, iframe, svg').forEach((n) => n.remove())
      return (el.innerText || '').replace(/\n{3,}/g, '\n\n').trim()
    })
    out[url] = { title, text: text.slice(0, 8000) }
    console.log(`OK  ${url} - "${title}" (${text.length} chars)`)
  } catch (err) {
    out[url] = { title: 'ERROR', text: String(err).slice(0, 500) }
    console.log(`ERR ${url} - ${String(err).slice(0, 200)}`)
  }
}

await browser.close()
writeFileSync('scripts/site-content.json', JSON.stringify(out, null, 2))
console.log('saved scripts/site-content.json')
