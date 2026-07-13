# Push44 Docs & Blog Site — Full Master Prompt

> Industry-level, copy-paste-ready prompt to build the Push44 documentation
> and blog website. Paste into Bolt.new, v0.dev, Lovable, Base44, or any AI
> coding agent.

---

## SECTION 1 — TECH STACK (exact, no substitutions)

Build a complete, production-ready, SEO-first documentation and blog website
for Push44 — a free tool that exports AI-generated code from platforms like
Base44, Rocket.new, Floot, Zite, Bolt.new, and Lovable directly to GitHub.

The site must be fully responsive (mobile, tablet, desktop), light themed,
visually modern and unique, and built to rank on Google for every page.

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, React Server Components) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + CSS variables for design tokens |
| UI Components | shadcn/ui (latest) — installed via CLI |
| Icons | Lucide React |
| Animations | Framer Motion |
| Content | MDX files in /content/, processed by next-mdx-remote v5 |
| Search | Pagefind (static full-text, zero cost, zero backend) |
| Newsletter | Resend API (/api/subscribe route handler) |
| Analytics | Vercel Analytics + Speed Insights (free tier) |
| Sitemaps | next-sitemap (auto-generates sitemap.xml + robots.txt) |
| SEO metadata | Next.js Metadata API (generateMetadata per page) |
| Syntax highlight | Shiki (via rehype-shiki plugin) |
| TOC | remark-toc + rehype-slug + rehype-autolink-headings |
| Reading time | reading-time npm package |
| Image | next/image (WebP, AVIF, lazy load, blur placeholder) |
| OG Images | @vercel/og (edge runtime, dynamic per page) |
| Package manager | pnpm |
| Deployment | Vercel (free tier — zero config for Next.js) |
| Runtime | Node.js 22 (LTS) |

> No database needed. All content is file-based MDX.
> No authentication needed. This is a public documentation site.

---

## SECTION 2 — DESIGN SYSTEM

**Theme: LIGHT only. No dark mode toggle.**

### Color Palette (CSS variables in globals.css)

```css
--color-brand:        #f97316;   /* orange — Push44 primary brand */
--color-brand-dark:   #ea580c;   /* hover state */
--color-brand-light:  #fff7ed;   /* soft orange tint for backgrounds */
--color-surface:      #ffffff;   /* card backgrounds */
--color-bg:           #fafaf9;   /* page background — warm near-white */
--color-border:       #e7e5e4;   /* subtle dividers */
--color-text-primary: #1c1917;   /* headings */
--color-text-body:    #44403c;   /* body text */
--color-text-muted:   #78716c;   /* captions, timestamps */
--color-code-bg:      #f5f5f4;   /* inline code background */
--color-success:      #16a34a;
--color-info:         #2563eb;
```

### Typography

| Role | Font | Weight |
|---|---|---|
| Display / Headings | Geist (variable) | 700, 800 |
| Body | Inter (variable) | 400, 500 |
| Code / Mono | Geist Mono | 400, 500 |

### Font Scale (Tailwind custom)

```
text-display:  clamp(2.5rem, 5vw, 4rem)     — hero titles
text-hero:     clamp(1.75rem, 3vw, 2.5rem)  — section titles
text-heading:  1.5rem / 1.875rem
text-body:     1rem (16px)
text-small:    0.875rem (14px)
text-xs:       0.75rem (12px)
```

### Border Radius

```
--radius-sm:   0.375rem  (6px)   — badges, tags
--radius-md:   0.625rem  (10px)  — inputs, small cards
--radius-lg:   1rem      (16px)  — main cards
--radius-xl:   1.5rem    (24px)  — hero cards, feature boxes
--radius-full: 9999px            — pills, avatars
```

### Shadows

```
--shadow-sm:    0 1px 2px rgba(0,0,0,0.05)
--shadow-md:    0 4px 12px rgba(0,0,0,0.07)
--shadow-lg:    0 12px 40px rgba(0,0,0,0.09)
--shadow-brand: 0 8px 32px rgba(249,115,22,0.18)
```

### Platform Accent Colors

| Platform | Color | Hex |
|---|---|---|
| Base44 | Deep orange | `#ff6b2b` |
| Rocket.new | Emerald | `#10b981` |
| Floot | Blue | `#3b82f6` |
| Zite | Violet | `#8b5cf6` |
| Bolt.new | Indigo | `#6366f1` |
| Lovable | Pink | `#ec4899` |
| GitHub | Dark | `#24292f` |

### Component Style Rules

