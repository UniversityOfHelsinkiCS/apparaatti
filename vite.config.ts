import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    proxy: {
        '/api': {
          target: 'http://app:8000/api',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    cors: true,
    headers: {
    'Access-Control-Allow-Origin': '*',
  },

  }
})
