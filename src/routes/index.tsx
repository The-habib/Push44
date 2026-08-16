import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  GitBranch,
  EyeOff,
  Download,
  Terminal,
  Check,
  ChevronDown,
  Sparkles,
  Smartphone,
  Cpu,
  Layers,
  FileCode2,
  RefreshCw,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CliShowcase } from "@/components/CliShowcase";
import {
  Base44Logo,
  RocketLogo,
  FlootLogo,
  ZiteLogo,
  BoltLogo,
  LovableLogo,
  FramerLogo,
  GitHubLogo,
} from "@/components/BrandLogos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Push44 — Export AI Code to GitHub in Browser & Terminal CLI. Free Forever." },
      {
        name: "description",
        content:
          "Push44 lets you export full source code from Base44, Framer, Lovable, Rocket.new, Floot, Zite, and bolt.new directly to GitHub. Available as a web app and terminal CLI (p44). Zero backend, 100% free.",
      },
      {
        name: "keywords",
        content:
          "AI app export, Base44 GitHub export, Framer code export, Lovable export, Rocket.new APK build, Floot export, Zite export, AI code ownership, Push44 CLI, vibe coding terminal",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Push44 — Export AI-Generated Code Free (Web & CLI)" },
      {
        property: "og:description",
        content:
          "Bypass export restrictions. Keep 100% ownership. Push to GitHub instantly via browser or terminal.",
      },
      { property: "og:url", content: "https://push44.vercel.app" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://push44.vercel.app" }],
  }),
  component: LandingPage,
});

// ── Interactive Live Push Simulator ──────────────────────────────────────────

type SimPlatformKey = "base44" | "framer" | "lovable" | "rocket" | "floot" | "zite" | "bolt";

interface PlatformSimData {
  name: string;
  repo: string;
  branch: string;
  filesChanged: number;
  added: number;
  modified: number;
  deleted: number;
  files: { name: string; status: "Added" | "Modified" | "Unchanged"; color: string }[];
  tag: string;
  color: string;
}

