#!/usr/bin/env bun
// ─── Push44 SEO Static HTML Generator ────────────────────────────────────────
// Generates crawlable HTML into public/ at build time.
// Run: bun run generate-seo
// Auto-runs as prebuild via package.json "prebuild" script.

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// Register TypeScript path aliases for @/ imports
import { createRequire } from "module";

// Import data and generators
import { ARTICLES, PLATFORMS, COMPARISONS } from "../src/seo/data";
import {
  generateBlogHome,
  generateArticlePage,
  generatePlatformPage,
  generateComparisonPage,
  generateSitemap,
  generateRss,
} from "../src/seo/generator";

const PUBLIC = join(process.cwd(), "public");

function write(filePath: string, content: string) {
  const fullPath = join(PUBLIC, filePath);
  const dir = fullPath.substring(0, fullPath.lastIndexOf("/"));
  mkdirSync(dir, { recursive: true });
  writeFileSync(fullPath, content, "utf-8");
  console.log(`  ✓ /${filePath}`);
}

async function main() {
  console.log("\n🚀 Push44 SEO Generator\n");

  // ── Blog Homepage ──────────────────────────────────────────────────────────
  console.log("📄 Blog homepage");
  write("blog/index.html", generateBlogHome());

  // ── Articles ───────────────────────────────────────────────────────────────
  console.log(`\n📝 ${ARTICLES.length} articles`);
  for (const article of ARTICLES) {
    write(`blog/${article.slug}/index.html`, generateArticlePage(article));
  }

  // ── Platform Hubs ──────────────────────────────────────────────────────────
  console.log(`\n🔗 ${PLATFORMS.length} platform hubs`);
  for (const platform of PLATFORMS) {
    write(`platforms/${platform.slug}/index.html`, generatePlatformPage(platform));
  }

  // ── Comparisons ────────────────────────────────────────────────────────────
  console.log(`\n⚖️  ${COMPARISONS.length} comparisons`);
  for (const comparison of COMPARISONS) {
    write(`compare/${comparison.slug}/index.html`, generateComparisonPage(comparison));
  }

  // ── Sitemap ────────────────────────────────────────────────────────────────
  console.log("\n🗺️  Sitemap & feeds");
  write("sitemap.xml", generateSitemap());
  write("rss.xml", generateRss());

  // ── Robots.txt ─────────────────────────────────────────────────────────────
  const robotsTxt = `User-agent: *
Allow: /
Allow: /blog
Allow: /blog/
Allow: /platforms/
Allow: /compare/
Allow: /rss.xml
Allow: /sitemap.xml

# Block private app routes — no SEO value
Disallow: /dashboard
Disallow: /push
Disallow: /settings
Disallow: /repositories
Disallow: /history
Disallow: /onboarding

# Block search result pages (thin content)
Disallow: /blog?q=
Disallow: /*?*

Sitemap: https://push44.vercel.app/sitemap.xml
`;
  write("robots.txt", robotsTxt);

  const totalPages = 1 + ARTICLES.length + PLATFORMS.length + COMPARISONS.length;
  console.log(`\n✅ Done — ${totalPages} SEO pages generated in public/\n`);
  console.log("   Verify with: curl -s http://localhost:5000/blog | grep '<title>'\n");
}

main().catch(err => {
  console.error("❌ SEO generation failed:", err);
  process.exit(1);
});
