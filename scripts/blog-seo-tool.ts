#!/usr/bin/env bun
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import slugify from 'slugify';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const command = args[0];

function printUsage() {
  console.log(`
📈 Google Ranking, SERP & Blog SEO Tool Suite (Powered by Bun)

Usage:
  bun scripts/blog-seo-tool.ts <command> [arguments] [options]

Commands:
  rank <keyword> [targetDomain]     Check Google ranking, top 10 competitors & PAA questions
  keywords <topic>                  Extract Google Autocomplete keywords & questions
  analyze <markdownFile>            Analyze blog post SEO, reading time & readability
  scaffold <title> [category] [out] Generate an SEO-optimized blog article with Schema JSON-LD

Examples:
  bun scripts/blog-seo-tool.ts rank "deploy vite on vercel" vercel.com
  bun scripts/blog-seo-tool.ts keywords "vibe coding"
  bun scripts/blog-seo-tool.ts analyze ./content/my-article.md
  bun scripts/blog-seo-tool.ts scaffold "Mastering Vibe Coding in 2026" "Engineering"
`);
}

if (!command) {
  printUsage();
  process.exit(0);
}

// ─── 1. SERP & Rank Checker ──────────────────────────────────────────
async function checkRanking(keyword: string, targetDomain?: string) {
  console.log(`🔎 Searching SERP rankings for: "${keyword}"...\n`);

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });

  const results: { rank: number; title: string; url: string; snippet: string }[] = [];
  const paaQuestions: string[] = [];

  try {
    // Search Bing SERP (highly reliable without captcha/blocking)
    await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(keyword)}&count=20`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    const html = await page.content();
    const $ = cheerio.load(html);

    let rank = 1;
    $('li.b_algo').each((_, el) => {
      const headingEl = $(el).find('h2 a').first();
      const title = headingEl.text().trim() || headingEl.attr('aria-label') || '';
      let link = headingEl.attr('href') || '';
      const snippet = $(el).find('.b_caption p, .b_lineclamp2').text().trim();

      if (title && link) {
        results.push({ rank, title, url: link, snippet });
        rank++;
      }
    });

    // Extract Related Questions
    $('.df_c, .b_expansion_wrapper').each((_, el) => {
      const q = $(el).find('.b_focusTextExtra, h2, span').first().text().trim();
      if (q && q.length > 10 && q.endsWith('?') && !paaQuestions.includes(q)) {
        paaQuestions.push(q);
      }
    });
  } catch (e: any) {
    console.error('Error fetching SERP:', e.message);
  } finally {
    await browser.close();
  }

  console.log(`========================================`);
  console.log(`🏆 ORGANIC SERP RANKINGS (Top ${Math.min(10, results.length)})`);
  console.log(`========================================\n`);

  results.slice(0, 10).forEach((r) => {
    const isTarget = targetDomain && r.url.includes(targetDomain);
    const prefix = isTarget ? `👉 [RANK #${r.rank} - YOUR DOMAIN]` : `[#${r.rank}]`;
    console.log(`${prefix} ${r.title}`);
    console.log(`     URL: ${r.url}`);
    if (r.snippet) console.log(`     Snippet: ${r.snippet.slice(0, 100)}...`);
    console.log();
  });

  if (targetDomain) {
    const matched = results.find((r) => r.url.includes(targetDomain));
    if (matched) {
      console.log(`🎯 Domain "${targetDomain}" ranks at position #${matched.rank}!`);
    } else {
      console.log(`ℹ️ Domain "${targetDomain}" was not found in the top ${results.length} results.`);
    }
    console.log();
  }

  if (paaQuestions.length > 0) {
    console.log(`❓ PEOPLE ALSO ASK:`);
    paaQuestions.slice(0, 6).forEach((q) => console.log(`  - ${q}`));
  }
}

