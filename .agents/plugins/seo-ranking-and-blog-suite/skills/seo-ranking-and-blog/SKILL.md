---
name: seo-ranking-and-blog
description: Google SERP rank checking, keyword autocomplete extraction, blog article scaffolding, schema markup, and readability analysis for SEO content.
---

# SEO, Google Ranking & Blog Publishing Skill

Use this skill whenever the user requests checking search rankings, researching keyword opportunities, scaffolding blog articles, generating Schema.org JSON-LD, analyzing content readability, or auditing on-page SEO.

---

## 🛠️ Workflows & CLI Commands

### 1. SERP Rank & Competitor Check
Check your site's organic position on search engines and extract the Top 10 ranking competitors, snippets, and "People Also Ask" questions:
```bash
bun run rank:check "<keyword>" [targetDomain]
```
- **Example:** `bun run rank:check "vibe coding" push44.vercel.app`

### 2. Google Autocomplete Keyword Research
Discover real user search queries and question phrases directly from Google Suggest:
```bash
bun run rank:keywords "<topic>"
```
- **Example:** `bun run rank:keywords "vibe coding"`
- Generates 50+ long-tail keyword variations across `how to`, `best`, `why`, `vs`, and `what is`.

### 3. Scaffold SEO-Optimized Blog Articles
Create a production-ready Markdown blog post pre-configured with YAML frontmatter, Table of Contents, and Schema.org JSON-LD (`Article` + `FAQPage`):
```bash
bun run blog:new "<Article Title>" "<Category>" [outputPath]
```
- **Example:** `bun run blog:new "How to Vibe Code React Apps" "Tutorials" ./content/vibe-code-react.md`

### 4. Content Readability & SEO Analysis
Evaluate article word count, estimated reading time, heading hierarchy, and Flesch-Kincaid Reading Ease score:
```bash
bun run blog:analyze <markdownFile>
```
- **Example:** `bun run blog:analyze ./content/vibe-code-react.md`

### 5. On-Page SEO Health & Social Meta Audit
Scan any local or live URL for complete SEO compliance:
```bash
bun run seo:audit <url>
bun run seo:og <url>
bun run seo:sitemap <url>
bun run seo:links <url>
```
