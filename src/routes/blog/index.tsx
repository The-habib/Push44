import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ARTICLES, CATEGORIES, POPULAR_SEARCHES, PLATFORMS, COMPARISONS, PLATFORM_META } from "@/seo/data";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Push44 Blog — Guides to Export AI-Generated Code" },
      { name: "description", content: "Step-by-step guides, tutorials and comparisons for exporting, backing up and owning AI-generated source code from Base44, Rocket.new, Floot and Zite." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Push44 Blog — Guides to Export AI-Generated Code" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://push44.vercel.app/blog" }],
  }),
  component: BlogHome,
});

// ── Typing animation for search ───────────────────────────────────────────────
const PLACEHOLDERS = [
  "How to export code from Base44",
  "Download Rocket.new source code",
  "Export Floot to GitHub",
  "Backup AI-generated apps",
  "Free AI code export tool",
  "GitHub version control for AI apps",
];

function useTypingPlaceholder() {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const phrase = PLACEHOLDERS[idx % PLACEHOLDERS.length];
    let timeout: ReturnType<typeof setTimeout>;
    if (typing) {
      if (text.length < phrase.length) {
        timeout = setTimeout(() => setText(phrase.slice(0, text.length + 1)), 55);
      } else {
        timeout = setTimeout(() => setTyping(false), 2400);
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), 28);
      } else {
        setIdx(i => i + 1);
        setTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [text, typing, idx]);

  return text;
}

