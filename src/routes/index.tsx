import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { isOnboardingDone } from "@/lib/storage";
import appLogo from "@/assets/logo.png";
import base44LogoImg from "@/assets/base44-logo-transparent.webp";
import rocketLogoImg from "@/assets/rocket-logo.png";
import flootLogoImg from "@/assets/floot-logo.png";
import ziteLogoImg from "@/assets/zite-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Push44 — Export AI-Generated Code from Any Platform. Free. Forever." },
      {
        name: "description",
        content:
          "Push44 lets you export your full source code from Base44, Rocket.new, Floot, and Zite directly to GitHub in one click. No backend. No subscription. 100% open source.",
      },
      {
        name: "keywords",
        content:
          "AI app export, Base44 GitHub export, Rocket.new export, Floot export, Zite export, AI code ownership, export AI generated code, GitHub push tool, open source, free code export",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Push44 — Export AI-Generated Code from Any Platform. Free. Forever." },
      {
        property: "og:description",
        content:
          "Bypass export restrictions. Keep 100% ownership. Push to GitHub instantly. No backend. Always free.",
      },
      { property: "og:url", content: "https://push44.vercel.app" },
      { property: "og:image", content: "https://push44.vercel.app/logo.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Push44 — Export AI-Generated Code Free. Forever." },
      {
        name: "twitter:description",
        content: "Export your AI-built app source code to GitHub in one click. Supports Base44, Rocket.new, Floot, Zite.",
      },
    ],
    links: [{ rel: "canonical", href: "https://push44.vercel.app" }],
  }),
  component: LandingPage,
});

// ─── helpers ─────────────────────────────────────────────────────────────────
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function LaunchBtn({ className, label = "Launch App →" }: { className?: string; label?: string }) {
  const navigate = useNavigate();
  function launch() {
    navigate({ to: isOnboardingDone() ? "/dashboard" : "/onboarding" });
  }
  return (
    <button onClick={launch} className={className}>
      {label}
    </button>
  );
}

// ─── animated terminal ────────────────────────────────────────────────────────
const TERMINAL_LINES = [
  { text: "Fetching project from Base44...", delay: 0 },
  { text: "Analysing files...", delay: 900 },
  { text: "42 files ready to commit", delay: 1800, green: true },
  { text: "Creating tree...", delay: 2700 },
  { text: "Creating commit...", delay: 3400 },
  { text: "Pushing to GitHub...", delay: 4200 },
  { text: "Done. ✓", delay: 5100, green: true },
];

