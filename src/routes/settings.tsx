import { createFileRoute } from "@tanstack/react-router";
import { AvatarBubble } from "@/components/AppShell";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, MotionButton } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Shield, Eye, EyeOff, Check, X, Loader2,
  ExternalLink, AlertCircle, Mail, Lock, GitBranch,
  CheckCircle2, XCircle, Wifi, Copy,
} from "lucide-react";
import { Base44Logo, GitHubLogo, RocketLogo, FlootLogo, ZiteLogo } from "@/components/BrandLogos";
import { useApp } from "@/contexts/AppContext";
import { base44Login, validateBase44Token, listBase44Apps } from "@/lib/base44-api";
import { RocketModal } from "@/components/RocketModal";
import { getGitHubUser } from "@/lib/github-api";
import { listRocketApps } from "@/lib/rocket-api";
import { validateFlootToken, listFlootApps } from "@/lib/floot-api";
import { loginToZite, validateZiteSession, listZiteApps } from "@/lib/zite-api";
import { Toaster, toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Push44" },
      { name: "description", content: "Connect your Base44 or Rocket.new account and GitHub personal access token to start pushing apps to GitHub." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SettingsPage,
});

function StatusDot({ on }: { on: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: on ? "#22c55e" : "#d1d5db" }} />
      <span className="text-[11px] font-semibold" style={{ color: on ? "#16a34a" : "#9ca3af" }}>
        {on ? "Connected" : "Not connected"}
      </span>
    </span>
  );
}

type TestResult = "idle" | "loading" | "ok" | "fail";

function TestButton({ result, onClick }: { result: TestResult; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={result === "loading"}
      className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-[10px] shrink-0 border transition-colors"
      style={{
        background: result === "ok" ? "#f0fdf4" : result === "fail" ? "#fef2f2" : "#faf7f3",
        borderColor: result === "ok" ? "#bbf7d0" : result === "fail" ? "#fecaca" : "#f0ece4",
        color: result === "ok" ? "#16a34a" : result === "fail" ? "#ef4444" : "#9a8880",
      }}
      whileTap={{ scale: 0.95 }}
    >
      {result === "loading" && <Loader2 className="h-3 w-3 animate-spin" />}
      {result === "ok"      && <CheckCircle2 className="h-3 w-3" />}
      {result === "fail"    && <XCircle className="h-3 w-3" />}
      {result === "idle"    && <Wifi className="h-3 w-3" />}
      {result === "loading" ? "Testing…" : result === "ok" ? "OK" : result === "fail" ? "Failed" : "Test"}
    </motion.button>
  );
}

