// ─── Push44 SSR HTML Generator ────────────────────────────────────────────────
// Generates complete, crawlable HTML pages for SEO. No client-side JS.
// Every function returns a full HTML string that Googlebot can read.

import { SITE, ARTICLES, PLATFORMS, COMPARISONS, CATEGORIES, POPULAR_SEARCHES, PLATFORM_META, type Article, type PlatformData, type Comparison } from "./data";

const BASE_URL = SITE.url;

// ─── Shared Shell ─────────────────────────────────────────────────────────────

interface ShellOptions {
  title: string;
  description: string;
  canonical: string;
  ogType?: string;
  schemas: object[];
  body: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

function sharedCss(): string {
  return `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth;font-size:16px}
    body{font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
      color:#191411;background:#faf8f5;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;line-height:1.65;text-rendering:optimizeLegibility}
    a{color:inherit;text-decoration:none}
    img{max-width:100%;height:auto;display:block}
    :root{
      --orange:#ff5500;--orange-dark:#e64d00;--dark:#120e0b;--text:#191411;
      --muted:#78716c;--border:#e7e2db;--bg:#f3efe9;--white:#ffffff;--radius:12px;
      --accent-glow:rgba(255,85,0,0.22);
    }

    /* ── Layout ── */
    .container{max-width:1200px;margin:0 auto;padding:0 24px}
    .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}

    /* ── Navigation ── */
    .nav{position:sticky;top:0;z-index:100;background:rgba(250,248,245,0.94);
      backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
      border-bottom:1px solid var(--border);box-shadow:0 2px 12px rgba(25,20,17,0.03)}
    .nav-inner{max-width:1200px;margin:0 auto;padding:0 24px;height:62px;
      display:flex;align-items:center;gap:0}
    .nav-logo{display:flex;align-items:center;gap:10px;font-weight:900;
      font-size:17px;color:var(--dark);letter-spacing:-0.04em;flex-shrink:0}
    .nav-logo img{width:30px;height:30px;border-radius:8px;object-fit:contain}
    .nav-links{display:flex;align-items:center;gap:4px;margin-left:36px;flex:1}
    .nav-link{background:none;border:none;cursor:pointer;font-size:13.5px;
      color:var(--muted);font-weight:600;padding:7px 14px;border-radius:8px;
      transition:all 0.15s;font-family:inherit;display:inline-block}
    .nav-link:hover{color:var(--dark);background:var(--bg)}
    .nav-link.active{color:var(--dark);font-weight:700;background:#ffffff;box-shadow:0 1px 4px rgba(0,0,0,0.04);border:1px solid var(--border)}
    .nav-cta{margin-left:auto;background:var(--orange);
      color:#fff;border:none;border-radius:10px;font-weight:700;font-size:13.5px;
      padding:9px 18px;cursor:pointer;display:inline-flex;align-items:center;
      gap:8px;transition:all 0.18s cubic-bezier(0.16,1,0.3,1);box-shadow:0 2px 10px var(--accent-glow);font-family:inherit}
    .nav-cta:hover{background:var(--orange-dark);transform:translateY(-1.5px);box-shadow:0 6px 20px var(--accent-glow)}

    /* ── Buttons ── */
    .btn-primary{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;
      background:var(--orange);color:#fff;border:none;
      border-radius:10px;font-weight:700;font-size:14.5px;cursor:pointer;
      text-decoration:none;box-shadow:0 2px 10px var(--accent-glow);
      transition:all 0.18s cubic-bezier(0.16,1,0.3,1);font-family:inherit}
    .btn-primary:hover{background:var(--orange-dark);transform:translateY(-1.5px);box-shadow:0 6px 22px var(--accent-glow)}
    .btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;
      background:#ffffff;color:#544e47;border:1px solid var(--border);
      border-radius:10px;font-weight:600;font-size:14.5px;cursor:pointer;
      text-decoration:none;transition:all 0.18s;font-family:inherit;box-shadow:0 1px 3px rgba(0,0,0,0.03)}
    .btn-ghost:hover{border-color:#d6d3d1;background:var(--bg);color:var(--dark);transform:translateY(-1px)}

    /* ── Badges ── */
    .badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;
      border-radius:99px;font-size:11.5px;font-weight:700;letter-spacing:0.02em}
    .badge-platform{background:var(--platform-bg,#fff7ed);color:var(--platform-color,#ff5500);
      border:1px solid color-mix(in srgb,var(--platform-color,#ff5500) 30%,transparent)}
    .badge-difficulty-beginner{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0}
    .badge-difficulty-intermediate{background:#fff7ed;color:#ea580c;border:1px solid #fed7aa}
    .badge-difficulty-advanced{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}

    /* ── Callout Blocks ── */
    .callout{border-radius:12px;padding:18px 22px;margin:26px 0;border-left:4px solid;box-shadow:0 1px 4px rgba(0,0,0,0.02)}
    .callout-tip{background:#f0fdf4;border-color:#16a34a;color:#15803d}
    .callout-warning{background:#fffbeb;border-color:#d97706;color:#92400e}
    .callout-info{background:#eff6ff;border-color:#2563eb;color:#1e40af}
    .callout-title{font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:7px;font-size:14.5px}

    /* ── Code Blocks ── */
    .code-block{background:#120e0b;border:1px solid #292524;border-radius:12px;padding:20px 24px;margin:24px 0;overflow-x:auto;box-shadow:0 4px 20px rgba(0,0,0,0.25)}
    .code-block code{font-family:'JetBrains Mono','Fira Code','Courier New',monospace;
      font-size:13.5px;color:#f5f5f4;line-height:1.75}

    /* ── Footer ── */
    .footer{background:#120e0b;color:#a8a29e;padding:64px 24px 44px;margin-top:88px;border-top:1px solid #241c17}
    .footer-inner{max-width:1200px;margin:0 auto}
    .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px}
    .footer-brand{font-size:13.5px;line-height:1.7;color:#78716c;margin-top:12px}
    .footer-col h4{font-size:11px;font-weight:800;color:#fafaf9;letter-spacing:0.1em;
      text-transform:uppercase;margin-bottom:16px}
    .footer-col a{display:block;font-size:14px;color:#a8a29e;margin-bottom:10px;transition:color 0.15s}
    .footer-col a:hover{color:var(--orange)}
    .footer-bottom{margin-top:48px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);
      display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
    .footer-bottom p{font-size:13px;color:#78716c}

    /* ── Chips ── */
    .chip{display:inline-flex;align-items:center;padding:8px 16px;background:#ffffff;
      border:1px solid var(--border);border-radius:30px;font-size:13px;font-weight:600;
      color:#544e47;cursor:pointer;transition:all 0.15s;white-space:nowrap;text-decoration:none;box-shadow:0 1px 3px rgba(0,0,0,0.02)}
    .chip:hover{border-color:var(--orange);color:var(--orange);background:#fff7ed;transform:translateY(-1px)}

    /* ── Article Card ── */
    .article-card{background:#ffffff;border:1px solid var(--border);border-radius:16px;
      padding:26px;transition:all 0.2s cubic-bezier(0.16,1,0.3,1);display:flex;flex-direction:column;gap:14px;
      text-decoration:none;color:inherit;box-shadow:0 1px 4px rgba(25,20,17,0.03)}
    .article-card:hover{box-shadow:0 10px 30px rgba(25,20,17,0.08);transform:translateY(-3px);border-color:#d6d3d1}
    .article-card-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .article-card-title{font-size:18px;font-weight:800;color:var(--dark);line-height:1.35;letter-spacing:-0.025em}
    .article-card-desc{font-size:14px;color:var(--muted);line-height:1.6}
    .article-card-footer{display:flex;align-items:center;gap:8px;font-size:12.5px;color:#a8a29e;margin-top:auto}

    /* ── Comparison Table ── */
    .comparison-table{width:100%;border-collapse:collapse;margin:28px 0;background:#ffffff;border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.02)}
    .comparison-table th{background:#f3efe9;padding:16px 20px;text-align:left;
      font-size:12.5px;font-weight:800;color:var(--dark);letter-spacing:0.06em;
      text-transform:uppercase;border-bottom:1px solid var(--border)}
    .comparison-table td{padding:16px 20px;border-bottom:1px solid #f3efe9;font-size:14px;vertical-align:top}
    .comparison-table tr:hover td{background:#faf8f5}
    .winner-a{color:var(--orange);font-weight:700}
    .winner-b{color:#16a34a;font-weight:700}
    .winner-tie{color:#78716c;font-weight:600}
    .score-bar{height:6px;border-radius:3px;background:#e7e2db;width:60px;display:inline-block;overflow:hidden;vertical-align:middle;margin-left:6px}
    .score-fill{height:100%;border-radius:3px;background:var(--orange)}

    /* ── TOC Sidebar ── */
    .toc-link{display:block;font-size:13.5px;color:var(--muted);padding:6px 0 6px 14px;
      border-left:2px solid var(--border);transition:all 0.15s;text-decoration:none;line-height:1.45}
    .toc-link:hover{color:var(--orange);border-left-color:var(--orange)}
    .toc-link.active{color:var(--orange);border-left-color:var(--orange);font-weight:700}
    .toc-link.h3{padding-left:26px;font-size:12.5px}

    /* ── FAQ ── */
    .faq-item{border-bottom:1px solid var(--border);padding:22px 0}
    .faq-question{font-size:17px;font-weight:800;color:var(--dark);margin-bottom:10px;line-height:1.4;letter-spacing:-0.01em}
    .faq-answer{font-size:15px;color:#544e47;line-height:1.7}

    /* ── Step Card ── */
    .step-card{display:flex;gap:20px;margin:26px 0;padding:22px 26px;
      background:#ffffff;border-radius:14px;border:1px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,0.02)}
    .step-num{width:34px;height:34px;border-radius:50%;background:var(--orange);
      color:#fff;font-weight:900;font-size:14px;display:flex;align-items:center;
      justify-content:center;flex-shrink:0;margin-top:2px;box-shadow:0 2px 8px var(--accent-glow)}
    .step-content h3{font-size:17px;font-weight:800;color:var(--dark);margin-bottom:8px;letter-spacing:-0.02em}
    .step-content p{font-size:14.5px;color:#544e47;line-height:1.7}

    /* ── Category Card ── */
    .cat-card{background:#ffffff;border:1px solid var(--border);border-radius:14px;
      padding:22px;text-align:center;transition:all 0.2s cubic-bezier(0.16,1,0.3,1);text-decoration:none;color:inherit;display:block;box-shadow:0 1px 4px rgba(0,0,0,0.02)}
    .cat-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.06);transform:translateY(-2px);border-color:#d6d3d1}
    .cat-icon{font-size:28px;margin-bottom:10px}
    .cat-name{font-weight:800;font-size:15px;color:var(--dark);margin-bottom:4px;letter-spacing:-0.01em}
    .cat-desc{font-size:12.5px;color:var(--muted);line-height:1.5}

    /* ── Blog Hero ── */
    .blog-hero{background:linear-gradient(135deg,#120e0b 0%,#201712 100%);
      padding:88px 24px;position:relative;overflow:hidden}
    .blog-hero::before{content:'';position:absolute;inset:0;
      background:radial-gradient(ellipse 60% 60% at 50% 0%,rgba(255,85,0,.18) 0%,transparent 70%);
      pointer-events:none}
    .blog-hero-inner{max-width:820px;margin:0 auto;text-align:center;position:relative;z-index:1}
    .blog-hero h1{font-size:clamp(34px,5.5vw,56px);font-weight:900;color:#fafaf9;
      letter-spacing:-0.04em;line-height:1.08;margin-bottom:18px}
    .blog-hero h1 span{color:var(--orange)}
    .blog-hero p{font-size:17px;color:#a8a29e;line-height:1.7;margin-bottom:34px;max-width:620px;margin-left:auto;margin-right:auto}

    /* ── Search Box ── */
    .search-box{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);
      border-radius:14px;padding:14px 22px;display:flex;align-items:center;gap:12px;
      backdrop-filter:blur(10px);max-width:540px;margin:0 auto 32px}
    .search-box input{background:none;border:none;outline:none;color:#fafaf9;font-size:15px;
      flex:1;font-family:inherit;width:100%}
    .search-box input::placeholder{color:#78716c}
    .search-icon{color:#78716c;flex-shrink:0;font-size:18px}

    /* ── Section Headings ── */
    .section-badge{display:inline-flex;align-items:center;gap:6px;
      background:rgba(255,85,0,.08);
      border:1px solid rgba(255,85,0,.25);color:var(--orange);font-size:11px;font-weight:800;
      letter-spacing:0.08em;text-transform:uppercase;padding:5px 13px;border-radius:20px;margin-bottom:12px}
    .section-title{font-size:clamp(26px,3.8vw,36px);font-weight:900;color:var(--dark);
      letter-spacing:-0.035em;line-height:1.2;margin-bottom:10px}
    .section-subtitle{font-size:16px;color:var(--muted);line-height:1.65;margin-bottom:40px}

    /* ── Grid Layouts ── */
    .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
    .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}

    /* ── Article Layout ── */
    .article-layout{display:grid;grid-template-columns:1fr 310px;gap:56px;align-items:start;max-width:1200px;margin:0 auto;padding:48px 24px}
    .article-content h2{font-size:24px;font-weight:900;color:var(--dark);margin:40px 0 16px;letter-spacing:-0.03em;line-height:1.3}
    .article-content h3{font-size:19px;font-weight:800;color:var(--dark);margin:30px 0 12px;line-height:1.35;letter-spacing:-0.02em}
    .article-content p{font-size:16px;color:#44403c;line-height:1.8;margin-bottom:20px}
    .article-content ul,
    .article-content ol{margin:18px 0 22px 24px;padding:0}
    .article-content li{font-size:15.5px;color:#44403c;line-height:1.75;margin-bottom:10px}
    .article-content strong{color:var(--dark);font-weight:800}
    .sidebar{position:sticky;top:80px}
    .sidebar-card{background:#ffffff;border:1px solid var(--border);border-radius:14px;padding:22px;margin-bottom:18px;box-shadow:0 1px 4px rgba(0,0,0,0.02)}
    .sidebar-card h4{font-size:11.5px;font-weight:800;color:var(--muted);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:16px}

    /* ── Progress Bar ── */
    .reading-progress{position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#ff5500,#ff884d);z-index:200;transition:width 0.1s}

    /* ── Breadcrumbs ── */
    .breadcrumbs{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted);margin-bottom:24px;flex-wrap:wrap}
    .breadcrumbs a{color:var(--muted);transition:color 0.15s;font-weight:500}
    .breadcrumbs a:hover{color:var(--orange)}
    .breadcrumbs span{color:#d6d3d1}

    /* ── Platform Hero ── */
    .platform-hero{padding:72px 24px;border-bottom:1px solid var(--border);background:#ffffff}
    .platform-hero-inner{max-width:1200px;margin:0 auto}

    /* ── CTA Section ── */
    .cta-section{background:linear-gradient(135deg,#120e0b,#201712);border-radius:20px;
      padding:64px 48px;text-align:center;margin:64px 0;position:relative;overflow:hidden;border:1px solid #292524}
    .cta-section::before{content:'';position:absolute;inset:0;
      background:radial-gradient(ellipse 60% 80% at 50% 50%,rgba(255,85,0,.15) 0%,transparent 70%)}
    .cta-section h2{font-size:32px;font-weight:900;color:#fafaf9;margin-bottom:14px;letter-spacing:-0.035em;position:relative}
    .cta-section p{font-size:16.5px;color:#a8a29e;margin-bottom:30px;position:relative}
    .cta-buttons{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative}

    /* ── Responsive ── */
    @media(max-width:768px){
      .grid-3,.grid-4{grid-template-columns:1fr 1fr}
      .grid-2{grid-template-columns:1fr}
      .footer-grid{grid-template-columns:1fr 1fr}
      .nav-links{display:none}
      .article-layout{grid-template-columns:1fr;gap:36px;padding:24px 16px}
      .sidebar{position:static}
      .blog-hero{padding:56px 16px}
      .cta-section{padding:40px 20px}
      .container{padding:0 16px}
    }
    @media(max-width:480px){
      .grid-3,.grid-4{grid-template-columns:1fr}
      .footer-grid{grid-template-columns:1fr}
    }
  `;
}


function nav(active?: string): string {
  const links = [
    { label: "Blog",      href: "/blog" },
    { label: "Platforms", href: "/platforms/base44" },
    { label: "Guides",    href: "/blog#guides" },
    { label: "Compare",   href: "/compare/push44-vs-zip-download" },
  ];
  return `
<nav class="nav" role="navigation" aria-label="Main navigation">
  <div class="nav-inner">
    <a href="/" class="nav-logo" aria-label="Push44 Home">
      <img src="/logo.png" alt="Push44" width="30" height="30" />
      Push44
    </a>
    <div class="nav-links" role="list">
      ${links.map(l => `<a href="${l.href}" class="nav-link${active === l.label ? " active" : ""}" role="listitem">${l.label}</a>`).join("")}
      <a href="https://github.com/The-habib/Push44" class="nav-link" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
    </div>
    <a href="/#" class="nav-cta" onclick="location.href='/'">Launch App →</a>
  </div>
</nav>`;
}

function footer(): string {
  return `
<footer class="footer" role="contentinfo">
  <div class="footer-inner">
    <div class="footer-grid">
      <div>
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:12px">
          <img src="/logo.png" alt="Push44" width="28" height="28" style="border-radius:7px;object-fit:contain" />
          <span style="font-weight:800;font-size:15px;color:#f8fafc;letter-spacing:-0.03em">Push44</span>
        </div>
        <p class="footer-brand">Export AI-generated code from any platform to GitHub in one click. Free, open source, forever.</p>
        <div style="display:flex;gap:12px;margin-top:16px">
          <a href="https://github.com/The-habib/Push44" style="color:#64748b;font-size:13px;transition:color 0.15s" onmouseover="this.style.color='#f97316'" onmouseout="this.style.color='#64748b'">GitHub ↗</a>
          <a href="${BASE_URL}/rss.xml" style="color:#64748b;font-size:13px;transition:color 0.15s" onmouseover="this.style.color='#f97316'" onmouseout="this.style.color='#64748b'">RSS Feed</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Platforms</h4>
        <a href="/platforms/base44">Base44</a>
        <a href="/platforms/rocket-new">Rocket.new</a>
        <a href="/platforms/floot">Floot</a>
        <a href="/platforms/zite">Zite</a>
      </div>
      <div class="footer-col">
        <h4>Guides</h4>
        <a href="/blog/how-to-export-code-from-base44">Export from Base44</a>
        <a href="/blog/export-rocket-new-to-github">Export Rocket.new</a>
        <a href="/blog/backup-ai-generated-apps">Backup AI Apps</a>
        <a href="/blog/github-version-control-for-ai-apps">Version Control</a>
        <a href="/blog/export-code-without-subscription">Free Export</a>
      </div>
      <div class="footer-col">
        <h4>Compare</h4>
        <a href="/compare/push44-vs-zip-download">Push44 vs ZIP</a>
        <a href="/compare/push44-vs-manual-export">Push44 vs Manual</a>
        <a href="/compare/base44-vs-rocket-new">Base44 vs Rocket.new</a>
        <a href="/compare/best-ai-export-tools-2025">Best Export Tools</a>
        <a href="/blog">All Guides →</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 Push44. All rights reserved. Free to use, no account required.</p>
      <p>Not affiliated with Base44, Rocket.new, Floot, or Zite.</p>
    </div>
  </div>
</footer>`;
}

function schemaOrg(schemas: object[]): string {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        "name": "Push44",
        "url": BASE_URL,
        "logo": `${BASE_URL}/icon-512.png`,
        "description": SITE.tagline,
        "sameAs": ["https://github.com/The-habib/Push44"],
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        "url": BASE_URL,
        "name": "Push44",
        "alternateName": "Push44",
        "publisher": { "@id": `${BASE_URL}/#organization` },
        "potentialAction": {
          "@type": "SearchAction",
          "target": { "@type": "EntryPoint", "urlTemplate": `${BASE_URL}/blog?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
  // Escape </script> close tags to prevent XSS breakout in JSON-LD blocks
  const safe = (obj: object) =>
    JSON.stringify(obj)
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026");
  return [...schemas, websiteSchema]
    .map(s => `<script type="application/ld+json">${safe(s)}</script>`)
    .join("\n");
}

export function generateHtmlShell({ title, description, canonical, ogType = "article", schemas, body, breadcrumbs }: ShellOptions): string {
  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": b.name,
      "item": `${BASE_URL}${b.url}`,
    })),
  } : null;

  const allSchemas = breadcrumbSchema ? [...schemas, breadcrumbSchema] : schemas;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="theme-color" content="#f97316" />
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escHtml(description)}" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
  <link rel="canonical" href="${escHtml(canonical)}" />

  <!-- Site / Application identity -->
  <meta name="application-name" content="Push44" />
  <meta name="apple-mobile-web-app-title" content="Push44" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="msapplication-TileColor" content="#f97316" />
  <meta name="msapplication-TileImage" content="${BASE_URL}/icon-512.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="${BASE_URL}/logo.png" />
  <link rel="icon" type="image/png" sizes="512x512" href="${BASE_URL}/icon-512.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="${BASE_URL}/logo.png" />
  <link rel="apple-touch-icon" sizes="512x512" href="${BASE_URL}/icon-512.png" />
  <link rel="manifest" href="${BASE_URL}/manifest.json" />

  <!-- Open Graph -->
  <meta property="og:title" content="${escHtml(title)}" />
  <meta property="og:description" content="${escHtml(description)}" />
  <meta property="og:url" content="${escHtml(canonical)}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:site_name" content="Push44" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:image" content="${BASE_URL}/og-image.jpg" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escHtml(title)}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="${SITE.twitter}" />
  <meta name="twitter:title" content="${escHtml(title)}" />
  <meta name="twitter:description" content="${escHtml(description)}" />
  <meta name="twitter:image" content="${BASE_URL}/og-image.jpg" />

  <!-- Fonts (async) -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" /></noscript>

  <!-- RSS -->
  <link rel="alternate" type="application/rss+xml" title="Push44 Blog" href="${BASE_URL}/rss.xml" />

  <style>${sharedCss()}</style>
  ${schemaOrg(allSchemas)}
</head>
<body>
  ${body}
  <!-- Reading progress -->
  <div class="reading-progress" id="rp" style="width:0%" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" aria-label="Reading progress"></div>
  <script>
    (function(){
      var rp=document.getElementById('rp');
      if(!rp)return;
      function upd(){
        var s=document.documentElement;
        var pct=s.scrollTop/(s.scrollHeight-s.clientHeight)*100;
        rp.style.width=Math.min(pct,100)+'%';
        rp.setAttribute('aria-valuenow',Math.round(pct));
      }
      window.addEventListener('scroll',upd,{passive:true});
    })();
  </script>
</body>
</html>`;
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── Blog Homepage ─────────────────────────────────────────────────────────────

export function generateBlogHome(): string {
  const featured = ARTICLES.slice(0, 9);
  const canonical = `${BASE_URL}/blog`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Push44 Blog",
    "description": "Guides, tutorials and comparisons for exporting AI-generated source code.",
    "url": canonical,
    "publisher": { "@type": "Organization", "name": "Push44", "url": BASE_URL },
    "blogPost": featured.map(a => ({
      "@type": "BlogPosting",
      "headline": a.h1,
      "url": `${BASE_URL}/blog/${a.slug}`,
      "datePublished": a.publishedAt,
      "dateModified": a.updatedAt,
      "description": a.description,
    })),
  };

  const body = `
${nav("Blog")}

<!-- HERO -->
<section class="blog-hero" aria-label="Blog hero" style="background:#faf8f5;border-bottom:1px solid #e7e2db;padding:72px 24px">
  <div class="blog-hero-inner" style="max-width:820px;margin:0 auto;text-align:center">
    <p class="section-badge" style="color:#f50;background:#fff4ed;border:1px solid rgba(255,85,0,0.2);margin-bottom:20px;display:inline-flex">
      📚 Official Knowledge Base &amp; Tutorials
    </p>
    <h1 style="font-size:clamp(32px,5vw,52px);font-weight:900;color:#191411;letter-spacing:-0.04em;line-height:1.1;margin-bottom:18px">Export Code from <span style="color:#f50">Every AI Builder</span></h1>
    <p style="font-size:17px;color:#544e47;line-height:1.7;margin-bottom:32px;max-width:620px;margin-left:auto;margin-right:auto">Step-by-step guides, tutorials, comparisons and documentation to export, backup and own your AI-generated source code.</p>

    <!-- Search -->
    <form class="search-box" role="search" action="/blog" method="get" aria-label="Search guides" style="background:#ffffff;border:1px solid #e7e2db;border-radius:14px;padding:10px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 1px 4px rgba(0,0,0,0.03);max-width:540px;margin:0 auto 28px">
      <span class="search-icon" aria-hidden="true" style="color:#8c857b">🔍</span>
      <input type="search" name="q" placeholder="Search guides... e.g. How to export code from Base44" aria-label="Search guides" style="background:none;border:none;outline:none;color:#191411;font-size:15px;flex:1;font-family:inherit;width:100%" />
      <button type="submit" style="background:#f50;color:#fff;border:none;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700">Search</button>
    </form>

    <!-- Popular search chips -->
    <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">
      <span style="font-size:12px;font-weight:700;color:#8c857b;align-self:center;margin-right:4px">Trending:</span>
      ${POPULAR_SEARCHES.slice(0, 7).map(s => `
        <a href="/blog/${s.slug}" class="chip" style="border-color:#e7e2db;background:#ffffff;color:#544e47;font-size:12px;padding:6px 12px">
          ${escHtml(s.label)}
        </a>`).join("")}
    </div>
  </div>
</section>

<!-- DEDICATED PLATFORM HUBS -->
<section style="padding:64px 24px;background:#f3efe9;border-bottom:1px solid var(--border)" aria-labelledby="platform-hubs-heading">
  <div class="container">
    <div style="text-align:center;margin-bottom:36px">
      <p class="section-badge">Platform Centers</p>
      <h2 id="platform-hubs-heading" class="section-title">Dedicated Platform Hubs</h2>
      <p class="section-subtitle">Official integration guides, badge removal workflows, and source code exporters</p>
    </div>
    <div class="grid-4">
      ${PLATFORMS.map(p => `
        <a href="/platforms/${p.slug}" class="cat-card" style="background:#ffffff;border:1px solid #e7e2db;padding:24px" aria-label="${p.name} export hub">
          <div style="width:48px;height:48px;border-radius:14px;background:#ffffff;border:1px solid #e7e2db;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;box-shadow:0 1px 4px rgba(0,0,0,0.03)" aria-hidden="true">
            ${renderPlatformSvg(p.slug, 26)}
          </div>
          <div class="cat-name" style="font-size:16px">${escHtml(p.name)}</div>
          <div class="cat-desc" style="font-size:13px">${p.articles.length} guides · Complete Hub</div>
        </a>`).join("")}
    </div>
  </div>
</section>

<!-- CATEGORIES -->
<section style="padding:64px 24px" aria-labelledby="categories-heading">
  <div class="container">
    <div style="text-align:center;margin-bottom:40px">
      <p class="section-badge">Browse by Topic</p>
      <h2 id="categories-heading" class="section-title">All Categories</h2>
      <p class="section-subtitle">Every guide, tutorial and comparison organized by topic</p>
    </div>
    <div class="grid-4">
      ${CATEGORIES.map(c => `
        <a href="/blog?category=${c.slug}#all-guides" class="cat-card" data-cat-card="${c.slug}" style="background:${c.color}" aria-label="Browse ${c.name} guides">
          <div class="cat-icon" aria-hidden="true">${c.icon}</div>
          <div class="cat-name">${escHtml(c.name)}</div>
          <div class="cat-desc">${escHtml(c.description)}</div>
        </a>`).join("")}
    </div>
  </div>
</section>

<!-- FEATURED GUIDES -->
<section id="guides" style="padding:64px 24px;background:#fafafa;border-top:1px solid var(--border);border-bottom:1px solid var(--border)" aria-labelledby="guides-heading">
  <div class="container">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:40px;gap:16px;flex-wrap:wrap">
      <div>
        <p class="section-badge">🌟 Trending Now</p>
        <h2 id="guides-heading" class="section-title" style="margin-bottom:0">Featured Guides</h2>
      </div>
      <a href="/blog#all-guides" style="font-size:14px;font-weight:600;color:var(--orange)">View all guides →</a>
    </div>
    <div class="grid-3">
      ${featured.map(a => articleCard(a)).join("")}
    </div>
  </div>
</section>

<!-- ALL GUIDES -->
<section id="all-guides" style="padding:64px 24px;scroll-margin-top:80px" aria-labelledby="all-guides-heading">
  <div class="container">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:40px;gap:16px;flex-wrap:wrap">
      <div>
        <p class="section-badge" id="all-guides-badge">📖 Library</p>
        <h2 id="all-guides-heading" class="section-title" style="margin-bottom:0">All Guides</h2>
        <p class="section-subtitle" id="all-guides-count" style="margin-top:6px;margin-bottom:0">${ARTICLES.length} articles</p>
      </div>
      <a href="/blog#all-guides" id="clear-filter-link" style="display:none;font-size:14px;font-weight:600;color:#52525b;background:#f4f4f5;padding:8px 16px;border-radius:10px">✕ Clear filter</a>
    </div>
    <div class="grid-3" id="all-guides-grid">
      ${ARTICLES.map(a => articleCard(a)).join("")}
    </div>
    <p id="all-guides-empty" style="display:none;text-align:center;color:var(--muted);padding:48px 0">No guides found for this topic yet.</p>
  </div>
</section>

<script>
(function(){
  var params = new URLSearchParams(window.location.search);
  var category = params.get('category');
  if(!category) return;

  var cards = document.querySelectorAll('#all-guides-grid .article-card');
  var visible = 0;
  cards.forEach(function(card){
    var matches = card.getAttribute('data-category') === category || card.getAttribute('data-platform') === category;
    card.style.display = matches ? '' : 'none';
    if(matches) visible++;
  });

  var catCard = document.querySelector('[data-cat-card="' + category + '"]');
  var label = catCard ? catCard.querySelector('.cat-name').textContent : category;

  var badge = document.getElementById('all-guides-badge');
  var heading = document.getElementById('all-guides-heading');
  var count = document.getElementById('all-guides-count');
  var clearLink = document.getElementById('clear-filter-link');
  var emptyMsg = document.getElementById('all-guides-empty');
  var grid = document.getElementById('all-guides-grid');

  if(badge) badge.textContent = '📖 ' + label;
  if(heading) heading.textContent = label + ' Guides';
  if(count) count.textContent = visible + (visible === 1 ? ' article' : ' articles') + ' about ' + label;
  if(clearLink) clearLink.style.display = 'inline-block';

  document.querySelectorAll('.cat-card').forEach(function(c){
    c.style.outline = c.getAttribute('data-cat-card') === category ? '2px solid #f97316' : '';
  });

  if(visible === 0){
    if(grid) grid.style.display = 'none';
    if(emptyMsg) emptyMsg.style.display = 'block';
  }
})();
</script>

<!-- PLATFORM HUB -->
<section style="padding:64px 24px" aria-labelledby="platforms-heading">
  <div class="container">
    <div style="text-align:center;margin-bottom:40px">
      <p class="section-badge">🔗 Platform Hub</p>
      <h2 id="platforms-heading" class="section-title">Export from Every Platform</h2>
      <p class="section-subtitle">Complete guides for every major AI app builder</p>
    </div>
    <div class="grid-2">
      ${PLATFORMS.map(p => `
        <a href="/platforms/${p.slug}" style="display:block;background:${p.bgColor};border:1.5px solid color-mix(in srgb,${p.color} 20%,var(--border));border-radius:16px;padding:28px;text-decoration:none;color:inherit;transition:all 0.2s" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 32px rgba(0,0,0,.09)'" onmouseout="this.style.transform='';this.style.boxShadow=''" aria-label="${p.name} export guide">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
            <div style="width:44px;height:44px;border-radius:12px;background:${p.color};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#fff">
              ${p.name[0]}
            </div>
            <div>
              <div style="font-weight:800;font-size:18px;color:var(--dark)">${escHtml(p.name)}</div>
              <div style="font-size:13px;color:var(--muted)">${p.articles.length} guides available</div>
            </div>
          </div>
          <p style="font-size:14px;color:#52525b;line-height:1.6;margin-bottom:16px">${escHtml(p.description)}</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${p.articles.slice(0, 3).map(slug => {
              const art = ARTICLES.find(a => a.slug === slug);
              return art ? `<span style="font-size:12px;background:rgba(0,0,0,0.06);padding:4px 10px;border-radius:20px;color:#52525b">${escHtml(art.h1.replace("How to ", "").replace(" — Complete Guide", "").replace(" Guide", "").slice(0, 32))}</span>` : "";
            }).join("")}
          </div>
          <div style="margin-top:16px;font-size:14px;font-weight:600;color:${p.color}">View all ${p.name} guides →</div>
        </a>`).join("")}
    </div>
  </div>
</section>

<!-- COMPARISONS -->
<section style="padding:64px 24px;background:#fafafa;border-top:1px solid var(--border)" aria-labelledby="compare-heading">
  <div class="container">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:40px;gap:16px;flex-wrap:wrap">
      <div>
        <p class="section-badge">⚖️ Comparisons</p>
        <h2 id="compare-heading" class="section-title" style="margin-bottom:0">Side-by-Side Comparisons</h2>
      </div>
    </div>
    <div class="grid-3">
      ${COMPARISONS.map(c => `
        <a href="/compare/${c.slug}" class="article-card" aria-label="${c.h1}">
          <div class="article-card-meta">
            <span class="badge" style="background:#f8fafc;color:#64748b;border:1px solid var(--border)">⚖️ Compare</span>
          </div>
          <div class="article-card-title">${escHtml(c.h1)}</div>
          <div class="article-card-desc">${escHtml(c.summary.slice(0, 100))}...</div>
          <div class="article-card-footer">
            <span>${c.aspects.length} aspects compared</span>
          </div>
        </a>`).join("")}
    </div>
  </div>
</section>

<!-- CTA -->
<section style="padding:64px 24px">
  <div class="container">
    <div class="cta-section">
      <h2>Ready to Own Your AI Code?</h2>
      <p>Export your complete source code from any AI platform to GitHub in under 2 minutes. Free forever.</p>
      <div class="cta-buttons">
        <a href="/" class="btn-primary">Start Exporting Now →</a>
        <a href="https://github.com/The-habib/Push44" class="btn-ghost" style="color:#94a3b8;border-color:rgba(255,255,255,0.15)" target="_blank" rel="noopener noreferrer">View on GitHub</a>
      </div>
    </div>
  </div>
</section>

${footer()}`;

  return generateHtmlShell({
    title: "Push44 Blog — Guides to Export AI-Generated Code",
    description: "Step-by-step guides, tutorials and comparisons for exporting, backing up and owning AI-generated source code from Base44, Rocket.new, Floot and Zite.",
    canonical,
    ogType: "website",
    schemas: [schema],
    body,
    breadcrumbs: [{ name: "Push44", url: "/" }, { name: "Blog", url: "/blog" }],
  });
}

// ─── Platform SVG Logo Helper ──────────────────────────────────────────────────

export function renderPlatformSvg(platform: string, size = 16): string {
  const norm = (platform || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (norm.includes("base44")) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="display:inline-block;vertical-align:middle;flex-shrink:0"><rect width="24" height="24" rx="6" fill="#f50" /><text x="12" y="16.5" text-anchor="middle" fill="#fff" font-size="11" font-weight="900" font-family="system-ui,-apple-system,sans-serif">44</text></svg>`;
  }
  if (norm.includes("rocket")) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="display:inline-block;vertical-align:middle;flex-shrink:0"><rect width="24" height="24" rx="6" fill="#10B981" /><path d="M12 4c3 0 6 3 6 7l-2 3H8l-2-3c0-4 3-7 6-7z" fill="#fff" /><path d="M9 14l-2 4h10l-2-4H9z" fill="#F59E0B" /></svg>`;
  }
  if (norm.includes("floot")) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="display:inline-block;vertical-align:middle;flex-shrink:0"><rect width="24" height="24" rx="6" fill="#3B82F6" /><path d="M7 16V8h10v3H11v2h5v3H7z" fill="#fff" /></svg>`;
  }
  if (norm.includes("zite")) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="display:inline-block;vertical-align:middle;flex-shrink:0"><rect width="24" height="24" rx="6" fill="#8B5CF6" /><path d="M7 8h10l-6 8h6v2H7l6-8H7V8z" fill="#fff" /></svg>`;
  }
  if (norm.includes("bolt")) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 95 83" fill="none" style="display:inline-block;vertical-align:middle;flex-shrink:0"><path fill="#2B5CFF" d="M66.657 0H28.343a7.948 7.948 0 0 0-6.887 3.979L2.288 37.235a7.948 7.948 0 0 0 0 7.938L21.456 78.43a7.948 7.948 0 0 0 6.887 3.979h38.314a7.948 7.948 0 0 0 6.886-3.98l19.17-33.256a7.948 7.948 0 0 0 0-7.938L73.542 3.98A7.948 7.948 0 0 0 66.657 0Z"/><path fill="#fff" fill-rule="evenodd" clip-rule="evenodd" d="M50.642 59.608c-3.468 0-6.873-1.261-8.827-3.973l-.69 3.198-12.729 6.762 1.374-6.762 9.27-42.04h11.35l-3.279 14.818c2.649-2.9 5.108-3.973 8.26-3.973 6.81 0 11.35 4.477 11.35 12.675 0 8.45-5.233 19.295-16.079 19.295Zm4.351-16.9c0 3.91-2.774 6.874-6.368 6.874-2.018 0-3.847-.757-5.045-2.08l1.766-7.757c1.324-1.324 2.837-2.08 4.603-2.08 2.711 0 5.044 2.017 5.044 5.044Z"/></svg>`;
  }
  if (norm.includes("framer")) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="display:inline-block;vertical-align:middle;flex-shrink:0"><path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" fill="#0055FF" /></svg>`;
  }
  if (norm.includes("lovable")) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="display:inline-block;vertical-align:middle;flex-shrink:0"><path clip-rule="evenodd" fill-rule="evenodd" d="M7.082 0c3.91 0 7.081 3.179 7.081 7.1v2.7h2.357c3.91 0 7.082 3.178 7.082 7.1 0 3.923-3.17 7.1-7.082 7.1H0V7.1C0 3.18 3.17 0 7.082 0z" fill="#FF3366" /></svg>`;
  }
  if (norm.includes("github")) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>`;
  }
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:4px;background:#f50;color:#fff;font-weight:900;font-size:${Math.round(size * 0.55)}px">${(platform[0] || "P").toUpperCase()}</span>`;
}

