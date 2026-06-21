import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Github,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Shield,
  Zap,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { base44Login, validateBase44Token } from "@/lib/base44-api";
import { getGitHubUser } from "@/lib/github-api";
import { markOnboardingDone } from "@/lib/storage";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GITHUB_TOKEN_URL =
  "https://github.com/settings/tokens/new?scopes=repo%2Cuser&description=Push44";

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="transition-all duration-300"
          style={{
            height: 6,
            width: i === current ? 24 : 6,
            borderRadius: 9999,
            background: i === current ? "#dce99a" : "rgba(255,255,255,0.2)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Step 0 — Welcome ─────────────────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Logo */}
      <div className="h-20 w-20 rounded-3xl bg-[#1a1a1a] flex items-center justify-center mb-6 shadow-2xl ring-1 ring-white/10">
        <span className="text-[#a78bfa] font-extrabold text-4xl italic">B</span>
      </div>

      <h1 className="text-[36px] font-extrabold text-white leading-tight tracking-tight mb-3">
        Welcome to{" "}
        <span
          className="text-transparent bg-clip-text"
          style={{ backgroundImage: "linear-gradient(90deg,#a78bfa,#dce99a)" }}
        >
          Push44
        </span>
      </h1>
      <p className="text-[15px] text-white/50 leading-relaxed max-w-xs mb-10">
        Push your Base44 apps to GitHub in one tap. Let's get you set up in under 2 minutes.
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {["Base44 → GitHub", "One-tap push", "Secure & private"].map((f) => (
          <span
            key={f}
            className="text-[11px] font-semibold text-white/60 border border-white/10 rounded-full px-3 py-1.5"
          >
            {f}
          </span>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full max-w-xs flex items-center justify-center gap-3 rounded-2xl py-4 font-bold text-base text-black active:scale-[0.98] transition-transform"
        style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}
      >
        <Zap className="h-5 w-5" strokeWidth={2.5} />
        Get Started
        <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Step 1 — Base44 Login ────────────────────────────────────────────────────

function Base44Step({
  onNext,
  onSkip,
}: {
  onNext: (token: string, email: string) => void;
  onSkip: () => void;
}) {
  const [tab, setTab] = useState<"login" | "token">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rawToken, setRawToken] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        if (!email.trim()) { setError("Enter your Base44 email"); setLoading(false); return; }
        if (!password) { setError("Enter your password"); setLoading(false); return; }
        const res = await base44Login({ data: { email: email.trim(), password } });
        setDone(true);
        setTimeout(() => onNext(res.token, res.email), 700);
      } else {
        if (!rawToken.trim()) { setError("Paste your auth token"); setLoading(false); return; }
        const info = await validateBase44Token({ data: { token: rawToken.trim() } });
        setDone(true);
        setTimeout(() => onNext(rawToken.trim(), info.email), 700);
      }
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Step header */}
      <div className="flex items-center gap-4 mb-7">
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
          style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white">
            <ellipse cx="12" cy="12" rx="10" ry="3" />
            <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(120 12 12)" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">Connect Base44</h2>
          <p className="text-[13px] text-white/40 mt-0.5">Sign in to access your apps</p>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-5">
        <Shield className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
        <p className="text-[12px] text-white/50 leading-snug">
          Your password is sent directly to Base44 — never stored here. Only the returned session token is saved.
        </p>
      </div>

      {done ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="h-16 w-16 rounded-full bg-[#dcfce7]/20 flex items-center justify-center">
            <CheckCircle2 className="h-9 w-9 text-[#22c55e]" strokeWidth={2} />
          </div>
          <p className="text-base font-bold text-white">Connected to Base44!</p>
        </div>
      ) : (
        <>
          {/* Tab switcher */}
          <div className="flex bg-white/8 rounded-2xl p-1 mb-4" style={{ background: "rgba(255,255,255,0.08)" }}>
            {(["login", "token"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  tab === t ? "bg-white text-black shadow" : "text-white/40 hover:text-white/70"
                }`}
              >
                {t === "login" ? "Email & Password" : "Auth Token"}
              </button>
            ))}
          </div>

          {tab === "login" && (
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className="w-full rounded-2xl bg-white/8 border border-white/10 pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#f97316] transition-colors"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className="w-full rounded-2xl bg-white/8 border border-white/10 pl-10 pr-11 py-3.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#f97316] transition-colors"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
                <button
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {tab === "token" && (
            <div className="space-y-2">
              <p className="text-[11px] text-white/35 leading-relaxed">
                Get your token from{" "}
                <a href="https://app.base44.com/settings" target="_blank" rel="noreferrer"
                  className="text-[#f97316] font-semibold underline">
                  app.base44.com/settings
                </a>{" "}
                → API Keys.
              </p>
              <div className="relative">
                <input
                  type={showRaw ? "text" : "password"}
                  placeholder="Paste token here…"
                  value={rawToken}
                  onChange={(e) => setRawToken(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className="w-full rounded-2xl border border-white/10 px-4 pr-11 py-3.5 text-sm font-mono text-white placeholder:text-white/25 outline-none focus:border-[#f97316] transition-colors"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
                <button
                  onClick={() => setShowRaw(!showRaw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showRaw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl p-3 mt-3">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-300 font-medium">{error}</p>
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full mt-4 rounded-2xl py-4 font-bold text-white text-[15px] flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-all"
            style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                <ellipse cx="12" cy="12" rx="10" ry="3" />
                <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(60 12 12)" />
                <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(120 12 12)" />
              </svg>
            )}
            {loading ? "Connecting…" : "Connect Base44"}
          </button>

          <button
            onClick={onSkip}
            className="w-full mt-3 py-3 text-[13px] text-white/30 font-medium hover:text-white/50 transition-colors"
          >
            Skip for now
          </button>
        </>
      )}
    </div>
  );
}

// ─── Step 2 — GitHub ─────────────────────────────────────────────────────────

function GitHubStep({
  onNext,
  onSkip,
}: {
  onNext: (token: string, username: string) => void;
  onSkip: () => void;
}) {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openGitHub = () => {
    window.open(GITHUB_TOKEN_URL, "_blank", "noopener,noreferrer");
    setOpened(true);
    setTimeout(() => inputRef.current?.focus(), 500);
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(GITHUB_TOKEN_URL).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const connect = async () => {
    if (!token.trim()) { setError("Paste your GitHub token"); return; }
    setError("");
    setLoading(true);
    try {
      const user = await getGitHubUser({ data: { token: token.trim() } });
      setDone(true);
      setTimeout(() => onNext(token.trim(), user.login), 700);
    } catch (e: any) {
      setError(e.message ?? "Invalid token. Make sure it has repo + user scopes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Step header */}
      <div className="flex items-center gap-4 mb-7">
        <div className="h-14 w-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shrink-0 shadow-lg ring-1 ring-white/10">
          <Github className="h-8 w-8 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">Connect GitHub</h2>
          <p className="text-[13px] text-white/40 mt-0.5">Where your code will be pushed</p>
        </div>
      </div>

      {done ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="h-16 w-16 rounded-full bg-[#dcfce7]/20 flex items-center justify-center">
            <CheckCircle2 className="h-9 w-9 text-[#22c55e]" strokeWidth={2} />
          </div>
          <p className="text-base font-bold text-white">GitHub connected!</p>
        </div>
      ) : (
        <>
          {/* Step-by-step guide */}
          <div className="space-y-3 mb-5">
            {/* Step 1: Open GitHub */}
            <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-start gap-3">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5"
                  style={{ background: opened ? "#22c55e" : "rgba(255,255,255,0.15)", color: "white" }}
                >
                  {opened ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : "1"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white mb-2">
                    Open GitHub token creator
                  </p>
                  <p className="text-[12px] text-white/40 mb-3 leading-snug">
                    We'll open GitHub with <strong className="text-white/60">repo</strong> &amp; <strong className="text-white/60">user</strong> scopes pre-selected. Just scroll down and click <em className="text-white/60">Generate token</em>.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={openGitHub}
                      className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold text-black active:scale-95 transition-transform"
                      style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Open GitHub
                    </button>
                    <button
                      onClick={copyUrl}
                      className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-white/15 text-white/50 hover:text-white/80 transition-colors"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-[#22c55e]" strokeWidth={3} /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied!" : "Copy link"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Paste token */}
            <div
              className="rounded-2xl border p-4 transition-all"
              style={{
                background: opened ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                borderColor: opened ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5"
                  style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
                >
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold mb-2 ${opened ? "text-white" : "text-white/40"}`}>
                    Paste your token here
                  </p>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type={showToken ? "text" : "password"}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && connect()}
                      disabled={!opened}
                      className="w-full rounded-xl border border-white/10 px-3.5 pr-10 py-3 text-sm font-mono text-white placeholder:text-white/20 outline-none focus:border-[#dce99a] transition-colors disabled:opacity-30"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                    />
                    <button
                      onClick={() => setShowToken(!showToken)}
                      disabled={!opened}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 disabled:opacity-30"
                    >
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl p-3 mb-4">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-300 font-medium">{error}</p>
            </div>
          )}

          <button
            onClick={connect}
            disabled={loading || !token.trim()}
            className="w-full rounded-2xl py-4 font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all"
            style={{ background: "linear-gradient(135deg,#1a1a1a,#2d2d2d)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Github className="h-5 w-5" strokeWidth={1.5} />}
            {loading ? "Verifying…" : "Connect GitHub"}
          </button>

          <button
            onClick={onSkip}
            className="w-full mt-3 py-3 text-[13px] text-white/30 font-medium hover:text-white/50 transition-colors"
          >
            Skip for now
          </button>
        </>
      )}
    </div>
  );
}

