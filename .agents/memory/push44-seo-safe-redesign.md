---
name: Push44 SEO-safe blog redesign
description: How to delegate visual redesigns of programmatic-SEO pages without breaking SEO plumbing
---

When redesigning SEO/blog route components (src/routes/blog, platforms, compare), delegate to a DESIGN subagent but explicitly constrain it to the visual/JSX layer only: forbid changes to route `head()` meta/canonical/JSON-LD config, loaders, and the `@/seo/data` data source. Require `bun run generate-seo` to be re-run after any redesign since static pages in `public/` are pre-rendered snapshots that go stale otherwise.

**Why:** These pages carry real Google-facing SEO markup (schema.org, canonical URLs, meta descriptions) that a design-focused subagent could easily rewrite or drop while chasing visual polish; the static generator also silently serves outdated HTML unless regenerated after every content/design change.

**How to apply:** Any future "polish the blog" or "redesign the blog" request — list the exact files to touch, explicitly exclude `head()`/loader logic in the brief, and always regenerate + restart after the subagent finishes.
