import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight, Zap, GitBranch, Shield, Clock, Layers, UploadCloud,
  CheckCircle2, ChevronDown, Terminal, Lock, X,
  FileCode2, GitCommit, Package, Boxes, Star
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const FEATURES = [
  { icon: Zap, title: "One-tap push", desc: "All 87+ source files committed to GitHub in a single click — no copy-pasting, no manual uploads, no CLI." },
  { icon: Layers, title: "GitHub Trees API", desc: "Uses GitHub's efficient bulk-commit Trees API so even large apps push in seconds, not minutes." },
  { icon: UploadCloud, title: "Auto sandbox wake", desc: "Automatically wakes sleeping Base44 sandboxes before fetching files — no manual intervention needed." },
  { icon: Clock, title: "Full push history", desc: "Every push is logged with the commit hash, file count, branch, and timestamp for complete traceability." },
  { icon: Shield, title: "Zero data stored", desc: "Your credentials never leave your browser. Push44 talks directly to Base44 and GitHub — no middleman." },
  { icon: GitBranch, title: "Any repo, any branch", desc: "Push to existing repos or create a new one on the fly. Choose your branch — main, dev, or anything else." },
];

const STEPS = [
  { num: "01", title: "Connect Base44", desc: "Sign in with your Base44 email and password, or paste an API key. Your credentials stay in your browser only.", icon: Boxes },
  { num: "02", title: "Select your app", desc: "Choose from all your Base44 projects. Push44 automatically wakes the sandbox and fetches every source file.", icon: Package },
  { num: "03", title: "Push to GitHub", desc: "Pick a GitHub repo or create one instantly. All files are committed in a single atomic push.", icon: GitCommit },
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
    <div className="border-b border-[#f0ece4] last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 py-5 text-left group">
        <span className="text-[15px] font-semibold text-[#1a1a1a] leading-snug group-hover:text-[#f97316] transition-colors">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}>
          <ChevronDown className="h-4 w-4 text-[#c8b8a2] shrink-0" />
        </motion.div>
      </button>
      <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.25, ease }} className="overflow-hidden">
        <p className="text-[14px] text-[#6b6360] leading-relaxed pb-5">{a}</p>
      </motion.div>
    </div>
  );
}

