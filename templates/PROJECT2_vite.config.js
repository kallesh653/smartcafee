import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9080,                    // CHANGE THIS: 8080, 9080, 10080, 11080...
    proxy: {
      '/api': {
        target: 'http://localhost:9000',    // MATCH BACKEND PORT
        changeOrigin: true
      }
    }
  }
})