// ─── Article Card Helper ───────────────────────────────────────────────────────

function articleCard(a: Article): string {
  const pm = PLATFORM_META[a.platform] || PLATFORM_META.general;
  return `
<a href="/blog/${a.slug}" class="article-card" data-category="${escHtml(a.category)}" data-platform="${escHtml(a.platform)}" aria-label="${escHtml(a.h1)}">
  <div class="article-card-meta">
    ${a.platform !== "general" ? `<span class="badge badge-platform" style="--platform-color:${pm.color};--platform-bg:${pm.bgColor};display:inline-flex;align-items:center;gap:6px">${renderPlatformSvg(a.platform, 14)}<span>${pm.name}</span></span>` : ""}
    <span class="badge badge-difficulty-${a.difficulty}">${a.difficulty}</span>
  </div>
  <div class="article-card-title">${escHtml(a.h1)}</div>
  <div class="article-card-desc">${escHtml(a.description.slice(0, 110))}...</div>
  <div class="article-card-footer">
    <span>⏱ ${a.readTime} min read</span>
    <span>•</span>
    <span>${a.views.toLocaleString()} views</span>
    <span>•</span>
    <span>Updated ${new Date(a.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
  </div>
</a>`;
}

// ─── Article Page ─────────────────────────────────────────────────────────────

