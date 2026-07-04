// ─── Push44 SEO Vite Dev Middleware Plugin ────────────────────────────────────
// Intercepts SEO routes during development and serves SSR HTML.
// In production, the static files in public/ serve the same content.
// This plugin mirrors what scripts/generate-seo.ts writes to public/.

import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { ARTICLES, PLATFORMS, COMPARISONS } from "./data";
import {
  generateBlogHome,
  generateArticlePage,
  generatePlatformPage,
  generateComparisonPage,
  generateSitemap,
  generateRss,
} from "./generator";

export function seoPlugin(): Plugin {
  return {
    name: "push44-seo",
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url?.split("?")[0] ?? "";

        // Blog homepage and articles — let the React SPA handle them.
        // In production, public/blog/** static files serve SEO bots directly.
        if (url === "/blog" || url === "/blog/" || url.match(/^\/blog\/[^/]+\/?$/)) {
          return next();
        }

        // ── Article (kept as reference, disabled for dev UX) ──────────────
        // const articleMatch = url.match(/^\/blog\/([^/]+)\/?$/);


        // ── Platform Hub ───────────────────────────────────────────────────
        const platformMatch = url.match(/^\/platforms\/([^/]+)\/?$/);
        if (platformMatch) {
          const slug = platformMatch[1];
          const platform = PLATFORMS.find(p => p.slug === slug);
          if (platform) return sendHtml(res, generatePlatformPage(platform));
        }

        // ── Comparison ─────────────────────────────────────────────────────
        const compareMatch = url.match(/^\/compare\/([^/]+)\/?$/);
        if (compareMatch) {
          const slug = compareMatch[1];
          const comparison = COMPARISONS.find(c => c.slug === slug);
          if (comparison) return sendHtml(res, generateComparisonPage(comparison));
        }

        // ── Sitemap ────────────────────────────────────────────────────────
        if (url === "/sitemap.xml") {
          res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" });
          return res.end(generateSitemap());
        }

        // ── RSS ────────────────────────────────────────────────────────────
        if (url === "/rss.xml") {
          res.writeHead(200, { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" });
          return res.end(generateRss());
        }

        next();
      });
    },
  };
}

function sendHtml(res: ServerResponse, html: string) {
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache",
    "X-Robots-Tag": "index, follow",
  });
  res.end(html);
}