// ─── Step 3 — Done ────────────────────────────────────────────────────────────

function DoneStep({
  base44Email,
  githubUsername,
  onFinish,
}: {
  base44Email: string;
  githubUsername: string;
  onFinish: () => void;
}) {
  const connected = [
    base44Email && { icon: "🟠", label: `Base44: ${base44Email}` },
    githubUsername && { icon: "⚫", label: `GitHub: @${githubUsername}` },
  ].filter(Boolean) as { icon: string; label: string }[];

  return (
    <div className="flex flex-col items-center text-center">
      {/* Success animation */}
      <div
        className="h-24 w-24 rounded-full flex items-center justify-center mb-6 shadow-2xl"
        style={{ background: "linear-gradient(135deg,#22c55e22,#22c55e44)", border: "2px solid #22c55e66" }}
      >
        <CheckCircle2 className="h-12 w-12 text-[#22c55e]" strokeWidth={1.5} />
      </div>

      <h2 className="text-[32px] font-extrabold text-white mb-3 tracking-tight">
        You're all set!
      </h2>
      <p className="text-[14px] text-white/50 leading-relaxed mb-8 max-w-xs">
        Push44 is ready. Select a Base44 app, pick a repo, and push your code in one tap.
      </p>

      {/* Connected accounts */}
      {connected.length > 0 && (
        <div className="w-full max-w-xs space-y-2 mb-8">
          {connected.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <span>{c.icon}</span>
              <span className="text-sm text-white/70 font-medium">{c.label}</span>
              <Check className="ml-auto h-4 w-4 text-[#22c55e]" strokeWidth={3} />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onFinish}
        className="w-full max-w-xs flex items-center justify-center gap-3 rounded-2xl py-4 font-bold text-base text-black active:scale-[0.98] transition-transform"
        style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}
      >
        <Zap className="h-5 w-5" strokeWidth={2.5} />
        Go to Dashboard
      </button>
    </div>
  );
}

// ─── Main Onboarding Page ─────────────────────────────────────────────────────

function OnboardingPage() {
  const { creds, updateCreds, isLoaded } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [base44Email, setBase44Email] = useState(creds.base44Email ?? "");
  const [githubUsername, setGithubUsername] = useState(creds.githubUsername ?? "");

  // If already fully connected, skip straight to dashboard
  useEffect(() => {
    if (isLoaded && creds.base44Token && creds.githubToken) {
      markOnboardingDone();
      navigate({ to: "/" });
    }
  }, [isLoaded]);

  const STEPS = ["welcome", "base44", "github", "done"] as const;
  const totalDots = STEPS.length - 1; // don't count done step

  const handleBase44Success = (token: string, email: string) => {
    updateCreds({ base44Token: token, base44Email: email });
    setBase44Email(email);
    setTimeout(() => setStep(2), 400);
  };

  const handleGitHubSuccess = (token: string, username: string) => {
    updateCreds({ githubToken: token, githubUsername: username, defaultOwner: username });
    setGithubUsername(username);
    setTimeout(() => setStep(3), 400);
  };

  const handleFinish = () => {
    markOnboardingDone();
    navigate({ to: "/" });
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-5 py-10"
      style={{ background: "linear-gradient(145deg,#0d0d1a 0%,#13132b 50%,#0a1628 100%)" }}
    >
      {/* Stars bg — deterministic positions to avoid SSR hydration mismatch */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[
          [12,7,1.5,0.3],[34,23,1,0.2],[56,41,2,0.35],[78,15,1.5,0.25],[91,62,1,0.15],
          [5,80,2,0.3],[23,55,1,0.2],[45,92,1.5,0.4],[67,34,1,0.2],[89,77,2,0.3],
          [11,48,1,0.15],[33,67,1.5,0.25],[55,11,1,0.3],[77,88,2,0.2],[99,30,1,0.35],
          [8,39,1.5,0.2],[28,73,1,0.3],[48,57,2,0.15],[68,19,1,0.25],[88,44,1.5,0.3],
          [17,84,1,0.2],[37,6,2,0.35],[57,70,1,0.2],[76,95,1.5,0.25],[97,52,1,0.15],
          [3,26,2,0.3],[43,87,1,0.2],[63,13,1.5,0.35],[83,60,1,0.25],[22,98,2,0.2],
        ].map(([left, top, size, opacity], i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ width: size, height: size, top: `${top}%`, left: `${left}%`, opacity }}
          />
        ))}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle,#8b5cf6,transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full opacity-8 blur-3xl"
          style={{ background: "radial-gradient(circle,#f97316,transparent)" }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Progress dots (hide on welcome + done) */}
        {step > 0 && step < 3 && (
          <div className="flex items-center justify-between mb-8">
            <StepDots total={totalDots} current={step - 1} />
            <span className="text-[12px] text-white/30 font-medium">
              Step {step} of {totalDots}
            </span>
          </div>
        )}

        {/* Step content */}
        <div key={step} style={{ animation: "fadeSlideUp 0.35s ease both" }}>
          {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
          {step === 1 && (
            <Base44Step
              onNext={handleBase44Success}
              onSkip={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <GitHubStep
              onNext={handleGitHubSuccess}
              onSkip={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <DoneStep
              base44Email={base44Email}
              githubUsername={githubUsername}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