export function generateArticlePage(article: Article): string {
  const canonical = `${BASE_URL}/blog/${article.slug}`;
  const pm = PLATFORM_META[article.platform] || PLATFORM_META.general;
  const relatedArticles = article.related.map(s => ARTICLES.find(a => a.slug === s)).filter(Boolean) as Article[];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.h1,
    "description": article.description,
    "url": canonical,
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt,
    "author": { "@type": "Organization", "name": "Push44", "url": BASE_URL },
    "publisher": { "@type": "Organization", "name": "Push44", "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
    "keywords": article.keywords.join(", "),
    "articleSection": article.category,
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": article.h1,
    "description": article.problem,
    "step": article.steps.map((s, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": s.title,
      "text": s.content,
    })),
    "tool": [{ "@type": "HowToTool", "name": "Push44", "url": BASE_URL }],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
    })),
  };

  const tocItems = [
    { id: "introduction", label: "Introduction" },
    { id: "the-problem", label: "The Problem" },
    { id: "the-solution", label: "The Solution" },
    { id: "step-by-step", label: "Step-by-Step Guide" },
    { id: "tips", label: "Pro Tips" },
    { id: "faq", label: "FAQ" },
    { id: "related", label: "Related Guides" },
  ];

  const body = `
${nav("Blog")}

<!-- ARTICLE HERO -->
<div style="background:#faf8f5;border-bottom:1px solid #e7e2db;padding:48px 24px 56px;margin-bottom:0">
  <div style="max-width:820px;margin:0 auto">

    <!-- Breadcrumbs -->
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Push44</a>
      <span aria-hidden="true">›</span>
      <a href="/blog">Blog</a>
      <span aria-hidden="true">›</span>
      ${article.platform !== "general" ? `<a href="/platforms/${article.platform}">${pm.name}</a><span aria-hidden="true">›</span>` : ""}
      <span aria-current="page">${escHtml(article.h1.slice(0, 40))}${article.h1.length > 40 ? "…" : ""}</span>
    </nav>

    <!-- Meta -->
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:18px">
      ${article.platform !== "general" ? `<span class="badge badge-platform" style="--platform-color:${pm.color};--platform-bg:${pm.bgColor};display:inline-flex;align-items:center;gap:6px">${renderPlatformSvg(article.platform, 14)}<span>${pm.name}</span></span>` : ""}
      <span class="badge badge-difficulty-${article.difficulty}">${article.difficulty}</span>
      <span style="font-size:13px;color:#8c857b">⏱ ${article.readTime} min read</span>
      <span style="font-size:13px;color:#8c857b">• 👁 ${article.views.toLocaleString()} views</span>
    </div>

    <h1 style="font-size:clamp(28px,4.5vw,44px);font-weight:900;color:#191411;letter-spacing:-0.04em;line-height:1.1;margin-bottom:18px">${escHtml(article.h1)}</h1>
    <p style="font-size:17.5px;color:#544e47;line-height:1.75;margin-bottom:28px;max-width:680px">${escHtml(article.intro)}</p>

    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;padding-top:18px;border-top:1px solid #e7e2db">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:32px;height:32px;border-radius:50%;background:#191411;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:13px" aria-hidden="true">P</div>
        <div>
          <div style="font-size:13px;font-weight:700;color:#191411">Push44 Engineering</div>
          <div style="font-size:12px;color:#8c857b">Updated ${new Date(article.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
        </div>
      </div>
      <!-- Share -->
      <div style="margin-left:auto;display:flex;gap:10px;flex-wrap:wrap">
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.h1)}&url=${encodeURIComponent(canonical)}" target="_blank" rel="noopener noreferrer" style="font-size:12px;font-weight:700;color:#191411;background:#ffffff;border:1px solid #e7e2db;padding:6px 14px;border-radius:10px;text-decoration:none;box-shadow:0 1px 3px rgba(0,0,0,0.02)">Share on X</a>
      </div>
    </div>
  </div>
</div>

<!-- ARTICLE BODY -->
<div class="article-layout" role="main">
  <!-- Content -->
  <article class="article-content" aria-label="${escHtml(article.h1)}">

    <!-- Quick Summary -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:24px;margin-bottom:36px">
      <h2 style="font-size:15px;font-weight:800;color:#15803d;margin-bottom:12px;margin-top:0;display:flex;align-items:center;gap:6px">
        ✅ Quick Summary
      </h2>
      <p style="font-size:15px;color:#166534;line-height:1.6;margin:0">${escHtml(article.solution)}</p>
    </div>

    <!-- Problem -->
    <section id="the-problem" aria-labelledby="problem-heading">
      <h2 id="problem-heading">The Problem</h2>
      <p>${escHtml(article.problem)}</p>
    </section>

    <!-- Solution -->
    <section id="the-solution" aria-labelledby="solution-heading">
      <h2 id="solution-heading">How Push44 Solves It</h2>
      <p>${escHtml(article.solution)}</p>
    </section>

    <!-- Steps -->
    <section id="step-by-step" aria-labelledby="steps-heading">
      <h2 id="steps-heading">Step-by-Step Guide</h2>
      ${article.steps.map((step, i) => `
        <div class="step-card" role="article">
          <div class="step-num" aria-label="Step ${i + 1}">${i + 1}</div>
          <div class="step-content">
            <h3>${escHtml(step.title)}</h3>
            <p>${escHtml(step.content)}</p>
            ${step.tip ? `<div class="callout callout-tip"><div class="callout-title">💡 Pro Tip</div>${escHtml(step.tip)}</div>` : ""}
          </div>
        </div>`).join("")}
    </section>

    <!-- Tips -->
    ${article.tips.length > 0 ? `
    <section id="tips" aria-labelledby="tips-heading">
      <h2 id="tips-heading">Pro Tips</h2>
      <ul>
        ${article.tips.map(t => `<li>${escHtml(t)}</li>`).join("")}
      </ul>
    </section>` : ""}

    <!-- Mistakes -->
    ${article.mistakes.length > 0 ? `
    <section aria-labelledby="mistakes-heading">
      <h2 id="mistakes-heading">Common Mistakes to Avoid</h2>
      <div class="callout callout-warning">
        <div class="callout-title">⚠️ Watch Out For</div>
        <ul style="margin:8px 0 0 20px;padding:0">
          ${article.mistakes.map(m => `<li style="margin-bottom:6px">${escHtml(m)}</li>`).join("")}
        </ul>
      </div>
    </section>` : ""}

    <!-- CTA -->
    <div class="cta-section" style="margin:40px 0">
      <h2>Ready to Export?</h2>
      <p>Push44 is free, open source, and takes under 2 minutes to set up.</p>
      <div class="cta-buttons">
        <a href="/" class="btn-primary">Start Exporting Now →</a>
        <a href="https://github.com/The-habib/Push44" class="btn-ghost" style="color:#94a3b8;border-color:rgba(255,255,255,0.15)" target="_blank" rel="noopener noreferrer">View on GitHub</a>
      </div>
    </div>

    <!-- FAQ -->
    <section id="faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">Frequently Asked Questions</h2>
      ${article.faqs.map(faq => `
        <div class="faq-item">
          <div class="faq-question">${escHtml(faq.question)}</div>
          <div class="faq-answer">${escHtml(faq.answer)}</div>
        </div>`).join("")}
    </section>

    <!-- Related -->
    ${relatedArticles.length > 0 ? `
    <section id="related" aria-labelledby="related-heading" style="margin-top:48px">
      <h2 id="related-heading">Related Guides</h2>
      <div class="grid-2">
        ${relatedArticles.map(a => articleCard(a)).join("")}
      </div>
    </section>` : ""}

  </article>

  <!-- Sidebar -->
  <aside class="sidebar" role="complementary" aria-label="Article sidebar">

    <!-- TOC -->
    <div class="sidebar-card">
      <h4>On This Page</h4>
      ${tocItems.map(t => `<a href="#${t.id}" class="toc-link">${escHtml(t.label)}</a>`).join("")}
    </div>

    <!-- Start Exporting CTA -->
    <div class="sidebar-card" style="background:linear-gradient(135deg,#0f172a,#1e293b);border-color:rgba(255,255,255,0.08)">
      <h4 style="color:#94a3b8">Free Tool</h4>
      <div style="font-weight:800;font-size:15px;color:#f8fafc;margin-bottom:8px">Push44 — Export to GitHub</div>
      <p style="font-size:13px;color:#64748b;line-height:1.5;margin-bottom:16px">Export your complete source code in one click. Free forever.</p>
      <a href="/" class="btn-primary" style="width:100%;justify-content:center;font-size:14px;padding:11px 0">Start Exporting →</a>
    </div>

    <!-- Popular Searches -->
    <div class="sidebar-card">
      <h4>People Also Search</h4>
      ${POPULAR_SEARCHES.slice(0, 6).map(s => `
        <a href="/blog/${s.slug}" style="display:block;font-size:13px;color:#52525b;padding:6px 0;border-bottom:1px solid #fafafa;transition:color 0.15s" onmouseover="this.style.color='#f97316'" onmouseout="this.style.color='#52525b'">${escHtml(s.label)}</a>`).join("")}
    </div>

    <!-- Platform Hub -->
    ${article.platform !== "general" ? `
    <div class="sidebar-card">
      <h4>${pm.name} Hub</h4>
      ${PLATFORMS.find(p => p.slug === article.platform)?.articles.filter(s => s !== article.slug).slice(0, 4).map(slug => {
        const a = ARTICLES.find(x => x.slug === slug);
        return a ? `<a href="/blog/${a.slug}" style="display:block;font-size:13px;color:#52525b;padding:6px 0;border-bottom:1px solid #fafafa;transition:color 0.15s;line-height:1.4" onmouseover="this.style.color='#f97316'" onmouseout="this.style.color='#52525b'">${escHtml(a.h1)}</a>` : "";
      }).join("") || ""}
      <a href="/platforms/${article.platform}" style="display:block;margin-top:10px;font-size:13px;font-weight:600;color:var(--orange)">View all ${pm.name} guides →</a>
    </div>` : ""}

  </aside>
</div>

${footer()}`;

  return generateHtmlShell({
    title: article.title,
    description: article.description,
    canonical,
    schemas: [articleSchema, howToSchema, faqSchema],
    body,
    breadcrumbs: [
      { name: "Push44", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: article.h1, url: `/blog/${article.slug}` },
    ],
  });
}

