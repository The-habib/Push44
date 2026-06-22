import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import {
  ArrowRight, Zap, GitBranch, Shield, Clock, Layers, UploadCloud,
  CheckCircle2, ChevronDown, Star, Terminal, Lock, Menu, X,
  FileCode2, GitCommit, Package, Boxes
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
const spring = { type: "spring", stiffness: 360, damping: 28 } as const;

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const FEATURES = [
  { icon: Zap, color: "#dce99a", bg: "#f7fae8", title: "One-tap push", desc: "All 87+ source files committed to GitHub in a single click — no copy-pasting, no manual uploads, no CLI." },
  { icon: Layers, color: "#a78bfa", bg: "#f0ebff", title: "GitHub Trees API", desc: "Uses GitHub's efficient bulk-commit Trees API so even large apps push in seconds, not minutes." },
  { icon: UploadCloud, color: "#34d399", bg: "#f0fdf4", title: "Auto sandbox wake", desc: "Automatically wakes sleeping Base44 sandboxes before fetching files — no manual intervention needed." },
  { icon: Clock, color: "#f97316", bg: "#fff7ed", title: "Full push history", desc: "Every push is logged with the commit hash, file count, branch, and timestamp for complete traceability." },
  { icon: Shield, color: "#38bdf8", bg: "#f0f9ff", title: "Zero data stored", desc: "Your credentials never leave your browser. Push44 talks directly to Base44 and GitHub — no middleman server." },
  { icon: GitBranch, color: "#fb7185", bg: "#fff1f2", title: "Any repo, any branch", desc: "Push to existing repos or create a new one on the fly. Choose your branch — main, dev, or anything else." },
];

const STEPS = [
  { num: "01", title: "Connect Base44", desc: "Sign in with your Base44 email and password, or paste an API key. Your credentials stay in your browser only.", color: "#f97316", icon: Boxes },
  { num: "02", title: "Select your app", desc: "Choose from all your Base44 projects. Push44 automatically wakes the sandbox and fetches every source file.", color: "#8b5cf6", icon: Package },
  { num: "03", title: "Push to GitHub", desc: "Pick a GitHub repo or create one instantly. All files are committed in a single atomic push — no partial uploads.", color: "#22c55e", icon: GitCommit },
];

const FAQS = [
  { q: "What is Push44?", a: "Push44 is a free web app that lets you back up your Base44 app source code to GitHub in one tap. It fetches all your app files from the Base44 sandbox and commits them to any GitHub repository using a single atomic commit." },
  { q: "Is Push44 free to use?", a: "Yes, completely free. There are no subscriptions, no sign-up required, and no limits on the number of pushes. Push44 runs entirely in your browser." },
  { q: "Is my Base44 password safe?", a: "Yes. Your credentials go directly from your browser to the Base44 and GitHub APIs. Push44 has no backend server — nothing is ever stored or transmitted through our infrastructure." },
  { q: "What GitHub permissions does Push44 need?", a: "Push44 needs a GitHub Personal Access Token with repo and user scopes. This lets it list your repos, create new ones, and push commits. You can revoke the token at any time from your GitHub settings." },
  { q: "Does Push44 work with private GitHub repos?", a: "Yes. With the correct token scopes, Push44 can push to both public and private repositories, and can create new private repos on your behalf." },
  { q: "Can I push to an existing repository?", a: "Yes. You can push to any existing repository or create a brand-new one. Push44 adds all your Base44 app files in a single commit, preserving any existing repo history." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/[0.07] last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 py-5 text-left group">
        <span className="text-[15px] font-bold text-black leading-snug group-hover:text-[#8b5cf6] transition-colors">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }} className="shrink-0">
          <ChevronDown className="h-5 w-5 text-black/30" />
        </motion.div>
      </button>
      <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.25, ease }} className="overflow-hidden">
        <p className="text-[14px] text-black/55 leading-relaxed pb-5">{a}</p>
      </motion.div>
    </div>
  );
}

