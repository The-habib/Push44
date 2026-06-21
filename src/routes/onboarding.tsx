import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Shield,
  Zap,
  Copy,
  CheckCircle2,
  User,
  Sparkles,
} from "lucide-react";
import { Base44Logo, GitHubLogo } from "@/components/BrandLogos";
import { useApp } from "@/contexts/AppContext";
import { base44Login, validateBase44Token } from "@/lib/base44-api";
import { getGitHubUser } from "@/lib/github-api";
import { markOnboardingDone } from "@/lib/storage";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

const GITHUB_TOKEN_URL =
  "https://github.com/settings/tokens/new?scopes=repo%2Cuser&description=Push44";

// ─── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all duration-400"
          style={{
            width: i === current ? 28 : 6,
            background: i < current ? "#1a1a1a" : i === current ? "#dce99a" : "#e0ddd7",
          }}
        />
      ))}
    </div>
  );
}

// ─── Shared card wrapper ───────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full bg-white rounded-3xl shadow-xl shadow-black/8 border border-black/5 p-7"
    >
      {children}
    </div>
  );
}

// ─── Light input ──────────────────────────────────────────────────────────────

function Input({
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyDown,
  disabled,
  rightSlot,
  mono,
  center,
  autoFocus,
}: {
  icon?: React.ReactNode;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  rightSlot?: React.ReactNode;
  mono?: boolean;
  center?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/25 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={`w-full rounded-2xl border bg-[#f8f7f4] py-3.5 text-sm text-black placeholder:text-black/30 outline-none transition-all disabled:opacity-40
          ${icon ? "pl-10" : "pl-4"}
          ${rightSlot ? "pr-11" : "pr-4"}
          ${mono ? "font-mono" : "font-medium"}
          ${center ? "text-center" : ""}
          focus:bg-white focus:border-black/20 focus:ring-2 focus:ring-[#dce99a]/60
          border-black/10`}
      />
      {rightSlot && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
  );
}

// ─── Primary button ───────────────────────────────────────────────────────────

function PrimaryButton({
  onClick,
  disabled,
  loading,
  children,
  variant = "lime",
}: {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: "lime" | "dark" | "orange";
}) {
  const bg =
    variant === "lime"
      ? "linear-gradient(135deg,#dce99a,#c5e352)"
      : variant === "orange"
      ? "linear-gradient(135deg,#fb923c,#f97316)"
      : "linear-gradient(135deg,#1a1a1a,#333)";
  const color = variant === "lime" ? "#111" : "#fff";
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full rounded-2xl py-4 font-bold text-[15px] flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all disabled:opacity-40"
      style={{ background: bg, color }}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

// ─── Step 0 — Welcome ─────────────────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Logo mark */}
      <div className="relative mb-7">
        <div className="h-24 w-24 rounded-3xl bg-[#1a1a1a] flex items-center justify-center shadow-2xl shadow-black/20">
          <span className="text-[#a78bfa] font-extrabold text-5xl italic leading-none">B</span>
        </div>
        {/* Lime dot accent */}
        <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#dce99a] border-2 border-white flex items-center justify-center">
          <Zap className="h-3.5 w-3.5 text-black" strokeWidth={3} />
        </div>
      </div>

      <h1 className="text-[34px] font-extrabold text-black leading-tight tracking-tight mb-3">
        Welcome to{" "}
        <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#8b5cf6,#6d28d9)" }}>
          Push44
        </span>
      </h1>
      <p className="text-[15px] text-black/50 leading-relaxed mb-8 max-w-[260px]">
        Push your Base44 apps to GitHub in one tap. Set up takes under 2 minutes.
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {[
          { label: "Base44 → GitHub", color: "#f97316" },
          { label: "One-tap push", color: "#8b5cf6" },
          { label: "Secure & private", color: "#22c55e" },
        ].map(({ label, color }) => (
          <span
            key={label}
            className="text-[11px] font-bold rounded-full px-3 py-1.5 border"
            style={{ color, borderColor: `${color}30`, background: `${color}10` }}
          >
            {label}
          </span>
        ))}
      </div>

      <PrimaryButton onClick={onNext} variant="lime">
        <Zap className="h-4 w-4" strokeWidth={3} />
        Get Started
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </PrimaryButton>
    </div>
  );
}

// ─── Step 1 — Your Name ───────────────────────────────────────────────────────

