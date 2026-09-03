import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Vercel + Netlify serve clean URLs, so nav links point at `/about` rather than
 * `/about.html`. Vite's dev server would otherwise fall back to `index.html`.
 */
function cleanUrls(routes: Record<string, string>): Plugin {
  return {
    name: 'armada-clean-urls',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [pathname = '', query] = (req.url ?? '').split('?')
        const target = routes[pathname.replace(/\/$/, '')]
        if (target) req.url = query ? `${target}?${query}` : target
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    cleanUrls({
      '/about': '/about.html',
      '/homepage': '/homepage.html',
      '/systemdocs': '/systemdocs.html',
    }),
  ],
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
        about: resolve(__dirname, 'about.html'),
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
