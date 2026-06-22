import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { MotionButton, ScaleIn, FadeUp } from "@/components/PageTransition";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Mail, Lock, Eye, EyeOff, Check, Loader2, AlertCircle, ExternalLink,
  Shield, Zap, Copy, CheckCircle2, User, Sparkles,
} from "lucide-react";
import { Base44Logo, GitHubLogo } from "@/components/BrandLogos";
import appLogo from "@/assets/logo.png";
import { useApp } from "@/contexts/AppContext";
import { base44Login, validateBase44Token } from "@/lib/base44-api";
import { getGitHubUser } from "@/lib/github-api";
import { markOnboardingDone } from "@/lib/storage";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

const GITHUB_TOKEN_URL = "https://github.com/settings/tokens/new?scopes=repo%2Cuser&description=Push44";

function ProgressBar({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className="h-1.5 rounded-full"
          animate={{
            width: i === current ? 28 : 6,
            background: i < current ? "#1a1a1a" : i === current ? "#dce99a" : "#e0ddd7",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        />
      ))}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="w-full bg-white rounded-3xl shadow-xl shadow-black/8 border border-black/5 p-7"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
    >
      {children}
    </motion.div>
  );
}

function Input({ icon, type = "text", placeholder, value, onChange, onKeyDown, disabled, rightSlot, mono, center, autoFocus }: {
  icon?: React.ReactNode; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; onKeyDown?: (e: React.KeyboardEvent) => void;
  disabled?: boolean; rightSlot?: React.ReactNode; mono?: boolean; center?: boolean; autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/25 pointer-events-none">{icon}</div>}
      <motion.input
        type={type} placeholder={placeholder} value={value} autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown} disabled={disabled}
        className={`w-full rounded-2xl border bg-[#f8f7f4] py-3.5 text-sm text-black placeholder:text-black/30 outline-none transition-all disabled:opacity-40 ${icon ? "pl-10" : "pl-4"} ${rightSlot ? "pr-11" : "pr-4"} ${mono ? "font-mono" : "font-medium"} ${center ? "text-center" : ""} focus:bg-white focus:border-black/20 focus:ring-2 focus:ring-[#dce99a]/60 border-black/10`}
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      />
      {rightSlot && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</div>}
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <ScaleIn delay={0.1}>
        <div className="relative mb-7">
          <motion.img
            src={appLogo} alt="Push44"
            className="h-24 w-24 rounded-3xl object-cover shadow-2xl shadow-black/20"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#dce99a] border-2 border-white flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Zap className="h-3.5 w-3.5 text-black" strokeWidth={3} />
          </motion.div>
        </div>
      </ScaleIn>

      <FadeUp delay={0.2}>
        <h1 className="text-[34px] font-extrabold text-black leading-tight tracking-tight mb-3">
          Welcome to{" "}
          <motion.span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(90deg,#8b5cf6,#6d28d9)" }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            Push44
          </motion.span>
        </h1>
      </FadeUp>

      <FadeUp delay={0.28}>
        <p className="text-[15px] text-black/50 leading-relaxed mb-8 max-w-[260px]">
          Push your Base44 apps to GitHub in one tap. Set up takes under 2 minutes.
        </p>
      </FadeUp>

      <FadeUp delay={0.34}>
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { label: "Base44 → GitHub", color: "#f97316" },
            { label: "One-tap push", color: "#8b5cf6" },
            { label: "Secure & private", color: "#22c55e" },
          ].map(({ label, color }, i) => (
            <motion.span
              key={label}
              className="text-[11px] font-bold rounded-full px-3 py-1.5 border"
              style={{ color, borderColor: `${color}30`, background: `${color}10` }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08, type: "spring", stiffness: 400, damping: 20 }}
              whileHover={{ scale: 1.08, y: -2 }}
            >
              {label}
            </motion.span>
          ))}
        </div>
      </FadeUp>

      <FadeUp delay={0.5}>
        <MotionButton onClick={onNext} className="w-full rounded-2xl py-4 font-bold text-[15px] flex items-center justify-center gap-2.5 text-black"
          style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}>
          <Zap className="h-4 w-4" strokeWidth={3} />Get Started<ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </MotionButton>
      </FadeUp>
    </div>
  );
}