// ─── Platform Hub ─────────────────────────────────────────────────────────────

export function generatePlatformPage(platform: PlatformData): string {
  const canonical = `${BASE_URL}/platforms/${platform.slug}`;
  const articles = platform.articles.map(s => ARTICLES.find(a => a.slug === s)).filter(Boolean) as Article[];

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `${platform.name} Export Guide — Push44`,
    "description": platform.description,
    "url": canonical,
    "publisher": { "@type": "Organization", "name": "Push44", "url": BASE_URL },
  };

  const faqSchema = platform.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": platform.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
    })),
  } : null;

  const body = `
${nav("Platforms")}

<!-- PLATFORM HERO -->
<div style="background:linear-gradient(135deg,${platform.color}22,${platform.bgColor});border-bottom:1px solid ${platform.color}33;padding:64px 24px">
  <div style="max-width:1200px;margin:0 auto">

    <!-- Breadcrumbs -->
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Push44</a><span aria-hidden="true">›</span>
      <a href="/blog">Blog</a><span aria-hidden="true">›</span>
      <span aria-current="page">${escHtml(platform.name)}</span>
    </nav>

    <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px;flex-wrap:wrap">
      <div style="width:64px;height:64px;border-radius:18px;background:#ffffff;border:1px solid #e7e2db;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,0.04)" aria-hidden="true">
        ${renderPlatformSvg(platform.slug, 40)}
      </div>
      <div>
        <h1 style="font-size:clamp(28px,4vw,40px);font-weight:900;color:var(--dark);letter-spacing:-0.04em;line-height:1.1;margin-bottom:6px">${escHtml(platform.name)} Export Hub</h1>
        <p style="font-size:16px;color:var(--muted)">${escHtml(platform.tagline)}</p>
      </div>
    </div>

    <p style="font-size:16px;color:#52525b;line-height:1.7;max-width:640px;margin-bottom:28px">${escHtml(platform.description)}</p>

    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <a href="/" class="btn-primary">Start Exporting ${escHtml(platform.name)} →</a>
      <a href="/blog" class="btn-ghost">All Guides</a>
    </div>
  </div>
</div>

<!-- FEATURES -->
<section style="padding:48px 24px;background:#fafafa;border-bottom:1px solid var(--border)" aria-labelledby="features-heading">
  <div class="container">
    <h2 id="features-heading" style="font-size:20px;font-weight:800;color:var(--dark);margin-bottom:24px">What Push44 Does with ${escHtml(platform.name)}</h2>
    <div class="grid-3">
      ${platform.features.map(f => `
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div style="width:24px;height:24px;border-radius:6px;background:${platform.color};display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;flex-shrink:0;margin-top:2px" aria-hidden="true">✓</div>
          <span style="font-size:15px;color:#374151;line-height:1.5">${escHtml(f)}</span>
        </div>`).join("")}
    </div>
  </div>
</section>

<!-- HOW TO EXPORT -->
<section style="padding:64px 24px" aria-labelledby="how-to-heading">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start" class="grid-platform">
      <div>
        <p class="section-badge" style="color:${platform.color}">Quick Start</p>
        <h2 id="how-to-heading" class="section-title">How to Export ${escHtml(platform.name)}</h2>
        ${platform.exportSteps.map((s, i) => `
          <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:20px">
            <div style="width:28px;height:28px;border-radius:50%;background:${platform.color};color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px" aria-label="Step ${i + 1}">${i + 1}</div>
            <span style="font-size:15px;color:#374151;line-height:1.5;padding-top:4px">${escHtml(s)}</span>
          </div>`).join("")}
        <a href="/${articles[0] ? `blog/${articles[0].slug}` : "blog"}" class="btn-primary" style="margin-top:8px">Full Step-by-Step Guide →</a>
      </div>
      <div style="background:${platform.bgColor};border:1.5px solid ${platform.color}33;border-radius:16px;padding:28px">
        <h3 style="font-size:16px;font-weight:800;color:var(--dark);margin-bottom:20px">All ${escHtml(platform.name)} Guides</h3>
        ${articles.map(a => `
          <a href="/blog/${a.slug}" style="display:flex;flex-direction:column;gap:4px;padding:14px 0;border-bottom:1px solid ${platform.color}22;text-decoration:none" onmouseover="this.style.paddingLeft='8px'" onmouseout="this.style.paddingLeft='0'" aria-label="${escHtml(a.h1)}">
            <span style="font-size:14px;font-weight:600;color:var(--dark);line-height:1.3;transition:color 0.15s">${escHtml(a.h1)}</span>
            <span style="font-size:12px;color:var(--muted)">⏱ ${a.readTime} min · ${a.views.toLocaleString()} views</span>
          </a>`).join("")}
      </div>
    </div>
  </div>
</section>

<!-- ALL ARTICLES -->
<section style="padding:64px 24px;background:#fafafa;border-top:1px solid var(--border)" aria-labelledby="all-guides-heading">
  <div class="container">
    <h2 id="all-guides-heading" class="section-title">${escHtml(platform.name)} Guides</h2>
    <div class="grid-3" style="margin-top:32px">
      ${articles.map(a => articleCard(a)).join("")}
    </div>
  </div>
</section>

<!-- FAQ -->
${platform.faqs.length > 0 ? `
<section style="padding:64px 24px" aria-labelledby="faq-platform-heading">
  <div class="container" style="max-width:800px">
    <h2 id="faq-platform-heading" class="section-title">${escHtml(platform.name)} FAQ</h2>
    ${platform.faqs.map(faq => `
      <div class="faq-item">
        <div class="faq-question">${escHtml(faq.question)}</div>
        <div class="faq-answer">${escHtml(faq.answer)}</div>
      </div>`).join("")}
  </div>