- **Cards**: white bg, 1px solid border (`#e7e5e4`), border-radius lg, shadow-md, hover → shadow-lg + translateY(-2px), transition 200ms
- **Primary buttons**: orange bg, white text, shadow-brand on hover, scale(1.02) on hover
- **Secondary buttons**: white bg, border, dark text — clean outlined style
- **Inputs**: white bg, border, focus ring orange (2px), rounded-md
- **Platform badges**: pill shape, platform accent color bg at 10% opacity, accent color text, monospace font

### Design Reference Sites (match this quality level)

- linear.app/docs — clean hierarchy, typography
- stripe.com/docs — professional, structured
- mintlify.com — modern docs aesthetic
- vercel.com/blog — editorial, generous spacing

---

## SECTION 3 — COMPLETE SITE ARCHITECTURE

```
app/
  layout.tsx                    ← Root layout: Navbar + Footer + Analytics
  page.tsx                      ← Homepage
  not-found.tsx                 ← Custom 404 page
  sitemap.ts                    ← Dynamic sitemap generation
  robots.ts                     ← robots.txt generation
  rss/route.ts                  ← RSS feed (XML response)
  og/route.tsx                  ← Dynamic OG image generator (edge runtime)

  docs/
    layout.tsx                  ← Docs layout: sidebar + content + right TOC
    page.tsx                    ← Docs home (getting started overview)
    getting-started/page.tsx
    github-setup/page.tsx
    platforms/
      page.tsx                  ← Supported platforms overview
      base44/page.tsx
      rocket-new/page.tsx
      floot/page.tsx
      zite/page.tsx
      bolt-new/page.tsx
      lovable/page.tsx
    features/
      page.tsx
      github-push/page.tsx
      zip-export/page.tsx
      badge-removal/page.tsx
      file-diff/page.tsx
      push-history/page.tsx
      apk-builds/page.tsx
    troubleshooting/page.tsx
    faq/page.tsx

  blog/
    layout.tsx
    page.tsx                    ← Blog index with filters
    [slug]/page.tsx             ← Individual blog post (MDX rendered)

  tutorials/
    layout.tsx
    page.tsx                    ← Tutorial index grid
    [slug]/page.tsx

  platforms/
    page.tsx                    ← Platform comparison grid
    [platform]/page.tsx         ← Per-platform landing page

  compare/
    page.tsx
    [slug]/page.tsx             ← Individual comparison page

  changelog/page.tsx

  api/
    subscribe/route.ts          ← Newsletter subscribe (POST, Resend)
```

---

## SECTION 4 — EVERY PAGE: CONTENT + LAYOUT SPEC

### 4.1 Homepage (app/page.tsx)

**Section 1: HERO**
- Full-width, warm off-white background (`#fafaf9`)
- Large centered display text:
  - H1: `"Everything You Need to Know About Push44"`
  - Subtitle: `"Guides, tutorials, and documentation for exporting your AI-generated code from Base44, Rocket.new, Floot, Zite, Bolt.new, and Lovable — to GitHub in one click."`
- Two CTAs: `"Browse Documentation"` (orange, primary) + `"Read the Blog"` (outlined, secondary)
- Animated typing text cycling through:
  - `"How to export Base44 code to GitHub →"`
  - `"Remove the Bolt.new badge permanently →"`
  - `"Backup your Floot project for free →"`
  - `"Export Rocket.new source code →"`
- Prominent centered search bar: `"Search docs and guides..."` with ⌘K hint

**Section 2: PLATFORM QUICK LINKS**
- Heading: `"Pick Your Platform"`
- 6 cards — 3-col desktop / 2-col tablet / 1-col mobile
- Each: platform logo + name + one-line description + `"View Guide →"`
- Platforms: Base44, Rocket.new, Floot, Zite, Bolt.new, Lovable

**Section 3: FEATURED DOCS (3 cards)**
- "Getting Started" — orange icon
- "GitHub Setup Guide" — blue icon
- "Badge Removal" — purple icon

**Section 4: POPULAR TUTORIALS (8 cards)**
1. How to Export Code from Base44 (beginner, 6 min)
2. Export Rocket.new Project to GitHub (beginner, 5 min)
3. Remove the 'Made with Floot' Badge (intermediate, 8 min)
4. Export Bolt.new Code — Step by Step (beginner, 4 min)
5. How to Set Up GitHub for Push44 (beginner, 7 min)
6. Export Zite App to GitHub (beginner, 5 min)
7. Download Base44 Source Code (beginner, 5 min)
8. Backup AI Apps Automatically (intermediate, 10 min)

