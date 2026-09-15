import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'
import { loadManifest } from './data/reviews/archive.js'

// Kick off the review manifest download immediately - in parallel with the
// route chunks - instead of waiting for the Home page to mount. The promise
// is module-cached, so the page's own useArchive() call reuses it.
loadManifest()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