function NameStep({ onNext }: { onNext: (name: string) => void }) {
  const [name, setName] = useState("");
  const initials = name.trim() ? name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "";

  return (
    <div className="w-full">
      <div className="flex flex-col items-center mb-7">
        <motion.div
          className="h-20 w-20 rounded-full flex items-center justify-center mb-5 transition-all duration-300 shadow-lg"
          animate={{
            background: initials ? "linear-gradient(135deg,#8b5cf6,#6d28d9)" : "#f0eee9",
            boxShadow: initials ? "0 8px 32px rgba(139,92,246,0.35)" : "0 2px 8px rgba(0,0,0,0.06)",
          }}
          whileHover={{ scale: 1.05, rotate: 3 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <AnimatePresence mode="wait">
            {initials ? (
              <motion.span key="initials" className="text-xl font-extrabold text-white tracking-tight"
                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                {initials}
              </motion.span>
            ) : (
              <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <User className="h-8 w-8 text-black/20" strokeWidth={1.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <h2 className="text-[22px] font-extrabold text-black tracking-tight">What's your name?</h2>
        <p className="text-[13px] text-black/40 mt-1.5 text-center">This is how you'll appear in Push44.</p>
      </div>
      <div className="space-y-3">
        <Input placeholder="e.g. Alex Johnson" value={name} onChange={setName}
          onKeyDown={(e) => e.key === "Enter" && name.trim() && onNext(name.trim())} center autoFocus />
        <MotionButton onClick={() => onNext(name.trim())} disabled={!name.trim()}
          className="w-full rounded-2xl py-4 font-bold text-[15px] flex items-center justify-center gap-2.5 text-white disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#1a1a1a,#333)" }}>
          Continue<ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </MotionButton>
      </div>
      <button onClick={() => onNext("")} className="w-full mt-3 py-2.5 text-[12px] text-black/30 font-semibold">Skip for now</button>
    </div>
  );
}

function Base44Step({ onNext, onSkip }: { onNext: (token: string, email: string) => void; onSkip: () => void }) {
  const [tab, setTab] = useState<"login" | "token">("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [showPw, setShowPw] = useState(false);
  const [rawToken, setRawToken] = useState(""); const [showRaw, setShowRaw] = useState(false);
  const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [done, setDone] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (tab === "login") {
        if (!email.trim()) { setError("Enter your Base44 email"); setLoading(false); return; }
        if (!password) { setError("Enter your password"); setLoading(false); return; }
        const res = await base44Login({ data: { email: email.trim(), password } });
        setDone(true); setTimeout(() => onNext(res.token, res.email), 700);
      } else {
        if (!rawToken.trim()) { setError("Paste your auth token"); setLoading(false); return; }
        const info = await validateBase44Token({ data: { token: rawToken.trim() } });
        setDone(true); setTimeout(() => onNext(rawToken.trim(), info.email), 700);
      }
    } catch (e: any) { setError(e.message ?? "Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <motion.div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
          style={{ background: "linear-gradient(135deg,#fb923c,#f97316)" }}
          whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
          <Base44Logo size={28} white />
        </motion.div>
        <div>
          <h2 className="text-lg font-extrabold text-black">Connect Base44</h2>
          <p className="text-[12px] text-black/40 mt-0.5">Sign in to access your apps</p>
        </div>
      </div>
      <div className="flex items-start gap-2.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-3.5 mb-5">
        <Shield className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#166534] leading-snug font-medium">Your password goes directly to Base44 — never stored here.</p>
      </div>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 py-8">
            <motion.div className="h-16 w-16 rounded-full bg-[#f0fdf4] flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              <CheckCircle2 className="h-9 w-9 text-[#22c55e]" strokeWidth={2} />
            </motion.div>
            <p className="text-base font-bold text-black">Connected to Base44!</p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex bg-[#f0eee9] rounded-2xl p-1 mb-4">
              {(["login", "token"] as const).map((t) => (
                <motion.button key={t} onClick={() => { setTab(t); setError(""); }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative" whileTap={{ scale: 0.97 }}>
                  {tab === t && <motion.div layoutId="onboarding-b44-tab" className="absolute inset-0 rounded-xl bg-white shadow-sm shadow-black/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                  <span className={`relative z-10 ${tab === t ? "text-black" : "text-black/40"}`}>{t === "login" ? "Email & Password" : "Auth Token"}</span>
                </motion.button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              {tab === "login" ? (
                <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-2.5">
                  <Input icon={<Mail className="h-4 w-4" />} type="email" placeholder="your@email.com" value={email} onChange={setEmail} onKeyDown={(e) => e.key === "Enter" && submit()} />
                  <Input icon={<Lock className="h-4 w-4" />} type={showPw ? "text" : "password"} placeholder="Password" value={password} onChange={setPassword} onKeyDown={(e) => e.key === "Enter" && submit()}
                    rightSlot={<button onClick={() => setShowPw(!showPw)} className="text-black/30">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>} />
                </motion.div>
              ) : (
                <motion.div key="token" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-2">
                  <p className="text-[11px] text-black/40">Get your token from <a href="https://app.base44.com/settings" target="_blank" rel="noreferrer" className="text-[#f97316] font-semibold underline">app.base44.com/settings</a> → API Keys.</p>
                  <Input type={showRaw ? "text" : "password"} placeholder="Paste token here…" value={rawToken} onChange={setRawToken} onKeyDown={(e) => e.key === "Enter" && submit()} mono
                    rightSlot={<button onClick={() => setShowRaw(!showRaw)} className="text-black/30">{showRaw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>} />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-2xl p-3 mt-3">
                  <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#991b1b] font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mt-4 space-y-2">
              <MotionButton onClick={submit} disabled={loading}
                className="w-full rounded-2xl py-4 font-bold text-[15px] flex items-center justify-center gap-2.5 text-white disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#fb923c,#f97316)" }}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Base44Logo size={20} white />}
                {loading ? "Connecting…" : "Connect Base44"}
              </MotionButton>
              <button onClick={onSkip} className="w-full py-2.5 text-[12px] text-black/30 font-semibold">Skip for now</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GitHubStep({ onNext, onSkip }: { onNext: (token: string, username: string) => void; onSkip: () => void }) {
  const [token, setToken] = useState(""); const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [done, setDone] = useState(false);
  const [opened, setOpened] = useState(false); const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openGitHub = () => { window.open(GITHUB_TOKEN_URL, "_blank", "noopener,noreferrer"); setOpened(true); setTimeout(() => inputRef.current?.focus(), 500); };
  const copyUrl = async () => { await navigator.clipboard.writeText(GITHUB_TOKEN_URL).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const connect = async () => {
    if (!token.trim()) { setError("Paste your GitHub token"); return; }
    setError(""); setLoading(true);
    try {
      const user = await getGitHubUser({ data: { token: token.trim() } });
      setDone(true); setTimeout(() => onNext(token.trim(), user.login), 700);
    } catch (e: any) { setError(e.message ?? "Invalid token."); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <motion.div className="h-12 w-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shrink-0 shadow-md"
          whileHover={{ scale: 1.1, rotate: -5 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
          <GitHubLogo className="h-6 w-6 text-white" />
        </motion.div>
        <div>
          <h2 className="text-lg font-extrabold text-black">Connect GitHub</h2>
          <p className="text-[12px] text-black/40 mt-0.5">Where your code will be pushed</p>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 py-8">
            <motion.div className="h-16 w-16 rounded-full bg-[#f0fdf4] flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              <CheckCircle2 className="h-9 w-9 text-[#22c55e]" strokeWidth={2} />
            </motion.div>
            <p className="text-base font-bold text-black">GitHub connected!</p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mb-5">
            <motion.div className="rounded-2xl border p-4 transition-all"
              animate={{ background: opened ? "#f0fdf4" : "#fafaf8", borderColor: opened ? "#86efac" : "#ede9e0" }}>
              <div className="flex items-start gap-3">
                <motion.div className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5"
                  animate={{ background: opened ? "#22c55e" : "#1a1a1a" }}>
                  {opened ? <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /> : <span className="text-white">1</span>}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-black mb-1.5">Open GitHub token creator</p>
                  <p className="text-[11px] text-black/45 mb-3 leading-snug">Opens GitHub with <strong className="text-black/60">repo</strong> & <strong className="text-black/60">user</strong> scopes pre-filled.</p>
                  <div className="flex gap-2">
                    <MotionButton onClick={openGitHub} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-black"
                      style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}>
                      <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.5} />Open GitHub
                    </MotionButton>
                    <MotionButton onClick={copyUrl} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border border-black/10 text-black/45 bg-white">
                      <AnimatePresence mode="wait">
                        {copied ? <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="h-3.5 w-3.5 text-[#22c55e]" strokeWidth={3} /></motion.div>
                          : <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }}><Copy className="h-3.5 w-3.5" /></motion.div>}
                      </AnimatePresence>
                      {copied ? "Copied!" : "Copy link"}
                    </MotionButton>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="rounded-2xl border p-4" animate={{ background: opened ? "#fafaf8" : "#f5f4f0", borderColor: "#ede9e0", opacity: opened ? 1 : 0.6 }}>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5">
                  <span className="text-white">2</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold mb-2 ${opened ? "text-black" : "text-black/40"}`}>Paste your token here</p>
                  <div className="relative">
                    <input ref={inputRef} type={showToken ? "text" : "password"} placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={token} onChange={(e) => setToken(e.target.value)} onKeyDown={(e) => e.key === "Enter" && connect()} disabled={!opened}
                      className="w-full rounded-xl border border-black/10 bg-[#f8f7f4] px-3 py-2.5 text-xs font-mono outline-none focus:border-black/20 disabled:opacity-40 pr-8" />
                    <button onClick={() => setShowToken(!showToken)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/30">
                      {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-2xl p-3">
                  <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#991b1b] font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <MotionButton onClick={connect} disabled={loading || !opened || !token.trim()}
              className="w-full rounded-2xl py-4 font-bold text-[15px] flex items-center justify-center gap-2.5 text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#1a1a1a,#333)" }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitHubLogo className="h-4 w-4" />}
              {loading ? "Connecting…" : "Connect GitHub"}
            </MotionButton>
            <button onClick={onSkip} className="w-full py-2.5 text-[12px] text-black/30 font-semibold">Skip for now</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DoneStep() {
  return (
    <div className="flex flex-col items-center text-center">
      <ScaleIn>
        <motion.div className="h-24 w-24 rounded-full bg-[#dcfce7] flex items-center justify-center mb-6 shadow-2xl shadow-green-500/20"
          animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2, ease: "easeOut" }}>
            <Sparkles className="h-12 w-12 text-[#22c55e]" />
          </motion.div>
        </motion.div>
      </ScaleIn>
      <FadeUp delay={0.15}><h2 className="text-[28px] font-extrabold text-black tracking-tight mb-2">You're all set!</h2></FadeUp>
      <FadeUp delay={0.22}><p className="text-[15px] text-black/50 leading-relaxed mb-6 max-w-[240px]">Push44 is ready. Start pushing your Base44 apps to GitHub in one tap.</p></FadeUp>
    </div>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const { updateCreds } = useApp();
  const [step, setStep] = useState(0);
  const STEPS = 4;

  const handleName = (name: string) => { if (name) updateCreds({ displayName: name }); setStep(2); };
  const handleBase44 = (token: string, email: string) => { updateCreds({ base44Token: token, base44Email: email }); setStep(3); };
  const handleGitHub = (token: string, username: string) => { updateCreds({ githubToken: token, githubUsername: username }); setStep(4); };
  const handleFinish = () => { markOnboardingDone(); navigate({ to: "/" }); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden" style={{ background: "linear-gradient(160deg,#f3f2ee 0%,#ede9f8 50%,#f0fdf4 100%)" }}>
      <AnimatedCorner variant="onboarding" />

      {/* Floating background blobs */}
      <motion.div className="fixed top-10 right-10 h-40 w-40 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#8b5cf6,transparent)" }}
        animate={{ scale: [1, 1.3, 1], x: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="fixed bottom-20 left-5 h-32 w-32 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#f97316,transparent)" }}
        animate={{ scale: [1, 1.4, 1], y: [0, -15, 0] }} transition={{ duration: 7, delay: 1, repeat: Infinity, ease: "easeInOut" }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Progress */}
        {step > 0 && step < 4 && (
          <motion.div className="flex items-center justify-between mb-6" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <ProgressBar total={STEPS} current={step - 1} />
            <span className="text-xs text-black/30 font-semibold">{step} / {STEPS - 1}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <WelcomeStep onNext={() => setStep(1)} />
            </motion.div>
          )}
          {step === 1 && <Card key="name"><NameStep onNext={handleName} /></Card>}
          {step === 2 && <Card key="base44"><Base44Step onNext={handleBase44} onSkip={() => setStep(3)} /></Card>}
          {step === 3 && <Card key="github"><GitHubStep onNext={handleGitHub} onSkip={() => setStep(4)} /></Card>}
          {step === 4 && (
            <motion.div key="done" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <DoneStep />
              <FadeUp delay={0.4}>
                <MotionButton onClick={handleFinish}
                  className="w-full rounded-2xl py-4 font-bold text-[15px] flex items-center justify-center gap-2.5 text-black mt-2"
                  style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}>
                  <Zap className="h-4 w-4" strokeWidth={3} />Open Push44<ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </MotionButton>
              </FadeUp>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
