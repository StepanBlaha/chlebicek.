# Chlebíček

A tiny Czech sandwich builder. Pick ingredients, get a playful rule-based verdict, share a link, or download a PNG / transparent PNG sticker. No accounts, shopping, or ordering.

## Run

`npm install` then `npm run dev` opens the Vite server on port 4321. `npm run build` builds React + TypeScript. `npm test` tests recipe data.

Artwork is faceted SVG rendered locally. PNG export uses the browser canvas; sticker exports crop the artwork and add a white contour on a transparent background. Shared recipes live in URL fragments.

## Publishing metadata
Run `SITE_URL=https://your-public-domain npm run build` with the actual production origin. Without SITE_URL, the build deliberately disables indexing and omits canonical URLs rather than publishing a guessed domain. The build produces legal HTML pages, 404.html, robots.txt, sitemap.xml, llms.txt, JSON-LD, and a compressed 1200 × 630 OG image. Configure the host to serve 404.html with HTTP 404 for unknown paths, without an SPA catch-all returning 200.

Privacy text describes the current local-only application. Confirm production hosting/log retention when hosting is selected. No phone number has been supplied, so no telephone link is shown.
