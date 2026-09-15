import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
