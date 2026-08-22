import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  Clock, ChevronRight, CheckCircle2, AlertTriangle, Share2,
  Copy, Check, ArrowRight, Sparkles, BookOpen, Layers, Terminal
} from "lucide-react";
import { toast } from "sonner";
import {
  getArticle, getRelatedArticles, PLATFORMS, PLATFORM_META, type Article,
} from "@/seo/data";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PlatformLogo } from "@/components/BrandLogos";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) return { meta: [{ title: "Not Found — Push44" }] };
    return {
      meta: [
        { title: `${article.title} — Push44` },
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 bg-[#faf8f5]">
      <h1 className="text-6xl font-extrabold text-[#191411] mb-3 tracking-tight">404</h1>
      <p className="text-lg text-[#544e47] mb-6">Article not found in the Push44 library.</p>
      <Link to="/blog" className="px-5 py-2.5 bg-[#f50] hover:bg-[#e64d00] text-white font-bold rounded-xl shadow-xs transition-colors">
        &larr; Back to Guides
      </Link>
    </div>
  ),
});

const DIFFICULTY_STYLE: Record<string, string> = {
  beginner:     "bg-emerald-50 text-emerald-800 border-emerald-200",
  intermediate: "bg-amber-50 text-amber-800 border-amber-200",
  advanced:     "bg-rose-50 text-rose-800 border-rose-200",
};

