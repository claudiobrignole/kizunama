import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

function isExtensionlessLocalePath(url: string): boolean {
  const pathOnly = url.split('?')[0] ?? ''
  if (pathOnly.includes('.')) return false
  return pathOnly === '/en' || pathOnly.startsWith('/en/') || pathOnly === '/it' || pathOnly.startsWith('/it/')
}

/** Dev serves the SPA shell for locale routes. Preview serves the prerendered files. */
function localeRoutes(): Plugin {
  const rewriteDev = (req: IncomingMessage, _res: ServerResponse, next: (err?: unknown) => void) => {
    const url = req.url || ''
    if (isExtensionlessLocalePath(url)) {
      const query = url.includes('?') ? url.slice(url.indexOf('?')) : ''
      req.url = `/${query}`
    }
    next()
  }

  const rewritePreview = (req: IncomingMessage, _res: ServerResponse, next: (err?: unknown) => void) => {
    const url = req.url || ''
    const query = url.includes('?') ? url.slice(url.indexOf('?')) : ''
    const pathOnly = (url.split('?')[0] ?? '').replace(/\/+$/, '') || '/'
    if (/^\/(?:en\/name|it\/nome)\/[a-z]+$/.test(pathOnly) || pathOnly === '/en/names' || pathOnly === '/it/nomi') {
      req.url = `${pathOnly}/index.html${query}`
    }
    next()
  }

  return {
    name: 'locale-routes',
    configureServer(server) {
      server.middlewares.use(rewriteDev)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewritePreview)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localeRoutes()],
})
