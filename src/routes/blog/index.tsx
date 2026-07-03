import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ARTICLES, CATEGORIES, POPULAR_SEARCHES, PLATFORMS, COMPARISONS, PLATFORM_META, getArticlesByTopic } from "@/seo/data";
import { ArticleCard } from "@/components/blog/ArticleCard";

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
  const { category } = Route.useSearch();
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
  const activeCategory = category ? CATEGORIES.find(c => c.slug === category) : undefined;
  const allGuides = category ? getArticlesByTopic(category) : ARTICLES;

  useEffect(() => {
    if (category) {
      document.getElementById("all-guides")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [category]);

  return (
    <div className="min-h-[100dvh] bg-[#faf8f5] selection:bg-orange-500/30 font-sans overflow-hidden">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* HERO */}
        <section className="pt-32 pb-24 px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="inline-block bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
                Knowledge Base & Documentation
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-stone-900 tracking-tight leading-[1.1] mb-6">
                Export Code from <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                  Every AI Builder
                </span>
              </h1>
              <p className="text-lg md:text-xl text-stone-500 leading-relaxed mb-12 max-w-2xl mx-auto font-medium">
                Step-by-step guides, tutorials, comparisons, and documentation to export, backup, and own your AI-generated source code.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="relative max-w-2xl mx-auto mb-10"
            >
              <div className="bg-white/80 backdrop-blur-xl border border-stone-200/60 rounded-2xl p-4 flex items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] focus-within:border-orange-500/50 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-300">
                <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => handleSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && searchResults[0]) navigate({ to: "/blog/$slug", params: { slug: searchResults[0].slug } }); }}
                  placeholder={placeholder || "Search guides..."}
                  className="bg-transparent border-none outline-none text-stone-800 text-lg flex-1 placeholder:text-stone-400"
                  aria-label="Search guides"
                  autoComplete="off"
                />
                {query && (
                  <button onClick={() => { setQuery(""); setSearchResults([]); }} className="text-stone-400 hover:text-stone-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>

              {/* Autocomplete */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[110%] left-0 right-0 bg-white/95 backdrop-blur-2xl border border-stone-200/60 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-50 overflow-hidden"
                  >
                    {searchResults.map(a => {
                      const pm = PLATFORM_META[a.platform] || PLATFORM_META.general;
                      return (
                        <Link key={a.slug} to="/blog/$slug" params={{ slug: a.slug }} className="flex items-start gap-4 p-4 hover:bg-stone-50/80 transition-colors border-b border-stone-100 last:border-0">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 mt-0.5" style={{ color: pm.color, backgroundColor: pm.bgColor, borderColor: `${pm.color}44` }}>
                            {a.platform !== "general" ? pm.name : "Guide"}
                          </span>
                          <div className="text-left">
                            <div className="text-[15px] font-semibold text-stone-800 leading-snug">{a.h1}</div>
                            <div className="text-xs text-stone-500 mt-1.5 flex items-center gap-2">
                              <span>{a.readTime} min read</span>
                              <span>&middot;</span>
                              <span>{a.views.toLocaleString()} views</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Popular chips */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap gap-2.5 justify-center max-w-3xl mx-auto"
            >
              {POPULAR_SEARCHES.slice(0, 6).map(s => (
                <Link key={s.slug} to="/blog/$slug" params={{ slug: s.slug }} className="inline-flex items-center px-4 py-2 bg-white/50 backdrop-blur-sm border border-stone-200/60 rounded-full text-sm font-medium text-stone-600 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-200">
                  {s.label}
                </Link>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">Browse by Topic</h2>
                <p className="text-stone-500 mt-2">Find exactly what you need to master your AI workflow.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {CATEGORIES.map((c, i) => {
                const isActive = category === c.slug;
                return (
                  <motion.div
                    key={c.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Link
                      to="/blog"
                      search={{ category: c.slug }}
                      hash="all-guides"
                      className={`block h-full backdrop-blur-md border rounded-2xl p-5 text-center hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 ${
                        isActive ? "bg-white border-orange-300 shadow-[0_8px_30px_rgba(0,0,0,0.06)]" : "bg-white/60 border-[#f0ece4]"
                      }`}
                    >
                      <div className="text-3xl mb-3">{c.icon}</div>
                      <div className={`font-bold text-sm mb-1 ${isActive ? "text-orange-600" : "text-stone-800"}`}>{c.name}</div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FEATURED GUIDES */}
        <section className="py-24 px-6 relative">
          <div className="absolute inset-0 bg-stone-100/50 skew-y-[-2deg] origin-top-left -z-10" />
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <span className="text-orange-600 font-bold text-sm tracking-wider uppercase mb-2 block">Trending</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">Featured Guides</h2>
              </div>
              <Link to="/blog" search={{}} hash="all-guides" className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">View all &rarr;</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.slice(0, 6).map((a, i) => (
                <ArticleCard key={a.slug} article={a} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ALL GUIDES */}
        <section id="all-guides" className="py-24 px-6 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <span className="text-orange-600 font-bold text-sm tracking-wider uppercase mb-2 block">
                  {activeCategory ? activeCategory.name : "Library"}
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
                  {activeCategory ? `${activeCategory.name} Guides` : "All Guides"}
                </h2>
                <p className="text-stone-500 mt-2">
                  {allGuides.length} {allGuides.length === 1 ? "article" : "articles"}
                  {activeCategory ? ` about ${activeCategory.name}` : ""}
                </p>
              </div>
              {activeCategory && (
                <Link to="/blog" search={{}} hash="all-guides" className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Clear filter
                </Link>
              )}
            </div>
            {allGuides.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allGuides.map((a, i) => (
                  <ArticleCard key={a.slug} article={a} index={i % 6} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/60 border border-[#f0ece4] rounded-2xl">
                <p className="text-stone-500">No guides found for this topic yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* PLATFORM HUB */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mb-4">Export from Every Platform</h2>
              <p className="text-lg text-stone-500 max-w-2xl mx-auto">Dedicated hubs with step-by-step instructions for your favorite AI app builders.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PLATFORMS.map((p, i) => (
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link to="/platforms/$platform" params={{ platform: p.slug }} className="group block h-full bg-white/70 backdrop-blur-xl border border-[#f0ece4] rounded-[24px] p-6 hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at top right, ${p.color}15, transparent 70%)` }} />
                    <div className="flex items-center gap-4 mb-5 relative z-10">
                      <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-xl font-black text-white shadow-sm" style={{ backgroundColor: p.color }}>
                        {p.name[0]}
                      </div>
                      <div>
                        <div className="font-extrabold text-lg text-stone-900">{p.name}</div>
                        <div className="text-xs text-stone-500 font-medium tracking-wide uppercase mt-0.5">{p.articles.length} guides</div>
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed mb-6 relative z-10">{p.tagline}</p>
                    <div className="text-sm font-bold relative z-10" style={{ color: p.color }}>Explore hub &rarr;</div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARISONS */}
        <section className="py-24 px-6 bg-stone-900 text-stone-100 relative overflow-hidden rounded-t-[40px] md:rounded-t-[80px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-800 to-stone-950 pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
              <div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Side-by-Side Comparisons</h2>
                <p className="text-stone-400 text-lg max-w-xl">Make informed decisions about how to export, backup, and version-control your AI apps.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COMPARISONS.map((c, i) => (
                <motion.div
                  key={c.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link to="/compare/$slug" params={{ slug: c.slug }} className="group flex flex-col gap-4 bg-stone-800/50 backdrop-blur-md border border-stone-700/50 rounded-[20px] p-6 hover:bg-stone-800 hover:border-stone-600 transition-all duration-300 h-full">
                    <div className="inline-flex items-center self-start bg-stone-950 border border-stone-800 text-stone-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Compare
                    </div>
                    <div className="text-xl font-bold text-white leading-snug mt-2">{c.h1}</div>
                    <p className="text-sm text-stone-400 leading-relaxed line-clamp-3">{c.summary}</p>
                    <div className="mt-auto pt-4 text-xs font-medium text-stone-500 uppercase tracking-wide">
                      {c.aspects.length} aspects compared
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 bg-stone-950 text-center relative overflow-hidden">
           <div className="absolute inset-0">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none" />
           </div>
           <div className="max-w-3xl mx-auto relative z-10">
             <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">Ready to Own Your AI Code?</h2>
             <p className="text-xl text-stone-400 mb-10 max-w-2xl mx-auto">Export your complete source code from any AI platform to GitHub in under 2 minutes. Free forever.</p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Link to="/" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_10px_25px_rgba(249,115,22,0.4)] transition-all transform hover:-translate-y-0.5 text-lg">
                 Start Exporting Now
               </Link>
               <a href="https://github.com/The-habib/Push44" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all text-lg">
                 View on GitHub
               </a>
             </div>
           </div>
        </section>
      </div>
    </div>
  );
}