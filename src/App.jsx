import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
// Route-level code splitting: each page (and its dependencies, like
// intl-tel-input on the offer funnel) is fetched only when that route opens.
// Home stays static - it is the landing page, it is tiny, and keeping it out
// of a lazy chunk avoids an extra round trip before the first cards render.
import Home from './pages/Home.jsx'
const ReviewArticle = lazy(() => import('./pages/ReviewArticle.jsx'))
const OfferPage = lazy(() => import('./pages/OfferPage.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
// Legal pages are tiny - they stay in the main bundle.
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import TermsOfUse from './pages/TermsOfUse.jsx'
import RiskDisclosure from './pages/RiskDisclosure.jsx'
import AdvertisingDisclosure from './pages/AdvertisingDisclosure.jsx'
import NotFound from './pages/NotFound.jsx'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    // Hash links (e.g. /#reviews) scroll to the target section; anything else
    // starts at the top of the page.
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

// Brief placeholder while a route chunk loads (pages render their own,
// richer skeletons right after).
function PageLoading() {
  return (
    <div className="container" style={{ padding: '48px 0' }}>
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--line" style={{ width: '70%' }} />
    </div>
  )
}

export default function App() {
  return (
    <div className="site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollToTop />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/page/:page" element={<Home />} />
          <Route
            path="/review/:slug"
            element={
              <Suspense fallback={<PageLoading />}>
                <ReviewArticle />
              </Suspense>
            }
          />
          <Route
            path="/trading/:slug"
            element={
              <Suspense fallback={<PageLoading />}>
                <ReviewArticle />
              </Suspense>
            }
          />
          <Route
            path="/go/:keyword"
            element={
              <Suspense fallback={<PageLoading />}>
                <OfferPage />
              </Suspense>
            }
          />
          <Route
            path="/about"
            element={
              <Suspense fallback={<PageLoading />}>
                <About />
              </Suspense>
            }
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/risk-disclosure" element={<RiskDisclosure />} />
          <Route path="/advertising-disclosure" element={<AdvertisingDisclosure />} />
          <Route path="/reviews" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
