// Serves dist/ the way Netlify does, to check a production build locally:
// `_redirects` 200 rewrites, clean URLs without .html, and 404.html (with a 404 status)
// for anything else. `npm run preview` after `npm run build`.
import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
const port = Number(process.env.PORT || 4173)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
}

const rules = (await fs.readFile(path.join(dist, '_redirects'), 'utf8'))
  .split('\n')
  .filter((line) => line.trim() && !line.startsWith('#'))
  .map((line) => line.trim().split(/\s+/))

function rewrite(pathname) {
  for (const [from, to] of rules) {
    if (from.endsWith('/*') ? pathname.startsWith(from.slice(0, -1)) : pathname === from) return to
  }
  return pathname
}

async function file(relative) {
  const target = path.join(dist, relative)
  if (!target.startsWith(dist)) return null
  try {
    const stat = await fs.stat(target)
    return stat.isFile() ? target : null
  } catch {
    return null
  }
}

http
  .createServer(async (request, response) => {
    const { pathname } = new URL(request.url, 'http://localhost')
    const found =
      (await file(pathname === '/' ? 'index.html' : pathname)) || (await file(rewrite(pathname)))
    const target = found || path.join(dist, '404.html')
    const body = await fs.readFile(target)
    // Netlify compresses text responses; so does this, to keep measurements comparable.
    const compress = /gzip/.test(request.headers['accept-encoding'] || '') && !/\.png$/.test(target)
    response.writeHead(found ? 200 : 404, {
      'Content-Type': TYPES[path.extname(target)] || 'application/octet-stream',
      ...(compress ? { 'Content-Encoding': 'gzip' } : {}),
    })
    response.end(compress ? gzipSync(body) : body)
  })
  .listen(port, () => console.log(`dist/ on http://localhost:${port}`))
