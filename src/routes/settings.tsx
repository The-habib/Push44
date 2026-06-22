import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard, AvatarBubble } from "@/components/AppShell";
import { AnimatedCorner } from "@/components/AnimatedCorner";
import { FadeUp, StaggerContainer, StaggerItem, MotionButton, ScaleIn } from "@/components/PageTransition";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon, LogOut, Shield, Eye, EyeOff, Check, X, Loader2, ExternalLink, AlertCircle, Mail, Lock,
} from "lucide-react";
import { Base44Logo, GitHubLogo } from "@/components/BrandLogos";
import { useApp } from "@/contexts/AppContext";
import { base44Login, validateBase44Token } from "@/lib/base44-api";
import { getGitHubUser } from "@/lib/github-api";
import { Toaster, toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function Base44LoginModal({ onSuccess, onClose }: { onSuccess: (token: string, email: string, name: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"login" | "token">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rawToken, setRawToken] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) { setError("Enter your Base44 email"); return; }
    if (!password) { setError("Enter your password"); return; }
    setError(""); setLoading(true);
    try {
      const res = await base44Login({ data: { email: email.trim(), password } });
      setDone(true);
      setTimeout(() => onSuccess(res.token, res.email, res.name), 700);
    } catch (e: any) { setError(e.message ?? "Login failed."); }
    finally { setLoading(false); }
  };

  const handleToken = async () => {
    if (!rawToken.trim()) { setError("Paste your Base44 auth token"); return; }
    setError(""); setLoading(true);
    try {
      const info = await validateBase44Token({ data: { token: rawToken.trim() } });
      setDone(true);
      setTimeout(() => onSuccess(rawToken.trim(), info.email, info.name), 700);
    } catch (e: any) { setError("Invalid or expired token."); }
    finally { setLoading(false); }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      <motion.div
        className="relative z-10 w-full max-w-sm mx-4 mb-28 sm:mb-0 bg-white rounded-3xl shadow-2xl overflow-hidden"
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
      >
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
            <Base44Logo size={28} white />
          </div>
          <div className="flex-1">
            <div className="text-base font-extrabold text-black">Connect to Base44</div>
            <div className="text-xs text-black/50">Sign in to access your apps</div>
          </div>
          <motion.button onClick={onClose} className="h-8 w-8 rounded-full bg-[#f3f2ee] flex items-center justify-center text-black/40"
            whileHover={{ scale: 1.1, backgroundColor: "#fee2e2", color: "#ef4444" }} whileTap={{ scale: 0.9 }}>
            <X className="h-4 w-4" />
          </motion.button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-start gap-2.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-3.5">
            <Shield className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#166534] leading-snug font-medium">
              Your password is sent directly to Base44 and never stored — only the returned session token is saved in your browser.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 py-6">
                <motion.div className="h-16 w-16 rounded-full bg-[#dcfce7] flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Check className="h-9 w-9 text-[#22c55e]" strokeWidth={3} />
                </motion.div>
                <p className="text-sm font-bold text-black">Connected!</p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex bg-[#f3f2ee] rounded-2xl p-1 mb-4">
                  {(["login", "token"] as const).map((t) => (
                    <motion.button key={t} onClick={() => { setTab(t); setError(""); }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative`}
                      whileTap={{ scale: 0.97 }}>
                      {tab === t && (
                        <motion.div layoutId="modal-tab" className="absolute inset-0 rounded-xl bg-white shadow-sm"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                      )}
                      <span className={`relative z-10 ${tab === t ? "text-black" : "text-black/40"}`}>
                        {t === "login" ? "Email & Password" : "Auth Token"}
                      </span>
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {tab === "login" ? (
                    <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                        <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                          className="w-full rounded-2xl border border-[#eee] bg-[#f7f6f1] pl-10 pr-4 py-3.5 text-sm outline-none focus:border-[#f97316]" />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                        <input type={showPw ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                          className="w-full rounded-2xl border border-[#eee] bg-[#f7f6f1] pl-10 pr-11 py-3.5 text-sm outline-none focus:border-[#f97316]" />
                        <button onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="token" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-1.5">
                      <p className="text-[11px] text-black/40 leading-relaxed">Get your token from <a href="https://app.base44.com/settings" target="_blank" rel="noreferrer" className="text-[#f97316] font-semibold underline">app.base44.com/settings</a> → API Keys.</p>
                      <div className="relative">
                        <input type={showRaw ? "text" : "password"} placeholder="Paste token here…" value={rawToken} onChange={(e) => setRawToken(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleToken()}
                          className="w-full rounded-2xl border border-[#eee] bg-[#f7f6f1] px-4 pr-11 py-3.5 text-sm font-mono outline-none focus:border-[#f97316]" />
                        <button onClick={() => setShowRaw(!showRaw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30">{showRaw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="flex items-start gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-2xl p-3 mt-3">
                      <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
                      <p className="text-[12px] text-[#991b1b] font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <MotionButton
                  onClick={tab === "login" ? handleLogin : handleToken}
                  disabled={loading}
                  className="w-full rounded-3xl py-4 font-bold text-white text-[15px] flex items-center justify-center gap-2 disabled:opacity-60 mt-4"
                  style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Base44Logo size={20} white />}
                  {loading ? "Connecting…" : "Connect to Base44"}
                </MotionButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button onClick={() => onChange(!on)}
      className={`h-6 w-11 rounded-full p-0.5 transition-colors ${on ? "bg-[#8b5cf6]" : "bg-[#e5e5e5]"}`}
      whileTap={{ scale: 0.92 }}>
      <motion.span className="block h-5 w-5 rounded-full bg-white shadow"
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}

function StatusBadge({ connected }: { connected: boolean }) {
  return connected ? (
    <motion.span className="flex items-center gap-1 text-[#22c55e] text-xs font-semibold"
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
      <Check className="h-3.5 w-3.5" strokeWidth={3} /> Connected
    </motion.span>
  ) : (
    <motion.span className="flex items-center gap-1 text-[#ef4444] text-xs font-semibold"
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
      <X className="h-3.5 w-3.5" strokeWidth={3} /> Not connected
    </motion.span>
  );
}

function SettingsPage() {
  const { creds, updateCreds, signOut, isLoaded } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [ghToken, setGhToken] = useState("");
  const [showGhToken, setShowGhToken] = useState(false);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghUser, setGhUser] = useState<{ login: string; name: string } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [defaultBranch, setDefaultBranch] = useState("main");

  useEffect(() => {
    if (!isLoaded) return;
    if (creds.githubToken) setGhToken(creds.githubToken);
    if (creds.defaultBranch) setDefaultBranch(creds.defaultBranch);
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || !creds.githubToken) return;
    getGitHubUser({ data: { token: creds.githubToken } })
      .then((u) => setGhUser({ login: u.login, name: u.name }))
      .catch(() => setGhUser(null));
  }, [isLoaded, creds.githubToken]);

  const handleBase44Success = (token: string, email: string, name: string) => {
    updateCreds({ base44Token: token, base44Email: email || name });
    setTimeout(() => setShowLoginModal(false), 800);
    toast.success(`Connected as ${email || name || "Base44 user"}`);
  };

  const connectGitHub = async () => {
    if (!ghToken.trim()) { toast.error("Enter your GitHub Personal Access Token"); return; }
    setGhLoading(true);
    try {
      const user = await getGitHubUser({ data: { token: ghToken.trim() } });
      updateCreds({ githubToken: ghToken.trim(), githubUsername: user.login, defaultOwner: user.login });
      setGhUser({ login: user.login, name: user.name });
      toast.success(`GitHub connected as ${user.login}`);
    } catch (e: any) { toast.error(e.message ?? "Invalid GitHub token"); }
    finally { setGhLoading(false); }
  };

  const isBase44Connected = !!creds.base44Token;
  const isGitHubConnected = !!creds.githubToken && !!ghUser;

  return (
    <AppShell>
      <AnimatedCorner variant="settings" />
      <Toaster position="top-center" richColors />

      <AnimatePresence>
        {showLoginModal && (
          <Base44LoginModal onSuccess={handleBase44Success} onClose={() => setShowLoginModal(false)} />
        )}
      </AnimatePresence>

      <div className="relative z-10">
        {/* Profile hero */}
        <FadeUp delay={0.05}>
          <section className="relative rounded-[32px] px-6 py-6 overflow-hidden mb-5" style={{ backgroundColor: "#e9e4f8" }}>
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: "radial-gradient(circle at 70% 30%, #8b5cf6 0%, transparent 60%)" }}
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative flex items-center gap-4">
              <motion.div
                className="ring-4 ring-white/80 rounded-full shrink-0"
                whileHover={{ scale: 1.06 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <AvatarBubble name={creds.displayName || creds.base44Email || creds.githubUsername || ""} size={72} fontSize={24} />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-extrabold text-black truncate">{creds.displayName || creds.base44Email || "Not signed in"}</h2>
                {ghUser && <p className="text-[12px] text-black/50 truncate mt-0.5">@{ghUser.login} on GitHub</p>}
                <div className="flex gap-1.5 mt-2.5 flex-wrap">
                  <motion.span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2.5 py-1 ${isBase44Connected ? "bg-[#f97316] text-white" : "bg-black/10 text-black/40"}`}
                    animate={isBase44Connected ? { scale: [1, 1.04, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isBase44Connected ? "bg-white/70" : "bg-black/30"}`} />
                    Base44
                  </motion.span>
                  <motion.span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2.5 py-1 ${isGitHubConnected ? "bg-[#1a1a1a] text-white" : "bg-black/10 text-black/40"}`}
                    animate={isGitHubConnected ? { scale: [1, 1.04, 1] } : {}}
                    transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isGitHubConnected ? "bg-white/70" : "bg-black/30"}`} />
                    GitHub
                  </motion.span>
                </div>
              </div>
            </div>
          </section>
        </FadeUp>

        {/* Base44 Account */}
        <FadeUp delay={0.12}>
          <SectionCard title="Base44 Account">
            <div className="flex items-center justify-between mb-4">
              <StatusBadge connected={isBase44Connected} />
              {isBase44Connected && (
                <MotionButton onClick={() => { updateCreds({ base44Token: "", base44Email: "" }); toast.success("Base44 disconnected"); }}
                  className="text-xs text-[#ef4444] font-semibold">
                  Disconnect
                </MotionButton>
              )}
            </div>
            <AnimatePresence mode="wait">
              {isBase44Connected ? (
                <motion.div key="connected" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3 rounded-2xl p-4" style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)" }}>
                  <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                    <Base44Logo size={28} white />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-black truncate">{creds.base44Email || "Connected"}</div>
                    <div className="text-[11px] text-black/50">Authenticated via Base44</div>
                  </div>
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                    <Check className="h-5 w-5 text-[#f97316] shrink-0" strokeWidth={3} />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="disconnected" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <MotionButton onClick={() => setShowLoginModal(true)}
                    className="w-full rounded-3xl py-4 font-bold text-white text-[15px] flex items-center justify-center gap-2.5"
                    style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                    <Base44Logo size={20} white />Login with Base44
                  </MotionButton>
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>
        </FadeUp>

        {/* GitHub Account */}
        <FadeUp delay={0.18}>
          <SectionCard title="GitHub Account">
            <div className="flex items-center justify-between mb-4">
              <StatusBadge connected={isGitHubConnected} />
              {isGitHubConnected && (
                <MotionButton onClick={() => { updateCreds({ githubToken: "", githubUsername: "" }); setGhUser(null); toast.success("GitHub disconnected"); }}
                  className="text-xs text-[#ef4444] font-semibold">
                  Disconnect
                </MotionButton>
              )}
            </div>
            <AnimatePresence mode="wait">
              {isGitHubConnected && ghUser ? (
                <motion.div key="gh-connected" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3 rounded-2xl bg-[#f3f2ee] p-4">
                  <div className="h-11 w-11 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                    <GitHubLogo className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-black truncate">{ghUser.name}</div>
                    <div className="text-[11px] text-black/50">@{ghUser.login}</div>
                  </div>
                  <motion.a href={`https://github.com/${ghUser.login}`} target="_blank" rel="noreferrer"
                    className="text-black/30" whileHover={{ scale: 1.2, color: "#1a1a1a" }}>
                    <ExternalLink className="h-4 w-4" />
                  </motion.a>
                </motion.div>
              ) : (
                <motion.div key="gh-disconnected" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                  <p className="text-[12px] text-black/50 leading-relaxed">
                    Create a token at <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noreferrer" className="text-[#8b5cf6] font-semibold underline">github.com/settings/tokens</a> with <strong>repo</strong> scope.
                  </p>
                  <div className="relative">
                    <input type={showGhToken ? "text" : "password"} placeholder="ghp_xxxxxxxxxxxx" value={ghToken}
                      onChange={(e) => setGhToken(e.target.value)} onKeyDown={(e) => e.key === "Enter" && connectGitHub()}
                      className="w-full rounded-2xl border border-[#eee] bg-[#f7f6f1] px-4 py-3.5 text-sm font-mono outline-none focus:border-[#1a1a1a] pr-11" />
                    <button onClick={() => setShowGhToken(!showGhToken)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/40">
                      {showGhToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <MotionButton onClick={connectGitHub} disabled={ghLoading}
                    className="w-full bg-[#1a1a1a] text-white font-bold text-sm py-3.5 rounded-3xl flex items-center justify-center gap-2 disabled:opacity-60">
                    {ghLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitHubLogo className="h-4 w-4" />}
                    {ghLoading ? "Connecting…" : "Connect GitHub"}
                  </MotionButton>
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>
        </FadeUp>

        {/* Defaults */}
        <FadeUp delay={0.24}>
          <SectionCard title="Push Defaults">
            <label className="text-xs font-semibold text-black/50 mb-1.5 block">Default branch</label>
            <input value={defaultBranch} onChange={(e) => setDefaultBranch(e.target.value)} onBlur={() => updateCreds({ defaultBranch })}
              placeholder="main" className="w-full rounded-2xl border border-[#eee] bg-[#f7f6f1] px-4 py-3 text-sm outline-none focus:border-[#8b5cf6]" />
          </SectionCard>
        </FadeUp>

        {/* Preferences */}
        <FadeUp delay={0.28}>
          <SectionCard title="Preferences">
            <div className="flex items-center gap-3 py-1">
              <div className="h-10 w-10 rounded-xl bg-[#e9e4f8] flex items-center justify-center">
                <Moon className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-black">Dark Mode</div>
                <div className="text-[11px] text-black/50">Coming soon</div>
              </div>
              <Toggle on={darkMode} onChange={setDarkMode} />
            </div>
          </SectionCard>
        </FadeUp>

        {/* Security */}
        <FadeUp delay={0.32}>
          <SectionCard title="Privacy & Security">
            <div className="rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] p-4 text-[12px] text-[#166534] leading-relaxed flex gap-2.5">
              <Shield className="h-4 w-4 shrink-0 mt-0.5 text-[#22c55e]" />
              <span>Your password is never stored. Only the session token returned by Base44 is saved — in your browser only, never on any server.</span>
            </div>
          </SectionCard>
        </FadeUp>

        <FadeUp delay={0.36}>
          <MotionButton
            onClick={() => { signOut(); setGhUser(null); toast.success("Signed out"); }}
            className="w-full bg-white rounded-3xl py-4 flex items-center justify-center gap-2 text-[#ef4444] font-bold text-sm mb-3 border border-[#fecaca]"
          >
            <LogOut className="h-4 w-4" />Sign Out
          </MotionButton>
          <p className="text-center text-[11px] text-black/40 font-medium">Push44 · v2.0.0</p>
        </FadeUp>
      </div>
    </AppShell>
  );
}
