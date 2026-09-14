import { useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import ReviewArticle from './pages/ReviewArticle.jsx'
import OfferPage from './pages/OfferPage.jsx'
import About from './pages/About.jsx'
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
          <Route path="/review/:slug" element={<ReviewArticle />} />
          <Route path="/trading/:slug" element={<ReviewArticle />} />
          <Route path="/go/:keyword" element={<OfferPage />} />
          <Route path="/about" element={<About />} />
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