const SIM_PLATFORMS: Record<SimPlatformKey, PlatformSimData> = {
  base44: {
    name: "Base44",
    repo: "my-ai-crm-app",
    branch: "main",
    filesChanged: 34,
    added: 26,
    modified: 8,
    deleted: 0,
    files: [
      { name: "src/App.tsx", status: "Modified", color: "#f97316" },
      { name: "src/components/Dashboard.tsx", status: "Added", color: "#22c55e" },
      { name: "src/api/customers.ts", status: "Added", color: "#22c55e" },
      { name: "package.json", status: "Modified", color: "#f97316" },
    ],
    tag: "Full Source & Schema",
    color: "#ff5500",
  },
  framer: {
    name: "Framer",
    repo: "saas-landing-site",
    branch: "main",
    filesChanged: 28,
    added: 22,
    modified: 6,
    deleted: 0,
    files: [
      { name: "src/components/HeroSection.tsx", status: "Added", color: "#22c55e" },
      { name: "src/styles/tokens.css", status: "Added", color: "#22c55e" },
      { name: "src/cms/blog-posts.json", status: "Added", color: "#22c55e" },
      { name: "src/App.tsx", status: "Modified", color: "#f97316" },
    ],
    tag: "React 19 & CRDT Sync",
    color: "#0055ff",
  },
  lovable: {
    name: "Lovable",
    repo: "vibecoded-marketplace",
    branch: "main",
    filesChanged: 42,
    added: 35,
    modified: 7,
    deleted: 0,
    files: [
      { name: "src/pages/Index.tsx", status: "Modified", color: "#f97316" },
      { name: "src/components/ProductGrid.tsx", status: "Added", color: "#22c55e" },
      { name: "supabase/functions/checkout.ts", status: "Added", color: "#22c55e" },
      { name: "tailwind.config.ts", status: "Modified", color: "#f97316" },
    ],
    tag: "Vite + Tailwind + Supabase",
    color: "#f43f5e",
  },
  rocket: {
    name: "Rocket.new",
    repo: "mobile-fleet-tracker",
    branch: "main",
    filesChanged: 19,
    added: 15,
    modified: 4,
    deleted: 0,
    files: [
      { name: "src/screens/HomeScreen.tsx", status: "Modified", color: "#f97316" },
      { name: "android/app/build.gradle", status: "Added", color: "#22c55e" },
      { name: "src/navigation/RootNavigator.tsx", status: "Added", color: "#22c55e" },
      { name: "capacitor.config.json", status: "Modified", color: "#f97316" },
    ],
    tag: "Source + Cloud APK",
    color: "#ea580c",
  },
  floot: {
    name: "Floot",
    repo: "design-portfolio",
    branch: "main",
    filesChanged: 16,
    added: 12,
    modified: 4,
    deleted: 0,
    files: [
      { name: "src/views/Showcase.tsx", status: "Modified", color: "#f97316" },
      { name: "src/components/Gallery.tsx", status: "Added", color: "#22c55e" },
      { name: "src/styles/sketch.css", status: "Modified", color: "#f97316" },
      { name: "package.json", status: "Modified", color: "#f97316" },
    ],
    tag: "Magic Link Export",
    color: "#8b5cf6",
  },
  zite: {
    name: "Zite",
    repo: "internal-portal",
    branch: "main",
    filesChanged: 24,
    added: 18,
    modified: 6,
    deleted: 0,
    files: [
      { name: "src/templates/Dashboard.tsx", status: "Added", color: "#22c55e" },
      { name: "src/lib/auth-client.ts", status: "Added", color: "#22c55e" },
      { name: "src/styles/theme.css", status: "Modified", color: "#f97316" },
      { name: "src/main.tsx", status: "Modified", color: "#f97316" },
    ],
    tag: "Full Snapshot Engine",
    color: "#0284c7",
  },
  bolt: {
    name: "bolt.new",
    repo: "analytics-engine",
    branch: "main",
    filesChanged: 31,
    added: 25,
    modified: 6,
    deleted: 0,
    files: [
      { name: "app/routes/_index.tsx", status: "Modified", color: "#f97316" },
      { name: "app/components/Chart.tsx", status: "Added", color: "#22c55e" },
      { name: "app/styles/custom.css", status: "Modified", color: "#f97316" },
      { name: "package.json", status: "Modified", color: "#f97316" },
    ],
    tag: "Badge Removal & Sync",
    color: "#eab308",
  },
};

