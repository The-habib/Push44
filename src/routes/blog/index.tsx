import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, ArrowRight, ArrowUpRight, Sparkles, BookOpen, Layers, GitCompare, Compass } from "lucide-react";
import {
  ARTICLES, CATEGORIES, POPULAR_SEARCHES, PLATFORMS,
  COMPARISONS, getArticlesByTopic,
} from "@/seo/data";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PlatformLogo } from "@/components/BrandLogos";

type BlogSearch = { category?: string };

export const Route = createFileRoute("/blog/")({
  validateSearch: (search: Record<string, unknown>): BlogSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Push44 Blog — Guides to Export AI-Generated Code" },
      { name: "description", content: "Step-by-step guides, tutorials and comparisons for exporting, backing up and owning AI-generated source code from Base44, Rocket.new, Floot, Zite, Bolt and Lovable." },
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
  "Backup Lovable.dev projects",
  "Export Bolt.new full repository",
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
    if (category) {
      document.getElementById("all-guides")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [category]);

  return (
    <div className="min-h-[100dvh] bg-[#faf8f5] text-[#191411] font-sans selection:bg-[#f50]/20">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden border-b border-[#e7e2db] bg-gradient-to-b from-[#fff8f3] via-[#faf8f5] to-[#faf8f5]">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-b from-[#f50]/12 via-[#f50]/4 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f50]/10 border border-[#f50]/20 text-[#f50] text-[12px] font-bold uppercase tracking-wider mb-6">
              <Sparkles size={13} className="text-[#f50]" />
              Official Knowledge Base & Tutorials
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#191411] tracking-tight leading-[1.1] mb-5">
              Export & Own Code from Every AI Builder
            </h1>
            <p className="text-lg sm:text-xl text-[#544e47] leading-relaxed max-w-2xl mx-auto mb-10">
              Step-by-step guides, architectural tutorials, and head-to-head comparisons to take your AI projects into real source control.
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="relative max-w-xl mx-auto mb-8"
          >
            <div className="flex items-center gap-3 bg-white border border-[#e7e2db] focus-within:border-[#f50] focus-within:ring-4 focus-within:ring-[#f50]/10 rounded-2xl px-4 py-1.5 shadow-sm transition-all duration-200">
              <Search size={18} className="text-[#8c857b] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => handleSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && searchResults[0]) {
                    navigate({ to: "/blog/$slug", params: { slug: searchResults[0].slug } });
                  }
                }}
                placeholder={placeholder || "Search guides & tutorials..."}
                className="w-full bg-transparent border-none outline-none text-[#191411] text-[15px] py-2.5 placeholder:text-[#8c857b]"
                aria-label="Search guides"
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setSearchResults([]); inputRef.current?.focus(); }}
                  aria-label="Clear search"
                  className="p-1 text-[#8c857b] hover:text-[#191411] rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e7e2db] rounded-2xl shadow-xl z-30 overflow-hidden divide-y divide-[#f3efe9]"
                >
                  {searchResults.map((a) => (
                    <Link
                      key={a.slug}
                      to="/blog/$slug"
                      params={{ slug: a.slug }}
                      className="flex items-center justify-between p-4 hover:bg-[#faf8f5] transition-colors text-left group"
                    >
                      <div className="pr-4">
                        <div className="text-[14px] font-bold text-[#191411] group-hover:text-[#f50] transition-colors leading-snug">
                          {a.h1}
                        </div>
                        <div className="text-[12px] text-[#8c857b] mt-1 flex items-center gap-3">
                          <span className="uppercase font-semibold tracking-wider">{a.category}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock size={11} /> {a.readTime} min read
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={15} className="text-[#8c857b] group-hover:text-[#f50] group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Popular Searches */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-2 justify-center items-center"
          >
            <span className="text-[12px] font-semibold text-[#8c857b] mr-1">Trending:</span>
            {POPULAR_SEARCHES.slice(0, 5).map(s => (
              <Link
                key={s.slug}
                to="/blog/$slug"
                params={{ slug: s.slug }}
                className="inline-flex items-center px-3 py-1 bg-white hover:bg-[#f3efe9] border border-[#e7e2db] hover:border-[#f50]/40 rounded-full text-[12px] font-medium text-[#544e47] hover:text-[#f50] transition-all shadow-2xs"
              >
                {s.label}
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TOPIC PILLS WITH SLIDING SPRING INDICATOR ───────────────────── */}
      <section className="py-5 px-6 border-b border-[#e7e2db] bg-white sticky top-[58px] z-20 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto relative">
            <Link
              to="/blog"
              search={{}}
              className={`relative z-10 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-colors shrink-0 ${
                !category ? "text-white" : "text-[#544e47] hover:text-[#191411]"
              }`}
            >
              {!category && (
                <motion.div
                  layoutId="activeCategoryIndicator"
                  className="absolute inset-0 bg-[#191411] rounded-xl shadow-xs -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <Layers size={13} />
              All Topics
            </Link>
            {CATEGORIES.map(c => {
              const isActive = category === c.slug;
              const count = getArticlesByTopic(c.slug).length;
              return (
                <Link
                  key={c.slug}
                  to="/blog"
                  search={{ category: c.slug }}
                  className={`relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-colors shrink-0 ${
                    isActive ? "text-white" : "text-[#544e47] hover:text-[#191411]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryIndicator"
                      className="absolute inset-0 bg-[#f50] rounded-xl shadow-xs -z-10"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  {c.name}
                  <span className={`text-[10.5px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-[#f3efe9] text-[#8c857b]"
                  }`}>
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>

          {category && (
            <Link
              to="/blog"
              search={{}}
              className="text-[12.5px] font-bold text-[#f50] hover:underline"
            >
              Reset filter
            </Link>
          )}
        </div>
      </section>

      {/* ── BENTO MASTERCLASS SECTION (when no category selected) ─────────── */}
      {!category && (
        <section className="py-16 px-6 border-b border-[#e7e2db]">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#f50] flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={13} /> Curated Masterclass
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191411] tracking-tight">
                  Featured Knowledge Spotlight
                </h2>
              </div>
              <a
                href="#all-guides"
                className="hidden sm:inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#544e47] hover:text-[#f50] transition-colors"
              >
                Browse all {ARTICLES.length} guides <ArrowRight size={14} />
              </a>
            </div>

            {/* Bento Grid: 1 Large Hero Card + 2 Side Highlight Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feature Card (Spans 2 columns) */}
              {featured[0] && (
                <div className="lg:col-span-2 group relative flex flex-col justify-between bg-white rounded-3xl border border-[#e7e2db] p-8 sm:p-10 shadow-xs hover:shadow-xl hover:border-[#f50]/40 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#f50]/10 via-[#f50]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#f50] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <Link to="/blog/$slug" params={{ slug: featured[0].slug }} className="absolute inset-0 z-20">
                    <span className="sr-only">Read {featured[0].h1}</span>
                  </Link>

                  <div className="relative z-10 space-y-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold px-3 py-1 rounded-full bg-[#fff4ed] text-[#f50] border border-[#f50]/30 shadow-2xs">
                        <Sparkles size={12} className="text-[#f50]" />
                        Featured Guide
                      </span>
                      <span className="text-[11.5px] font-bold text-[#8c857b] uppercase tracking-wider bg-[#f3efe9] px-3 py-1 rounded-full border border-[#eae4dc]">
                        {featured[0].category}
                      </span>
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        Step-by-Step
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-[#191411] leading-tight tracking-tight group-hover:text-[#f50] transition-colors">
                      {featured[0].h1}
                    </h3>

                    <p className="text-[15px] sm:text-[16px] text-[#544e47] leading-relaxed max-w-2xl">
                      {featured[0].description}
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center justify-between pt-6 border-t border-[#f3efe9] mt-8 text-[13px]">
                    <div className="flex items-center gap-4 text-[#8c857b] font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={14} /> {featured[0].readTime} min read
                      </span>
                      <span>•</span>
                      <span>Updated {featured[0].updatedAt}</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#191411] group-hover:text-[#f50] transition-colors">
                      Read Masterclass <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              )}

              {/* Side Highlight Column */}
              <div className="flex flex-col gap-6">
                {featured.slice(1, 3).map((a, idx) => (
                  <ArticleCard key={a.slug} article={a} index={idx} />
                ))}
              </div>
            </div>

            {/* Next 3 Featured Guides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {featured.slice(3, 6).map((a, idx) => (
                <ArticleCard key={a.slug} article={a} index={idx + 3} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ALL GUIDES ────────────────────────────────────────────────────── */}
      <section id="all-guides" className="py-16 px-6 border-b border-[#e7e2db]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-8 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c857b] block mb-1">
                {activeCategory ? "Filtered Collection" : "Complete Library"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191411] tracking-tight">
                {activeCategory ? `${activeCategory.name} Guides` : "All Export & Backup Guides"}
              </h2>
            </div>
            <span className="text-[13px] font-semibold text-[#8c857b] bg-white border border-[#e7e2db] px-3 py-1 rounded-full">
              {allGuides.length} articles
            </span>
          </div>

          {allGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allGuides.map((a, i) => (
                <ArticleCard key={a.slug} article={a} index={i} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#e7e2db] p-12 text-center max-w-lg mx-auto">
              <BookOpen size={36} className="mx-auto text-[#8c857b] mb-4" />
              <h3 className="text-lg font-bold text-[#191411] mb-2">No guides found</h3>
              <p className="text-[14px] text-[#544e47] mb-6">We couldn't find any articles in this topic category yet.</p>
              <Link to="/blog" search={{}} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f50] hover:bg-[#e64d00] text-white text-[13px] font-bold rounded-xl shadow-xs transition-colors">
                Browse all guides
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── PLATFORM HUBS ─────────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-b border-[#e7e2db] bg-[#f3efe9]/60">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f50] block mb-1">
                Platform Centers
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191411] tracking-tight">
                Dedicated Platform Hubs
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORMS.map(p => (
              <Link
                key={p.slug}
                to="/platforms/$platform"
                params={{ platform: p.slug }}
                className="group flex flex-col justify-between bg-white hover:bg-[#faf8f5] border border-[#e7e2db] hover:border-[#f50]/40 rounded-2xl p-5 transition-all duration-200 shadow-2xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white border border-[#e7e2db] shadow-2xs p-2 group-hover:scale-105 transition-transform">
                      <PlatformLogo platform={p.slug} size={24} />
                    </div>
                    <span className="text-[11px] font-bold text-[#8c857b] bg-[#f3efe9] px-2.5 py-0.5 rounded-full">
                      {p.articles.length} guides
                    </span>
                  </div>
                  <h3 className="text-[16px] font-bold text-[#191411] group-hover:text-[#f50] transition-colors mb-1">
                    {p.name}
                  </h3>
                  <p className="text-[12.5px] text-[#544e47] line-clamp-2 leading-relaxed mb-4">
                    {p.tagline}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[12px] font-bold text-[#191411] group-hover:text-[#f50] pt-3 border-t border-[#f3efe9]">
                  <span>Explore Hub</span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HEAD-TO-HEAD COMPARISONS ─────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c857b] flex items-center gap-1.5 mb-1">
                <GitCompare size={13} className="text-[#f50]" /> Head-to-Head
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191411] tracking-tight">
                Architectural Platform Comparisons
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMPARISONS.map(c => (
              <Link
                key={c.slug}
                to="/compare/$slug"
                params={{ slug: c.slug }}
                className="group flex flex-col justify-between bg-white border border-[#e7e2db] hover:border-[#f50]/40 rounded-2xl p-6 transition-all duration-200 shadow-2xs hover:shadow-md"
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8c857b] bg-[#f3efe9] px-2.5 py-0.5 rounded-full mb-3.5">
                    <GitCompare size={11} className="text-[#f50]" />
                    Versus Breakdown
                  </div>
                  <h3 className="text-[17px] font-bold text-[#191411] group-hover:text-[#f50] transition-colors leading-snug mb-2.5">
                    {c.h1}
                  </h3>
                  <p className="text-[13.5px] text-[#544e47] line-clamp-2 leading-relaxed mb-6">
                    {c.summary}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[12.5px] font-bold text-[#191411] group-hover:text-[#f50] pt-4 border-t border-[#f3efe9]">
                  <span>Read Full Comparison</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
