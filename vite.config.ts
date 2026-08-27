import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        homepage: resolve(__dirname, 'homepage.html'),
        systemdocs: resolve(__dirname, 'systemdocs.html'),
      },
    },
  },
  server: {
    host: true,
    port: 5177,
    strictPort: true,
  },
})