function NameStep({ onNext }: { onNext: (name: string) => void }) {
  const [name, setName] = useState("");

  const initials = name.trim()
    ? name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "";

  return (
    <div className="w-full">
      <div className="flex flex-col items-center mb-7">
        {/* Live avatar preview */}
        <div
          className="h-20 w-20 rounded-full flex items-center justify-center mb-5 transition-all duration-300 shadow-lg"
          style={{
            background: initials
              ? "linear-gradient(135deg,#8b5cf6,#6d28d9)"
              : "#f0eee9",
            boxShadow: initials
              ? "0 8px 32px rgba(139,92,246,0.35)"
              : "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {initials ? (
            <span className="text-xl font-extrabold text-white tracking-tight">{initials}</span>
          ) : (
            <User className="h-8 w-8 text-black/20" strokeWidth={1.5} />
          )}
        </div>
        <h2 className="text-[22px] font-extrabold text-black tracking-tight">What's your name?</h2>
        <p className="text-[13px] text-black/40 mt-1.5 text-center">
          This is how you'll appear in Push44.
        </p>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="e.g. Alex Johnson"
          value={name}
          onChange={setName}
          onKeyDown={(e) => e.key === "Enter" && name.trim() && onNext(name.trim())}
          center
          autoFocus
        />

        <PrimaryButton
          onClick={() => onNext(name.trim())}
          disabled={!name.trim()}
          variant="dark"
        >
          Continue
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </PrimaryButton>
      </div>

      <button
        onClick={() => onNext("")}
        className="w-full mt-3 py-2.5 text-[12px] text-black/30 font-semibold hover:text-black/50 transition-colors"
      >
        Skip for now
      </button>
    </div>
  );
}

