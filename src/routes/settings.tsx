import { createFileRoute } from "@tanstack/react-router";
import { AppShell, AvatarBubble } from "@/components/AppShell";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, MotionButton } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Shield, Eye, EyeOff, Check, X, Loader2,
  ExternalLink, AlertCircle, Mail, Lock, GitBranch, ChevronRight,
} from "lucide-react";
import { Base44Logo, GitHubLogo, RocketLogo } from "@/components/BrandLogos";
import { useApp } from "@/contexts/AppContext";
import { base44Login, validateBase44Token } from "@/lib/base44-api";
import { rocketRequestOTP, rocketVerifyOTP, validateRocketToken } from "@/lib/rocket-api";
import { getGitHubUser } from "@/lib/github-api";
import { Toaster, toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Push44" },
      { name: "description", content: "Connect your Base44 or Rocket.new account and GitHub personal access token to start pushing apps to GitHub." },
    ],
  }),
  component: SettingsPage,
});

function StatusDot({ on }: { on: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: on ? "#22c55e" : "#d1d5db" }}
      />
      <span
        className="text-[11px] font-semibold"
        style={{ color: on ? "#16a34a" : "#9ca3af" }}
      >
        {on ? "Connected" : "Not connected"}
      </span>
    </span>
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
        className="relative z-10 w-full max-w-sm mx-4 mb-24 sm:mb-0 bg-white rounded-[28px] shadow-2xl overflow-hidden border border-[#f0ece4]"
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
                      <p className="text-[11px] text-[#9a8880]">Get your token from{" "}
                        <a href="https://app.base44.com/settings" target="_blank" rel="noreferrer" className="text-[#f97316] font-semibold">app.base44.com/settings</a>
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
                      className="flex items-start gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-xl p-3 mt-3">
                      <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
                      <p className="text-[12px] text-[#991b1b] font-medium">{error}</p>
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

