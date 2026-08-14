import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Copy, Check, Sparkles, Smartphone, ShieldCheck, Cpu, Play } from "lucide-react";

export function CliShowcase() {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"install" | "sync" | "inspect" | "apk" | "doctor">("install");

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 2000);
  };

  const installCmds = {
    curl: "curl -fsSL https://raw.githubusercontent.com/The-habib/Push44/main/install.sh | sh",
    bun: "bun add -g push44",
    npm: "npm install -g push44",
    npx: "bun run cli --help",
  };

  return (
    <section style={{ padding: "96px 20px", background: "#130f0c", borderBottom: "1px solid #2a1f1a", color: "#f4f4f5" }} id="cli">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 14px", border: "1px solid #3f2e24", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "#f97316", background: "rgba(249,115,22,0.08)", marginBottom: 20 }}>
            <Terminal size={14} />
            Universal Terminal Interface (p44)
          </div>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, color: "#fffefb", letterSpacing: "-0.04em", margin: "0 0 18px", lineHeight: 1.1 }}>
            Prefer the terminal?<br />Meet <span style={{ color: "#f97316" }}>Push44 CLI</span>.
          </h2>
          <p style={{ fontSize: 17, color: "#a19992", maxWidth: 580, margin: "0 auto", lineHeight: 1.65 }}>
            Built for vibe coders, Cursor, VS Code, and power developers. Export source code, auto-commit with AI messages, compile mobile APKs, and sync to GitHub without friction.
          </p>
        </div>

        {/* Quick Install Bar */}
        <div style={{ maxWidth: 720, margin: "0 auto 48px", background: "#1c1612", border: "1px solid #382921", borderRadius: 14, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260 }}>
            <span style={{ color: "#f97316", fontFamily: "monospace", fontSize: 15, fontWeight: 700 }}>$</span>
            <code style={{ fontSize: 13, color: "#e4e4e7", fontFamily: "monospace", overflowX: "auto" }}>
              {installCmds.curl}
            </code>
          </div>
          <button
            onClick={() => copyCommand(installCmds.curl)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: copied ? "#22c55e" : "#f97316", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Interactive Terminal Window */}
        <div style={{ maxWidth: 860, margin: "0 auto 64px", background: "#090807", borderRadius: 16, border: "1px solid #2d211a", overflow: "hidden", boxShadow: "0 30px 80px -20px rgba(0,0,0,0.8)" }}>
          {/* Window Bar */}
          <div style={{ background: "#181310", borderBottom: "1px solid #2d211a", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {["#ef4444", "#f97316", "#22c55e"].map((c) => (
                <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.75 }} />
              ))}
              <span style={{ fontSize: 12, color: "#8a7f78", fontFamily: "monospace", marginLeft: 8 }}>push44 — zsh — 80x24</span>
            </div>

            {/* Terminal Tab Switcher */}
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { id: "install", label: "Quickstart" },
                { id: "sync", label: "push44 sync" },
                { id: "inspect", label: "push44 inspect" },
                { id: "apk", label: "push44 apk" },
                { id: "doctor", label: "push44 doctor" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    background: activeTab === t.id ? "#f97316" : "rgba(255,255,255,0.05)",
                    color: activeTab === t.id ? "#fff" : "#a19992",
                    transition: "all 0.15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Screen Body */}
          <div style={{ padding: "24px 28px", fontFamily: "ui-monospace, monospace", fontSize: 13, lineHeight: 1.7, color: "#e4e4e7", minHeight: 280 }}>
            <AnimatePresence mode="wait">
              {activeTab === "install" && (
                <motion.div key="install" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ color: "#f97316", fontWeight: 700 }}>╭─────────────────────────────────────────────────────────────╮</div>
                  <div style={{ color: "#f97316", fontWeight: 700 }}>│  ✦ Push44 · AI Vibe-Coding Hub                     v1.0.0   │</div>
                  <div style={{ color: "#8a7f78" }}>│  Connected: [GitHub ✓] · [Base44 ●] · [Rocket ●]            │</div>
                  <div style={{ color: "#8a7f78" }}>│  Context:   my-ai-startup (Base44) → owner/repo [main]      │</div>
                  <div style={{ color: "#f97316", fontWeight: 700 }}>╰─────────────────────────────────────────────────────────────╯</div>
                  <div style={{ marginTop: 12, color: "#a19992" }}>? Choose an action:</div>
                  <div style={{ color: "#22c55e", fontWeight: 600 }}>❯ 🚀 Quick Sync to GitHub <span style={{ color: "#8a7f78" }}>(Auto-detect changes &amp; push)</span></div>
                  <div style={{ color: "#a19992" }}>  📦 Download / Clone AI App <span style={{ color: "#8a7f78" }}>(Base44, Rocket, Floot, Zite)</span></div>
                  <div style={{ color: "#a19992" }}>  🔍 Inspect Project Architecture <span style={{ color: "#8a7f78" }}>(React 19 + Tailwind v4)</span></div>
                  <div style={{ color: "#a19992" }}>  🩺 Doctor &amp; Self-Repair <span style={{ color: "#8a7f78" }}>(Full health audit)</span></div>
                </motion.div>
              )}

              {activeTab === "sync" && (
                <motion.div key="sync" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ color: "#8a7f78" }}>$ push44 sync</div>
                  <div style={{ color: "#22c55e", margin: "6px 0" }}>✓ Analyzed local working tree: 3 files changed</div>
                  <div style={{ color: "#22c55e" }}>  + src/components/HeroBanner.tsx</div>
                  <div style={{ color: "#f97316" }}>  ~ src/styles.css</div>
                  <div style={{ color: "#f97316" }}>  ~ package.json</div>
                  <div style={{ marginTop: 10, color: "#38bdf8" }}>✦ AI Generated Commit: <span style={{ color: "#fff", fontWeight: 600 }}>feat(ui): update HeroBanner and responsive typography</span></div>
                  <div style={{ color: "#22c55e", marginTop: 6 }}>✓ Atomic push to GitHub Trees API complete (commit: <span style={{ color: "#e4e4e7" }}>4f8a21c</span>)</div>
                </motion.div>
              )}

              {activeTab === "inspect" && (
                <motion.div key="inspect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ color: "#8a7f78" }}>$ push44 inspect</div>
                  <div style={{ color: "#f97316", fontWeight: 700, margin: "8px 0" }}>✦ Project Tech Stack Inspection</div>
                  <div style={{ color: "#a19992" }}>  Framework:   <span style={{ color: "#22c55e" }}>React 19 + Vite</span></div>
                  <div style={{ color: "#a19992" }}>  Styling:     <span style={{ color: "#38bdf8" }}>Tailwind CSS v4</span></div>
                  <div style={{ color: "#a19992" }}>  UI Kit:      <span style={{ color: "#e4e4e7" }}>Radix UI Primitives · Lucide Icons · Framer Motion</span></div>
                  <div style={{ color: "#a19992" }}>  Total Files: <span style={{ color: "#fff" }}>42 source files (1,840 lines of code)</span></div>
                  <div style={{ marginTop: 10, color: "#8a7f78" }}>📁 src/ ├── ⚛ App.tsx ├── 📁 components/ ├── 🎨 styles.css └── 📦 package.json</div>
                </motion.div>
              )}

              {activeTab === "apk" && (
                <motion.div key="apk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ color: "#8a7f78" }}>$ push44 apk build --watch</div>
                  <div style={{ color: "#22c55e" }}>✓ Triggered cloud build on Rocket.new build servers</div>
                  <div style={{ color: "#f97316" }}>⠋ Compiling Flutter engine &amp; Android bundle...</div>
                  <div style={{ color: "#22c55e", marginTop: 8 }}>✓ APK compilation complete! (14.2 MB)</div>
                  <div style={{ color: "#38bdf8" }}>✓ Downloaded release binary to: <span style={{ color: "#fff" }}>./release-app.apk</span></div>
                </motion.div>
              )}

              {activeTab === "doctor" && (
                <motion.div key="doctor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ color: "#8a7f78" }}>$ push44 doctor --fix</div>
                  <div style={{ color: "#22c55e" }}>✓ Node.js &amp; Bun runtimes verified</div>
                  <div style={{ color: "#22c55e" }}>✓ Git CLI tool installed (git version 2.53.0)</div>
                  <div style={{ color: "#22c55e" }}>✓ Encrypted credentials storage (~/.push44) verified</div>
                  <div style={{ color: "#22c55e" }}>✓ GitHub API connection valid (@The-habib)</div>
                  <div style={{ color: "#22c55e" }}>✓ Base44, Rocket.new, Floot API endpoints reachable</div>
                  <div style={{ color: "#22c55e", marginTop: 8, fontWeight: 700 }}>✓ All doctor checks passed! Push44 CLI is healthy and ready.</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Feature Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            {
              icon: Sparkles,
              title: "AI Semantic Commits",
              desc: "Analyzes what you changed and writes conventional commit messages automatically.",
            },
            {
              icon: Smartphone,
              title: "Rocket.new Mobile APKs",
              desc: "Trigger cloud Android builds and download phone-ready .apk binaries in 1 command.",
            },
            {
              icon: Cpu,
              title: "Stack Architecture Inspector",
              desc: "Detects React 19, Vite, Next.js, Flutter, Tailwind, and renders visual directory trees.",
            },
            {
              icon: ShieldCheck,
              title: "Secret Scrubbing & Redaction",
              desc: "Guarantees zero token leaks. Secrets are encrypted locally with AES-256-GCM.",
            },
          ].map((f) => (
            <div key={f.title} style={{ padding: 24, background: "#1a1410", border: "1px solid #2f221a", borderRadius: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <f.icon size={18} color="#f97316" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.01em" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#8a7f78", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