function InteractiveProductMockup() {
  const [selectedKey, setSelectedKey] = useState<SimPlatformKey>("base44");
  const [isPushed, setIsPushed] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  const active = SIM_PLATFORMS[selectedKey];

  const handleSimulatePush = () => {
    if (isPushing || isPushed) return;
    setIsPushing(true);
    setTimeout(() => {
      setIsPushing(false);
      setIsPushed(true);
      setTimeout(() => setIsPushed(false), 3500);
    }, 900);
  };

  return (
    <div
      style={{
        background: "#0c0a09",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid #292524",
        boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
        maxWidth: 580,
        width: "100%",
        margin: "0 auto",
        textAlign: "left",
      }}
    >
      {/* Chrome Window Header */}
      <div
        style={{
          background: "#171412",
          borderBottom: "1px solid #292524",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {["#ef4444", "#f97316", "#22c55e"].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }} />
          ))}
          <span style={{ fontSize: 11, color: "#78716c", fontFamily: "monospace", marginLeft: 8 }}>
            push44.vercel.app/push
          </span>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(34,197,94,0.12)",
            color: "#4ade80",
            padding: "3px 9px",
            borderRadius: 99,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80" }} />
          100% Client-Side
        </div>
      </div>

      {/* Platform Selector Tabs */}
      <div
        style={{
          padding: "12px 16px",
          background: "#14110f",
          borderBottom: "1px solid #24201d",
          display: "flex",
          alignItems: "center",
          gap: 6,
          overflowX: "auto",
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: "#78716c", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>
          Platform:
        </span>
        {(Object.keys(SIM_PLATFORMS) as SimPlatformKey[]).map((key) => {
          const item = SIM_PLATFORMS[key];
          const isSel = selectedKey === key;
          return (
            <button
              key={key}
              onClick={() => {
                setSelectedKey(key);
                setIsPushed(false);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: isSel ? "#ff5500" : "rgba(255,255,255,0.04)",
                color: isSel ? "#ffffff" : "#a8a29e",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      {/* App Body */}
      <div style={{ padding: "20px 22px" }}>
        {/* Repo Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <GitHubLogo size={16} className="text-stone-300" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fafaf9", fontFamily: "monospace" }}>
                github.com/user/{active.repo}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#78716c", marginTop: 3 }}>
              Source: <strong style={{ color: "#e7e5e4" }}>{active.name}</strong> · Branch: <span style={{ color: "#ff5500" }}>{active.branch}</span> · {active.tag}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "#4ade80",
              background: "rgba(34,197,94,0.08)",
              padding: "4px 9px",
              borderRadius: 6,
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80" }} />
            Ready
          </div>
        </div>

        {/* Diff Statistics */}
        <div
          style={{
            display: "flex",
            marginBottom: 16,
            border: "1px solid #292524",
            borderRadius: 10,
            overflow: "hidden",
            background: "#14110f",
          }}
        >
          {[
            { n: `${active.filesChanged}`, label: "CHANGED", c: "#fafaf9", bg: "transparent" },
            { n: `+${active.added}`, label: "ADDED", c: "#4ade80", bg: "rgba(34,197,94,0.06)" },
            { n: `~${active.modified}`, label: "MODIFIED", c: "#fb923c", bg: "rgba(249,115,22,0.06)" },
            { n: `${active.deleted}`, label: "DELETED", c: "#78716c", bg: "transparent" },
          ].map((s, i) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "10px 0",
                background: s.bg,
                borderLeft: i > 0 ? "1px solid #292524" : "none",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 9, color: "#78716c", fontWeight: 700, letterSpacing: "0.08em", marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* File Preview Tree */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            border: "1px solid #292524",
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 18,
            background: "#120f0d",
          }}
        >
          {active.files.map((row, i) => (
            <div
              key={row.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 14px",
                borderTop: i > 0 ? "1px solid #1f1b18" : "none",
              }}
            >
              <span style={{ fontSize: 12, color: "#d6d3d1", fontFamily: "ui-monospace, monospace" }}>
                {row.name}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: row.color,
                  background: `${row.color}15`,
                  padding: "2px 7px",
                  borderRadius: 4,
                }}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <motion.button
          onClick={handleSimulatePush}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          disabled={isPushing}
          style={{
            width: "100%",
            background: isPushed ? "#16a34a" : "#ff5500",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 14,
            borderRadius: 10,
            padding: "13px 0",
            textAlign: "center",
            border: "none",
            cursor: "pointer",
            letterSpacing: "-0.01em",
            boxShadow: isPushed
              ? "0 4px 20px rgba(34,197,94,0.35)"
              : "0 4px 20px rgba(255,85,0,0.35)",
            transition: "background 0.2s, box-shadow 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {isPushing ? (
            <>
              <RefreshCw size={15} style={{ animation: "spin 0.8s linear infinite" }} />
              Pushing blobs to GitHub Trees API...
            </>
          ) : isPushed ? (
            <>
              <Check size={16} strokeWidth={3} />
              Commit 8c4f9a2 Pushed to GitHub ✓
            </>
          ) : (
            <>
              <GitBranch size={15} />
              Push {active.name} Code to GitHub →
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

// ── Supported Platforms Data ─────────────────────────────────────────────────

const PLATFORMS_GRID = [
  {
    name: "Base44",
    logoComponent: Base44Logo,
    slug: "base44",
    tagline: "Full source code & schema extractor",
    features: ["Auto File Discovery", "Google Auth Switcher", "Atomic Tree Push"],
    badge: "Full Export",
  },
  {
    name: "Framer",
    logoComponent: FramerLogo,
    slug: "framer",
    tagline: "React 19 + Framer Motion synthesis",
    features: ["CRDT Multiplayer Sync", "Design Tokens CSS", "Template Duplication"],
    badge: "New Release",
  },
  {
    name: "Lovable",
    logoComponent: LovableLogo,
    slug: "lovable",
    tagline: "Vite + Tailwind + Supabase sync",
    features: ["Badge Removal", "Full Workspace Trees", "Snapshot Diffing"],
    badge: "Popular",
  },
  {
    name: "Rocket.new",
    logoComponent: RocketLogo,
    slug: "rocket-new",
    tagline: "Code sync + Cloud APK builder",
    features: ["Live Container Extraction", "Android Cloud Build", "Direct GitHub Commit"],
    badge: "APK Builder",
  },
  {
    name: "Floot",
    logoComponent: FlootLogo,
    slug: "floot",
    tagline: "Magic link NextAuth extraction",
    features: ["Full Project Source", "CSS Injection", "Instant Versioning"],
    badge: "Web Publish",
  },
  {
    name: "Zite",
    logoComponent: ZiteLogo,
    slug: "zite",
    tagline: "Fillout & template snapshot engine",
    features: ["Directory Tree Sync", "Conversation API", "No Lock-in"],
    badge: "Snapshot Engine",
  },
  {
    name: "bolt.new",
    logoComponent: BoltLogo,
    slug: "bolt-new",
    tagline: "One-click 'Made in Bolt' badge eraser",
    features: ["Permanent Badge Removal", "StackBlitz Auth", "Repository Sync"],
    badge: "Badge Remover",
  },
];

// ── Bento Features ───────────────────────────────────────────────────────────

const BENTO_FEATURES = [
  {
    title: "Atomic GitHub Trees Push",
    subtitle: "High-Speed Git Engine",
    desc: "Commits 500+ files directly in under 4 seconds by creating blob trees in memory. No git clone, no local disk bloat, zero merge corruption.",
    icon: Zap,
    stat: "< 4s",
    statLabel: "Average Push Time",
    colSpan: "lg:col-span-2",
    accent: "#ff5500",
  },
  {
    title: "100% Zero-Backend Architecture",
    subtitle: "Absolute Privacy Guarantee",
    desc: "Push44 runs entirely in your browser and terminal. Your API keys, tokens, and source code NEVER touch any server operated by us.",
    icon: ShieldCheck,
    stat: "0",
    statLabel: "Backend Servers / Databases",
    colSpan: "lg:col-span-1",
    accent: "#22c55e",
  },
  {
    title: "Smart Visual Diff Tracking",
    subtitle: "Granular Version Control",
    desc: "Inspect exactly which files were added, modified, unchanged, or deleted before pushing. Roll back anytime using standard Git history.",
    icon: GitBranch,
    stat: "100%",
    statLabel: "Diff Transparency",
    colSpan: "lg:col-span-1",
    accent: "#3b82f6",
  },
  {
    title: "Cloud Mobile APK Compilation",
    subtitle: "Native Android Builds",
    desc: "Trigger cloud Android APK builds for Rocket.new apps without installing Android Studio, Java SDKs, or Gradle toolchains locally.",
    icon: Smartphone,
    stat: "APK",
    statLabel: "Direct Download",
    colSpan: "lg:col-span-1",
    accent: "#ea580c",
  },
  {
    title: "Universal Terminal CLI (p44)",
    subtitle: "Developer First",
    desc: "Run `push44 sync`, `push44 inspect`, and `push44 doctor` directly in Cursor, VS Code, or Linux terminal with automated AI commit messages.",
    icon: Terminal,
    stat: "CLI",
    statLabel: "Cursor & VS Code Ready",
    colSpan: "lg:col-span-1",
    accent: "#a855f7",
  },
];

// ── FAQ Accordion ───────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Is Push44 truly 100% free forever?",
    a: "Yes. Push44 is completely free. There are no trials, no paid plans, no subscription limits, and no credit card required. We built it to ensure developer sovereignty and code ownership.",
  },
  {
    q: "How does Push44 export code without a backend server?",
    a: "Push44 runs entirely client-side inside your browser (or locally via CLI). It communicates directly from your machine with platform APIs (Base44, Framer, Lovable, Rocket, Floot, Zite) and pushes files directly to GitHub using GitHub's Trees REST API.",
  },
  {
    q: "Can I push to private GitHub repositories?",
    a: "Yes! As long as your GitHub Personal Access Token (PAT) has 'repo' permissions, Push44 can push to both private and public GitHub repositories without restrictions.",
  },
  {
    q: "What is the Push44 Terminal CLI (p44)?",
    a: "The Push44 CLI is a lightweight terminal binary written for developers who code in Cursor, VS Code, or Termux. It allows you to run `push44 sync` to pull remote AI changes, auto-generate commit messages, and push directly to GitHub from your command line.",
  },
  {
    q: "How does Framer code export work in Push44?",
    a: "Push44 interfaces with Framer's editor APIs and multiplayer CRDT snapshots, extracting your project structure, CMS collections, design tokens, and components into a fully functional React 19 + Framer Motion Vite codebase.",
  },
  {
    q: "Are my tokens or source code stored anywhere?",
    a: "No. All tokens are saved strictly inside your browser's `localStorage` (or your local `~/.push44/credentials` file for CLI). They never leave your device and are never sent to any intermediary server.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #e7e2db" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: "#1c1714", letterSpacing: "-0.01em" }}>
          {q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
          <ChevronDown size={18} color="#78716c" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden", paddingBottom: 20 }}
          >
            <p style={{ fontSize: 15, color: "#57534e", lineHeight: 1.7, margin: 0 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main World-Class Landing Page ────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#faf8f5",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#1c1714",
        overflowX: "hidden",
      }}
    >
      <Navbar />

      {/* ── 1. HERO SECTION ───────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          padding: "96px 20px 88px",
          textAlign: "center",
          borderBottom: "1px solid #e7e2db",
          background: "radial-gradient(ellipse at 50% 0%, #fff7ed 0%, #faf8f5 70%)",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Top Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                border: "1px solid #e7e2db",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                color: "#78716c",
                background: "#ffffff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  background: "#ff5500",
                  color: "#ffffff",
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: 99,
                  letterSpacing: "0.04em",
                }}
              >
                WEB &amp; TERMINAL CLI
              </span>
              <span>Direct GitHub Sync for 7 Major AI Platforms · 100% Free</span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: "clamp(38px, 6.2vw, 74px)",
                fontWeight: 900,
                color: "#1c1714",
                letterSpacing: "-0.045em",
                lineHeight: 1.04,
                margin: "0 auto 22px",
                maxWidth: 880,
              }}
            >
              Export AI-Generated Code.<br />
              <span
                style={{
                  background: "linear-gradient(135deg, #1c1714 30%, #ff5500 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Own Your Software Forever.
              </span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(16px, 2vw, 19px)",
                color: "#57534e",
                lineHeight: 1.65,
                margin: "0 auto 40px",
                maxWidth: 620,
              }}
            >
              Bypass export restrictions and subscription lock-in. Push full source code from <strong>Base44, Framer, Lovable, Rocket.new, Floot, Zite</strong>, and <strong>bolt.new</strong> directly to GitHub — in your browser or terminal CLI.
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: 14,
                justifyContent: "center",
                flexWrap: "wrap",
                marginBottom: 64,
              }}
            >
              <Link
                to="/onboarding"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "14px 28px",
                  background: "#ff5500",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 15,
                  borderRadius: 12,
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 8px 24px rgba(255,85,0,0.28)",
                  transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = "#e64d00";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = "#ff5500";
                  el.style.transform = "translateY(0)";
                }}
              >
                Start Exporting Free <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
              <a
                href="#cli"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 28px",
                  background: "#ffffff",
                  color: "#1c1714",
                  fontWeight: 600,
                  fontSize: 15,
                  borderRadius: 12,
                  textDecoration: "none",
                  border: "1px solid #e7e2db",
                  letterSpacing: "-0.01em",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#d6d3d1";
                  (e.currentTarget as HTMLElement).style.background = "#f5f5f4";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#e7e2db";
                  (e.currentTarget as HTMLElement).style.background = "#ffffff";
                }}
              >
                <Terminal size={16} color="#ff5500" />
                Terminal CLI (p44)
              </a>
            </div>

            {/* Interactive Hero Simulator */}
            <InteractiveProductMockup />
          </motion.div>
        </div>
      </section>

      {/* ── 2. SUPPORTED PLATFORMS MARQUEE ─────────────────────────────────── */}
      <section
        style={{
          padding: "36px 20px",
          borderBottom: "1px solid #e7e2db",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#78716c",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginRight: 10,
            }}
          >
            Works Seamlessly With
          </span>
          {PLATFORMS_GRID.map((p) => {
            const Logo = p.logoComponent;
            return (
              <Link
                key={p.name}
                to="/platforms/$platform"
                params={{ platform: p.slug }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 15px",
                  border: "1px solid #e7e2db",
                  borderRadius: 10,
                  background: "#faf8f5",
                  textDecoration: "none",
                  color: "#1c1714",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = "#d6d3d1";
                  el.style.transform = "translateY(-1px)";
                  el.style.background = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = "#e7e2db";
                  el.style.transform = "translateY(0)";
                  el.style.background = "#faf8f5";
                }}
              >
                <Logo size={18} />
                <span>{p.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 3. STATS STRIP ─────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "64px 20px",
          borderBottom: "1px solid #e7e2db",
          background: "#faf8f5",
        }}
        id="features"
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 1,
            background: "#e7e2db",
            border: "1px solid #e7e2db",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          {[
            { n: "7", label: "Supported Platforms", sub: "Base44, Framer, Lovable & more" },
            { n: "< 4s", label: "Atomic Push Speed", sub: "via GitHub Trees API" },
            { n: "0", label: "Backend Servers", sub: "100% Client-Side Privacy" },
            { n: "100%", label: "Free Forever", sub: "Zero paywalls or subscriptions" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding: "36px 28px",
                textAlign: "center",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  fontSize: 38,
                  fontWeight: 900,
                  color: "#1c1714",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                {s.n}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#292524", marginTop: 8 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 12, color: "#78716c", marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. THE PROBLEM VS PUSH44 FREEDOM ───────────────────────────────── */}
      <section
        style={{
          padding: "96px 20px",
          background: "#120e0b",
          borderBottom: "1px solid #292524",
          color: "#fafaf9",
        }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#ff5500",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                display: "block",
                marginBottom: 12,
              }}
            >
              The Vibe Coding Trap
            </span>
            <h2
              style={{
                fontSize: "clamp(30px, 4.5vw, 52px)",
                fontWeight: 900,
                color: "#fafaf9",
                letterSpacing: "-0.04em",
                margin: "0 0 16px",
              }}
            >
              AI platforms build your app.<br />Then they hold your source code hostage.
            </h2>
            <p
              style={{
                fontSize: 17,
                color: "#a8a29e",
                maxWidth: 540,
                margin: "0 auto",
                lineHeight: 1.65,
              }}
            >
              Building apps with AI is magical — until you try to export, version control, or cancel your subscription.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                title: "Paywalled & Restricted Exports",
                desc: "Platforms bury full source exports behind expensive enterprise tiers or restrict downloads altogether, trapping your IP on their servers.",
              },
              {
                title: "No Native Git Version Control",
                desc: "Every prompt modifies the live project with zero commit history, zero branching, and no safety net if an AI iteration breaks your database schema.",
              },
              {
                title: "Subscription Lock-In",
                desc: "Cancel your plan and you lose access to deploy or edit your app. With Push44, your code lives securely in your own GitHub repository.",
              },
            ].map((p, idx) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                style={{
                  padding: "32px 28px",
                  background: "#1c1612",
                  border: "1px solid #332720",
                  borderRadius: 14,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 3,
                    background: "#ff5500",
                    marginBottom: 20,
                    borderRadius: 99,
                  }}
                />
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#fafaf9",
                    margin: "0 0 10px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {p.title}
                </h3>
                <p style={{ fontSize: 14, color: "#a8a29e", lineHeight: 1.65, margin: 0 }}>
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. BENTO GRID FEATURES ─────────────────────────────────────────── */}
      <section
        style={{
          padding: "96px 20px",
          borderBottom: "1px solid #e7e2db",
          background: "#ffffff",
        }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#ff5500",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                display: "block",
                marginBottom: 12,
              }}
            >
              Enterprise-Grade Capabilities
            </span>
            <h2
              style={{
                fontSize: "clamp(30px, 4.5vw, 52px)",
                fontWeight: 900,
                color: "#1c1714",
                letterSpacing: "-0.04em",
                margin: "0 0 16px",
              }}
            >
              Everything you need to master your code.
            </h2>
            <p
              style={{
                fontSize: 17,
                color: "#57534e",
                maxWidth: 520,
                margin: "0 auto",
                lineHeight: 1.65,
              }}
            >
              Built for developers, founders, and vibe coders who demand full ownership and zero friction.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            {BENTO_FEATURES.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  style={{
                    border: "1px solid #e7e2db",
                    borderRadius: 16,
                    padding: "32px",
                    background: "#faf8f5",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 24,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#d6d3d1";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 30px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#e7e2db";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)";
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "#ffffff",
                        border: "1px solid #e7e2db",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 20,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                      }}
                    >
                      <Icon size={22} color={item.accent} />
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: item.accent,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 6,
                      }}
                    >
                      {item.subtitle}
                    </div>
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#1c1714",
                        margin: "0 0 10px",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p style={{ fontSize: 14, color: "#57534e", lineHeight: 1.65, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #e7e2db",
                      paddingTop: 16,
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 24, fontWeight: 900, color: "#1c1714", letterSpacing: "-0.03em" }}>
                      {item.stat}
                    </span>
                    <span style={{ fontSize: 12, color: "#78716c", fontWeight: 600 }}>
                      {item.statLabel}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. CLI SHOWCASE ───────────────────────────────────────────────── */}
      <CliShowcase />

      {/* ── 7. PLATFORMS DEEP DIVE ────────────────────────────────────────── */}
      <section
        style={{
          padding: "96px 20px",
          borderBottom: "1px solid #e7e2db",
          background: "#faf8f5",
        }}
        id="platforms"
      >
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#ff5500",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                display: "block",
                marginBottom: 12,
              }}
            >
              Supported Ecosystem
            </span>
            <h2
              style={{
                fontSize: "clamp(30px, 4.5vw, 52px)",
                fontWeight: 900,
                color: "#1c1714",
                letterSpacing: "-0.04em",
                margin: "0 0 16px",
              }}
            >
              One Hub for Every Platform.
            </h2>
            <p
              style={{
                fontSize: 17,
                color: "#57534e",
                maxWidth: 480,
                margin: "0 auto",
                lineHeight: 1.65,
              }}
            >
              Push44 connects directly with your preferred platform to extract source files, tokens, and components.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {PLATFORMS_GRID.map((p) => {
              const Logo = p.logoComponent;
              return (
                <motion.div
                  key={p.name}
                  whileHover={{ y: -3 }}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e7e2db",
                    borderRadius: 16,
                    padding: "26px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 18,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 14,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Logo size={28} />
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1c1714", margin: 0 }}>
                          {p.name}
                        </h3>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          background: "#fff7ed",
                          color: "#c2410c",
                          padding: "3px 8px",
                          borderRadius: 99,
                          border: "1px solid #fed7aa",
                        }}
                      >
                        {p.badge}
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: "#57534e", lineHeight: 1.6, margin: "0 0 16px" }}>
                      {p.tagline}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {p.features.map((feat) => (
                        <div
                          key={feat}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12,
                            color: "#78716c",
                          }}
                        >
                          <Check size={13} color="#22c55e" strokeWidth={3} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    to="/platforms/$platform"
                    params={{ platform: p.slug }}
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#ff5500",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 10,
                    }}
                  >
                    View platform docs <ArrowRight size={13} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 8. COMPARISON MATRIX ───────────────────────────────────────────── */}
      <section
        style={{
          padding: "96px 20px",
          borderBottom: "1px solid #e7e2db",
          background: "#ffffff",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#ff5500",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                display: "block",
                marginBottom: 12,
              }}
            >
              Why Push44 Wins
            </span>
            <h2
              style={{
                fontSize: "clamp(30px, 4.5vw, 48px)",
                fontWeight: 900,
                color: "#1c1714",
                letterSpacing: "-0.04em",
                margin: "0 0 16px",
              }}
            >
              Push44 vs. The Alternatives
            </h2>
          </div>

          <div
            style={{
              border: "1px solid #e7e2db",
              borderRadius: 16,
              overflow: "hidden",
              background: "#faf8f5",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                padding: "16px 24px",
                background: "#f5f0eb",
                borderBottom: "1px solid #e7e2db",
                fontWeight: 700,
                fontSize: 13,
                color: "#1c1714",
              }}
            >
              <div>Feature / Capability</div>
              <div style={{ color: "#ff5500", textAlign: "center" }}>Push44 (Web &amp; CLI)</div>
              <div style={{ color: "#78716c", textAlign: "center" }}>Manual ZIP Downloads</div>
            </div>

            {[
              { f: "Direct Atomic Commit to GitHub", p44: "Yes (< 4s)", zip: "Manual git add/commit" },
              { f: "Visual Added / Modified Diff Preview", p44: "Yes (Built-in)", zip: "No" },
              { f: "Zero Backend / Zero Logs", p44: "Yes (100% Client-Side)", zip: "Varies" },
              { f: "Terminal CLI for Cursor & VS Code", p44: "Yes (`push44 sync`)", zip: "No" },
              { f: "Cloud Android APK Compilation", p44: "Yes (One-Click)", zip: "Requires Android Studio" },
              { f: "Cost", p44: "100% Free Forever", zip: "Often behind $20-$50/mo tier" },
            ].map((row, idx) => (
              <div
                key={row.f}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  padding: "16px 24px",
                  borderTop: idx > 0 ? "1px solid #e7e2db" : "none",
                  fontSize: 14,
                  alignItems: "center",
                  background: idx % 2 === 0 ? "#ffffff" : "#faf8f5",
                }}
              >
                <div style={{ fontWeight: 600, color: "#1c1714" }}>{row.f}</div>
                <div style={{ textAlign: "center", color: "#16a34a", fontWeight: 700 }}>
                  {row.p44}
                </div>
                <div style={{ textAlign: "center", color: "#78716c" }}>{row.zip}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ACCORDION ───────────────────────────────────────────────── */}
      <section
        style={{
          padding: "96px 20px",
          borderBottom: "1px solid #e7e2db",
          background: "#faf8f5",
        }}
        id="faq"
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#ff5500",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                display: "block",
                marginBottom: 12,
              }}
            >
              Frequently Asked Questions
            </span>
            <h2
              style={{
                fontSize: "clamp(30px, 4.5vw, 48px)",
                fontWeight: 900,
                color: "#1c1714",
                letterSpacing: "-0.04em",
                margin: 0,
              }}
            >
              Everything you need to know.
            </h2>
          </div>

          <div style={{ borderTop: "1px solid #e7e2db" }}>
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. HIGH-IMPACT FINAL CTA ──────────────────────────────────────── */}
      <section
        style={{
          padding: "110px 20px",
          background: "#120e0b",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "300px",
            background: "radial-gradient(circle, rgba(255,85,0,0.18) 0%, rgba(18,14,11,0) 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontSize: "clamp(34px, 5.5vw, 60px)",
              fontWeight: 900,
              color: "#fafaf9",
              letterSpacing: "-0.04em",
              lineHeight: 1.08,
              margin: "0 0 18px",
            }}
          >
            Start owning your AI code today.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "#a8a29e",
              margin: "0 0 40px",
              lineHeight: 1.65,
            }}
          >
            100% free forever. No credit card required. Available in your browser and terminal.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/onboarding"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "15px 32px",
                background: "#ff5500",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 16,
                borderRadius: 12,
                textDecoration: "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2), 0 8px 28px rgba(255,85,0,0.4)",
                transition: "background 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "#e64d00";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "#ff5500";
                el.style.transform = "translateY(0)";
              }}
            >
              Launch App Free <ArrowRight size={17} strokeWidth={2.5} />
            </Link>
            <a
              href="#cli"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "15px 32px",
                background: "#1c1612",
                color: "#fafaf9",
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 12,
                textDecoration: "none",
                border: "1px solid #332720",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#57534e";
                (e.currentTarget as HTMLElement).style.background = "#261d18";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#332720";
                (e.currentTarget as HTMLElement).style.background = "#1c1612";
              }}
            >
              <Terminal size={16} color="#ff5500" />
              Get Terminal CLI
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