**Section 5: WHAT IS PUSH44? (two-column)**
- Left: text explanation (no server, no subscription, 6 platforms, tokens stay local)
- Right: animated terminal mockup:

```bash
$ push44 --platform base44 --repo my-ai-app
✓ Connected to Base44 API
✓ Fetching 47 files...
✓ Computing diff (12 modified, 3 new)
✓ Pushing to github.com/user/my-ai-app
✓ Done! View commit: github.com/user/my-ai-app/commit/abc123
```

**Section 6: LATEST BLOG POSTS** — 3 cards + `"View All Posts →"`

**Section 7: COMPARISON TABLE**

| Feature | Manual Copy-Paste | Other Tools | Push44 |
|---|---|---|---|
| Price | Free | Paid | ✓ Free |
| Platforms Supported | 1 | 1–2 | ✓ 6 |
| GitHub Integration | ✗ | Sometimes | ✓ Always |
| Badge Removal | ✗ | ✗ | ✓ Permanent |
| File Diff | ✗ | ✗ | ✓ Smart diff |
| No Server / Full Privacy | ✓ | ✗ | ✓ |

**Section 8: NEWSLETTER** — email input + subscribe, `"~2 emails/month"`

**Section 9: FAQ PREVIEW** — 5 questions in accordion + `"View full FAQ →"`

---

### 4.2 Docs Layout (app/docs/layout.tsx)

Three-column layout (desktop):
- **Left sidebar** (260px): collapsible section nav tree
- **Main content** (flex-grow): MDX content
- **Right sidebar** (220px): Table of Contents — sticky, highlights active heading

Mobile: sidebar collapses to top drawer / hamburger.

**Sidebar navigation tree:**
```
▸ Getting Started
    Overview · What is Push44? · Quick Start · System Requirements
▸ GitHub Setup
    Personal Access Token · OAuth Setup · Repository Permissions
▸ Supported Platforms
    Base44 · Rocket.new · Floot · Zite · Bolt.new · Lovable
▸ Features
    GitHub Push · ZIP Export · Badge Removal · File Diff Viewer
    Push History & Streaks · APK Builds
▸ Troubleshooting
    Common Errors · Token Issues · Push Failures · Platform-Specific Issues
▸ FAQ
```

**Doc page anatomy:**
- Breadcrumb at top
- H1 + last updated date + reading time
- Info/warning callout components
- Prev / Next navigation at bottom
- `"Was this helpful? 👍 👎"` feedback widget

---

### 4.3 Blog Index (app/blog/page.tsx)

- Hero: `"Guides & Tutorials"` heading + search bar + post count
- Category filter pills: All | Base44 | Rocket.new | Floot | Zite | Bolt.new | Lovable | GitHub | General
- Difficulty filter: All | Beginner | Intermediate | Advanced
- 2-col desktop / 1-col mobile grid
- Each card: platform badge, title, description, author + date + read time, difficulty tag, animated hover (card lifts + orange left border)

---

### 4.4 Individual Blog Post (app/blog/[slug]/page.tsx)

- Max width 768px centered content
- Sticky TOC sidebar on desktop
- Post header: breadcrumb → platform badge + difficulty → H1 → meta row (author · date · read time · views) → share buttons
- Full MDX content: syntax-highlighted code blocks, callout components, numbered steps, screenshots with captions, orange-underline internal links
- Mid-article CTA box: `"Try exporting your [Platform] app →"`
- Related posts (3 cards, same platform)
- FAQ section as accordion
- Author box: `"Written by Push44 Team"`
- Newsletter subscribe box

---

### 4.5 Platform Pages (app/platforms/[platform]/page.tsx)

One page per platform: `base44`, `rocket-new`, `floot`, `zite`, `bolt-new`, `lovable`

Each page:
1. **Hero** — platform logo, name, `"Export your [Platform] code to GitHub for free"`, export CTA
2. **What is [Platform]?** — brief description
3. **The Problem** — export restrictions, pricing gates, no native git
4. **How Push44 Solves It** — 3–4 visual steps + animated counter
5. **Capabilities Table** — Export code / ZIP download / GitHub push / Badge removal / APK build / File diff / Incremental push
6. **Related Guides** — 4–6 article cards for this platform
7. **FAQ** — platform-specific questions

---

### 4.6 Compare Pages (app/compare/[slug]/page.tsx)

Comparison pages to generate:
- `push44-vs-manual-export`
- `push44-vs-downloading-zip`
- `base44-vs-bolt-new-export`
- `push44-vs-github-copilot-workspace`

