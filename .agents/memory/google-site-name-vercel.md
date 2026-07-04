---
name: Google showing "Vercel" instead of brand name in search results
description: Fix pattern when Google search snippets show the hosting platform name instead of the app's brand for apps on *.vercel.app/*.netlify.app style shared domains
---

Even with correct `og:site_name` and JSON-LD already present, Google can still display the hosting platform's name (e.g. "Vercel") instead of the app's brand in search result snippets when the site lives on a shared subdomain like `*.vercel.app`.

**Why:** Google infers the displayed site name from a blend of signals — WebSite/Organization JSON-LD, `og:site_name`, PWA manifest `name`, `application-name`/`apple-mobile-web-app-title` meta, and the hostname itself. On shared platform subdomains, weak or inconsistent signals let Google fall back to the platform brand. A custom domain is the most reliable long-term fix; short of that, maximize consistency across every signal.

**How to apply:** When asked to fix this, audit and align ALL of the following to the same exact brand string everywhere (SPA `index.html`, any SSR-generated static pages, PWA manifest, and any per-route `<head>` meta):
- `<title>`, `meta[name=description]`
- `og:site_name`, `og:title`
- `twitter:site`, `twitter:title`
- `meta[name=application-name]`, `meta[name=apple-mobile-web-app-title]` (often missing — add them)
- `manifest.json` `name` and `short_name` (both set to the exact brand, not a longer description)
- JSON-LD `WebSite` (`name` + `alternateName`) and `Organization` (`name`, `logo` as an absolute URL) schemas, ideally linked via `@id`/`publisher`
- Regenerate any pre-built static SEO pages after editing the shared HTML-shell generator so the change propagates everywhere, not just the homepage.