function Navbar({ isConnected }: { isConnected: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener("scroll", fn); };
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -8 }}
      transition={{ duration: 0.4, ease }}
    >
      <div
        className="transition-all duration-300"
        style={{
          background: scrolled ? "rgba(255,252,248,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(249,115,22,0.1)" : "1px solid transparent",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={appLogo} alt="Push44" className="h-8 w-8 rounded-[10px] object-cover" />
            <span className="text-[15px] font-black tracking-tight text-[#1a1a1a]">
              Push<span className="text-[#f97316]">44</span>
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            {[{ label: "How it works", href: "#how-it-works" }, { label: "FAQ", href: "#faq" }].map(({ label, href }) => (
              <a key={label} href={href} className="px-4 py-2 text-[13px] font-semibold text-[#6b6360] hover:text-[#1a1a1a] transition-colors rounded-xl hover:bg-[#f97316]/8">
                {label}
              </a>
            ))}
            <a
              href="https://github.com/The-habib/Push44"
              target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-[#6b6360] hover:text-[#1a1a1a] transition-colors rounded-xl hover:bg-[#f97316]/8"
            >
              <GitHubLogo className="h-3.5 w-3.5" />
              GitHub
            </a>
          </div>

          <Link to={isConnected ? "/dashboard" : "/onboarding"}>
            <motion.button
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold text-white"
              style={{ background: "#f97316", boxShadow: "0 2px 12px rgba(249,115,22,0.35)" }}
              whileHover={{ scale: 1.03, boxShadow: "0 4px 18px rgba(249,115,22,0.5)" }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
            >
              {isConnected ? "Dashboard" : "Get Started"}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

function LandingPage() {
  const { creds, isLoaded } = useApp();
  const isConnected = isLoaded && !!(creds.base44Token && creds.githubToken);

  return (
    <div className="min-h-screen bg-[#fffcf8] text-[#1a1a1a] overflow-x-hidden">

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
              },
              {
                "@type": "FAQPage",
                mainEntity: FAQS.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
              },
            ],
          }),
        }}
      />

      <Navbar isConnected={isConnected} />

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
        {/* Warm background tones */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 60% -10%, rgba(249,115,22,0.12) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 40% at 0% 80%, rgba(249,115,22,0.06) 0%, transparent 60%)" }} />

        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="flex items-center gap-3 mb-8 flex-wrap"
          >
            <span className="inline-flex items-center gap-2 bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 rounded-full px-4 py-1.5 text-[12px] font-bold tracking-wide uppercase">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-[#f97316]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              Free · No sign-up · Works instantly
            </span>
            <a
              href="https://github.com/The-habib/Push44"
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#9a8880] hover:text-[#1a1a1a] transition-colors"
            >
              <GitHubLogo className="h-3.5 w-3.5" />
              Open source
            </a>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_440px] gap-14 lg:gap-20 items-center">
            {/* Left — headline */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08, ease }}
                className="text-[48px] sm:text-[62px] lg:text-[72px] font-black leading-[1.0] tracking-[-0.02em] text-[#1a1a1a] mb-6"
              >
                Push{" "}
                <span className="text-[#f97316]">Base44</span>{" "}
                apps<br />
                to{" "}
                <span className="relative inline-block">
                  GitHub
                  <motion.span
                    className="absolute -bottom-1 left-0 right-0 h-[4px] rounded-full bg-[#f97316]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.7, ease }}
                    style={{ originX: 0 }}
                  />
                </span>{" "}
                in one tap.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.18, ease }}
                className="text-[17px] sm:text-[19px] text-[#6b6360] leading-relaxed max-w-lg mb-9"
              >
                Fetch all your Base44 source files and commit them to any GitHub repo in a single atomic push. Version-control your vibe-coded apps in under 2 minutes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.26, ease }}
                className="flex flex-wrap gap-3"
              >
                <Link to={isConnected ? "/dashboard" : "/onboarding"}>
                  <motion.button
                    className="flex items-center gap-2 rounded-2xl px-8 py-4 text-[15px] font-bold text-white"
                    style={{ background: "#f97316", boxShadow: "0 4px 24px rgba(249,115,22,0.4)" }}
                    whileHover={{ scale: 1.03, y: -2, boxShadow: "0 8px 32px rgba(249,115,22,0.5)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={spring}
                  >
                    <Zap className="h-4 w-4" strokeWidth={2.5} />
                    {isConnected ? "Open Dashboard" : "Get Started Free"}
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </motion.button>
                </Link>
                <a href="https://github.com/The-habib/Push44" target="_blank" rel="noreferrer">
                  <motion.button
                    className="flex items-center gap-2 rounded-2xl px-8 py-4 text-[15px] font-semibold text-[#1a1a1a] border border-[#e8e0d8] bg-white hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-colors"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    transition={spring}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    View on GitHub
                  </motion.button>
                </a>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center gap-8 mt-10 flex-wrap"
              >
                {[{ val: "87+", label: "files per push" }, { val: "<5s", label: "average time" }, { val: "100%", label: "free forever" }].map(({ val, label }) => (
                  <div key={label} className="flex items-baseline gap-1.5">
                    <span className="text-[26px] font-black text-[#f97316] tracking-tight">{val}</span>
                    <span className="text-[12px] font-medium text-[#9a8880]">{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — terminal card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease }}
              className="relative"
            >
              {/* Floating badge top */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.4 }}
                className="absolute -top-4 -left-4 z-10 flex items-center gap-2 bg-white border border-[#f0ece4] rounded-2xl px-3.5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hidden sm:flex"
              >
                <div className="h-7 w-7 rounded-xl bg-[#fff4ed] flex items-center justify-center">
                  <FileCode2 className="h-3.5 w-3.5 text-[#f97316]" />
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#1a1a1a]">87 files</div>
                  <div className="text-[10px] text-[#9a8880]">fetched from Base44</div>
                </div>
              </motion.div>

              {/* Floating badge bottom */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.35, duration: 0.4 }}
                className="absolute -bottom-4 -right-4 z-10 flex items-center gap-2 bg-white border border-[#f0ece4] rounded-2xl px-3.5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hidden sm:flex"
              >
                <div className="h-7 w-7 rounded-xl bg-[#f0fdf4] flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#1a1a1a]">Push complete</div>
                  <div className="text-[10px] text-[#9a8880]">committed in 3.2s</div>
                </div>
              </motion.div>

              {/* Terminal */}
              <div className="rounded-[20px] overflow-hidden border border-[#e8e0d8] shadow-[0_16px_60px_rgba(0,0,0,0.12)]">
                {/* Chrome bar */}
                <div className="flex items-center gap-2 px-5 py-3.5 bg-[#f5f2ec] border-b border-[#e8e0d8]">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-1.5 bg-white/70 border border-[#e8e0d8] rounded-lg px-4 py-1 text-[11px] font-mono text-[#9a8880]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                      push-44.vercel.app
                    </div>
                  </div>
                  <Terminal className="h-3.5 w-3.5 text-[#c8b8a2]" />
                </div>

                {/* Terminal body */}
                <div className="bg-[#1c1917] p-6 space-y-3 min-h-[200px]">
                  {[
                    { delay: 0.7, color: "#6b7280", prefix: "$", text: "push44 --app my-saas-app" },
                    { delay: 0.95, color: "#9ca3af", prefix: " ", text: "Waking Base44 sandbox…" },
                    { delay: 1.2, color: "#22c55e", prefix: "✓", text: "Sandbox alive · Fetching files" },
                    { delay: 1.5, color: "#9ca3af", prefix: " ", text: "87 files ready · Creating blobs" },
                    { delay: 1.85, color: "#fb923c", prefix: "↑", text: "Pushing → github.com/you/my-saas-app" },
                    { delay: 2.2, color: "#f97316", prefix: "✓", text: "Committed abc12ef3 · 87 files · 3.2s" },
                  ].map(({ delay, color, prefix, text }) => (
                    <motion.div
                      key={text}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay, ease }}
                      className="flex items-center gap-2.5"
                    >
                      <span className="text-[10px] text-[#4b5563] w-3 shrink-0">{prefix}</span>
                      <span className="font-mono text-[12.5px]" style={{ color }}>{text}</span>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.6 }}
                    className="flex items-center gap-2.5 mt-4 pt-4 border-t border-white/10"
                  >
                    <div className="flex items-center gap-2 rounded-lg bg-[#f97316]/15 border border-[#f97316]/25 px-3 py-2">
                      <Zap className="h-3.5 w-3.5 text-[#f97316]" strokeWidth={2.5} />
                      <span className="text-[12px] font-bold text-[#f97316]">Push successful</span>
                    </div>
                    <span className="text-[11px] text-[#4b5563] font-mono">View on GitHub →</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Scrolling trust bar ── */}
      <div className="py-4 border-y border-[#f0ece4] overflow-hidden bg-[#faf7f3]">
        <motion.div
          className="flex items-center gap-10 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(2)].map((_, j) => (
            <div key={j} className="flex items-center gap-10">
              {["One-tap push", "87+ files committed", "GitHub Trees API", "Auto sandbox wake", "Push history", "Zero data stored", "Any branch", "Free forever"].map((t) => (
                <span key={t} className="flex items-center gap-2.5 text-[11px] font-bold text-[#b8a898] uppercase tracking-widest shrink-0">
                  <span className="h-1 w-1 rounded-full bg-[#f97316]" />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 sm:py-32 bg-[#fffcf8]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeUp className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px flex-1 bg-[#f0ece4] max-w-[40px]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#f97316]">Simple by design</span>
            </div>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-tight leading-[1.06] text-[#1a1a1a] mb-4">
              From Base44 to GitHub<br />in three steps.
            </h2>
            <p className="text-[16px] text-[#6b6360] max-w-md leading-relaxed">
              No CLI. No config. No copy-paste. Just connect, select, and push.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-3 gap-5">
            {STEPS.map(({ num, title, desc, icon: Icon }, i) => (
              <FadeUp key={num} delay={i * 0.1}>
                <motion.div
                  className="rounded-[20px] p-8 border border-[#f0ece4] bg-white h-full"
                  whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(249,115,22,0.1)", borderColor: "rgba(249,115,22,0.25)" }}
                  transition={spring}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-11 w-11 rounded-[14px] bg-[#fff4ed] flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[#f97316]" strokeWidth={2} />
                    </div>
                    <span className="text-[11px] font-black tracking-[0.18em] text-[#f97316]/50 uppercase">Step {num}</span>
                  </div>
                  <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-2">{title}</h3>
                  <p className="text-[13.5px] text-[#6b6360] leading-relaxed">{desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.3} className="mt-10">
            <div className="flex items-center gap-2 flex-wrap">
              {["Connect Base44", "Select your app", "Push to GitHub"].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-full border border-[#f0ece4] bg-[#faf7f3] px-4 py-2 shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#f97316]" strokeWidth={2.5} />
                    <span className="text-[13px] font-semibold text-[#1a1a1a]">{s}</span>
                  </div>
                  {i < 2 && <ArrowRight className="h-4 w-4 text-[#c8b8a2] hidden sm:block" />}
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 sm:py-32 bg-[#faf7f3]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeUp className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px flex-1 bg-[#f0ece4] max-w-[40px]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#f97316]">Built for developers</span>
            </div>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-tight leading-[1.06] text-[#1a1a1a] mb-4">
              Everything you need.<br />Nothing you don't.
            </h2>
            <p className="text-[16px] text-[#6b6360] max-w-md leading-relaxed">
              Push44 is laser-focused on one job — getting your Base44 code into GitHub reliably, fast, and securely.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <FadeUp key={title} delay={i * 0.06}>
                <motion.div
                  className="rounded-[18px] p-7 h-full border border-transparent bg-white hover:border-[#f97316]/20 transition-colors"
                  whileHover={{ y: -3, boxShadow: "0 12px 36px rgba(249,115,22,0.08)" }}
                  transition={spring}
                >
                  <div className="h-11 w-11 rounded-[14px] bg-[#fff4ed] flex items-center justify-center mb-5">
                    <Icon className="h-5 w-5 text-[#f97316]" strokeWidth={2} />
                  </div>
                  <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-2">{title}</h3>
                  <p className="text-[13px] text-[#6b6360] leading-relaxed">{desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── With vs without ── */}
      <section className="py-24 sm:py-32 bg-[#1c1917] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(249,115,22,0.12) 0%, transparent 70%)" }} />
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
          <FadeUp className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px flex-1 bg-white/10 max-w-[40px]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#f97316]">Why Push44</span>
            </div>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-tight leading-[1.06] text-white mb-4">
              Stop losing your work.
            </h2>
            <p className="text-[16px] text-white/40 max-w-md leading-relaxed">
              Every Base44 app deserves proper version control. Push44 makes it effortless.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl">
            <FadeUp delay={0.06}>
              <div className="rounded-[22px] p-8 border border-white/[0.07] bg-white/[0.03] h-full">
                <div className="flex items-center gap-2.5 mb-7">
                  <div className="h-6 w-6 rounded-full bg-red-500/15 flex items-center justify-center">
                    <X className="h-3 w-3 text-red-400" />
                  </div>
                  <span className="text-[11px] font-bold text-white/25 uppercase tracking-wider">Without Push44</span>
                </div>
                {["Manually download files one-by-one", "Copy-paste code into a local editor", "Set up git and push from terminal", "Repeat the whole process each time", "No history, no rollback, no backup"].map((item) => (
                  <div key={item} className="flex items-start gap-3 mb-3.5">
                    <span className="text-red-500/40 text-[13px] shrink-0 mt-0.5">✕</span>
                    <span className="text-[13px] text-white/25 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.14}>
              <div className="rounded-[22px] p-8 border border-[#f97316]/20 bg-[#f97316]/[0.06] h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[70px] pointer-events-none" style={{ background: "rgba(249,115,22,0.12)" }} />
                <div className="flex items-center gap-2.5 mb-7 relative">
                  <div className="h-6 w-6 rounded-full bg-[#f97316]/20 flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-[#f97316]" strokeWidth={2.5} />
                  </div>
                  <span className="text-[11px] font-bold text-[#f97316]/60 uppercase tracking-wider">With Push44</span>
                </div>
                {["All 87+ files fetched and committed instantly", "One tap from any device, anywhere", "Full push history with commit hashes", "Push again anytime in seconds", "Proper version control — rollback anytime"].map((item) => (
                  <div key={item} className="flex items-start gap-3 mb-3.5 relative">
                    <CheckCircle2 className="h-4 w-4 text-[#f97316] shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-[13px] text-white/75 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 bg-white border-b border-[#f0ece4]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 text-center">
            {[
              { value: "87+", label: "Files per push" },
              { value: "< 5s", label: "Average push time" },
              { value: "100%", label: "Free forever" },
              { value: "0 bytes", label: "Stored on servers" },
            ].map(({ value, label }, i) => (
              <FadeUp key={label} delay={i * 0.07}>
                <div>
                  <div className="text-[36px] sm:text-[44px] font-black tracking-tight text-[#f97316] mb-1">{value}</div>
                  <div className="text-[11px] font-semibold text-[#9a8880] uppercase tracking-wider">{label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy ── */}
      <section className="py-20 sm:py-28 bg-[#fffcf8]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <FadeUp>
            <div className="rounded-[28px] border border-[#f0ece4] bg-white p-10 sm:p-14 text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-[18px] bg-[#fff4ed] mb-7">
                <Lock className="h-6 w-6 text-[#f97316]" strokeWidth={2} />
              </div>
              <h2 className="text-[28px] sm:text-[40px] font-black tracking-tight text-[#1a1a1a] mb-4 leading-tight">
                Your credentials stay<br />in your browser.
              </h2>
              <p className="text-[15px] sm:text-[17px] text-[#6b6360] leading-relaxed max-w-xl mx-auto mb-8">
                Push44 has no backend. Your Base44 token and GitHub PAT are stored in localStorage and sent directly to their APIs. We never see them, log them, or store them.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {["No servers", "No accounts", "No tracking", "No middleman"].map((tag) => (
                  <span key={tag} className="rounded-full px-4 py-2 text-[12px] font-bold bg-[#faf7f3] border border-[#f0ece4] text-[#6b6360]">
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 sm:py-32 bg-[#faf7f3]">
        <div className="max-w-2xl mx-auto px-5 sm:px-8">
          <FadeUp className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px flex-1 bg-[#f0ece4] max-w-[40px]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#f97316]">Got questions?</span>
            </div>
            <h2 className="text-[32px] sm:text-[44px] font-black tracking-tight text-[#1a1a1a]">
              Frequently asked<br />questions
            </h2>
          </FadeUp>
          <FadeUp delay={0.08}>
            <div className="rounded-[22px] border border-[#f0ece4] bg-white px-6 sm:px-8 overflow-hidden">
              {FAQS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 sm:py-32 bg-[#f97316] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 60% at 10% 80%, rgba(0,0,0,0.08) 0%, transparent 60%)" }} />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <FadeUp>
            <div className="flex items-center justify-center gap-1 mb-7">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-white/80 text-white/80" />
              ))}
            </div>
            <h2 className="text-[36px] sm:text-[56px] font-black tracking-tight leading-[1.04] text-white mb-5">
              Start version-controlling<br />your Base44 apps today.
            </h2>
            <p className="text-[16px] sm:text-[18px] text-white/65 max-w-xl mx-auto mb-10 leading-relaxed">
              Free forever. No sign-up. Takes 2 minutes — then you're pushing code to GitHub on every update.
            </p>
            <Link to={isConnected ? "/dashboard" : "/onboarding"}>
              <motion.button
                className="inline-flex items-center gap-2.5 rounded-2xl px-10 py-5 text-[16px] font-bold text-[#f97316] bg-white"
                style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.15)" }}
                whileHover={{ scale: 1.04, y: -2, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
              >
                <Zap className="h-5 w-5" strokeWidth={2.5} />
                {isConnected ? "Open Dashboard" : "Get Started Free"}
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </motion.button>
            </Link>
            <p className="mt-5 text-[12px] text-white/45 font-medium">No credit card. No account. Just connect and go.</p>
          </FadeUp>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#1c1917] py-12 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <img src={appLogo} alt="Push44" className="h-7 w-7 rounded-[9px] object-cover" />
              <span className="text-[15px] font-black text-white tracking-tight">
                Push<span className="text-[#f97316]">44</span>
              </span>
            </div>
            <div className="flex items-center gap-5 text-[12px] font-semibold text-white/25">
              <Link to="/onboarding" className="hover:text-white/60 transition-colors">Get Started</Link>
              <a href="#how-it-works" className="hover:text-white/60 transition-colors">How it works</a>
              <a href="#faq" className="hover:text-white/60 transition-colors">FAQ</a>
              <a href="https://github.com/The-habib/Push44" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white/60 transition-colors">
                <GitHubLogo className="h-3.5 w-3.5" />
                Open Source
              </a>
            </div>
          </div>
          <div className="border-t border-white/[0.05] pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-white/15 font-medium">© {new Date().getFullYear()} Push44 — MIT License</p>
            <p className="text-[11px] text-white/10 font-medium text-center">Free forever · No servers · No accounts · Built for Base44 developers</p>
            <motion.a
              href="https://github.com/The-habib/Push44"
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-[11px] font-bold border border-white/10 text-white/30"
              whileHover={{ borderColor: "rgba(249,115,22,0.4)", color: "#f97316", background: "rgba(249,115,22,0.06)" }}
              transition={{ duration: 0.2 }}
            >
              <GitHubLogo className="h-3.5 w-3.5" />
              Star on GitHub
              <Star className="h-3 w-3" />
            </motion.a>
          </div>
        </div>
      </footer>
    </div>
  );
}