Each page layout:
- Hero: `"X vs Y — 2026 Comparison"`
- Summary verdict box (winner highlighted)
- Side-by-side comparison table (aspect | X score | Y score | winner)
- Detailed written analysis per aspect
- Verdict + recommendation
- CTA: `"Use Push44 free →"`

---

## SECTION 5 — FULL CONTENT PLAN

All MDX files go in `/content/` directory.

### 5.1 Documentation Pages

Write full MDX content for these pages (800–2000 words each, real instructional content, code snippets, callout components):

| Route | H1 | Key Sections |
|---|---|---|
| `/docs/getting-started` | Getting Started with Push44 | What is Push44 · Who is it for · How it works · Quick Start Checklist |
| `/docs/github-setup` | Setting Up GitHub for Push44 | PAT setup (step-by-step) · OAuth login · Choosing between PAT and OAuth · Troubleshooting |
| `/docs/platforms/base44` | Exporting Base44 Projects | API token location · Connecting · What Push44 reads · Sandbox waking · Walkthrough · FAQ |
| `/docs/platforms/rocket-new` | Exporting Rocket.new Projects | Session token · Connecting · APK build feature · AES-256 handling · Max failed APK fix · FAQ |
| `/docs/platforms/floot` | Exporting Floot Projects | Magic link token · Session token setup · Badge removal · Publish to web · FAQ |
| `/docs/platforms/zite` | Exporting Zite Apps | Architecture · Session + CSRF setup · Badge removal · File structure · FAQ |
| `/docs/platforms/bolt-new` | Exporting Bolt.new Code | Session cookie · Badge removal (Shadow DOM) · Limitations · FAQ |
| `/docs/platforms/lovable` | Exporting Lovable Projects | Firebase auth · Plan-gated file bypass · Badge removal via AI message · vercel.json requirement · FAQ |
| `/docs/features/badge-removal` | Badge Removal | Why badges appear · How Push44 removes permanently (per platform) · ToS note · FAQ |
| `/docs/features/file-diff` | Smart File Diff | How snapshots work · Reading the diff view · localStorage storage · FAQ |
| `/docs/troubleshooting` | Troubleshooting Push44 | Error message + fix for: Bad credentials · Sandbox not awake · Token expired · Max APK attempts · CSRF mismatch · Push timeout · Files not found · ref not found |
| `/docs/faq` | Frequently Asked Questions | 30 questions grouped: General · GitHub · Platform-specific · Privacy & Security |

---

### 5.2 Blog Articles (MDX)

Write full MDX content (1200–2500 words each). Every article must include:
- **Quick Answer box** at top (50-word summary for featured snippets)
- H2/H3 headings, bullet lists, code snippets
- **FAQ section** (4–6 Q&As with schema markup)
- **Related Articles** section
- Genuine information gain — real steps, real UI details

#### Base44

| # | Slug | Target Keyword | Title |
|---|---|---|---|
| 1 | `how-to-export-code-from-base44` | how to export code from base44 | How to Export Code from Base44 (Free, No Subscription) |
| 2 | `download-base44-source-code` | download base44 source code | How to Download Your Base44 Source Code |
| 3 | `base44-github-integration` | base44 github integration | Base44 GitHub Integration: One-Click Code Push |
| 4 | `base44-version-control-guide` | base44 version control | Version Control for Base44 Projects (Git + GitHub Guide) |
| 5 | `base44-project-backup-guide` | base44 project backup | How to Backup Your Base44 Project (Step-by-Step) |

#### Rocket.new

| # | Slug | Target Keyword | Title |
|---|---|---|---|
| 6 | `export-rocket-new-to-github` | export rocket.new to github | How to Export Your Rocket.new Project to GitHub |
| 7 | `rocket-new-source-code-download` | rocket.new source code download | Download Your Rocket.new Source Code (Full Guide) |
| 8 | `rocket-new-apk-build-guide` | rocket.new apk build | How to Build an APK from Rocket.new with Push44 |

#### Floot

| # | Slug | Target Keyword | Title |
|---|---|---|---|
| 9 | `export-floot-to-github` | export floot to github | Export Your Floot Project to GitHub — Free Guide |
| 10 | `floot-badge-removal-guide` | floot badge removal | How to Remove the 'Made with Floot' Badge (Permanently) |
| 11 | `floot-source-code-backup` | floot source code backup | How to Backup Your Floot Project Source Code |
| 12 | `floot-magic-link-token-guide` | floot magic link token | How to Get Your Floot Session Token (Magic Link Guide) |

#### Zite

| # | Slug | Target Keyword | Title |
|---|---|---|---|
| 13 | `zite-github-export-guide` | zite github export | How to Export Your Zite App to GitHub |
| 14 | `zite-badge-removal-guide` | zite badge removal | Remove the Zite Branding Badge from Your App |

