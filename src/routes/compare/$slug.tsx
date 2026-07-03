import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getComparison, COMPARISONS, type Comparison } from "@/seo/data";

export const Route = createFileRoute("/compare/$slug")({
  head: ({ params }) => {
    const c = getComparison(params.slug);
    if (!c) return { meta: [{ title: "Not Found — Push44" }] };
    return {
      meta: [
        { title: c.title },
        { name: "description", content: c.description },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: c.title },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: `https://push44.vercel.app/compare/${params.slug}` }],
    };
  },
  loader: ({ params }) => {
    const comparison = getComparison(params.slug);
    if (!comparison) throw notFound();
    return { comparison };
  },
  component: ComparisonPage,
  notFoundComponent: () => (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <h1 style={{ fontSize: 48, fontWeight: 900, color: "#18181b" }}>404</h1>
      <p style={{ color: "#71717a", margin: "12px 0 24px" }}>Comparison not found</p>
      <Link to="/blog/" style={{ color: "#f97316", fontWeight: 600, textDecoration: "none" }}>← Back to Blog</Link>
    </div>
  ),
});

export default function ComparisonPage() {
  const { comparison } = Route.useLoaderData();
  const aLabel = comparison.aspects[0]?.a.label || "Option A";
  const bLabel = comparison.aspects[0]?.b.label || "Option B";
  type Aspect = Comparison["aspects"][0];
  const aWins = comparison.aspects.filter((a: Aspect) => a.winner === "a").length;
  const bWins = comparison.aspects.filter((a: Aspect) => a.winner === "b").length;
  const ties = comparison.aspects.filter((a: Aspect) => a.winner === "tie").length;
  const others = COMPARISONS.filter(c => c.slug !== comparison.slug).slice(0, 4);

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
      <div className="cmp-hero" style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", padding: "64px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(148,163,184,0.8)", marginBottom: 20 }}>
            <Link to="/" style={{ color: "rgba(148,163,184,0.7)", textDecoration: "none" }}>Push44</Link>
            <span>›</span>
            <Link to="/blog/" style={{ color: "rgba(148,163,184,0.7)", textDecoration: "none" }}>Blog</Link>
            <span>›</span>
            <span style={{ color: "#94a3b8" }}>Comparison</span>
          </nav>
          <span style={{ display: "inline-block", background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "5px 14px", borderRadius: 20, marginBottom: 20 }}>⚖️ Comparison</span>
          <h1 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, color: "#f8fafc", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 18 }}>{comparison.h1}</h1>
          <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>{comparison.description}</p>
          <div className="cmp-scores" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { count: aWins, label: `${aLabel} wins`, color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)" },
              { count: bWins, label: `${bLabel} wins`, color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" },
              ...(ties > 0 ? [{ count: ties, label: "Ties", color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)" }] : []),
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "14px 20px", textAlign: "center", minWidth: 100 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="cmp-body" style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>

        {/* Verdict */}
        <div className="cmp-verdict" style={{ background: "#eff6ff", borderLeft: "4px solid #3b82f6", borderRadius: "0 10px 10px 0", padding: "16px 20px", marginBottom: 36 }}>
          <div style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>🏆 Verdict</div>
          <div style={{ fontSize: 15, color: "#1e40af" }}>{comparison.verdict}</div>
        </div>

        {/* Summary */}
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#18181b", marginBottom: 14, letterSpacing: "-0.02em" }}>Overview</h2>
        <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.8, marginBottom: 36 }}>{comparison.summary}</p>

        {/* Table */}
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#18181b", marginBottom: 20, letterSpacing: "-0.02em" }}>Detailed Comparison</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }} role="table">
            <thead>
              <tr>
                {[{ label: "Aspect", color: "#71717a" }, { label: aLabel, color: "#f97316" }, { label: bLabel, color: "#22c55e" }, { label: "Winner", color: "#71717a" }].map((h, i) => (
                  <th key={i} scope="col" style={{ background: "#fafafa", padding: "14px 18px", textAlign: "left", fontSize: 13, fontWeight: 700, color: h.color, letterSpacing: "0.05em", textTransform: "uppercase" as const, borderBottom: "2px solid #e4e4e7" }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.aspects.map((a: Comparison["aspects"][0], i: number) => (
                <tr key={i} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}>
                  <td style={{ padding: "16px 18px", borderBottom: "1px solid #fafafa", fontWeight: 600, color: "#18181b", fontSize: 14 }}>{a.aspect}</td>
                  <td style={{ padding: "16px 18px", borderBottom: "1px solid #fafafa", fontSize: 14 }}>
                    <div style={{ marginBottom: 6 }}>{a.a.value}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ height: 6, width: 60, borderRadius: 3, background: "#f4f4f5", display: "inline-block", overflow: "hidden", verticalAlign: "middle" }}>
                        <div style={{ height: "100%", width: `${(a.a.score / 5) * 100}%`, borderRadius: 3, background: "#f97316" }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#71717a" }}>{a.a.score}/5</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 18px", borderBottom: "1px solid #fafafa", fontSize: 14 }}>
                    <div style={{ marginBottom: 6 }}>{a.b.value}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ height: 6, width: 60, borderRadius: 3, background: "#f4f4f5", display: "inline-block", overflow: "hidden", verticalAlign: "middle" }}>
                        <div style={{ height: "100%", width: `${(a.b.score / 5) * 100}%`, borderRadius: 3, background: "#22c55e" }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#71717a" }}>{a.b.score}/5</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 18px", borderBottom: "1px solid #fafafa", fontSize: 14 }}>
                    <span style={{ fontWeight: 700, color: a.winner === "a" ? "#f97316" : a.winner === "b" ? "#22c55e" : "#64748b" }}>
                      {a.winner === "a" ? `✓ ${aLabel}` : a.winner === "b" ? `✓ ${bLabel}` : "Tie"}
                    </span>
                    <div style={{ fontSize: 12, color: "#71717a", marginTop: 4, lineHeight: 1.4 }}>{a.note}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="cmp-cta" style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: 20, padding: "48px 40px", textAlign: "center", margin: "48px 0", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 50% 50%,rgba(249,115,22,.12) 0%,transparent 70%)", pointerEvents: "none" }} />
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#f8fafc", marginBottom: 10, letterSpacing: "-0.03em", position: "relative" }}>Start Exporting for Free</h2>
          <p style={{ fontSize: 15, color: "#94a3b8", marginBottom: 24, position: "relative" }}>Push44 is open source, free forever, and works with Base44, Rocket.new, Floot and Zite.</p>
          <div style={{ position: "relative" }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 14px rgba(249,115,22,.35)" }}>Try Push44 Now →</Link>
          </div>
        </div>

        {/* Other comparisons */}
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#18181b", marginBottom: 20, letterSpacing: "-0.02em" }}>More Comparisons</h2>
        <div className="cmp-others" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {others.map(c => (
            <Link key={c.slug} to="/compare/$slug" params={{ slug: c.slug }}
              style={{ display: "flex", flexDirection: "column", gap: 10, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: 20, textDecoration: "none", color: "inherit", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,.07)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ""; (e.currentTarget as HTMLElement).style.transform = ""; }}>
              <span style={{ display: "inline-block", background: "#f8fafc", color: "#64748b", border: "1px solid #e4e4e7", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, width: "fit-content" }}>⚖️ Compare</span>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#18181b", lineHeight: 1.35 }}>{c.h1}</div>
              <div style={{ fontSize: 13, color: "#71717a", lineHeight: 1.5 }}>{c.summary.slice(0, 80)}...</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