export default function BlogHome() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof ARTICLES>([]);
  const placeholder = useTypingPlaceholder();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const lq = q.toLowerCase();
    const results = ARTICLES.filter(a =>
      a.h1.toLowerCase().includes(lq) ||
      a.description.toLowerCase().includes(lq) ||
      a.keywords.some(k => k.toLowerCase().includes(lq)) ||
      a.category.toLowerCase().includes(lq)
    ).slice(0, 6);
    setSearchResults(results);
  };

  const featured = ARTICLES.slice(0, 9);

  return (
    <div className="blog-wrap" style={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#18181b" }}>
      {/* responsive overrides */}
      
<style>{`
  /* ── Mobile nav safety ─────────────────────────────────── */
  .blog-wrap { overflow-x: hidden; }

  /* ── Hero ──────────────────────────────────────────────── */
  @media (max-width: 768px) {
    .b-hero  { padding: 48px 16px 56px !important; }
    .b-hero h1 { font-size: 32px !important; }
    .b-search  { padding: 12px 14px !important; }
    .b-chips   { gap: 8px !important; }
    .b-chip    { font-size: 12px !important; padding: 6px 12px !important; }
    .b-section { padding: 40px 16px !important; }
    .b-cats-grid   { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
    .b-cta-inner   { padding: 36px 20px !important; border-radius: 14px !important; }
    .b-cta-btns    { flex-direction: column !important; gap: 10px !important; }
    .b-cta-btns > * { width: 100% !important; justify-content: center !important; text-align: center !important; }
    .b-hdr { flex-direction: column !important; align-items: flex-start !important; }
  }
  @media (max-width: 480px) {
    .b-cats-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }

  /* ── Article page ───────────────────────────────────────── */
  @media (max-width: 1024px) {
    .art-body    { grid-template-columns: 1fr !important; padding: 28px 16px !important; gap: 0 !important; }
    .art-sidebar { display: none !important; }
    .art-hero    { padding: 36px 16px 48px !important; }
  }
  @media (max-width: 640px) {
    .art-related { grid-template-columns: 1fr !important; }
    .art-breadcrumb { font-size: 12px !important; }
    .art-meta    { flex-wrap: wrap !important; }
    .art-step    { gap: 12px !important; padding: 16px !important; }
    .art-step-num { width: 26px !important; height: 26px !important; font-size: 12px !important; flex-shrink: 0 !important; }
    .art-cta     { padding: 28px 20px !important; border-radius: 14px !important; }
  }

  /* ── Platform hub ───────────────────────────────────────── */
  @media (max-width: 900px) {
    .plat-howto  { grid-template-columns: 1fr !important; gap: 32px !important; }
    .plat-hero   { padding: 40px 16px !important; }
    .plat-section { padding: 40px 16px !important; }
  }

  /* ── Comparison page ────────────────────────────────────── */
  @media (max-width: 768px) {
    .cmp-hero    { padding: 40px 16px !important; }
    .cmp-scores  { gap: 10px !important; }
    .cmp-score   { min-width: 80px !important; padding: 12px 14px !important; }
    .cmp-body    { padding: 28px 16px !important; }
    .cmp-cta     { padding: 32px 20px !important; border-radius: 14px !important; }
  }
  @media (max-width: 640px) {
    .cmp-others  { grid-template-columns: 1fr !important; }
    .cmp-verdict { padding: 12px 16px !important; }
    table th, table td { padding: 10px 10px !important; font-size: 12px !important; }
  }
`}</style>

      {/* HERO */}
      <section className="b-hero" style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 0%,rgba(249,115,22,.15) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <span style={{ display: "inline-block", background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "5px 14px", borderRadius: 20, marginBottom: 20 }}>
            📚 Knowledge Base &amp; Documentation
          </span>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, color: "#f8fafc", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 18 }}>
            Export Code from{" "}
            <span style={{ background: "linear-gradient(135deg,#f97316,#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Every AI Builder</span>
          </h1>
          <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.7, marginBottom: 32, maxWidth: 560, margin: "0 auto 32px" }}>
            Step-by-step guides, tutorials, comparisons and documentation to export, backup and own your AI-generated source code.
          </p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: 520, margin: "0 auto 32px" }}>
            <div style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "#64748b", fontSize: 18 }}>🔍</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => handleSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && searchResults[0]) navigate({ to: "/blog/$slug", params: { slug: searchResults[0].slug } }); }}
                placeholder={placeholder || "Search guides..."}
                style={{ background: "none", border: "none", outline: "none", color: "#f8fafc", fontSize: 15, flex: 1, fontFamily: "inherit", width: "100%" }}
                aria-label="Search guides"
                autoComplete="off"
              />
              {query && <button onClick={() => { setQuery(""); setSearchResults([]); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>}
            </div>

            {/* Autocomplete */}
            {searchResults.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,.15)", zIndex: 100, marginTop: 6, overflow: "hidden" }}>
                {searchResults.map(a => {
                  const pm = PLATFORM_META[a.platform] || PLATFORM_META.general;
                  return (
                    <Link key={a.slug} to="/blog/$slug" params={{ slug: a.slug }} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", textDecoration: "none", borderBottom: "1px solid #f4f4f5" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: pm.color, background: pm.bgColor, border: `1px solid ${pm.color}44`, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0 }}>{a.platform !== "general" ? pm.name : "Guide"}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#18181b" }}>{a.h1}</div>
                        <div style={{ fontSize: 12, color: "#71717a", marginTop: 2 }}>⏱ {a.readTime} min · {a.views.toLocaleString()} views</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Popular chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {POPULAR_SEARCHES.slice(0, 8).map(s => (
              <Link key={s.slug} to="/blog/$slug" params={{ slug: s.slug }} style={{ display: "inline-flex", alignItems: "center", padding: "8px 16px", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 30, fontSize: 13, fontWeight: 500, color: "#cbd5e1", textDecoration: "none", transition: "all 0.15s", whiteSpace: "nowrap" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#f97316"; (e.currentTarget as HTMLElement).style.color = "#f97316"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color = "#cbd5e1"; }}>
                {s.label}
              </Link>
            ))}
          </div>

          {/* Trust bar */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 32px", marginTop: 40, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              [`${ARTICLES.length}+`, "Guides & Tutorials"],
              [`${PLATFORMS.length}`, "Platforms Covered"],
              ["100%", "Free, No Sign-Up"],
              ["MIT", "Open Source License"],
            ].map(([stat, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#f97316", letterSpacing: "-0.02em" }}>{stat}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR SEARCHES */}
      <section className="b-section" style={{ padding: "48px 24px", background: "#fafafa", borderBottom: "1px solid #e4e4e7" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#18181b", marginBottom: 6 }}>Popular Searches</h2>
            <p style={{ fontSize: 14, color: "#71717a" }}>What developers search for most</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {POPULAR_SEARCHES.map(s => (
              <Link key={s.slug} to="/blog/$slug" params={{ slug: s.slug }}
                style={{ display: "inline-flex", alignItems: "center", padding: "8px 16px", background: "#fff", border: "1.5px solid #e4e4e7", borderRadius: 30, fontSize: 13, fontWeight: 500, color: "#52525b", textDecoration: "none", transition: "all 0.15s", whiteSpace: "nowrap" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#f97316"; (e.currentTarget as HTMLElement).style.color = "#f97316"; (e.currentTarget as HTMLElement).style.background = "#fff7ed"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e4e4e7"; (e.currentTarget as HTMLElement).style.color = "#52525b"; (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="b-section" style={{ padding: "64px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span style={{ display: "inline-block", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", color: "#f97316", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "5px 12px", borderRadius: 20, marginBottom: 12 }}>Browse by Topic</span>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 800, color: "#18181b", letterSpacing: "-0.03em", marginBottom: 10 }}>All Categories</h2>
          </div>
          <div className="b-cats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
            {CATEGORIES.map(c => (
              <Link key={c.slug} to="/blog" search={{ category: c.slug }}
                style={{ display: "block", background: c.color, border: "1px solid #e4e4e7", borderRadius: 12, padding: 20, textAlign: "center", textDecoration: "none", color: "inherit", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,.07)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#18181b", marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "#71717a", lineHeight: 1.4 }}>{c.description}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED GUIDES */}
      <section style={{ padding: "64px 24px", background: "#fafafa", borderTop: "1px solid #e4e4e7", borderBottom: "1px solid #e4e4e7" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="b-hdr" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, gap: 16, flexWrap: "wrap" }}>
            <div>
              <span style={{ display: "inline-block", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", color: "#f97316", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "5px 12px", borderRadius: 20, marginBottom: 12 }}>🌟 Trending</span>
              <h2 style={{ fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 800, color: "#18181b", letterSpacing: "-0.03em" }}>Featured Guides</h2>
            </div>
            <Link to="/blog" style={{ fontSize: 14, fontWeight: 600, color: "#f97316", textDecoration: "none" }}>View all →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {featured.map(a => <ArticleCard key={a.slug} article={a} />)}
          </div>
        </div>
      </section>

      {/* PLATFORM HUB */}
      <section style={{ padding: "64px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span style={{ display: "inline-block", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", color: "#f97316", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "5px 12px", borderRadius: 20, marginBottom: 12 }}>🔗 Platform Hub</span>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 800, color: "#18181b", letterSpacing: "-0.03em", marginBottom: 10 }}>Export from Every Platform</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {PLATFORMS.map(p => (
              <Link key={p.slug} to="/platforms/$platform" params={{ platform: p.slug }}
                style={{ display: "block", background: p.bgColor, border: `1.5px solid ${p.color}33`, borderRadius: 16, padding: 28, textDecoration: "none", color: "inherit", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,.09)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#fff" }}>{p.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: "#18181b" }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: "#71717a" }}>{p.articles.length} guides</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "#52525b", lineHeight: 1.6, marginBottom: 14 }}>{p.tagline}</p>
                <span style={{ fontSize: 14, fontWeight: 600, color: p.color }}>View all guides →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISONS */}
      <section style={{ padding: "64px 24px", background: "#fafafa", borderTop: "1px solid #e4e4e7" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, gap: 16, flexWrap: "wrap" }}>
            <div>
              <span style={{ display: "inline-block", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", color: "#f97316", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "5px 12px", borderRadius: 20, marginBottom: 12 }}>⚖️ Compare</span>
              <h2 style={{ fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 800, color: "#18181b", letterSpacing: "-0.03em" }}>Side-by-Side Comparisons</h2>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {COMPARISONS.map(c => (
              <Link key={c.slug} to="/compare/$slug" params={{ slug: c.slug }}
                style={{ display: "flex", flexDirection: "column", gap: 14, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 14, padding: 24, textDecoration: "none", color: "inherit", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,.08)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ""; (e.currentTarget as HTMLElement).style.transform = ""; }}>
                <span style={{ display: "inline-block", background: "#f8fafc", color: "#64748b", border: "1px solid #e4e4e7", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, width: "fit-content" }}>⚖️ Compare</span>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#18181b", lineHeight: 1.35 }}>{c.h1}</div>
                <div style={{ fontSize: 14, color: "#71717a", lineHeight: 1.6 }}>{c.summary.slice(0, 100)}...</div>
                <div style={{ fontSize: 12, color: "#a1a1aa" }}>{c.aspects.length} aspects compared</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "64px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="b-cta-inner" style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: 20, padding: "56px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 50% 50%,rgba(249,115,22,.12) 0%,transparent 70%)", pointerEvents: "none" }} />
            <h2 style={{ fontSize: 30, fontWeight: 800, color: "#f8fafc", marginBottom: 14, letterSpacing: "-0.03em", position: "relative" }}>Ready to Own Your AI Code?</h2>
            <p style={{ fontSize: 16, color: "#94a3b8", marginBottom: 28, position: "relative" }}>Export your complete source code from any AI platform to GitHub in under 2 minutes. Free forever.</p>
            <div className="b-cta-btns" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
              <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 14px rgba(249,115,22,.35)" }}>
                Start Exporting Now →
              </Link>
              <a href="https://github.com/The-habib/Push44" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", background: "transparent", color: "#94a3b8", border: "1.5px solid rgba(255,255,255,.15)", borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ArticleCard({ article: a }: { article: typeof ARTICLES[0] }) {
  const pm = PLATFORM_META[a.platform] || PLATFORM_META.general;
  return (
    <Link to="/blog/$slug" params={{ slug: a.slug }}
      style={{ display: "flex", flexDirection: "column", gap: 14, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 14, padding: 24, textDecoration: "none", color: "inherit", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,.08)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.borderColor = "#d4d4d8"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ""; (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.borderColor = "#e4e4e7"; }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${pm.color}, ${pm.color}88)` }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {a.platform !== "general" && <span style={{ fontSize: 12, fontWeight: 600, color: pm.color, background: pm.bgColor, border: `1px solid ${pm.color}44`, padding: "2px 8px", borderRadius: 20 }}>{pm.name}</span>}
        <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: a.difficulty === "beginner" ? "#f0fdf4" : a.difficulty === "intermediate" ? "#fff7ed" : "#fef2f2", color: a.difficulty === "beginner" ? "#16a34a" : a.difficulty === "intermediate" ? "#f97316" : "#ef4444", border: `1px solid ${a.difficulty === "beginner" ? "#bbf7d0" : a.difficulty === "intermediate" ? "#fed7aa" : "#fecaca"}` }}>{a.difficulty}</span>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#18181b", lineHeight: 1.35, letterSpacing: "-0.02em" }}>{a.h1}</div>
      <div style={{ fontSize: 14, color: "#71717a", lineHeight: 1.6 }}>{a.description.slice(0, 110)}...</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#a1a1aa", marginTop: "auto" }}>
        <span>⏱ {a.readTime} min</span>
        <span>•</span>
        <span>👁 {a.views.toLocaleString()}</span>
        <span>•</span>
        <span>{new Date(a.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
      </div>
    </Link>
  );
}
