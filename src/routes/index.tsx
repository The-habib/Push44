import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight, Zap, GitBranch, Shield, Clock, Layers, UploadCloud,
  CheckCircle2, ChevronDown, Star, Terminal, Lock
} from "lucide-react";
import { GitHubLogo } from "@/components/BrandLogos";
import appLogo from "@/assets/logo.png";
import { useApp } from "@/contexts/AppContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Push44 — Push Base44 Apps to GitHub in One Tap" },
      {
        name: "description",
        content:
          "Push44 lets you back up and version-control your Base44 app source code to GitHub in a single click. Free, open, and takes under 2 minutes to set up.",
      },
    ],
  }),
  component: LandingPage,
});

const ease = [0.25, 0.46, 0.45, 0.94] as const;

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const FEATURES = [
  {
    icon: Zap,
    color: "#dce99a",
    bg: "#f7fae8",
    title: "One-tap push",
    desc: "All 87+ source files committed to GitHub in a single click — no copy-pasting, no manual uploads, no CLI.",
  },
  {
    icon: Layers,
    color: "#a78bfa",
    bg: "#f0ebff",
    title: "GitHub Trees API",
    desc: "Uses GitHub's efficient bulk-commit Trees API so even large apps push in seconds, not minutes.",
  },
  {
    icon: UploadCloud,
    color: "#34d399",
    bg: "#f0fdf4",
    title: "Auto sandbox wake",
    desc: "Automatically wakes sleeping Base44 sandboxes before fetching files — no manual intervention needed.",
  },
  {
    icon: Clock,
    color: "#f97316",
    bg: "#fff7ed",
    title: "Full push history",
    desc: "Every push is logged with the commit hash, file count, branch, and timestamp for complete traceability.",
  },
  {
    icon: Shield,
    color: "#38bdf8",
    bg: "#f0f9ff",
    title: "Zero data stored",
    desc: "Your credentials never leave your browser. Push44 talks directly to Base44 and GitHub — no middleman server.",
  },
  {
    icon: GitBranch,
    color: "#fb7185",
    bg: "#fff1f2",
    title: "Any repo, any branch",
    desc: "Push to existing repos or create a new one on the fly. Choose your branch — main, dev, or anything else.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Connect Base44",
    desc: "Sign in with your Base44 email and password, or paste an API key. Your credentials stay in your browser only.",
    color: "#f97316",
    bg: "linear-gradient(135deg,#fff7ed,#fef3e2)",
  },
  {
    num: "02",
    title: "Select your app",
    desc: "Choose from all your Base44 projects. Push44 automatically wakes the sandbox and fetches every source file.",
    color: "#8b5cf6",
    bg: "linear-gradient(135deg,#f5f3ff,#ede9fe)",
  },
  {
    num: "03",
    title: "Push to GitHub",
    desc: "Pick a GitHub repo or create one instantly. All files are committed in a single atomic push — no partial uploads.",
    color: "#22c55e",
    bg: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
  },
];

const FAQS = [
  {
    q: "What is Push44?",
    a: "Push44 is a free web app that lets you back up your Base44 app source code to GitHub in one tap. It fetches all your app files from the Base44 sandbox and commits them to any GitHub repository using a single atomic commit.",
  },
  {
    q: "Is Push44 free to use?",
    a: "Yes, completely free. There are no subscriptions, no sign-up required, and no limits on the number of pushes. Push44 runs entirely in your browser.",
  },
  {
    q: "Is my Base44 password safe?",
    a: "Yes. Your credentials go directly from your browser to the Base44 and GitHub APIs. Push44 has no backend server — nothing is ever stored or transmitted through our infrastructure.",
  },
  {
    q: "What GitHub permissions does Push44 need?",
    a: "Push44 needs a GitHub Personal Access Token with repo and user scopes. This lets it list your repos, create new ones, and push commits. You can revoke the token at any time from your GitHub settings.",
  },
  {
    q: "Does Push44 work with private GitHub repos?",
    a: "Yes. With the correct token scopes, Push44 can push to both public and private repositories, and can create new private repos on your behalf.",
  },
  {
    q: "Can I push to an existing repository?",
    a: "Yes. You can push to any existing repository or create a brand-new one. Push44 adds all your Base44 app files in a single commit, preserving any existing repo history.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/[0.07] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-[15px] font-bold text-black leading-snug">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronDown className="h-5 w-5 text-black/30" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease }}
        className="overflow-hidden"
      >
        <p className="text-[14px] text-black/55 leading-relaxed pb-5">{a}</p>
      </motion.div>
    </div>
  );
}