// ─── Step 2 — Base44 ──────────────────────────────────────────────────────────

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

  const Base44Icon = () => <Base44Logo size={28} white />;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
          style={{ background: "linear-gradient(135deg,#fb923c,#f97316)" }}>
          <Base44Icon />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-black">Connect Base44</h2>
          <p className="text-[12px] text-black/40 mt-0.5">Sign in to access your apps</p>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-3.5 mb-5">
        <Shield className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#166534] leading-snug font-medium">
          Your password goes directly to Base44 — never stored here. Only the session token is saved locally.
        </p>
      </div>

      {done ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="h-16 w-16 rounded-full bg-[#f0fdf4] flex items-center justify-center">
            <CheckCircle2 className="h-9 w-9 text-[#22c55e]" strokeWidth={2} />
          </div>
          <p className="text-base font-bold text-black">Connected to Base44!</p>
        </div>
      ) : (
        <>
          {/* Tab switcher */}
          <div className="flex bg-[#f0eee9] rounded-2xl p-1 mb-4">
            {(["login", "token"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  tab === t
                    ? "bg-white text-black shadow-sm shadow-black/10"
                    : "text-black/40 hover:text-black/60"
                }`}
              >
                {t === "login" ? "Email & Password" : "Auth Token"}
              </button>
            ))}
          </div>

          {tab === "login" && (
            <div className="space-y-2.5">
              <Input
                icon={<Mail className="h-4 w-4" />}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={setEmail}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
              <Input
                icon={<Lock className="h-4 w-4" />}
                type={showPw ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={setPassword}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                rightSlot={
                  <button onClick={() => setShowPw(!showPw)} className="text-black/30 hover:text-black/60 transition-colors">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </div>
          )}

          {tab === "token" && (
            <div className="space-y-2">
              <p className="text-[11px] text-black/40 leading-relaxed">
                Get your token from{" "}
                <a href="https://app.base44.com/settings" target="_blank" rel="noreferrer"
                  className="text-[#f97316] font-semibold underline">
                  app.base44.com/settings
                </a>{" "}
                → API Keys.
              </p>
              <Input
                type={showRaw ? "text" : "password"}
                placeholder="Paste token here…"
                value={rawToken}
                onChange={setRawToken}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                mono
                rightSlot={
                  <button onClick={() => setShowRaw(!showRaw)} className="text-black/30 hover:text-black/60 transition-colors">
                    {showRaw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-2xl p-3 mt-3">
              <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#991b1b] font-medium">{error}</p>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <PrimaryButton onClick={submit} loading={loading} variant="orange">
              {!loading && <Base44Icon />}
              {loading ? "Connecting…" : "Connect Base44"}
            </PrimaryButton>
            <button
              onClick={onSkip}
              className="w-full py-2.5 text-[12px] text-black/30 font-semibold hover:text-black/50 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Step 3 — GitHub ──────────────────────────────────────────────────────────

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
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shrink-0 shadow-md">
          <GitHubLogo className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-black">Connect GitHub</h2>
          <p className="text-[12px] text-black/40 mt-0.5">Where your code will be pushed</p>
        </div>
      </div>

      {done ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="h-16 w-16 rounded-full bg-[#f0fdf4] flex items-center justify-center">
            <CheckCircle2 className="h-9 w-9 text-[#22c55e]" strokeWidth={2} />
          </div>
          <p className="text-base font-bold text-black">GitHub connected!</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-5">
            {/* Step 1 */}
            <div
              className="rounded-2xl border p-4 transition-all"
              style={{
                background: opened ? "#f0fdf4" : "#fafaf8",
                borderColor: opened ? "#86efac" : "#ede9e0",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5 transition-all"
                  style={{
                    background: opened ? "#22c55e" : "#1a1a1a",
                    color: "white",
                  }}
                >
                  {opened ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : "1"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-black mb-1.5">Open GitHub token creator</p>
                  <p className="text-[11px] text-black/45 mb-3 leading-snug">
                    Opens GitHub with <strong className="text-black/60">repo</strong> &amp; <strong className="text-black/60">user</strong> scopes pre-filled. Scroll down and click <em className="text-black/60">Generate token</em>.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={openGitHub}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-black active:scale-95 transition-transform"
                      style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Open GitHub
                    </button>
                    <button
                      onClick={copyUrl}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border border-black/10 text-black/45 hover:text-black/70 transition-colors bg-white"
                    >
                      {copied
                        ? <Check className="h-3.5 w-3.5 text-[#22c55e]" strokeWidth={3} />
                        : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied!" : "Copy link"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className="rounded-2xl border p-4 transition-all"
              style={{
                background: opened ? "#fafaf8" : "#f5f4f0",
                borderColor: opened ? "#ede9e0" : "#eae7de",
                opacity: opened ? 1 : 0.6,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5"
                  style={{ background: "#1a1a1a", color: "white" }}
                >
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold mb-2 ${opened ? "text-black" : "text-black/40"}`}>
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
                      className="w-full rounded-xl border border-black/10 bg-white px-3.5 pr-10 py-3 text-sm font-mono text-black placeholder:text-black/25 outline-none focus:border-black/20 focus:ring-2 focus:ring-[#dce99a]/60 transition-all disabled:opacity-40"
                    />
                    <button
                      onClick={() => setShowToken(!showToken)}
                      disabled={!opened}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 disabled:opacity-30 transition-colors"
                    >
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-2xl p-3 mb-4">
              <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#991b1b] font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <PrimaryButton
              onClick={connect}
              disabled={!token.trim()}
              loading={loading}
              variant="dark"
            >
              {!loading && <GitHubLogo className="h-4 w-4" />}
              {loading ? "Verifying…" : "Connect GitHub"}
            </PrimaryButton>
            <button
              onClick={onSkip}
              className="w-full py-2.5 text-[12px] text-black/30 font-semibold hover:text-black/50 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Step 4 — Done ────────────────────────────────────────────────────────────

function DoneStep({
  displayName,
  base44Email,
  githubUsername,
  onFinish,
}: {
  displayName: string;
  base44Email: string;
  githubUsername: string;
  onFinish: () => void;
}) {
  const firstName = displayName.trim().split(/\s+/)[0] || "";
  const initials = displayName.trim()
    ? displayName.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "✓";

  const connected = [
    base44Email && { label: `Base44`, sub: base44Email, color: "#f97316" },
    githubUsername && { label: "GitHub", sub: `@${githubUsername}`, color: "#1a1a1a" },
  ].filter(Boolean) as { label: string; sub: string; color: string }[];

  return (
    <div className="flex flex-col items-center text-center">
      {/* Avatar / celebration */}
      <div className="relative mb-6">
        <div
          className="h-24 w-24 rounded-full flex items-center justify-center shadow-xl"
          style={{
            background: displayName.trim()
              ? "linear-gradient(135deg,#8b5cf6,#6d28d9)"
              : "linear-gradient(135deg,#22c55e,#16a34a)",
            boxShadow: displayName.trim()
              ? "0 12px 40px rgba(139,92,246,0.35)"
              : "0 12px 40px rgba(34,197,94,0.35)",
          }}
        >
          {displayName.trim() ? (
            <span className="text-2xl font-extrabold text-white tracking-tight">{initials}</span>
          ) : (
            <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={1.5} />
          )}
        </div>
        {/* Sparkle */}
        <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-[#dce99a] border-2 border-white flex items-center justify-center shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-black" strokeWidth={2.5} />
        </div>
      </div>

      <h2 className="text-[28px] font-extrabold text-black mb-2 tracking-tight">
        {firstName ? `You're ready, ${firstName}!` : "You're all set!"}
      </h2>
      <p className="text-[13px] text-black/45 leading-relaxed mb-7 max-w-[240px]">
        Select a Base44 app, pick a repo, and push your code in one tap.
      </p>

      {/* Connected accounts */}
      {connected.length > 0 && (
        <div className="w-full space-y-2 mb-7">
          {connected.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 border border-black/6 bg-[#fafaf8]"
            >
              <div
                className="h-7 w-7 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: c.color }}
              >
                {c.label === "Base44" ? (
                  <Base44Logo size={16} white />
                ) : (
                  <GitHubLogo className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-xs font-bold text-black">{c.label}</div>
                <div className="text-[11px] text-black/40 truncate">{c.sub}</div>
              </div>
              <Check className="h-4 w-4 text-[#22c55e] shrink-0" strokeWidth={3} />
            </div>
          ))}
        </div>
      )}

      <PrimaryButton onClick={onFinish} variant="lime">
        <Zap className="h-4 w-4" strokeWidth={3} />
        Go to Dashboard
      </PrimaryButton>
    </div>
  );
}

// ─── Main Onboarding Page ─────────────────────────────────────────────────────

function OnboardingPage() {
  const { creds, updateCreds, isLoaded } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(creds.displayName ?? "");
  const [base44Email, setBase44Email] = useState(creds.base44Email ?? "");
  const [githubUsername, setGithubUsername] = useState(creds.githubUsername ?? "");

  // Steps: 0=welcome, 1=name, 2=base44, 3=github, 4=done
  const ACTIVE_STEPS = 3;

  useEffect(() => {
    if (isLoaded && creds.base44Token && creds.githubToken) {
      markOnboardingDone();
      navigate({ to: "/" });
    }
  }, [isLoaded]);

  const handleNameNext = (name: string) => {
    if (name) updateCreds({ displayName: name });
    setDisplayName(name);
    setTimeout(() => setStep(2), 80);
  };

  const handleBase44Success = (token: string, email: string) => {
    updateCreds({ base44Token: token, base44Email: email });
    setBase44Email(email);
    setTimeout(() => setStep(3), 400);
  };

  const handleGitHubSuccess = (token: string, username: string) => {
    updateCreds({ githubToken: token, githubUsername: username, defaultOwner: username });
    setGithubUsername(username);
    setTimeout(() => setStep(4), 400);
  };

  const handleFinish = () => {
    markOnboardingDone();
    navigate({ to: "/" });
  };

  const progressStep = step > 0 && step < 4 ? step : null;

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-5 py-12"
      style={{ background: "#f3f2ee" }}
    >
      {/* Subtle background texture dots */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[
          [8,12],[24,38],[45,8],[62,55],[80,20],[93,70],
          [15,75],[33,90],[52,62],[71,85],[88,42],[4,50],
        ].map(([left, top], i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-black/8"
            style={{ left: `${left}%`, top: `${top}%` }}
          />
        ))}
        {/* Soft lime glow top-right */}
        <div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle,#dce99a,transparent)" }}
        />
        {/* Soft purple glow bottom-left */}
        <div
          className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(circle,#a78bfa,transparent)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Progress bar (steps 1–3) */}
        {progressStep !== null && (
          <div className="flex items-center justify-between mb-6 px-1">
            <ProgressBar total={ACTIVE_STEPS} current={progressStep - 1} />
            <span className="text-[11px] text-black/35 font-semibold">
              {progressStep} of {ACTIVE_STEPS}
            </span>
          </div>
        )}

        {/* Card */}
        <div key={step} style={{ animation: "fadeSlideUp 0.3s cubic-bezier(0.22,1,0.36,1) both" }}>
          {step === 0 ? (
            <WelcomeStep onNext={() => setStep(1)} />
          ) : (
            <Card>
              {step === 1 && <NameStep onNext={handleNameNext} />}
              {step === 2 && <Base44Step onNext={handleBase44Success} onSkip={() => setStep(3)} />}
              {step === 3 && <GitHubStep onNext={handleGitHubSuccess} onSkip={() => setStep(4)} />}
              {step === 4 && (
                <DoneStep
                  displayName={displayName}
                  base44Email={base44Email}
                  githubUsername={githubUsername}
                  onFinish={handleFinish}
                />
              )}
            </Card>
          )}
        </div>

        {/* Push44 wordmark at bottom */}
        {step === 0 && (
          <p className="text-center mt-8 text-[11px] text-black/25 font-semibold tracking-wide">
            PUSH44 · BASE44 → GITHUB
          </p>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