#### Bolt.new

| # | Slug | Target Keyword | Title |
|---|---|---|---|
| 15 | `bolt-new-remove-branding` | bolt.new remove branding | How to Remove the 'Made in Bolt' Badge (Permanent) |
| 16 | `bolt-new-badge-removal-guide` | bolt.new badge removal guide | Bolt.new Badge Removal — Complete 2026 Guide |
| 17 | `export-bolt-new-source-code` | export bolt.new source code | How to Export Your Bolt.new Source Code to GitHub |

#### Lovable

| # | Slug | Target Keyword | Title |
|---|---|---|---|
| 18 | `lovable-export-to-github` | lovable export github | How to Export a Lovable Project to GitHub |
| 19 | `lovable-badge-removal` | lovable badge removal | Remove the Lovable Badge from Your App (Free Method) |

#### General / SEO

| # | Slug | Target Keyword | Title |
|---|---|---|---|
| 20 | `ai-code-ownership-guide` | ai code ownership | AI Code Ownership: Who Owns the Code Your AI Builds? |
| 21 | `backup-ai-generated-apps` | backup ai generated apps | How to Backup AI-Generated Apps (The Right Way) |
| 22 | `ai-project-backup-best-practices` | ai project backup best practices | AI Project Backup Best Practices for 2026 |
| 23 | `export-code-without-subscription` | export ai code without subscription | How to Export AI-Generated Code Without a Subscription |
| 24 | `free-ai-code-export-tools` | free ai code export tools | Best Free AI Code Export Tools in 2026 (Comparison) |
| 25 | `github-version-control-for-ai-apps` | github version control ai apps | How to Use GitHub for Version Control of AI-Built Apps |
| 26 | `connect-github-to-push44-tutorial` | connect github push44 | How to Connect GitHub to Push44 (PAT + OAuth Tutorial) |
| 27 | `create-first-github-repo-from-ai-app` | create github repo from ai app | How to Create Your First GitHub Repo from an AI App |
| 28 | `free-github-backup-tool-vibe-coded-apps` | free github backup tool vibe coded apps | Free GitHub Backup Tools for Vibe-Coded Apps (2026) |
| 29 | `best-free-tool-backup-ai-app-2026` | best free tool to backup ai app 2026 | Best Free Tools to Backup AI Apps in 2026 |

---

### 5.3 Tutorials

Step-by-step, screenshot-driven. Each tutorial has: estimated time, difficulty badge, prerequisite box, numbered steps with icons.

| # | Slug | Title | Level | Time |
|---|---|---|---|---|
| T1 | `first-push-base44` | Your First Push: Base44 to GitHub in Under 2 Minutes | Beginner | 2 min |
| T2 | `github-oauth-setup` | Set Up GitHub OAuth for Push44 (One-Click Auth) | Beginner | 3 min |
| T3 | `bolt-badge-remove` | Export and Badge-Remove a Bolt.new App | Intermediate | 10 min |
| T4 | `floot-magic-link-token` | Get Your Floot Magic Link Token | Intermediate | 5 min |
| T5 | `rocket-export-apk` | Export Rocket.new Project + Trigger APK Build | Intermediate | 15 min |
| T6 | `review-file-diffs` | Review File Diffs Before Every Push | Beginner | 4 min |
| T7 | `github-actions-backup` | Set Up Automatic Weekly Backups with GitHub Actions | Advanced | 20 min |
| T8 | `organize-multiple-projects` | Organize Multiple AI Projects in One GitHub Org | Intermediate | 12 min |

---

## SECTION 6 — SEO: FULL TECHNICAL SPECIFICATION

### 6.1 Per-Page Metadata

Use `generateMetadata()` on every page. Required fields:

```ts
{
  title: "[Page Title] | Push44",          // 50–60 chars
  description: "...",                       // 150–160 chars, unique per page
  keywords: [...],                          // 5–10 keywords
  robots: "index, follow, max-snippet:-1, max-image-preview:large",
  alternates: { canonical: "https://push44docs.vercel.app/..." },
  openGraph: {
    title, description, url,
    type: "website" | "article",
    siteName: "Push44",
    locale: "en_US",
    images: [{ url, width: 1200, height: 630, alt }]
  },
  twitter: {
    card: "summary_large_image",
    title, description, images
  }
}
```

### 6.2 Dynamic OG Images

`/app/og/route.tsx` (Edge Runtime, `@vercel/og`):
- Template: warm off-white bg, Push44 logo top-left, orange accent line, page title in large Geist Bold, category badge, site URL bottom-right
- Query params: `?title=...&category=...&platform=...`

