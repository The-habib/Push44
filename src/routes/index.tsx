import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Github, ArrowRight, Zap, ShieldCheck, GitBranch, Code2,
  Download, History, ChevronDown, ChevronUp, Star,
} from "lucide-react";
import base44LogoImg from "@/assets/base44-logo-transparent.webp";
import rocketLogoImg from "@/assets/rocket-logo.png";
import flootLogoImg from "@/assets/floot-logo.png";
import ziteLogoImg from "@/assets/zite-logo.png";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Push44 — Export AI-Generated Code from Any Platform. Free. Forever." },
      { name: "description", content: "Push44 lets you export your full source code from Base44, Rocket.new, Floot, and Zite directly to GitHub in one click. No backend. No subscription. 100% open source." },
      { name: "keywords", content: "AI app export, Base44 GitHub export, Rocket.new export, Floot export, Zite export, AI code ownership, export AI generated code" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Push44 — Export AI-Generated Code Free. Forever." },
      { property: "og:description", content: "Bypass export restrictions. Keep 100% ownership. Push to GitHub instantly." },
      { property: "og:url", content: "https://push44.vercel.app" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://push44.vercel.app" }],
  }),
  component: LandingPage,
});

// ── Hero product mockup ─────────────────────────────────────────────────────

function ProductMockup() {
  return (
    <div style={{ background: "#09090b", borderRadius: 14, overflow: "hidden", border: "1px solid #27272a", boxShadow: "0 48px 100px -24px rgba(0,0,0,0.5)", maxWidth: 480, width: "100%", margin: "0 auto" }}>
      {/* Window chrome */}
      <div style={{ background: "#18181b", borderBottom: "1px solid #27272a", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#ef4444", "#f97316", "#22c55e"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
        </div>
        <div style={{ flex: 1, background: "#09090b", borderRadius: 4, padding: "3px 10px", fontSize: 11, color: "#52525b", textAlign: "center", fontFamily: "monospace" }}>push44.vercel.app</div>
      </div>

      {/* App body */}
      <div style={{ padding: 20 }}>
        {/* Repo header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f4f4f5", fontFamily: "monospace" }}>my-ai-startup</div>
            <div style={{ fontSize: 11, color: "#52525b", marginTop: 2 }}>Base44 · main</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#22c55e", background: "rgba(34,197,94,0.08)", padding: "3px 8px", borderRadius: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />
            Ready to push
          </div>
        </div>

        {/* Diff stats */}
        <div style={{ display: "flex", gap: 0, marginBottom: 16, border: "1px solid #27272a", borderRadius: 8, overflow: "hidden" }}>
          {[
            { n: "34", label: "CHANGED", c: "#f4f4f5", bg: "transparent" },
            { n: "+17", label: "ADDED", c: "#22c55e", bg: "rgba(34,197,94,0.06)" },
            { n: "3", label: "MODIFIED", c: "#f97316", bg: "rgba(249,115,22,0.06)" },
            { n: "0", label: "DELETED", c: "#71717a", bg: "transparent" },
          ].map((s, i) => (
            <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "10px 0", background: s.bg, borderLeft: i > 0 ? "1px solid #27272a" : "none" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 9, color: "#52525b", fontWeight: 600, letterSpacing: "0.07em", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* File list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid #27272a", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
          {[
            { f: "src/App.tsx", s: "Modified", c: "#f97316" },
            { f: "src/components/Header.tsx", s: "Added", c: "#22c55e" },
            { f: "src/api/client.ts", s: "Added", c: "#22c55e" },
            { f: "package.json", s: "Modified", c: "#f97316" },
          ].map((row, i) => (
            <div key={row.f} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderTop: i > 0 ? "1px solid #1c1c1e" : "none" }}>
              <span style={{ fontSize: 12, color: "#a1a1aa", fontFamily: "monospace" }}>{row.f}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: row.c }}>{row.s}</span>
            </div>
          ))}
        </div>

        {/* Push button */}
        <div style={{ background: "#f97316", color: "#fff", fontWeight: 700, fontSize: 13, borderRadius: 8, padding: "11px 0", textAlign: "center", cursor: "default", letterSpacing: "-0.01em" }}>
          Push to GitHub
        </div>
      </div>
    </div>
  );
}

// ── FEATURES data ───────────────────────────────────────────────────────────

const FEATURES = [
  { Icon: Download, title: "One-Click Export", desc: "Grab your complete source code from any AI platform in seconds. No zip extraction, no manual copying." },
  { Icon: ShieldCheck, title: "Full Code Ownership", desc: "Your code goes directly to your GitHub repo. Push44 never stores, processes, or logs your source code." },
  { Icon: Zap, title: "Instant Push", desc: "From export to GitHub commit in under 10 seconds. Batch push all files in a single atomic operation." },
  { Icon: GitBranch, title: "Smart Diff Preview", desc: "See exactly what changed before you push — added, modified, and deleted files with full transparency." },
  { Icon: History, title: "Version History", desc: "Every push creates a proper git commit. Roll back to any version, compare changes, and track your progress." },
  { Icon: Code2, title: "100% Open Source", desc: "MIT licensed. Read the source, fork it, self-host it. No black boxes, no vendor lock-in of any kind." },
];

// ── PLATFORMS data ──────────────────────────────────────────────────────────

const PLATFORMS = [
  { name: "Base44", logo: base44LogoImg, slug: "base44", desc: "Export any Base44 project to GitHub with automatic file discovery and token authentication." },
  { name: "Rocket.new", logo: rocketLogoImg, slug: "rocket-new", desc: "Pull your full Rocket.new codebase, including all components, hooks, and configuration files." },
  { name: "Floot", logo: flootLogoImg, slug: "floot", desc: "Export Floot projects via magic link session and push your web app source to any GitHub repo." },
  { name: "Zite", logo: ziteLogoImg, slug: "zite", desc: "Extract your Zite template files and push them to GitHub with complete directory structure intact." },
];

// ── HOW IT WORKS ─────────────────────────────────────────────────────────────

const STEPS = [
  { n: "01", title: "Connect Your Platform", desc: "Enter your platform credentials or API token. Push44 runs entirely in your browser — no server ever sees your token." },
  { n: "02", title: "Review Your Changes", desc: "See a full diff of every file that changed since your last push. Added, modified, and deleted — nothing hidden." },
  { n: "03", title: "Push to GitHub", desc: "One click creates a real git commit on your repo. Your code is yours, tracked, versioned, and owned by you." },
];

// ── FAQ data ────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "Is Push44 really free?", a: "Yes, 100% free forever. No trial, no credit card, no hidden tier. Push44 is open source under the MIT license." },
  { q: "Does Push44 store my code or tokens?", a: "Never. Push44 runs entirely in your browser. Your API tokens and source code never touch any server operated by us." },
  { q: "Which AI platforms are supported?", a: "Base44, Rocket.new, Floot, and Zite are fully supported. More platforms are added regularly — check the GitHub repo." },
  { q: "Do I need a GitHub account?", a: "Yes, you need a GitHub account and a Personal Access Token (or GitHub OAuth) to push to a repository." },
  { q: "Can I push to a private repository?", a: "Absolutely. Push44 works with both public and private GitHub repositories, as long as your token has the right permissions." },
  { q: "What happens to my code after I push?", a: "It lives in your GitHub repository — exactly like any other git commit. Push44 has no ongoing access after the push completes." },
];

