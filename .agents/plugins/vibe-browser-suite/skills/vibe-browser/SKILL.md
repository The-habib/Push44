---
name: vibe-browser
description: Multi-device visual preview generation, design token extraction, accessibility auditing, and full browser automation for vibe coders.
---

# Vibe Browser Skill

Use this skill whenever the user requests browser testing, responsive layout checks, full-page screenshots, design inspiration analysis, color extraction, or automated web auditing.

---

## Capabilities & Workflows

### 1. Multi-Device Responsive Screenshots
Captures simultaneous screenshots across Mobile (390px), Tablet (768px), and Desktop (1440px):
```bash
bun run browser:shot <url> [outputDir]
```
- **Local Dev Server:** `bun run browser:shot http://localhost:5173`
- **Output:** Stored in `./screenshots/` with timestamps.

### 2. Design Token & Asset Extraction
Scrapes any webpage to extract computed CSS color palettes, font stacks, images, and converted Markdown layout:
```bash
bun run browser:inspect <url> [outputReportPath]
```
- **Example:** `bun run browser:inspect https://example.com`
- **Output:** Structured markdown report with color swatches, font families, and clean page markdown.

### 3. Accessibility & Performance Audits
Runs automated WCAG compliance testing using Pa11y and headless Chrome:
```bash
bun run browser:audit <url>
```
- Highlights high-priority accessibility errors, broken contrast ratios, and missing ARIA attributes.

### 4. MCP Browser Automation
- **Chrome DevTools MCP**: `click`, `fill`, `navigate_page`, `list_console_messages`, `list_network_requests`, `lighthouse_audit`, `take_screenshot`.
- **Puppeteer MCP**: `puppeteer_navigate`, `puppeteer_screenshot`, `puppeteer_click`, `puppeteer_fill`, `puppeteer_evaluate`.