### 6.3 Structured Data (JSON-LD)

| Page Type | Schema Type |
|---|---|
| Homepage | `WebSite` + `SearchAction` (sitelinks searchbox) |
| Blog post | `Article` (headline, author, datePublished, dateModified, image, publisher) |
| Tutorial | `HowTo` with `HowToStep` array |
| FAQ page | `FAQPage` (each Q&A as `Question` + `acceptedAnswer`) |
| Platform page | `SoftwareApplication` |
| Docs page | `TechArticle` |
| Compare page | `Article` + aggregate `Review` |

Add `FAQPage` schema to every blog post FAQ section.
Add `BreadcrumbList` schema to every breadcrumb component.

### 6.4 Sitemap (`app/sitemap.ts`)

Auto-generate `sitemap.xml` with ALL public URLs:

| Page type | Priority | Frequency |
|---|---|---|
| Homepage | 1.0 | weekly |
| Doc pages | 0.9 | monthly |
| Blog posts | 0.8 | weekly |
| Tutorial pages | 0.8 | monthly |
| Platform pages | 0.7 | monthly |
| Compare pages | 0.6 | monthly |
| Changelog | 0.5 | weekly |

### 6.5 robots.txt (`app/robots.ts`)

```
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://push44docs.vercel.app/sitemap.xml
```

### 6.6 RSS Feed (`app/rss/route.ts`)

- Returns `application/rss+xml`
- Full RSS 2.0 with all blog posts, newest first
- Fields per item: title, description, link, pubDate, guid, category, author

### 6.7 Core Web Vitals

- All images use `next/image` (WebP, lazy load, explicit width/height)
- No layout shift: skeleton placeholders on dynamic content
- Fonts preloaded via `<link rel="preload">` in `layout.tsx`
- No render-blocking scripts
- Code blocks use Shiki (server-side, zero runtime JS)
- Target Lighthouse: **95+ Performance, 100 SEO, 95+ Accessibility, 100 Best Practices** on all pages

### 6.8 Internal Linking Strategy

- Every blog post links to: its platform page, 3 related posts, the docs page for that platform, and the Push44 app
- Every docs page links to: related docs pages + relevant blog articles
- Breadcrumbs on every page (also render as `BreadcrumbList` schema)
- `"People Also Ask"` related links section on every blog post

---

## SECTION 7 — SHARED COMPONENTS

```
components/
  layout/
    Navbar.tsx
    Footer.tsx
    DocsSidebar.tsx
    DocsTOC.tsx
    Breadcrumb.tsx

  ui/
    Button.tsx
    Badge.tsx
    Card.tsx
    Callout.tsx           ← tip / warning / info / danger variants
    CodeBlock.tsx         ← Shiki + copy button + language label
    Accordion.tsx
    SearchDialog.tsx      ← ⌘K modal, Pagefind powered
    Steps.tsx             ← Numbered step list with icons
    ProgressBar.tsx       ← Reading progress (sticky top)
    ShareButtons.tsx      ← Copy link + Twitter + LinkedIn
    NewsletterForm.tsx    ← Calls /api/subscribe
    PlatformBadge.tsx     ← Colored platform pill
    DiffBadge.tsx         ← NEW / MODIFIED / DELETED badges
    TableOfContents.tsx
    FeedbackWidget.tsx    ← 👍 👎 helpful / not helpful
    RelatedPosts.tsx
    AuthorBox.tsx
    ReadTime.tsx
    TableWrapper.tsx      ← Horizontally scrollable on mobile
    Tabs.tsx

  mdx/
    MdxContent.tsx        ← Wraps next-mdx-remote with all custom components

  blog/
    PostCard.tsx
    PostCardSmall.tsx
    CategoryFilter.tsx
    BlogHero.tsx

  home/
    HeroSection.tsx
    PlatformGrid.tsx
    FeaturedDocs.tsx
    ComparisonTable.tsx
    TerminalMockup.tsx    ← Animated typing terminal mockup
```

---

## SECTION 8 — NAVBAR

**Desktop** (sticky, white bg, subtle border-bottom on scroll):
- Left: Push44 logo (orange icon + `"Push44 Docs"` text)
- Center: `Docs | Blog | Tutorials | Platforms | Compare | Changelog`
- Right: Search icon (⌘K) + `"Launch App →"` orange button

**Mobile**: Logo left, hamburger right → full-screen slide-in menu

Active link: orange underline + slightly bolder weight

---

## SECTION 9 — FOOTER

