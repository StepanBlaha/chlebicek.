# Site check

Implemented: Lucide UI icons, hover/pressed/focus states, requested copy removal, mobile menu, mobile layout, clickable logo, footer/legal/contact links, dynamic copyright year, favicon, page titles, descriptions, author, Czech language, one H1 per page, accessible SVG labels, custom 404, privacy policy, terms, legal breadcrumbs, consistent success/error toasts, OG/Twitter metadata, compressed OG image, JSON-LD, robots.txt, sitemap.xml, llms.txt.

No purple gradients, fake reviews, em dashes, placeholder copy or unused navigation in rendered pages. Food illustrations are resolution-independent SVG; OG PNG is palette-compressed. No phone number supplied; email is clickable.

Verified: production build, 7 logic tests, internal asset/link scan, author and privacy-authority external links return 200, 375px builder/terms width equals viewport, one H1, mobile menu opens, sticker export.

Before public launch: supply SITE_URL to build (canonical URLs, absolute OG URLs, populated sitemap, indexing). Without it the build is deliberately noindex. Configure production host to serve 404.html with status 404. Confirm hosting provider and access-log retention for privacy notice. Local preview includes correct 404 handling.
