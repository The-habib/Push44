# Vibe Browser & Visual Intelligence Rules

When developing, styling, testing, or reviewing web interfaces in this workspace:

1. **Multi-Device Responsive Visual Verification**:
   - Always verify responsive visual layout across Mobile (390px), Tablet (768px), and Desktop (1440px) using:
     ```bash
     bun run browser:shot <url>
     ```
   - Review captured screenshots for alignment, text overflow, and touch-target padding.

2. **Design Token & Style Extraction**:
   - When asked to analyze, replicate, or remix UI patterns from an external or reference website, use:
     ```bash
     bun run browser:inspect <url>
     ```
   - Extract computed color palettes, font pairings, and layout structures before writing code.

3. **Automated Accessibility & Health Audits**:
   - Before completing major UI changes, run:
     ```bash
     bun run browser:audit <url>
     ```
   - Ensure WCAG AA contrast compliance and zero critical a11y regressions.

4. **SEO & Social Metadata Verification**:
   - Verify meta tags, OpenGraph, structured data, canonical tags, and headings with:
     ```bash
     bun run seo:audit <url>
     bun run seo:og <url>
     bun run seo:sitemap <url>
     ```

5. **Live Browser Automation via MCP**:
   - Use `chrome-devtools`, `puppeteer`, and `lighthouse` MCP tools for interactive browser debugging, clicking, network request tracing, dynamic DOM inspections, and performance audits.