function LandingPage() {
  const { creds, isLoaded } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const isConnected = isLoaded && !!(creds.base44Token && creds.githubToken);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">

      {/* ── Structured Data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebApplication",
                "@id": "https://push-44.vercel.app/#app",
                name: "Push44",
                url: "https://push-44.vercel.app",
                description: "Push your Base44 app source code to GitHub in one tap.",
                applicationCategory: "DeveloperApplication",
                operatingSystem: "Web",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                featureList: [
                  "One-tap push to GitHub",
                  "GitHub Trees API bulk commits",
                  "Auto sandbox wake-up",
                  "Push history with commit hashes",
                  "Zero server-side storage",
                  "Public and private repository support",
                ],
              },
              {
                "@type": "FAQPage",
                mainEntity: FAQS.map(({ q, a }) => ({
                  "@type": "Question",
                  name: q,
                  acceptedAnswer: { "@type": "Answer", text: a },
                })),
              },
            ],
          }),
        }}
      />

      {/* ── Nav ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.07)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={appLogo} alt="Push44 logo" className="h-9 w-9 rounded-xl object-cover" />
            <span className="text-[18px] font-extrabold tracking-tight">
              Push<span style={{ color: "#8b5cf6" }}>44</span>
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-[13px] font-semibold text-black/50">
            <a href="#how-it-works" className="hover:text-black transition-colors">How it works</a>
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
          </nav>
          <Link to={isConnected ? "/dashboard" : "/onboarding"}>
            <motion.button
              className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-bold text-black"
              style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 450, damping: 28 }}
            >
              {isConnected ? "Dashboard" : "Get Started"}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </motion.button>
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden"
        style={{ background: "linear-gradient(160deg,#0d0d1f 0%,#16213e 50%,#0f3460 100%)" }}>

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Ambient glows */}
        <motion.div className="absolute top-1/4 left-1/3 h-[500px] w-[500px] rounded-full pointer-events-none blur-[120px]"
          style={{ background: "radial-gradient(circle,#7c3aed40,transparent)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full pointer-events-none blur-[100px]"
          style={{ background: "radial-gradient(circle,#dce99a30,transparent)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} />

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 border border-white/10 bg-white/[0.07]"
          >
            <motion.span className="h-1.5 w-1.5 rounded-full bg-[#dce99a]"
              animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }} />
            <span className="text-[12px] font-bold tracking-widest uppercase text-white/60">
              Free · No sign-up · Open source
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="text-[44px] sm:text-[64px] lg:text-[76px] font-extrabold leading-[1.02] tracking-tight text-white mb-6"
          >
            Push your{" "}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg,#f97316,#fb923c)" }}>
              Base44
            </span>{" "}
            app<br className="hidden sm:block" /> to{" "}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg,#a78bfa,#dce99a)" }}>
              GitHub
            </span>
            <br className="hidden sm:block" /> in one tap.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="text-[17px] sm:text-[19px] text-white/50 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Push44 fetches all your Base44 source files and commits them to GitHub in a single atomic push. Version control your vibe-coded apps in under 2 minutes.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Link to={isConnected ? "/dashboard" : "/onboarding"}>
              <motion.button
                className="flex items-center gap-2 rounded-2xl px-7 py-4 text-[15px] font-bold text-black shadow-lg shadow-[#dce99a]/20"
                style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}
                whileHover={{ scale: 1.04, y: -2, boxShadow: "0 20px 40px rgba(220,233,154,0.35)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 26 }}
              >
                <Zap className="h-4 w-4" strokeWidth={3} />
                {isConnected ? "Open Dashboard" : "Get Started Free"}
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </motion.button>
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <motion.button
                className="flex items-center gap-2 rounded-2xl px-7 py-4 text-[15px] font-semibold text-white border border-white/15 bg-white/[0.07]"
                whileHover={{ scale: 1.03, y: -1, background: "rgba(255,255,255,0.12)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 26 }}
              >
                <GitHubLogo size={16} className="text-white" />
                View on GitHub
              </motion.button>
            </a>
          </motion.div>

          {/* Trust badge */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 text-[12px] text-white/25 font-medium"
          >
            No server. No account. Your data never leaves your browser.
          </motion.p>

          {/* Hero visual — terminal mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
            className="mt-16 max-w-2xl mx-auto"
          >
            <div className="rounded-[20px] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
              style={{ background: "rgba(15,15,30,0.95)" }}>
              {/* Window bar */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <div className="flex-1 mx-4">
                  <div className="mx-auto max-w-[200px] h-5 rounded bg-white/[0.06] flex items-center justify-center">
                    <span className="text-[10px] text-white/25 font-mono">push-44.vercel.app</span>
                  </div>
                </div>
              </div>
              {/* Terminal content */}
              <div className="p-5 sm:p-7 text-left font-mono text-[12px] sm:text-[13px] space-y-2.5">
                <TerminalLine delay={0.7} color="#8b8b9f">{"# Fetching files from Base44 sandbox…"}</TerminalLine>
                <TerminalLine delay={0.95} color="#34d399">{"✓  87 files fetched from my-saas-app"}</TerminalLine>
                <TerminalLine delay={1.2} color="#8b8b9f">{"# Creating blobs and tree on GitHub…"}</TerminalLine>
                <TerminalLine delay={1.5} color="#a78bfa">{"↑  Pushing to github.com/user/my-saas-app"}</TerminalLine>
                <TerminalLine delay={1.8} color="#dce99a">{"✓  Committed: abc123de — 87 files pushed"}</TerminalLine>
                <TerminalLine delay={2.1} color="#38bdf8">{"⚡  Done in 3.2s — view on GitHub →"}</TerminalLine>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 sm:py-32 bg-[#f9f8f4]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeUp className="text-center mb-16">
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#8b5cf6] mb-3">Simple by design</p>
            <h2 className="text-[36px] sm:text-[48px] font-extrabold tracking-tight leading-[1.08] text-black">
              From Base44 to GitHub<br />in three steps
            </h2>
            <p className="mt-4 text-[16px] text-black/45 max-w-xl mx-auto">
              No CLI. No config files. No manual uploads. Just connect, select, and push.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-3 gap-5">
            {STEPS.map(({ num, title, desc, color, bg }, i) => (
              <FadeUp key={num} delay={i * 0.1}>
                <div className="rounded-[24px] p-7 h-full" style={{ background: bg }}>
                  <div className="text-[11px] font-black tracking-[0.2em] mb-5" style={{ color }}>
                    STEP {num}
                  </div>
                  <h3 className="text-[20px] font-extrabold text-black mb-3 leading-snug">{title}</h3>
                  <p className="text-[14px] text-black/55 leading-relaxed">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* connector arrows */}
          <FadeUp delay={0.3} className="hidden sm:flex items-center justify-center gap-4 mt-10">
            {["Connect Base44", "Select app", "Push to GitHub"].map((step, i) => (
              <div key={step} className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-white border border-black/[0.07] shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#22c55e]" strokeWidth={2.5} />
                  <span className="text-[13px] font-bold text-black">{step}</span>
                </div>
                {i < 2 && <ArrowRight className="h-4 w-4 text-black/20 shrink-0" />}
              </div>
            ))}
          </FadeUp>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 sm:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeUp className="text-center mb-16">
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#f97316] mb-3">Built for developers</p>
            <h2 className="text-[36px] sm:text-[48px] font-extrabold tracking-tight leading-[1.08] text-black">
              Everything you need.<br />Nothing you don't.
            </h2>
            <p className="mt-4 text-[16px] text-black/45 max-w-xl mx-auto">
              Push44 is laser-focused on one job — getting your Base44 code into GitHub reliably and fast.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }, i) => (
              <FadeUp key={title} delay={i * 0.07}>
                <motion.div
                  className="rounded-[20px] p-6 h-full cursor-default"
                  style={{ background: bg }}
                  whileHover={{ y: -3, boxShadow: "0 16px 40px rgba(0,0,0,0.08)" }}
                  transition={{ type: "spring", stiffness: 350, damping: 26 }}
                >
                  <div className="h-11 w-11 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: `${color}30` }}>
                    <Icon className="h-5 w-5" style={{ color }} strokeWidth={2} />
                  </div>
                  <h3 className="text-[16px] font-extrabold text-black mb-2">{title}</h3>
                  <p className="text-[13px] text-black/50 leading-relaxed">{desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Push44 / comparison ── */}
      <section className="py-24 sm:py-32 bg-[#0d0d1f]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeUp className="text-center mb-16">
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#dce99a] mb-3">Why Push44</p>
            <h2 className="text-[36px] sm:text-[48px] font-extrabold tracking-tight leading-[1.08] text-white">
              Version control your<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg,#a78bfa,#dce99a)" }}>
                Base44 apps
              </span>{" "}
              properly.
            </h2>
            <p className="mt-4 text-[16px] text-white/40 max-w-xl mx-auto">
              Stop losing your work. Every push creates a permanent snapshot you can roll back to, share, or deploy.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Without */}
            <FadeUp delay={0.05}>
              <div className="rounded-[20px] p-7 border border-white/[0.06]"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 text-[12px] font-bold">✕</span>
                  </div>
                  <span className="text-[13px] font-bold text-white/40 uppercase tracking-wider">Without Push44</span>
                </div>
                {[
                  "Manually download each file one by one",
                  "Copy-paste code into a local editor",
                  "Set up git and push from the terminal",
                  "Repeat every time you make changes",
                  "No history, no rollback, no collaboration",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 mb-3.5">
                    <span className="text-red-400/70 text-[14px] mt-0.5 shrink-0">✕</span>
                    <span className="text-[13px] text-white/35 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </FadeUp>

            {/* With */}
            <FadeUp delay={0.12}>
              <div className="rounded-[20px] p-7 border border-[#dce99a]/20"
                style={{ background: "rgba(220,233,154,0.05)" }}>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-6 w-6 rounded-full bg-[#dce99a]/20 flex items-center justify-center">
                    <span className="text-[#dce99a] text-[12px] font-bold">✓</span>
                  </div>
                  <span className="text-[13px] font-bold text-[#dce99a]/60 uppercase tracking-wider">With Push44</span>
                </div>
                {[
                  "All 87+ files fetched and committed instantly",
                  "One-tap push from any device, anywhere",
                  "Full push history with commit hashes",
                  "Create new repos or push to existing ones",
                  "Proper version control — rollback anytime",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 mb-3.5">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-[13px] text-white/70 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Social proof / stats ── */}
      <section className="py-20 bg-white border-y border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: "87+", label: "Files per push" },
              { value: "< 5s", label: "Average push time" },
              { value: "100%", label: "Free forever" },
              { value: "0 bytes", label: "Data stored on servers" },
            ].map(({ value, label }) => (
              <FadeUp key={label}>
                <div>
                  <div className="text-[36px] sm:text-[42px] font-extrabold text-black tracking-tight mb-1">{value}</div>
                  <div className="text-[12px] font-semibold text-black/35 uppercase tracking-wider">{label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy callout ── */}
      <section className="py-20 sm:py-28 bg-[#f9f8f4]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <FadeUp>
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-[20px] mb-6 mx-auto"
              style={{ background: "linear-gradient(135deg,#f0ebff,#ede9fe)" }}>
              <Lock className="h-8 w-8 text-[#8b5cf6]" strokeWidth={2} />
            </div>
            <h2 className="text-[32px] sm:text-[44px] font-extrabold tracking-tight text-black mb-4 leading-tight">
              Your credentials.<br />Your browser. Full stop.
            </h2>
            <p className="text-[15px] sm:text-[17px] text-black/45 leading-relaxed max-w-2xl mx-auto mb-8">
              Push44 has no backend server. Your Base44 token and GitHub PAT are stored in your browser's localStorage and sent directly to their respective APIs. We never see them, log them, or store them anywhere.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {["No servers", "No accounts", "No tracking", "Open source"].map((tag) => (
                <span key={tag} className="rounded-full px-4 py-2 text-[13px] font-bold bg-white border border-black/[0.07] text-black/60 shadow-sm">
                  ✓ {tag}
                </span>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 sm:py-32 bg-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8">
          <FadeUp className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#22c55e] mb-3">Got questions?</p>
            <h2 className="text-[32px] sm:text-[44px] font-extrabold tracking-tight text-black leading-tight">
              Frequently asked questions
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="bg-[#f9f8f4] rounded-[24px] px-6 sm:px-8">
              {FAQS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 sm:py-32 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg,#0d0d1f 0%,#16213e 60%,#0f3460 100%)" }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 100%,#7c3aed30,transparent 70%)" }} />

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-1.5 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-[#dce99a] text-[#dce99a]" />
              ))}
            </div>
            <h2 className="text-[36px] sm:text-[56px] font-extrabold tracking-tight leading-[1.05] text-white mb-5">
              Start version-controlling<br />your Base44 apps today.
            </h2>
            <p className="text-[16px] sm:text-[18px] text-white/45 max-w-xl mx-auto mb-10 leading-relaxed">
              Free forever. No sign-up. Takes 2 minutes to connect and you're pushing code to GitHub immediately.
            </p>
            <Link to={isConnected ? "/dashboard" : "/onboarding"}>
              <motion.button
                className="inline-flex items-center gap-2.5 rounded-2xl px-8 py-4.5 text-[16px] font-bold text-black shadow-xl shadow-[#dce99a]/20"
                style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)", paddingTop: "1rem", paddingBottom: "1rem" }}
                whileHover={{ scale: 1.05, y: -3, boxShadow: "0 24px 60px rgba(220,233,154,0.40)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 380, damping: 24 }}
              >
                <Zap className="h-5 w-5" strokeWidth={3} />
                {isConnected ? "Open Dashboard" : "Get Started Free"}
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </motion.button>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0a0a18] py-10 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={appLogo} alt="Push44" className="h-7 w-7 rounded-lg object-cover" />
            <span className="text-[15px] font-extrabold text-white tracking-tight">
              Push<span style={{ color: "#8b5cf6" }}>44</span>
            </span>
          </div>
          <p className="text-[12px] text-white/20 font-medium text-center sm:text-right">
            Free · Open Source · No servers · Built for Base44 developers
          </p>
          <div className="flex items-center gap-4 text-[12px] font-semibold text-white/25">
            <Link to="/onboarding" className="hover:text-white/60 transition-colors">Get Started</Link>
            <span className="h-3 w-px bg-white/10" />
            <a href="#faq" className="hover:text-white/60 transition-colors">FAQ</a>
            <span className="h-3 w-px bg-white/10" />
            <a href="#how-it-works" className="hover:text-white/60 transition-colors">How it works</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TerminalLine({ delay, color, children }: { delay: number; color: string; children: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease }}
      className="flex items-center gap-2"
    >
      <Terminal className="h-3 w-3 shrink-0" style={{ color: "rgba(139,139,159,0.5)" }} />
      <span style={{ color }}>{children}</span>
    </motion.div>
  );
}
