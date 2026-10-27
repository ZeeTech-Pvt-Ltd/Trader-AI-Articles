// Reads articles dropped into content/posts/<type>/<slug>.json by the external
// publisher. Everything is optional: no content/posts dir means no posts.
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const POSTS_DIR = join(process.cwd(), 'content', 'posts')
const SAFE = /^[a-z0-9][a-z0-9_-]*$/i

export function listDropPosts() {
  if (!existsSync(POSTS_DIR)) return []
  const out = []
  for (const type of readdirSync(POSTS_DIR, { withFileTypes: true })) {
    if (!type.isDirectory() || !SAFE.test(type.name)) continue
    for (const f of readdirSync(join(POSTS_DIR, type.name))) {
      if (f.endsWith('.json')) out.push({ type: type.name, slug: f.slice(0, -5) })
    }
  }
  return out
}

export function getDropPost(type, slug) {
  if (!SAFE.test(type) || !SAFE.test(slug)) return null
  try {
    return JSON.parse(readFileSync(join(POSTS_DIR, type, `${slug}.json`), 'utf8'))
  } catch {
    return null
  }
}