</section>` : ""}

<!-- RELATED PLATFORMS -->
<section style="padding:64px 24px;background:#fafafa;border-top:1px solid var(--border)" aria-labelledby="other-platforms-heading">
  <div class="container">
    <h2 id="other-platforms-heading" class="section-title">Other Platforms</h2>
    <div class="grid-4" style="margin-top:24px">
      ${PLATFORMS.filter(p => p.slug !== platform.slug).map(p => `
        <a href="/platforms/${p.slug}" class="cat-card" style="background:#ffffff;border:1px solid #e7e2db" aria-label="${p.name} export hub">
          <div style="width:48px;height:48px;border-radius:14px;background:#ffffff;border:1px solid #e7e2db;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;box-shadow:0 1px 4px rgba(0,0,0,0.03)" aria-hidden="true">
            ${renderPlatformSvg(p.slug, 26)}
          </div>
          <div class="cat-name">${escHtml(p.name)}</div>
          <div class="cat-desc">${p.articles.length} guides</div>
        </a>`).join("")}
    </div>
  </div>
</section>

<!-- CTA -->
<section style="padding:64px 24px">
  <div class="container">
    <div class="cta-section">
      <h2>Export Your ${escHtml(platform.name)} Code Now</h2>
      <p>Free, open source, takes under 2 minutes. No subscription required.</p>
      <div class="cta-buttons">
        <a href="/" class="btn-primary">Start Exporting →</a>
      </div>
    </div>
  </div>
</section>

${footer()}`;

  return generateHtmlShell({
    title: `${platform.name} GitHub Export Guide — Push44`,
    description: platform.description,
    canonical,
    ogType: "website",
    schemas: faqSchema ? [schema, faqSchema] : [schema],
    body,
    breadcrumbs: [
      { name: "Push44", url: "/" },
      { name: "Platforms", url: "/blog" },
      { name: platform.name, url: `/platforms/${platform.slug}` },
    ],
  });
}

