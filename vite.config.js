import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite injects the stylesheet link AFTER the module script in the built HTML,
// so the browser only discovers the CSS once the JS has loaded (a critical
// request chain). Move the stylesheet before the script so both download in
// parallel from the first HTML parse.
function cssBeforeJs() {
  return {
    name: 'css-before-js',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(
        /(<script type="module"[^>]*><\/script>\s*)(<link rel="stylesheet"[^>]*>)/,
        '$2$1',
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), cssBeforeJs()],
  server: {
    port: 5185,
    strictPort: true,
  },
  build: {
    // The review manifest is a lazy ~1.4MB JSON chunk by design - the warning
    // threshold is raised so it does not drown out real problems.
    chunkSizeWarningLimit: 1500,
  },
})
