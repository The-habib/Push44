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
    body{font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      color:#18181b;background:#fff;-webkit-font-smoothing:antialiased;line-height:1.6}
    a{color:inherit;text-decoration:none}
    img{max-width:100%;height:auto;display:block}
    :root{--orange:#f97316;--orange-dark:#ea580c;--dark:#09090b;--text:#18181b;
      --muted:#71717a;--border:#e4e4e7;--bg:#fafafa;--white:#fff;--radius:10px}

    /* ── Layout ── */
    .container{max-width:1200px;margin:0 auto;padding:0 24px}
    .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}

    /* ── Nav ── */
    .nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.92);
      backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
      border-bottom:1px solid var(--border)}
    .nav-inner{max-width:1200px;margin:0 auto;padding:0 24px;height:64px;
      display:flex;align-items:center;gap:0}
    .nav-logo{display:flex;align-items:center;gap:9px;font-weight:800;
      font-size:16px;color:var(--dark);letter-spacing:-0.03em;flex-shrink:0}
    .nav-logo img{width:30px;height:30px;border-radius:8px;object-fit:contain}
    .nav-links{display:flex;align-items:center;gap:4px;margin-left:36px;flex:1}
    .nav-link{background:none;border:none;cursor:pointer;font-size:14px;
      color:var(--muted);font-weight:500;padding:6px 12px;border-radius:8px;
      transition:all 0.15s;font-family:inherit;display:inline-block}
    .nav-link:hover{color:var(--dark);background:var(--bg)}
    .nav-link.active{color:var(--orange);font-weight:600}
    .nav-cta{margin-left:auto;background:linear-gradient(135deg,#f97316,#ea580c);
      color:#fff;border:none;border-radius:10px;font-weight:700;font-size:14px;
      padding:9px 18px;cursor:pointer;display:inline-flex;align-items:center;
      gap:8px;transition:all 0.2s;box-shadow:0 4px 14px rgba(249,115,22,.35);font-family:inherit}
    .nav-cta:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(249,115,22,.45)}

    /* ── Buttons ── */
    .btn-primary{display:inline-flex;align-items:center;gap:8px;padding:13px 24px;
      background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;border:none;
      border-radius:10px;font-weight:700;font-size:15px;cursor:pointer;
      text-decoration:none;box-shadow:0 4px 14px rgba(249,115,22,.35);
      transition:all 0.2s;font-family:inherit}
    .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(249,115,22,.45)}
    .btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;
      background:transparent;color:#52525b;border:1.5px solid var(--border);
      border-radius:10px;font-weight:600;font-size:15px;cursor:pointer;
      text-decoration:none;transition:all 0.2s;font-family:inherit}
    .btn-ghost:hover{border-color:#a1a1aa;background:var(--bg);color:var(--dark)}

    /* ── Badge ── */
    .badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;
      border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.02em}
    .badge-platform{background:var(--platform-bg,#fff7ed);color:var(--platform-color,#f97316);
      border:1px solid color-mix(in srgb,var(--platform-color,#f97316) 30%,transparent)}
    .badge-difficulty-beginner{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0}
    .badge-difficulty-intermediate{background:#fff7ed;color:#f97316;border:1px solid #fed7aa}
    .badge-difficulty-advanced{background:#fef2f2;color:#ef4444;border:1px solid #fecaca}

    /* ── Callout blocks ── */
    .callout{border-radius:10px;padding:16px 20px;margin:24px 0;border-left:4px solid}
    .callout-tip{background:#f0fdf4;border-color:#22c55e;color:#15803d}
    .callout-warning{background:#fefce8;border-color:#eab308;color:#854d0e}
    .callout-info{background:#eff6ff;border-color:#3b82f6;color:#1d4ed8}
    .callout-title{font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:6px}

    /* ── Code block ── */
    .code-block{background:#0f172a;border-radius:10px;padding:20px 24px;margin:20px 0;overflow-x:auto}
    .code-block code{font-family:'JetBrains Mono','Fira Code','Courier New',monospace;
      font-size:13px;color:#e2e8f0;line-height:1.7}

    /* ── Footer ── */
    .footer{background:#0f172a;color:#94a3b8;padding:60px 24px 40px;margin-top:80px}
    .footer-inner{max-width:1200px;margin:0 auto}
    .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px}
    .footer-brand{font-size:13px;line-height:1.7;color:#64748b;margin-top:12px}
    .footer-col h4{font-size:12px;font-weight:700;color:#f8fafc;letter-spacing:0.08em;
      text-transform:uppercase;margin-bottom:14px}
    .footer-col a{display:block;font-size:14px;color:#64748b;margin-bottom:10px;transition:color 0.15s}
    .footer-col a:hover{color:#f97316}
    .footer-bottom{margin-top:48px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.07);
      display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
    .footer-bottom p{font-size:13px;color:#475569}

    /* ── Chip (popular search) ── */
    .chip{display:inline-flex;align-items:center;padding:8px 16px;background:#fff;
      border:1.5px solid var(--border);border-radius:30px;font-size:13px;font-weight:500;
      color:#52525b;cursor:pointer;transition:all 0.15s;white-space:nowrap;text-decoration:none}
    .chip:hover{border-color:var(--orange);color:var(--orange);background:#fff7ed}

    /* ── Article card ── */
    .article-card{background:#fff;border:1px solid var(--border);border-radius:14px;
      padding:24px;transition:all 0.2s;display:flex;flex-direction:column;gap:14px;
      text-decoration:none;color:inherit}
    .article-card:hover{box-shadow:0 8px 32px rgba(0,0,0,.08);transform:translateY(-3px);border-color:#d4d4d8}
    .article-card-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .article-card-title{font-size:17px;font-weight:700;color:var(--dark);line-height:1.35;letter-spacing:-0.02em}
    .article-card-desc{font-size:14px;color:var(--muted);line-height:1.6}
    .article-card-footer{display:flex;align-items:center;gap:8px;font-size:12px;color:#a1a1aa;margin-top:auto}

    /* ── Comparison table ── */
    .comparison-table{width:100%;border-collapse:collapse;margin:24px 0}
    .comparison-table th{background:#fafafa;padding:14px 18px;text-align:left;
      font-size:13px;font-weight:700;color:var(--muted);letter-spacing:0.05em;
      text-transform:uppercase;border-bottom:2px solid var(--border)}
    .comparison-table td{padding:16px 18px;border-bottom:1px solid #fafafa;font-size:14px;vertical-align:top}
    .comparison-table tr:hover td{background:#fafafa}
    .winner-a{color:#f97316;font-weight:700}
    .winner-b{color:#22c55e;font-weight:700}
    .winner-tie{color:#64748b;font-weight:600}
    .score-bar{height:6px;border-radius:3px;background:#f4f4f5;width:60px;display:inline-block;overflow:hidden;vertical-align:middle;margin-left:6px}
    .score-fill{height:100%;border-radius:3px;background:var(--orange)}

    /* ── TOC ── */
    .toc-link{display:block;font-size:13px;color:var(--muted);padding:5px 0 5px 12px;
      border-left:2px solid var(--border);transition:all 0.15s;text-decoration:none;line-height:1.4}
    .toc-link:hover{color:var(--orange);border-left-color:var(--orange)}
    .toc-link.active{color:var(--orange);border-left-color:var(--orange);font-weight:600}
    .toc-link.h3{padding-left:24px;font-size:12px}

    /* ── FAQ ── */
    .faq-item{border-bottom:1px solid var(--border);padding:20px 0}
    .faq-question{font-size:16px;font-weight:700;color:var(--dark);margin-bottom:10px;line-height:1.4}
    .faq-answer{font-size:15px;color:#52525b;line-height:1.7}

    /* ── Step card ── */
    .step-card{display:flex;gap:20px;margin:24px 0;padding:20px 24px;
      background:#fafafa;border-radius:12px;border:1px solid var(--border)}
    .step-num{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ea580c);
      color:#fff;font-weight:800;font-size:14px;display:flex;align-items:center;
      justify-content:center;flex-shrink:0;margin-top:2px}
    .step-content h3{font-size:16px;font-weight:700;color:var(--dark);margin-bottom:8px}
    .step-content p{font-size:14px;color:#52525b;line-height:1.7}

    /* ── Category card ── */
    .cat-card{background:#fff;border:1px solid var(--border);border-radius:12px;
      padding:20px;text-align:center;transition:all 0.2s;text-decoration:none;color:inherit;display:block}
    .cat-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.07);transform:translateY(-2px);border-color:#d4d4d8}
    .cat-icon{font-size:28px;margin-bottom:10px}
    .cat-name{font-weight:700;font-size:14px;color:var(--dark);margin-bottom:4px}
    .cat-desc{font-size:12px;color:var(--muted);line-height:1.4}

    /* ── Hero ── */
    .blog-hero{background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);
      padding:80px 24px;position:relative;overflow:hidden}
    .blog-hero::before{content:'';position:absolute;inset:0;
      background:radial-gradient(ellipse 60% 60% at 50% 0%,rgba(249,115,22,.15) 0%,transparent 70%);
      pointer-events:none}
    .blog-hero-inner{max-width:800px;margin:0 auto;text-align:center;position:relative;z-index:1}
    .blog-hero h1{font-size:clamp(32px,5vw,52px);font-weight:900;color:#f8fafc;
      letter-spacing:-0.04em;line-height:1.1;margin-bottom:18px}
    .blog-hero h1 span{background:linear-gradient(135deg,#f97316,#fb923c);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .blog-hero p{font-size:17px;color:#94a3b8;line-height:1.7;margin-bottom:32px;max-width:600px;margin-left:auto;margin-right:auto}

    /* ── Search box ── */
    .search-box{background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.12);
      border-radius:14px;padding:14px 20px;display:flex;align-items:center;gap:12px;
      backdrop-filter:blur(8px);max-width:520px;margin:0 auto 32px}
    .search-box input{background:none;border:none;outline:none;color:#f8fafc;font-size:15px;
      flex:1;font-family:inherit;width:100%}
    .search-box input::placeholder{color:#64748b}
    .search-icon{color:#64748b;flex-shrink:0;font-size:18px}

    /* ── Section headings ── */
    .section-badge{display:inline-flex;align-items:center;gap:6px;
      background:linear-gradient(135deg,rgba(249,115,22,.1),rgba(249,115,22,.06));
      border:1px solid rgba(249,115,22,.25);color:#f97316;font-size:11px;font-weight:700;
      letter-spacing:0.07em;text-transform:uppercase;padding:5px 12px;border-radius:20px;margin-bottom:12px}
    .section-title{font-size:clamp(24px,3.5vw,32px);font-weight:800;color:var(--dark);
      letter-spacing:-0.03em;line-height:1.2;margin-bottom:10px}
    .section-subtitle{font-size:16px;color:var(--muted);line-height:1.6;margin-bottom:40px}

    /* ── Grid layouts ── */
    .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
    .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}

    /* ── Sidebar layout ── */
    .article-layout{display:grid;grid-template-columns:1fr 300px;gap:56px;align-items:start;max-width:1200px;margin:0 auto;padding:48px 24px}
    .article-content h2{font-size:22px;font-weight:800;color:var(--dark);margin:36px 0 14px;letter-spacing:-0.02em;line-height:1.3}
    .article-content h3{font-size:18px;font-weight:700;color:var(--dark);margin:28px 0 10px;line-height:1.35}
    .article-content p{font-size:16px;color:#374151;line-height:1.8;margin-bottom:18px}
    .article-content ul,
    .article-content ol{margin:16px 0 20px 24px;padding:0}
    .article-content li{font-size:15px;color:#374151;line-height:1.7;margin-bottom:8px}
    .article-content strong{color:var(--dark);font-weight:700}
    .sidebar{position:sticky;top:80px}
    .sidebar-card{background:#fff;border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px}
    .sidebar-card h4{font-size:12px;font-weight:700;color:var(--muted);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px}

    /* ── Progress bar ── */
    .reading-progress{position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#f97316,#fb923c);z-index:200;transition:width 0.1s}

    /* ── Breadcrumbs ── */
    .breadcrumbs{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted);margin-bottom:20px;flex-wrap:wrap}
    .breadcrumbs a{color:var(--muted);transition:color 0.15s}
    .breadcrumbs a:hover{color:var(--orange)}
    .breadcrumbs span{color:#d4d4d8}

    /* ── Platform hub ── */
    .platform-hero{padding:60px 24px;border-bottom:1px solid var(--border)}
    .platform-hero-inner{max-width:1200px;margin:0 auto}

    /* ── CTA section ── */
    .cta-section{background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:20px;
      padding:56px 48px;text-align:center;margin:56px 0;position:relative;overflow:hidden}
    .cta-section::before{content:'';position:absolute;inset:0;
      background:radial-gradient(ellipse 60% 80% at 50% 50%,rgba(249,115,22,.12) 0%,transparent 70%)}
    .cta-section h2{font-size:30px;font-weight:800;color:#f8fafc;margin-bottom:14px;letter-spacing:-0.03em;position:relative}
    .cta-section p{font-size:16px;color:#94a3b8;margin-bottom:28px;position:relative}
    .cta-buttons{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative}

    /* ── Responsive ── */
    @media(max-width:768px){
      .grid-3,.grid-4{grid-template-columns:1fr 1fr}
      .grid-2{grid-template-columns:1fr}
      .footer-grid{grid-template-columns:1fr 1fr}
      .nav-links{display:none}
      .article-layout{grid-template-columns:1fr;padding:24px 16px}
      .sidebar{position:static}
      .blog-hero{padding:56px 16px}
      .cta-section{padding:36px 24px}
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
      <p>© 2026 Push44. MIT License. Open source at <a href="https://github.com/The-habib/Push44" style="color:#f97316">github.com/The-habib/Push44</a>.</p>
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
        "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png`, "width": 512, "height": 512 },
        "description": SITE.tagline,
        "sameAs": ["https://github.com/The-habib/Push44"],
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        "url": BASE_URL,
        "name": "Push44",
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

  <!-- Open Graph -->
  <meta property="og:title" content="${escHtml(title)}" />
  <meta property="og:description" content="${escHtml(description)}" />
  <meta property="og:url" content="${escHtml(canonical)}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:site_name" content="Push44" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:image" content="${BASE_URL}/logo.png" />
  <meta property="og:image:width" content="512" />
  <meta property="og:image:height" content="512" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="${SITE.twitter}" />
  <meta name="twitter:title" content="${escHtml(title)}" />
  <meta name="twitter:description" content="${escHtml(description)}" />
  <meta name="twitter:image" content="${BASE_URL}/logo.png" />

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
<section class="blog-hero" aria-label="Blog hero">
  <div class="blog-hero-inner">
    <p class="section-badge" style="color:#fb923c;background:rgba(249,115,22,0.12);border-color:rgba(249,115,22,0.3);margin-bottom:20px">
      📚 Knowledge Base &amp; Documentation
    </p>
    <h1>Export Code from <span>Every AI Builder</span></h1>
    <p>Step-by-step guides, tutorials, comparisons and documentation to export, backup and own your AI-generated source code.</p>

    <!-- Search -->
    <form class="search-box" role="search" action="/blog" method="get" aria-label="Search guides">
      <span class="search-icon" aria-hidden="true">🔍</span>
      <input type="search" name="q" placeholder="Search guides... e.g. How to export code from Base44" aria-label="Search guides" />
      <button type="submit" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:14px;font-weight:600">Search</button>
    </form>

    <!-- Popular search chips -->
    <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center">
      ${POPULAR_SEARCHES.slice(0, 8).map(s => `
        <a href="/blog/${s.slug}" class="chip" style="border-color:rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#cbd5e1">
          ${escHtml(s.label)}
        </a>`).join("")}
    </div>
  </div>
</section>

<!-- POPULAR SEARCHES -->
<section style="padding:48px 24px;background:#fafafa;border-bottom:1px solid var(--border)" aria-labelledby="popular-searches-heading">
  <div class="container">
    <div style="text-align:center;margin-bottom:28px">
      <h2 id="popular-searches-heading" style="font-size:20px;font-weight:800;color:var(--dark);margin-bottom:6px">Popular Searches</h2>
      <p style="font-size:14px;color:var(--muted)">What developers search for most</p>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center">
      ${POPULAR_SEARCHES.map(s => `<a href="/blog/${s.slug}" class="chip">${escHtml(s.label)}</a>`).join("")}
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
        <a href="/blog?category=${c.slug}" class="cat-card" style="background:${c.color}" aria-label="Browse ${c.name} guides">
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
      <a href="/blog" style="font-size:14px;font-weight:600;color:var(--orange)">View all guides →</a>
    </div>
    <div class="grid-3">
      ${featured.map(a => articleCard(a)).join("")}
    </div>
  </div>
</section>

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

// ─── Article Card Helper ───────────────────────────────────────────────────────

function articleCard(a: Article): string {
  const pm = PLATFORM_META[a.platform] || PLATFORM_META.general;
  return `
<a href="/blog/${a.slug}" class="article-card" aria-label="${escHtml(a.h1)}">
  <div class="article-card-meta">
    ${a.platform !== "general" ? `<span class="badge badge-platform" style="--platform-color:${pm.color};--platform-bg:${pm.bgColor}">${pm.name}</span>` : ""}
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
<div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:48px 24px 64px;margin-bottom:0">
  <div style="max-width:800px;margin:0 auto">

    <!-- Breadcrumbs -->
    <nav class="breadcrumbs" aria-label="Breadcrumb" style="color:rgba(148,163,184,0.8)">
      <a href="/" style="color:rgba(148,163,184,0.7)">Push44</a>
      <span aria-hidden="true">›</span>
      <a href="/blog" style="color:rgba(148,163,184,0.7)">Blog</a>
      <span aria-hidden="true">›</span>
      ${article.platform !== "general" ? `<a href="/platforms/${article.platform}" style="color:rgba(148,163,184,0.7)">${pm.name}</a><span aria-hidden="true">›</span>` : ""}
      <span style="color:#94a3b8" aria-current="page">${escHtml(article.h1.slice(0, 40))}${article.h1.length > 40 ? "…" : ""}</span>
    </nav>

    <!-- Meta -->
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:18px">
      ${article.platform !== "general" ? `<span class="badge badge-platform" style="--platform-color:${pm.color};--platform-bg:rgba(255,255,255,0.1);color:${pm.color}">${pm.name}</span>` : ""}
      <span class="badge badge-difficulty-${article.difficulty}">${article.difficulty}</span>
      <span style="font-size:13px;color:#64748b">⏱ ${article.readTime} min read</span>
      <span style="font-size:13px;color:#64748b">• 👁 ${article.views.toLocaleString()} views</span>
    </div>

    <h1 style="font-size:clamp(28px,4.5vw,42px);font-weight:900;color:#f8fafc;letter-spacing:-0.04em;line-height:1.1;margin-bottom:18px">${escHtml(article.h1)}</h1>
    <p style="font-size:17px;color:#94a3b8;line-height:1.7;margin-bottom:24px;max-width:640px">${escHtml(article.intro)}</p>

    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ea580c);display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:13px" aria-hidden="true">P</div>
        <div>
          <div style="font-size:13px;font-weight:600;color:#e2e8f0">Push44 Team</div>
          <div style="font-size:12px;color:#64748b">Updated ${new Date(article.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
        </div>
      </div>
      <!-- Share -->
      <div style="margin-left:auto;display:flex;gap:10px;flex-wrap:wrap">
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.h1)}&url=${encodeURIComponent(canonical)}" target="_blank" rel="noopener noreferrer" style="font-size:12px;font-weight:600;color:#64748b;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);padding:6px 14px;border-radius:20px;text-decoration:none">Share on X</a>
        <a href="https://news.ycombinator.com/submitlink?u=${encodeURIComponent(canonical)}&t=${encodeURIComponent(article.h1)}" target="_blank" rel="noopener noreferrer" style="font-size:12px;font-weight:600;color:#64748b;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);padding:6px 14px;border-radius:20px;text-decoration:none">HN</a>
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
      <div style="width:64px;height:64px;border-radius:16px;background:${platform.color};display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff" aria-hidden="true">${platform.name[0]}</div>
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
        <a href="/platforms/${p.slug}" class="cat-card" style="background:${p.bgColor}" aria-label="${p.name} export hub">
          <div style="width:40px;height:40px;border-radius:10px;background:${p.color};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#fff;margin:0 auto 12px" aria-hidden="true">${p.name[0]}</div>
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
<div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:64px 24px">
  <div style="max-width:900px;margin:0 auto">

    <nav class="breadcrumbs" aria-label="Breadcrumb" style="color:rgba(148,163,184,0.8)">
      <a href="/" style="color:rgba(148,163,184,0.7)">Push44</a><span>›</span>
      <a href="/blog" style="color:rgba(148,163,184,0.7)">Blog</a><span>›</span>
      <span style="color:#94a3b8" aria-current="page">Comparison</span>
    </nav>

    <span class="badge" style="background:rgba(249,115,22,0.15);color:#f97316;border:1px solid rgba(249,115,22,0.3);margin-bottom:20px;margin-top:12px;display:inline-flex">⚖️ Comparison</span>
    <h1 style="font-size:clamp(28px,4vw,44px);font-weight:900;color:#f8fafc;letter-spacing:-0.04em;line-height:1.1;margin-bottom:18px">${escHtml(comparison.h1)}</h1>
    <p style="font-size:17px;color:#94a3b8;line-height:1.7;max-width:600px;margin-bottom:32px">${escHtml(comparison.description)}</p>

    <!-- Score summary -->
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <div style="background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.3);border-radius:12px;padding:14px 20px;text-align:center;min-width:100px">
        <div style="font-size:24px;font-weight:900;color:#f97316">${aWins}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px">${escHtml(aLabel)} wins</div>
      </div>
      <div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);border-radius:12px;padding:14px 20px;text-align:center;min-width:100px">
        <div style="font-size:24px;font-weight:900;color:#22c55e">${bWins}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px">${escHtml(bLabel)} wins</div>
      </div>
      ${ties > 0 ? `
      <div style="background:rgba(100,116,139,0.1);border:1px solid rgba(100,116,139,0.2);border-radius:12px;padding:14px 20px;text-align:center;min-width:100px">
        <div style="font-size:24px;font-weight:900;color:#64748b">${ties}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px">Ties</div>
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
            <th scope="col" style="color:#f97316">${escHtml(aLabel)}</th>
            <th scope="col" style="color:#22c55e">${escHtml(bLabel)}</th>
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
                  <div class="score-bar"><div class="score-fill" style="width:${(a.b.score / 5) * 100}%;background:#22c55e"></div></div>
                  <span style="font-size:12px;color:var(--muted)">${a.b.score}/5</span>
                </div>
              </td>
              <td>
                <span class="${a.winner === "a" ? "winner-a" : a.winner === "b" ? "winner-b" : "winner-tie"}">
                  ${a.winner === "a" ? "✓ " + escHtml(aLabel) : a.winner === "b" ? "✓ " + escHtml(bLabel) : "Tie"}
                </span>
                <div style="font-size:12px;color:var(--muted);margin-top:4px;line-height:1.4">${escHtml(a.note)}</div>
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
