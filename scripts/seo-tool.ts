#!/usr/bin/env bun
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import ogs from 'open-graph-scraper';
import { parseStringPromise } from 'xml2js';

const args = process.argv.slice(2);
const command = args[0];
const targetUrl = args[1];

function printUsage() {
  console.log(`
🌐 Push44 SEO Tool Suite (Powered by Bun & Playwright)

Usage:
  bun scripts/seo-tool.ts <command> <url> [options]

Commands:
  audit <url>          Full on-page SEO analysis (Meta, OG, Headings, Alt, Schema JSON-LD)
  og <url>             Inspect OpenGraph & Twitter Card social previews
  sitemap <url>        Validate and parse XML sitemap structure & URLs

Examples:
  bun scripts/seo-tool.ts audit http://localhost:5173
  bun scripts/seo-tool.ts og https://push44.vercel.app
  bun scripts/seo-tool.ts sitemap https://push44.vercel.app/sitemap.xml
`);
}

if (!command || !targetUrl) {
  printUsage();
  process.exit(0);
}

async function runSeoAudit(url: string) {
  console.log(`🔍 Running comprehensive on-page SEO audit for: ${url}\n`);

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  const html = await page.content();
  const $ = cheerio.load(html);
  await browser.close();

  let score = 100;
  const issues: string[] = [];
  const passes: string[] = [];

  // 1. Title Tag
  const title = $('title').text().trim();
  if (!title) {
    score -= 20;
    issues.push('❌ Missing <title> tag.');
  } else if (title.length < 30 || title.length > 65) {
    score -= 5;
    issues.push(`⚠️ Title length is ${title.length} chars (Recommended: 30-65 chars): "${title}"`);
  } else {
    passes.push(`✅ Title tag (${title.length} chars): "${title}"`);
  }

  // 2. Meta Description
  const metaDesc = $('meta[name="description"]').attr('content')?.trim() || '';
  if (!metaDesc) {
    score -= 15;
    issues.push('❌ Missing <meta name="description"> tag.');
  } else if (metaDesc.length < 70 || metaDesc.length > 165) {
    score -= 5;
    issues.push(`⚠️ Meta description is ${metaDesc.length} chars (Recommended: 120-160 chars): "${metaDesc}"`);
  } else {
    passes.push(`✅ Meta description (${metaDesc.length} chars): "${metaDesc.slice(0, 80)}..."`);
  }

  // 3. Canonical Tag
  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical) {
    score -= 10;
    issues.push('⚠️ Missing <link rel="canonical"> tag.');
  } else {
    passes.push(`✅ Canonical URL: ${canonical}`);
  }

  // 4. Headings (H1, H2)
  const h1s = $('h1');
  if (h1s.length === 0) {
    score -= 15;
    issues.push('❌ No <h1> heading found on page.');
  } else if (h1s.length > 1) {
    score -= 5;
    issues.push(`⚠️ Found ${h1s.length} <h1> tags. Best practice is exactly one primary <h1>.`);
  } else {
    passes.push(`✅ Single <h1> found: "${h1s.first().text().trim()}"`);
  }

  const h2Count = $('h2').length;
  const h3Count = $('h3').length;
  passes.push(`ℹ️ Heading structure: ${h1s.length} <h1>, ${h2Count} <h2>, ${h3Count} <h3>`);

  // 5. Image Alt Attributes
  const images = $('img');
  let missingAlt = 0;
  images.each((_, el) => {
    if (!$(el).attr('alt')) missingAlt++;
  });
  if (images.length > 0) {
    if (missingAlt > 0) {
      score -= Math.min(15, missingAlt * 3);
      issues.push(`⚠️ ${missingAlt} out of ${images.length} images are missing an 'alt' attribute.`);
    } else {
      passes.push(`✅ All ${images.length} images have 'alt' attributes.`);
    }
  }

  // 6. Open Graph & Social Meta
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const ogDesc = $('meta[property="og:description"]').attr('content');
  if (!ogTitle || !ogImage) {
    score -= 10;
    issues.push('⚠️ Incomplete Open Graph meta tags (missing og:title or og:image).');
  } else {
    passes.push(`✅ Open Graph configured (og:title: "${ogTitle}", og:image: "${ogImage}")`);
  }

  // 7. Schema.org JSON-LD
  const jsonLdScripts = $('script[type="application/ld+json"]');
  if (jsonLdScripts.length === 0) {
    issues.push('ℹ️ No structured data (<script type="application/ld+json">) detected.');
  } else {
    passes.push(`✅ Found ${jsonLdScripts.length} structured data (JSON-LD) block(s).`);
  }

  // Output Report
  console.log(`========================================`);
  console.log(`📊 SEO SCORE: ${Math.max(0, score)}/100`);
  console.log(`========================================\n`);

  console.log('PASSED CHECKS:');
  passes.forEach((p) => console.log(`  ${p}`));

  if (issues.length > 0) {
    console.log('\nAREAS FOR IMPROVEMENT:');
    issues.forEach((i) => console.log(`  ${i}`));
  } else {
    console.log('\n🎉 Perfect on-page SEO implementation!');
  }
}

async function runOgInspect(url: string) {
  console.log(`🔎 Inspecting OpenGraph & Social Metadata for: ${url}...\n`);
  try {
    const data = await ogs({ url });
    if (data.error) {
      console.error('Error fetching OG data:', data.result);
      return;
    }
    const res = data.result;
    console.log(`Title:       ${res.ogTitle || res.twitterTitle || 'N/A'}`);
    console.log(`Description: ${res.ogDescription || res.twitterDescription || 'N/A'}`);
    console.log(`URL:         ${res.ogUrl || res.requestUrl}`);
    console.log(`Site Name:   ${res.ogSiteName || 'N/A'}`);
    console.log(`Image:       ${res.ogImage?.[0]?.url || res.twitterImage?.[0]?.url || 'N/A'}`);
    console.log(`Type:        ${res.ogType || 'website'}`);
  } catch (e: any) {
    console.error('Failed to extract OG tags:', e.message);
  }
}

async function runSitemapValidate(url: string) {
  console.log(`🗺️ Validating Sitemap XML: ${url}...\n`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`❌ Failed to fetch sitemap: HTTP ${res.status}`);
      return;
    }
    const xml = await res.text();
    const parsed = await parseStringPromise(xml);

    if (parsed.urlset && parsed.urlset.url) {
      const urls = parsed.urlset.url;
      console.log(`✅ Valid XML Sitemap detected!`);
      console.log(`   Total URLs found: ${urls.length}\n`);
      console.log(`Sample URLs:`);
      urls.slice(0, 10).forEach((entry: any, i: number) => {
        console.log(`   ${i + 1}. ${entry.loc?.[0]} (lastmod: ${entry.lastmod?.[0] || 'N/A'})`);
      });
      if (urls.length > 10) {
        console.log(`   ... and ${urls.length - 10} more.`);
      }
    } else if (parsed.sitemapindex && parsed.sitemapindex.sitemap) {
      const sitemaps = parsed.sitemapindex.sitemap;
      console.log(`✅ Valid Sitemap Index detected! (${sitemaps.length} sub-sitemaps)`);
    } else {
      console.warn(`⚠️ XML parsed, but no standard urlset or sitemapindex found.`);
    }
  } catch (e: any) {
    console.error('Error parsing sitemap:', e.message);
  }
}

async function main() {
  switch (command) {
    case 'audit':
      await runSeoAudit(targetUrl);
      break;
    case 'og':
      await runOgInspect(targetUrl);
      break;
    case 'sitemap':
      await runSitemapValidate(targetUrl);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
