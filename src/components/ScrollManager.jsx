'use client'

// Cross-page hash navigation (replaces the SPA's ScrollToTop): Next restores
// scroll-to-top on route change by default; this handles arriving with a hash
// (e.g. Header "Reviews" -> /#reviews from an article page).
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollManager() {
  const pathname = usePathname()
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [pathname])
  return null
}
