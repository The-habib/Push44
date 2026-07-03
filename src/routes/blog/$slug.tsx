import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getArticle, getRelatedArticles, ARTICLES, POPULAR_SEARCHES, PLATFORMS, PLATFORM_META, type Article } from "@/seo/data";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) return { meta: [{ title: "Not Found — Push44" }] };
    return {
      meta: [
        { title: article.title },
        { name: "description", content: article.description },
        { name: "keywords", content: article.keywords.join(", ") },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.description },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: `https://push44.vercel.app/blog/${params.slug}` }],
    };
  },
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  component: ArticlePage,
  notFoundComponent: () => (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <h1 style={{ fontSize: 48, fontWeight: 900, color: "#18181b" }}>404</h1>
      <p style={{ color: "#71717a", margin: "12px 0 24px" }}>Article not found</p>
      <Link to="/blog" style={{ color: "#f97316", fontWeight: 600, textDecoration: "none" }}>← Back to Blog</Link>
    </div>
  ),
});

function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const fn = () => {
      const s = document.documentElement;
      setProgress(Math.min((s.scrollTop / (s.scrollHeight - s.clientHeight)) * 100, 100));
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return progress;
}

export default function ArticlePage() {
  const { article } = Route.useLoaderData();
  const [activeSection, setActiveSection] = useState("introduction");
  const progress = useReadingProgress();
  const pm = PLATFORM_META[article.platform] || PLATFORM_META.general;
  const relatedArticles = getRelatedArticles(article);
  const platformData = PLATFORMS.find(p => p.slug === article.platform);

  const toc = [
    { id: "introduction", label: "Introduction" },
    { id: "the-problem", label: "The Problem" },
    { id: "the-solution", label: "The Solution" },
    { id: "step-by-step", label: "Step-by-Step Guide" },
    article.tips.length > 0 && { id: "tips", label: "Pro Tips" },
    article.mistakes.length > 0 && { id: "mistakes", label: "Common Mistakes" },
    { id: "faq", label: "FAQ" },
    relatedArticles.length > 0 && { id: "related", label: "Related Guides" },
  ].filter(Boolean) as Array<{ id: string; label: string }>;

  // Scroll spy
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
    }, { threshold: 0.5, rootMargin: "-80px 0px -40% 0px" });
    toc.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="blog-wrap" style={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#18181b" }}>
      
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

      {/* Reading progress */}
      <div style={{ position: "fixed", top: 0, left: 0, height: 3, width: `${progress}%`, background: "linear-gradient(90deg,#f97316,#fb923c)", zIndex: 200, transition: "width 0.1s" }} role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} />

      {/* HERO */}
      <div className="art-hero" style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", padding: "48px 24px 64px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(148,163,184,0.8)", marginBottom: 20, flexWrap: "wrap" }}>
            <Link to="/" style={{ color: "rgba(148,163,184,0.7)", textDecoration: "none" }}>Push44</Link>
            <span>›</span>
            <Link to="/blog/" style={{ color: "rgba(148,163,184,0.7)", textDecoration: "none" }}>Blog</Link>
            <span>›</span>
            {article.platform !== "general" && (
              <>
                <Link to="/platforms/$platform" params={{ platform: article.platform }} style={{ color: "rgba(148,163,184,0.7)", textDecoration: "none" }}>{pm.name}</Link>
                <span>›</span>
              </>
            )}
            <span style={{ color: "#94a3b8" }} aria-current="page">{article.h1.slice(0, 40)}{article.h1.length > 40 ? "…" : ""}</span>
          </nav>

          {/* Meta badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
            {article.platform !== "general" && (
              <span style={{ fontSize: 12, fontWeight: 600, color: pm.color, background: "rgba(255,255,255,0.1)", border: `1px solid ${pm.color}66`, padding: "3px 10px", borderRadius: 20 }}>{pm.name}</span>
            )}
            <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: article.difficulty === "beginner" ? "rgba(34,197,94,0.15)" : "rgba(249,115,22,0.15)", color: article.difficulty === "beginner" ? "#22c55e" : "#f97316", border: `1px solid ${article.difficulty === "beginner" ? "#22c55e33" : "#f9731633"}` }}>
              {article.difficulty}
            </span>
            <span style={{ fontSize: 13, color: "#64748b" }}>⏱ {article.readTime} min read</span>
            <span style={{ fontSize: 13, color: "#64748b" }}>· 👁 {article.views.toLocaleString()} views</span>
          </div>

          <h1 style={{ fontSize: "clamp(28px,4.5vw,42px)", fontWeight: 900, color: "#f8fafc", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 18 }}>
            {article.h1}
          </h1>
          <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.7, marginBottom: 24, maxWidth: 640 }}>{article.intro}</p>

          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#ea580c)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 13 }}>P</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Push44 Team</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>Updated {new Date(article.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.h1)}&url=${encodeURIComponent(`https://push44.vercel.app/blog/${article.slug}`)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "#64748b", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", padding: "6px 14px", borderRadius: 20, textDecoration: "none" }}>Share on X</a>
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="art-body" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 56, alignItems: "start", maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>

        {/* Article content */}
        <article>

          {/* Quick Summary */}
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: 24, marginBottom: 36 }} id="introduction">
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#15803d", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>✅ Quick Summary</h2>
            <p style={{ fontSize: 15, color: "#166534", lineHeight: 1.6, margin: 0 }}>{article.solution}</p>
          </div>

          {/* Problem */}
          <section id="the-problem">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#18181b", margin: "36px 0 14px", letterSpacing: "-0.02em" }}>The Problem</h2>
            <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.8 }}>{article.problem}</p>
          </section>

          {/* Solution */}
          <section id="the-solution">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#18181b", margin: "36px 0 14px", letterSpacing: "-0.02em" }}>How Push44 Solves It</h2>
            <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.8 }}>{article.solution}</p>
          </section>

          {/* Steps */}
          <section id="step-by-step">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#18181b", margin: "36px 0 14px", letterSpacing: "-0.02em" }}>Step-by-Step Guide</h2>
            {article.steps.map((step: Article["steps"][0], i: number) => (
              <div key={i} className="art-step" style={{ display: "flex", gap: 20, margin: "24px 0", padding: "20px 24px", background: "#fafafa", borderRadius: 12, border: "1px solid #e4e4e7" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#18181b", marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "#52525b", lineHeight: 1.7, margin: 0 }}>{step.content}</p>
                  {step.tip && (
                    <div style={{ background: "#f0fdf4", borderLeft: "4px solid #22c55e", borderRadius: "0 10px 10px 0", padding: "12px 16px", marginTop: 12 }}>
                      <div style={{ fontWeight: 700, color: "#15803d", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>💡 Pro Tip</div>
                      <div style={{ fontSize: 13, color: "#166534" }}>{step.tip}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* Tips */}
          {article.tips.length > 0 && (
            <section id="tips">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#18181b", margin: "36px 0 14px", letterSpacing: "-0.02em" }}>Pro Tips</h2>
              <ul style={{ margin: "0 0 16px 20px", padding: 0 }}>
                {article.tips.map((t: string, i: number) => <li key={i} style={{ fontSize: 15, color: "#374151", lineHeight: 1.7, marginBottom: 10 }}>{t}</li>)}
              </ul>
            </section>
          )}

          {/* Mistakes */}
          {article.mistakes.length > 0 && (
            <section id="mistakes">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#18181b", margin: "36px 0 14px", letterSpacing: "-0.02em" }}>Common Mistakes to Avoid</h2>
              <div style={{ background: "#fefce8", borderLeft: "4px solid #eab308", borderRadius: "0 10px 10px 0", padding: "16px 20px" }}>
                <div style={{ fontWeight: 700, color: "#854d0e", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>⚠️ Watch Out For</div>
                <ul style={{ margin: "0 0 0 20px", padding: 0 }}>
                  {article.mistakes.map((m: string, i: number) => <li key={i} style={{ fontSize: 14, color: "#713f12", lineHeight: 1.6, marginBottom: 6 }}>{m}</li>)}
                </ul>
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="art-cta" style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: 20, padding: "40px 36px", textAlign: "center", margin: "40px 0", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 50% 50%,rgba(249,115,22,.12) 0%,transparent 70%)", pointerEvents: "none" }} />
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", marginBottom: 10, letterSpacing: "-0.03em", position: "relative" }}>Ready to Export?</h2>
            <p style={{ fontSize: 15, color: "#94a3b8", marginBottom: 20, position: "relative" }}>Push44 is free, open source, and takes under 2 minutes to set up.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
              <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 14px rgba(249,115,22,.35)" }}>Start Exporting Now →</Link>
            </div>
          </div>

          {/* FAQ */}
          <section id="faq">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#18181b", margin: "36px 0 20px", letterSpacing: "-0.02em" }}>Frequently Asked Questions</h2>
            {article.faqs.map((faq: Article["faqs"][0], i: number) => (
              <div key={i} style={{ borderBottom: "1px solid #e4e4e7", padding: "20px 0" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#18181b", marginBottom: 10, lineHeight: 1.4 }}>{faq.question}</div>
                <div style={{ fontSize: 15, color: "#52525b", lineHeight: 1.7 }}>{faq.answer}</div>
              </div>
            ))}
          </section>

          {/* Related */}
          {relatedArticles.length > 0 && (
            <section id="related" style={{ marginTop: 48 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#18181b", marginBottom: 20, letterSpacing: "-0.02em" }}>Related Guides</h2>
              <div className="art-related" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {relatedArticles.map(a => {
                  const rpm = PLATFORM_META[a.platform] || PLATFORM_META.general;
                  return (
                    <Link key={a.slug} to="/blog/$slug" params={{ slug: a.slug }}
                      style={{ display: "flex", flexDirection: "column", gap: 10, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: 20, textDecoration: "none", color: "inherit", transition: "all 0.2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,.07)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ""; (e.currentTarget as HTMLElement).style.transform = ""; }}>
                      {a.platform !== "general" && <span style={{ fontSize: 11, fontWeight: 600, color: rpm.color, background: rpm.bgColor, border: `1px solid ${rpm.color}44`, padding: "2px 8px", borderRadius: 20, width: "fit-content" }}>{rpm.name}</span>}
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#18181b", lineHeight: 1.35 }}>{a.h1}</div>
                      <div style={{ fontSize: 12, color: "#a1a1aa" }}>⏱ {a.readTime} min · {a.views.toLocaleString()} views</div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </article>

        {/* Sidebar */}
        <aside className="art-sidebar" style={{ position: "sticky", top: 80 }}>

          {/* TOC */}
          <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: "#71717a", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 14 }}>On This Page</h4>
            {toc.map(({ id, label }) => (
              <a key={id} href={`#${id}`} style={{ display: "block", fontSize: 13, color: activeSection === id ? "#f97316" : "#71717a", padding: "5px 0 5px 12px", borderLeft: `2px solid ${activeSection === id ? "#f97316" : "#e4e4e7"}`, transition: "all 0.15s", textDecoration: "none", lineHeight: 1.4, fontWeight: activeSection === id ? 600 : 400 }}>
                {label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 10 }}>Free Tool</h4>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#f8fafc", marginBottom: 8 }}>Push44 — Export to GitHub</div>
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 16 }}>Export your complete source code in one click. Free forever.</p>
            <Link to="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "11px 0", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 12px rgba(249,115,22,.35)" }}>Start Exporting →</Link>
          </div>

          {/* People Also Search */}
          <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: "#71717a", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 14 }}>People Also Search</h4>
            {POPULAR_SEARCHES.slice(0, 6).map(s => (
              <Link key={s.slug} to="/blog/$slug" params={{ slug: s.slug }}
                style={{ display: "block", fontSize: 13, color: "#52525b", padding: "6px 0", borderBottom: "1px solid #fafafa", transition: "color 0.15s", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#f97316"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#52525b"}>
                {s.label}
              </Link>
            ))}
          </div>

          {/* Platform hub */}
          {article.platform !== "general" && platformData && (
            <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: 20 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: "#71717a", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 14 }}>{pm.name} Hub</h4>
              {platformData.articles.filter(s => s !== article.slug).slice(0, 4).map(slug => {
                const a = ARTICLES.find(x => x.slug === slug);
                return a ? (
                  <Link key={slug} to="/blog/$slug" params={{ slug }}
                    style={{ display: "block", fontSize: 13, color: "#52525b", padding: "6px 0", borderBottom: "1px solid #fafafa", transition: "color 0.15s", textDecoration: "none", lineHeight: 1.4 }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#f97316"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#52525b"}>
                    {a.h1}
                  </Link>
                ) : null;
              })}
              <Link to="/platforms/$platform" params={{ platform: article.platform }} style={{ display: "block", marginTop: 10, fontSize: 13, fontWeight: 600, color: "#f97316", textDecoration: "none" }}>
                View all {pm.name} guides →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
