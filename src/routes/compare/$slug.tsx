import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, Award, Trophy, Check, ArrowRight, GitCompare, Sparkles, Scale } from "lucide-react";
import { getComparison, COMPARISONS, type Comparison } from "@/seo/data";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/compare/$slug")({
  head: ({ params }) => {
    const c = getComparison(params.slug);
    if (!c) return { meta: [{ title: "Not Found — Push44" }] };
    return {
      meta: [
        { title: `${c.title} — Push44 Comparison` },
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 bg-[#faf8f5]">
      <h1 className="text-6xl font-extrabold text-[#191411] mb-3 tracking-tight">404</h1>
      <p className="text-lg text-[#544e47] mb-6">Comparison not found.</p>
      <Link to="/blog" className="px-5 py-2.5 bg-[#f50] hover:bg-[#e64d00] text-white font-bold rounded-xl shadow-xs transition-colors">
        &larr; Back to Blog
      </Link>
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
    <div className="min-h-[100dvh] bg-[#faf8f5] text-[#191411] font-sans selection:bg-[#f50]/20">
      <Navbar />

      {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
      <header className="relative pt-32 pb-20 px-6 border-b border-[#e7e2db] bg-gradient-to-b from-[#fff8f3] via-[#faf8f5] to-[#faf8f5] overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-[#f50]/10 via-[#f50]/4 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          {/* Breadcrumbs */}
          <nav className="flex items-center justify-center gap-2 text-[13px] font-medium text-[#8c857b] mb-8 flex-wrap">
            <Link to="/" className="hover:text-[#191411] transition-colors">Push44</Link>
            <ChevronRight size={12} className="text-[#cfc8bd]" />
            <Link to="/blog/" className="hover:text-[#191411] transition-colors">Blog</Link>
            <ChevronRight size={12} className="text-[#cfc8bd]" />
            <span className="text-[#191411] font-semibold">Head-to-Head Comparison</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f50]/10 border border-[#f50]/20 text-[#f50] text-[12px] font-bold uppercase tracking-wider mb-6">
            <Scale size={13} />
            Architecture & Export Breakdown
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191411] tracking-tight leading-[1.15] mb-5">
            {comparison.h1}
          </h1>

          <p className="text-lg sm:text-xl text-[#544e47] leading-relaxed max-w-2xl mx-auto mb-10">
            {comparison.description}
          </p>

          {/* Scoreboard Cards */}
          <div className="flex flex-wrap justify-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-[#e7e2db] rounded-2xl p-6 w-44 shadow-2xs text-center"
            >
              <div className="text-4xl font-extrabold text-[#f50] mb-1">{aWins}</div>
              <div className="text-[12px] font-bold text-[#8c857b] uppercase tracking-wider">{aLabel} Wins</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="bg-white border border-[#e7e2db] rounded-2xl p-6 w-44 shadow-2xs text-center"
            >
              <div className="text-4xl font-extrabold text-emerald-600 mb-1">{bWins}</div>
              <div className="text-[12px] font-bold text-[#8c857b] uppercase tracking-wider">{bLabel} Wins</div>
            </motion.div>

            {ties > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white border border-[#e7e2db] rounded-2xl p-6 w-40 shadow-2xs text-center"
              >
                <div className="text-4xl font-extrabold text-[#8c857b] mb-1">{ties}</div>
                <div className="text-[12px] font-bold text-[#8c857b] uppercase tracking-wider">Ties</div>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT BODY ────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        
        {/* THE FINAL VERDICT BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-br from-[#191411] to-[#2b2521] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#f50]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[12px] font-bold uppercase tracking-wider">
              <Trophy size={14} className="text-amber-400" />
              The Final Verdict
            </div>
            <p className="text-lg sm:text-xl font-medium text-stone-200 leading-relaxed m-0">
              {comparison.verdict}
            </p>
          </div>
        </motion.div>

        {/* OVERVIEW SUMMARY */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold text-[#191411] tracking-tight">Executive Summary</h2>
          <p className="text-[16px] text-[#544e47] leading-relaxed bg-white border border-[#e7e2db] rounded-2xl p-6 shadow-2xs">
            {comparison.summary}
          </p>
        </section>

        {/* DETAILED BREAKDOWN TABLE */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-[#191411] tracking-tight">Feature-by-Feature Matrix</h2>
            <span className="text-[12px] font-bold text-[#8c857b] uppercase tracking-wider bg-[#f3efe9] px-3 py-1 rounded-full">
              {comparison.aspects.length} Categories
            </span>
          </div>

          <div className="bg-white border border-[#e7e2db] rounded-3xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[620px]">
                <thead>
                  <tr className="bg-[#f3efe9]/60 border-b border-[#e7e2db]">
                    <th className="px-6 py-4 text-[12px] font-bold text-[#8c857b] uppercase tracking-wider w-[26%]">Feature Aspect</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-[#f50] uppercase tracking-wider w-[32%]">{aLabel}</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-emerald-700 uppercase tracking-wider w-[32%]">{bLabel}</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-[#8c857b] uppercase tracking-wider w-[10%]">Winner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3efe9]">
                  {comparison.aspects.map((a: Aspect, i: number) => (
                    <tr key={i} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="px-6 py-5 align-top font-bold text-[#191411] text-[14.5px]">
                        {a.aspect}
                      </td>
                      <td className="px-6 py-5 align-top space-y-2">
                        <div className="text-[14px] text-[#544e47] leading-relaxed font-medium">{a.a.value}</div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-[#f3efe9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#f50] rounded-full" style={{ width: `${(a.a.score / 5) * 100}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-[#8c857b]">{a.a.score}/5</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top space-y-2">
                        <div className="text-[14px] text-[#544e47] leading-relaxed font-medium">{a.b.value}</div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-[#f3efe9] rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(a.b.score / 5) * 100}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-[#8c857b]">{a.b.score}/5</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          a.winner === 'a' ? 'bg-[#fff4ed] text-[#f50] border border-[#f50]/20' :
                          a.winner === 'b' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          'bg-[#f3efe9] text-[#544e47]'
                        }`}>
                          {a.winner === 'a' ? aLabel : a.winner === 'b' ? bLabel : 'Tie'}
                        </span>
                        {a.note && <div className="text-[12px] text-[#8c857b] mt-2 leading-relaxed">{a.note}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA BOX */}
        <section className="bg-[#191411] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#f50]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Export and Push AI Code to GitHub
            </h2>
            <p className="text-[15px] text-stone-400 leading-relaxed">
              Push44 is 100% free with zero backend — your code and credentials never leave your browser.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#f50] hover:bg-[#e64d00] text-white font-bold text-[14px] rounded-xl shadow-md transition-colors"
              >
                Start Exporting Free <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* RELATED COMPARISONS */}
        {others.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-[#e7e2db]">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-[#191411] tracking-tight">More Platform Comparisons</h2>
              <Link to="/blog" className="text-[13px] font-bold text-[#f50] hover:underline">
                View all &rarr;
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {others.map(c => (
                <Link
                  key={c.slug}
                  to="/compare/$slug"
                  params={{ slug: c.slug }}
                  className="group bg-white hover:bg-[#faf8f5] border border-[#e7e2db] hover:border-[#f50]/40 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block text-[10.5px] font-bold uppercase tracking-wider text-[#8c857b] bg-[#f3efe9] px-2.5 py-0.5 rounded-full mb-3">
                      Comparison
                    </span>
                    <h3 className="text-[16.5px] font-bold text-[#191411] group-hover:text-[#f50] transition-colors leading-snug mb-2">
                      {c.h1}
                    </h3>
                    <p className="text-[13px] text-[#544e47] line-clamp-2 leading-relaxed mb-4">
                      {c.summary}
                    </p>
                  </div>
                  <div className="text-[12.5px] font-bold text-[#191411] group-hover:text-[#f50] flex items-center justify-between pt-3 border-t border-[#f3efe9]">
                    <span>Read comparison</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      <Footer />
    </div>
  );
}