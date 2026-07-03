import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { getPlatform, getPlatformArticles, PLATFORMS, type PlatformData } from "@/seo/data";
import { ArticleCard } from "@/components/blog/ArticleCard";

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
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-6xl font-black text-stone-900 mb-4">404</h1>
      <p className="text-xl text-stone-500 mb-8">Platform not found</p>
      <Link to="/blog" className="text-orange-600 font-bold hover:text-orange-700">&larr; Back to Blog</Link>
    </div>
  ),
});

export default function PlatformPage() {
  const { platform } = Route.useLoaderData();
  const articles = getPlatformArticles(platform);
  const otherPlatforms = PLATFORMS.filter(p => p.slug !== platform.slug);

  return (
    <div className="min-h-[100dvh] bg-[#faf8f5] selection:bg-orange-500/30 font-sans">
      
      {/* HERO */}
      <header className="relative pt-32 pb-24 overflow-hidden border-b border-[#f0ece4] bg-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${platform.color}, transparent 60%)` }} />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <nav className="flex items-center gap-2 text-sm text-stone-500 font-medium mb-10">
            <Link to="/" className="hover:text-stone-900 transition-colors">Push44</Link>
            <span className="text-stone-300">/</span>
            <Link to="/blog/" className="hover:text-stone-900 transition-colors">Blog</Link>
            <span className="text-stone-300">/</span>
            <span className="text-stone-900 font-bold">{platform.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-xl" style={{ backgroundColor: platform.color, boxShadow: `0 10px 30px ${platform.color}30` }}>
                  {platform.name[0]}
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-none mb-2">
                    {platform.name} Hub
                  </h1>
                  <p className="text-xl text-stone-500 font-medium">{platform.tagline}</p>
                </div>
              </div>
              <p className="text-lg text-stone-600 leading-relaxed mb-8">
                {platform.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-colors shadow-lg">
                  Export {platform.name} Project
                </Link>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="bg-stone-50 border border-stone-200 rounded-[24px] p-6 w-[280px]">
                <div className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Platform Stats</div>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-black text-stone-900">{articles.length}</div>
                    <div className="text-sm font-medium text-stone-500">Official Guides</div>
                  </div>
                  <div className="h-px bg-stone-200" />
                  <div>
                    <div className="text-3xl font-black text-stone-900" style={{ color: platform.color }}>100%</div>
                    <div className="text-sm font-medium text-stone-500">Free to Export</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16">
          
          <div className="space-y-20">
            {/* CAPABILITIES */}
            <section>
              <h2 className="text-2xl font-extrabold text-stone-900 mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: platform.color }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </span>
                What Push44 Does with {platform.name}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {platform.features.map((f: string, i: number) => (
                  <div key={i} className="flex gap-3 bg-white border border-[#f0ece4] p-5 rounded-2xl shadow-sm">
                    <div className="text-emerald-500 font-bold">&check;</div>
                    <div className="text-stone-700 font-medium leading-snug">{f}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* QUICK START */}
            <section>
              <h2 className="text-2xl font-extrabold text-stone-900 mb-8">Quick Start Export</h2>
              <div className="bg-white border border-[#f0ece4] rounded-[32px] p-8 md:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none" style={{ background: `radial-gradient(circle, ${platform.color}, transparent 70%)` }} />
                <div className="relative z-10 space-y-8">
                  {platform.exportSteps.map((s: string, i: number) => (
                    <div key={i} className="flex gap-5">
                      <div className="w-8 h-8 rounded-full text-white font-bold flex items-center justify-center shrink-0 shadow-md" style={{ backgroundColor: platform.color }}>
                        {i + 1}
                      </div>
                      <div className="text-lg text-stone-700 font-medium pt-0.5">{s}</div>
                    </div>
                  ))}
                  {articles[0] && (
                    <div className="pt-4 border-t border-stone-100">
                      <Link to="/blog/$slug" params={{ slug: articles[0].slug }} className="inline-flex items-center font-bold" style={{ color: platform.color }}>
                        Read full tutorial &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* GUIDES GRID */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-extrabold text-stone-900">All {platform.name} Guides</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {articles.map((a, i) => (
                  <ArticleCard key={a.slug} article={a} index={i} />
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-10">
            {/* FAQ */}
            {platform.faqs.length > 0 && (
              <section className="bg-white/60 backdrop-blur-xl border border-[#f0ece4] rounded-[24px] p-8 shadow-sm">
                <h3 className="text-lg font-extrabold text-stone-900 mb-6">Frequently Asked</h3>
                <div className="space-y-6">
                  {platform.faqs.map((faq: { question: string; answer: string }, i: number) => (
                    <div key={i}>
                      <h4 className="text-sm font-bold text-stone-800 mb-2 leading-snug">{faq.question}</h4>
                      <p className="text-sm text-stone-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* OTHER PLATFORMS */}
            <section>
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-6">Other Platforms</h3>
              <div className="grid grid-cols-2 gap-4">
                {otherPlatforms.map(p => (
                  <Link key={p.slug} to="/platforms/$platform" params={{ platform: p.slug }} className="bg-white border border-[#f0ece4] p-4 rounded-2xl text-center hover:shadow-md hover:-translate-y-1 transition-all">
                    <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-white font-bold text-lg mb-3 shadow-sm" style={{ backgroundColor: p.color }}>
                      {p.name[0]}
                    </div>
                    <div className="text-sm font-bold text-stone-800">{p.name}</div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}