/* ── Floating pill header ─────────────────────────── */
function FloatingHeader({ isConnected }: { isConnected: boolean }) {
  const [visible, setVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // animate in after a short delay on mount
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  const navLinks = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <>
      {/* Desktop floating pill */}
      <motion.header
        className="fixed top-5 left-0 right-0 z-50 flex justify-center pointer-events-none"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -24 }}
        transition={{ duration: 0.55, ease }}
      >
        <div
          className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.05)] px-2 py-2"
          style={{ background: "rgba(13,13,31,0.82)", backdropFilter: "blur(20px)" }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 px-3 py-1.5">
            <motion.img src={appLogo} alt="Push44" className="h-7 w-7 rounded-lg object-cover" whileHover={{ scale: 1.08 }} transition={spring} />
            <span className="text-[15px] font-extrabold tracking-tight text-white">
              Push<span style={{ color: "#a78bfa" }}>44</span>
            </span>
          </Link>

          {/* Divider */}
          <span className="hidden sm:block h-5 w-px bg-white/10 mx-1" />

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-0.5">
            {navLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold text-white/50 hover:text-white hover:bg-white/[0.08] transition-all duration-150"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Divider */}
          <span className="hidden sm:block h-5 w-px bg-white/10 mx-1" />

          {/* CTA */}
          <Link to={isConnected ? "/dashboard" : "/onboarding"}>
            <motion.button
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-black"
              style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
            >
              <Zap className="h-3.5 w-3.5" strokeWidth={2.8} />
              {isConnected ? "Dashboard" : "Get Started"}
            </motion.button>
          </Link>

          {/* Mobile menu button */}
          <button
            className="sm:hidden ml-1 h-9 w-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed top-20 left-4 right-4 z-40 rounded-2xl border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.4)] p-3 space-y-1"
            style={{ background: "rgba(13,13,31,0.95)", backdropFilter: "blur(20px)" }}
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease }}
          >
            {navLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-semibold text-white/60 hover:text-white hover:bg-white/[0.07] transition-all"
              >
                {label}
              </a>
            ))}
            <div className="pt-2 border-t border-white/[0.07]">
              <Link to={isConnected ? "/dashboard" : "/onboarding"} onClick={() => setMobileOpen(false)}>
                <button className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[14px] font-bold text-black" style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}>
                  <Zap className="h-4 w-4" strokeWidth={2.8} />
                  {isConnected ? "Open Dashboard" : "Get Started Free"}
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Animated terminal line ─────────────────────────── */
function TerminalLine({ delay, color, children, prefix = "›" }: { delay: number; color: string; children: string; prefix?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease }}
      className="flex items-center gap-2.5"
    >
      <span className="text-[10px]" style={{ color: "rgba(139,139,159,0.5)" }}>{prefix}</span>
      <span className="font-mono text-[12px] sm:text-[13px]" style={{ color }}>{children}</span>
    </motion.div>
  );
}

