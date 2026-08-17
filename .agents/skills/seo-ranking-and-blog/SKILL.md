---
name: seo-ranking-and-blog
description: Google SERP rank checking, autocomplete keyword extraction, SEO blog article scaffolding with Article and FAQ Schema JSON-LD, readability scoring, and markdown auditing.
---

# SEO, Google Ranking & Blog Publishing Suite

This skill provides automated search ranking intelligence, competitor analysis, and SEO-optimized blog scaffolding.

---

## 🔍 SEO CLI Commands

| Tool | Command | Description |
| :--- | :--- | :--- |
| **SERP Rank Checker** | `bun run rank:check "<keyword>" [domain]` | Scrapes search rankings, finds your position, and lists Top 10 organic competitors with PAA questions. |
| **Keyword Autocomplete** | `bun run rank:keywords "<topic>"` | Extracts 50+ high-intent search queries from Google Autocomplete. |
| **Blog Scaffolder** | `bun run blog:new "<Title>" [Category] [outPath]` | Scaffolds a complete Markdown/React article with validated Schema.org JSON-LD structured data. |
| **Readability Analyzer** | `bun run blog:analyze <filePath>` | Computes Flesch Reading Ease score, word count, reading time, and heading hierarchy. |
| **Markdown Linter** | `bun run lint:md` | Runs markdownlint-cli with custom `.markdownlint.json`. |
| **On-Page SEO Audit** | `bun run seo:audit <url>` | Scans titles, meta tags, and headings for Google SEO compliance. |

---

## 📝 Article Publishing Standards

1. **Title Phrasing**: Keep title tags between 30–65 characters.
2. **Meta Description**: Keep descriptions between 120–160 characters.
3. **Structured Data**: Include valid `Article` and `FAQPage` JSON-LD Schema.
4. **Readability Target**: Target a Flesch Reading Ease score of **60+** (conversational standard).
