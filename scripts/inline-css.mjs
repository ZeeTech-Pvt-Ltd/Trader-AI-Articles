// Post-build step: inlines the entry CSS into dist/index.html so the browser
// paints from the first HTML bytes with zero render-blocking requests.
// The stylesheet link is replaced by a <style> tag; nothing else changes.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'

const assets = readdirSync('dist/assets')
const cssFile = assets.find((f) => /^index-.*\.css$/.test(f))
if (!cssFile) {
  console.error('no index-*.css found in dist/assets')
  process.exit(1)
}
const css = readFileSync(`dist/assets/${cssFile}`, 'utf8')

const htmlPath = 'dist/index.html'
const html = readFileSync(htmlPath, 'utf8')
let updated = html.replace(
  /<link rel="stylesheet" crossorigin href="\/assets\/index-[^"]*\.css">/,
  `<style>${css}</style>`,
)
if (!updated.includes('<style>')) {
  console.error('stylesheet link not found in dist/index.html')
  process.exit(1)
}
// Vite drops custom attributes from the entry script tag - mark it high
// priority so the app bundle wins bandwidth over the manifest preload.
updated = updated.replace(
  /<script type="module" crossorigin src="\/assets\/index-[^"]*\.js"><\/script>/,
  (tag) => tag.replace('<script', '<script fetchpriority="high"'),
)
writeFileSync(htmlPath, updated)
console.log(`inlined ${cssFile} (${css.length} bytes) into dist/index.html`)
