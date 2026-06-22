import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { MotionButton, FadeUp, ScaleIn } from "@/components/PageTransition";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Mail, Lock, Eye, EyeOff, Check, Loader2, AlertCircle,
  Shield, Zap, Copy, ExternalLink, Sparkles, User,
} from "lucide-react";
import { Base44Logo, GitHubLogo } from "@/components/BrandLogos";
import appLogo from "@/assets/logo.png";
import { useApp } from "@/contexts/AppContext";
import { base44Login, validateBase44Token } from "@/lib/base44-api";
import { getGitHubUser } from "@/lib/github-api";
import { markOnboardingDone } from "@/lib/storage";

export const Route = createFileRoute("/onboarding")({ component: OnboardingPage });

const GITHUB_TOKEN_URL = "https://github.com/settings/tokens/new?scopes=repo%2Cuser&description=Push44";
const ease = [0.25, 0.46, 0.45, 0.94] as const;

function Step({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div
      className="w-full bg-white rounded-[28px] shadow-[0_4px_40px_rgba(0,0,0,0.10)] border border-black/[0.05] overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      <div className="px-7 pt-7 pb-5">
        <div className="flex items-center gap-3 mb-6">
          {icon}
          <div>
            <h2 className="text-[17px] font-extrabold text-black">{title}</h2>
            <p className="text-[12px] text-black/40 mt-0.5">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

function Field({ icon, type = "text", placeholder, value, onChange, onEnter, right, mono, autoFocus }: {
  icon?: React.ReactNode; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; onEnter?: () => void; right?: React.ReactNode;
  mono?: boolean; autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/25 pointer-events-none">{icon}</div>}
      <input
        type={type} placeholder={placeholder} value={value} autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        className={`w-full rounded-2xl border border-[#eee] bg-[#f7f6f1] py-3.5 text-[13px] text-black placeholder:text-black/30 outline-none focus:border-[#8b5cf6]/40 focus:bg-white transition-colors ${icon ? "pl-10" : "pl-4"} ${right ? "pr-11" : "pr-4"} ${mono ? "font-mono" : ""}`}
      />
      {right && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
  );
}

function Error({ msg }: { msg: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex items-start gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-xl p-3 mt-3">
      <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
      <p className="text-[12px] text-[#991b1b] font-medium">{msg}</p>
    </motion.div>
  );
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div key={i} className="rounded-full"
          animate={{ width: i === current ? 20 : 6, height: 6, background: i <= current ? "#8b5cf6" : "#ddd" }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }} />
      ))}
    </div>
  );
}

/* ── Steps ───────────────────────────────────────────────────── */

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center px-4">
      <ScaleIn delay={0.05}>
        <div className="relative mb-6">
          <motion.img src={appLogo} alt="Push44" className="h-20 w-20 rounded-[22px] object-cover shadow-xl"
            animate={{ y: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#dce99a] border-2 border-white flex items-center justify-center"
            animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <Zap className="h-3.5 w-3.5 text-black" strokeWidth={3} />
          </motion.div>
        </div>
      </ScaleIn>
      <FadeUp delay={0.12}>
        <h1 className="text-[30px] font-extrabold text-black tracking-tight mb-2">
          Welcome to <span className="text-[#8b5cf6]">Push44</span>
        </h1>
      </FadeUp>
      <FadeUp delay={0.18}>
        <p className="text-[14px] text-black/50 leading-relaxed mb-7 max-w-[240px]">
          Push your Base44 apps to GitHub in one tap. Takes under 2 minutes to set up.
        </p>
      </FadeUp>
      <FadeUp delay={0.24}>
        <MotionButton onClick={onNext}
          className="w-full max-w-[280px] rounded-2xl py-3.5 font-bold text-[14px] flex items-center justify-center gap-2 text-black"
          style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}>
          <Zap className="h-4 w-4" strokeWidth={3} />Get Started<ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </MotionButton>
      </FadeUp>
    </div>
  );
}

function NameStep({ onNext }: { onNext: (n: string) => void }) {
  const [name, setName] = useState("");
  const initials = name.trim() ? name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "";
  return (
    <Step title="What's your name?" subtitle="Personalise your Push44 experience."
      icon={
        <motion.div className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0"
          animate={{ background: initials ? "linear-gradient(135deg,#8b5cf6,#6d28d9)" : "#f0eee9" }}
          transition={{ duration: 0.2 }}>
          <AnimatePresence mode="wait">
            {initials
              ? <motion.span key="i" className="text-[15px] font-extrabold text-white" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>{initials}</motion.span>
              : <motion.div key="u" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><User className="h-5 w-5 text-black/25" /></motion.div>}
          </AnimatePresence>
        </motion.div>
      }>
      <div className="space-y-3">
        <Field placeholder="e.g. Alex Johnson" value={name} onChange={setName} onEnter={() => onNext(name.trim())} autoFocus />
        <MotionButton onClick={() => onNext(name.trim())} disabled={!name.trim()}
          className="w-full rounded-2xl py-3.5 font-bold text-[14px] flex items-center justify-center gap-2 text-white disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#1a1a1a,#333)" }}>
          Continue<ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </MotionButton>
      </div>
      <button onClick={() => onNext("")} className="w-full mt-3 py-2 text-[12px] text-black/30 font-semibold">Skip</button>
    </Step>
  );
}

