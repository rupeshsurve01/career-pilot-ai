import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Avoid SPA 404 on refresh when running locally behind a static server
    // (deployment behavior depends on your hosting, but this helps dev/proxy setups).
    historyApiFallback: true,
  },
})

