import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Clock, ChevronRight, CheckCircle2, AlertTriangle, Share2 } from "lucide-react";
import {
  getArticle, getRelatedArticles, PLATFORMS, PLATFORM_META, type Article,
} from "@/seo/data";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
      <h1 style={{ fontSize: 64, fontWeight: 900, color: "#09090b", margin: "0 0 12px", letterSpacing: "-0.04em" }}>404</h1>
      <p style={{ fontSize: 18, color: "#71717a", margin: "0 0 28px" }}>Article not found</p>
      <Link to="/blog" style={{ color: "#f97316", fontWeight: 700, textDecoration: "none" }}>Back to Blog</Link>
    </div>
  ),
});

const DIFFICULTY_STYLE: Record<string, React.CSSProperties> = {
  beginner:     { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
  intermediate: { background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" },
  advanced:     { background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" },
};

export default function ArticlePage() {
  const { article } = Route.useLoaderData();
  const [activeSection, setActiveSection] = useState("introduction");

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

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

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.2, rootMargin: "-100px 0px -40% 0px" }
    );
    toc.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.slug]);

  const prose: React.CSSProperties = { fontSize: 15, color: "#3f3f46", lineHeight: 1.75, margin: 0 };

  return (
    <div style={{ minHeight: "100dvh", background: "#fff", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", color: "#09090b" }}>
      {/* Reading progress */}
      <motion.div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: "#f97316", transformOrigin: "left", scaleX, zIndex: 100 }} />

      <Navbar />

      {/* ── ARTICLE HEADER ──────────────────────────────────────────────── */}
      <header style={{ padding: "48px 20px 40px", borderBottom: "1px solid #e4e4e7", background: "#fafafa" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {/* Breadcrumb */}
          <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#a1a1aa", marginBottom: 24, flexWrap: "wrap" }}>
            <Link to="/" style={{ color: "#71717a", textDecoration: "none", fontWeight: 500, transition: "color 0.12s" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#09090b"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#71717a"}
            >Push44</Link>
            <ChevronRight size={13} color="#d4d4d8" />
            <Link to="/blog/" style={{ color: "#71717a", textDecoration: "none", fontWeight: 500, transition: "color 0.12s" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#09090b"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#71717a"}
            >Blog</Link>
            {article.platform !== "general" && platformData && (
              <>
                <ChevronRight size={13} color="#d4d4d8" />
                <Link to="/platforms/$platform" params={{ platform: article.platform }} style={{ color: "#71717a", textDecoration: "none", fontWeight: 500 }}>{platformData.name}</Link>
              </>
            )}
            <ChevronRight size={13} color="#d4d4d8" />
            <span style={{ color: "#09090b", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>{article.h1}</span>
          </nav>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {article.platform !== "general" && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 5, color: pm.color, background: pm.bgColor, border: `1px solid ${pm.color}33` }}>
                {pm.name}
              </span>
            )}
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 5, ...(DIFFICULTY_STYLE[article.difficulty] || DIFFICULTY_STYLE.beginner) }}>
              {article.difficulty.charAt(0).toUpperCase() + article.difficulty.slice(1)}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, color: "#09090b", letterSpacing: "-0.04em", lineHeight: 1.15, margin: "0 0 14px" }}>
            {article.h1}
          </h1>
          <p style={{ fontSize: 16, color: "#71717a", lineHeight: 1.65, margin: "0 0 24px" }}>{article.intro}</p>

          {/* Meta */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "#a1a1aa", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Clock size={13} /> {article.readTime} min read
            </span>
            <span>Updated {article.updatedAt}</span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.h1)}&url=${encodeURIComponent(`https://push44.vercel.app/blog/${article.slug}`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#a1a1aa", textDecoration: "none", fontWeight: 500, transition: "color 0.12s" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#09090b"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#a1a1aa"}
            >
              <Share2 size={13} /> Share
            </a>
          </div>
        </div>
      </header>

      {/* ── CONTENT AREA ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 20px", display: "flex", gap: 48, alignItems: "flex-start" }}>
        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Quick answer */}
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 20, marginBottom: 40 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: 14, color: "#14532d", lineHeight: 1.65, fontWeight: 500 }}>{article.solution}</p>
            </div>
          </div>

          {/* Introduction */}
          <section id="introduction" style={{ marginBottom: 48, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", margin: "0 0 14px" }}>Introduction</h2>
            <p style={prose}>{article.intro}</p>
          </section>

          {/* Problem */}
          <section id="the-problem" style={{ marginBottom: 48, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", margin: "0 0 14px" }}>The Problem</h2>
            <p style={prose}>{article.problem}</p>
          </section>

          {/* Solution */}
          <section id="the-solution" style={{ marginBottom: 48, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", margin: "0 0 14px" }}>The Solution</h2>
            <p style={prose}>{article.solution}</p>
          </section>

          {/* Steps */}
          <section id="step-by-step" style={{ marginBottom: 48, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", margin: "0 0 24px" }}>Step-by-Step Guide</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {article.steps.map((step: { title: string; content: string; tip?: string }, i: number) => (
                <div key={i} style={{ display: "flex", gap: 16 }}>
                  <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: "#f97316", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, marginTop: 2 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, paddingTop: 3 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#09090b", margin: "0 0 8px", letterSpacing: "-0.01em" }}>{step.title}</h3>
                    <p style={{ ...prose, fontSize: 14 }}>{step.content}</p>
                    {step.tip && (
                      <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 7, padding: "10px 14px", marginTop: 12 }}>
                        <p style={{ margin: 0, fontSize: 13, color: "#9a3412", lineHeight: 1.65 }}>
                          <span style={{ fontWeight: 700, color: "#f97316" }}>Tip: </span>{step.tip}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tips */}
          {article.tips.length > 0 && (
            <section id="tips" style={{ marginBottom: 48, scrollMarginTop: 80 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", margin: "0 0 20px" }}>Pro Tips</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {article.tips.map((tip: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "14px 16px", background: "#fafafa", border: "1px solid #e4e4e7", borderRadius: 8 }}>
                    <CheckCircle2 size={15} color="#f97316" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ ...prose, fontSize: 14, margin: 0 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Mistakes */}
          {article.mistakes.length > 0 && (
            <section id="mistakes" style={{ marginBottom: 48, scrollMarginTop: 80 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", margin: "0 0 20px" }}>Common Mistakes</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {article.mistakes.map((m: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "14px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8 }}>
                    <AlertTriangle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ ...prose, fontSize: 14, margin: 0, color: "#7f1d1d" }}>{m}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQ */}
          <section id="faq" style={{ marginBottom: 48, scrollMarginTop: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", margin: "0 0 24px" }}>FAQ</h2>
            <div style={{ border: "1px solid #e4e4e7", borderRadius: 10, overflow: "hidden" }}>
              {article.faqs.map((faq: { question: string; answer: string }, i: number) => (
                <div key={i} style={{ padding: "20px 20px", borderTop: i > 0 ? "1px solid #e4e4e7" : "none" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#09090b", margin: "0 0 8px", letterSpacing: "-0.01em" }}>{faq.question}</h3>
                  <p style={{ ...prose, fontSize: 14, margin: 0 }}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related */}
          {relatedArticles.length > 0 && (
            <section id="related" style={{ marginBottom: 48, scrollMarginTop: 80 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", margin: "0 0 24px" }}>Related Guides</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                {relatedArticles.map((a, i) => <ArticleCard key={a.slug} article={a} index={i} />)}
              </div>
            </section>
          )}

          {/* CTA */}
          <div style={{ background: "#09090b", borderRadius: 12, padding: "32px", textAlign: "center" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#f4f4f5", margin: "0 0 10px", letterSpacing: "-0.03em" }}>Ready to export your code?</h3>
            <p style={{ fontSize: 14, color: "#71717a", margin: "0 0 24px", lineHeight: 1.65 }}>Push44 is free and takes 30 seconds to set up.</p>
            <Link to="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "#f97316", color: "#fff", fontWeight: 700, fontSize: 14, borderRadius: 8, textDecoration: "none" }}>
              Start Exporting Free
            </Link>
          </div>
        </main>

        {/* Sidebar TOC */}
        <aside style={{ width: 220, flexShrink: 0, position: "sticky", top: 80 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>On this page</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {toc.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                style={{ display: "block", fontSize: 13, fontWeight: activeSection === id ? 600 : 400, color: activeSection === id ? "#09090b" : "#71717a", textDecoration: "none", padding: "5px 10px", borderRadius: 5, borderLeft: `2px solid ${activeSection === id ? "#f97316" : "transparent"}`, transition: "all 0.12s" }}
                onMouseEnter={e => { if (activeSection !== id) (e.currentTarget as HTMLAnchorElement).style.color = "#09090b"; }}
                onMouseLeave={e => { if (activeSection !== id) (e.currentTarget as HTMLAnchorElement).style.color = "#71717a"; }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Share box */}
          <div style={{ marginTop: 32, padding: "14px", border: "1px solid #e4e4e7", borderRadius: 9, background: "#fafafa" }}>
            <p style={{ fontSize: 12, color: "#71717a", margin: "0 0 10px", lineHeight: 1.5 }}>Found this guide helpful?</p>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.h1)}&url=${encodeURIComponent(`https://push44.vercel.app/blog/${article.slug}`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#09090b", textDecoration: "none", padding: "7px 10px", border: "1px solid #e4e4e7", borderRadius: 7, background: "#fff", transition: "border-color 0.12s" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = "#d4d4d8"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e4e4e7"}
            >
              <Share2 size={12} /> Share on X
            </a>
          </div>
        </aside>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          aside { display: none !important; }
        }
      `}</style>
    </div>
  );
}