/* ── Floating stat badge ─────────────────────────── */
function FloatingBadge({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute pointer-events-none rounded-2xl border border-white/10 px-3.5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}
      style={{ background: "rgba(18,18,36,0.9)", backdropFilter: "blur(12px)" }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/* ── Main component ─────────────────────────── */
function LandingPage() {
  const { creds, isLoaded } = useApp();
  const heroRef = useRef<HTMLElement>(null);
  const isConnected = isLoaded && !!(creds.base44Token && creds.githubToken);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

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
                featureList: ["One-tap push to GitHub", "GitHub Trees API bulk commits", "Auto sandbox wake-up", "Push history with commit hashes", "Zero server-side storage", "Public and private repository support"],
              },
              {
                "@type": "FAQPage",
                mainEntity: FAQS.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
              },
            ],
          }),
        }}
      />

      <FloatingHeader isConnected={isConnected} />

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(160deg,#080818 0%,#0f0f2e 40%,#0a1628 70%,#0d1f3c 100%)" }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Glow blobs */}
        <motion.div className="absolute top-[10%] left-[15%] h-[600px] w-[600px] rounded-full pointer-events-none blur-[140px]"
          style={{ background: "radial-gradient(circle,#6d28d935,transparent)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-[10%] right-[10%] h-[500px] w-[500px] rounded-full pointer-events-none blur-[120px]"
          style={{ background: "radial-gradient(circle,#0ea5e928,transparent)" }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }} />
        <motion.div className="absolute top-[40%] right-[20%] h-[300px] w-[300px] rounded-full pointer-events-none blur-[80px]"
          style={{ background: "radial-gradient(circle,#dce99a22,transparent)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

            {/* Left — copy */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-7 border border-white/[0.12] bg-white/[0.05]"
              >
                <motion.span className="h-2 w-2 rounded-full bg-[#dce99a]"
                  animate={{ scale: [1, 1.8, 1], opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }} />
                <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/50">
                  Free · No sign-up · Works instantly
                </span>
              </motion.div>

              {/* H1 */}
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.18, ease }}
                className="text-[46px] sm:text-[58px] lg:text-[66px] font-extrabold leading-[1.02] tracking-tight text-white mb-5"
              >
                Push{" "}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#f97316,#fb923c,#fdba74)" }}>
                    Base44
                  </span>
                </span>{" "}
                apps<br />
                to{" "}
                <span className="relative">
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#a78bfa,#8b5cf6,#7c3aed)" }}>
                    GitHub
                  </span>
                  <motion.span
                    className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full"
                    style={{ background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.8, ease }}
                  />
                </span>{" "}
                in one tap.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.28, ease }}
                className="text-[16px] sm:text-[18px] text-white/45 max-w-lg mx-auto lg:mx-0 leading-relaxed mb-9"
              >
                Push44 fetches all your Base44 source files and commits them to any GitHub repo in a single atomic push. Version-control your vibe-coded apps in under 2 minutes.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.36, ease }}
                className="flex flex-wrap items-center gap-3 justify-center lg:justify-start"
              >
                <Link to={isConnected ? "/dashboard" : "/onboarding"}>
                  <motion.button
                    className="flex items-center gap-2 rounded-2xl px-7 py-3.5 text-[15px] font-bold text-black shadow-lg"
                    style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)", boxShadow: "0 0 0 1px rgba(220,233,154,0.3), 0 16px 40px rgba(220,233,154,0.25)" }}
                    whileHover={{ scale: 1.04, y: -2, boxShadow: "0 0 0 1px rgba(220,233,154,0.5), 0 24px 50px rgba(220,233,154,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={spring}
                  >
                    <Zap className="h-4 w-4" strokeWidth={3} />
                    {isConnected ? "Open Dashboard" : "Get Started Free"}
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </motion.button>
                </Link>
                <a href="#how-it-works">
                  <motion.button
                    className="flex items-center gap-2 rounded-2xl px-7 py-3.5 text-[15px] font-semibold text-white/70 border border-white/[0.12] bg-white/[0.04]"
                    whileHover={{ scale: 1.03, y: -1, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.9)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={spring}
                  >
                    See how it works
                  </motion.button>
                </a>
              </motion.div>

              {/* Mini stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="flex flex-wrap items-center gap-5 mt-9 justify-center lg:justify-start"
              >
                {[
                  { val: "87+", label: "files per push" },
                  { val: "<5s", label: "average time" },
                  { val: "100%", label: "free forever" },
                ].map(({ val, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-[22px] font-extrabold text-white tracking-tight">{val}</span>
                    <span className="text-[12px] font-medium text-white/30 leading-tight">{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — terminal mockup with floating badges */}
            <div className="flex-1 w-full max-w-lg relative">
              {/* Floating badges */}
              <FloatingBadge delay={1.2} className="top-0 -left-8 hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#f97316]/15 flex items-center justify-center">
                    <FileCode2 className="h-3.5 w-3.5 text-[#f97316]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold text-white">87 files</div>
                    <div className="text-[9px] text-white/35 font-medium">fetched from Base44</div>
                  </div>
                </div>
              </FloatingBadge>

              <FloatingBadge delay={1.45} className="-bottom-4 -right-6 hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#22c55e]/15 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold text-white">Push complete</div>
                    <div className="text-[9px] text-white/35 font-medium">committed in 3.2s</div>
                  </div>
                </div>
              </FloatingBadge>

              <FloatingBadge delay={1.6} className="top-1/2 -right-10 -translate-y-1/2 hidden lg:block">
                <div className="flex items-center gap-2">
                  <GitHubLogo size={16} className="text-white/60" />
                  <div className="text-[11px] font-extrabold text-white">abc12ef3</div>
                </div>
              </FloatingBadge>

              {/* Terminal card */}
              <motion.div
                initial={{ opacity: 0, y: 28, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.75, delay: 0.5, ease }}
                className="relative rounded-[22px] overflow-hidden"
                style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)" }}
              >
                {/* Glow behind terminal */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(109,40,217,0.25), transparent 70%)" }} />

                {/* Window chrome */}
                <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.07]"
                  style={{ background: "rgba(12,12,28,0.98)" }}>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-2 rounded-lg bg-white/[0.05] border border-white/[0.07] px-4 py-1.5 min-w-[180px]">
                      <div className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
                      <span className="text-[11px] font-mono text-white/30">push-44.vercel.app</span>
                    </div>
                  </div>
                  <Terminal className="h-3.5 w-3.5 text-white/20" />
                </div>

                {/* Terminal body */}
                <div className="p-6 sm:p-8 space-y-3 min-h-[220px]"
                  style={{ background: "rgba(8,8,24,0.97)" }}>
                  <TerminalLine delay={0.9} color="#636380" prefix="$">{"push44 --app my-saas-app"}</TerminalLine>
                  <TerminalLine delay={1.15} color="#8b8b9f" prefix=" ">{"Waking Base44 sandbox…"}</TerminalLine>
                  <TerminalLine delay={1.4} color="#34d399" prefix="✓">{"Sandbox alive · Fetching files"}</TerminalLine>
                  <TerminalLine delay={1.7} color="#8b8b9f" prefix=" ">{"87 files ready · Creating blobs"}</TerminalLine>
                  <TerminalLine delay={2.0} color="#a78bfa" prefix="↑">{"Pushing → github.com/you/my-saas-app"}</TerminalLine>
                  <TerminalLine delay={2.35} color="#dce99a" prefix="✓">{"Committed abc12ef3 · 87 files · 3.2s"}</TerminalLine>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.7 }}
                    className="flex items-center gap-3 mt-5 pt-4 border-t border-white/[0.06]"
                  >
                    <div className="flex items-center gap-2 rounded-lg bg-[#dce99a]/10 border border-[#dce99a]/20 px-3 py-2">
                      <Zap className="h-3.5 w-3.5 text-[#dce99a]" strokeWidth={2.5} />
                      <span className="text-[12px] font-bold text-[#dce99a]">Push successful</span>
                    </div>
                    <span className="text-[11px] text-white/20 font-mono">View on GitHub →</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 0.6 }}
        >
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/20">Scroll</span>
          <motion.div className="h-8 w-px bg-gradient-to-b from-white/20 to-transparent"
            animate={{ scaleY: [0, 1, 0], originY: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
        </motion.div>
      </section>

      {/* ── Marquee / trust bar ── */}
      <div className="py-5 border-y border-black/[0.06] overflow-hidden bg-[#fafaf8]">
        <motion.div
          className="flex items-center gap-12 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(2)].map((_, j) => (
            <div key={j} className="flex items-center gap-12">
              {["One-tap push", "87+ files committed", "GitHub Trees API", "Auto sandbox wake", "Push history", "Zero data stored", "Any branch", "Free forever"].map((t) => (
                <span key={t} className="flex items-center gap-2.5 text-[12px] font-bold text-black/30 uppercase tracking-widest shrink-0">
                  <span className="h-1 w-1 rounded-full bg-[#8b5cf6]" />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 sm:py-36 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeUp className="text-center mb-20">
            <span className="inline-block text-[11px] font-bold tracking-[0.15em] uppercase text-[#8b5cf6] bg-[#f0ebff] rounded-full px-4 py-1.5 mb-5">Simple by design</span>
            <h2 className="text-[36px] sm:text-[52px] font-extrabold tracking-tight leading-[1.06] text-black mb-4">
              From Base44 to GitHub<br />in three steps
            </h2>
            <p className="text-[16px] text-black/40 max-w-lg mx-auto leading-relaxed">
              No CLI. No config. No copy-paste. Just connect, select, and push.
            </p>
          </FadeUp>

          {/* Steps with connecting line */}
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/[0.07] to-transparent hidden sm:block" />

            <div className="grid sm:grid-cols-3 gap-6 relative">
              {STEPS.map(({ num, title, desc, color, icon: Icon }, i) => (
                <FadeUp key={num} delay={i * 0.12}>
                  <div className="relative group">
                    {/* Step number circle */}
                    <div className="relative z-10 flex flex-col items-start sm:items-center sm:text-center">
                      <motion.div
                        className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 text-white font-black text-[13px] shadow-lg"
                        style={{ background: `linear-gradient(135deg,${color},${color}cc)`, boxShadow: `0 8px 24px ${color}40` }}
                        whileHover={{ scale: 1.08, y: -2 }}
                        transition={spring}
                      >
                        <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                      </motion.div>
                      <div className="text-[10px] font-black tracking-[0.2em] mb-2" style={{ color }}>STEP {num}</div>
                      <h3 className="text-[20px] font-extrabold text-black mb-3">{title}</h3>
                      <p className="text-[14px] text-black/50 leading-relaxed max-w-xs">{desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* Flow indicator */}
          <FadeUp delay={0.4} className="mt-16 flex items-center justify-center">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {["Connect Base44", "Select your app", "Push to GitHub"].map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-black/[0.07] bg-[#fafaf8] px-4 py-2 shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e]" strokeWidth={2.5} />
                    <span className="text-[13px] font-bold text-black">{s}</span>
                  </div>
                  {i < 2 && <ArrowRight className="h-4 w-4 text-black/20 hidden sm:block" />}
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 sm:py-36 bg-[#f9f8f4]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeUp className="text-center mb-20">
            <span className="inline-block text-[11px] font-bold tracking-[0.15em] uppercase text-[#f97316] bg-[#fff7ed] rounded-full px-4 py-1.5 mb-5">Built for developers</span>
            <h2 className="text-[36px] sm:text-[52px] font-extrabold tracking-tight leading-[1.06] text-black mb-4">
              Everything you need.<br />Nothing you don't.
            </h2>
            <p className="text-[16px] text-black/40 max-w-lg mx-auto leading-relaxed">
              Push44 is laser-focused on one job — getting your Base44 code into GitHub reliably, fast, and securely.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }, i) => (
              <FadeUp key={title} delay={i * 0.06}>
                <motion.div
                  className="rounded-[20px] p-7 h-full border border-transparent hover:border-black/[0.06] transition-colors cursor-default"
                  style={{ background: bg }}
                  whileHover={{ y: -4, boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }}
                  transition={spring}
                >
                  <motion.div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: `${color}28` }}
                    whileHover={{ scale: 1.1 }}
                    transition={spring}
                  >
                    <Icon className="h-5 w-5" style={{ color }} strokeWidth={2} />
                  </motion.div>
                  <h3 className="text-[16px] font-extrabold text-black mb-2">{title}</h3>
                  <p className="text-[13px] text-black/45 leading-relaxed">{desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Push44 / comparison ── */}
      <section className="py-24 sm:py-36 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg,#080818 0%,#0f0f2e 50%,#0a1628 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8">
          <FadeUp className="text-center mb-20">
            <span className="inline-block text-[11px] font-bold tracking-[0.15em] uppercase text-[#dce99a] bg-[#dce99a]/10 rounded-full px-4 py-1.5 mb-5">Why Push44</span>
            <h2 className="text-[36px] sm:text-[52px] font-extrabold tracking-tight leading-[1.06] text-white mb-4">
              Stop losing your work.
            </h2>
            <p className="text-[16px] text-white/35 max-w-lg mx-auto leading-relaxed">
              Every Base44 app deserves proper version control. Push44 makes it effortless.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            <FadeUp delay={0.06}>
              <div className="rounded-[22px] p-8 border border-white/[0.07]" style={{ background: "rgba(255,60,60,0.04)" }}>
                <div className="flex items-center gap-2.5 mb-7">
                  <div className="h-7 w-7 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                    <X className="h-3.5 w-3.5 text-red-400" />
                  </div>
                  <span className="text-[12px] font-bold text-white/30 uppercase tracking-wider">Without Push44</span>
                </div>
                {["Manually download files one-by-one", "Copy-paste code into a local editor", "Set up git and push from terminal", "Repeat the whole process each time", "No history, no rollback, no backup"].map((item) => (
                  <div key={item} className="flex items-start gap-3 mb-4">
                    <span className="text-red-500/50 text-[14px] shrink-0 mt-0.5">✕</span>
                    <span className="text-[13px] text-white/30 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.14}>
              <div className="rounded-[22px] p-8 border border-[#dce99a]/15 relative overflow-hidden" style={{ background: "rgba(220,233,154,0.04)" }}>
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] pointer-events-none" style={{ background: "rgba(220,233,154,0.08)" }} />
                <div className="flex items-center gap-2.5 mb-7">
                  <div className="h-7 w-7 rounded-full bg-[#dce99a]/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#dce99a]" strokeWidth={2.5} />
                  </div>
                  <span className="text-[12px] font-bold text-[#dce99a]/50 uppercase tracking-wider">With Push44</span>
                </div>
                {["All 87+ files fetched and committed instantly", "One tap from any device, anywhere", "Full push history with commit hashes", "Push again anytime in seconds", "Proper version control — rollback anytime"].map((item) => (
                  <div key={item} className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-[13px] text-white/70 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 sm:py-20 bg-white border-b border-black/[0.05]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 text-center">
            {[
              { value: "87+", label: "Files per push", color: "#f97316" },
              { value: "< 5s", label: "Average push time", color: "#8b5cf6" },
              { value: "100%", label: "Free forever", color: "#22c55e" },
              { value: "0 bytes", label: "Stored on servers", color: "#38bdf8" },
            ].map(({ value, label, color }, i) => (
              <FadeUp key={label} delay={i * 0.07}>
                <div>
                  <div className="text-[34px] sm:text-[42px] font-extrabold tracking-tight mb-1" style={{ color }}>{value}</div>
                  <div className="text-[11px] font-bold text-black/30 uppercase tracking-wider">{label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy ── */}
      <section className="py-20 sm:py-28 bg-[#f9f8f4]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <FadeUp>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-[22px] mb-7 mx-auto"
                style={{ background: "linear-gradient(135deg,#f0ebff,#ede9fe)", boxShadow: "0 8px 24px rgba(139,92,246,0.15)" }}>
                <Lock className="h-8 w-8 text-[#8b5cf6]" strokeWidth={1.8} />
              </div>
              <h2 className="text-[30px] sm:text-[44px] font-extrabold tracking-tight text-black mb-4 leading-tight">
                Your credentials stay<br />in your browser.
              </h2>
              <p className="text-[15px] sm:text-[17px] text-black/40 leading-relaxed max-w-2xl mx-auto mb-8">
                Push44 has no backend. Your Base44 token and GitHub PAT are stored in localStorage and sent directly to their APIs. We never see them, log them, or store them.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {["No servers", "No accounts", "No tracking", "No middleman"].map((tag) => (
                  <span key={tag} className="rounded-full px-4 py-2 text-[12px] font-bold bg-white border border-black/[0.07] text-black/50 shadow-sm">
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 sm:py-32 bg-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8">
          <FadeUp className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold tracking-[0.15em] uppercase text-[#22c55e] bg-[#f0fdf4] rounded-full px-4 py-1.5 mb-5">Got questions?</span>
            <h2 className="text-[32px] sm:text-[46px] font-extrabold tracking-tight text-black leading-tight">
              Frequently asked questions
            </h2>
          </FadeUp>
          <FadeUp delay={0.08}>
            <div className="rounded-[24px] border border-black/[0.06] overflow-hidden bg-[#f9f8f4]">
              <div className="px-6 sm:px-8">
                {FAQS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 sm:py-32 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg,#080818 0%,#0f0f2e 50%,#0d1a36 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 120%,rgba(109,40,217,0.3),transparent 60%)" }} />
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-[#8b5cf6]/50 to-transparent"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <FadeUp>
            <div className="flex items-center justify-center gap-1 mb-7">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-[#dce99a] text-[#dce99a]" />
              ))}
            </div>
            <h2 className="text-[36px] sm:text-[58px] font-extrabold tracking-tight leading-[1.04] text-white mb-5">
              Start version-controlling<br />your Base44 apps today.
            </h2>
            <p className="text-[16px] sm:text-[18px] text-white/35 max-w-xl mx-auto mb-10 leading-relaxed">
              Free forever. No sign-up. Takes 2 minutes — then you're pushing code to GitHub on every update.
            </p>
            <Link to={isConnected ? "/dashboard" : "/onboarding"}>
              <motion.button
                className="inline-flex items-center gap-2.5 rounded-2xl px-10 py-5 text-[16px] font-bold text-black"
                style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)", boxShadow: "0 0 0 1px rgba(220,233,154,0.4), 0 20px 50px rgba(220,233,154,0.3)" }}
                whileHover={{ scale: 1.05, y: -3, boxShadow: "0 0 0 1px rgba(220,233,154,0.6), 0 28px 60px rgba(220,233,154,0.45)" }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
              >
                <Zap className="h-5 w-5" strokeWidth={3} />
                {isConnected ? "Open Dashboard" : "Get Started Free"}
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </motion.button>
            </Link>
            <p className="mt-5 text-[12px] text-white/20 font-medium">No credit card. No account. Just connect and go.</p>
          </FadeUp>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#050510] py-10 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <img src={appLogo} alt="Push44" className="h-7 w-7 rounded-lg object-cover" />
            <span className="text-[15px] font-extrabold text-white tracking-tight">
              Push<span style={{ color: "#8b5cf6" }}>44</span>
            </span>
          </div>
          <p className="text-[11px] text-white/15 font-medium text-center">
            Free · Open Source · No servers · Built for Base44 developers
          </p>
          <div className="flex items-center gap-5 text-[12px] font-semibold text-white/20">
            <Link to="/onboarding" className="hover:text-white/50 transition-colors">Get Started</Link>
            <a href="#faq" className="hover:text-white/50 transition-colors">FAQ</a>
            <a href="#how-it-works" className="hover:text-white/50 transition-colors">How it works</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