4-column layout (2-col tablet, 1-col mobile):

| Column 1: Brand | Column 2: Documentation | Column 3: Platforms | Column 4: Resources |
|---|---|---|---|
| Logo + tagline | Getting Started | Base44 | Blog |
| GitHub + Twitter links | GitHub Setup | Rocket.new | Tutorials |
| "Free forever. No signup." | Supported Platforms | Floot | Comparisons |
| | Features | Zite | Changelog |
| | Troubleshooting | Bolt.new | RSS Feed |
| | FAQ | Lovable | |

Bottom bar: `© 2026 Push44 · Privacy Policy · Terms of Service`

---

## SECTION 10 — SEARCH (Pagefind)

After build run: `npx pagefind --site dist`

**SearchDialog.tsx:**
- Opens on ⌘K
- Full-screen modal, backdrop blur
- Autofocus input
- Results: page title, section heading, excerpt, page type badge
- Keyboard navigable (arrow keys + Enter)
- Highlights matched terms

---

## SECTION 11 — NEWSLETTER

**`/app/api/subscribe/route.ts`:**
```ts
// POST { email }
// → Calls Resend API to add to audience
// → Returns { success: true } or { error: "..." }
// Requires: RESEND_API_KEY env var
```

**`NewsletterForm.tsx` states:**
- Default: email input + `"Subscribe"` button
- Loading: spinner on button
- Success: `"✓ You're subscribed! Check your inbox."`
- Error: `"Something went wrong. Please try again."`

---

## SECTION 12 — CHANGELOG PAGE

Timeline layout (vertical line, date bubbles). Categories: `"What's new"` (green) / `"Improved"` (blue) / `"Fixed"` (red).

| Version | Date | Highlights |
|---|---|---|
| v2.3 | Jul 2026 | Added Lovable support, badge removal improved |
| v2.2 | Jun 2026 | Floot APK builds, file diff viewer |
| v2.1 | May 2026 | Zite badge removal, Rocket.new AES decryption |
| v2.0 | Apr 2026 | Major redesign, GitHub OAuth, push streaks |
| v1.5 | Mar 2026 | Base44 sandbox wake support |
| v1.0 | Jan 2026 | Initial release — Base44, Rocket.new, Floot |

---

## SECTION 13 — ENVIRONMENT VARIABLES

```env
RESEND_API_KEY=                   # Newsletter (resend.com free tier)
NEXT_PUBLIC_SITE_URL=             # https://push44docs.vercel.app
NEXT_PUBLIC_APP_URL=              # https://push44.vercel.app
```

---

## SECTION 14 — FULL FILE STRUCTURE

```
push44-docs/
  app/
    layout.tsx
    page.tsx
    not-found.tsx
    sitemap.ts
    robots.ts
    og/route.tsx
    rss/route.ts
    api/subscribe/route.ts
    blog/layout.tsx
    blog/page.tsx
    blog/[slug]/page.tsx
    docs/layout.tsx
    docs/page.tsx
    docs/getting-started/page.tsx
    docs/github-setup/page.tsx
    docs/platforms/page.tsx
    docs/platforms/[platform]/page.tsx
    docs/features/page.tsx
    docs/features/[feature]/page.tsx
    docs/troubleshooting/page.tsx
    docs/faq/page.tsx
    tutorials/page.tsx
    tutorials/[slug]/page.tsx
    platforms/page.tsx
    platforms/[platform]/page.tsx
    compare/page.tsx
    compare/[slug]/page.tsx
    changelog/page.tsx

  content/
    blog/
      how-to-export-code-from-base44.mdx
      download-base44-source-code.mdx
      base44-github-integration.mdx
      base44-version-control-guide.mdx
      base44-project-backup-guide.mdx
      export-rocket-new-to-github.mdx
      rocket-new-source-code-download.mdx
      rocket-new-apk-build-guide.mdx
      export-floot-to-github.mdx
      floot-badge-removal-guide.mdx
      floot-source-code-backup.mdx
      floot-magic-link-token-guide.mdx
      zite-github-export-guide.mdx
      zite-badge-removal-guide.mdx
      bolt-new-remove-branding.mdx
      bolt-new-badge-removal-guide.mdx
      export-bolt-new-source-code.mdx
      lovable-export-to-github.mdx
      lovable-badge-removal.mdx
      ai-code-ownership-guide.mdx
      backup-ai-generated-apps.mdx
      ai-project-backup-best-practices.mdx
      export-code-without-subscription.mdx
      free-ai-code-export-tools.mdx
      github-version-control-for-ai-apps.mdx
      connect-github-to-push44-tutorial.mdx
      create-first-github-repo-from-ai-app.mdx
      free-github-backup-tool-vibe-coded-apps.mdx
      best-free-tool-backup-ai-app-2026.mdx
    tutorials/
      first-push-base44.mdx
      github-oauth-setup.mdx
      bolt-badge-remove.mdx
      floot-magic-link-token.mdx
      rocket-export-apk.mdx
      review-file-diffs.mdx
      github-actions-backup.mdx
      organize-multiple-projects.mdx
    docs/
      getting-started.mdx
      github-setup.mdx
      platforms/
        base44.mdx
        rocket-new.mdx
        floot.mdx
        zite.mdx
        bolt-new.mdx
        lovable.mdx
      features/
        badge-removal.mdx
        file-diff.mdx
        github-push.mdx
        zip-export.mdx
        push-history.mdx
        apk-builds.mdx
      troubleshooting.mdx
      faq.mdx

  components/
    layout/   blog/   home/   ui/   mdx/

  lib/
    mdx.ts
    posts.ts
    platforms.ts
    metadata.ts

  public/
    logo.png
    og-image.jpg
    favicon.ico

  styles/
    globals.css

  next.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
  .env.local
  .env.example
```