function RocketModal({ onSuccess, onClose }: { onSuccess: (t: string, e: string, n: string, c: string) => void; onClose: () => void }) {
  const [tab, setTab]           = useState<"otp" | "token">("token");
  // OTP flow
  const [email, setEmail]       = useState("");
  const [otpCode, setOtpCode]   = useState("");
  const [otpSent, setOtpSent]   = useState(false);
  // Token flow
  const [tok, setTok]           = useState(""); const [showTok, setShowTok] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) { setError("Enter your Rocket.new email"); return; }
    setError(""); setLoading(true);
    try {
      await rocketRequestOTP({ data: { email: email.trim() } });
      setOtpSent(true);
    } catch (e: any) { setError(e.message ?? "Failed to send code."); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) { setError("Enter the code from your email"); return; }
    setError(""); setLoading(true);
    try {
      const r = await rocketVerifyOTP({ data: { email: email.trim(), otp: otpCode.trim() } });
      setDone(true); setTimeout(() => onSuccess(r.token, r.email, r.name, r.companyId ?? ""), 600);
    } catch (e: any) { setError(e.message ?? "Invalid code."); }
    finally { setLoading(false); }
  };

  const handleToken = async () => {
    if (!tok.trim()) { setError("Paste your API token"); return; }
    setError(""); setLoading(true);
    try {
      const info = await validateRocketToken({ data: { token: tok.trim() } });
      setDone(true); setTimeout(() => onSuccess(tok.trim(), info.email, info.name, info.companyId ?? ""), 600);
    } catch (e: any) { setError(e.message ?? "Invalid token."); }
    finally { setLoading(false); }
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-sm mx-4 mb-24 sm:mb-0 bg-white rounded-[28px] shadow-2xl overflow-hidden border border-[#f0ece4]"
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-[#f7f4f0]">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
              <RocketLogo size={24} white />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-black text-[#1a1a1a]">Connect Rocket.new</div>
              <div className="text-[11px] text-[#9a8880]">Access your Rocket.new projects</div>
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
              Your credentials go directly to Rocket.new — nothing is stored on our servers.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2 py-10">
                <div className="h-16 w-16 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                  <Check className="h-8 w-8 text-white" strokeWidth={3} />
                </div>
                <p className="text-[14px] font-bold text-[#1a1a1a] mt-1">Connected to Rocket.new!</p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Tabs */}
                <div className="flex bg-[#faf7f3] rounded-xl p-1 mb-4">
                  {(["otp", "token"] as const).map((t) => (
                    <motion.button key={t}
                      onClick={() => { setTab(t); setError(""); setOtpSent(false); setOtpCode(""); }}
                      className="flex-1 py-2 rounded-lg text-[12px] font-bold relative"
                      whileTap={{ scale: 0.97 }}>
                      {tab === t && (
                        <motion.div layoutId="rocket-modal-tab"
                          className="absolute inset-0 rounded-lg bg-white shadow-sm border border-[#f0ece4]"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                      )}
                      <span className={`relative z-10 ${tab === t ? "text-[#1a1a1a]" : "text-[#9a8880]"}`}>
                        {t === "otp" ? "Email Code" : "API Token"}
                      </span>
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {tab === "otp" ? (
                    <motion.div key="otp" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-3">
                      {/* Step indicators */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black"
                            style={{ background: "#6366f1", color: "#fff" }}>1</div>
                          <span className="text-[11px] font-semibold text-[#9a8880]">Enter email</span>
                        </div>
                        <div className="flex-1 h-px bg-[#f0ece4]" />
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black"
                            style={{
                              background: otpSent ? "#6366f1" : "#f0ece4",
                              color: otpSent ? "#fff" : "#9a8880",
                            }}>2</div>
                          <span className="text-[11px] font-semibold text-[#9a8880]">Enter code</span>
                        </div>
                      </div>

                      {/* Email field — always visible */}
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c8b8a2]" />
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); if (otpSent) { setOtpSent(false); setOtpCode(""); } }}
                          onKeyDown={(e) => { if (e.key === "Enter" && !otpSent) handleSendOTP(); }}
                          disabled={otpSent}
                          className="w-full rounded-xl border border-[#f0ece4] bg-[#faf7f3] pl-10 pr-4 py-3 text-[13px] outline-none focus:border-[#6366f1]/40 focus:bg-white transition-colors disabled:opacity-60"
                        />
                      </div>

                      {/* OTP code field — slides in after code is sent */}
                      <AnimatePresence>
                        {otpSent && (
                          <motion.div
                            key="otp-code"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2 pt-1">
                              <p className="text-[11px] text-[#9a8880]">
                                Check your inbox — we sent a code to <strong className="text-[#1a1a1a]">{email}</strong>.{" "}
                                <button onClick={() => { setOtpSent(false); setOtpCode(""); setError(""); }}
                                  className="text-[#6366f1] font-semibold hover:underline">Change email</button>
                              </p>
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder="6-digit code"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                onKeyDown={(e) => { if (e.key === "Enter") handleVerifyOTP(); }}
                                className="w-full rounded-xl border border-[#f0ece4] bg-[#faf7f3] px-4 py-3 text-[18px] font-mono tracking-[0.3em] text-center outline-none focus:border-[#6366f1]/40 focus:bg-white transition-colors"
                                autoFocus
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Action button */}
                      {!otpSent ? (
                        <MotionButton onClick={handleSendOTP} disabled={loading}
                          className="w-full rounded-2xl py-3.5 font-bold text-white text-[14px] flex items-center justify-center gap-2 disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                          {loading ? "Sending code…" : "Send code"}
                        </MotionButton>
                      ) : (
                        <MotionButton onClick={handleVerifyOTP} disabled={loading || otpCode.length < 4}
                          className="w-full rounded-2xl py-3.5 font-bold text-white text-[14px] flex items-center justify-center gap-2 disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={3} />}
                          {loading ? "Verifying…" : "Verify & connect"}
                        </MotionButton>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="tok" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-2">
                      <div className="bg-[#eef2ff] rounded-xl p-3 space-y-1.5">
                        <p className="text-[11px] font-bold text-[#3730a3]">How to get your token:</p>
                        <ol className="text-[11px] text-[#4338ca] space-y-1 list-none">
                          <li>1. Open{" "}
                            <a href="https://rocket.new" target="_blank" rel="noreferrer"
                              className="font-bold underline">rocket.new</a>{" "}and log in
                          </li>
                          <li>2. Go to{" "}
                            <a href="https://rocket.new/settings" target="_blank" rel="noreferrer"
                              className="font-bold underline">rocket.new/settings</a>
                          </li>
                          <li>3. Find <strong>"API Key"</strong> or <strong>"Access Token"</strong> and copy it</li>
                        </ol>
                      </div>
                      <div className="relative">
                        <input
                          type={showTok ? "text" : "password"}
                          placeholder="Paste API token here…"
                          value={tok}
                          onChange={(e) => setTok(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleToken()}
                          className="w-full rounded-xl border border-[#f0ece4] bg-[#faf7f3] px-4 py-3 text-[13px] font-mono outline-none focus:border-[#6366f1]/40 pr-11"
                        />
                        <button onClick={() => setShowTok(!showTok)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c8b8a2]">
                          {showTok ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <MotionButton onClick={handleToken} disabled={loading}
                        className="w-full rounded-2xl py-3.5 font-bold text-white text-[14px] flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                        style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RocketLogo size={18} white />}
                        {loading ? "Connecting…" : "Connect Rocket.new"}
                      </MotionButton>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-xl p-3 mt-3">
                      <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
                      <p className="text-[12px] text-[#991b1b] font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
  const [showB44Modal, setShowB44Modal]   = useState(false);
  const [showRocketModal, setShowRocketModal] = useState(false);
  const [ghToken, setGhToken]     = useState("");
  const [showGhTok, setShowGhTok] = useState(false);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghUser, setGhUser]       = useState<{ login: string; name: string } | null>(null);
  const [branch, setBranch]       = useState("main");
  const [expandGh, setExpandGh]   = useState(false);

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

  const b44Connected    = !!creds.base44Token;
  const rocketConnected = !!creds.rocketToken;
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

  return (
    <AppShell>
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
                <StatusDot on={ghConnected} />
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ── Connections card ── */}
      <FadeUp delay={0.06}>
        <div className="bg-white rounded-[24px] border border-[#f0ece4] overflow-hidden mb-3">
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

          {/* Rocket.new row */}
          <div className="px-5 py-3.5" style={{ borderTop: "1px solid #f7f4f0" }}>
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-[11px] flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}
              >
                <RocketLogo size={18} white />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1a1a1a] leading-tight">Rocket.new</p>
                <AnimatePresence mode="wait">
                  {rocketConnected ? (
                    <motion.p key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[11px] text-[#9a8880] truncate mt-0.5">
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
                    style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                    Connect
                  </motion.button>
                )}
              </AnimatePresence>
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
                  <motion.a
                    href={`https://github.com/${ghUser.login}`} target="_blank" rel="noreferrer"
                    className="h-7 w-7 rounded-[9px] bg-[#faf7f3] border border-[#f0ece4] flex items-center justify-center text-[#9a8880]"
                    whileHover={{ scale: 1.08, background: "#1a1a1a", color: "#fff", borderColor: "#1a1a1a" }}
                    transition={{ type: "spring", stiffness: 360, damping: 28 }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </motion.a>
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
        <div className="bg-white rounded-[24px] border border-[#f0ece4] overflow-hidden mb-3">
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
    </AppShell>
  );
}
