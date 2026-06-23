import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2, Mail, AlertCircle, Eye, EyeOff, Zap } from "lucide-react";
import { RocketLogo } from "@/components/BrandLogos";
import { MotionButton } from "@/components/PageTransition";
import { rocketRequestOTP, rocketVerifyOTP, validateRocketToken } from "@/lib/rocket-api";

const R_GRAD   = "linear-gradient(135deg,#9810fa,#7008e7)";
const R_COLOR  = "#7f22fe";
const R_LIGHT  = "#f5f3ff";
const R_BORDER = "#ede9fe";
const R_TEXT   = "#6e11b0";
const R_MUTED  = "#c4b5fd";
const R_SHADOW = "rgba(127,34,254,0.35)";

interface Props {
  onSuccess: (token: string, email: string, name: string, companyId: string) => void;
  onClose: () => void;
  defaultTab?: "otp" | "token";
}

export function RocketModal({ onSuccess, onClose, defaultTab = "token" }: Props) {
  const [tab, setTab]         = useState<"otp" | "token">(defaultTab);
  const [email, setEmail]     = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [tok, setTok]         = useState("");
  const [showTok, setShowTok] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

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
      <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-sm mx-4 mb-24 sm:mb-0 bg-white rounded-[28px] shadow-2xl overflow-hidden"
        style={{ boxShadow: `0 24px 64px rgba(127,34,254,0.18), 0 4px 16px rgba(0,0,0,0.08)` }}
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        {/* Electric violet header strip */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#9810fa,#7f22fe,#7008e7,transparent)" }} />

        {/* Header */}
        <div
          className="px-6 pt-5 pb-5 border-b"
          style={{ background: "linear-gradient(135deg,#f5f3ff 0%,#faf5ff 60%,#fff 100%)", borderColor: R_BORDER }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
              style={{ background: R_GRAD }}
            >
              <div
                className="absolute inset-0 rounded-2xl"
                style={{ background: "radial-gradient(circle at 35% 35%,rgba(255,255,255,0.22),transparent 65%)" }}
              />
              <RocketLogo size={26} white />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <div className="text-[15px] font-black text-[#1a1a1a]">Connect</div>
                <div className="text-[15px] font-black" style={{ color: R_COLOR }}>Rocket.new</div>
              </div>
              <div className="text-[11px] font-medium mt-0.5" style={{ color: R_TEXT, opacity: 0.7 }}>
                Access your Flutter &amp; web projects
              </div>
            </div>
            <motion.button onClick={onClose}
              className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `rgba(127,34,254,0.08)`, color: R_COLOR }}
              whileHover={{ scale: 1.08, background: `rgba(127,34,254,0.16)` }}
              whileTap={{ scale: 0.9 }}>
              <X className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Privacy notice */}
          <div className="flex items-start gap-2 rounded-2xl p-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <div className="h-4 w-4 rounded-full bg-[#22c55e] flex items-center justify-center shrink-0 mt-0.5">
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </div>
            <p className="text-[11px] text-[#166534] font-medium leading-snug">
              Your credentials go directly to Rocket.new — nothing is stored on our servers.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-10">
                <div
                  className="rounded-full flex items-center justify-center relative"
                  style={{
                    background: R_GRAD,
                    boxShadow: `0 8px 32px rgba(127,34,254,0.45)`,
                    width: 72, height: 72,
                  }}>
                  <Check className="h-9 w-9 text-white" strokeWidth={3} />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-black text-[#1a1a1a]">Connected!</p>
                  <p className="text-[12px] mt-0.5" style={{ color: R_COLOR }}>Rocket.new is ready to push</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Tab switcher */}
                <div className="flex rounded-xl p-1 mb-4 gap-1" style={{ background: R_LIGHT }}>
                  {(["otp", "token"] as const).map((t) => (
                    <motion.button key={t}
                      onClick={() => { setTab(t); setError(""); setOtpSent(false); setOtpCode(""); }}
                      className="flex-1 py-2 rounded-lg text-[12px] font-bold relative"
                      whileTap={{ scale: 0.97 }}>
                      {tab === t && (
                        <motion.div layoutId="rocket-modal-tab"
                          className="absolute inset-0 rounded-lg shadow-sm"
                          style={{ background: R_GRAD }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                      )}
                      <span className={`relative z-10 flex items-center justify-center gap-1.5 ${tab === t ? "text-white" : ""}`}
                        style={tab !== t ? { color: R_COLOR } : undefined}>
                        {t === "otp" ? <Mail className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                        {t === "otp" ? "Email Code" : "API Token"}
                      </span>
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {tab === "otp" ? (
                    <motion.div key="otp" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-3">
                      {/* Step indicators */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                            style={{ background: R_GRAD }}>1</div>
                          <span className="text-[11px] font-semibold" style={{ color: R_COLOR }}>Enter email</span>
                        </div>
                        <div className="flex-1 h-px" style={{ background: `linear-gradient(to right,${R_MUTED},${R_BORDER})` }} />
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black"
                            style={{
                              background: otpSent ? R_GRAD : R_BORDER,
                              color: otpSent ? "#fff" : R_MUTED,
                            }}>2</div>
                          <span className="text-[11px] font-semibold" style={{ color: otpSent ? R_COLOR : R_MUTED }}>Enter code</span>
                        </div>
                      </div>

                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: R_MUTED }} />
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); if (otpSent) { setOtpSent(false); setOtpCode(""); } }}
                          onKeyDown={(e) => { if (e.key === "Enter" && !otpSent) handleSendOTP(); }}
                          disabled={otpSent}
                          className="w-full rounded-xl border pl-10 pr-4 py-3 text-[13px] outline-none transition-colors disabled:opacity-60"
                          style={{ borderColor: R_BORDER, background: R_LIGHT }}
                          onFocus={(e) => e.target.style.borderColor = R_COLOR}
                          onBlur={(e) => e.target.style.borderColor = R_BORDER}
                        />
                      </div>

                      <AnimatePresence>
                        {otpSent && (
                          <motion.div key="otp-code" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="space-y-2 pt-1">
                              <p className="text-[11px] text-[#9a8880]">
                                Check your inbox — code sent to <strong className="text-[#1a1a1a]">{email}</strong>.{" "}
                                <button onClick={() => { setOtpSent(false); setOtpCode(""); setError(""); }}
                                  className="font-semibold hover:underline" style={{ color: R_COLOR }}>Change</button>
                              </p>
                              <input
                                type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="• • • • • •"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                onKeyDown={(e) => { if (e.key === "Enter") handleVerifyOTP(); }}
                                className="w-full rounded-xl border px-4 py-3 text-[20px] font-mono tracking-[0.5em] text-center outline-none transition-colors"
                                style={{ borderColor: R_BORDER, background: R_LIGHT, color: R_COLOR }}
                                autoFocus
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!otpSent ? (
                        <MotionButton onClick={handleSendOTP} disabled={loading}
                          className="w-full rounded-2xl py-3.5 font-bold text-white text-[14px] flex items-center justify-center gap-2 disabled:opacity-50"
                          style={{ background: R_GRAD, boxShadow: R_SHADOW }}>
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                          {loading ? "Sending code…" : "Send code →"}
                        </MotionButton>
                      ) : (
                        <MotionButton onClick={handleVerifyOTP} disabled={loading || otpCode.length < 4}
                          className="w-full rounded-2xl py-3.5 font-bold text-white text-[14px] flex items-center justify-center gap-2 disabled:opacity-50"
                          style={{ background: R_GRAD, boxShadow: R_SHADOW }}>
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={3} />}
                          {loading ? "Verifying…" : "Verify & connect"}
                        </MotionButton>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="tok" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-3">
                      <div className="rounded-xl p-3 space-y-1.5" style={{ background: R_LIGHT, border: `1px solid ${R_BORDER}` }}>
                        <p className="text-[11px] font-bold" style={{ color: R_TEXT }}>How to get your API token:</p>
                        <ol className="text-[11px] space-y-1 list-none" style={{ color: R_COLOR }}>
                          <li>1. Open <a href="https://rocket.new" target="_blank" rel="noreferrer" className="font-bold underline">rocket.new</a> and log in</li>
                          <li>2. Go to <a href="https://rocket.new/settings" target="_blank" rel="noreferrer" className="font-bold underline">rocket.new/settings</a></li>
                          <li>3. Find <strong>"API Key"</strong> or <strong>"Access Token"</strong> and copy it</li>
                        </ol>
                      </div>
                      <div className="relative">
                        <input
                          type={showTok ? "text" : "password"} placeholder="Paste API token here…"
                          value={tok} onChange={(e) => setTok(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleToken()}
                          className="w-full rounded-xl border px-4 py-3 text-[13px] font-mono outline-none pr-11 transition-colors"
                          style={{ borderColor: R_BORDER, background: R_LIGHT }}
                          onFocus={(e) => e.target.style.borderColor = R_COLOR}
                          onBlur={(e) => e.target.style.borderColor = R_BORDER}
                        />
                        <button onClick={() => setShowTok(!showTok)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: R_MUTED }}>
                          {showTok ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <MotionButton onClick={handleToken} disabled={loading}
                        className="w-full rounded-2xl py-3.5 font-bold text-white text-[14px] flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{ background: R_GRAD, boxShadow: R_SHADOW }}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RocketLogo size={18} white />}
                        {loading ? "Connecting…" : "Connect Rocket.new"}
                      </MotionButton>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-2 rounded-xl p-3 mt-3"
                      style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
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
