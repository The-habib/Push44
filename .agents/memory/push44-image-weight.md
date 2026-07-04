---
name: Push44 image weight / Core Web Vitals
description: Push44's brand logo and OG image were multi-megabyte PNGs hurting LCP; how they were fixed
---

`logo.png` (used as favicon/apple-touch-icon/JSON-LD logo/manifest icon, duplicated in both `public/` and `src/assets/`) was a 1.3MB 1024x1024 truecolor PNG. `og-image.png` was an 860KB PNG.

**Why:** Large unoptimized brand assets directly hurt LCP/Core Web Vitals, which is a real (non-spammy) Google ranking factor — worth fixing before chasing content/backlink tactics.

**How to apply:** Use ImageMagick (`magick`, available in the environment) to compress:
- Icon-style flat-color PNGs with transparency → `magick in.png -strip -define png:compression-level=9 -colors 256 PNG8:out.png` (huge size cut, keeps alpha).
- Photo/gradient-style OG images → convert to JPG (`magick in.png -strip -quality 85 out.jpg`), which is far smaller than PNG and universally supported by OG/Twitter crawlers. Remember to rename the file extension and update every reference (source-of-truth files only, e.g. `index.html` + the shared SSR shell generator — then re-run the SEO generation script so all derived static pages pick up the new filename/type).
- Always update both the `public/` copy and any duplicate under `src/assets/` used by bundled imports — they can silently drift out of sync.
