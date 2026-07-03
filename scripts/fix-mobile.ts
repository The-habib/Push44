/**
 * Applies mobile-responsive CSS to all 4 blog React components + the HTML generator.
 * Strategy: inject a <style> block + className attributes so !important media-query
 * rules override the desktop inline styles without rewriting the whole file.
 */
import { readFileSync, writeFileSync } from "fs";

// ── shared responsive CSS for React components ──────────────────────────────
const REACT_CSS = `
<style>{\`
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
\`}</style>`;

// ── shared responsive CSS for static HTML ───────────────────────────────────
const STATIC_CSS = `
  /* ── Mobile responsive ───────────────────────────── */
  @media (max-width: 768px) {
    .b-hero  { padding: 48px 16px 56px !important; }
    .b-section { padding: 40px 16px !important; }
    .b-cats-grid { grid-template-columns: repeat(2,1fr) !important; gap:12px !important; }
    .b-cta-inner { padding: 36px 20px !important; border-radius: 14px !important; }
    .b-cta-btns  { flex-direction: column !important; gap: 10px !important; }
    .b-cta-btns > * { width: 100% !important; justify-content: center !important; }
    .b-hdr { flex-direction: column !important; align-items: flex-start !important; }
    .art-body    { grid-template-columns: 1fr !important; padding: 28px 16px !important; gap: 0 !important; }
    .art-sidebar { display: none !important; }
    .art-hero    { padding: 36px 16px 48px !important; }
    .plat-howto  { grid-template-columns: 1fr !important; gap: 32px !important; }
    .plat-hero   { padding: 40px 16px !important; }
    .plat-section { padding: 40px 16px !important; }
    .cmp-hero    { padding: 40px 16px !important; }
    .cmp-body    { padding: 28px 16px !important; }
    .cmp-cta     { padding: 32px 20px !important; border-radius: 14px !important; }
    .cmp-others  { grid-template-columns: 1fr !important; }
    nav[aria-label="Breadcrumb"] { font-size: 12px !important; }
  }
  @media (max-width: 640px) {
    .art-related { grid-template-columns: 1fr !important; }
    .cmp-others  { grid-template-columns: 1fr !important; }
    table th, table td { padding: 10px !important; font-size: 12px !important; }
  }
`;

// ════════════════════════════════════════════════════════════════════════════
// 1. blog/index.tsx
// ════════════════════════════════════════════════════════════════════════════
{
  let c = readFileSync("src/routes/blog/index.tsx", "utf-8");

  // inject <style> block right after the outer div opens
  c = c.replace(
    `<div style={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#18181b" }}>`,
    `<div className="blog-wrap" style={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#18181b" }}>\n      {/* responsive overrides */}\n      ${REACT_CSS}`
  );

  // hero section
  c = c.replace(
    `<section style={{\n        background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",\n        padding: "80px 24px",\n        position: "relative", overflow: "hidden",\n      }}>`,
    `<section className="b-hero" style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", padding: "80px 24px", position: "relative", overflow: "hidden" }}>`
  );

  // popular searches section
  c = c.replace(
    `<section style={{ padding: "48px 24px", background: "#fafafa", borderBottom: "1px solid #e4e4e7" }}>`,
    `<section className="b-section" style={{ padding: "48px 24px", background: "#fafafa", borderBottom: "1px solid #e4e4e7" }}>`
  );

  // categories section
  c = c.replace(
    `<section style={{ padding: "64px 24px" }}>`,
    `<section className="b-section" style={{ padding: "64px 24px" }}>`
  );

  // categories grid
  c = c.replace(
    `<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>`,
    `<div className="b-cats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>`
  );

  // featured guides section header flex
  c = c.replace(
    `<div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, gap: 16, flexWrap: "wrap" }}>`,
    `<div className="b-hdr" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, gap: 16, flexWrap: "wrap" }}>`
  );

  // CTA inner box — the dark gradient div
  c = c.replace(
    `<div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: 20, padding: "56px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>`,
    `<div className="b-cta-inner" style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: 20, padding: "56px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>`
  );

  // CTA buttons
  c = c.replace(
    `<div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>`,
    `<div className="b-cta-btns" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>`
  );

  writeFileSync("src/routes/blog/index.tsx", c);
  console.log("✓ blog/index.tsx");
}

