import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-6xl font-black text-stone-900 mb-4">404</h1>
      <p className="text-xl text-stone-500 mb-8">Comparison not found</p>
      <Link to="/blog" className="text-orange-600 font-bold hover:text-orange-700">&larr; Back to Blog</Link>
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
    <div className="min-h-[100dvh] bg-[#faf8f5] selection:bg-orange-500/30 font-sans">
      
      {/* HERO */}
      <header className="bg-stone-950 text-white pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-800 to-stone-950 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <nav className="flex items-center justify-center gap-3 text-sm text-stone-400 font-medium mb-10">
            <Link to="/" className="hover:text-white transition-colors">Push44</Link>
            <span>/</span>
            <Link to="/blog/" className="hover:text-white transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-stone-300">Compare</span>
          </nav>

          <span className="inline-block bg-white/10 border border-white/20 text-stone-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
            Detailed Comparison
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8">
            {comparison.h1}
          </h1>
          
          <p className="text-xl text-stone-400 max-w-3xl mx-auto leading-relaxed mb-16">
            {comparison.description}
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-[24px] px-8 py-6 w-48 shadow-[0_0_40px_rgba(249,115,22,0.15)]">
              <div className="text-5xl font-black text-orange-500 mb-2">{aWins}</div>
              <div className="text-sm font-bold text-orange-200/80 uppercase tracking-wide">{aLabel} Wins</div>
            </div>
            
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-[24px] px-8 py-6 w-48 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
              <div className="text-5xl font-black text-emerald-400 mb-2">{bWins}</div>
              <div className="text-sm font-bold text-emerald-200/80 uppercase tracking-wide">{bLabel} Wins</div>
            </div>

            {ties > 0 && (
              <div className="bg-stone-500/10 border border-stone-500/30 rounded-[24px] px-8 py-6 w-48">
                <div className="text-5xl font-black text-stone-400 mb-2">{ties}</div>
                <div className="text-sm font-bold text-stone-400 uppercase tracking-wide">Ties</div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-20">
        
        {/* VERDICT */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 border border-indigo-100 rounded-[32px] p-8 md:p-12 mb-20 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 text-indigo-100">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <div className="relative z-10">
            <div className="text-indigo-800 font-black text-xl mb-4 flex items-center gap-3 tracking-tight">
              <span>🏆</span> The Final Verdict
            </div>
            <p className="text-indigo-950 text-xl font-medium leading-relaxed">
              {comparison.verdict}
            </p>
          </div>
        </motion.div>

        {/* SUMMARY */}
        <section className="mb-20">
          <h2 className="text-3xl font-extrabold text-stone-900 mb-6">Overview</h2>
          <p className="text-lg text-stone-600 leading-relaxed">{comparison.summary}</p>
        </section>

        {/* TABLE */}
        <section className="mb-24">
          <h2 className="text-3xl font-extrabold text-stone-900 mb-8">Detailed Breakdown</h2>
          
          <div className="overflow-hidden bg-white border border-[#f0ece4] rounded-[32px] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="px-6 py-5 text-sm font-bold text-stone-500 uppercase tracking-wider w-[25%]">Feature</th>
                    <th className="px-6 py-5 text-sm font-bold text-orange-600 uppercase tracking-wider w-[30%]">{aLabel}</th>
                    <th className="px-6 py-5 text-sm font-bold text-emerald-600 uppercase tracking-wider w-[30%]">{bLabel}</th>
                    <th className="px-6 py-5 text-sm font-bold text-stone-500 uppercase tracking-wider w-[15%]">Winner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {comparison.aspects.map((a: Aspect, i: number) => (
                    <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-6 font-bold text-stone-900 align-top">{a.aspect}</td>
                      <td className="px-6 py-6 align-top">
                        <div className="font-medium text-stone-700 mb-3 leading-relaxed">{a.a.value}</div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-full max-w-[100px] bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(a.a.score / 5) * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold text-stone-400">{a.a.score}/5</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 align-top">
                        <div className="font-medium text-stone-700 mb-3 leading-relaxed">{a.b.value}</div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-full max-w-[100px] bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(a.b.score / 5) * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold text-stone-400">{a.b.score}/5</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 align-top">
                        <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          a.winner === 'a' ? 'bg-orange-100 text-orange-700' :
                          a.winner === 'b' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-stone-100 text-stone-600'
                        }`}>
                          {a.winner === 'a' ? aLabel : a.winner === 'b' ? bLabel : 'Tie'}
                        </div>
                        {a.note && <div className="text-xs text-stone-500 font-medium mt-3 leading-relaxed">{a.note}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-stone-900 text-center rounded-[40px] py-16 px-8 relative overflow-hidden mb-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-800 to-stone-900 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-white mb-4">Export Code on Your Terms</h2>
            <p className="text-stone-400 text-lg mb-8 max-w-xl mx-auto">Push44 is the completely free, open-source tool for exporting projects from Base44, Floot, and more straight to GitHub.</p>
            <Link to="/" className="inline-flex items-center justify-center px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/20 text-lg">
              Try Push44 Now
            </Link>
          </div>
        </section>

        {/* MORE COMPARISONS */}
        <section>
          <h2 className="text-2xl font-extrabold text-stone-900 mb-8">More Comparisons</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {others.map(c => (
              <Link key={c.slug} to="/compare/$slug" params={{ slug: c.slug }} className="group bg-white/70 backdrop-blur-xl border border-[#f0ece4] rounded-[24px] p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all flex flex-col h-full">
                <span className="self-start text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3 border border-stone-200 px-2 py-1 rounded-md">Compare</span>
                <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-orange-600 transition-colors">{c.h1}</h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-4 line-clamp-2">{c.summary}</p>
                <div className="mt-auto text-orange-600 font-bold text-sm">Read comparison &rarr;</div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}