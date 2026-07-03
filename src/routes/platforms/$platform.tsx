import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPlatform, getPlatformArticles, PLATFORMS, PLATFORM_META, type PlatformData } from "@/seo/data";

export const Route = createFileRoute("/platforms/$platform")({
  head: ({ params }) => {
    const platform = getPlatform(params.platform as any);
    if (!platform) return { meta: [{ title: "Not Found — Push44" }] };
    return {
      meta: [
        { title: `${platform.name} GitHub Export Guide — Push44` },
        { name: "description", content: platform.description },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: `${platform.name} Export Hub — Push44` },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: `https://push44.vercel.app/platforms/${params.platform}` }],
    };
  },
  loader: ({ params }) => {
    const platform = getPlatform(params.platform as any);
    if (!platform) throw notFound();
    return { platform };
  },
  component: PlatformPage,
  notFoundComponent: () => (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <h1 style={{ fontSize: 48, fontWeight: 900, color: "#18181b" }}>404</h1>
      <p style={{ color: "#71717a", margin: "12px 0 24px" }}>Platform not found</p>
      <Link to="/blog/" style={{ color: "#f97316", fontWeight: 600, textDecoration: "none" }}>← Back to Blog</Link>
    </div>
  ),
});

export default function PlatformPage() {
  const { platform } = Route.useLoaderData();
  const articles = getPlatformArticles(platform);
  const otherPlatforms = PLATFORMS.filter(p => p.slug !== platform.slug);

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

      {/* HERO */}
      <div className="plat-hero" style={{ background: `linear-gradient(135deg,${platform.color}22,${platform.bgColor})`, borderBottom: `1px solid ${platform.color}33`, padding: "64px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#71717a", marginBottom: 24 }}>
            <Link to="/" style={{ color: "#71717a", textDecoration: "none" }}>Push44</Link>
            <span>›</span>
            <Link to="/blog/" style={{ color: "#71717a", textDecoration: "none" }}>Blog</Link>
            <span>›</span>
            <span style={{ color: "#18181b" }} aria-current="page">{platform.name}</span>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: platform.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff" }}>{platform.name[0]}</div>
            <div>
              <h1 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, color: "#18181b", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 6 }}>{platform.name} Export Hub</h1>
              <p style={{ fontSize: 16, color: "#71717a" }}>{platform.tagline}</p>
            </div>
          </div>
          <p style={{ fontSize: 16, color: "#52525b", lineHeight: 1.7, maxWidth: 640, marginBottom: 28 }}>{platform.description}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 14px rgba(249,115,22,.35)" }}>
              Start Exporting {platform.name} →
            </Link>
            <Link to="/blog/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", background: "transparent", color: "#52525b", border: "1.5px solid #e4e4e7", borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
              All Guides
            </Link>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="plat-section" style={{ padding: "48px 24px", background: "#fafafa", borderBottom: "1px solid #e4e4e7" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#18181b", marginBottom: 24 }}>What Push44 Does with {platform.name}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {platform.features.map((f: string, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: platform.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", flexShrink: 0, marginTop: 2 }}>✓</div>
                <span style={{ fontSize: 15, color: "#374151", lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO */}
      <section style={{ padding: "64px 24px" }}>
        <div className="plat-howto" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
          <div>
            <span style={{ display: "inline-block", background: `${platform.color}18`, border: `1px solid ${platform.color}33`, color: platform.color, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "5px 12px", borderRadius: 20, marginBottom: 16 }}>Quick Start</span>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#18181b", letterSpacing: "-0.03em", marginBottom: 28 }}>How to Export {platform.name}</h2>
            {platform.exportSteps.map((s: string, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: platform.color, color: "#fff", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <span style={{ fontSize: 15, color: "#374151", lineHeight: 1.5, paddingTop: 4 }}>{s}</span>
              </div>
            ))}
            {articles[0] && (
              <Link to="/blog/$slug" params={{ slug: articles[0].slug }} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none", marginTop: 8 }}>
                Full Step-by-Step Guide →
              </Link>
            )}
          </div>

          <div style={{ background: platform.bgColor, border: `1.5px solid ${platform.color}33`, borderRadius: 16, padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#18181b", marginBottom: 20 }}>All {platform.name} Guides</h3>
            {articles.map(a => (
              <Link key={a.slug} to="/blog/$slug" params={{ slug: a.slug }}
                style={{ display: "flex", flexDirection: "column", gap: 4, padding: "14px 0", borderBottom: `1px solid ${platform.color}22`, textDecoration: "none", transition: "padding-left 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.paddingLeft = "8px"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.paddingLeft = "0"}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#18181b", lineHeight: 1.3 }}>{a.h1}</span>
                <span style={{ fontSize: 12, color: "#71717a" }}>⏱ {a.readTime} min · {a.views.toLocaleString()} views</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ALL ARTICLES */}
      <section className="plat-section" style={{ padding: "64px 24px", background: "#fafafa", borderTop: "1px solid #e4e4e7" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 800, color: "#18181b", letterSpacing: "-0.03em", marginBottom: 32 }}>{platform.name} Guides</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {articles.map(a => {
              const pm2 = PLATFORM_META[a.platform] || PLATFORM_META.general;
              return (
                <Link key={a.slug} to="/blog/$slug" params={{ slug: a.slug }}
                  style={{ display: "flex", flexDirection: "column", gap: 14, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 14, padding: 24, textDecoration: "none", color: "inherit", transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,.08)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ""; (e.currentTarget as HTMLElement).style.transform = ""; }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: pm2.color, background: pm2.bgColor, border: `1px solid ${pm2.color}44`, padding: "2px 8px", borderRadius: 20, width: "fit-content" }}>{pm2.name}</span>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#18181b", lineHeight: 1.35, letterSpacing: "-0.02em" }}>{a.h1}</div>
                  <div style={{ fontSize: 14, color: "#71717a", lineHeight: 1.6 }}>{a.description.slice(0, 110)}...</div>
                  <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#a1a1aa", marginTop: "auto" }}>
                    <span>⏱ {a.readTime} min</span><span>•</span><span>👁 {a.views.toLocaleString()}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {platform.faqs.length > 0 && (
        <section style={{ padding: "64px 24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 800, color: "#18181b", letterSpacing: "-0.03em", marginBottom: 32 }}>{platform.name} FAQ</h2>
            {platform.faqs.map((faq: PlatformData["faqs"][0], i: number) => (
              <div key={i} style={{ borderBottom: "1px solid #e4e4e7", padding: "20px 0" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#18181b", marginBottom: 10, lineHeight: 1.4 }}>{faq.question}</div>
                <div style={{ fontSize: 15, color: "#52525b", lineHeight: 1.7 }}>{faq.answer}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* OTHER PLATFORMS */}
      <section style={{ padding: "64px 24px", background: "#fafafa", borderTop: "1px solid #e4e4e7" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 800, color: "#18181b", letterSpacing: "-0.03em", marginBottom: 32 }}>Other Platforms</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {otherPlatforms.map(p => (
              <Link key={p.slug} to="/platforms/$platform" params={{ platform: p.slug }}
                style={{ display: "block", background: p.bgColor, border: "1px solid #e4e4e7", borderRadius: 12, padding: 20, textAlign: "center", textDecoration: "none", color: "inherit", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,.07)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#fff", margin: "0 auto 12px" }}>{p.name[0]}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#18181b", marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#71717a" }}>{p.articles.length} guides</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
