import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, ArrowRight, ChevronRight } from "lucide-react";
import {
  ARTICLES, CATEGORIES, POPULAR_SEARCHES, PLATFORMS,
  COMPARISONS, getArticlesByTopic,
} from "@/seo/data";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

type BlogSearch = { category?: string };

export const Route = createFileRoute("/blog/")({
  validateSearch: (search: Record<string, unknown>): BlogSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
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

// Typing placeholder hook
const PLACEHOLDERS = [
  "How to export code from Base44",
  "Download Rocket.new source code",
  "Export Floot to GitHub",
  "Backup AI-generated apps",
];

function useTypingPlaceholder() {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    const phrase = PLACEHOLDERS[idx % PLACEHOLDERS.length];
    let t: ReturnType<typeof setTimeout>;
    if (typing) {
      if (text.length < phrase.length) t = setTimeout(() => setText(phrase.slice(0, text.length + 1)), 55);
      else t = setTimeout(() => setTyping(false), 2200);
    } else {
      if (text.length > 0) t = setTimeout(() => setText(text.slice(0, -1)), 25);
      else { setIdx(i => i + 1); setTyping(true); }
    }
    return () => clearTimeout(t);
  }, [text, typing, idx]);
  return text;
}

export default function BlogHome() {
  const navigate = useNavigate();
  const { category } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof ARTICLES>([]);
  const placeholder = useTypingPlaceholder();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const lq = q.toLowerCase();
    setSearchResults(
      ARTICLES.filter(a =>
        a.h1.toLowerCase().includes(lq) ||
        a.description.toLowerCase().includes(lq) ||
        a.keywords.some(k => k.toLowerCase().includes(lq))
      ).slice(0, 5)
    );
  };

  const activeCategory = category ? CATEGORIES.find(c => c.slug === category) : undefined;
  const allGuides = category ? getArticlesByTopic(category) : ARTICLES;
  const featured = ARTICLES.slice(0, 6);

  useEffect(() => {
    if (category) document.getElementById("all-guides")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [category]);

  return (
    <div style={{ minHeight: "100dvh", background: "#fff", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", color: "#09090b" }}>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", padding: "80px 20px 72px", borderBottom: "1px solid #e4e4e7", background: "radial-gradient(ellipse at 50% 0%, #fff7ed 0%, #fafafa 70%)", overflow: "hidden" }}>
        {/* Subtle Ambient Radial Glow */}
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 600, height: 240, background: "radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, rgba(255, 255, 255, 0) 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", textAlign: "center", zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.12em", display: "inline-block", padding: "4px 12px", background: "rgba(249, 115, 22, 0.1)", borderRadius: 99, border: "1px solid rgba(249, 115, 22, 0.25)", marginBottom: 20 }}>
              Knowledge Base & Guides
            </span>
            <h1 style={{ fontSize: "clamp(30px,5.2vw,54px)", fontWeight: 900, color: "#09090b", letterSpacing: "-0.045em", lineHeight: 1.08, margin: "0 0 16px" }}>
              Export Code from Every AI Builder
            </h1>
            <p style={{ fontSize: 16, color: "#71717a", lineHeight: 1.7, margin: "0 0 36px", maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
              Step-by-step guides, tutorials, and comparisons to export, backup, and own your AI-generated source code.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ position: "relative", maxWidth: 520, margin: "0 auto 24px" }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #e4e4e7", borderRadius: 12, padding: "0 16px", background: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", transition: "all 0.18s ease" }}
              onFocusCapture={e => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(249,115,22,0.12)"; }}
              onBlurCapture={e => { e.currentTarget.style.borderColor = "#e4e4e7"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.03)"; }}
            >
              <Search size={16} color="#a1a1aa" style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => handleSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && searchResults[0]) navigate({ to: "/blog/$slug", params: { slug: searchResults[0].slug } }); }}
                placeholder={placeholder || "Search guides..."}
                style={{ background: "transparent", border: "none", outline: "none", color: "#09090b", fontSize: 14, flex: 1, padding: "14px 0", fontFamily: "inherit" }}
                aria-label="Search guides"
                autoComplete="off"
              />
              {query && (
                <button onClick={() => { setQuery(""); setSearchResults([]); inputRef.current?.focus(); }} aria-label="Clear search" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#a1a1aa", display: "flex", alignItems: "center" }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search results dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, boxShadow: "0 12px 32px -4px rgba(0,0,0,0.14)", zIndex: 20, overflow: "hidden" }}
                >
                  {searchResults.map((a, i) => (
                    <Link key={a.slug} to="/blog/$slug" params={{ slug: a.slug }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", textDecoration: "none", borderTop: i > 0 ? "1px solid #f4f4f5" : "none" }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#fafafa"}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}
                    >
                      <ChevronRight size={14} color="#f97316" style={{ flexShrink: 0 }} />
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#09090b", lineHeight: 1.35 }}>{a.h1}</div>
                        <div style={{ fontSize: 11, color: "#a1a1aa", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={10} /> {a.readTime} min read
                        </div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Popular searches */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}
          >
            {POPULAR_SEARCHES.slice(0, 5).map(s => (
              <Link key={s.slug} to="/blog/$slug" params={{ slug: s.slug }}
                style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", background: "#fff", border: "1px solid #e4e4e7", borderRadius: 99, fontSize: 12, fontWeight: 500, color: "#52525b", textDecoration: "none", transition: "all 0.12s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#f97316"; (e.currentTarget as HTMLAnchorElement).style.color = "#f97316"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e4e4e7"; (e.currentTarget as HTMLAnchorElement).style.color = "#52525b"; }}
              >
                {s.label}
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
      <section style={{ padding: "36px 20px", borderBottom: "1px solid #e4e4e7", background: "#ffffff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 16, display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#09090b", letterSpacing: "-0.01em", margin: 0 }}>Browse by Topic</h2>
            {category && (
              <Link to="/blog" search={{}} style={{ fontSize: 12, color: "#f97316", fontWeight: 600, textDecoration: "none" }}>
                Clear filter
              </Link>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map(c => {
              const isActive = category === c.slug;
              return (
                <Link key={c.slug} to="/blog" search={{ category: c.slug }}
                  style={{ display: "inline-flex", alignItems: "center", padding: "6px 14px", background: isActive ? "#fff7ed" : "#fafafa", border: `1px solid ${isActive ? "#f97316" : "#e4e4e7"}`, borderRadius: 99, textDecoration: "none", transition: "all 0.15s ease", boxShadow: isActive ? "0 2px 8px rgba(249, 115, 22, 0.15)" : "none" }}
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#f97316"; (e.currentTarget as HTMLAnchorElement).style.background = "#fff"; } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e4e4e7"; (e.currentTarget as HTMLAnchorElement).style.background = "#fafafa"; } }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? "#f97316" : "#3f3f46" }}>{c.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED GUIDES ───────────────────────────────────────────────── */}
      {!category && (
        <section style={{ padding: "64px 20px", borderBottom: "1px solid #e4e4e7" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#f97316", display: "block", marginBottom: 4 }}>Trending</span>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", margin: 0 }}>Featured Guides</h2>
              </div>
              <Link to="/blog" search={{}} hash="all-guides" style={{ fontSize: 13, fontWeight: 600, color: "#71717a", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {featured.map((a, i) => <ArticleCard key={a.slug} article={a} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── ALL GUIDES ────────────────────────────────────────────────────── */}
      <section id="all-guides" style={{ padding: "64px 20px", borderBottom: "1px solid #e4e4e7" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", margin: 0 }}>
                {activeCategory ? `${activeCategory.name} Guides` : "All Guides"}
              </h2>
              <span style={{ fontSize: 13, color: "#a1a1aa", marginTop: 4, display: "block" }}>{allGuides.length} articles</span>
            </div>
          </div>
          {allGuides.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {allGuides.map((a, i) => <ArticleCard key={a.slug} article={a} index={i} />)}
            </div>
          ) : (
            <div style={{ padding: "64px 0", textAlign: "center", color: "#a1a1aa" }}>
              <p style={{ fontSize: 15, margin: "0 0 16px" }}>No guides found for this category yet.</p>
              <Link to="/blog" search={{}} style={{ fontSize: 13, fontWeight: 600, color: "#f97316", textDecoration: "none" }}>Browse all guides</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── PLATFORMS ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "64px 20px", borderBottom: "1px solid #e4e4e7", background: "#fafafa" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#f97316", display: "block", marginBottom: 8 }}>Platforms</span>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", margin: 0 }}>Platform Export Hubs</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {PLATFORMS.map(p => (
              <Link
                key={p.slug} to="/platforms/$platform" params={{ platform: p.slug }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", border: "1px solid #e4e4e7", borderRadius: 10, background: "#fff", textDecoration: "none", transition: "all 0.12s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#d4d4d8"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e4e4e7"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: p.bgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, fontWeight: 800, color: p.color, fontFamily: "monospace" }}>
                  {p.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#09090b", letterSpacing: "-0.01em" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#a1a1aa", marginTop: 1 }}>{p.articles.length} guides</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISONS ───────────────────────────────────────────────────── */}
      <section style={{ padding: "64px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#f97316", display: "block", marginBottom: 8 }}>Comparisons</span>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.03em", margin: 0 }}>Head-to-Head Guides</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {COMPARISONS.map(c => (
              <Link
                key={c.slug} to="/compare/$slug" params={{ slug: c.slug }}
                style={{ display: "flex", flexDirection: "column", gap: 10, border: "1px solid #e4e4e7", borderRadius: 10, padding: "18px", textDecoration: "none", background: "#fff", transition: "all 0.12s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#d4d4d8"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e4e4e7"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em" }}>Compare</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#09090b", lineHeight: 1.4, letterSpacing: "-0.01em" }}>{c.h1}</div>
                <p style={{ fontSize: 12, color: "#71717a", lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.summary}</p>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#f97316" }}>
                  Read comparison <ArrowRight size={11} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