function Base44Modal({ onSuccess, onClose }: { onSuccess: (t: string, e: string, n: string) => void; onClose: () => void }) {
  const [tab, setTab]         = useState<"login" | "token">("login");
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState(""); const [showPw, setShowPw] = useState(false);
  const [tok, setTok]         = useState(""); const [showTok, setShowTok] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (tab === "login") {
        if (!email.trim()) { setError("Enter your Base44 email"); return; }
        if (!pw) { setError("Enter your password"); return; }
        const r = await base44Login({ data: { email: email.trim(), password: pw } });
        setDone(true); setTimeout(() => onSuccess(r.token, r.email, r.name), 600);
      } else {
        if (!tok.trim()) { setError("Paste your auth token"); return; }
        const info = await validateBase44Token({ data: { token: tok.trim() } });
        setDone(true); setTimeout(() => onSuccess(tok.trim(), info.email, info.name), 600);
      }
    } catch (e: any) { setError(e.message ?? "Failed."); }
    finally { setLoading(false); }
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-sm mx-4 mb-24 sm:mb-0 rounded-[28px] shadow-2xl overflow-hidden border border-white/80"
        style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)" }}
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        <div className="px-6 pt-6 pb-5 border-b border-[#f7f4f0]">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
              <Base44Logo size={24} white />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-black text-[#1a1a1a]">Connect Base44</div>
              <div className="text-[11px] text-[#9a8880]">Sign in to access your apps</div>
            </div>
            <motion.button onClick={onClose}
              className="h-8 w-8 rounded-xl bg-[#faf7f3] flex items-center justify-center text-[#9a8880]"
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
              <X className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-3">
            <Shield className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#166534] font-medium leading-snug">
              Your credentials go directly to Base44 — nothing is stored here.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2 py-10">
                <div className="h-16 w-16 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                  <Check className="h-8 w-8 text-white" strokeWidth={3} />
                </div>
                <p className="text-[14px] font-bold text-[#1a1a1a] mt-1">Connected to Base44!</p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex bg-[#faf7f3] rounded-xl p-1 mb-4">
                  {(["login", "token"] as const).map((t) => (
                    <motion.button key={t} onClick={() => { setTab(t); setError(""); }}
                      className="flex-1 py-2 rounded-lg text-[12px] font-bold relative" whileTap={{ scale: 0.97 }}>
                      {tab === t && (
                        <motion.div layoutId="b44-modal-tab" className="absolute inset-0 rounded-lg bg-white shadow-sm border border-[#f0ece4]"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                      )}
                      <span className={`relative z-10 ${tab === t ? "text-[#1a1a1a]" : "text-[#9a8880]"}`}>
                        {t === "login" ? "Email & Password" : "Auth Token"}
                      </span>
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {tab === "login" ? (
                    <motion.div key="l" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-2.5">
                      <p className="text-[11px] text-[#b8a898]">
                        Only works for email/password accounts.{" "}
                        <button onClick={() => { setTab("token"); setError(""); }} className="text-[#f97316] font-semibold">
                          Signed up with Google? Use Auth Token →
                        </button>
                      </p>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c8b8a2]" />
                        <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
                          className="w-full rounded-xl border border-[#f0ece4] bg-[#faf7f3] pl-10 pr-4 py-3 text-[13px] outline-none focus:border-[#f97316]/50 focus:bg-white transition-colors" />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c8b8a2]" />
                        <input type={showPw ? "text" : "password"} placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
                          className="w-full rounded-xl border border-[#f0ece4] bg-[#faf7f3] pl-10 pr-11 py-3 text-[13px] outline-none focus:border-[#f97316]/50 focus:bg-white transition-colors" />
                        <button onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c8b8a2] hover:text-[#9a8880]">
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="t" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-2">
                      <p className="text-[11px] text-[#9a8880]">
                        Find your API key in{" "}
                        <a href="https://app.base44.com/settings/account" target="_blank" rel="noreferrer" className="text-[#f97316] font-semibold">
                          Base44 Settings → Account
                        </a>
                        {" "}under <span className="font-semibold">API Key</span>.
                      </p>
                      <div className="relative">
                        <input type={showTok ? "text" : "password"} placeholder="Paste token here…" value={tok} onChange={(e) => setTok(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
                          className="w-full rounded-xl border border-[#f0ece4] bg-[#faf7f3] px-4 py-3 text-[13px] font-mono outline-none focus:border-[#f97316]/50 pr-11" />
                        <button onClick={() => setShowTok(!showTok)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c8b8a2]">
                          {showTok ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-3 mt-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
                        <p className="text-[12px] text-[#991b1b] font-medium">{error}</p>
                      </div>
                      {(error.toLowerCase().includes("invalid email or password") || error.toLowerCase().includes("invalid email")) && (
                        <div className="mt-2.5 pt-2.5 border-t border-[#fecaca]/60">
                          <p className="text-[11px] text-[#991b1b]/80 leading-relaxed mb-2">
                            Signed up with Google? Email & Password login won't work — use your API token instead.
                          </p>
                          <button onClick={() => { setTab("token"); setError(""); }} className="text-[11px] font-bold text-[#ef4444] underline underline-offset-2">
                            Switch to Auth Token →
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <MotionButton onClick={submit} disabled={loading}
                  className="w-full rounded-2xl py-3.5 font-bold text-white text-[14px] flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                  style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Base44Logo size={18} white />}
                  {loading ? "Connecting…" : "Connect Base44"}
                </MotionButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

const ZITE_GRAD  = "linear-gradient(135deg,#f59e0b,#d97706)";
const ZITE_COLOR = "#d97706";

function ZiteModal({ onSuccess, onClose }: { onSuccess: (session: string, csrf: string, email: string, name: string) => void; onClose: () => void }) {
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState(""); const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  const submit = async () => {
    if (!email.trim()) { setError("Enter your Zite email"); return; }
    if (!pw)           { setError("Enter your password"); return; }
    setError(""); setLoading(true);
    try {
      const r = await loginToZite({ data: { email: email.trim(), password: pw } });
      setDone(true);
      setTimeout(() => onSuccess(r.session, r.csrf, r.email, r.name), 600);
    } catch (e: any) { setError(e.message ?? "Login failed. Check your credentials."); }
    finally { setLoading(false); }
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-sm mx-4 mb-24 sm:mb-0 rounded-[28px] shadow-2xl overflow-hidden border border-white/80"
        style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)" }}
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        <div className="px-6 pt-6 pb-5 border-b border-[#f7f4f0]">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: ZITE_GRAD }}>
              <ZiteLogo size={22} white />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-black text-[#1a1a1a]">Connect Zite</div>
              <div className="text-[11px] text-[#9a8880]">Sign in with your Zite account</div>
            </div>
            <motion.button onClick={onClose}
              className="h-8 w-8 rounded-xl bg-[#faf7f3] flex items-center justify-center text-[#9a8880]"
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
              <X className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-2 bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-3">
            <Shield className="h-4 w-4 text-[#d97706] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#92400e] font-medium leading-snug">
              Your credentials go directly to Zite — nothing is stored on our servers.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2 py-10">
                <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ background: ZITE_GRAD }}>
                  <Check className="h-8 w-8 text-white" strokeWidth={3} />
                </div>
                <p className="text-[14px] font-bold text-[#1a1a1a] mt-1">Connected to Zite!</p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c8b8a2]" />
                  <input type="email" placeholder="your@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} autoFocus
                    className="w-full rounded-xl border border-[#f0ece4] bg-[#faf7f3] pl-10 pr-4 py-3 text-[13px] outline-none focus:border-[#d97706]/50 focus:bg-white transition-colors" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c8b8a2]" />
                  <input type={showPw ? "text" : "password"} placeholder="Password" value={pw}
                    onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
                    className="w-full rounded-xl border border-[#f0ece4] bg-[#faf7f3] pl-10 pr-11 py-3 text-[13px] outline-none focus:border-[#d97706]/50 focus:bg-white transition-colors" />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c8b8a2]">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
                        <p className="text-[12px] text-[#991b1b] font-medium">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <MotionButton onClick={submit} disabled={loading}
                  className="w-full rounded-2xl py-3.5 font-bold text-white text-[14px] flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  style={{ background: ZITE_GRAD }}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ZiteLogo size={18} white />}
                  {loading ? "Connecting…" : "Connect Zite"}
                </MotionButton>

                <p className="text-[10px] text-center text-[#9a8880] leading-relaxed">
                  Use your <a href="https://build.fillout.com" target="_blank" rel="noreferrer" className="text-[#d97706] font-semibold">build.fillout.com</a> account credentials.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

type FlootStep = "login" | "token" | "done";

function FlootModal({ onSuccess, onClose }: { onSuccess: (t: string, e: string, n: string) => void; onClose: () => void }) {
  const [step, setStep]       = useState<FlootStep>("login");
  const [tok, setTok]         = useState("");
  const [showTok, setShowTok] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [copied, setCopied]   = useState(false);

  const FLOOT_GRAD = "linear-gradient(135deg,#3b82f6,#2563eb)";

  const connectToken = async () => {
    if (!tok.trim()) { setError("Paste your session token"); return; }
    setError(""); setLoading(true);
    try {
      const info = await validateFlootToken({ data: { token: tok.trim() } });
      setStep("done");
      setTimeout(() => onSuccess(tok.trim(), info.email, info.name), 700);
    } catch (e: any) {
      setError(e.message ?? "Token is invalid. Please log in to Floot and try again.");
    } finally { setLoading(false); }
  };

  const copyPath = () => {
    navigator.clipboard.writeText("nextauth.session-token").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const stepTitle = step === "done" ? "Connected!" : step === "token" ? "Copy your session token" : "Step 1 — Log in to Floot";

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-sm mx-4 mb-24 sm:mb-0 rounded-[28px] shadow-2xl overflow-hidden border border-white/80"
        style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)" }}
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#f7f4f0]">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: FLOOT_GRAD }}>
              <FlootLogo size={22} white />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-black text-[#1a1a1a]">Connect Floot</div>
              <div className="text-[11px] text-[#9a8880]">{stepTitle}</div>
            </div>
            <motion.button onClick={onClose}
              className="h-8 w-8 rounded-xl bg-[#faf7f3] flex items-center justify-center text-[#9a8880]"
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
              <X className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Step indicator */}
          {step !== "done" && (
            <div className="flex gap-1.5 mt-4">
              {(["login", "token"] as FlootStep[]).map((s, i) => (
                <div key={s} className="h-1 rounded-full flex-1 transition-all duration-300"
                  style={{ background: step === s || (s === "login" && step === "token") ? FLOOT_GRAD : "#f0ece4" }} />
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <AnimatePresence mode="popLayout">

            {/* ── DONE ─────────────────────────────────── */}
            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2 py-10">
                <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ background: FLOOT_GRAD }}>
                  <Check className="h-8 w-8 text-white" strokeWidth={3} />
                </div>
                <p className="text-[14px] font-bold text-[#1a1a1a] mt-1">Connected to Floot!</p>
              </motion.div>
            )}

            {/* ── STEP 1: Login ────────────────────────── */}
            {step === "login" && (
              <motion.div key="login" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                <p className="text-[13px] text-[#4b5563] leading-relaxed">
                  Log in to <strong>floot.com</strong> using your email or Google. Floot will send a magic link to your inbox — just click it.
                </p>

                <a href="https://floot.com/login" target="_blank" rel="noreferrer" className="block">
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    className="w-full rounded-2xl py-3.5 font-bold text-white text-[14px] flex items-center justify-center gap-2.5 cursor-pointer"
                    style={{ background: FLOOT_GRAD }}>
                    <FlootLogo size={18} white />
                    Open Floot Login
                    <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                  </motion.div>
                </a>

                <div className="flex items-start gap-2 bg-[#f9fafb] border border-[#f0ece4] rounded-2xl p-3">
                  <Shield className="h-4 w-4 text-[#6b7280] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#6b7280] font-medium leading-snug">
                    Sign in with your email — Floot sends you a link, you click it, you're in. Then come back here for step 2.
                  </p>
                </div>

                <MotionButton onClick={() => { setStep("token"); setError(""); }}
                  className="w-full rounded-2xl py-3 font-bold text-[13px] border border-[#bfdbfe] text-[#2563eb] flex items-center justify-center gap-2 bg-[#eff6ff]">
                  I've logged in to Floot →
                </MotionButton>
              </motion.div>
            )}

            {/* ── STEP 2: Copy token ───────────────────── */}
            {step === "token" && (
              <motion.div key="token" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="space-y-3">

                {/* Instructions */}
                <div className="rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-4 space-y-3">
                  <p className="text-[12px] font-bold text-[#1e40af]">Copy your session token from Floot:</p>
                  <div className="space-y-2.5">
                    {[
                      { n: "1", text: "In your browser where you just logged in to Floot, press", kbd: "F12" },
                      { n: "2", text: 'Click the "Application" tab in DevTools' },
                      { n: "3", text: 'On the left, open Cookies → click "https://floot.com"' },
                      { n: "4", text: 'Find the cookie named:', code: "nextauth.session-token" },
                      { n: "5", text: "Double-click its Value to select it, then copy" },
                    ].map(({ n, text, kbd, code }) => (
                      <div key={n} className="flex items-start gap-2.5">
                        <span className="h-4 w-4 rounded-full text-[9px] font-black text-white flex items-center justify-center shrink-0 mt-0.5 bg-[#2563eb]">{n}</span>
                        <p className="text-[11px] text-[#1e40af] leading-snug flex-1">
                          {text}{" "}
                          {kbd && <kbd className="bg-white border border-[#bfdbfe] rounded px-1 py-0.5 text-[10px] font-mono font-bold">{kbd}</kbd>}
                          {code && (
                            <button onClick={copyPath} className="inline-flex items-center gap-1 bg-white border border-[#bfdbfe] rounded px-1.5 py-0.5 text-[10px] font-mono font-bold hover:bg-[#dbeafe] transition-colors ml-0.5">
                              {code} {copied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                            </button>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mac shortcut note */}
                <p className="text-[10px] text-[#9a8880] text-center">
                  On Mac: use <kbd className="bg-[#f5f2ee] rounded px-1 text-[10px] font-mono">Cmd + Option + I</kbd> instead of F12
                </p>

                {/* Token input */}
                <div className="relative">
                  <input
                    type={showTok ? "text" : "password"}
                    placeholder="Paste your session token here…"
                    value={tok}
                    onChange={(e) => { setTok(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && connectToken()}
                    autoFocus
                    className="w-full rounded-xl border border-[#f0ece4] bg-[#faf7f3] px-4 py-3 text-[12px] font-mono outline-none focus:border-[#2563eb]/40 focus:bg-white transition-colors pr-11"
                  />
                  <button onClick={() => setShowTok(!showTok)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c8b8a2]">
                    {showTok ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-3 flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-[#ef4444] shrink-0 mt-0.5" />
                      <p className="text-[11px] text-[#991b1b] font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-2">
                  <MotionButton onClick={() => setStep("login")}
                    className="flex-1 py-2.5 rounded-xl border border-[#f0ece4] text-[12px] font-semibold text-[#9a8880]">
                    ← Back
                  </MotionButton>
                  <MotionButton onClick={connectToken} disabled={loading}
                    className="flex-[2] py-2.5 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: FLOOT_GRAD }}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlootLogo size={16} white />}
                    {loading ? "Connecting…" : "Connect Floot"}
                  </MotionButton>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SettingsPage() {
  const { creds, updateCreds, signOut, isLoaded } = useApp();
  const [showB44Modal, setShowB44Modal]       = useState(false);
  const [showRocketModal, setShowRocketModal] = useState(false);
  const [showFlootModal, setShowFlootModal]   = useState(false);
  const [showZiteModal, setShowZiteModal]     = useState(false);
  const [ghToken, setGhToken]     = useState("");
  const [showGhTok, setShowGhTok] = useState(false);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghUser, setGhUser]       = useState<{ login: string; name: string } | null>(null);
  const [branch, setBranch]       = useState("main");
  const [expandGh, setExpandGh]   = useState(false);

  // Test connection states
  const [b44Test,     setB44Test]     = useState<TestResult>("idle");
  const [rocketTest,  setRocketTest]  = useState<TestResult>("idle");
  const [flootTest,   setFlootTest]   = useState<TestResult>("idle");
  const [ziteTest,    setZiteTest]    = useState<TestResult>("idle");
  const [ghTest,      setGhTest]      = useState<TestResult>("idle");

  useEffect(() => {
    if (!isLoaded) return;
    if (creds.githubToken) setGhToken(creds.githubToken);
    if (creds.defaultBranch) setBranch(creds.defaultBranch);
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || !creds.githubToken) return;
    getGitHubUser({ data: { token: creds.githubToken } })
      .then((u) => setGhUser({ login: u.login, name: u.name }))
      .catch(() => setGhUser(null));
  }, [isLoaded, creds.githubToken]);

  const testFloot = async () => {
    if (!creds.flootToken) return;
    setFlootTest("loading");
    try {
      await listFlootApps({ data: { token: creds.flootToken } });
      setFlootTest("ok");
      toast.success("Floot connection is working");
    } catch (e: any) {
      setFlootTest("fail");
      toast.error("Floot test failed: " + (e.message ?? "Unknown error"));
    }
    setTimeout(() => setFlootTest("idle"), 4000);
  };

  const testZite = async () => {
    if (!creds.ziteSession) return;
    setZiteTest("loading");
    try {
      await listZiteApps({ data: { session: creds.ziteSession, csrf: creds.ziteCsrf ?? "" } });
      setZiteTest("ok");
      toast.success("Zite connection is working");
    } catch (e: any) {
      setZiteTest("fail");
      toast.error("Zite test failed: " + (e.message ?? "Unknown error"));
    }
    setTimeout(() => setZiteTest("idle"), 4000);
  };

  const b44Connected    = !!creds.base44Token;
  const rocketConnected = !!creds.rocketToken;
  const flootConnected  = !!creds.flootToken;
  const ziteConnected   = !!creds.ziteSession;
  const ghConnected     = !!creds.githubToken && !!ghUser;
  const displayName     = creds.displayName || creds.base44Email || creds.rocketEmail || creds.githubUsername || "";

  const connectGitHub = async () => {
    if (!ghToken.trim()) { toast.error("Enter your GitHub token"); return; }
    setGhLoading(true);
    try {
      const user = await getGitHubUser({ data: { token: ghToken.trim() } });
      updateCreds({ githubToken: ghToken.trim(), githubUsername: user.login, defaultOwner: user.login });
      setGhUser({ login: user.login, name: user.name });
      setExpandGh(false);
      toast.success(`GitHub connected as @${user.login}`);
    } catch (e: any) { toast.error(e.message ?? "Invalid token"); }
    finally { setGhLoading(false); }
  };

  const testBase44 = async () => {
    if (!creds.base44Token) return;
    setB44Test("loading");
    try {
      await listBase44Apps({ data: { token: creds.base44Token } });
      setB44Test("ok");
      toast.success("Base44 connection is working");
    } catch (e: any) {
      setB44Test("fail");
      toast.error("Base44 test failed: " + (e.message ?? "Unknown error"));
    }
    setTimeout(() => setB44Test("idle"), 4000);
  };

  const testRocket = async () => {
    if (!creds.rocketToken) return;
    setRocketTest("loading");
    try {
      await listRocketApps({ data: { token: creds.rocketToken, companyId: creds.rocketCompanyId } });
      setRocketTest("ok");
      toast.success("Rocket.new connection is working");
    } catch (e: any) {
      setRocketTest("fail");
      toast.error("Rocket.new test failed: " + (e.message ?? "Unknown error"));
    }
    setTimeout(() => setRocketTest("idle"), 4000);
  };

  const testGitHub = async () => {
    if (!creds.githubToken) return;
    setGhTest("loading");
    try {
      const u = await getGitHubUser({ data: { token: creds.githubToken } });
      setGhTest("ok");
      toast.success(`GitHub OK — logged in as @${u.login}`);
    } catch (e: any) {
      setGhTest("fail");
      toast.error("GitHub test failed: " + (e.message ?? "Unknown error"));
    }
    setTimeout(() => setGhTest("idle"), 4000);
  };

  return (
    <>
      <AnimatedCorner variant="settings" />
      <Toaster position="top-center" richColors />

      <AnimatePresence>
        {showB44Modal && (
          <Base44Modal
            onSuccess={(t, e, n) => { updateCreds({ base44Token: t, base44Email: e, displayName: n || e }); setShowB44Modal(false); toast.success(`Connected as ${e || n}`); }}
            onClose={() => setShowB44Modal(false)}
          />
        )}
        {showRocketModal && (
          <RocketModal
            onSuccess={(t, e, n, c) => { updateCreds({ rocketToken: t, rocketEmail: e, rocketCompanyId: c, displayName: n || e }); setShowRocketModal(false); toast.success(`Connected as ${e || n}`); }}
            onClose={() => setShowRocketModal(false)}
          />
        )}
        {showFlootModal && (
          <FlootModal
            onSuccess={(t, e, n) => { updateCreds({ flootToken: t, flootEmail: e, displayName: n || e }); setShowFlootModal(false); toast.success(`Floot connected as ${e || n}`); }}
            onClose={() => setShowFlootModal(false)}
          />
        )}
        {showZiteModal && (
          <ZiteModal
            onSuccess={(s, c, e, n) => { updateCreds({ ziteSession: s, ziteCsrf: c, ziteEmail: e, displayName: n || e }); setShowZiteModal(false); toast.success(`Zite connected as ${e || n}`); }}
            onClose={() => setShowZiteModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Profile card ── */}
      <FadeUp>
        <div
          className="relative overflow-hidden rounded-[24px] border border-[#f0ece4] mb-4"
          style={{ background: "linear-gradient(135deg,#fff8f3 0%,#fffcf8 60%,#fff 100%)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(to right,#f97316,#fb923c,transparent)" }} />

          <div className="flex items-center gap-4 px-5 pt-6 pb-5">
            <div className="relative shrink-0">
              <AvatarBubble name={displayName} size={58} fontSize={20} />
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#22c55e] ring-2 ring-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] font-black text-[#1a1a1a] tracking-tight truncate leading-tight">
                {displayName || "Account"}
              </h1>
              {ghUser && (
                <p className="text-[12px] text-[#9a8880] mt-0.5 truncate">@{ghUser.login} on GitHub</p>
              )}
              <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                <StatusDot on={b44Connected} />
                <span className="h-3 w-px bg-[#ede9e3]" />
                <StatusDot on={rocketConnected} />
                <span className="h-3 w-px bg-[#ede9e3]" />
                <StatusDot on={flootConnected} />
                <span className="h-3 w-px bg-[#ede9e3]" />
                <StatusDot on={ziteConnected} />
                <span className="h-3 w-px bg-[#ede9e3]" />
                <StatusDot on={ghConnected} />
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ── Connections card ── */}
      <FadeUp delay={0.06}>
        <div className="rounded-[24px] border border-[#f0ece4] overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          <div className="px-5 pt-4 pb-2">
            <p className="text-[10px] font-black tracking-[0.12em] uppercase text-[#c8b8a2]">Platforms</p>
          </div>

          {/* Base44 row */}
          <div className="px-5 py-3.5" style={{ borderTop: "1px solid #f7f4f0" }}>
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-[11px] flex items-center justify-center shrink-0 overflow-hidden"
                style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
              >
                <Base44Logo size={18} white />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1a1a1a] leading-tight">Base44</p>
                <AnimatePresence mode="wait">
                  {b44Connected ? (
                    <motion.p key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[11px] text-[#9a8880] truncate mt-0.5">
                      {creds.base44Email || "Authenticated"}
                    </motion.p>
                  ) : (
                    <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[11px] text-[#c8b8a2] mt-0.5">
                      Not connected
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {b44Connected && (
                  <TestButton result={b44Test} onClick={testBase44} />
                )}
                <AnimatePresence mode="wait">
                  {b44Connected ? (
                    <motion.button key="disc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => { updateCreds({ base44Token: "", base44Email: "" }); toast.success("Base44 disconnected"); }}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-[10px] shrink-0"
                      style={{ background: "#fef2f2", color: "#ef4444" }}>
                      Disconnect
                    </motion.button>
                  ) : (
                    <motion.button key="conn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setShowB44Modal(true)}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-[10px] text-white shrink-0"
                      style={{ background: "#f97316" }}>
                      Connect
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Rocket.new row */}
          <div
            className="px-5 py-3.5 transition-colors"
            style={{
              borderTop: "1px solid #f7f4f0",
              background: rocketConnected ? "linear-gradient(90deg,#f5f3ff,transparent 70%)" : undefined,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-[11px] flex items-center justify-center shrink-0 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg,#9810fa,#7008e7)" }}
              >
                <div className="absolute inset-0 rounded-[11px]" style={{ background: "radial-gradient(circle at 35% 35%,rgba(255,255,255,0.2),transparent 65%)" }} />
                <RocketLogo size={18} white />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1a1a1a] leading-tight">Rocket.new</p>
                <AnimatePresence mode="wait">
                  {rocketConnected ? (
                    <motion.p key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[11px] truncate mt-0.5 font-medium" style={{ color: "#7f22fe" }}>
                      {creds.rocketEmail || "Authenticated"}
                    </motion.p>
                  ) : (
                    <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[11px] text-[#c8b8a2] mt-0.5">
                      Not connected
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {rocketConnected && (
                  <TestButton result={rocketTest} onClick={testRocket} />
                )}
                <AnimatePresence mode="wait">
                  {rocketConnected ? (
                    <motion.button key="disc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => { updateCreds({ rocketToken: "", rocketEmail: "", rocketCompanyId: "" }); toast.success("Rocket.new disconnected"); }}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-[10px] shrink-0"
                      style={{ background: "#fef2f2", color: "#ef4444" }}>
                      Disconnect
                    </motion.button>
                  ) : (
                    <motion.button key="conn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setShowRocketModal(true)}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-[10px] text-white shrink-0"
                      style={{ background: "linear-gradient(135deg,#9810fa,#7008e7)", boxShadow: "0 2px 8px rgba(127,34,254,0.3)" }}>
                      Connect
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Floot row */}
          <div
            className="px-5 py-3.5 transition-colors"
            style={{
              borderTop: "1px solid #f7f4f0",
              background: flootConnected ? "linear-gradient(90deg,#eff6ff,transparent 70%)" : undefined,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-[11px] flex items-center justify-center shrink-0 overflow-hidden"
                style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)" }}
              >
                <FlootLogo size={18} white />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1a1a1a] leading-tight">Floot</p>
                <AnimatePresence mode="wait">
                  {flootConnected ? (
                    <motion.p key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[11px] truncate mt-0.5 font-medium" style={{ color: "#2563eb" }}>
                      {creds.flootEmail || "Authenticated"}
                    </motion.p>
                  ) : (
                    <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[11px] text-[#c8b8a2] mt-0.5">
                      Not connected
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {flootConnected && (
                  <TestButton result={flootTest} onClick={testFloot} />
                )}
                <AnimatePresence mode="wait">
                  {flootConnected ? (
                    <motion.button key="disc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => { updateCreds({ flootToken: "", flootEmail: "" }); toast.success("Floot disconnected"); }}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-[10px] shrink-0"
                      style={{ background: "#fef2f2", color: "#ef4444" }}>
                      Disconnect
                    </motion.button>
                  ) : (
                    <motion.button key="conn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setShowFlootModal(true)}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-[10px] text-white shrink-0"
                      style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
                      Connect
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Zite row */}
          <div
            className="px-5 py-3.5 transition-colors"
            style={{
              borderTop: "1px solid #f7f4f0",
              background: ziteConnected ? "linear-gradient(90deg,#fffbeb,transparent 70%)" : undefined,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-[11px] flex items-center justify-center shrink-0"
                style={{ background: ZITE_GRAD }}
              >
                <ZiteLogo size={18} white />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1a1a1a] leading-tight">Zite</p>
                <AnimatePresence mode="wait">
                  {ziteConnected ? (
                    <motion.p key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[11px] truncate mt-0.5 font-medium" style={{ color: ZITE_COLOR }}>
                      {creds.ziteEmail || "Authenticated"}
                    </motion.p>
                  ) : (
                    <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[11px] text-[#c8b8a2] mt-0.5">
                      Not connected
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {ziteConnected && (
                  <TestButton result={ziteTest} onClick={testZite} />
                )}
                <AnimatePresence mode="wait">
                  {ziteConnected ? (
                    <motion.button key="disc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => { updateCreds({ ziteSession: "", ziteCsrf: "", ziteEmail: "" }); toast.success("Zite disconnected"); }}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-[10px] shrink-0"
                      style={{ background: "#fef2f2", color: "#ef4444" }}>
                      Disconnect
                    </motion.button>
                  ) : (
                    <motion.button key="conn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setShowZiteModal(true)}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-[10px] text-white shrink-0"
                      style={{ background: ZITE_GRAD, boxShadow: "0 2px 8px rgba(217,119,6,0.3)" }}>
                      Connect
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* GitHub row */}
          <div className="px-5 py-3.5" style={{ borderTop: "1px solid #f7f4f0" }}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-[11px] bg-[#1a1a1a] flex items-center justify-center shrink-0">
                <GitHubLogo className="h-[18px] w-[18px] text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1a1a1a] leading-tight">GitHub</p>
                <AnimatePresence mode="wait">
                  {ghConnected && ghUser ? (
                    <motion.p key="user" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[11px] text-[#9a8880] truncate mt-0.5">
                      @{ghUser.login}
                    </motion.p>
                  ) : (
                    <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[11px] text-[#c8b8a2] mt-0.5">
                      Not connected
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {ghConnected && ghUser && (
                  <>
                    <TestButton result={ghTest} onClick={testGitHub} />
                    <motion.a
                      href={`https://github.com/${ghUser.login}`} target="_blank" rel="noreferrer"
                      className="h-7 w-7 rounded-[9px] bg-[#faf7f3] border border-[#f0ece4] flex items-center justify-center text-[#9a8880]"
                      whileHover={{ scale: 1.08, background: "#1a1a1a", color: "#fff", borderColor: "#1a1a1a" }}
                      transition={{ type: "spring", stiffness: 360, damping: 28 }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </motion.a>
                  </>
                )}
                <AnimatePresence mode="wait">
                  {ghConnected ? (
                    <motion.button key="disc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => { updateCreds({ githubToken: "", githubUsername: "" }); setGhUser(null); toast.success("GitHub disconnected"); }}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-[10px]"
                      style={{ background: "#fef2f2", color: "#ef4444" }}>
                      Disconnect
                    </motion.button>
                  ) : (
                    <motion.button key="expand" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setExpandGh((v) => !v)}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-[10px] text-white"
                      style={{ background: "#1a1a1a" }}>
                      Connect
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {!ghConnected && expandGh && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-2.5">
                    <p className="text-[11px] text-[#9a8880] leading-relaxed">
                      Create a token at{" "}
                      <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noreferrer"
                        className="text-[#f97316] font-semibold">github.com/settings/tokens</a>{" "}
                      with <strong className="text-[#1a1a1a]">repo</strong> scope.
                    </p>
                    <div className="relative">
                      <input
                        type={showGhTok ? "text" : "password"}
                        placeholder="ghp_xxxxxxxxxxxx"
                        value={ghToken}
                        onChange={(e) => setGhToken(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && connectGitHub()}
                        className="w-full rounded-[14px] border border-[#f0ece4] bg-[#faf7f3] px-4 py-3 text-[12px] font-mono outline-none focus:border-[#1a1a1a]/30 focus:bg-white transition-colors pr-11"
                      />
                      <button onClick={() => setShowGhTok(!showGhTok)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c8b8a2]">
                        {showGhTok ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <MotionButton onClick={connectGitHub} disabled={ghLoading}
                      className="w-full bg-[#1a1a1a] text-white font-bold text-[13px] py-3 rounded-[14px] flex items-center justify-center gap-2 disabled:opacity-50">
                      {ghLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitHubLogo className="h-4 w-4" />}
                      {ghLoading ? "Connecting…" : "Connect GitHub"}
                    </MotionButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </FadeUp>

      {/* ── Push defaults ── */}
      <FadeUp delay={0.12}>
        <div className="rounded-[24px] border border-[#f0ece4] overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          <div className="px-5 pt-4 pb-2">
            <p className="text-[10px] font-black tracking-[0.12em] uppercase text-[#c8b8a2]">Push Defaults</p>
          </div>
          <div className="px-5 py-3.5" style={{ borderTop: "1px solid #f7f4f0" }}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-[11px] bg-[#fff4ed] border border-[#fde0c8] flex items-center justify-center shrink-0">
                <GitBranch className="h-4 w-4 text-[#f97316]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[#9a8880] mb-1 font-medium">Default branch</p>
                <input
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  onBlur={() => updateCreds({ defaultBranch: branch })}
                  placeholder="main"
                  className="w-full rounded-[10px] border border-[#f0ece4] bg-[#faf7f3] px-3 py-2 text-[13px] font-mono outline-none focus:border-[#f97316]/40 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ── Sign out ── */}
      <FadeUp delay={0.18}>
        <MotionButton
          onClick={() => { signOut(); toast.success("Signed out"); }}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[18px] border border-[#f0ece4] bg-white text-[13px] font-bold text-[#9a8880] mb-3"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          whileHover={{ borderColor: "#fecaca", color: "#ef4444", background: "#fef2f2" }}
          transition={{ duration: 0.18 }}
        >
          <LogOut className="h-4 w-4" />
          Sign out of all accounts
        </MotionButton>
      </FadeUp>

      <FadeUp delay={0.22}>
        <p className="text-center text-[11px] text-[#c8b8a2] pb-4">
          Push44 — your code stays yours
        </p>
      </FadeUp>
    </>
  );
}