// ── FAQ Component ───────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #e4e4e7" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: "#09090b", letterSpacing: "-0.01em" }}>{q}</span>
        {open ? <ChevronUp size={16} color="#71717a" /> : <ChevronDown size={16} color="#71717a" />}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          style={{ paddingBottom: 18 }}
        >
          <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.7, margin: 0 }}>{a}</p>
        </motion.div>
      )}
    </div>
  );
}

// ── LANDING PAGE ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100dvh", background: "#fff", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", color: "#09090b" }}>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: "96px 20px 80px", textAlign: "center", borderBottom: "1px solid #f4f4f5" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px 4px 6px", border: "1px solid #e4e4e7", borderRadius: 999, fontSize: 12, fontWeight: 500, color: "#52525b", marginBottom: 28 }}>
              <span style={{ background: "#f97316", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, letterSpacing: "0.02em" }}>FREE</span>
              Open source · MIT License · No signup required
            </div>

            {/* H1 */}
            <h1 style={{ fontSize: "clamp(40px, 6vw, 76px)", fontWeight: 900, color: "#09090b", letterSpacing: "-0.04em", lineHeight: 1.05, margin: "0 auto 20px", maxWidth: 780 }}>
              Export AI-Generated Code.<br />Own It Forever.
            </h1>

            {/* Subtext */}
            <p style={{ fontSize: 18, color: "#71717a", lineHeight: 1.65, margin: "0 auto 40px", maxWidth: 500 }}>
              Push44 bypasses export restrictions on Base44, Rocket.new, Floot, and Zite.
              Push your full source code to GitHub in one click — free, forever.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
              <Link
                to="/onboarding"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", background: "#f97316", color: "#fff", fontWeight: 700, fontSize: 15, borderRadius: 9, textDecoration: "none", letterSpacing: "-0.01em", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#ea6c0a"}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "#f97316"}
              >
                Start Exporting Free <ArrowRight size={16} />
              </Link>
              <a
                href="https://github.com/The-habib/Push44"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", background: "#fff", color: "#09090b", fontWeight: 600, fontSize: 15, borderRadius: 9, textDecoration: "none", border: "1px solid #e4e4e7", letterSpacing: "-0.01em", transition: "border-color 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = "#d4d4d8"}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e4e4e7"}
              >
                <Github size={16} /> Star on GitHub
                <span style={{ background: "#f4f4f5", borderRadius: 5, padding: "2px 8px", fontSize: 12, color: "#52525b", fontWeight: 600 }}>12.4K</span>
              </a>
            </div>

            {/* Product mockup */}
            <ProductMockup />
          </motion.div>
        </div>
      </section>

      {/* ── PLATFORM LOGOS ────────────────────────────────────────────────── */}
      <section style={{ padding: "40px 20px", borderBottom: "1px solid #f4f4f5" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 8 }}>Works with</span>
          {PLATFORMS.map(p => (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 14px", border: "1px solid #e4e4e7", borderRadius: 8, background: "#fafafa" }}>
              <img src={p.logo} alt={p.name} style={{ width: 18, height: 18, objectFit: "contain" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#3f3f46" }}>{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: "64px 20px", borderBottom: "1px solid #f4f4f5" }} id="features">
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 1, border: "1px solid #e4e4e7", borderRadius: 12, overflow: "hidden" }}>
          {[
            { n: "12.4K", label: "GitHub Stars", sub: "and growing" },
            { n: "4", label: "AI Platforms", sub: "fully supported" },
            { n: "100%", label: "Free Forever", sub: "no hidden costs" },
            { n: "0", label: "Backend", sub: "runs in your browser" },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: "32px 28px", textAlign: "center", background: "#fff", borderLeft: i > 0 ? "1px solid #e4e4e7" : "none" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#09090b", letterSpacing: "-0.04em", lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#09090b", marginTop: 6 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 3 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM ───────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 20px", background: "#09090b", borderBottom: "1px solid #18181b" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>The Problem</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#f4f4f5", letterSpacing: "-0.04em", margin: "0 0 16px" }}>AI platforms keep your code locked in.</h2>
            <p style={{ fontSize: 16, color: "#71717a", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>You build the product. They hold the code. That changes now.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1 }}>
            {[
              { title: "No native export", desc: "Most AI builders don't offer a direct \"download code\" button, or bury it behind a paywall you can't afford." },
              { title: "Subscription lock-in", desc: "Cancel your plan and you lose access to your own code. You're renting your app, not owning it." },
              { title: "No version control", desc: "Every change overwrites the last. There's no history, no rollback, no safety net if something breaks." },
            ].map((p, i) => (
              <div key={p.title} style={{ padding: "28px", background: "#18181b", border: "1px solid #27272a", borderRadius: i === 0 ? "10px 0 0 10px" : i === 2 ? "0 10px 10px 0" : 0 }}>
                <div style={{ width: 28, height: 2, background: "#f97316", marginBottom: 20 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f4f4f5", margin: "0 0 10px", letterSpacing: "-0.02em" }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 20px", borderBottom: "1px solid #f4f4f5" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Features</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#09090b", letterSpacing: "-0.04em", margin: "0 0 16px" }}>Everything you need to own your code.</h2>
            <p style={{ fontSize: 16, color: "#71717a", maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>Built for developers who refuse to let a subscription hold their work hostage.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 1, border: "1px solid #e4e4e7", borderRadius: 12, overflow: "hidden" }}>
            {FEATURES.map(({ Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                style={{ padding: "28px", background: "#fff", borderLeft: i % 3 > 0 ? "1px solid #e4e4e7" : "none", borderTop: i >= 3 ? "1px solid #e4e4e7" : "none" }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #e4e4e7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Icon size={17} color="#f97316" />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#09090b", margin: "0 0 8px", letterSpacing: "-0.02em" }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 20px", background: "#fafafa", borderBottom: "1px solid #f4f4f5" }} id="how-it-works">
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>How it works</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#09090b", letterSpacing: "-0.04em", margin: 0 }}>Three steps to code ownership.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }}>
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#f97316", fontFamily: "monospace", letterSpacing: "0.05em" }}>{n}</span>
                  <div style={{ flex: 1, height: 1, background: "#e4e4e7" }} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#09090b", margin: 0, letterSpacing: "-0.02em" }}>{title}</h3>
                <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORMS ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 20px", borderBottom: "1px solid #f4f4f5" }} id="platforms">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Platform Support</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#09090b", letterSpacing: "-0.04em", margin: "0 0 16px" }}>Works with every major AI builder.</h2>
            <p style={{ fontSize: 16, color: "#71717a", maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>More platforms are added continuously — check the GitHub repo for the latest.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {PLATFORMS.map(p => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                style={{ border: "1px solid #e4e4e7", borderRadius: 12, padding: "24px", background: "#fff", display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img src={p.logo} alt={p.name} style={{ width: 32, height: 32, objectFit: "contain" }} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#09090b", letterSpacing: "-0.02em" }}>{p.name}</span>
                </div>
                <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
                <Link
                  to="/platforms/$platform"
                  params={{ platform: p.slug }}
                  style={{ fontSize: 13, fontWeight: 600, color: "#f97316", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginTop: "auto" }}
                >
                  View guide <ArrowRight size={12} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 20px", borderBottom: "1px solid #f4f4f5" }} id="faq">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>FAQ</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, color: "#09090b", letterSpacing: "-0.04em", margin: 0 }}>Common questions.</h2>
          </div>
          <div style={{ borderTop: "1px solid #e4e4e7" }}>
            {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section style={{ padding: "96px 20px", background: "#09090b", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, color: "#f4f4f5", letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 16px" }}>
            Start owning your code today.
          </h2>
          <p style={{ fontSize: 16, color: "#71717a", margin: "0 0 40px", lineHeight: 1.65 }}>
            Free forever. Open source. No account required to start.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/onboarding"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", background: "#f97316", color: "#fff", fontWeight: 700, fontSize: 15, borderRadius: 9, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#ea6c0a"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "#f97316"}
            >
              Launch App Free <ArrowRight size={16} />
            </Link>
            <a
              href="https://github.com/The-habib/Push44"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", background: "transparent", color: "#a1a1aa", fontWeight: 600, fontSize: 15, borderRadius: 9, textDecoration: "none", border: "1px solid #3f3f46" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#f4f4f5"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#52525b"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#a1a1aa"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#3f3f46"; }}
            >
              <Star size={15} /> Star on GitHub
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
