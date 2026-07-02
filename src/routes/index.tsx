import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isOnboardingDone } from "@/lib/storage";
import appLogo from "@/assets/logo.png";
import base44LogoImg from "@/assets/base44-logo-transparent.webp";
import rocketLogoImg from "@/assets/rocket-logo.png";
import flootLogoImg from "@/assets/floot-logo.png";
import ziteLogoImg from "@/assets/zite-logo.png";
import {
  Zap, GitCompare, Heart, ShieldCheck, Download, History,
  Lock, Ban, CreditCard, AlertCircle,
  Link2, Layers, Code2, UploadCloud,
  CheckCircle2, Github, Star, ArrowRight, Menu, X,
  ChevronDown, ChevronUp, FileCode2, GitBranch
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Push44 — Export AI-Generated Code from Any Platform. Free. Forever." },
      { name: "description", content: "Push44 lets you export your full source code from Base44, Rocket.new, Floot, and Zite directly to GitHub in one click. No backend. No subscription. 100% open source." },
      { name: "keywords", content: "AI app export, Base44 GitHub export, Rocket.new export, Floot export, Zite export, AI code ownership, export AI generated code, GitHub push tool, open source, free code export" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Push44 — Export AI-Generated Code from Any Platform. Free. Forever." },
      { property: "og:description", content: "Bypass export restrictions. Keep 100% ownership. Push to GitHub instantly. No backend. Always free." },
      { property: "og:url", content: "https://push44.vercel.app" },
      { property: "og:image", content: "https://push44.vercel.app/logo.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Push44 — Export AI-Generated Code Free. Forever." },
      { name: "twitter:description", content: "Export your AI-built app source code to GitHub in one click. Supports Base44, Rocket.new, Floot, Zite." },
    ],
    links: [
      { rel: "canonical", href: "https://push44.vercel.app" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" },
    ],
  }),
  component: LandingPage,
});

