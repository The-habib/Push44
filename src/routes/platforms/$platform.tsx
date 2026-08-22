import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2, Terminal, ArrowRight, Sparkles, BookOpen, Layers, ShieldCheck, Download, Code } from "lucide-react";
import { getPlatform, getPlatformArticles, PLATFORMS, type PlatformData } from "@/seo/data";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/platforms/$platform")({
  head: ({ params }) => {
    const platform = getPlatform(params.platform as any);
    if (!platform) return { meta: [{ title: "Not Found — Push44" }] };
    return {
      meta: [
        { title: `${platform.name} GitHub Export & Version Control Hub — Push44` },
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 bg-[#faf8f5]">
      <h1 className="text-6xl font-extrabold text-[#191411] mb-3 tracking-tight">404</h1>
      <p className="text-lg text-[#544e47] mb-6">Platform not found in the Push44 registry.</p>
      <Link to="/blog" className="px-5 py-2.5 bg-[#f50] hover:bg-[#e64d00] text-white font-bold rounded-xl shadow-xs transition-colors">
        &larr; Back to Guides
      </Link>
    </div>
  ),
});

export default function PlatformPage() {
  const { platform } = Route.useLoaderData();
  const articles = getPlatformArticles(platform);
  const otherPlatforms = PLATFORMS.filter(p => p.slug !== platform.slug);

  return (
    <div className="min-h-[100dvh] bg-[#faf8f5] text-[#191411] font-sans selection:bg-[#f50]/20">
      <Navbar />

      {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
      <header className="relative pt-32 pb-20 px-6 border-b border-[#e7e2db] bg-gradient-to-b from-[#fff8f3] via-[#faf8f5] to-[#faf8f5] overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] blur-3xl pointer-events-none rounded-full opacity-15"
          style={{ background: `radial-gradient(circle, ${platform.color}, transparent 70%)` }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[13px] font-medium text-[#8c857b] mb-8 flex-wrap">
            <Link to="/" className="hover:text-[#191411] transition-colors">Push44</Link>
            <ChevronRight size={12} className="text-[#cfc8bd]" />
            <Link to="/blog/" className="hover:text-[#191411] transition-colors">Blog</Link>
            <ChevronRight size={12} className="text-[#cfc8bd]" />
            <span className="text-[#191411] font-semibold">{platform.name} Hub</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center gap-5">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-white shadow-md shrink-0"
                  style={{ backgroundColor: platform.color, boxShadow: `0 8px 24px ${platform.color}30` }}
                >
                  {platform.name[0]}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wider text-[#8c857b] mb-1">
                    <Layers size={12} style={{ color: platform.color }} /> Official Platform Hub
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191411] tracking-tight leading-tight">
                    {platform.name}
                  </h1>
                </div>
              </div>

              <p className="text-lg sm:text-xl text-[#544e47] leading-relaxed">
                {platform.description}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#191411] hover:bg-[#2b2521] text-white font-bold text-[14px] rounded-xl shadow-xs transition-colors"
                >
                  <Download size={15} />
                  Connect {platform.name} in App
                </Link>
                <a
                  href="#quick-start"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-[#f3efe9] border border-[#e7e2db] text-[#191411] font-bold text-[14px] rounded-xl transition-colors shadow-2xs"
                >
                  Quick Start Guide
                </a>
              </div>
            </div>

            {/* Platform Stats Box */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="bg-white border border-[#e7e2db] rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="text-[11px] font-bold text-[#8c857b] uppercase tracking-wider">
                  Platform Metrics
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-extrabold text-[#191411]">{articles.length}</div>
                    <div className="text-[13px] font-medium text-[#8c857b]">Verified Guides & Tutorials</div>
                  </div>
                  <div className="h-px bg-[#f3efe9]" />
                  <div>
                    <div className="text-3xl font-extrabold" style={{ color: platform.color }}>
                      100% Free
                    </div>
                    <div className="text-[13px] font-medium text-[#8c857b]">Zero Backend & Direct Push</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 items-start">
          
          <div className="space-y-16">
            {/* CAPABILITIES */}
            <section className="space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#f50] block mb-1">
                  Supported Features
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191411] tracking-tight">
                  What Push44 Does with {platform.name}
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {platform.features.map((f: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 bg-white border border-[#e7e2db] p-5 rounded-2xl shadow-2xs">
                    <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      ✓
                    </div>
                    <div className="text-[14.5px] text-[#544e47] font-medium leading-snug">{f}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* QUICK START EXPORT */}
            <section id="quick-start" className="scroll-mt-24 space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c857b] block mb-1">
                  Fast Track
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191411] tracking-tight">
                  Quick Export Protocol
                </h2>
              </div>

              <div className="bg-white border border-[#e7e2db] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
                <div className="space-y-6">
                  {platform.exportSteps.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-4">
                      <div
                        className="w-7 h-7 rounded-xl text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs mt-0.5"
                        style={{ backgroundColor: platform.color }}
                      >
                        {i + 1}
                      </div>
                      <div className="text-[15px] text-[#544e47] font-medium leading-relaxed pt-0.5">{s}</div>
                    </div>
                  ))}
                </div>

                {articles[0] && (
                  <div className="pt-6 border-t border-[#f3efe9]">
                    <Link
                      to="/blog/$slug"
                      params={{ slug: articles[0].slug }}
                      className="inline-flex items-center gap-1.5 font-bold text-[14px]"
                      style={{ color: platform.color }}
                    >
                      Read full step-by-step masterclass <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* ALL GUIDES FOR THIS PLATFORM */}
            <section className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-[#e7e2db] pb-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191411] tracking-tight">
                  All {platform.name} Guides & Tutorials
                </h2>
                <span className="text-[12px] font-bold text-[#8c857b] bg-[#f3efe9] px-3 py-1 rounded-full">
                  {articles.length} Guides
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {articles.map((a, i) => (
                  <ArticleCard key={a.slug} article={a} index={i} />
                ))}
              </div>
            </section>
          </div>

          {/* SIDEBAR: FAQs & OTHER PLATFORMS */}
          <aside className="space-y-8">
            {/* PLATFORM FAQ */}
            {platform.faqs.length > 0 && (
              <div className="bg-white border border-[#e7e2db] rounded-2xl p-6 shadow-2xs space-y-6">
                <h3 className="text-[16px] font-bold text-[#191411] tracking-tight flex items-center gap-2">
                  <Sparkles size={16} className="text-[#f50]" />
                  Frequently Asked
                </h3>
                <div className="space-y-5 divide-y divide-[#f3efe9]">
                  {platform.faqs.map((faq: { question: string; answer: string }, i: number) => (
                    <div key={i} className={i > 0 ? "pt-5 space-y-1.5" : "space-y-1.5"}>
                      <h4 className="text-[13.5px] font-bold text-[#191411] leading-snug">{faq.question}</h4>
                      <p className="text-[13px] text-[#544e47] leading-relaxed m-0">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OTHER PLATFORMS */}
            <div className="bg-white border border-[#e7e2db] rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="text-[12px] font-bold text-[#8c857b] uppercase tracking-wider">
                Explore Other Platforms
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {otherPlatforms.map(p => (
                  <Link
                    key={p.slug}
                    to="/platforms/$platform"
                    params={{ platform: p.slug }}
                    className="group bg-[#faf8f5] hover:bg-white border border-[#e7e2db] hover:border-[#f50]/40 p-3.5 rounded-xl text-center shadow-2xs hover:shadow-sm transition-all"
                  >
                    <div
                      className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-white font-black text-xs mb-2 shadow-2xs"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.name[0]}
                    </div>
                    <div className="text-[12.5px] font-bold text-[#191411] group-hover:text-[#f50] transition-colors truncate">
                      {p.name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>

      <Footer />
    </div>
  );
}