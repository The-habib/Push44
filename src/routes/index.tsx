import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight, Zap, GitBranch, Shield, Clock, Layers, UploadCloud,
  CheckCircle2, ChevronDown, Lock, X,
  FileCode2, GitCommit, Package, Boxes, Star,
  Quote, Eye, History, RefreshCw, GitMerge, Server,
} from "lucide-react";
import { GitHubLogo, Base44Logo, RocketLogo, FlootLogo, ZiteLogo } from "@/components/BrandLogos";
import appLogo from "@/assets/logo.png";
import { useApp } from "@/contexts/AppContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Push44 — Push Base44, Rocket.new & Vibe-Coded Apps to GitHub in One Tap" },
      {
        name: "description",
        content:
          "Push44 is a free tool to back up Base44, Rocket.new, Floot, and Zite app source code to GitHub in one tap. No sign-up. Runs entirely in your browser. Version-control your vibe-coded apps instantly.",
      },
      {
        name: "keywords",
        content:
          "push Base44 to GitHub, Base44 GitHub backup, export Base44 app, Rocket.new GitHub push, vibe coded app backup, no-code GitHub version control, Base44 source code download, push vibe app to GitHub, Floot GitHub backup, Zite GitHub export, vibe code to GitHub, developer tools",
      },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { name: "author", content: "Push44" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Push44" },
      { property: "og:title", content: "Push44 — Push Your Vibe-Coded Apps to GitHub in One Tap" },
      { property: "og:description", content: "Free tool to back up Base44, Rocket.new, Floot, and Zite app source code to GitHub instantly. No sign-up. Runs in your browser. Zero server-side storage." },
      { property: "og:url", content: "https://push-44.vercel.app/" },
      { property: "og:image", content: "https://push-44.vercel.app/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Push44 — Push your apps to GitHub in one tap" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Push44 — Push Your Vibe-Coded Apps to GitHub in One Tap" },
      { name: "twitter:description", content: "Free tool to back up Base44, Rocket.new, Floot, and Zite app source code to GitHub instantly. No sign-up." },
      { name: "twitter:image", content: "https://push-44.vercel.app/og-image.png" },
      { name: "twitter:image:alt", content: "Push44 — Push your apps to GitHub in one tap" },
    ],
    links: [
      { rel: "canonical", href: "https://push-44.vercel.app/" },
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
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const PLATFORMS = [
  {
    id: "base44", name: "Base44", tagline: "Fullstack React + Node", files: "~87 files",
    color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.18)", Logo: Base44Logo,
    desc: "React frontend, Node backend, SQL schemas, env configs.",
  },
  {
    id: "rocket", name: "Rocket.new", tagline: "Flutter mobile apps", files: "~120+ files",
    color: "#6366f1", bg: "rgba(99,102,241,0.07)", border: "rgba(99,102,241,0.18)", Logo: RocketLogo,
    desc: "Complete Flutter project — Dart, pubspec, platform configs.",
  },
  {
    id: "floot", name: "Floot", tagline: "Next.js web apps", files: "~60+ files",
    color: "#2563eb", bg: "rgba(37,99,235,0.07)", border: "rgba(37,99,235,0.18)", Logo: FlootLogo,
    desc: "Components, API routes, styles, and configuration files.",
  },
  {
    id: "zite", name: "Zite", tagline: "Fillout form apps", files: "~30+ files",
    color: "#d97706", bg: "rgba(217,119,6,0.07)", border: "rgba(217,119,6,0.18)", Logo: ZiteLogo,
    desc: "Full app template, structure, and configuration snapshot.",
  },
];

const TESTIMONIALS = [
  {
    quote: "I spent 3 weeks building my Base44 app. Push44 is the first thing I open after every session. One click and my code is safely on GitHub. This should be built into Base44 itself.",
    name: "Marcus T.", role: "Indie maker", platform: "Base44", initials: "MT", color: "#f97316",
  },
  {
    quote: "Setting up git manually for a Rocket.new Flutter app is a nightmare. Push44 does it in literally 3 seconds. The auto sandbox-wake feature alone is worth it.",
    name: "Priya S.", role: "Founder", platform: "Rocket.new", initials: "PS", color: "#6366f1",
  },
  {
    quote: "Open source, free, no accounts, no servers — this is exactly how developer tooling should be built. The file diff view before pushing is genuinely genius.",
    name: "Dev K.", role: "Full-stack developer", platform: "Base44", initials: "DK", color: "#22c55e",
  },
];

const STEPS = [
  { num: "01", title: "Connect your platform", desc: "Sign in with Base44, Rocket.new, Floot, or Zite. Credentials stay in your browser — nothing sent to any server.", icon: Boxes },
  { num: "02", title: "Select your app", desc: "Choose from all your projects. Push44 auto-wakes sleeping sandboxes and fetches every source file.", icon: Package },
  { num: "03", title: "Push to GitHub", desc: "Pick a repo or create one. All files committed in a single atomic push via the GitHub Trees API.", icon: GitCommit },
];

const FAQS = [
  { q: "What is Push44?", a: "Push44 is a free web app that lets you back up your app source code to GitHub in one tap. It supports Base44, Rocket.new, Floot, and Zite. It fetches all your app files and commits them to any GitHub repository using a single atomic commit." },
  { q: "Is Push44 free to use?", a: "Yes, completely free. There are no subscriptions, no sign-up required, and no limits on the number of pushes. Push44 runs entirely in your browser." },
  { q: "Are my credentials safe?", a: "Yes. Your credentials go directly from your browser to each platform's and GitHub's APIs. Push44 has no backend server — nothing is ever stored or transmitted through our infrastructure." },
  { q: "What GitHub permissions does Push44 need?", a: "Push44 needs a GitHub Personal Access Token with repo and user scopes. This lets it list your repos, create new ones, and push commits. You can revoke the token at any time from your GitHub settings." },
  { q: "Does Push44 work with private GitHub repos?", a: "Yes. With the correct token scopes, Push44 can push to both public and private repositories, and can create new private repos on your behalf." },
  { q: "Can I push to an existing repository?", a: "Yes. You can push to any existing repository or create a brand-new one. Push44 adds all your app files in a single commit, preserving any existing repo history." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/[0.07] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-6 py-6 text-left group"
      >
        <span className="text-[16px] sm:text-[17px] font-semibold text-[#111] leading-snug group-hover:text-[#f97316] transition-colors duration-150">{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 mt-0.5">
          <ChevronDown className="h-5 w-5 text-black/25" />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease }}
        className="overflow-hidden"
      >
        <p className="text-[15px] text-[#555] leading-[1.78] pb-6 max-w-2xl">{a}</p>
      </motion.div>
    </div>
  );
}

function AnnouncementBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease }}
      className="relative z-[60] overflow-hidden"
    >
      <div className="bg-[#111] border-b border-white/[0.06] px-4 py-2.5 flex items-center justify-center gap-3">
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-[#f97316] shrink-0"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <p className="text-[12px] font-medium text-white/55 text-center">
          <span className="text-[#f97316] font-semibold">New:</span>{" "}
          Floot and Zite platform support added —{" "}
          <Link to="/onboarding" className="text-white/80 underline underline-offset-2 hover:text-[#f97316] transition-colors">
            try it now →
          </Link>
        </p>
        <button
          onClick={onDismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/25 hover:text-white/60 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function Navbar({ isConnected }: { isConnected: boolean }) {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    const onScroll = () => setScrolled(window.scrollY > 72);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, []);

  const NAV_LINKS = [
    { id: "hiw",      label: "How it works", href: "#how-it-works" },
    { id: "plat",     label: "Platforms",    href: "#platforms"    },
    { id: "faq",      label: "FAQ",          href: "#faq"          },
    { id: "gh",       label: "GitHub",       href: "https://github.com/The-habib/Push44", external: true },
  ];

  /* ── pill is always cream/warm-white — floats on both dark hero and light sections ── */
  const pillBg     = scrolled ? "rgba(255,252,248,0.96)" : "rgba(255,252,248,0.82)";
  const pillBorder = scrolled ? "rgba(249,115,22,0.18)"  : "rgba(224,216,204,0.90)";
  const pillShadow = scrolled
    ? [
        "0 0 0 1px rgba(249,115,22,0.16)",
        "0 10px 36px rgba(0,0,0,0.14)",
        "0 3px 10px rgba(0,0,0,0.07)",
        "inset 0 1px 0 rgba(255,255,255,0.95)",
      ].join(", ")
    : [
        "0 0 0 1px rgba(224,216,204,0.85)",
        "0 8px 32px rgba(0,0,0,0.22)",
        "0 2px 12px rgba(0,0,0,0.14)",
        "inset 0 1px 0 rgba(255,255,255,0.95)",
      ].join(", ");

  const linkBase  = "rgba(100,90,85,1)";
  const linkHover = "rgba(20,16,14,1)";
  const hoverBg   = "rgba(0,0,0,0.055)";

  return (
    /* pointer-events-none on the belt so it never blocks scrolling content;
       pointer-events-auto is restored on the pill itself.
       overflow-x:clip (not overflow:hidden) on the page root keeps fixed
       children from being trapped in a new containing block (Safari / iOS). */
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-5 pt-3 sm:pt-4 pointer-events-none">
      <motion.div
        className="pointer-events-auto w-full"
        style={{ maxWidth: 860 }}
        initial={{ opacity: 0, y: -28, scale: 0.90 }}
        animate={{
          opacity: visible ? 1 : 0,
          y:       visible ? 0 : -28,
          scale:   visible ? 1 : 0.90,
        }}
        transition={{ duration: 0.65, ease: [0.34, 1.12, 0.64, 1] }}
      >
        {/* ── Floating pill shell ── */}
        <motion.div
          className="flex items-center justify-between rounded-full"
          style={{
            padding: "5px 5px 5px 10px",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderWidth: "1px",
            borderStyle: "solid",
          }}
          animate={{ background: pillBg, boxShadow: pillShadow, borderColor: pillBorder }}
          transition={{ duration: 0.45, ease }}
        >

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-1.5 py-0.5 pr-2 shrink-0">
            <motion.img
              src={appLogo}
              alt="Push44"
              className="h-7 w-7 rounded-[9px] object-cover"
              whileHover={{ scale: 1.15, rotate: -8 }}
              whileTap={{ scale: 0.85, rotate: 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
            />
            <motion.span
              className="text-[14px] font-black tracking-tight leading-none"
              animate={{ color: scrolled ? "#1a1a1a" : "#ffffff" }}
              transition={{ duration: 0.35, ease }}
            >
              Push<span style={{ color: "#f97316" }}>44</span>
            </motion.span>
          </Link>

          {/* ── Nav links (desktop) ── */}
          <div className="hidden sm:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_LINKS.map(({ id, label, href, external }, i) => (
              <motion.a
                key={id}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="relative flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-semibold rounded-full select-none"
                initial={{ opacity: 0, y: -10 }}
                animate={{
                  opacity: visible ? 1 : 0,
                  y:       visible ? 0 : -10,
                  color:   hovered === id ? linkHover : linkBase,
                }}
                transition={{
                  opacity: { duration: 0.4, delay: 0.12 + i * 0.055, ease },
                  y:       { duration: 0.4, delay: 0.12 + i * 0.055, ease },
                  color:   { duration: 0.18 },
                }}
                onHoverStart={() => setHovered(id)}
                onHoverEnd={() => setHovered(null)}
              >
                {/* Sliding hover pill */}
                {hovered === id && (
                  <motion.span
                    layoutId="navHoverBg"
                    className="absolute inset-0 rounded-full"
                    style={{ background: hoverBg }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  />
                )}
                {id === "gh" && <GitHubLogo className="h-3.5 w-3.5 relative z-10 shrink-0" />}
                <span className="relative z-10">{label}</span>
                {id === "gh" && (
                  <span
                    className="relative z-10 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold"
                    style={{
                      background: scrolled ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.10)",
                      color:      scrolled ? "#9a8880"           : "rgba(255,255,255,0.45)",
                    }}
                  >
                    <Star className="h-2.5 w-2.5 fill-current" />
                    Open source
                  </span>
                )}
              </motion.a>
            ))}
          </div>

          {/* ── CTA button ── */}
          <Link to={isConnected ? "/dashboard" : "/onboarding"} className="shrink-0">
            <motion.button
              className="relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-bold text-white overflow-hidden"
              style={{
                background:  "linear-gradient(135deg, #fb923c 0%, #f97316 55%, #ea580c 100%)",
                boxShadow:   "0 2px 14px rgba(249,115,22,0.50), inset 0 1px 0 rgba(255,255,255,0.22)",
              }}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.75 }}
              transition={{ duration: 0.55, delay: 0.35, ease: [0.34, 1.25, 0.64, 1] }}
              whileHover={{
                scale:      1.07,
                boxShadow: "0 6px 28px rgba(249,115,22,0.72), inset 0 1px 0 rgba(255,255,255,0.28)",
              }}
              whileTap={{ scale: 0.92 }}
              transition={spring}
            >
              {/* Shimmer sweep on hover */}
              <motion.span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)",
                  backgroundSize: "200% 100%",
                }}
                initial={{ backgroundPosition: "200% 0" }}
                whileHover={{ backgroundPosition: "-200% 0" }}
                transition={{ duration: 0.55, ease: "easeInOut" }}
              />
              <span className="relative z-10">{isConnected ? "Dashboard" : "Get Started"}</span>
              <motion.span
                className="relative z-10"
                animate={{ x: [0, 2.5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
              >
                <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
              </motion.span>
            </motion.button>
          </Link>

        </motion.div>
      </motion.div>
    </div>
  );
}

function LandingPage() {
  const { creds, isLoaded } = useApp();
  const isConnected = isLoaded && !!((creds.base44Token || creds.rocketToken || creds.flootToken || creds.ziteSession) && creds.githubToken);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white" style={{ overflowX: "clip" }}>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebApplication",
                name: "Push44",
                url: "https://push-44.vercel.app",
                description: "Push your Base44, Rocket.new, Floot, and Zite app source code to GitHub in one tap.",
                applicationCategory: "DeveloperApplication",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                isAccessibleForFree: true,
              },
              {
                "@type": "Organization",
                name: "Push44",
                url: "https://push-44.vercel.app",
                sameAs: ["https://github.com/The-habib/Push44"],
              },
            ],
          }),
        }}
      />

      <AnimatePresence>
        {!bannerDismissed && <AnnouncementBanner onDismiss={() => setBannerDismissed(true)} />}
      </AnimatePresence>

      <Navbar isConnected={isConnected} />

      {/* ── HERO ── */}
      <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden">
        {/* Background elements */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 60% 110%, rgba(249,115,22,0.14) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-7xl mx-auto w-full px-5 sm:px-8 lg:px-12 pt-28 pb-20 lg:pt-36 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">

            {/* Left: Copy */}
            <div>
              {/* Eyebrow */}
              <FadeUp delay={0.05}>
                <div className="inline-flex items-center gap-2 mb-8 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" />
                  <span className="text-[12px] font-semibold text-white/50 tracking-wide">
                    Open source · Free forever · No sign-up
                  </span>
                </div>
              </FadeUp>

              {/* Headline */}
              <FadeUp delay={0.1}>
                <h1 className="text-[52px] sm:text-[64px] lg:text-[76px] font-black tracking-[-0.03em] leading-[0.96] text-white mb-7">
                  Push your<br />
                  apps to{" "}
                  <span style={{ color: "#f97316" }}>GitHub.</span>
                </h1>
              </FadeUp>

              {/* Subtext */}
              <FadeUp delay={0.16}>
                <p className="text-[17px] sm:text-[19px] text-white/45 leading-[1.65] mb-10 max-w-[480px]">
                  Fetch all source files from Base44, Rocket.new, Floot, or Zite and commit them to any GitHub repo in a single tap. Takes under 2 minutes.
                </p>
              </FadeUp>

              {/* CTAs */}
              <FadeUp delay={0.22}>
                <div className="flex flex-wrap items-center gap-3 mb-12">
                  <Link to={isConnected ? "/dashboard" : "/onboarding"}>
                    <motion.button
                      className="flex items-center gap-2.5 rounded-2xl px-7 py-4 text-[15px] font-bold text-white"
                      style={{ background: "#f97316", boxShadow: "0 8px 32px rgba(249,115,22,0.45)" }}
                      whileHover={{ scale: 1.03, boxShadow: "0 12px 40px rgba(249,115,22,0.6)" }}
                      whileTap={{ scale: 0.97 }}
                      transition={spring}
                    >
                      {isConnected ? "Go to Dashboard" : "Get Started — it's free"}
                      <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                    </motion.button>
                  </Link>
                  <motion.a
                    href="https://github.com/The-habib/Push44"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-2xl px-7 py-4 text-[15px] font-semibold text-white/60 border border-white/[0.1]"
                    whileHover={{ color: "#fff", borderColor: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.04)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <GitHubLogo className="h-4 w-4" />
                    View on GitHub
                  </motion.a>
                </div>
              </FadeUp>

              {/* Platform pills */}
              <FadeUp delay={0.28}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] text-white/25 font-medium mr-1">Works with</span>
                  {PLATFORMS.map(({ id, name, Logo, color }) => (
                    <div
                      key={id}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border"
                      style={{ borderColor: `${color}30`, background: `${color}0d` }}
                    >
                      <Logo size={14} />
                      <span className="text-[11px] font-semibold" style={{ color: `${color}cc` }}>{name}</span>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>

            {/* Right: Product UI preview */}
            <FadeUp delay={0.18} className="hidden lg:block">
              <motion.div
                className="relative"
                whileHover={{ y: -6 }}
                transition={{ ...spring, damping: 32 }}
              >
                {/* Glow */}
                <div
                  className="absolute -inset-10 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(249,115,22,0.12) 0%, transparent 70%)" }}
                />

                {/* Browser chrome */}
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: "#141414",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), 0 -1px 0 rgba(255,255,255,0.06) inset",
                  }}
                >
                  {/* Titlebar */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]" style={{ background: "#0f0f0f" }}>
                    <div className="flex gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                      <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                      <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                    </div>
                    <div className="flex-1 mx-2">
                      <div className="bg-white/[0.05] rounded-md px-3 py-1.5 text-[11px] text-white/25 font-mono flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#f97316]/40" />
                        push-44.vercel.app/push
                      </div>
                    </div>
                  </div>

                  {/* App content */}
                  <div className="p-6">
                    {/* App header row */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-[#f97316] flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-black text-white">B44</span>
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-white">my-saas-app</div>
                          <div className="text-[10px] text-white/30 font-mono">Base44 · React + Node</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#22c55e] bg-[#22c55e]/10 px-2.5 py-1.5 rounded-full border border-[#22c55e]/15">
                        <motion.span
                          className="h-1.5 w-1.5 rounded-full bg-[#22c55e]"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1.8, repeat: Infinity }}
                        />
                        87 files ready
                      </div>
                    </div>

                    {/* File tree */}
                    <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4 mb-4 font-mono text-[11px] space-y-1">
                      {[
                        { depth: 0, icon: "▸", label: "src/", color: "text-white/60" },
                        { depth: 1, icon: "·", label: "components/", sub: "12 files", color: "text-white/30" },
                        { depth: 1, icon: "·", label: "routes/", sub: "6 files", color: "text-white/30" },
                        { depth: 1, icon: "·", label: "lib/", sub: "4 files", color: "text-white/30" },
                        { depth: 0, icon: "·", label: "package.json", color: "text-white/45" },
                        { depth: 0, icon: "·", label: "vite.config.ts", color: "text-white/45" },
                        { depth: 0, icon: "·", label: "tailwind.config.ts", color: "text-white/45" },
                      ].map((f, i) => (
                        <div key={i} className={`flex items-center gap-2 ${f.color}`} style={{ paddingLeft: f.depth * 14 }}>
                          <span className="opacity-50">{f.icon}</span>
                          <span>{f.label}</span>
                          {f.sub && <span className="text-white/20">{f.sub}</span>}
                        </div>
                      ))}
                    </div>

                    {/* Repo selector */}
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3 mb-3">
                      <div className="flex items-center gap-2">
                        <GitHubLogo className="h-4 w-4 text-white/40" />
                        <span className="text-[12px] text-white/50 font-mono">The-habib/my-saas-app</span>
                      </div>
                      <span className="text-[10px] text-white/25 bg-white/[0.05] px-2 py-0.5 rounded-md font-mono">main</span>
                    </div>

                    {/* Push button */}
                    <motion.div
                      className="flex items-center justify-between rounded-xl px-5 py-4 cursor-pointer"
                      style={{ background: "#f97316", boxShadow: "0 4px 20px rgba(249,115,22,0.35)" }}
                      animate={{ boxShadow: ["0 4px 20px rgba(249,115,22,0.35)", "0 8px 30px rgba(249,115,22,0.5)", "0 4px 20px rgba(249,115,22,0.35)"] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      <div>
                        <div className="text-[13px] font-bold text-white">Push to GitHub</div>
                        <div className="text-[10px] text-white/70">87 files · single commit · main branch</div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </FadeUp>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #f9f8f6)" }} />
      </section>

      {/* ── WORKS WITH ── */}
      <section className="bg-[#f9f8f6] border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14">
          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-black/25 shrink-0">Built for</span>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-6 sm:gap-10">
              {PLATFORMS.map(({ id, name, Logo, color }) => (
                <motion.div
                  key={id}
                  className="flex items-center gap-2.5 opacity-40 hover:opacity-90 transition-opacity duration-200"
                  whileHover={{ scale: 1.05 }}
                  transition={spring}
                >
                  <Logo size={22} />
                  <span className="text-[14px] font-bold text-[#111]">{name}</span>
                </motion.div>
              ))}
              <div className="flex items-center gap-2.5 opacity-40 hover:opacity-90 transition-opacity duration-200">
                <GitHubLogo className="h-5 w-5 text-[#111]" />
                <span className="text-[14px] font-bold text-[#111]">GitHub</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE 1 — Every file ── */}
      <section className="bg-[#f9f8f6] py-28 sm:py-40">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <FadeUp>
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#f97316] mb-5">Complete source export</p>
              <h2 className="text-[38px] sm:text-[52px] font-black tracking-[-0.025em] leading-[1.05] text-[#0c0c0c] mb-6">
                Every file.<br />One push.
              </h2>
              <p className="text-[17px] text-[#666] leading-[1.7] mb-10 max-w-md">
                Push44 fetches your entire project — every component, config, schema, and asset — and commits it all to GitHub in a single atomic operation. No cherry-picking, no missed files.
              </p>
              <div className="space-y-4">
                {[
                  { icon: CheckCircle2, text: "87+ files from Base44 apps in seconds" },
                  { icon: CheckCircle2, text: "120+ files from Rocket.new Flutter projects" },
                  { icon: CheckCircle2, text: "Auto-wakes sleeping sandboxes before fetching" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-[#f97316] shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-[15px] text-[#444] font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.12}>
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "#141414",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 32px 64px rgba(0,0,0,0.2)",
                }}
              >
                <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center gap-3" style={{ background: "#0f0f0f" }}>
                  <FileCode2 className="h-4 w-4 text-[#f97316]" />
                  <span className="text-[12px] font-semibold text-white/40 font-mono">my-saas-app — 87 files</span>
                  <span className="ml-auto text-[10px] font-bold text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full">fetched</span>
                </div>
                <div className="p-5 font-mono text-[12px] space-y-1.5">
                  {[
                    ["▸ src/components/", "32 files", "#f97316"],
                    ["  ▸ ui/", "18 files", "#f97316"],
                    ["  ▸ forms/", "8 files", "#f97316"],
                    ["▸ src/routes/", "6 files", "#6366f1"],
                    ["▸ src/lib/", "4 files", "#6366f1"],
                    ["▸ src/contexts/", "2 files", "#2563eb"],
                    ["· package.json", "", ""],
                    ["· vite.config.ts", "", ""],
                    ["· tailwind.config.ts", "", ""],
                    ["· tsconfig.json", "", ""],
                    ["· index.html", "", ""],
                  ].map(([path, count, accent], i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <span className="text-white/45">{path}</span>
                      {count && <span className="text-[10px]" style={{ color: accent }}>{count}</span>}
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-white/[0.05] flex items-center justify-between">
                    <span className="text-white/25">Total</span>
                    <span className="text-[#f97316] font-bold">87 files · ~340KB</span>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FEATURE 2 — One commit ── */}
      <section className="bg-white py-28 sm:py-40">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Visual first on desktop */}
            <FadeUp delay={0.12} className="order-2 lg:order-1">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "#141414",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 32px 64px rgba(0,0,0,0.15)",
                }}
              >
                <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center gap-3" style={{ background: "#0f0f0f" }}>
                  <GitMerge className="h-4 w-4 text-[#6366f1]" />
                  <span className="text-[12px] font-semibold text-white/40 font-mono">git log — main</span>
                </div>
                <div className="p-5 font-mono text-[12px] space-y-4">
                  {[
                    { sha: "a4f2c91", msg: "chore: push via Push44 [87 files]", time: "just now", tag: "HEAD" },
                    { sha: "8b3d2e0", msg: "chore: push via Push44 [87 files]", time: "2 days ago", tag: "" },
                    { sha: "3c1a7f4", msg: "chore: push via Push44 [85 files]", time: "5 days ago", tag: "" },
                    { sha: "e9d4b82", msg: "Initial push via Push44", time: "2 weeks ago", tag: "" },
                  ].map(({ sha, msg, time, tag }) => (
                    <div key={sha} className="flex items-start gap-3">
                      <div className="flex flex-col items-center shrink-0 mt-1">
                        <div className="h-2 w-2 rounded-full bg-[#6366f1]" />
                        <div className="w-px flex-1 bg-white/[0.06] min-h-[20px] mt-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[#6366f1]">{sha}</span>
                          {tag && <span className="text-[9px] font-bold text-white bg-[#6366f1]/20 px-1.5 py-0.5 rounded">{tag}</span>}
                        </div>
                        <div className="text-white/55 mt-0.5 truncate">{msg}</div>
                        <div className="text-white/25 text-[10px] mt-0.5">{time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            <FadeUp className="order-1 lg:order-2">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#6366f1] mb-5">GitHub Trees API</p>
              <h2 className="text-[38px] sm:text-[52px] font-black tracking-[-0.025em] leading-[1.05] text-[#0c0c0c] mb-6">
                One commit.<br />Full history.
              </h2>
              <p className="text-[17px] text-[#666] leading-[1.7] mb-10 max-w-md">
                Push44 uses GitHub's Trees API to bundle every file into a single atomic commit. No partial pushes, no broken state. Your repo always has a clean, complete snapshot.
              </p>
              <div className="space-y-4">
                {[
                  { icon: GitBranch, text: "Push to any branch — main, dev, or custom" },
                  { icon: CheckCircle2, text: "Create a new repo or push to an existing one" },
                  { icon: CheckCircle2, text: "Full push history with commit hashes + timestamps" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-[#6366f1] shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-[15px] text-[#444] font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FEATURE 3 — Privacy ── */}
      <section className="bg-[#0c0c0c] py-28 sm:py-40">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <FadeUp>
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#22c55e] mb-5">Zero trust architecture</p>
              <h2 className="text-[38px] sm:text-[52px] font-black tracking-[-0.025em] leading-[1.05] text-white mb-6">
                Never touches<br />our servers.
              </h2>
              <p className="text-[17px] text-white/40 leading-[1.7] mb-10 max-w-md">
                Push44 has no backend. Your credentials and source code travel directly from your browser to each platform's API and GitHub. We can't see your code — because we're not in the loop.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Lock, text: "Credentials stored in your browser's localStorage only" },
                  { icon: Shield, text: "Direct API calls — Base44 → you → GitHub" },
                  { icon: CheckCircle2, text: "No analytics, no tracking, no data collection" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-[#22c55e] shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-[15px] text-white/55 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.12}>
              <div
                className="rounded-2xl p-8"
                style={{
                  background: "#141414",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
                }}
              >
                {/* Architecture diagram */}
                <div className="flex flex-col items-center gap-0">
                  {/* Your Browser */}
                  <div className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center">
                    <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-white/30 mb-1">Your Browser</div>
                    <div className="text-[15px] font-bold text-white">Push44 app</div>
                    <div className="text-[11px] text-white/30 mt-1">credentials in localStorage</div>
                  </div>

                  {/* Arrow down */}
                  <div className="flex flex-col items-center py-3">
                    <div className="w-px h-6 bg-white/10" />
                    <ArrowRight className="h-4 w-4 rotate-90 text-white/20" />
                  </div>

                  {/* Split */}
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="rounded-xl border border-[#f97316]/20 bg-[#f97316]/[0.06] p-3 text-center">
                      <div className="text-[10px] font-bold text-[#f97316]/60 mb-1 uppercase tracking-wide">Direct API</div>
                      <div className="text-[13px] font-bold text-white/70">Base44</div>
                      <div className="text-[10px] text-white/25 mt-0.5">app.base44.com</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                      <div className="text-[10px] font-bold text-white/30 mb-1 uppercase tracking-wide">Direct API</div>
                      <div className="text-[13px] font-bold text-white/70">GitHub</div>
                      <div className="text-[10px] text-white/25 mt-0.5">api.github.com</div>
                    </div>
                  </div>

                  {/* No server callout */}
                  <div className="mt-5 w-full rounded-xl border border-white/[0.05] bg-black/30 p-3 flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      <Server className="h-4 w-4 text-red-400/60" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-white/35">Push44 server</div>
                      <div className="text-[10px] text-red-400/50 font-medium">Does not exist</div>
                    </div>
                    <div className="ml-auto">
                      <div className="text-[10px] font-black text-red-400/40 bg-red-400/[0.08] px-2 py-1 rounded-full">0 requests</div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-white py-28 sm:py-40">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeUp className="mb-20">
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#f97316] mb-5">Simple by design</p>
            <h2 className="text-[38px] sm:text-[52px] font-black tracking-[-0.025em] leading-[1.05] text-[#0c0c0c] mb-5">
              Ready in under<br />2 minutes.
            </h2>
            <p className="text-[17px] text-[#666] leading-[1.7] max-w-lg">
              No CLI. No config files. No copy-paste. Just connect, select, and push.
            </p>
          </FadeUp>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[28px] top-12 bottom-12 w-px bg-black/[0.06] hidden sm:block" />

            <div className="space-y-12 sm:space-y-16">
              {STEPS.map(({ num, title, desc, icon: Icon }, i) => (
                <FadeUp key={num} delay={i * 0.1}>
                  <div className="flex items-start gap-6 sm:gap-8">
                    <div
                      className="relative h-14 w-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        background: i === 0 ? "#f97316" : "#f9f8f6",
                        border: i === 0 ? "none" : "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      <Icon className="h-6 w-6" style={{ color: i === 0 ? "#fff" : "#999" }} strokeWidth={1.75} />
                      <span
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full text-[9px] font-black flex items-center justify-center"
                        style={{ background: i === 0 ? "#f97316" : "#e5e5e5", color: i === 0 ? "#fff" : "#888" }}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <div className="pt-2">
                      <h3 className="text-[19px] font-bold text-[#0c0c0c] mb-2">{title}</h3>
                      <p className="text-[15px] text-[#666] leading-[1.7] max-w-md">{desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[#0c0c0c] border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[
              { num: "87+", label: "Files per push", sub: "Base44 apps" },
              { num: "4", label: "Platforms", sub: "Base44, Rocket, Floot, Zite" },
              { num: "1", label: "Commit", sub: "Atomic. Always." },
              { num: "0", label: "Servers", sub: "No backend, ever" },
            ].map(({ num, label, sub }, i) => (
              <FadeUp key={label} delay={i * 0.06}>
                <div className="py-14 px-6 border-r border-white/[0.05] last:border-0">
                  <div
                    className="text-[52px] sm:text-[60px] font-black tracking-tight leading-none mb-2"
                    style={{
                      background: i === 0 ? "linear-gradient(135deg, #fb923c, #f97316)" : "rgba(255,255,255,0.85)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {num}
                  </div>
                  <div className="text-[14px] font-bold text-white/60 mb-1">{label}</div>
                  <div className="text-[12px] text-white/25">{sub}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORMS ── */}
      <section id="platforms" className="bg-[#f9f8f6] py-28 sm:py-40">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <FadeUp className="mb-16">
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#f97316] mb-5">Platform support</p>
            <h2 className="text-[38px] sm:text-[52px] font-black tracking-[-0.025em] leading-[1.05] text-[#0c0c0c] mb-5">
              Every vibe-coding<br />platform. One tool.
            </h2>
            <p className="text-[17px] text-[#666] leading-[1.7] max-w-lg">
              Built for the four biggest AI-powered app builders. Switch platforms without changing your workflow.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORMS.map(({ id, name, tagline, desc, files, color, Logo }, i) => (
              <FadeUp key={id} delay={i * 0.07}>
                <motion.div
                  className="rounded-2xl p-6 h-full flex flex-col bg-white border border-black/[0.06]"
                  whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(0,0,0,0.08)", borderColor: `${color}40` }}
                  transition={spring}
                >
                  <div className="mb-5">
                    <Logo size={34} />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#0c0c0c] mb-1">{name}</h3>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color }}>{tagline}</p>
                  <p className="text-[13px] text-[#777] leading-relaxed flex-1">{desc}</p>
                  <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center gap-2">
                    <FileCode2 className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                    <span className="text-[12px] font-bold" style={{ color }}>{files}</span>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-white py-28 sm:py-40">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeUp className="mb-16">
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#f97316] mb-5">Loved by builders</p>
            <h2 className="text-[38px] sm:text-[52px] font-black tracking-[-0.025em] leading-[1.05] text-[#0c0c0c]">
              What developers say.
            </h2>
          </FadeUp>

          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ quote, name, role, platform, initials, color }, i) => (
              <FadeUp key={name} delay={i * 0.08}>
                <motion.div
                  className="rounded-2xl p-7 h-full flex flex-col border border-black/[0.06]"
                  whileHover={{ y: -4, borderColor: `${color}30`, boxShadow: "0 16px 40px rgba(0,0,0,0.06)" }}
                  transition={spring}
                >
                  <Quote className="h-6 w-6 mb-5" style={{ color, opacity: 0.25 }} />
                  <p className="text-[14px] text-[#333] leading-[1.75] flex-1 mb-7">"{quote}"</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
                      style={{ background: color }}
                    >
                      {initials}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#0c0c0c]">{name}</div>
                      <div className="text-[11px] text-[#999]">{role} · {platform}</div>
                    </div>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.25} className="mt-12">
            <div className="flex items-center gap-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[#f97316] text-[#f97316]" />
              ))}
              <span className="text-[13px] text-[#999] ml-1">Loved by vibe-coders building on AI platforms</span>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-[#f9f8f6] py-28 sm:py-40">
        <div className="max-w-2xl mx-auto px-5 sm:px-8">
          <FadeUp className="mb-14">
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#f97316] mb-5">Questions</p>
            <h2 className="text-[38px] sm:text-[52px] font-black tracking-[-0.025em] leading-[1.05] text-[#0c0c0c]">
              Everything you<br />need to know.
            </h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="rounded-2xl border border-black/[0.06] overflow-hidden px-6 sm:px-8" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
              {FAQS.map(({ q, a }) => (
                <FAQItem key={q} q={q} a={a} />
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-[#0c0c0c] py-40 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(249,115,22,0.14) 0%, transparent 65%)" }}
        />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <FadeUp>
            <div className="flex items-center justify-center gap-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-white/20 text-white/20" />
              ))}
            </div>
            <h2 className="text-[44px] sm:text-[64px] font-black tracking-[-0.03em] leading-[0.96] text-white mb-6">
              Your code deserves<br />version control.
            </h2>
            <p className="text-[17px] sm:text-[19px] text-white/40 leading-[1.65] max-w-xl mx-auto mb-12">
              Free forever. No sign-up. Push your Base44, Rocket.new, Floot, or Zite app to GitHub in under 2 minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to={isConnected ? "/dashboard" : "/onboarding"}>
                <motion.button
                  className="flex items-center gap-2.5 rounded-2xl px-9 py-5 text-[16px] font-bold text-white"
                  style={{ background: "#f97316", boxShadow: "0 8px 40px rgba(249,115,22,0.45)" }}
                  whileHover={{ scale: 1.04, boxShadow: "0 16px 50px rgba(249,115,22,0.65)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={spring}
                >
                  {isConnected ? "Go to Dashboard" : "Get Started Free"}
                  <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.5} />
                </motion.button>
              </Link>
              <motion.a
                href="https://github.com/The-habib/Push44"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 rounded-2xl px-9 py-5 text-[16px] font-semibold text-white/50 border border-white/10"
                whileHover={{ color: "#fff", borderColor: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.04)" }}
                transition={{ duration: 0.2 }}
              >
                <GitHubLogo className="h-4.5 w-4.5" />
                View Source
              </motion.a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#080808] border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10">

            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={appLogo} alt="Push44" className="h-8 w-8 rounded-[10px] object-cover" />
                <span className="text-[17px] font-black text-white tracking-tight">
                  Push<span className="text-[#f97316]">44</span>
                </span>
              </div>
              <p className="text-[13px] text-white/30 leading-relaxed mb-6 max-w-[220px]">
                Push your AI-generated app source code to GitHub in one tap. Free forever.
              </p>
              <motion.a
                href="https://github.com/The-habib/Push44"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold border border-white/[0.08] text-white/30"
                whileHover={{ borderColor: "rgba(249,115,22,0.5)", color: "#f97316", background: "rgba(249,115,22,0.07)" }}
                transition={{ duration: 0.2 }}
              >
                <GitHubLogo className="h-3.5 w-3.5" />
                Open Source · MIT
              </motion.a>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-white/15 mb-5">Product</h4>
              <ul className="space-y-3">
                {[
                  { label: "Get started", to: "/onboarding" },
                  { label: "Dashboard", to: "/dashboard" },
                  { label: "Push code", to: "/push" },
                  { label: "History", to: "/history" },
                  { label: "Settings", to: "/settings" },
                ].map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-[13px] text-white/30 hover:text-white/70 transition-colors font-medium">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-white/15 mb-5">Platforms</h4>
              <ul className="space-y-3">
                {[
                  { label: "Base44", href: "https://app.base44.com" },
                  { label: "Rocket.new", href: "https://rocket.new" },
                  { label: "Floot", href: "https://floot.com" },
                  { label: "Zite", href: "https://build.fillout.com" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noreferrer" className="text-[13px] text-white/30 hover:text-white/70 transition-colors font-medium">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-white/15 mb-5">Resources</h4>
              <ul className="space-y-3">
                {[
                  { label: "How it works", href: "#how-it-works" },
                  { label: "FAQ", href: "#faq" },
                  { label: "GitHub", href: "https://github.com/The-habib/Push44" },
                  { label: "Sitemap", href: "/sitemap.xml" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="text-[13px] text-white/30 hover:text-white/70 transition-colors font-medium">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
        <div className="border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-white/15 font-medium">
              © 2025–{new Date().getFullYear()} Push44 — MIT License
            </p>
            <div className="flex items-center gap-4 text-[11px] text-white/10 font-medium">
              <span>Free forever</span>
              <span className="h-1 w-1 rounded-full bg-white/10" />
              <span>No servers</span>
              <span className="h-1 w-1 rounded-full bg-white/10" />
              <span>No tracking</span>
              <span className="h-1 w-1 rounded-full bg-white/10" />
              <span>Open source</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