// ─── Comparison Page ───────────────────────────────────────────────────────────

export function generateComparisonPage(comparison: Comparison): string {
  const canonical = `${BASE_URL}/compare/${comparison.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": comparison.h1,
    "description": comparison.description,
    "url": canonical,
    "datePublished": comparison.publishedAt,
    "dateModified": comparison.updatedAt,
    "author": { "@type": "Organization", "name": "Push44", "url": BASE_URL },
    "publisher": { "@type": "Organization", "name": "Push44" },
  };

  const aLabel = comparison.aspects[0]?.a.label || "Option A";
  const bLabel = comparison.aspects[0]?.b.label || "Option B";
  const aWins = comparison.aspects.filter(a => a.winner === "a").length;
  const bWins = comparison.aspects.filter(a => a.winner === "b").length;
  const ties = comparison.aspects.filter(a => a.winner === "tie").length;

  const body = `
${nav()}

<!-- COMPARISON HERO -->
<div style="background:#faf8f5;border-bottom:1px solid #e7e2db;padding:64px 24px">
  <div style="max-width:900px;margin:0 auto">

    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Push44</a><span>›</span>
      <a href="/blog">Blog</a><span>›</span>
      <span aria-current="page">Comparison</span>
    </nav>

    <span class="badge" style="background:#fff4ed;color:#f50;border:1px solid rgba(255,85,0,0.2);margin-bottom:16px;display:inline-flex">⚖️ Comparison</span>
    <h1 style="font-size:clamp(28px,4vw,44px);font-weight:900;color:#191411;letter-spacing:-0.04em;line-height:1.1;margin-bottom:16px">${escHtml(comparison.h1)}</h1>
    <p style="font-size:17px;color:#544e47;line-height:1.7;max-width:640px;margin-bottom:28px">${escHtml(comparison.description)}</p>

    <!-- Score summary bento cards -->
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <div style="background:#ffffff;border:1px solid #e7e2db;border-top:3px solid #f50;border-radius:14px;padding:16px 22px;text-align:center;min-width:130px;box-shadow:0 1px 4px rgba(0,0,0,0.03)">
        <div style="margin-bottom:4px">${renderPlatformSvg(aLabel, 22)}</div>
        <div style="font-size:26px;font-weight:900;color:#f50">${aWins}</div>
        <div style="font-size:11px;font-weight:700;color:#8c857b;text-transform:uppercase;letter-spacing:0.04em;margin-top:2px">${escHtml(aLabel)} Wins</div>
      </div>
      <div style="background:#ffffff;border:1px solid #e7e2db;border-top:3px solid #16a34a;border-radius:14px;padding:16px 22px;text-align:center;min-width:130px;box-shadow:0 1px 4px rgba(0,0,0,0.03)">
        <div style="margin-bottom:4px">${renderPlatformSvg(bLabel, 22)}</div>
        <div style="font-size:26px;font-weight:900;color:#16a34a">${bWins}</div>
        <div style="font-size:11px;font-weight:700;color:#8c857b;text-transform:uppercase;letter-spacing:0.04em;margin-top:2px">${escHtml(bLabel)} Wins</div>
      </div>
      ${ties > 0 ? `
      <div style="background:#ffffff;border:1px solid #e7e2db;border-top:3px solid #8c857b;border-radius:14px;padding:16px 22px;text-align:center;min-width:110px;box-shadow:0 1px 4px rgba(0,0,0,0.03)">
        <div style="font-size:26px;font-weight:900;color:#8c857b;margin-top:20px">${ties}</div>
        <div style="font-size:11px;font-weight:700;color:#8c857b;text-transform:uppercase;letter-spacing:0.04em;margin-top:2px">Ties</div>
      </div>` : ""}
    </div>
  </div>
</div>

<!-- CONTENT -->
<div style="max-width:900px;margin:0 auto;padding:48px 24px">

  <!-- Verdict -->
  <div class="callout callout-info" style="margin-bottom:36px">
    <div class="callout-title">🏆 Verdict</div>
    ${escHtml(comparison.verdict)}
  </div>

  <!-- Summary -->
  <section aria-labelledby="summary-heading">
    <h2 id="summary-heading" style="font-size:22px;font-weight:800;color:var(--dark);margin-bottom:14px;letter-spacing:-0.02em">Overview</h2>
    <p style="font-size:16px;color:#374151;line-height:1.8;margin-bottom:32px">${escHtml(comparison.summary)}</p>
  </section>

  <!-- Comparison table -->
  <section aria-labelledby="table-heading">
    <h2 id="table-heading" style="font-size:22px;font-weight:800;color:var(--dark);margin-bottom:20px;letter-spacing:-0.02em">Detailed Comparison</h2>
    <div style="overflow-x:auto">
      <table class="comparison-table" role="table" aria-label="Feature comparison table">
        <thead>
          <tr>
            <th scope="col" style="width:25%">Aspect</th>
            <th scope="col" style="color:#f50">
              <span style="display:inline-flex;align-items:center;gap:6px">${renderPlatformSvg(aLabel, 16)}<span>${escHtml(aLabel)}</span></span>
            </th>
            <th scope="col" style="color:#16a34a">
              <span style="display:inline-flex;align-items:center;gap:6px">${renderPlatformSvg(bLabel, 16)}<span>${escHtml(bLabel)}</span></span>
            </th>
            <th scope="col">Winner</th>
          </tr>
        </thead>
        <tbody>
          ${comparison.aspects.map(a => `
            <tr>
              <td style="font-weight:600;color:var(--dark)">${escHtml(a.aspect)}</td>
              <td>
                <div style="margin-bottom:4px">${escHtml(a.a.value)}</div>
                <div style="display:flex;align-items:center;gap:8px">
                  <div class="score-bar"><div class="score-fill" style="width:${(a.a.score / 5) * 100}%"></div></div>
                  <span style="font-size:12px;color:var(--muted)">${a.a.score}/5</span>
                </div>
              </td>
              <td>
                <div style="margin-bottom:4px">${escHtml(a.b.value)}</div>
                <div style="display:flex;align-items:center;gap:8px">
                  <div class="score-bar"><div class="score-fill" style="width:${(a.b.score / 5) * 100}%;background:#16a34a"></div></div>
                  <span style="font-size:12px;color:var(--muted)">${a.b.score}/5</span>
                </div>
              </td>
              <td>
                <span class="${a.winner === "a" ? "winner-a" : a.winner === "b" ? "winner-b" : "winner-tie"}" style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:99px;font-size:12px;font-weight:700;${a.winner === 'a' ? 'background:#fff4ed;border:1px solid rgba(255,85,0,0.2)' : a.winner === 'b' ? 'background:#f0fdf4;border:1px solid #bbf7d0' : 'background:#f3efe9'}">
                  ${a.winner === "a" ? renderPlatformSvg(aLabel, 13) : a.winner === "b" ? renderPlatformSvg(bLabel, 13) : ""}
                  ${a.winner === "a" ? escHtml(aLabel) : a.winner === "b" ? escHtml(bLabel) : "Tie"}
                </span>
                <div style="font-size:12px;color:var(--muted);margin-top:6px;line-height:1.4">${escHtml(a.note)}</div>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
  </section>

  <!-- CTA -->
  <div class="cta-section" style="margin:48px 0">
    <h2>Start Exporting for Free</h2>
    <p>Push44 is open source, free forever, and works with Base44, Rocket.new, Floot and Zite.</p>
    <div class="cta-buttons">
      <a href="/" class="btn-primary">Try Push44 Now →</a>
    </div>
  </div>

  <!-- Other comparisons -->
  <section aria-labelledby="other-compare-heading">
    <h2 id="other-compare-heading" style="font-size:20px;font-weight:800;color:var(--dark);margin-bottom:20px;letter-spacing:-0.02em">More Comparisons</h2>
    <div class="grid-2">
      ${COMPARISONS.filter(c => c.slug !== comparison.slug).slice(0, 4).map(c => `
        <a href="/compare/${c.slug}" class="article-card" aria-label="${escHtml(c.h1)}">
          <span class="badge" style="background:#f8fafc;color:#64748b;border:1px solid var(--border);width:fit-content">⚖️ Compare</span>
          <div class="article-card-title">${escHtml(c.h1)}</div>
          <div class="article-card-desc">${escHtml(c.summary.slice(0, 80))}...</div>
        </a>`).join("")}
    </div>
  </section>

</div>

${footer()}`;

  return generateHtmlShell({
    title: comparison.title,
    description: comparison.description,
    canonical,
    schemas: [schema],
    body,
    breadcrumbs: [
      { name: "Push44", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: comparison.h1, url: `/compare/${comparison.slug}` },
    ],
  });
}

// ─── 404 Page ──────────────────────────────────────────────────────────────────

export function generate404Page(): string {
  const body = `
${nav()}

<section style="padding:120px 24px;text-align:center">
  <div class="container" style="max-width:560px">
    <p class="section-badge" style="color:#f97316">404</p>
    <h1 style="font-size:clamp(26px,4vw,36px);font-weight:900;color:var(--dark);letter-spacing:-0.03em;margin-bottom:14px">Page not found</h1>
    <p style="font-size:16px;color:var(--muted);line-height:1.7;margin-bottom:32px">The guide or page you're looking for doesn't exist or may have been moved.</p>
    <div class="cta-buttons" style="justify-content:center">
      <a href="/blog" class="btn-primary">Browse All Guides →</a>
      <a href="/" class="btn-ghost">Go Home</a>
    </div>
  </div>
</section>

${footer()}`;

  return generateHtmlShell({
    title: "Page Not Found — Push44",
    description: "The page you're looking for doesn't exist or may have been moved.",
    canonical: `${BASE_URL}/404`,
    ogType: "website",
    schemas: [],
    body,
  });
}

// ─── Sitemap ───────────────────────────────────────────────────────────────────

export function generateSitemap(): string {
  const urls: Array<{ loc: string; priority: string; changefreq: string; lastmod: string }> = [
    { loc: `${BASE_URL}/`, priority: "1.0", changefreq: "weekly", lastmod: SITE.dateModified },
    { loc: `${BASE_URL}/blog`, priority: "0.9", changefreq: "daily", lastmod: SITE.dateModified },
    ...PLATFORMS.map(p => ({ loc: `${BASE_URL}/platforms/${p.slug}`, priority: "0.8", changefreq: "weekly", lastmod: SITE.dateModified })),
    ...ARTICLES.map(a => ({ loc: `${BASE_URL}/blog/${a.slug}`, priority: "0.8", changefreq: "monthly", lastmod: a.updatedAt })),
    ...COMPARISONS.map(c => ({ loc: `${BASE_URL}/compare/${c.slug}`, priority: "0.7", changefreq: "monthly", lastmod: c.updatedAt })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    <lastmod>${u.lastmod}</lastmod>
  </url>`).join("\n")}
</urlset>`;
}

// ─── RSS Feed ─────────────────────────────────────────────────────────────────

export function generateRss(): string {
  const items = ARTICLES.slice(0, 20)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map(a => `
  <item>
    <title><![CDATA[${a.h1}]]></title>
    <link>${BASE_URL}/blog/${a.slug}</link>
    <guid isPermaLink="true">${BASE_URL}/blog/${a.slug}</guid>
    <description><![CDATA[${a.description}]]></description>
    <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
    <category>${a.category}</category>
    <author>team@push44.app (Push44 Team)</author>
  </item>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Push44 Blog</title>
    <link>${BASE_URL}/blog</link>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Guides, tutorials and comparisons for exporting AI-generated source code to GitHub.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>team@push44.app (Push44 Team)</managingEditor>
    <webMaster>team@push44.app (Push44 Team)</webMaster>
    <image>
      <url>${BASE_URL}/logo.png</url>
      <title>Push44 Blog</title>
      <link>${BASE_URL}/blog</link>
    </image>
    ${items}
  </channel>
</rss>`;
}
