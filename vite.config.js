import { defineConfig } from 'vite'

// `npm run build` makes two bundles: the browser app (dist/) and a Node build of the same
// app (dist-ssr/, deleted afterwards) that scripts/prerender.mjs uses to write the HTML of
// every public page. See "Prerenderização" in the README.
export default defineConfig({
  build: {
    target: 'es2020',
    // Firebase ships as its own chunks, loaded on demand; none of them is on the first paint.
    chunkSizeWarningLimit: 700,
  },
})