function Base44Step({ onNext, onSkip }: { onNext: (t: string, e: string) => void; onSkip: () => void }) {
  const [tab, setTab] = useState<"login" | "token">("login");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [showPw, setShowPw] = useState(false);
  const [tok, setTok] = useState(""); const [showTok, setShowTok] = useState(false);
  const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [done, setDone] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (tab === "login") {
        if (!email.trim() || !pw) { setError("Enter your email and password"); return; }
        const r = await base44Login({ data: { email: email.trim(), password: pw } });
        setDone(true); setTimeout(() => onNext(r.token, r.email), 600);
      } else {
        if (!tok.trim()) { setError("Paste your auth token"); return; }
        const info = await validateBase44Token({ data: { token: tok.trim() } });
        setDone(true); setTimeout(() => onNext(tok.trim(), info.email), 600);
      }
    } catch (e: any) { setError(e.message ?? "Failed. Check your credentials."); }
    finally { setLoading(false); }
  };

  return (
    <Step title="Connect Base44" subtitle="Sign in to access your apps."
      icon={<div className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
        style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}><Base44Logo size={26} white /></div>}>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2 py-6">
            <div className="h-14 w-14 rounded-full bg-[#dcfce7] flex items-center justify-center"><Check className="h-8 w-8 text-[#22c55e]" strokeWidth={3} /></div>
            <p className="text-[14px] font-bold text-black">Connected to Base44!</p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-start gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3 text-[11px] text-[#166534] font-medium">
              <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#22c55e]" />
              Your password goes directly to Base44 — never stored here.
            </div>
            <div className="flex bg-[#f3f2ee] rounded-xl p-1">
              {(["login", "token"] as const).map((t) => (
                <button key={t} onClick={() => { setTab(t); setError(""); }}
                  className={`flex-1 py-2 rounded-lg text-[12px] font-bold relative transition-colors ${tab === t ? "bg-white shadow-sm text-black" : "text-black/40"}`}>
                  {t === "login" ? "Email & Password" : "Auth Token"}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              {tab === "login" ? (
                <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
                  <Field icon={<Mail className="h-4 w-4" />} type="email" placeholder="your@email.com" value={email} onChange={setEmail} onEnter={submit} autoFocus />
                  <Field icon={<Lock className="h-4 w-4" />} type={showPw ? "text" : "password"} placeholder="Password" value={pw} onChange={setPw} onEnter={submit}
                    right={<button onClick={() => setShowPw(!showPw)} className="text-black/25">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>} />
                </motion.div>
              ) : (
                <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1.5">
                  <p className="text-[11px] text-black/40">Get token from <a href="https://app.base44.com/settings" target="_blank" rel="noreferrer" className="text-[#f97316] font-semibold">app.base44.com/settings</a> → API Keys</p>
                  <Field type={showTok ? "text" : "password"} placeholder="Paste token here…" value={tok} onChange={setTok} onEnter={submit} mono
                    right={<button onClick={() => setShowTok(!showTok)} className="text-black/25">{showTok ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>} />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>{error && <Error msg={error} />}</AnimatePresence>
            <MotionButton onClick={submit} disabled={loading}
              className="w-full rounded-2xl py-3.5 font-bold text-white text-[14px] flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Base44Logo size={18} white />}
              {loading ? "Connecting…" : "Connect Base44"}
            </MotionButton>
            <button onClick={onSkip} className="w-full py-2 text-[12px] text-black/30 font-semibold">Skip for now</button>
          </motion.div>
        )}
      </AnimatePresence>
    </Step>
  );
}

function GitHubStep({ onNext, onSkip }: { onNext: (t: string, u: string) => void; onSkip: () => void }) {
  const [token, setToken] = useState(""); const [showTok, setShowTok] = useState(false);
  const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [done, setDone] = useState(false);
  const [opened, setOpened] = useState(false); const [copied, setCopied] = useState(false);

  const copyUrl = async () => { await navigator.clipboard.writeText(GITHUB_TOKEN_URL).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const connect = async () => {
    if (!token.trim()) { setError("Paste your GitHub token"); return; }
    setError(""); setLoading(true);
    try {
      const u = await getGitHubUser({ data: { token: token.trim() } });
      setDone(true); setTimeout(() => onNext(token.trim(), u.login), 600);
    } catch (e: any) { setError(e.message ?? "Invalid token."); }
    finally { setLoading(false); }
  };

  return (
    <Step title="Connect GitHub" subtitle="Where your code will be pushed."
      icon={<div className="h-11 w-11 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shrink-0">
        <GitHubLogo className="h-6 w-6 text-white" /></div>}>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2 py-6">
            <div className="h-14 w-14 rounded-full bg-[#dcfce7] flex items-center justify-center"><Check className="h-8 w-8 text-[#22c55e]" strokeWidth={3} /></div>
            <p className="text-[14px] font-bold text-black">GitHub connected!</p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {/* Step 1 */}
            <div className="rounded-2xl border border-[#eee] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-white shrink-0">1</div>
                <p className="text-[12px] font-semibold text-black">Open GitHub token creator</p>
              </div>
              <div className="flex gap-2">
                <MotionButton onClick={() => { window.open(GITHUB_TOKEN_URL, "_blank", "noopener,noreferrer"); setOpened(true); }}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold text-black"
                  style={{ background: "linear-gradient(135deg,#dce99a,#c5e352)" }}>
                  <ExternalLink className="h-3.5 w-3.5" />Open GitHub
                </MotionButton>
                <MotionButton onClick={copyUrl}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold border border-[#eee] text-black/50 bg-white">
                  <AnimatePresence mode="wait">
                    {copied
                      ? <motion.div key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="h-3.5 w-3.5 text-[#22c55e]" strokeWidth={3} /></motion.div>
                      : <motion.div key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }}><Copy className="h-3.5 w-3.5" /></motion.div>}
                  </AnimatePresence>
                  {copied ? "Copied!" : "Copy link"}
                </MotionButton>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`rounded-2xl border p-4 space-y-2 transition-opacity ${opened ? "border-[#eee] opacity-100" : "border-[#eee] opacity-50 pointer-events-none"}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-5 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-white shrink-0">2</div>
                <p className="text-[12px] font-semibold text-black">Paste your token</p>
              </div>
              <div className="relative">
                <input type={showTok ? "text" : "password"} placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={token} onChange={(e) => setToken(e.target.value)} onKeyDown={(e) => e.key === "Enter" && connect()}
                  className="w-full rounded-xl border border-[#eee] bg-[#f7f6f1] px-3 py-2.5 text-[12px] font-mono outline-none focus:border-[#1a1a1a]/30 pr-9" />
                <button onClick={() => setShowTok(!showTok)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/25">
                  {showTok ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <AnimatePresence>{error && <Error msg={error} />}</AnimatePresence>

            <MotionButton onClick={connect} disabled={loading || !opened || !token.trim()}
              className="w-full rounded-2xl py-3.5 font-bold text-white text-[14px] flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#1a1a1a,#333)" }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitHubLogo className="h-4 w-4" />}
              {loading ? "Connecting…" : "Connect GitHub"}
            </MotionButton>
            <button onClick={onSkip} className="w-full py-2 text-[12px] text-black/30 font-semibold">Skip for now</button>
          </motion.div>
        )}
      </AnimatePresence>
    </Step>
  );
}

function DoneStep() {
  return (
    <div className="flex flex-col items-center text-center">
      <ScaleIn>
        <motion.div className="h-20 w-20 rounded-full bg-[#dcfce7] flex items-center justify-center mb-5"
          animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
          <Sparkles className="h-10 w-10 text-[#22c55e]" />
        </motion.div>
      </ScaleIn>
      <FadeUp delay={0.1}><h2 className="text-[26px] font-extrabold text-black tracking-tight mb-2">You're all set!</h2></FadeUp>
      <FadeUp delay={0.16}><p className="text-[14px] text-black/45 leading-relaxed max-w-[220px] mb-8">Push44 is ready. Start pushing your Base44 apps to GitHub in one tap.</p></FadeUp>
    </div>
  );
}

function OnboardingPage() {
  const navigate  = useNavigate();
  const { updateCreds } = useApp();
  const [step, setStep] = useState(0);
  const TOTAL = 4;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative"
      style={{ background: "linear-gradient(160deg,#f3f2ee 0%,#ede9f8 60%,#f0fdf4 100%)" }}>
      <AnimatedCorner variant="onboarding" />

      <div className="w-full max-w-sm relative z-10">
        {/* Progress dots */}
        {step > 0 && step < TOTAL && (
          <motion.div className="flex items-center justify-between mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <StepDots total={TOTAL - 1} current={step - 1} />
            <span className="text-[11px] text-black/30 font-semibold">{step} / {TOTAL - 1}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><WelcomeStep onNext={() => setStep(1)} /></motion.div>}
          {step === 1 && <NameStep key="n" onNext={(n) => { if (n) updateCreds({ displayName: n }); setStep(2); }} />}
          {step === 2 && <Base44Step key="b" onNext={(t, e) => { updateCreds({ base44Token: t, base44Email: e }); setStep(3); }} onSkip={() => setStep(3)} />}
          {step === 3 && <GitHubStep key="g" onNext={(t, u) => { updateCreds({ githubToken: t, githubUsername: u }); setStep(4); }} onSkip={() => setStep(4)} />}
          {step === 4 && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <DoneStep />
              <FadeUp delay={0.28}>
                <MotionButton onClick={() => { markOnboardingDone(); navigate({ to: "/" }); }}
                  className="w-full rounded-2xl py-3.5 font-bold text-[14px] flex items-center justify-center gap-2 text-black"
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