// ─── 2. Google Autocomplete Keyword Extractor ─────────────────────────────────
async function extractKeywords(topic: string) {
  console.log(`💡 Extracting Google Autocomplete keywords for topic: "${topic}"...\n`);

  const prefixes = ['', 'how to ', 'best ', 'why ', 'vs ', 'what is '];
  const allKeywords = new Set<string>();

  for (const prefix of prefixes) {
    const query = `${prefix}${topic}`.trim();
    try {
      const res = await fetch(`https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data[1])) {
          data[1].forEach((k: string) => allKeywords.add(k));
        }
      }
    } catch (e: any) {
      // ignore individual failures
    }
  }

  console.log(`Found ${allKeywords.size} Keyword Ideas:`);
  console.log(`----------------------------------------`);
  Array.from(allKeywords).forEach((k, idx) => {
    console.log(`  ${idx + 1}. ${k}`);
  });
  console.log(`----------------------------------------`);
}

// ─── 3. Blog Article Content Analyzer ──────────────────────────────────────────
function calculateFleschScore(text: string): { score: number; grade: string } {
  const words = text.match(/\b\w+\b/g) || [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  if (words.length === 0 || sentences.length === 0) return { score: 0, grade: 'N/A' };

  let syllableCount = 0;
  for (const word of words) {
    const cleanWord = word.toLowerCase().replace(/(?:[^laeiouy]|ed|es|e)$/, '').replace(/^y/, '');
    const syl = cleanWord.match(/[aeiouy]{1,2}/g);
    syllableCount += syl ? syl.length : 1;
  }

  // Flesch Reading Ease formula
  const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllableCount / words.length);
  const rounded = Math.max(0, Math.min(100, Math.round(score)));

  let grade = 'Very Confusing (College Graduate)';
  if (rounded >= 90) grade = 'Very Easy (5th grade)';
  else if (rounded >= 80) grade = 'Easy (6th grade)';
  else if (rounded >= 70) grade = 'Fairly Easy (7th grade)';
  else if (rounded >= 60) grade = 'Standard (8th-9th grade - Ideal for Web/Blog)';
  else if (rounded >= 50) grade = 'Fairly Difficult (10th-12th grade)';
  else if (rounded >= 30) grade = 'Difficult (College)';

  return { score: rounded, grade };
}

async function analyzeBlogArticle(filePath: string) {
  console.log(`📄 Analyzing Blog Article: ${filePath}...\n`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = matter(raw);
  const content = parsed.content;
  const stats = readingTime(content);
  const readability = calculateFleschScore(content);

  const wordCount = stats.words;
  const headings = content.match(/^#{1,4}\s+.+$/gm) || [];

  console.log(`========================================`);
  console.log(`📊 ARTICLE SEO & CONTENT ANALYSIS`);
  console.log(`========================================`);
  console.log(`  Word Count:         ${wordCount} words`);
  console.log(`  Reading Time:       ${stats.text}`);
  console.log(`  Flesch Readability: ${readability.score}/100 (${readability.grade})`);
  console.log(`  Headings Count:     ${headings.length} headings`);
  console.log();

  if (Object.keys(parsed.data).length > 0) {
    console.log(`Frontmatter Metadata:`);
    console.log(JSON.stringify(parsed.data, null, 2));
    console.log();
  }

  console.log(`Headings Structure:`);
  headings.forEach((h) => console.log(`  ${h}`));
}

// ─── 4. Blog Scaffolder with Schema JSON-LD ────────────────────────────────────
async function scaffoldArticle(title: string, category = 'Guides', outPath?: string) {
  const slug = slugify(title, { lower: true, strict: true });
  const date = new Date().toISOString().split('T')[0];

  const template = `---
title: "${title}"
description: "A comprehensive guide on ${title.toLowerCase()} with step-by-step instructions, code examples, and best practices."
slug: "${slug}"
date: "${date}"
category: "${category}"
author: "Push44 Engineering"
tags: ["${category.toLowerCase()}", "development", "guide"]
---

# ${title}

${title} is a critical capability for modern developers and vibe coders looking to build high-performance web applications. In this guide, we explore core concepts, architecture patterns, and practical implementations.

---

## 📑 Table of Contents
- [Overview](#overview)
- [Key Features & Architecture](#key-features--architecture)
- [Step-by-Step Implementation](#step-by-step-implementation)
- [Frequently Asked Questions](#frequently-asked-questions)

---

## Overview
Explain the problem space and motivation behind this topic. Highlight the primary benefits and workflow improvements.

---

## Key Features & Architecture
- **Feature 1**: High speed and zero configuration.
- **Feature 2**: Fully client-side and privacy-preserving.
- **Feature 3**: Seamless multi-device responsive design.

---

## Step-by-Step Implementation

\`\`\`bash
# Install required dependencies
bun install
\`\`\`

\`\`\`ts
// Example implementation snippet
export function executeWorkflow() {
  console.log("Executing optimized workflow...");
}
\`\`\`

---

## Frequently Asked Questions

### What makes this approach different?
It operates entirely on client-side infrastructure with zero backend latency.

### How do I deploy this to production?
You can deploy directly to Vercel, Cloudflare Pages, or GitHub Pages.

---

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${title}",
  "description": "A comprehensive guide on ${title.toLowerCase()}.",
  "datePublished": "${date}",
  "author": {
    "@type": "Organization",
    "name": "Push44"
  }
}
</script>
`;

  const finalPath = outPath || `./blog-${slug}.md`;
  fs.writeFileSync(finalPath, template);
  console.log(`✅ Scaffolding complete! Generated SEO blog template at: ${finalPath}`);
}

// ─── Main Dispatcher ──────────────────────────────────────────────────────────
async function main() {
  switch (command) {
    case 'rank':
      await checkRanking(args[1], args[2]);
      break;
    case 'keywords':
      await extractKeywords(args[1]);
      break;
    case 'analyze':
      await analyzeBlogArticle(args[1]);
      break;
    case 'scaffold':
      await scaffoldArticle(args[1], args[2], args[3]);
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
