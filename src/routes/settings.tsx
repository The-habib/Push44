import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard, AvatarBubble } from "@/components/AppShell";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, MotionButton } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Shield, Eye, EyeOff, Check, X, Loader2,
  ExternalLink, AlertCircle, Mail, Lock,
} from "lucide-react";
import { Base44Logo, GitHubLogo } from "@/components/BrandLogos";
import { useApp } from "@/contexts/AppContext";
import { base44Login, validateBase44Token } from "@/lib/base44-api";
import { getGitHubUser } from "@/lib/github-api";
import { Toaster, toast } from "sonner";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function StatusDot({ on }: { on: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${on ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-[#22c55e]" : "bg-[#ef4444]"}`} />
      {on ? "Connected" : "Not connected"}
    </span>
  );
}

function Base44Modal({ onSuccess, onClose }: { onSuccess: (t: string, e: string, n: string) => void; onClose: () => void }) {
  const [tab, setTab]       = useState<"login" | "token">("login");
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState(""); const [showPw, setShowPw] = useState(false);
  const [tok, setTok]       = useState(""); const [showTok, setShowTok] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [done, setDone]     = useState(false);

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
      <motion.div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-sm mx-4 mb-24 sm:mb-0 bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#f0ece4]"
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        <div className="flex items-center gap-3 px-6 pt-6 pb-5">
          <div className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
            style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
            <Base44Logo size={24} white />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-black text-[#1a1a1a]">Connect Base44</div>
            <div className="text-[12px] text-[#9a8880]">Sign in to access your apps</div>
          </div>
          <motion.button onClick={onClose}
            className="h-8 w-8 rounded-xl bg-[#faf7f3] flex items-center justify-center text-[#9a8880]"
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
            <X className="h-4 w-4" />
          </motion.button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-start gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-3">
            <Shield className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#166534] font-medium leading-snug">Your password goes directly to Base44 — never stored here.</p>
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2 py-8">
                <div className="h-14 w-14 rounded-full bg-[#fff4ed] flex items-center justify-center">
                  <Check className="h-8 w-8 text-[#f97316]" strokeWidth={3} />
                </div>
                <p className="text-[14px] font-bold text-[#1a1a1a]">Connected!</p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex bg-[#faf7f3] rounded-xl p-1 mb-4">
                  {(["login", "token"] as const).map((t) => (
                    <motion.button key={t} onClick={() => { setTab(t); setError(""); }}
                      className="flex-1 py-2 rounded-lg text-[12px] font-bold relative" whileTap={{ scale: 0.97 }}>
                      {tab === t && <motion.div layoutId="modal-tab" className="absolute inset-0 rounded-lg bg-white shadow-sm border border-[#f0ece4]" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                      <span className={`relative z-10 ${tab === t ? "text-[#1a1a1a]" : "text-[#9a8880]"}`}>
                        {t === "login" ? "Email & Password" : "Auth Token"}
                      </span>
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {tab === "login" ? (
                    <motion.div key="login" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-2.5">
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c8b8a2]" />
                        <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
                          className="w-full rounded-xl border border-[#f0ece4] bg-[#faf7f3] pl-10 pr-4 py-3 text-[13px] outline-none focus:border-[#f97316]/50" />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c8b8a2]" />
                        <input type={showPw ? "text" : "password"} placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
                          className="w-full rounded-xl border border-[#f0ece4] bg-[#faf7f3] pl-10 pr-11 py-3 text-[13px] outline-none focus:border-[#f97316]/50" />
                        <button onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c8b8a2]">
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="token" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-2">
                      <p className="text-[11px] text-[#9a8880]">Get your token from <a href="https://app.base44.com/settings" target="_blank" rel="noreferrer" className="text-[#f97316] font-semibold">app.base44.com/settings</a></p>
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

function SettingsPage() {
  const { creds, updateCreds, signOut, isLoaded } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [ghToken, setGhToken]     = useState("");
  const [showGhTok, setShowGhTok] = useState(false);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghUser, setGhUser]       = useState<{ login: string; name: string } | null>(null);
  const [branch, setBranch]       = useState("main");

  useEffect(() => {
    if (!isLoaded) return;
    if (creds.githubToken) setGhToken(creds.githubToken);
    if (creds.defaultBranch) setBranch(creds.defaultBranch);
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || !creds.githubToken) return;
    getGitHubUser({ data: { token: creds.githubToken } }).then((u) => setGhUser({ login: u.login, name: u.name })).catch(() => setGhUser(null));
  }, [isLoaded, creds.githubToken]);

  const b44Connected = !!creds.base44Token;
  const ghConnected  = !!creds.githubToken && !!ghUser;

  const connectGitHub = async () => {
    if (!ghToken.trim()) { toast.error("Enter your GitHub token"); return; }
    setGhLoading(true);
    try {
      const user = await getGitHubUser({ data: { token: ghToken.trim() } });
      updateCreds({ githubToken: ghToken.trim(), githubUsername: user.login, defaultOwner: user.login });
      setGhUser({ login: user.login, name: user.name });
      toast.success(`GitHub connected as @${user.login}`);
    } catch (e: any) { toast.error(e.message ?? "Invalid token"); }
    finally { setGhLoading(false); }
  };

  return (
    <AppShell>
      <AnimatedCorner variant="settings" />
      <Toaster position="top-center" richColors />

      <AnimatePresence>
        {showModal && (
          <Base44Modal
            onSuccess={(t, e, n) => { updateCreds({ base44Token: t, base44Email: e }); setShowModal(false); toast.success(`Connected as ${e || n}`); }}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Profile */}
      <FadeUp>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <AvatarBubble name={creds.displayName || creds.base44Email || creds.githubUsername || ""} size={64} fontSize={22} />
            <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#22c55e] ring-2 ring-[#faf7f3]" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-black text-[#1a1a1a] truncate">{creds.displayName || creds.base44Email || "Settings"}</h1>
            {ghUser && <p className="text-[12px] text-[#9a8880] mt-0.5">@{ghUser.login} on GitHub</p>}
          </div>
        </div>
      </FadeUp>

      {/* Base44 */}
      <FadeUp delay={0.07}>
        <SectionCard title="Base44 Account">
          <div className="flex items-center justify-between mb-4">
            <StatusDot on={b44Connected} />
            {b44Connected && (
              <MotionButton onClick={() => { updateCreds({ base44Token: "", base44Email: "" }); toast.success("Base44 disconnected"); }}
                className="text-[12px] text-[#ef4444] font-semibold">Disconnect</MotionButton>
            )}
          </div>
          <AnimatePresence mode="wait">
            {b44Connected ? (
              <motion.div key="on" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-[#fff4ed] rounded-2xl p-3.5 border border-[#f97316]/15">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                  <Base44Logo size={24} white />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-[#1a1a1a] truncate">{creds.base44Email || "Connected"}</div>
                  <div className="text-[11px] text-[#9a8880]">Authenticated via Base44</div>
                </div>
                <Check className="h-4 w-4 text-[#f97316]" strokeWidth={3} />
              </motion.div>
            ) : (
              <motion.div key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MotionButton onClick={() => setShowModal(true)}
                  className="w-full rounded-2xl py-3.5 font-bold text-white text-[14px] flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                  <Base44Logo size={18} white />Login with Base44
                </MotionButton>
              </motion.div>
            )}
          </AnimatePresence>
        </SectionCard>
      </FadeUp>

      {/* GitHub */}
      <FadeUp delay={0.12}>
        <SectionCard title="GitHub Account">
          <div className="flex items-center justify-between mb-4">
            <StatusDot on={ghConnected} />
            {ghConnected && (
              <MotionButton onClick={() => { updateCreds({ githubToken: "", githubUsername: "" }); setGhUser(null); toast.success("GitHub disconnected"); }}
                className="text-[12px] text-[#ef4444] font-semibold">Disconnect</MotionButton>
            )}
          </div>
          <AnimatePresence mode="wait">
            {ghConnected && ghUser ? (
              <motion.div key="on" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-[#faf7f3] rounded-2xl p-3.5 border border-[#f0ece4]">
                <div className="h-10 w-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center shrink-0">
                  <GitHubLogo className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-[#1a1a1a] truncate">{ghUser.name || ghUser.login}</div>
                  <div className="text-[11px] text-[#9a8880]">@{ghUser.login}</div>
                </div>
                <motion.a href={`https://github.com/${ghUser.login}`} target="_blank" rel="noreferrer"
                  className="text-[#c8b8a2]" whileHover={{ scale: 1.2, color: "#1a1a1a" }}>
                  <ExternalLink className="h-4 w-4" />
                </motion.a>
              </motion.div>
            ) : (
              <motion.div key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <p className="text-[12px] text-[#9a8880] leading-relaxed">
                  Create a token at{" "}
                  <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noreferrer"
                    className="text-[#f97316] font-semibold">github.com/settings/tokens</a>{" "}
                  with <strong>repo</strong> scope.
                </p>
                <div className="relative">
                  <input type={showGhTok ? "text" : "password"} placeholder="ghp_xxxxxxxxxxxx" value={ghToken}
                    onChange={(e) => setGhToken(e.target.value)} onKeyDown={(e) => e.key === "Enter" && connectGitHub()}
                    className="w-full rounded-2xl border border-[#f0ece4] bg-[#faf7f3] px-4 py-3 text-[13px] font-mono outline-none focus:border-[#f97316]/40 pr-11" />
                  <button onClick={() => setShowGhTok(!showGhTok)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c8b8a2]">
                    {showGhTok ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <MotionButton onClick={connectGitHub} disabled={ghLoading}
                  className="w-full bg-[#1a1a1a] text-white font-bold text-[13px] py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50">
                  {ghLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitHubLogo className="h-4 w-4" />}
                  {ghLoading ? "Connecting…" : "Connect GitHub"}
                </MotionButton>
              </motion.div>
            )}
          </AnimatePresence>
        </SectionCard>
      </FadeUp>

      {/* Defaults */}
      <FadeUp delay={0.17}>
        <SectionCard title="Push Defaults">
          <label className="text-[11px] font-semibold text-[#9a8880] mb-1.5 block uppercase tracking-wide">Default branch</label>
          <input value={branch} onChange={(e) => setBranch(e.target.value)} onBlur={() => updateCreds({ defaultBranch: branch })}
            placeholder="main" className="w-full rounded-xl border border-[#f0ece4] bg-[#faf7f3] px-4 py-3 text-[13px] outline-none focus:border-[#f97316]/40" />
        </SectionCard>
      </FadeUp>

      {/* Privacy */}
      <FadeUp delay={0.25}>
        <SectionCard title="Privacy">
          <div className="flex gap-2.5 text-[12px] text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-3.5 leading-relaxed">
            <Shield className="h-4 w-4 shrink-0 mt-0.5 text-[#22c55e]" />
            <span>Your credentials are stored only in your browser — never sent to any server.</span>
          </div>
        </SectionCard>
      </FadeUp>

      {/* Sign out */}
      <FadeUp delay={0.25}>
        <MotionButton
          onClick={() => { signOut(); setGhUser(null); toast.success("Signed out"); }}
          className="w-full bg-white border-2 border-[#fca5a5] text-[#dc2626] font-bold text-[13px] rounded-2xl py-3.5 flex items-center justify-center gap-2 mb-3 shadow-sm">
          <LogOut className="h-4 w-4" />Sign Out
        </MotionButton>
        <p className="text-center text-[11px] text-[#9a8880] font-medium">Push44 · v2.0</p>
      </FadeUp>
    </AppShell>
  );
}
