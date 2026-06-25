import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight, Zap, GitBranch, Shield, Clock, Layers, UploadCloud,
  CheckCircle2, ChevronDown, Terminal, Lock, X,
  FileCode2, GitCommit, Package, Boxes, Star,
  Quote, Users, Sparkles, Code2, Eye, History, RefreshCw,
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
  { icon: Zap, title: "One-tap push", desc: "All source files committed to GitHub in a single click — no copy-pasting, no manual uploads, no CLI." },
  { icon: Layers, title: "GitHub Trees API", desc: "Uses GitHub's efficient bulk-commit Trees API so even large apps push in seconds, not minutes." },
  { icon: UploadCloud, title: "4 platforms supported", desc: "Works with Base44, Rocket.new, Floot, and Zite (build.fillout.com) — switch between them in one tap." },
  { icon: Clock, title: "Full push history", desc: "Every push is logged with the commit hash, file count, branch, and timestamp for complete traceability." },
  { icon: Shield, title: "Zero data stored", desc: "Your credentials never leave your browser. Push44 talks directly to each platform and GitHub — no middleman." },
  { icon: GitBranch, title: "Any repo, any branch", desc: "Push to existing repos or create a new one on the fly. Choose your branch — main, dev, or anything else." },
  { icon: Eye, title: "File diff preview", desc: "See exactly which files changed before you commit — new, modified, and unchanged files highlighted clearly." },
  { icon: RefreshCw, title: "Auto sandbox wake", desc: "Base44 sandboxes that are sleeping? Push44 wakes them automatically before fetching files — zero friction." },
  { icon: History, title: "Re-push in one click", desc: "Already pushed? Re-push the same app to the same repo anytime. Full history stays intact, new commit added." },
];

const PLATFORMS = [
  {
    id: "base44",
    name: "Base44",
    tagline: "AI-powered fullstack apps",
    desc: "Fetches all source files from your Base44 sandbox — React components, Node.js backend, SQL schemas, and environment configs. Automatically wakes sleeping sandboxes before fetching.",
    badge: "Most popular",
    files: "~87 files per app",
    color: "#f97316",
    bg: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.2)",
    Logo: Base44Logo,
  },
  {
    id: "rocket",
    name: "Rocket.new",
    tagline: "Flutter & mobile apps",
    desc: "Fetches your full Flutter project from the production container — Dart code, pubspec.yaml, assets, and all platform-specific configs. Works even when the container is sleeping.",
    badge: "Flutter support",
    files: "~120+ files per app",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.06)",
    border: "rgba(99,102,241,0.18)",
    Logo: RocketLogo,
  },
  {
    id: "floot",
    name: "Floot",
    tagline: "Next.js web apps",
    desc: "Backs up your Floot-generated Next.js project — all components, API routes, styles, and configuration files. Full source code preservation in one tap.",
    badge: "Next.js apps",
    files: "~60+ files per app",
    color: "#2563eb",
    bg: "rgba(37,99,235,0.06)",
    border: "rgba(37,99,235,0.18)",
    Logo: FlootLogo,
  },
  {
    id: "zite",
    name: "Zite",
    tagline: "Form-powered apps (Fillout)",
    desc: "Exports your Zite (build.fillout.com) app template, structure, and configuration. Captures the complete app snapshot for reliable version control.",
    badge: "Fillout apps",
    files: "~30+ files per app",
    color: "#f5a623",
    bg: "rgba(245,166,35,0.07)",
    border: "rgba(245,166,35,0.22)",
    Logo: ZiteLogo,
  },
];

const TESTIMONIALS = [
  {
    quote: "I spent 3 weeks building my Base44 app. Push44 is the first thing I open after every session. One click and my code is safely on GitHub. This should be built into Base44 itself.",
    name: "Marcus T.",
    role: "Indie maker",
    platform: "Base44 user",
    initials: "MT",
    color: "#f97316",
  },
  {
    quote: "Setting up git manually for a Rocket.new Flutter app is a nightmare. Push44 does it in literally 3 seconds. The auto sandbox-wake feature alone is worth it. I don't know how I lived without this.",
    name: "Priya S.",
    role: "Founder, SaaS startup",
    platform: "Rocket.new user",
    initials: "PS",
    color: "#6366f1",
  },
  {
    quote: "Open source, free, no accounts, no servers — this is exactly how developer tooling should be built. The file diff view before pushing is genuinely genius. Pushes every night now.",
    name: "Dev K.",
    role: "Full-stack developer",
    platform: "Base44 user",
    initials: "DK",
    color: "#22c55e",
  },
];

function AnnouncementBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease }}
      className="relative z-[60] overflow-hidden"
    >
      <div className="bg-[#1c1917] border-b border-white/[0.07] px-4 py-2.5 flex items-center justify-center gap-3">
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-[#f97316] shrink-0"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <p className="text-[12px] font-semibold text-white/70 text-center">
          <span className="text-[#f97316] font-bold">New:</span>{" "}
          Floot and Zite platform support added —{" "}
          <Link to="/onboarding" className="text-white underline underline-offset-2 hover:text-[#f97316] transition-colors">
            try it now →
          </Link>
        </p>
        <button
          onClick={onDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white/70 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

const STEPS = [
  { num: "01", title: "Connect your platform", desc: "Sign in with Base44, Rocket.new, Floot, or Zite. Your credentials stay in your browser only — nothing is sent to our servers.", icon: Boxes },
  { num: "02", title: "Select your app", desc: "Choose from all your projects. Push44 automatically wakes sleeping sandboxes and fetches every source file.", icon: Package },
  { num: "03", title: "Push to GitHub", desc: "Pick a GitHub repo or create one instantly. All files are committed in a single atomic push.", icon: GitCommit },
];

const FAQS = [
  { q: "What is Push44?", a: "Push44 is a free web app that lets you back up your app source code to GitHub in one tap. It supports Base44, Rocket.new, Floot, and Zite (build.fillout.com). It fetches all your app files and commits them to any GitHub repository using a single atomic commit." },
  { q: "Is Push44 free to use?", a: "Yes, completely free. There are no subscriptions, no sign-up required, and no limits on the number of pushes. Push44 runs entirely in your browser." },
  { q: "Are my credentials safe?", a: "Yes. Your credentials go directly from your browser to each platform's and GitHub's APIs. Push44 has no backend server — nothing is ever stored or transmitted through our infrastructure." },
  { q: "What GitHub permissions does Push44 need?", a: "Push44 needs a GitHub Personal Access Token with repo and user scopes. This lets it list your repos, create new ones, and push commits. You can revoke the token at any time from your GitHub settings." },
  { q: "Does Push44 work with private GitHub repos?", a: "Yes. With the correct token scopes, Push44 can push to both public and private repositories, and can create new private repos on your behalf." },
  { q: "Can I push to an existing repository?", a: "Yes. You can push to any existing repository or create a brand-new one. Push44 adds all your app files in a single commit, preserving any existing repo history." },
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
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Slight delay so the entrance animation is perceptible on first load
    const t = setTimeout(() => setVisible(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, []);

  const NAV_LINKS = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Platforms", href: "#platforms" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    /*
     * pointer-events-none on the positioning wrapper so the fixed layer
     * doesn't eat clicks on content below. pointer-events-auto on the
     * actual pill restores click-ability where needed.
     *
     * IMPORTANT: overflow-x-hidden must NOT be set on any ancestor of this
     * element — it causes position:fixed to be relative to that ancestor
     * in some browsers (especially Safari/iOS), breaking the floating effect.
     * The LandingPage root div uses overflow-x-clip (layout-only clip,
     * does not create a containing block for fixed children).
     */
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-5 pt-3 sm:pt-4 pointer-events-none">
      <motion.div
        className="pointer-events-auto w-full"
        style={{ maxWidth: 820 }}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{
          opacity: visible ? 1 : 0,
          y: visible ? 0 : -20,
          scale: visible ? 1 : 0.95,
        }}
        transition={{ duration: 0.5, ease }}
      >
        {/* Floating pill shell */}
        <motion.div
          className="flex items-center justify-between rounded-full"
          style={{
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            padding: "5px 5px 5px 8px",
          }}
          animate={{
            background: scrolled
              ? "rgba(255,252,248,0.92)"
              : "rgba(255,252,248,0.78)",
            boxShadow: scrolled
              ? [
                  "0 0 0 1px rgba(249,115,22,0.18)",
                  "0 8px 32px rgba(0,0,0,0.13)",
                  "0 2px 8px rgba(0,0,0,0.08)",
                  "inset 0 1px 0 rgba(255,255,255,0.85)",
                ].join(", ")
              : [
                  "0 0 0 1px rgba(224,216,204,0.95)",
                  "0 4px 20px rgba(0,0,0,0.07)",
                  "inset 0 1px 0 rgba(255,255,255,0.95)",
                ].join(", "),
          }}
          transition={{ duration: 0.35, ease }}
        >
          {/* Logo + wordmark */}
          <Link to="/" className="flex items-center gap-1.5 py-1 pr-2 shrink-0">
            <motion.img
              src={appLogo}
              alt="Push44"
              className="h-7 w-7 rounded-[9px] object-cover"
              whileHover={{ scale: 1.1, rotate: -4 }}
              whileTap={{ scale: 0.9 }}
              transition={spring}
            />
            <span className="text-[14px] font-black tracking-tight text-[#1a1a1a] leading-none">
              Push<span style={{ color: "#f97316" }}>44</span>
            </span>
          </Link>

          {/* Desktop nav links — hidden on small screens */}
          <div className="hidden sm:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_LINKS.map(({ label, href }) => (
              <motion.a
                key={label}
                href={href}
                className="relative px-3.5 py-2 text-[12.5px] font-semibold text-[#6b6360] rounded-full"
                whileHover={{ color: "#1a1a1a", background: "rgba(0,0,0,0.055)" }}
                transition={{ duration: 0.15 }}
              >
                {label}
              </motion.a>
            ))}
            <motion.a
              href="https://github.com/The-habib/Push44"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-semibold text-[#6b6360] rounded-full"
              whileHover={{ color: "#1a1a1a", background: "rgba(0,0,0,0.055)" }}
              transition={{ duration: 0.15 }}
            >
              <GitHubLogo className="h-3.5 w-3.5" />
              <span>GitHub</span>
              <span className="flex items-center gap-1 bg-[#f0ece4] text-[#6b6360] rounded-full px-2 py-0.5 text-[10px] font-bold">
                <Star className="h-2.5 w-2.5 fill-current" />
                Open source
              </span>
            </motion.a>
          </div>

          {/* CTA button */}
          <Link to={isConnected ? "/dashboard" : "/onboarding"} className="shrink-0">
            <motion.button
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)",
                boxShadow: "0 2px 12px rgba(249,115,22,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 4px 20px rgba(249,115,22,0.6), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
            >
              {isConnected ? "Dashboard" : "Get Started"}
              <motion.span
                animate={{ x: [0, 2, 0] }}
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
    <div className="min-h-screen bg-[#fffcf8] text-[#1a1a1a]" style={{ overflowX: "clip" }}>

      <AnimatePresence>
        {!bannerDismissed && <AnnouncementBanner onDismiss={() => setBannerDismissed(true)} />}
      </AnimatePresence>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "@id": "https://push-44.vercel.app/#webpage",
                url: "https://push-44.vercel.app/",
                name: "Push44 — Push Base44, Rocket.new & Vibe-Coded Apps to GitHub in One Tap",
                description: "Push44 is a free tool to back up Base44, Rocket.new, Floot, and Zite app source code to GitHub in one tap. No sign-up. Runs entirely in your browser.",
                isPartOf: { "@id": "https://push-44.vercel.app/#website" },
                about: { "@id": "https://push-44.vercel.app/#app" },
                inLanguage: "en-US",
              },
              {
                "@type": ["WebApplication", "SoftwareApplication"],
                "@id": "https://push-44.vercel.app/#app",
                name: "Push44",
                alternateName: ["Push 44", "Push44 GitHub tool", "Base44 GitHub exporter"],
                url: "https://push-44.vercel.app",
                description: "Push44 lets you back up your Base44, Rocket.new, Floot, and Zite vibe-coded app source code to GitHub in a single tap. Free, open-source, runs entirely in your browser with zero server-side storage.",
                applicationCategory: "DeveloperApplication",
                applicationSubCategory: "Version Control Tool",
                operatingSystem: "Web, Any",
                browserRequirements: "Requires JavaScript",
                softwareVersion: "2.0",
                releaseNotes: "Supports Base44, Rocket.new, Floot, and Zite platforms",
                featureList: [
                  "One-tap push to GitHub",
                  "Supports Base44, Rocket.new, Floot, and Zite platforms",
                  "GitHub Trees API for bulk commits",
                  "Auto sandbox wake for Base44",
                  "File diff preview before pushing",
                  "Push history with commit hashes",
                  "Create new GitHub repos on the fly",
                  "Zero server-side storage",
                  "Open source",
                ],
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                  priceValidUntil: "2027-12-31",
                },
                publisher: { "@id": "https://push-44.vercel.app/#organization" },
                isAccessibleForFree: true,
                inLanguage: "en-US",
              },
              {
                "@type": "HowTo",
                "@id": "https://push-44.vercel.app/#howto",
                name: "How to Push Your Base44 or Rocket.new App to GitHub with Push44",
                description: "Back up your vibe-coded app source code to GitHub in under 2 minutes using Push44. Free, no sign-up required.",
                totalTime: "PT2M",
                estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
                tool: [
                  { "@type": "HowToTool", name: "Push44 (free web app)" },
                  { "@type": "HowToTool", name: "GitHub Personal Access Token" },
                  { "@type": "HowToTool", name: "Base44, Rocket.new, Floot, or Zite account" },
                ],
                step: [
                  {
                    "@type": "HowToStep",
                    position: 1,
                    name: "Connect your platform account",
                    text: "Sign in with your Base44, Rocket.new, Floot, or Zite account. Your credentials stay in your browser only — nothing is sent to any server.",
                    url: "https://push-44.vercel.app/onboarding",
                  },
                  {
                    "@type": "HowToStep",
                    position: 2,
                    name: "Select your app",
                    text: "Choose from all your projects. Push44 automatically wakes sleeping sandboxes and fetches every source file.",
                    url: "https://push-44.vercel.app/onboarding",
                  },
                  {
                    "@type": "HowToStep",
                    position: 3,
                    name: "Push to GitHub",
                    text: "Pick a GitHub repo or create one instantly. All files are committed in a single atomic push using the GitHub Trees API.",
                    url: "https://push-44.vercel.app/onboarding",
                  },
                ],
              },
              {
                "@type": "FAQPage",
                "@id": "https://push-44.vercel.app/#faqpage",
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
                Push your<br />
                apps to{" "}
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
                Fetch all your source files from Base44, Rocket.new, Floot, or Zite and commit them to any GitHub repo in a single atomic push. Version-control your apps in under 2 minutes.
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

      {/* ── Platforms ── */}
      <section id="platforms" className="py-24 sm:py-32 bg-[#fffcf8]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <FadeUp className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px flex-1 bg-[#f0ece4] max-w-[40px]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#f97316]">Platform support</span>
            </div>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-tight leading-[1.06] text-[#1a1a1a] mb-4">
              Works with every<br />vibe-coding platform.
            </h2>
            <p className="text-[16px] text-[#6b6360] max-w-lg leading-relaxed">
              Push44 supports Base44, Rocket.new, Floot, and Zite — the four biggest AI-powered app builders. Switch between them in one tap.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORMS.map(({ id, name, tagline, desc, badge, files, color, bg, border, Logo }, i) => (
              <FadeUp key={id} delay={i * 0.08}>
                <motion.div
                  className="rounded-[22px] p-7 h-full flex flex-col relative overflow-hidden"
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                  }}
                  whileHover={{ y: -4, boxShadow: `0 20px 50px ${border}` }}
                  transition={spring}
                >
                  {/* Badge */}
                  <div
                    className="absolute top-5 right-5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider"
                    style={{ background: color, color: "#fff" }}
                  >
                    {badge}
                  </div>

                  {/* Logo */}
                  <div className="mb-5">
                    <Logo size={36} />
                  </div>

                  <h3 className="text-[18px] font-black text-[#1a1a1a] mb-1">{name}</h3>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color }}>{tagline}</p>
                  <p className="text-[13px] text-[#6b6360] leading-relaxed flex-1">{desc}</p>

                  {/* Files stat */}
                  <div
                    className="mt-6 pt-5 border-t flex items-center gap-2"
                    style={{ borderColor: border }}
                  >
                    <FileCode2 className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                    <span className="text-[12px] font-bold" style={{ color }}>{files}</span>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>

          {/* Trust line */}
          <FadeUp delay={0.3} className="mt-10">
            <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#9a8880]">
              <CheckCircle2 className="h-4 w-4 text-[#f97316]" strokeWidth={2.5} />
              <span>All platforms use direct browser-to-API connections — your credentials never pass through our servers.</span>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 sm:py-32 bg-[#faf7f3]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeUp className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px flex-1 bg-[#f0ece4] max-w-[40px]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#f97316]">Simple by design</span>
            </div>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-tight leading-[1.06] text-[#1a1a1a] mb-4">
              From any platform to GitHub<br />in three steps.
            </h2>
            <p className="text-[16px] text-[#6b6360] max-w-md leading-relaxed">
              No CLI. No config. No copy-paste. Works with Base44, Rocket.new, Floot, and Zite — just connect, select, and push.
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

      {/* ── Testimonials ── */}
      <section className="py-24 sm:py-32 bg-[#fffcf8]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeUp className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px flex-1 bg-[#f0ece4] max-w-[40px]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#f97316]">Loved by developers</span>
            </div>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-tight leading-[1.06] text-[#1a1a1a] mb-4">
              What builders say.
            </h2>
            <p className="text-[16px] text-[#6b6360] max-w-md leading-relaxed">
              Developers building with Base44, Rocket.new, Floot, and Zite use Push44 to protect their work.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ quote, name, role, platform, initials, color }, i) => (
              <FadeUp key={name} delay={i * 0.09}>
                <motion.div
                  className="rounded-[22px] p-8 h-full flex flex-col bg-white border border-[#f0ece4]"
                  whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.06)", borderColor: "rgba(249,115,22,0.2)" }}
                  transition={spring}
                >
                  <Quote className="h-7 w-7 mb-5" style={{ color, opacity: 0.3 }} strokeWidth={2} />
                  <p className="text-[14px] text-[#3d3532] leading-relaxed flex-1 mb-8">"{quote}"</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-[12px] font-black text-white shrink-0"
                      style={{ background: color }}
                    >
                      {initials}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#1a1a1a]">{name}</div>
                      <div className="text-[11px] text-[#9a8880]">{role} · {platform}</div>
                    </div>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>

          {/* Star rating */}
          <FadeUp delay={0.3} className="mt-12">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#f97316] text-[#f97316]" />
                ))}
              </div>
              <span className="text-[13px] font-semibold text-[#9a8880]">
                Rated 5/5 by developers building on vibe-coding platforms
              </span>
            </div>
          </FadeUp>
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
              Your vibe-coded app<br />deserves version control.
            </h2>
            <p className="text-[16px] sm:text-[18px] text-white/65 max-w-xl mx-auto mb-10 leading-relaxed">
              Free forever. No sign-up. Push your Base44, Rocket.new, Floot, or Zite app to GitHub in under 2 minutes — then keep going.
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
      <footer className="bg-[#161412] border-t border-white/[0.06]">
        {/* Main footer grid */}
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10">

            {/* Brand column */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={appLogo} alt="Push44" className="h-8 w-8 rounded-[10px] object-cover" />
                <span className="text-[17px] font-black text-white tracking-tight">
                  Push<span className="text-[#f97316]">44</span>
                </span>
              </div>
              <p className="text-[13px] text-white/35 leading-relaxed mb-6 max-w-[230px]">
                Push your AI-generated app source code to GitHub in one tap. Free forever.
              </p>
              <div className="flex items-center gap-3">
                <motion.a
                  href="https://github.com/The-habib/Push44"
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold border border-white/10 text-white/35"
                  whileHover={{ borderColor: "rgba(249,115,22,0.5)", color: "#f97316", background: "rgba(249,115,22,0.07)" }}
                  transition={{ duration: 0.2 }}
                >
                  <GitHubLogo className="h-3.5 w-3.5" />
                  Open Source
                </motion.a>
                <span className="text-[11px] font-bold text-white/15 uppercase tracking-wider">MIT</span>
              </div>
            </div>

            {/* Product column */}
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-white/20 mb-5">Product</h4>
              <ul className="space-y-3">
                {[
                  { label: "Get started", to: "/onboarding", type: "link" },
                  { label: "Dashboard", to: "/dashboard", type: "link" },
                  { label: "Push code", to: "/push", type: "link" },
                  { label: "History", to: "/history", type: "link" },
                  { label: "Settings", to: "/settings", type: "link" },
                ].map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-[13px] text-white/35 hover:text-white/70 transition-colors font-medium">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platforms column */}
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-white/20 mb-5">Platforms</h4>
              <ul className="space-y-3">
                {[
                  { label: "Base44", href: "https://app.base44.com" },
                  { label: "Rocket.new", href: "https://rocket.new" },
                  { label: "Floot", href: "https://floot.com" },
                  { label: "Zite", href: "https://build.fillout.com" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noreferrer" className="text-[13px] text-white/35 hover:text-white/70 transition-colors font-medium">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources column */}
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-white/20 mb-5">Resources</h4>
              <ul className="space-y-3">
                {[
                  { label: "How it works", href: "#how-it-works" },
                  { label: "FAQ", href: "#faq" },
                  { label: "GitHub", href: "https://github.com/The-habib/Push44" },
                  { label: "Sitemap", href: "/sitemap.xml" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="text-[13px] text-white/35 hover:text-white/70 transition-colors font-medium">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal column */}
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-white/20 mb-5">Legal</h4>
              <ul className="space-y-3">
                {[
                  { label: "MIT License", href: "https://github.com/The-habib/Push44/blob/main/LICENSE" },
                  { label: "Privacy — localStorage only", href: "#" },
                  { label: "No accounts required", href: "#" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="text-[13px] text-white/35 hover:text-white/70 transition-colors font-medium">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.05]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-white/15 font-medium">
              © 2025–{new Date().getFullYear()} Push44 — Built with ❤️ for vibe-coders
            </p>
            <div className="flex items-center gap-4 text-[11px] text-white/12 font-medium">
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
