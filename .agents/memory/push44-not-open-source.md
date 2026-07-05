---
name: Push44 Not Open Source
description: Push44 is no longer marketed as open source — all public-facing MIT/GitHub-star references removed
---

# Push44: Free Tool, Not Open Source

## The Rule
Push44 is positioned as a **free tool**, not open source. Do not add "open source", "MIT License", "Star on GitHub", or `github.com/The-habib/Push44` links to any public-facing UI or copy.

**Why:** User explicitly changed positioning. The app is free but no longer open source.

**How to apply:**
- Hero badge: "Free forever · No signup required" (no MIT, no open source)
- Feature cards: no "100% Open Source" card
- Nav/Footer: no GitHub link to the repo
- FAQ answers: "free" only, never "free and open source"
- Terms/Privacy: no MIT license section
- SEO articles: "free" framing is OK; avoid "open source" in new content

## What Was Changed (reference)
- `src/routes/index.tsx` — badge text, feature card, hero CTA (GitHub star removed), bottom CTA
- `src/components/Footer.tsx` — tagline, GitHub button, "Open Source"/"MIT License" links
- `src/components/Navbar.tsx` — removed GitHub nav link
- `src/routes/terms.tsx` — removed "open source license" section
- `src/routes/privacy.tsx` — replaced "Open source" section with "No server-side logic"
- `src/seo/generator.ts` — updated SEO footer copyright
- `src/seo/data.ts` — category label "Free Tools", FAQ answers updated, "why-push44-is-open-source" article rewritten as "why-push44-is-free"