function Terminal() {
  const [visible, setVisible] = useState<number[]>([]);
  useEffect(() => {
    const timers = TERMINAL_LINES.map((line, i) =>
      setTimeout(() => setVisible((v) => [...v, i]), line.delay)
    );
    const reset = setTimeout(() => setVisible([]), 7000);
    return () => { timers.forEach(clearTimeout); clearTimeout(reset); };
  }, [visible.length === 7]);

  useEffect(() => {
    const start = setTimeout(() => setVisible([0]), 400);
    return () => clearTimeout(start);
  }, []);

  return (
    <div style={{
      background: "#0d1117",
      borderRadius: 12,
      padding: "20px 24px",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
      fontSize: 13,
      lineHeight: 1.7,
      boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      border: "1px solid rgba(255,255,255,0.08)",
      minHeight: 200,
    }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["#ff5f56","#ffbd2e","#27c93f"].map(c => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
        ))}
        <span style={{ color: "#6e7681", fontSize: 11, marginLeft: 8 }}>push44 — zsh</span>
      </div>
      <div style={{ color: "#8b949e", marginBottom: 8 }}>$ push44 export --platform base44 --repo awesome-ai-app</div>
      {TERMINAL_LINES.map((line, i) => (
        <div key={i} style={{
          color: line.green ? "#3fb950" : "#e6edf3",
          opacity: visible.includes(i) ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}>
          {line.text}
        </div>
      ))}
      {visible.length === 7 && (
        <div style={{
          marginTop: 12,
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: 8,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: "#f97316",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </div>
          <div>
            <div style={{ color: "#e6edf3", fontSize: 12, fontWeight: 600 }}>Commit 7f3a2e1</div>
            <div style={{ color: "#8b949e", fontSize: 11 }}>42 files changed</div>
          </div>
          <div style={{ marginLeft: "auto", color: "#3fb950", fontSize: 11, fontWeight: 600 }}>✓ Pushed</div>
        </div>
      )}
    </div>
  );
}

// ─── mock diff UI ─────────────────────────────────────────────────────────────
function MockDiffUI() {
  const files = [
    { name: "src/App.tsx", status: "Modified" },
    { name: "src/components/Navbar.tsx", status: "Added" },
    { name: "src/utils/api.ts", status: "Added" },
    { name: "package.json", status: "Modified" },
    { name: "README.md", status: "Added" },
    { name: "old/config.js", status: "Deleted" },
  ];
  const colors: Record<string, string> = { Modified: "#f97316", Added: "#22c55e", Deleted: "#ef4444" };

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
      border: "1px solid #e5e7eb",
      overflow: "hidden",
      maxWidth: 480,
    }}>
      {/* header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#374151">
            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"/>
          </svg>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>awesome-ai-app</span>
          <span style={{ fontSize: 11, color: "#6b7280" }}>Private repository</span>
        </div>
        <span style={{
          background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 600,
          padding: "3px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
          Ready to push
        </span>
      </div>

      {/* tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", padding: "0 16px" }}>
        {["Changes", "Preview"].map((t, i) => (
          <div key={t} style={{
            padding: "10px 0", marginRight: 20, fontSize: 13, fontWeight: i === 0 ? 600 : 400,
            color: i === 0 ? "#f97316" : "#9ca3af",
            borderBottom: i === 0 ? "2px solid #f97316" : "2px solid transparent",
            cursor: "pointer",
          }}>{t}</div>
        ))}
      </div>

      {/* stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}>
        {[
          { label: "Files changed", value: "42", color: "#374151" },
          { label: "Added", value: "+28", color: "#16a34a" },
          { label: "Modified", value: "-10", color: "#f97316" },
          { label: "Deleted", value: "-4", color: "#ef4444" },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* file list */}
      <div style={{ padding: "8px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</span>
          <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Changes</span>
        </div>
        {files.map((f) => (
          <div key={f.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f9f9f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="#9ca3af">
                <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75z"/>
              </svg>
              <span style={{ fontSize: 12, color: "#374151", fontFamily: "monospace" }}>{f.name}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: colors[f.status] }}>{f.status}</span>
          </div>
        ))}
      </div>

      {/* push button */}
      <div style={{ padding: 16 }}>
        <button style={{
          width: "100%", padding: "12px 0", background: "#f97316", color: "#fff",
          border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Push to GitHub
        </button>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function launch() {
    navigate({ to: isOnboardingDone() ? "/dashboard" : "/onboarding" });
  }

  const NAV_LINKS = [
    { label: "Features", id: "features" },
    { label: "How it Works", id: "how-it-works" },
    { label: "Supported Platforms", id: "platforms" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#111827", overflowX: "hidden" }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.95)" : "#fff",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #e5e7eb" : "1px solid transparent",
        transition: "all 0.2s ease",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 64 }}>
          {/* logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
            <img src={appLogo} alt="Push44" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "contain" }} />
            <span style={{ fontWeight: 700, fontSize: 17, color: "#111827", letterSpacing: "-0.02em" }}>Push44</span>
          </a>

          {/* desktop links */}
          <div style={{ display: "flex", alignItems: "center", gap: 28, marginLeft: 40, flex: 1 }} className="lp-desktop-nav">
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)} style={{
                background: "none", border: "none", cursor: "pointer", fontSize: 14,
                color: "#6b7280", fontWeight: 500, padding: 0,
              }}
                onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
              >{l.label}</button>
            ))}
            <a href="https://github.com/push44/push44" target="_blank" rel="noopener noreferrer" style={{
              display: "flex", alignItems: "center", gap: 5, fontSize: 14, color: "#6b7280",
              textDecoration: "none", fontWeight: 500,
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
              <span style={{
                background: "#f3f4f6", color: "#374151", fontSize: 11, fontWeight: 600,
                padding: "1px 6px", borderRadius: 10,
              }}>12.4K</span>
            </a>
          </div>

          {/* CTA */}
          <button onClick={launch} style={{
            background: "#f97316", color: "#fff", border: "none",
            padding: "9px 18px", borderRadius: 8, fontWeight: 600, fontSize: 14,
            cursor: "pointer", flexShrink: 0, transition: "background 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "#ea6c00")}
            onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
          >Launch App →</button>

          {/* mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lp-mobile-only" style={{
            background: "none", border: "none", cursor: "pointer", padding: 8, marginLeft: 4,
            flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, width: 36, height: 36,
          }}>
            <span style={{ display: "block", width: 20, height: 2, background: "#374151", borderRadius: 2, transition: "all 0.2s", transform: mobileMenuOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
            <span style={{ display: "block", width: 20, height: 2, background: "#374151", borderRadius: 2, opacity: mobileMenuOpen ? 0 : 1, transition: "opacity 0.2s" }} />
            <span style={{ display: "block", width: 20, height: 2, background: "#374151", borderRadius: 2, transition: "all 0.2s", transform: mobileMenuOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
          </button>
        </div>

        {/* mobile menu */}
        {mobileMenuOpen && (
          <div style={{ borderTop: "1px solid #f0f0f0", background: "#fff", padding: "12px 24px 20px" }}>
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => { scrollTo(l.id); setMobileMenuOpen(false); }} style={{
                display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
                padding: "10px 0", fontSize: 15, color: "#374151", fontWeight: 500, cursor: "pointer",
                borderBottom: "1px solid #f9fafb",
              }}>{l.label}</button>
            ))}
            <button onClick={() => { launch(); setMobileMenuOpen(false); }} style={{
              marginTop: 12, width: "100%", background: "#f97316", color: "#fff",
              border: "none", padding: "12px 0", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer",
            }}>Launch App →</button>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{ background: "#fff", paddingTop: 72, paddingBottom: 80 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          {/* badges */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
            {[
              { label: "OPEN SOURCE", dot: "#f97316" },
              { label: "⭐ 12.4K", dot: "#f59e0b" },
              { label: "MIT LICENSE", dot: "#6b7280" },
            ].map(b => (
              <span key={b.label} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "#f9fafb", border: "1px solid #e5e7eb",
                padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                color: "#374151", letterSpacing: "0.05em",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: b.dot, flexShrink: 0 }} />
                {b.label}
              </span>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="lp-hero-grid">
            {/* left */}
            <div>
              <h1 style={{ fontSize: "clamp(32px,5vw,54px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#111827", margin: "0 0 20px" }}>
                Export AI-Generated Code<br />from Any Platform.<br />
                <span style={{ color: "#f97316" }}>Free. Forever.</span>
              </h1>
              <p style={{ fontSize: 17, color: "#6b7280", lineHeight: 1.65, margin: "0 0 28px", maxWidth: 500 }}>
                Most AI coding platforms let you build apps but don't let you own your code.
                Push44 bypasses those limits and lets you <strong style={{ color: "#374151" }}>export your full source code</strong> and
                push it to GitHub in one click — without any subscription or paywall.
              </p>

              {/* bullet points */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Bypass export restrictions",
                  "Keep 100% ownership of your code",
                  "Push to GitHub instantly",
                  "No backend. Everything runs in your browser.",
                  "Always free. Open source forever.",
                ].map(item => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: "#374151" }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%", background: "#fff7ed",
                      border: "1.5px solid #f97316", color: "#f97316",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, fontSize: 10, fontWeight: 800, marginTop: 2,
                    }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 28 }}>
                <button onClick={launch} style={{
                  background: "#f97316", color: "#fff", border: "none",
                  padding: "13px 24px", borderRadius: 8, fontWeight: 700, fontSize: 15,
                  cursor: "pointer", transition: "all 0.15s",
                  boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#ea6c00"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f97316"; e.currentTarget.style.transform = "none"; }}
                >Start Exporting Now →</button>
                <a href="https://github.com/push44/push44" target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 22px", borderRadius: 8, border: "1.5px solid #d1d5db",
                  fontWeight: 600, fontSize: 15, color: "#374151", textDecoration: "none",
                  transition: "all 0.15s", background: "#fff",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.background = "#f9fafb"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.background = "#fff"; }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="#374151">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                  View on GitHub
                </a>
              </div>

              {/* social proof */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex" }}>
                  {["#f87171","#60a5fa","#34d399","#a78bfa","#fbbf24"].map((c, i) => (
                    <div key={i} style={{
                      width: 30, height: 30, borderRadius: "50%", background: c,
                      border: "2px solid #fff", marginLeft: i === 0 ? 0 : -8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: "#fff",
                    }}>{String.fromCharCode(65 + i)}</div>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.4 }}>
                  Join <strong style={{ color: "#374151" }}>thousands of builders</strong><br />
                  who export their code with Push44
                </p>
              </div>
            </div>

            {/* right: diff UI */}
            <div style={{ display: "flex", justifyContent: "center" }} className="lp-hero-right">
              <MockDiffUI />
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ────────────────────────────────────────────────────── */}
      <section id="platforms" style={{ background: "#111827", padding: "88px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start", marginBottom: 72 }} className="lp-problem-grid">
            <div>
              <div style={{
                display: "inline-block", background: "#1f2937", color: "#f97316",
                padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20,
              }}>The Problem</div>
              <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
                AI Platforms Lock<br />Your Code.<br />
                <span style={{ color: "#f97316" }}>We Set It Free.</span>
              </h2>
              <p style={{ fontSize: 16, color: "#9ca3af", lineHeight: 1.65, margin: 0 }}>
                You build with AI. They profit. You get nothing.<br />
                Push44 gives the power back to you.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                {
                  emoji: "🔒",
                  bg: "#1f2937",
                  title: "Build amazing apps on AI platforms",
                  desc: "You spend hours crafting your perfect app on tools like Base44, Rocket.new, Floot, or Zite.",
                },
                {
                  emoji: "😤",
                  bg: "#7f1d1d",
                  title: "Try to export your code",
                  desc: "Hit a wall. Export is disabled, hidden behind a paywall, or simply doesn't exist.",
                },
                {
                  emoji: "💸",
                  bg: "#78350f",
                  title: "Hit a paywall or upgrade plan",
                  desc: "They want you to pay $50/mo just to download code you already built.",
                },
                {
                  emoji: "😔",
                  bg: "#1f2937",
                  title: "Still can't get your full code",
                  desc: "Even paid tiers often give you incomplete exports. You never truly own it.",
                },
              ].map((card) => (
                <div key={card.title} style={{
                  background: card.bg, borderRadius: 12, padding: "16px 20px",
                  display: "flex", alignItems: "flex-start", gap: 14,
                }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{card.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: "#f9fafb", fontSize: 14, marginBottom: 4 }}>{card.title}</div>
                    <div style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.5 }}>{card.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* platforms strip */}
          <div style={{ borderTop: "1px solid #374151", paddingTop: 48 }}>
            <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 32px" }}>
              Works with 4+ AI Coding Platforms · More platforms coming soon.
            </p>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {[
                { name: "Base44",     logo: base44LogoImg,  bg: "#f97316" },
                { name: "Rocket.new", logo: rocketLogoImg,  bg: "#0f172a" },
                { name: "Floot",      logo: flootLogoImg,   bg: "#7c3aed" },
                { name: "Zite",       logo: ziteLogoImg,    bg: "#1e3a5f" },
              ].map(p => (
                <div key={p.name} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "#1f2937", border: "1px solid #374151",
                  padding: "12px 24px", borderRadius: 12, minWidth: 160,
                  justifyContent: "center",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: p.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, overflow: "hidden",
                  }}>
                    <img src={p.logo} alt={p.name} style={{ width: 24, height: 24, objectFit: "contain" }} />
                  </div>
                  <span style={{ fontWeight: 600, color: "#f9fafb", fontSize: 15 }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────── */}
      <section id="features" style={{ background: "#fff", padding: "96px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "end", marginBottom: 56 }} className="lp-feat-header">
            <div>
              <div style={{
                display: "inline-block", background: "#fff7ed", color: "#f97316",
                padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
              }}>Powerful Features</div>
              <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#111827", lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em" }}>
                Everything You Need.<br />Nothing{" "}
                <span style={{ color: "#f97316" }}>You Don't.</span>
              </h2>
            </div>
            <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.65, margin: 0, maxWidth: 400 }}>
              Push44 is the most powerful export tool for AI-generated projects. Built for speed. Designed for builders.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {[
              {
                icon: "⚡",
                iconBg: "#fff7ed",
                title: "One Click Export",
                desc: "Export your entire project and push it to GitHub in a single click using GitHub Trees API. Handles 100+ files instantly.",
              },
              {
                icon: "</>",
                iconBg: "#eff6ff",
                title: "Smart Diff Preview",
                desc: "See all added, modified, and deleted files before you push. Full transparency. Know exactly what's changing every time.",
              },
              {
                icon: "🎁",
                iconBg: "#f0fdf4",
                title: "100% Free & Open Source",
                desc: "No hidden fees. No premium plans. The source code is open for everyone. Fork it, star it, contribute to it.",
              },
              {
                icon: "🛡️",
                iconBg: "#f5f3ff",
                title: "No Backend. No Servers.",
                desc: "Everything runs locally in your browser. Your code and tokens never leave your device. Complete privacy guaranteed.",
              },
              {
                icon: "📦",
                iconBg: "#fefce8",
                title: "ZIP Download",
                desc: "Not using GitHub? Download your entire project as a ZIP file anytime with a single click. No account needed.",
              },
              {
                icon: "🕐",
                iconBg: "#fff1f2",
                title: "Push History",
                desc: "Track all your exports and manage versions easily. Never lose your work. Full audit trail for every push.",
              },
            ].map((feat) => (
              <div key={feat.title} style={{
                background: "#f9fafb", borderRadius: 16, padding: "28px 28px 32px",
                border: "1px solid #f0f0f0", transition: "all 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: feat.iconBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: feat.icon.startsWith("<") ? 16 : 22, marginBottom: 16,
                  fontFamily: feat.icon.startsWith("<") ? "monospace" : "inherit",
                  fontWeight: 700, color: "#374151",
                }}>{feat.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 17, color: "#111827", margin: "0 0 8px" }}>{feat.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#6b7280", lineHeight: 1.65 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: "#111827", padding: "96px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ marginBottom: 56 }}>
            <div style={{
              display: "inline-block", background: "#1f2937", color: "#f97316",
              padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
            }}>How It Works</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
              From AI to GitHub<br />in 4 Simple Steps
            </h2>
            <p style={{ color: "#9ca3af", fontSize: 16, margin: "0 0 40px" }}>Built for speed. Designed for builders.</p>
            <button onClick={launch} style={{
              background: "#f97316", color: "#fff", border: "none",
              padding: "13px 24px", borderRadius: 8, fontWeight: 700, fontSize: 15,
              cursor: "pointer", transition: "all 0.15s",
              boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ea6c00"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f97316"; e.currentTarget.style.transform = "none"; }}
            >Start Now — It's Free →</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }} className="lp-how-grid">
            {/* terminal */}
            <Terminal />

            {/* steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                {
                  num: "1",
                  title: "Connect GitHub",
                  desc: "Authorize once with your GitHub account. One-click OAuth or paste your Personal Access Token.",
                  icon: "🔗",
                },
                {
                  num: "2",
                  title: "Select Platform",
                  desc: "Choose your AI builder (Base44, Rocket.new, Floot, Zite, etc.) and fetch your project.",
                  icon: "🎯",
                },
                {
                  num: "3",
                  title: "Review Changes",
                  desc: "See a smart diff of all changes before pushing to your repository. Approve what you need.",
                  icon: "</>",
                },
                {
                  num: "4",
                  title: "Push",
                  desc: "Create a real commit on GitHub. That's it. You're up to date. Your code, your repo.",
                  icon: "☁️",
                },
              ].map((step, i) => (
                <div key={step.num} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: "#1f2937", border: "2px solid #374151",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: step.icon.startsWith("<") ? 14 : 20,
                      fontFamily: step.icon.startsWith("<") ? "monospace" : "inherit",
                      fontWeight: 700, color: "#f9fafb",
                    }}>{step.icon}</div>
                    {i < 3 && (
                      <div style={{
                        position: "absolute", left: "50%", top: "100%",
                        width: 2, height: 20, background: "#374151",
                        transform: "translateX(-50%)", marginTop: 2,
                      }} />
                    )}
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: "#f97316", fontSize: 11, fontWeight: 700 }}>{step.num}.</span>
                      <h3 style={{ fontWeight: 700, fontSize: 16, color: "#f9fafb", margin: 0 }}>{step.title}</h3>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: "#9ca3af", lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ background: "#fff", padding: "96px 0" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{
              display: "inline-block", background: "#fff7ed", color: "#f97316",
              padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
            }}>FAQ</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,36px)", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
              Frequently Asked Questions
            </h2>
          </div>
          <FAQList />
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fff 100%)",
        borderTop: "1px solid #fed7aa",
        padding: "96px 24px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, color: "#111827", lineHeight: 1.1, margin: "0 0 20px", letterSpacing: "-0.03em" }}>
            Your Code.<br />
            Your Rules.<br />
            <span style={{ color: "#f97316" }}>Your Repository.</span>
          </h2>
          <p style={{ fontSize: 17, color: "#6b7280", lineHeight: 1.65, margin: "0 0 36px" }}>
            Don't let platforms lock what you build.<br />
            <strong style={{ color: "#374151" }}>Export. Own. Freedom.</strong>
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
            <button onClick={launch} style={{
              background: "#f97316", color: "#fff", border: "none",
              padding: "14px 28px", borderRadius: 8, fontWeight: 700, fontSize: 16,
              cursor: "pointer", transition: "all 0.15s",
              boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ea6c00"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f97316"; e.currentTarget.style.transform = "none"; }}
            >Launch Push44 Now →</button>
            <a href="https://github.com/push44/push44" target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 24px", borderRadius: 8, border: "1.5px solid #d1d5db",
              fontWeight: 600, fontSize: 16, color: "#374151", textDecoration: "none",
              background: "#fff", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.background = "#fff"; }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#374151">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              Star on GitHub
            </a>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
            {["✓ No Signup", "✓ No Credit Card", "✓ Always Free"].map(t => (
              <span key={t} style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={{ background: "#0f172a", padding: "56px 24px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }} className="lp-footer-grid">
            {/* brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <img src={appLogo} alt="Push44" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "contain" }} />
                <span style={{ fontWeight: 700, fontSize: 16, color: "#f9fafb" }}>Push44</span>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65, margin: "0 0 16px", maxWidth: 220 }}>
                Open source tool to export and version control AI-generated projects. Built for builders. Made with ❤️
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <a href="https://github.com/push44/push44" target="_blank" rel="noopener noreferrer" style={{
                  width: 32, height: 32, borderRadius: 8, background: "#1f2937",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af",
                  textDecoration: "none", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#374151"; (e.currentTarget as HTMLAnchorElement).style.color = "#f9fafb"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#1f2937"; (e.currentTarget as HTMLAnchorElement).style.color = "#9ca3af"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <FooterCol title="Product" links={[
              { label: "Features", onClick: () => scrollTo("features") },
              { label: "How it Works", onClick: () => scrollTo("how-it-works") },
              { label: "Roadmap", href: "https://github.com/push44/push44/issues" },
              { label: "Changelog", href: "https://github.com/push44/push44/releases" },
            ]} />

            {/* Resources */}
            <FooterCol title="Resources" links={[
              { label: "Documentation", href: "https://github.com/push44/push44#readme" },
              { label: "API Reference", href: "https://github.com/push44/push44/wiki" },
              { label: "FAQ", onClick: () => scrollTo("faq") },
            ]} />

            {/* Community */}
            <FooterCol title="Community" links={[
              { label: "GitHub", href: "https://github.com/push44/push44" },
              { label: "Discussions", href: "https://github.com/push44/push44/discussions" },
              { label: "Twitter / X", href: "https://twitter.com" },
            ]} />

            {/* License */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>MIT License</div>
              <div style={{
                background: "#1f2937", border: "1px solid #374151",
                borderRadius: 8, padding: "12px 14px",
              }}>
                <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.6 }}>
                  Free to use, modify, and distribute. No attribution required. Open source forever.
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: "#4b5563" }}>
                © 2024 Push44<br />Made with ❤️ by builders
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #1f2937", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 12, color: "#4b5563" }}>
              © 2024 Push44. All rights reserved. Open source under MIT License.
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { label: "Privacy", href: "#" },
                { label: "Terms", href: "#" },
                { label: "GitHub", href: "https://github.com/push44/push44" },
              ].map(l => (
                <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{
                  fontSize: 12, color: "#6b7280", textDecoration: "none",
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#9ca3af")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
                >{l.label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── RESPONSIVE STYLES ──────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .lp-desktop-nav { display: flex !important; }
        .lp-mobile-only { display: none !important; }

        @media (max-width: 768px) {
          .lp-desktop-nav { display: none !important; }
          .lp-mobile-only { display: flex !important; }
          .lp-hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .lp-hero-right { display: block !important; }
          .lp-problem-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .lp-feat-header { grid-template-columns: 1fr !important; }
          .lp-how-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .lp-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }

        @media (max-width: 480px) {
          .lp-footer-grid { grid-template-columns: 1fr !important; }
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}

// ─── footer column ────────────────────────────────────────────────────────────
function FooterCol({ title, links }: {
  title: string;
  links: { label: string; href?: string; onClick?: () => void }[];
}) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(l => (
          l.href ? (
            <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ fontSize: 14, color: "#9ca3af", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f9fafb")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
            >{l.label}</a>
          ) : (
            <button key={l.label} onClick={l.onClick} style={{ background: "none", border: "none", padding: 0, fontSize: 14, color: "#9ca3af", cursor: "pointer", textAlign: "left", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f9fafb")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
            >{l.label}</button>
          )
        ))}
      </div>
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Is Push44 really free?",
    a: "Yes, completely. Push44 is 100% free and open source under the MIT license. There are no premium plans, no paywalls, no subscriptions. Ever.",
  },
  {
    q: "Which platforms does Push44 support?",
    a: "Currently Push44 supports Base44, Rocket.new, Floot, and Zite. We're actively adding more platforms — submit a request on GitHub if your platform isn't supported.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Push44 runs entirely in your browser. No installation, no backend, no server. Everything — your tokens, your code, your history — stays on your device.",
  },
  {
    q: "Is my code safe?",
    a: "Yes. Push44 never sends your code or credentials to any third-party server (other than directly to GitHub and the platform you selected). All processing happens locally in your browser.",
  },
  {
    q: "What is a GitHub Personal Access Token and how do I get one?",
    a: 'A GitHub PAT is a token that allows apps to act on your behalf. Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Generate new token. Grant "repo" and "user" scopes. Push44 also supports GitHub OAuth for one-click connection.',
  },
  {
    q: "Can I push to a private repository?",
    a: "Yes. Push44 supports both public and private repositories. You can also create new repositories directly from Push44, choosing public or private at the time of creation.",
  },
  {
    q: "What happens if the export fails?",
    a: "Push44 shows you the exact error and never silently fails. Common issues are sleeping containers (for Rocket.new) or expired tokens — the UI guides you through fixing each case.",
  },
];

function FAQList() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {FAQS.map((faq, i) => (
        <div key={i} style={{
          border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden",
          transition: "all 0.2s",
          boxShadow: open === i ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
        }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{
            width: "100%", textAlign: "left", padding: "18px 20px",
            background: open === i ? "#fff7ed" : "#fff",
            border: "none", cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            gap: 16, transition: "background 0.2s",
          }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>{faq.q}</span>
            <span style={{
              width: 24, height: 24, borderRadius: "50%",
              background: open === i ? "#f97316" : "#f3f4f6",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: open === i ? "#fff" : "#6b7280",
              fontSize: 14, fontWeight: 700, flexShrink: 0,
              transition: "all 0.2s",
              transform: open === i ? "rotate(45deg)" : "none",
            }}>+</span>
          </button>
          {open === i && (
            <div style={{ padding: "0 20px 18px", background: "#fff7ed" }}>
              <p style={{ margin: 0, fontSize: 14, color: "#6b7280", lineHeight: 1.7 }}>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
