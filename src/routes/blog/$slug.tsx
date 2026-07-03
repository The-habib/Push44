import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-6xl font-black text-stone-900 mb-4">404</h1>
      <p className="text-xl text-stone-500 mb-8">Article not found</p>
      <Link to="/blog" className="text-orange-600 font-bold hover:text-orange-700">&larr; Back to Blog</Link>
    </div>
  ),
});

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
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
    }, { threshold: 0.2, rootMargin: "-100px 0px -40% 0px" });
    toc.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [toc]);

  return (
    <div className="min-h-[100dvh] bg-[#faf8f5] selection:bg-orange-500/30 font-sans">
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400 origin-left z-50"
        style={{ scaleX }}
      />

      {/* HERO */}
      <header className="pt-16 md:pt-32 pb-16 px-6 bg-white border-b border-[#f0ece4] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-50/50 to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10">
          
          <nav className="flex items-center gap-2 text-sm text-stone-500 font-medium mb-8 flex-wrap">
            <Link to="/" className="hover:text-stone-900 transition-colors">Push44</Link>
            <span className="text-stone-300">/</span>
            <Link to="/blog/" className="hover:text-stone-900 transition-colors">Blog</Link>
            <span className="text-stone-300">/</span>
            {article.platform !== "general" && (
              <>
                <Link to="/platforms/$platform" params={{ platform: article.platform }} className="hover:text-stone-900 transition-colors">{pm.name}</Link>
                <span className="text-stone-300">/</span>
              </>
            )}
            <span className="text-stone-900 truncate max-w-[200px] md:max-w-md">{article.h1}</span>
          </nav>

          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {article.platform !== "general" && (
              <span className="px-3 py-1 rounded-full text-xs font-bold border" style={{ color: pm.color, backgroundColor: pm.bgColor, borderColor: `${pm.color}44` }}>
                {pm.name}
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${article.difficulty === 'beginner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
              {article.difficulty.charAt(0).toUpperCase() + article.difficulty.slice(1)}
            </span>
            <span className="text-sm font-medium text-stone-400 flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{article.readTime} min read</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15] mb-8">
            {article.h1}
          </h1>
          
          <p className="text-xl text-stone-600 leading-relaxed mb-10 max-w-3xl">
            {article.intro}
          </p>

          <div className="flex items-center justify-between border-t border-stone-100 pt-8 flex-wrap gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                P
              </div>
              <div>
                <div className="font-bold text-stone-900">Push44 Team</div>
                <div className="text-sm text-stone-500 font-medium">Updated {new Date(article.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
              </div>
            </div>
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.h1)}&url=${encodeURIComponent(`https://push44.vercel.app/blog/${article.slug}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.918H5.078z"/></svg>
              Share Guide
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-16 items-start">
        
        {/* ARTICLE CONTENT */}
        <article className="prose prose-stone prose-lg max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-orange-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline">
          
          <div id="introduction" className="bg-emerald-50/50 border border-emerald-100 rounded-[24px] p-8 mb-12 shadow-sm">
            <h2 className="text-emerald-800 text-lg font-bold flex items-center gap-2 m-0 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              Quick Summary
            </h2>
            <p className="text-emerald-900 m-0 leading-relaxed font-medium">{article.solution}</p>
          </div>

          <section id="the-problem" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl text-stone-900 mb-6">The Problem</h2>
            <p>{article.problem}</p>
          </section>

          <section id="the-solution" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl text-stone-900 mb-6">How Push44 Solves It</h2>
            <p>{article.solution}</p>
          </section>

          <section id="step-by-step" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl text-stone-900 mb-8">Step-by-Step Guide</h2>
            <div className="space-y-8">
              {article.steps.map((step: { title: string; content: string; tip?: string }, i: number) => (
                <div key={i} className="flex gap-6 p-8 bg-white border border-[#f0ece4] rounded-[24px] shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-lg shrink-0 border border-orange-200">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 m-0 mb-3">{step.title}</h3>
                    <p className="text-stone-600 m-0 leading-relaxed">{step.content}</p>
                    {step.tip && (
                      <div className="mt-6 bg-stone-50 border border-stone-200 rounded-xl p-4 flex gap-3 items-start">
                        <span className="text-xl leading-none">💡</span>
                        <div className="text-sm text-stone-700 font-medium leading-relaxed">{step.tip}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {article.tips.length > 0 && (
            <section id="tips" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl text-stone-900 mb-6">Pro Tips</h2>
              <ul className="space-y-3">
                {article.tips.map((t: string, i: number) => (
                  <li key={i} className="flex gap-3 m-0 pl-0 before:hidden"><span className="text-orange-500 font-bold">&rarr;</span> <span>{t}</span></li>
                ))}
              </ul>
            </section>
          )}

          {article.mistakes.length > 0 && (
            <section id="mistakes" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl text-stone-900 mb-6">Common Mistakes to Avoid</h2>
              <div className="bg-amber-50/50 border border-amber-200 rounded-[24px] p-8">
                <div className="text-amber-800 font-bold flex items-center gap-2 mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Watch Out For
                </div>
                <ul className="space-y-3 m-0">
                  {article.mistakes.map((m: string, i: number) => (
                    <li key={i} className="text-amber-900 m-0 font-medium leading-relaxed pl-0 before:hidden flex gap-3"><span className="text-amber-600 font-bold">&times;</span> <span>{m}</span></li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <div className="my-16 bg-stone-900 rounded-[32px] p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-800 to-stone-900 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold text-white mb-4 m-0">Ready to Export?</h2>
              <p className="text-stone-400 text-lg mb-8 m-0">Push44 is free, open source, and takes under 2 minutes to set up.</p>
              <Link to="/" className="inline-flex items-center justify-center px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors m-0 text-base shadow-lg shadow-orange-500/20">
                Start Exporting Now
              </Link>
            </div>
          </div>

          <section id="faq" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl text-stone-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {article.faqs.map((faq: { question: string; answer: string }, i: number) => (
                <div key={i} className="border-b border-stone-200 pb-6 last:border-0">
                  <h3 className="text-lg font-bold text-stone-900 m-0 mb-3">{faq.question}</h3>
                  <p className="text-stone-600 m-0">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

        </article>

        {/* SIDEBAR */}
        <aside className="hidden lg:block sticky top-8 space-y-6">
          
          <div className="bg-white/60 backdrop-blur-xl border border-[#f0ece4] rounded-[24px] p-6 shadow-sm">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">On This Page</h4>
            <nav className="space-y-1">
              {toc.map(({ id, label }) => (
                <a 
                  key={id} 
                  href={`#${id}`}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeSection === id 
                      ? "bg-orange-50 text-orange-600" 
                      : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-[24px] p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Free Tool</h4>
              <div className="text-lg font-black text-white mb-2 leading-tight">Push44 — Export to GitHub</div>
              <p className="text-sm text-stone-400 mb-6 leading-relaxed">Export your complete source code in one click. Free forever.</p>
              <Link to="/" className="flex items-center justify-center px-4 py-3 bg-white text-stone-900 hover:bg-orange-500 hover:text-white font-bold rounded-xl transition-colors text-sm">
                Open App &rarr;
              </Link>
            </div>
          </div>

          {article.platform !== "general" && platformData && (
            <div className="bg-white/60 backdrop-blur-xl border border-[#f0ece4] rounded-[24px] p-6 shadow-sm">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">{pm.name} Hub</h4>
              <div className="space-y-3">
                {platformData.articles.filter(s => s !== article.slug).slice(0, 4).map(slug => {
                  const a = ARTICLES.find(x => x.slug === slug);
                  return a ? (
                    <Link key={slug} to="/blog/$slug" params={{ slug }} className="block text-sm font-semibold text-stone-700 hover:text-orange-600 leading-snug transition-colors">
                      {a.h1}
                    </Link>
                  ) : null;
                })}
              </div>
              <Link to="/platforms/$platform" params={{ platform: article.platform }} className="inline-block mt-6 text-sm font-bold text-orange-600 hover:text-orange-700">
                View all {pm.name} guides &rarr;
              </Link>
            </div>
          )}

        </aside>
      </div>
    </div>
  );
}