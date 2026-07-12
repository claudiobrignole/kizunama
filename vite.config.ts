import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

/** Serve the SPA shell for /en and /en/* during dev & preview. */
function enSpaFallback(): Plugin {
  const rewrite = (req: IncomingMessage, _res: ServerResponse, next: (err?: unknown) => void) => {
    const url = req.url || ''
    if (url === '/en' || url === '/en/' || url.startsWith('/en/?')) {
      req.url = '/' + (url.includes('?') ? url.slice(url.indexOf('?')) : '')
    } else if (url.startsWith('/en/') && !url.includes('.')) {
      req.url = '/' + (url.includes('?') ? url.slice(url.indexOf('?')) : '')
    }
    next()
  }

  return {
    name: 'en-spa-fallback',
    configureServer(server) {
      server.middlewares.use(rewrite)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), enSpaFallback()],
})