function smooth(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ── TERMINAL ANIMATION ─────────────────────────────────────────────────────────
const TERM_LINES = [
  { text: "$ push44 export --platform base44", dim: true, delay: 0 },
  { text: "Connecting to Base44...", delay: 600 },
  { text: "Fetching project files...", delay: 1300 },
  { text: "42 files ready to commit", green: true, delay: 2100 },
  { text: "Creating git tree...", delay: 2900 },
  { text: "Pushing to GitHub...", delay: 3700 },
  { text: "✓ Done — commit a3f91c2", green: true, bold: true, delay: 4500 },
];

function Terminal() {
  const [visible, setVisible] = useState<number[]>([]);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    setVisible([]);
    const timers = TERM_LINES.map((l, i) =>
      setTimeout(() => setVisible(v => [...v, i]), l.delay + 300)
    );
    const reset = setTimeout(() => setCycle(c => c + 1), 8000);
    return () => { timers.forEach(clearTimeout); clearTimeout(reset); };
  }, [cycle]);

  return (
    <div style={{
      background: "#0d1117", borderRadius: 16, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
    }}>
      {/* title bar */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57","#ffbd2e","#28c840"].map(c => <span key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c, display: "block" }} />)}
        </div>
        <span style={{ color: "#6e7681", fontSize: 12, fontFamily: "monospace", marginLeft: 8 }}>push44 — terminal</span>
      </div>
      {/* body */}
      <div style={{ padding: "20px 20px 24px", fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace", fontSize: 13, lineHeight: 1.75, minHeight: 220 }}>
        {TERM_LINES.map((l, i) => (
          <div key={`${cycle}-${i}`} style={{
            color: l.green ? "#3fb950" : l.dim ? "#484f58" : "#c9d1d9",
            fontWeight: l.bold ? 600 : 400,
            opacity: visible.includes(i) ? 1 : 0,
            transform: visible.includes(i) ? "translateY(0)" : "translateY(4px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
          }}>{l.text}</div>
        ))}
        {visible.length === TERM_LINES.length && (
          <div style={{
            marginTop: 16,
            background: "rgba(63,185,80,0.08)",
            border: "1px solid rgba(63,185,80,0.2)",
            borderRadius: 10, padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 12,
            animation: "fadeUp 0.4s ease forwards",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#f97316,#ea580c)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Github size={18} color="#fff" />
            </div>
            <div>
              <div style={{ color: "#e6edf3", fontSize: 13, fontWeight: 600 }}>Commit a3f91c2 pushed</div>
              <div style={{ color: "#8b949e", fontSize: 11, marginTop: 2 }}>42 files · main branch · just now</div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span style={{ background: "rgba(63,185,80,0.15)", color: "#3fb950", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20 }}>✓ Success</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DIFF UI CARD ───────────────────────────────────────────────────────────────
const DIFF_FILES = [
  { name: "src/App.tsx",                 status: "modified" },
  { name: "src/components/Navbar.tsx",   status: "added" },
  { name: "src/utils/api.ts",            status: "added" },
  { name: "package.json",               status: "modified" },
  { name: "README.md",                  status: "added" },
  { name: "old/config.js",             status: "deleted" },
];
const STATUS_COLOR = { modified: "#f97316", added: "#22c55e", deleted: "#ef4444" } as const;
const STATUS_LABEL = { modified: "Modified", added: "Added", deleted: "Deleted" } as const;

function DiffCard() {
  return (
    <div style={{
      background: "#fff", borderRadius: 20,
      boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 4px 20px rgba(0,0,0,0.06)",
      border: "1px solid rgba(0,0,0,0.07)",
      overflow: "hidden", maxWidth: 460,
    }}>
      {/* header */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #f4f4f5", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafafa" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileCode2 size={15} color="#52525b" />
          <span style={{ fontWeight: 700, fontSize: 13, color: "#18181b" }}>awesome-ai-app</span>
          <span style={{ fontSize: 11, color: "#a1a1aa", background: "#f4f4f5", padding: "2px 7px", borderRadius: 6 }}>private</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#dcfce7", padding: "4px 10px", borderRadius: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "block" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a" }}>Ready to push</span>
        </div>
      </div>
      {/* tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #f4f4f5", paddingLeft: 18 }}>
        {["Changes","Preview"].map((t, i) => (
          <span key={t} style={{
            padding: "10px 0", marginRight: 20, fontSize: 13,
            fontWeight: i === 0 ? 600 : 400,
            color: i === 0 ? "#f97316" : "#a1a1aa",
            borderBottom: i === 0 ? "2px solid #f97316" : "2px solid transparent",
            cursor: "pointer",
          }}>{t}</span>
        ))}
      </div>
      {/* stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "14px 18px", borderBottom: "1px solid #f4f4f5", gap: 0 }}>
        {[
          { v: "42", l: "Changed", c: "#18181b" },
          { v: "+28", l: "Added", c: "#16a34a" },
          { v: "−10", l: "Modified", c: "#f97316" },
          { v: "−4",  l: "Deleted",  c: "#ef4444" },
        ].map(s => (
          <div key={s.l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.c, letterSpacing: "-0.03em" }}>{s.v}</div>
            <div style={{ fontSize: 10, color: "#a1a1aa", marginTop: 2, fontWeight: 500 }}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* files */}
      <div style={{ padding: "8px 18px 4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0 8px", borderBottom: "1px solid #f9f9f9" }}>
          <span style={{ fontSize: 10, color: "#a1a1aa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>File</span>
          <span style={{ fontSize: 10, color: "#a1a1aa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Status</span>
        </div>
        {DIFF_FILES.map(f => (
          <div key={f.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #fafafa" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <FileCode2 size={12} color="#d4d4d8" />
              <span style={{ fontSize: 12, color: "#52525b", fontFamily: "monospace" }}>{f.name}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLOR[f.status as keyof typeof STATUS_COLOR] }}>
              {STATUS_LABEL[f.status as keyof typeof STATUS_LABEL]}
            </span>
          </div>
        ))}
      </div>
      {/* push button */}
      <div style={{ padding: "14px 18px 18px" }}>
        <div style={{
          background: "linear-gradient(135deg,#f97316,#ea580c)",
          borderRadius: 10, padding: "13px 0",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
        }}>
          <Github size={15} color="#fff" />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Push to GitHub</span>
        </div>
      </div>
    </div>
  );
}

// ── LANDING PAGE ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = () => navigate({ to: isOnboardingDone() ? "/dashboard" : "/onboarding" });

  const NAV = [
    { label: "Features",   id: "features" },
    { label: "How it Works", id: "how-it-works" },
    { label: "Platforms",  id: "platforms" },
    { label: "FAQ",        id: "faq" },
  ];

  return (
    <div style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", color: "#18181b", overflowX: "hidden" }}>

      {/* ── GLOBAL STYLES ─────────────────────────────────────────────── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        /* nav */
        .lp-nav-links { display: flex !important; }
        .lp-nav-cta   { display: inline-flex !important; }
        .lp-hamburger { display: none !important; }

        /* hero grid */
        .lp-hero   { grid-template-columns: 1fr 1fr !important; }
        .lp-grids-2col { grid-template-columns: 1fr 1fr !important; }
        .lp-grids-3col { grid-template-columns: repeat(3, 1fr) !important; }
        .lp-grids-4col { grid-template-columns: repeat(4, 1fr) !important; }
        .lp-footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr !important; }

        @keyframes fadeUp {
          from { opacity:0; transform: translateY(8px); }
          to   { opacity:1; transform: translateY(0);   }
        }
        @keyframes pulse-ring {
          0%  { transform: scale(1);   opacity: 0.6; }
          100%{ transform: scale(1.6); opacity: 0;   }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }

        .lp-feat-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.09) !important; transform: translateY(-3px) !important; }
        .lp-step:hover .lp-step-icon { background: linear-gradient(135deg,#f97316,#ea580c) !important; }
        .lp-step:hover .lp-step-icon svg { color: #fff !important; }

        .lp-btn-primary {
          background: linear-gradient(135deg,#f97316,#ea580c);
          color: #fff; border: none; border-radius: 10px;
          font-weight: 700; cursor: pointer; display: inline-flex;
          align-items: center; gap: 8px; transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(249,115,22,0.35);
          font-family: inherit;
        }
        .lp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(249,115,22,0.45); filter: brightness(1.05); }

        .lp-btn-ghost {
          background: transparent; color: #52525b;
          border: 1.5px solid #e4e4e7; border-radius: 10px;
          font-weight: 600; cursor: pointer; display: inline-flex;
          align-items: center; gap: 8px; transition: all 0.2s;
          font-family: inherit;
        }
        .lp-btn-ghost:hover { border-color: #a1a1aa; background: #fafafa; color: #18181b; }

        .lp-section-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg,rgba(249,115,22,0.1),rgba(249,115,22,0.06));
          border: 1px solid rgba(249,115,22,0.25);
          color: #f97316; font-size: 11px; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase;
          padding: 5px 12px; border-radius: 20px; margin-bottom: 16px;
        }
        .lp-section-badge-dark {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(249,115,22,0.12);
          border: 1px solid rgba(249,115,22,0.3);
          color: #fb923c; font-size: 11px; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase;
          padding: 5px 12px; border-radius: 20px; margin-bottom: 16px;
        }

        @media (max-width: 768px) {
          .lp-nav-links { display: none !important; }
          .lp-nav-cta   { display: none !important; }
          .lp-hamburger { display: flex !important; }
          .lp-hero      { grid-template-columns: 1fr !important; }
          .lp-grids-2col { grid-template-columns: 1fr !important; }
          .lp-grids-3col { grid-template-columns: 1fr !important; }
          .lp-grids-4col { grid-template-columns: 1fr 1fr !important; }
          .lp-footer-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-hero-section { padding-top: 40px !important; padding-bottom: 56px !important; }
          .lp-section { padding-top: 64px !important; padding-bottom: 64px !important; }
        }
        @media (max-width: 480px) {
          .lp-grids-4col { grid-template-columns: 1fr !important; }
          .lp-footer-grid { grid-template-columns: 1fr !important; }
          .lp-grids-3col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: scrolled ? "rgba(255,255,255,0.92)" : "#fff",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: `1px solid ${scrolled ? "rgba(0,0,0,0.07)" : "transparent"}`,
        transition: "all 0.25s ease",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 0 }}>
          {/* logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", flexShrink: 0 }}>
            <img src={appLogo} alt="Push44" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "contain" }} />
            <span style={{ fontWeight: 800, fontSize: 16, color: "#09090b", letterSpacing: "-0.03em" }}>Push44</span>
          </a>

          {/* desktop nav */}
          <div className="lp-nav-links" style={{ alignItems: "center", gap: 4, marginLeft: 36, flex: 1 }}>
            {NAV.map(l => (
              <button key={l.id} onClick={() => smooth(l.id)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 14, color: "#71717a", fontWeight: 500,
                padding: "6px 12px", borderRadius: 8, transition: "all 0.15s",
                fontFamily: "inherit",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "#18181b"; e.currentTarget.style.background = "#f4f4f5"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#71717a"; e.currentTarget.style.background = "none"; }}
              >{l.label}</button>
            ))}
            <a href="https://github.com/push44/push44" target="_blank" rel="noopener noreferrer" style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 14, color: "#71717a", textDecoration: "none",
              fontWeight: 500, padding: "6px 12px", borderRadius: 8, transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "#18181b"; e.currentTarget.style.background = "#f4f4f5"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#71717a"; e.currentTarget.style.background = "none"; }}
            >
              <Github size={15} />
              <span>GitHub</span>
              <span style={{ background: "#f4f4f5", color: "#52525b", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>12.4K</span>
            </a>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={go} className="lp-btn-primary lp-nav-cta" style={{ fontSize: 14, padding: "9px 18px" }}>
              Launch App <ArrowRight size={14} />
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lp-hamburger" style={{
              background: "none", border: "1.5px solid #e4e4e7", borderRadius: 8,
              width: 38, height: 38, cursor: "pointer", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 5, transition: "all 0.15s",
            }}>
              {menuOpen
                ? <X size={18} color="#52525b" />
                : <Menu size={18} color="#52525b" />}
            </button>
          </div>
        </div>

        {/* mobile menu */}
        {menuOpen && (
          <div style={{ borderTop: "1px solid #f4f4f5", background: "#fff", padding: "16px 24px 24px" }}>
            {NAV.map(l => (
              <button key={l.id} onClick={() => { smooth(l.id); setMenuOpen(false); }} style={{
                display: "block", width: "100%", textAlign: "left",
                background: "none", border: "none", padding: "12px 0",
                fontSize: 16, color: "#52525b", fontWeight: 500, cursor: "pointer",
                borderBottom: "1px solid #fafafa", fontFamily: "inherit",
              }}>{l.label}</button>
            ))}
            <button onClick={() => { go(); setMenuOpen(false); }} className="lp-btn-primary" style={{ width: "100%", marginTop: 16, padding: "13px 0", fontSize: 15, justifyContent: "center" }}>
              Launch App <ArrowRight size={15} />
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="lp-hero-section" style={{ background: "#fff", paddingTop: 80, paddingBottom: 96, position: "relative", overflow: "hidden" }}>
        {/* background glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.08) 0%, transparent 70%)",
        }} />
        {/* dot grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4,
          backgroundImage: "radial-gradient(circle, #e4e4e7 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, black 40%, transparent 80%)",
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          {/* top badge */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
            <a href="https://github.com/push44/push44" target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none",
              background: "#fafafa", border: "1px solid #e4e4e7",
              padding: "7px 16px", borderRadius: 30,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.background = "#fff7ed"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e4e4e7"; e.currentTarget.style.background = "#fafafa"; }}
            >
              <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10, letterSpacing: "0.05em" }}>OPEN SOURCE</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#71717a", fontWeight: 500 }}>
                <Star size={12} color="#f59e0b" fill="#f59e0b" /> 12.4K stars on GitHub
              </span>
              <span style={{ width: 1, height: 14, background: "#e4e4e7" }} />
              <span style={{ fontSize: 11, color: "#a1a1aa", fontWeight: 600, letterSpacing: "0.04em" }}>MIT LICENSE</span>
            </a>
          </div>

          <div className="lp-hero" style={{ display: "grid", gap: 64, alignItems: "center" }}>
            {/* left */}
            <div>
              <h1 style={{
                fontSize: "clamp(36px,5.5vw,60px)", fontWeight: 900,
                lineHeight: 1.08, letterSpacing: "-0.04em", color: "#09090b",
                margin: "0 0 22px",
              }}>
                Export AI‑Generated Code<br />
                from Any Platform.<br />
                <span style={{
                  background: "linear-gradient(135deg,#f97316,#dc2626)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>Free. Forever.</span>
              </h1>
              <p style={{ fontSize: 17, color: "#71717a", lineHeight: 1.7, margin: "0 0 32px", maxWidth: 480 }}>
                Most AI coding platforms let you build apps but don't let you own your code.
                Push44 bypasses those limits — export your <strong style={{ color: "#52525b", fontWeight: 600 }}>full source code</strong> to
                GitHub in one click, without any subscription or paywall.
              </p>

              {/* bullets */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: 11 }}>
                {[
                  "Bypass export restrictions on any AI platform",
                  "Keep 100% ownership of your source code",
                  "Push directly to GitHub in one click",
                  "No backend — everything runs in your browser",
                  "Always free. Open source. No hidden plans.",
                ].map(item => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: "#52525b" }}>
                    <CheckCircle2 size={17} color="#f97316" style={{ flexShrink: 0, marginTop: 1 }} />
                    {item}
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 32 }}>
                <button onClick={go} className="lp-btn-primary" style={{ fontSize: 15, padding: "13px 24px" }}>
                  Start Exporting Now <ArrowRight size={15} />
                </button>
                <a href="https://github.com/push44/push44" target="_blank" rel="noopener noreferrer" className="lp-btn-ghost" style={{ fontSize: 15, padding: "12px 22px", textDecoration: "none" }}>
                  <Github size={16} /> View on GitHub
                </a>
              </div>

              {/* social proof */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex" }}>
                  {["#f87171","#60a5fa","#34d399","#a78bfa","#fbbf24"].map((c, i) => (
                    <div key={i} style={{
                      width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${c},${c}bb)`,
                      border: "2.5px solid #fff", marginLeft: i === 0 ? 0 : -10,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, color: "#fff",
                    }}>{["A","B","C","D","E"][i]}</div>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: "#71717a", lineHeight: 1.45 }}>
                  <strong style={{ color: "#52525b" }}>Thousands of builders</strong> already<br />exporting their code with Push44
                </div>
              </div>
            </div>

            {/* right */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <DiffCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORM STRIP ────────────────────────────────────────────────── */}
      <section id="platforms" style={{ background: "#fafafa", borderTop: "1px solid #f4f4f5", borderBottom: "1px solid #f4f4f5", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 28 }}>
            Works with 4+ AI coding platforms · More coming soon
          </p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {[
              { name: "Base44",     logo: base44LogoImg,  bg: "#f97316" },
              { name: "Rocket.new", logo: rocketLogoImg,  bg: "#09090b" },
              { name: "Floot",      logo: flootLogoImg,   bg: "#7c3aed" },
              { name: "Zite",       logo: ziteLogoImg,    bg: "#1e40af" },
            ].map(p => (
              <div key={p.name} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "#fff", border: "1px solid #e4e4e7",
                padding: "10px 20px", borderRadius: 12,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <img src={p.logo} alt={p.name} style={{ width: 22, height: 22, objectFit: "contain" }} />
                </div>
                <span style={{ fontWeight: 700, color: "#18181b", fontSize: 14 }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM ───────────────────────────────────────────────────────── */}
      <section style={{ background: "#09090b", padding: "96px 24px" }} className="lp-section">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="lp-grids-2col" style={{ display: "grid", gap: 72, alignItems: "start" }}>
            {/* left */}
            <div>
              <div className="lp-section-badge-dark"><Lock size={11} /> The Problem</div>
              <h2 style={{ fontSize: "clamp(30px,4vw,46px)", fontWeight: 900, color: "#fafafa", lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 20px" }}>
                AI Platforms Lock<br />Your Code.<br />
                <span style={{ background: "linear-gradient(135deg,#f97316,#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>We Set It Free.</span>
              </h2>
              <p style={{ fontSize: 16, color: "#71717a", lineHeight: 1.7, maxWidth: 380 }}>
                You build with AI. They profit. You get nothing.<br />Push44 gives the power back to you.
              </p>

              <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Export-locked", desc: "Your code lives on their servers" },
                  { label: "Paywall-gated", desc: "Pay $50/mo to access your own files" },
                  { label: "Subscription trap", desc: "Cancel and lose everything" },
                ].map(i => (
                  <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#f4f4f5" }}>{i.label}</span>
                    <span style={{ fontSize: 13, color: "#71717a" }}>— {i.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* right: pain cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { Icon: Lock,         bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",  iconC: "#ef4444", title: "Build amazing apps on AI platforms", desc: "Hours of work crafting something great on Base44, Rocket.new, Floot, or Zite." },
                { Icon: Ban,          bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)", iconC: "#f97316", title: "Try to export your code", desc: "Hit a wall. Export is disabled, hidden behind a paywall, or doesn't exist at all." },
                { Icon: CreditCard,   bg: "rgba(234,179,8,0.08)",  border: "rgba(234,179,8,0.2)",  iconC: "#ca8a04", title: "Hit a paywall or upgrade plan", desc: "Told to pay $50/mo just to download code you already wrote. Absurd." },
                { Icon: AlertCircle,  bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)", iconC: "#a855f7", title: "Still can't get your full code", desc: "Even paid tiers give incomplete exports. You never truly own what you built." },
              ].map(({ Icon, bg, border, iconC, title, desc }) => (
                <div key={title} style={{
                  background: bg, border: `1px solid ${border}`,
                  borderRadius: 14, padding: "18px 20px",
                  display: "flex", alignItems: "flex-start", gap: 14,
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateX(4px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color={iconC} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#fafafa", fontSize: 14, marginBottom: 5 }}>{title}</div>
                    <div style={{ fontSize: 13, color: "#71717a", lineHeight: 1.55 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section id="features" style={{ background: "#fff", padding: "96px 24px" }} className="lp-section">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* header */}
          <div className="lp-grids-2col" style={{ display: "grid", gap: 48, alignItems: "end", marginBottom: 56 }}>
            <div>
              <div className="lp-section-badge"><Zap size={11} /> Powerful Features</div>
              <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, color: "#09090b", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
                Everything You Need.<br />
                Nothing{" "}
                <span style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>You Don't.</span>
              </h2>
            </div>
            <p style={{ fontSize: 16, color: "#71717a", lineHeight: 1.7, maxWidth: 400 }}>
              Push44 is the most powerful export tool for AI-generated projects. Built for speed, designed for real builders.
            </p>
          </div>

          {/* cards */}
          <div className="lp-grids-3col" style={{ display: "grid", gap: 18 }}>
            {[
              { Icon: Zap,        iconBg: "linear-gradient(135deg,#fff7ed,#ffedd5)", iconC: "#f97316", title: "One Click Export",        desc: "Export your entire project to GitHub in a single click using the Trees API. Handles 100+ files atomically in one commit." },
              { Icon: GitCompare, iconBg: "linear-gradient(135deg,#eff6ff,#dbeafe)", iconC: "#2563eb", title: "Smart Diff Preview",      desc: "See every added, modified, and deleted file before you push. Full transparency — know exactly what's changing each time." },
              { Icon: Heart,      iconBg: "linear-gradient(135deg,#f0fdf4,#dcfce7)", iconC: "#16a34a", title: "100% Free & Open Source", desc: "No hidden fees. No premium plans. The source code is open for everyone — fork it, star it, contribute to it." },
              { Icon: ShieldCheck,iconBg: "linear-gradient(135deg,#f5f3ff,#ede9fe)", iconC: "#7c3aed", title: "No Backend. No Servers.",  desc: "Runs entirely in your browser. Your credentials and code never touch any third-party server beyond GitHub and your chosen platform." },
              { Icon: Download,   iconBg: "linear-gradient(135deg,#fefce8,#fef9c3)", iconC: "#ca8a04", title: "ZIP Download",            desc: "Not using GitHub? Download your entire project as a ZIP file at any time — no account, no sign-up required." },
              { Icon: History,    iconBg: "linear-gradient(135deg,#fff1f2,#ffe4e6)", iconC: "#e11d48", title: "Push History",            desc: "Full audit trail of every push. Track all your exports and manage versions easily. Never lose your work again." },
            ].map(({ Icon, iconBg, iconC, title, desc }) => (
              <div key={title} className="lp-feat-card" style={{
                background: "#fafafa", borderRadius: 16,
                border: "1px solid #f4f4f5",
                padding: "28px 28px 32px",
                transition: "all 0.25s ease",
                cursor: "default",
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <Icon size={22} color={iconC} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: "#09090b", margin: "0 0 10px", letterSpacing: "-0.01em" }}>{title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#71717a", lineHeight: 1.68 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: "#09090b", padding: "96px 24px" }} className="lp-section">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="lp-grids-2col" style={{ display: "grid", gap: 72, alignItems: "start" }}>
            {/* left */}
            <div>
              <div className="lp-section-badge-dark"><GitBranch size={11} /> How it Works</div>
              <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, color: "#fafafa", lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
                From AI to GitHub<br />in 4 Simple Steps
              </h2>
              <p style={{ color: "#71717a", fontSize: 15, lineHeight: 1.65, margin: "0 0 36px" }}>
                Built for speed. Designed for builders.
              </p>
              <button onClick={go} className="lp-btn-primary" style={{ fontSize: 15, padding: "13px 24px" }}>
                Start Now — It's Free <ArrowRight size={15} />
              </button>

              <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { Icon: Link2,      n: "01", title: "Connect GitHub",   desc: "Authorize once with your GitHub account via OAuth or Personal Access Token." },
                  { Icon: Layers,     n: "02", title: "Select Platform",  desc: "Pick your AI builder — Base44, Rocket.new, Floot, or Zite — and select your app." },
                  { Icon: Code2,      n: "03", title: "Review Changes",   desc: "Inspect the smart diff before committing. See exactly what's new, changed, or deleted." },
                  { Icon: UploadCloud,n: "04", title: "Push",             desc: "One click creates a real commit on GitHub. Your code, your repo, your rules." },
                ].map(({ Icon, n, title, desc }, i) => (
                  <div key={n} className="lp-step" style={{ display: "flex", gap: 20, paddingBottom: 28, position: "relative", cursor: "default" }}>
                    {i < 3 && <div style={{ position: "absolute", left: 22, top: 48, width: 2, height: "calc(100% - 20px)", background: "rgba(255,255,255,0.06)", borderRadius: 2 }} />}
                    <div className="lp-step-icon" style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}>
                      <Icon size={18} color="#71717a" style={{ transition: "color 0.2s" }} />
                    </div>
                    <div style={{ paddingTop: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.06em" }}>{n}</span>
                        <span style={{ fontWeight: 700, fontSize: 15, color: "#fafafa" }}>{title}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: "#71717a", lineHeight: 1.6 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* right: terminal */}
            <div style={{ position: "sticky", top: 88 }}>
              <Terminal />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ background: "#fff", padding: "96px 24px" }} className="lp-section">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="lp-section-badge" style={{ justifyContent: "center" }}>FAQ</div>
            <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 900, color: "#09090b", letterSpacing: "-0.03em" }}>
              Frequently Asked Questions
            </h2>
          </div>
          <FAQList />
        </div>
      </section>

      {/* ── CTA SECTION ───────────────────────────────────────────────────── */}
      <section style={{ background: "#09090b", padding: "96px 24px", textAlign: "center", position: "relative", overflow: "hidden" }} className="lp-section">
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(249,115,22,0.12) 0%, transparent 70%)" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
          <h2 style={{ fontSize: "clamp(32px,5vw,54px)", fontWeight: 900, color: "#fafafa", lineHeight: 1.08, letterSpacing: "-0.04em", margin: "0 0 20px" }}>
            Your Code.<br />Your Rules.<br />
            <span style={{ background: "linear-gradient(135deg,#f97316,#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Your Repository.</span>
          </h2>
          <p style={{ fontSize: 17, color: "#71717a", lineHeight: 1.65, margin: "0 0 40px" }}>
            Don't let platforms lock what you build.<br />
            <strong style={{ color: "#a1a1aa", fontWeight: 600 }}>Export. Own. Freedom.</strong>
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <button onClick={go} className="lp-btn-primary" style={{ fontSize: 16, padding: "14px 28px" }}>
              Launch Push44 Now <ArrowRight size={16} />
            </button>
            <a href="https://github.com/push44/push44" target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#e4e4e7", padding: "13px 24px", borderRadius: 10, fontWeight: 600, fontSize: 16,
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            >
              <Star size={16} color="#f59e0b" /> Star on GitHub
            </a>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {["No Signup Required","No Credit Card","Always Free"].map(t => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#71717a", fontWeight: 500 }}>
                <CheckCircle2 size={13} color="#3fb950" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer style={{ background: "#050506", padding: "56px 24px 32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="lp-footer-grid" style={{ display: "grid", gap: 48, marginBottom: 48 }}>
            {/* brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <img src={appLogo} alt="Push44" style={{ width: 28, height: 28, borderRadius: 7, objectFit: "contain" }} />
                <span style={{ fontWeight: 800, fontSize: 16, color: "#fafafa", letterSpacing: "-0.02em" }}>Push44</span>
              </div>
              <p style={{ fontSize: 13, color: "#52525b", lineHeight: 1.65, margin: "0 0 20px", maxWidth: 220 }}>
                Open source tool to export and version control AI-generated projects. Built for builders.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <a href="https://github.com/push44/push44" target="_blank" rel="noopener noreferrer" style={{
                  width: 34, height: 34, borderRadius: 8, background: "#111113",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#71717a", textDecoration: "none", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#1c1c1f"; e.currentTarget.style.color = "#fafafa"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#111113"; e.currentTarget.style.color = "#71717a"; }}
                ><Github size={15} /></a>
              </div>
            </div>

            <FooterCol title="Product" links={[
              { label: "Features",    fn: () => smooth("features") },
              { label: "How it Works",fn: () => smooth("how-it-works") },
              { label: "Platforms",   fn: () => smooth("platforms") },
              { label: "Changelog",   href: "https://github.com/push44/push44/releases" },
            ]} />
            <FooterCol title="Resources" links={[
              { label: "Documentation", href: "https://github.com/push44/push44#readme" },
              { label: "API Reference",  href: "https://github.com/push44/push44/wiki" },
              { label: "FAQ",            fn: () => smooth("faq") },
            ]} />
            <FooterCol title="Community" links={[
              { label: "GitHub",       href: "https://github.com/push44/push44" },
              { label: "Discussions",  href: "https://github.com/push44/push44/discussions" },
              { label: "Twitter / X",  href: "https://twitter.com" },
            ]} />
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#3f3f46" }}>© 2024 Push44. Open source under the MIT License.</span>
            <div style={{ display: "flex", gap: 20 }}>
              {["Privacy","Terms","GitHub"].map((l, i) => (
                <a key={l} href={i === 2 ? "https://github.com/push44/push44" : "#"} style={{ fontSize: 12, color: "#52525b", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#a1a1aa"}
                  onMouseLeave={e => e.currentTarget.style.color = "#52525b"}
                >{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── FOOTER COLUMN ──────────────────────────────────────────────────────────────
function FooterCol({ title, links }: { title: string; links: { label: string; href?: string; fn?: () => void }[] }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(l => l.href ? (
          <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
            style={{ fontSize: 14, color: "#71717a", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fafafa"}
            onMouseLeave={e => e.currentTarget.style.color = "#71717a"}
          >{l.label}</a>
        ) : (
          <button key={l.label} onClick={l.fn} style={{
            background: "none", border: "none", padding: 0, fontSize: 14,
            color: "#71717a", cursor: "pointer", textAlign: "left", transition: "color 0.15s", fontFamily: "inherit",
          }}
            onMouseEnter={e => e.currentTarget.style.color = "#fafafa"}
            onMouseLeave={e => e.currentTarget.style.color = "#71717a"}
          >{l.label}</button>
        ))}
      </div>
    </div>
  );
}

// ── FAQ ACCORDION ──────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Is Push44 really free?", a: "Yes, completely. Push44 is 100% free and open source under the MIT license. There are no premium plans, no paywalls, no subscriptions — ever." },
  { q: "Which AI platforms does Push44 support?", a: "Currently Base44, Rocket.new, Floot, and Zite. We're actively adding more — submit a request on GitHub if your platform isn't listed." },
  { q: "Do I need to install anything?", a: "No. Push44 runs entirely in your browser. No installation, no server, no backend. Everything — your tokens, your code, your history — stays on your device." },
  { q: "Is my code safe?", a: "Yes. Push44 never sends your code or credentials to any third-party server (other than directly to GitHub and the platform you selected). All processing is client-side." },
  { q: "How do I get a GitHub Personal Access Token?", a: "Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Generate new token. Grant repo and user scopes. Push44 also supports GitHub OAuth for one-click connection." },
  { q: "Can I push to a private repository?", a: "Yes. Both public and private repos are supported. You can also create new repositories directly from Push44, choosing visibility at creation time." },
  { q: "What happens if the export fails?", a: "Push44 shows the exact error and never fails silently. Common issues are sleeping containers (Rocket.new) or expired tokens — the UI guides you through each fix." },
];

function FAQList() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {FAQS.map((f, i) => (
        <div key={i} style={{ border: `1px solid ${open === i ? "#f97316" : "#e4e4e7"}`, borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s" }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{
            width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "18px 20px", background: open === i ? "#fff7ed" : "#fff",
            border: "none", cursor: "pointer", gap: 16, transition: "background 0.2s", fontFamily: "inherit",
          }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: "#09090b", textAlign: "left" }}>{f.q}</span>
            <span style={{ flexShrink: 0, color: open === i ? "#f97316" : "#a1a1aa", transition: "color 0.2s" }}>
              {open === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </button>
          {open === i && (
            <div style={{ padding: "0 20px 18px", background: "#fff7ed" }}>
              <p style={{ margin: 0, fontSize: 14, color: "#71717a", lineHeight: 1.7 }}>{f.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