export default function ArticlePage() {
  const { article } = Route.useLoaderData();
  const [activeSection, setActiveSection] = useState("introduction");
  const [copied, setCopied] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (latest) => {
      setReadProgress(Math.round(latest * 100));
    });
    return () => unsub();
  }, [scrollYProgress]);

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
    { id: "faq", label: "Frequently Asked Questions" },
    relatedArticles.length > 0 && { id: "related", label: "Related Guides" },
  ].filter(Boolean) as Array<{ id: string; label: string }>;

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.2, rootMargin: "-100px 0px -40% 0px" }
    );
    toc.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.slug]);

  const copyPageUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Guide link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[100dvh] bg-[#faf8f5] text-[#191411] font-sans selection:bg-[#f50]/20">
      {/* Reading Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-[#f50] origin-left z-50 shadow-xs"
        style={{ scaleX }}
      />

      <Navbar />

      {/* ── ARTICLE HEADER ──────────────────────────────────────────────── */}
      <header className="relative pt-32 pb-16 px-6 border-b border-[#e7e2db] bg-gradient-to-b from-[#fff8f3] via-[#faf8f5] to-[#faf8f5] overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[260px] bg-gradient-to-b from-[#f50]/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-4xl mx-auto z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[13px] font-medium text-[#8c857b] mb-8 flex-wrap">
            <Link to="/" className="hover:text-[#191411] transition-colors">Push44</Link>
            <ChevronRight size={12} className="text-[#cfc8bd]" />
            <Link to="/blog/" className="hover:text-[#191411] transition-colors">Blog</Link>
            {article.platform !== "general" && platformData && (
              <>
                <ChevronRight size={12} className="text-[#cfc8bd]" />
                <Link to="/platforms/$platform" params={{ platform: article.platform }} className="hover:text-[#191411] transition-colors">
                  {platformData.name}
                </Link>
              </>
            )}
            <ChevronRight size={12} className="text-[#cfc8bd]" />
            <span className="text-[#191411] font-semibold truncate max-w-[280px]">{article.h1}</span>
          </nav>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap mb-5">
            {article.platform !== "general" && (
              <span
                className="inline-flex items-center gap-1.5 text-[11.5px] font-bold px-3 py-1 rounded-full"
                style={{ color: pm.color, backgroundColor: pm.bgColor, border: `1px solid ${pm.color}30` }}
              >
                <PlatformLogo platform={article.platform} size={14} className="shrink-0" />
                {pm.name}
              </span>
            )}
            <span className={`text-[11.5px] font-semibold px-3 py-1 rounded-full border capitalize ${DIFFICULTY_STYLE[article.difficulty] || DIFFICULTY_STYLE.beginner}`}>
              {article.difficulty}
            </span>
            <span className="text-[11.5px] font-semibold text-[#8c857b] uppercase tracking-wider bg-[#f3efe9] px-3 py-1 rounded-full">
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191411] tracking-tight leading-[1.15] mb-5">
            {article.h1}
          </h1>

          <p className="text-lg sm:text-xl text-[#544e47] leading-relaxed mb-8 max-w-3xl">
            {article.intro}
          </p>

          {/* Metadata & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#e7e2db] text-[13px] text-[#8c857b]">
            <div className="flex items-center gap-5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Clock size={14} className="text-[#8c857b]" /> {article.readTime} min read
              </span>
              <span>Updated {article.updatedAt}</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
                Verified Working
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyPageUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#f3efe9] border border-[#e7e2db] text-[#191411] text-[12.5px] font-bold transition-all shadow-2xs cursor-pointer"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy Link"}
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.h1)}&url=${encodeURIComponent(`https://push44.vercel.app/blog/${article.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#f3efe9] border border-[#e7e2db] text-[#191411] text-[12.5px] font-bold transition-all shadow-2xs"
              >
                <Share2 size={13} />
                Share on X
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ── CONTENT AREA ────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 items-start">
        {/* Main Article Body */}
        <main className="w-full lg:flex-1 min-w-0 space-y-12">
          
          {/* Quick Answer Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <div className="text-[13px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
                  TL;DR / Quick Solution
                </div>
                <p className="text-[15px] text-emerald-950 font-medium leading-relaxed m-0">
                  {article.solution}
                </p>
              </div>
            </div>
          </div>

          {/* Introduction */}
          <section id="introduction" className="scroll-mt-24 space-y-4">
            <h2 className="text-2xl font-extrabold text-[#191411] tracking-tight flex items-center gap-2">
              <BookOpen size={20} className="text-[#f50]" />
              Introduction
            </h2>
            <p className="text-[16px] text-[#544e47] leading-relaxed">
              {article.intro}
            </p>
          </section>

          {/* Problem */}
          <section id="the-problem" className="scroll-mt-24 space-y-4">
            <h2 className="text-2xl font-extrabold text-[#191411] tracking-tight">
              The Problem with Walled Gardens
            </h2>
            <p className="text-[16px] text-[#544e47] leading-relaxed">
              {article.problem}
            </p>
          </section>

          {/* Solution */}
          <section id="the-solution" className="scroll-mt-24 space-y-4">
            <h2 className="text-2xl font-extrabold text-[#191411] tracking-tight">
              The Push44 Solution
            </h2>
            <p className="text-[16px] text-[#544e47] leading-relaxed">
              {article.solution}
            </p>
          </section>

          {/* Step by step */}
          <section id="step-by-step" className="scroll-mt-24 space-y-6">
            <div className="flex items-center justify-between border-b border-[#e7e2db] pb-4">
              <h2 className="text-2xl font-extrabold text-[#191411] tracking-tight">
                Step-by-Step Walkthrough
              </h2>
              <span className="text-[12px] font-bold text-[#8c857b] uppercase tracking-wider bg-[#f3efe9] px-3 py-1 rounded-full">
                {article.steps.length} Steps
              </span>
            </div>

            <div className="space-y-6">
              {article.steps.map((step: { title: string; content: string; tip?: string }, i: number) => (
                <div key={i} className="bg-white border border-[#e7e2db] rounded-2xl p-6 shadow-2xs space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-[#f50] text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[17px] font-bold text-[#191411] tracking-tight mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[15px] text-[#544e47] leading-relaxed">
                        {step.content}
                      </p>
                    </div>
                  </div>

                  {step.tip && (
                    <div className="bg-[#fff8f3] border border-[#fed7aa] rounded-xl p-4 ml-12">
                      <div className="text-[12px] font-bold text-[#f50] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Sparkles size={12} /> Expert Tip
                      </div>
                      <p className="text-[13.5px] text-[#9a3412] leading-relaxed m-0">
                        {step.tip}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Pro Tips */}
          {article.tips.length > 0 && (
            <section id="tips" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-extrabold text-[#191411] tracking-tight">
                Pro Recommendations
              </h2>
              <div className="grid gap-3">
                {article.tips.map((tip: string, i: number) => (
                  <div key={i} className="flex items-start gap-3.5 bg-white border border-[#e7e2db] rounded-xl p-4 shadow-2xs">
                    <CheckCircle2 size={16} className="text-[#f50] shrink-0 mt-0.5" />
                    <p className="text-[14.5px] text-[#544e47] leading-relaxed m-0">{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Mistakes */}
          {article.mistakes.length > 0 && (
            <section id="mistakes" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-extrabold text-[#191411] tracking-tight">
                Common Pitfalls to Avoid
              </h2>
              <div className="grid gap-3">
                {article.mistakes.map((m: string, i: number) => (
                  <div key={i} className="flex items-start gap-3.5 bg-rose-50/70 border border-rose-200 rounded-xl p-4">
                    <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-[14.5px] text-rose-950 leading-relaxed m-0 font-medium">{m}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQ */}
          <section id="faq" className="scroll-mt-24 space-y-4">
            <h2 className="text-2xl font-extrabold text-[#191411] tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="bg-white border border-[#e7e2db] rounded-2xl divide-y divide-[#f3efe9] shadow-2xs overflow-hidden">
              {article.faqs.map((faq: { question: string; answer: string }, i: number) => (
                <div key={i} className="p-6 space-y-2">
                  <h3 className="text-[16px] font-bold text-[#191411] tracking-tight flex items-center justify-between">
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-[14.5px] text-[#544e47] leading-relaxed m-0">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Was This Helpful Feedback Widget */}
          <div className="bg-white border border-[#e7e2db] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xs">
            <div className="text-[16px] font-extrabold text-[#191411] tracking-tight">
              Was this guide helpful for your project?
            </div>
            <p className="text-[13.5px] text-[#544e47] max-w-md mx-auto">
              Your feedback helps us continuously update our reverse-engineered guides as platforms evolve.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => toast.success("Thank you! Glad this guide helped your workflow.")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f3efe9] hover:bg-[#eae4dc] text-[#191411] font-bold text-[13.5px] rounded-xl transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
              >
                👍 Yes, exactly what I needed
              </button>
              <button
                onClick={() => toast.info("Feedback noted! Feel free to open an issue on GitHub if steps need updating.")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#faf8f5] hover:bg-[#f3efe9] border border-[#e7e2db] text-[#544e47] font-medium text-[13.5px] rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                👎 Needs improvement
              </button>
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-[#191411] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#f50]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4 max-w-xl">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-stone-300 text-[11px] font-bold uppercase tracking-wider">
                100% Free · Zero Backend · Client-Side
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Export and push your code in seconds.
              </h3>
              <p className="text-[15px] text-stone-400 leading-relaxed">
                Connect your platform, preview changes in a visual diff inspector, and create atomic commits on GitHub without server intermediate copies.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/onboarding"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#f50] hover:bg-[#e64d00] text-white font-bold text-[14px] rounded-xl shadow-md transition-colors"
                >
                  Start Exporting Now <ArrowRight size={15} />
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-[14px] rounded-xl transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section id="related" className="scroll-mt-24 space-y-6 pt-6 border-t border-[#e7e2db]">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-[#191411] tracking-tight">
                  Related Guides & Tutorials
                </h2>
                <Link to="/blog" className="text-[13px] font-bold text-[#f50] hover:underline">
                  View all &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedArticles.map((a, i) => (
                  <ArticleCard key={a.slug} article={a} index={i} />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Sidebar Table of Contents */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-24 space-y-6">
          <div className="bg-white border border-[#e7e2db] rounded-2xl p-5 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#8c857b] mb-3 pb-2 border-b border-[#f3efe9] flex items-center justify-between">
              <span>Table of Contents</span>
              <span className="text-[10px] text-[#f50] font-bold">{Math.round(readProgress)}% Read</span>
            </div>
            <nav className="space-y-1">
              {toc.map(({ id, label }) => {
                const isActive = activeSection === id;
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`block text-[13px] py-1.5 px-3 rounded-lg transition-all ${
                      isActive
                        ? "font-bold text-[#f50] bg-[#fff8f3] border-l-2 border-[#f50]"
                        : "font-medium text-[#544e47] hover:text-[#191411] hover:bg-[#faf8f5]"
                    }`}
                  >
                    {label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Quick share card */}
          <div className="bg-[#f3efe9]/70 border border-[#e7e2db] rounded-2xl p-5 space-y-3">
            <div className="text-[13px] font-bold text-[#191411]">
              Share this knowledge
            </div>
            <p className="text-[12px] text-[#544e47] leading-relaxed">
              Help other AI builders get their code out of walled gardens.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={copyPageUrl}
                className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-[#faf8f5] border border-[#e7e2db] rounded-xl text-[12.5px] font-bold text-[#191411] shadow-2xs transition-colors cursor-pointer"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                {copied ? "Link Copied!" : "Copy Guide Link"}
              </button>
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
