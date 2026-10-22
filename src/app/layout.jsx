import { Plus_Jakarta_Sans, Inter, IBM_Plex_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import ScrollManager from '../components/ScrollManager.jsx'
import { SITE } from '../data/site.js'

// variable: registers the @font-face under the original family name, so the
// CSS custom properties in globals.css (--heading/--body/--mono) keep working.
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-jakarta' })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono' })

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} - ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    locale: 'en_US',
    type: 'website',
    siteName: SITE.name,
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  verification: { google: 'hCfXayQozP_GEBjCvlxUUoLQXRBQQ1O88jTGY7VK9uc' },
  icons: { icon: '/favicon.svg' },
}

export const viewport = { themeColor: '#ea6a1f' }

const ORG_JSONLD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://traderai.ai/#org',
      name: 'Trader AI',
      url: 'https://traderai.ai/',
      logo: 'https://traderai.ai/og-image.png',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://traderai.ai/#website',
      url: 'https://traderai.ai/',
      name: 'Trader AI',
      description:
        'Trader AI reviews for 2026: what each platform claims, what we verified, and our verdict - safe, legit or a scam.',
      publisher: { '@id': 'https://traderai.ai/#org' },
    },
  ],
}).replace(/</g, '\\u003c')

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.className} ${mono.className}`}>
      <body>
        {/* Marks JS availability so Reveal keeps server content visible without it */}
        <Script id="js-bootstrap" strategy="beforeInteractive">
          {`document.documentElement.classList.add('js')`}
        </Script>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="site">
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </div>
        <ScrollManager />
        <script type="application/ld+json" id="org-jsonld" dangerouslySetInnerHTML={{ __html: ORG_JSONLD }} />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-SFSN7QYL3V" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments)} gtag('js', new Date()); gtag('config', 'G-SFSN7QYL3V');`}
        </Script>
        {/* Clarity as a raw inline script - the exact SPA behavior; the
            next/script wrapper made the vendor script crash. */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, 'clarity', 'script', 'yui4be3zm4');`,
          }}
        />
      </body>
    </html>
  )
}