---

## SECTION 15 — DEPLOYMENT

**Platform:** Vercel (zero-config for Next.js, free tier)

**`next.config.ts`:**
```ts
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "push44.vercel.app" }],
  },
  experimental: {
    mdxRs: true,  // Rust-based MDX compiler — faster builds
  },
};
```

**`package.json` scripts:**
```json
{
  "dev":   "next dev",
  "build": "next build && npx pagefind --site .next/server/app",
  "start": "next start",
  "lint":  "next lint"
}
```

**Vercel settings:**
- Build command: `pnpm build`
- Output directory: `.next`
- Set env vars: `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`

---

## SECTION 16 — QUALITY STANDARDS

Every page must pass:

- ✅ Lighthouse Performance ≥ 95
- ✅ Lighthouse SEO = 100
- ✅ Lighthouse Accessibility ≥ 95
- ✅ Lighthouse Best Practices = 100
- ✅ Mobile responsive at 320px, 375px, 768px, 1024px, 1440px
- ✅ No console errors or warnings
- ✅ All images have explicit width/height + alt text
- ✅ All interactive elements have aria-labels
- ✅ Keyboard navigable throughout
- ✅ Color contrast ratio ≥ 4.5:1 on all text
- ✅ No broken internal links
- ✅ Structured data validates at schema.org/validator
- ✅ Sitemap contains every public URL

---

## IMPORTANT IMPLEMENTATION NOTES

1. **Standalone site** — no login, no dashboard, no platform API calls. Pure content + docs.

2. **Write real content** — every MDX file needs its full genuine content written, not placeholder text. Google rewards information gain.

3. **Platform logos** — use simple colored SVG icons (do not use third-party logos you don't own):
   - Base44: orange circle `"B"`
   - Rocket.new: green rocket
   - Floot: blue wave
   - Zite: purple lightning bolt
   - Bolt.new: indigo bolt
   - Lovable: pink heart

4. **Today's date** — all timestamps relative to **2026-07-13**.

5. **Deploy immediately indexable** — correct robots.txt, correct canonical tags, sitemap submitted to Google Search Console on launch day.

6. **URLs:**
   - Push44 app: `https://push44.vercel.app`
   - Docs site: `https://push44docs.vercel.app` (or `docs.push44.app` with a custom domain)

---

## BUILD ORDER

Start in this exact sequence for fastest iteration:

1. **Project setup** — `pnpm init`, `next.config.ts`, `tailwind.config.ts`, `globals.css`, design tokens
2. **Design system** — `Navbar`, `Footer`, `Card`, `Button`, `Badge`, `Callout`, `CodeBlock`
3. **MDX pipeline** — `lib/mdx.ts`, `MdxContent.tsx`, frontmatter types
4. **All MDX content** — blog (29 files) + docs + tutorials
5. **All page components** — home, blog, docs, tutorials, platforms, compare, changelog
6. **SEO layer** — `generateMetadata()`, JSON-LD components, `sitemap.ts`, `robots.ts`, OG image route, RSS route
7. **Search** — Pagefind post-build integration + `SearchDialog.tsx`
8. **Newsletter** — Resend API route + `NewsletterForm.tsx`
9. **Final audit** — Lighthouse all pages, fix any scores below threshold
10. **Deploy** — push to GitHub, connect Vercel, set env vars, submit sitemap to Google Search Console
