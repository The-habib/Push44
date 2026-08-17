# SEO, Google Ranking & Blog Publishing Rules

When creating, updating, or reviewing SEO pages, blog articles, metadata, or search performance in this workspace:

1. **SERP Rank Checking & Competitor Analysis**:
   - Check current search engine ranking and extract Top 10 organic competitors using:
     ```bash
     bun run rank:check "<target keyword>" [target-domain.com]
     ```
   - Review competitors' title phrasing, snippet angles, and "People Also Ask" questions before writing copy.

2. **Keyword Discovery with Google Autocomplete**:
   - Research high-intent search queries and question phrases using:
     ```bash
     bun run rank:keywords "<topic>"
     ```
   - Prioritize long-tail queries (`how to`, `best`, `why`, `vs`, `what is`) in article H2/H3 subheadings.

3. **Blog Post Scaffolding & Structured Data**:
   - Scaffold new blog articles with validated frontmatter and Article/FAQ JSON-LD Schema:
     ```bash
     bun run blog:new "<Article Title>" "<Category>" [filePath]
     ```
   - Ensure every article contains:
     - Exact one `<h1>` matching the primary target keyword.
     - Title tag length between 30–65 characters.
     - Meta description between 120–160 characters.
     - Valid Schema.org JSON-LD structured data (`Article` and `FAQPage`).

4. **Readability & Content Quality Verification**:
   - Analyze readability, word count, and reading time before publishing:
     ```bash
     bun run blog:analyze <markdownFile>
     ```
   - Target a Flesch Reading Ease score of **60+** (Standard / conversational reading level).
   - Ensure Markdown adheres to linting standards:
     ```bash
     bun run lint:md <markdownFile>
     ```

5. **On-Page SEO Auditing**:
   - Run automated on-page audits:
     ```bash
     bun run seo:audit <url>
     bun run seo:og <url>
     bun run seo:sitemap <url>
     ```