// ════════════════════════════════════════════════════════════════════════════
// 2. blog/$slug.tsx
// ════════════════════════════════════════════════════════════════════════════
{
  let c = readFileSync("src/routes/blog/$slug.tsx", "utf-8");

  // inject <style> block after outer div
  c = c.replace(
    `<div style={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#18181b" }}>`,
    `<div className="blog-wrap" style={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#18181b" }}>\n      ${REACT_CSS}`
  );

  // reading progress bar (stays, no className needed)

  // hero section — dark bg
  c = c.replace(
    `<div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", padding: "48px 24px 64px" }}>`,
    `<div className="art-hero" style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", padding: "48px 24px 64px" }}>`
  );

  // body 2-column grid (THE critical fix)
  c = c.replace(
    `<div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 56, alignItems: "start", maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>`,
    `<div className="art-body" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 56, alignItems: "start", maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>`
  );

  // sidebar aside
  c = c.replace(
    `<aside style={{ position: "sticky", top: 80 }}>`,
    `<aside className="art-sidebar" style={{ position: "sticky", top: 80 }}>`
  );

  // related articles 2-column grid
  c = c.replace(
    `<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>`,
    `<div className="art-related" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>`
  );

  // article CTA box
  c = c.replace(
    `<div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: 20, padding: "40px 36px", textAlign: "center", margin: "40px 0", position: "relative", overflow: "hidden" }}>`,
    `<div className="art-cta" style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: 20, padding: "40px 36px", textAlign: "center", margin: "40px 0", position: "relative", overflow: "hidden" }}>`
  );

  // each step wrapper
  c = c.replace(
    /\{article\.steps\.map\(\(step: Article\["steps"\]\[0\], i: number\) => \(\n\s+<div key=\{i\} style=\{\{ display: "flex", gap: 20, margin: "24px 0", padding: "20px 24px", background: "#fafafa", borderRadius: 12, border: "1px solid #e4e4e7" \}\}>/g,
    `{article.steps.map((step: Article["steps"][0], i: number) => (
              <div key={i} className="art-step" style={{ display: "flex", gap: 20, margin: "24px 0", padding: "20px 24px", background: "#fafafa", borderRadius: 12, border: "1px solid #e4e4e7" }}>`
  );

  writeFileSync("src/routes/blog/$slug.tsx", c);
  console.log("✓ blog/$slug.tsx");
}

// ════════════════════════════════════════════════════════════════════════════
// 3. platforms/$platform.tsx
// ════════════════════════════════════════════════════════════════════════════
{
  let c = readFileSync("src/routes/platforms/$platform.tsx", "utf-8");

  // inject <style> block
  c = c.replace(
    `<div style={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#18181b" }}>`,
    `<div className="blog-wrap" style={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#18181b" }}>\n      ${REACT_CSS}`
  );

  // hero section
  c = c.replace(
    `<div style={{ background: \`linear-gradient(135deg,\${platform.color}22,\${platform.bgColor})\`, borderBottom: \`1px solid \${platform.color}33\`, padding: "64px 24px" }}>`,
    `<div className="plat-hero" style={{ background: \`linear-gradient(135deg,\${platform.color}22,\${platform.bgColor})\`, borderBottom: \`1px solid \${platform.color}33\`, padding: "64px 24px" }}>`
  );

  // features section
  c = c.replace(
    `<section style={{ padding: "48px 24px", background: "#fafafa", borderBottom: "1px solid #e4e4e7" }}>`,
    `<section className="plat-section" style={{ padding: "48px 24px", background: "#fafafa", borderBottom: "1px solid #e4e4e7" }}>`
  );

  // how-to section (THE critical fix for platform page)
  c = c.replace(
    `<div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>`,
    `<div className="plat-howto" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>`
  );

  // articles section
  c = c.replace(
    `<section style={{ padding: "64px 24px", background: "#fafafa", borderTop: "1px solid #e4e4e7" }}>`,
    `<section className="plat-section" style={{ padding: "64px 24px", background: "#fafafa", borderTop: "1px solid #e4e4e7" }}>`
  );

  writeFileSync("src/routes/platforms/$platform.tsx", c);
  console.log("✓ platforms/$platform.tsx");
}

// ════════════════════════════════════════════════════════════════════════════
// 4. compare/$slug.tsx
// ════════════════════════════════════════════════════════════════════════════
{
  let c = readFileSync("src/routes/compare/$slug.tsx", "utf-8");

  // inject <style> block
  c = c.replace(
    `<div style={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#18181b" }}>`,
    `<div className="blog-wrap" style={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#18181b" }}>\n      ${REACT_CSS}`
  );

  // hero
  c = c.replace(
    `<div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", padding: "64px 24px" }}>`,
    `<div className="cmp-hero" style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", padding: "64px 24px" }}>`
  );

  // score badges flex
  c = c.replace(
    `<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>`,
    `<div className="cmp-scores" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>`
  );

  // each score card
  c = c.replace(
    /\{ count: \w+, label: [^}]+\}(?:,\n\s+)*\)\.map\(\(s, i\) => \(\n\s+<div key=\{i\} style=\{\{ background: s\.bg, border/g,
    (m) => m // skip, we'll handle differently
  );

  // body container
  c = c.replace(
    `<div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>`,
    `<div className="cmp-body" style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>`
  );

  // verdict box
  c = c.replace(
    `<div style={{ background: "#eff6ff", borderLeft: "4px solid #3b82f6", borderRadius: "0 10px 10px 0", padding: "16px 20px", marginBottom: 36 }}>`,
    `<div className="cmp-verdict" style={{ background: "#eff6ff", borderLeft: "4px solid #3b82f6", borderRadius: "0 10px 10px 0", padding: "16px 20px", marginBottom: 36 }}>`
  );

  // CTA box
  c = c.replace(
    `<div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: 20, padding: "48px 40px", textAlign: "center", margin: "48px 0", position: "relative", overflow: "hidden" }}>`,
    `<div className="cmp-cta" style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: 20, padding: "48px 40px", textAlign: "center", margin: "48px 0", position: "relative", overflow: "hidden" }}>`
  );

  // others 2-column grid (THE critical fix for compare page)
  c = c.replace(
    `<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>`,
    `<div className="cmp-others" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>`
  );

  writeFileSync("src/routes/compare/$slug.tsx", c);
  console.log("✓ compare/$slug.tsx");
}

// ════════════════════════════════════════════════════════════════════════════
// 5. generator.ts — inject responsive CSS into <head> of all static HTML
// ════════════════════════════════════════════════════════════════════════════
{
  let c = readFileSync("src/seo/generator.ts", "utf-8");

  // Find the generateHtmlShell function and insert responsive CSS in <style> tag
  // Look for existing <style> block in the head (there's a minimal one or we add one)
  const STATIC_STYLE_BLOCK = `
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; overflow-x: hidden; }
    body { font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; }
    a { color: inherit; }
    img { max-width: 100%; }
    /* ── Mobile responsive ───────────────────────────── */
    @media (max-width: 768px) {
      .b-hero  { padding: 48px 16px 56px !important; }
      .b-section { padding: 40px 16px !important; }
      .b-cats-grid { grid-template-columns: repeat(2,1fr) !important; gap:12px !important; }
      .b-cta-inner { padding: 36px 20px !important; border-radius: 14px !important; }
      .b-cta-btns  { flex-direction: column !important; gap: 10px !important; }
      .b-cta-btns > * { width: 100% !important; box-sizing: border-box !important; text-align: center !important; justify-content: center !important; }
      .b-hdr { flex-direction: column !important; align-items: flex-start !important; }
      .art-body    { grid-template-columns: 1fr !important; padding: 28px 16px !important; gap: 0 !important; }
      .art-sidebar { display: none !important; }
      .art-hero    { padding: 36px 16px 48px !important; }
      .art-cta     { padding: 28px 20px !important; border-radius: 14px !important; }
      .plat-howto  { grid-template-columns: 1fr !important; gap: 32px !important; }
      .plat-hero   { padding: 40px 16px !important; }
      .plat-section { padding: 40px 16px !important; }
      .cmp-hero    { padding: 40px 16px !important; }
      .cmp-body    { padding: 28px 16px !important; }
      .cmp-cta     { padding: 32px 20px !important; border-radius: 14px !important; }
      .cmp-scores  { gap: 10px !important; }
    }
    @media (max-width: 640px) {
      .art-related { grid-template-columns: 1fr !important; }
      .cmp-others  { grid-template-columns: 1fr !important; }
      table        { min-width: 480px; }
      .table-wrap  { overflow-x: auto; -webkit-overflow-scrolling: touch; }
      table th, table td { padding: 10px !important; font-size: 12px !important; }
      nav[aria-label="Breadcrumb"] { font-size: 12px !important; }
    }
  </style>`;

  // Find where the <head> content ends (before </head>) and inject style
  // Look for the viewport meta + preload pattern
  if (c.includes('name="viewport"') && !c.includes("@media (max-width: 768px)")) {
    c = c.replace(
      `  <meta name="viewport" content="width=device-width, initial-scale=1">`,
      `  <meta name="viewport" content="width=device-width, initial-scale=1">\n${STATIC_STYLE_BLOCK}`
    );
    writeFileSync("src/seo/generator.ts", c);
    console.log("✓ generator.ts — responsive CSS injected into HTML shell");
  } else if (c.includes("@media (max-width: 768px)")) {
    console.log("✓ generator.ts — already has responsive CSS, skipping");
  } else {
    console.log("⚠ generator.ts — could not find viewport meta to inject after");
  }
}

console.log("\n✅ All mobile responsive fixes applied!");
