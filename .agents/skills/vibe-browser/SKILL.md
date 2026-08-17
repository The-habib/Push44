---
name: vibe-browser
description: Multi-device visual snapshot generation (Mobile, Tablet, Desktop), design token extraction (palettes, fonts, layout), visual regression diffing, accessibility auditing (Pa11y), and live Chrome DevTools MCP automation.
---

# Vibe Browser & Visual Intelligence

This skill provides multi-viewport screenshot capture, computed style extraction, automated accessibility auditing, and visual regression diffing.

---

## 🌐 Browser CLI Commands

| Tool | Command | Description |
| :--- | :--- | :--- |
| **Multi-Device Capture** | `bun run browser:shot <url>` | Captures simultaneous Mobile (390px), Tablet (768px), and Desktop (1440px) screenshots into `.browser_snapshots/`. |
| **Component Screenshot** | `bun run shot <url> [options]` | Captures single viewport or element screenshots (`--mobile`, `--dark`, `--element`). |
| **Visual Diff Engine** | `bun run shot:diff <imgA> <imgB> [out]` | Compares two screenshots and generates a pixelmatch visual diff highlighting changed pixels. |
| **Design Extractor** | `bun run browser:inspect <url>` | Scrapes computed CSS color palettes, font families, images, and markdown structure. |
| **Accessibility Audit** | `bun run browser:audit <url>` | Runs Pa11y WCAG 2.2 AA compliance scan and reports contrast or ARIA issues. |

---

## 🛠️ Integrated MCP Servers

- **`chrome-devtools`**: Live DOM, element clicking, network request tracing, and console message inspection.
- **`puppeteer`**: High-resolution rendering and browser interactions.
- **`lighthouse`**: Performance, SEO, and accessibility scoring.
