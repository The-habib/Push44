import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { useState, useEffect } from "react";
import {
  Github,
  Moon,
  LogOut,
  Shield,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  User,
  ExternalLink,
  AlertCircle,
  Mail,
  Lock,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { base44Login, validateBase44Token } from "@/lib/base44-api";
import { getGitHubUser } from "@/lib/github-api";
import { Toaster, toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Base44 Push" },
      { name: "description", content: "Manage your account and preferences." },
    ],
  }),
  component: SettingsPage,
});

// ─── Base44 Login Modal ───────────────────────────────────────────────────────

function Base44LoginModal({
  onSuccess,
  onClose,
}: {
  onSuccess: (token: string, email: string, name: string) => void;
  onClose: () => void;
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

  const handleLogin = async () => {
    if (!email.trim()) { setError("Enter your Base44 email"); return; }
    if (!password) { setError("Enter your password"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await base44Login({ data: { email: email.trim(), password } });
      setDone(true);
      setTimeout(() => onSuccess(res.token, res.email, res.name), 700);
    } catch (e: any) {
      setError(e.message ?? "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleToken = async () => {
    if (!rawToken.trim()) { setError("Paste your Base44 auth token"); return; }
    setError("");
    setLoading(true);
    try {
      const info = await validateBase44Token({ data: { token: rawToken.trim() } });
      setDone(true);
      setTimeout(() => onSuccess(rawToken.trim(), info.email, info.name), 700);
    } catch (e: any) {
      setError("Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4 mb-28 sm:mb-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <div
            className="h-11 w-11 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
              <ellipse cx="12" cy="12" rx="10" ry="3" />
              <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(60 12 12)" />
              <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(120 12 12)" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-base font-extrabold text-black">Connect to Base44</div>
            <div className="text-xs text-black/50">Sign in to access your apps</div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-[#f3f2ee] flex items-center justify-center text-black/40 hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Security note */}
          <div className="flex items-start gap-2.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-3.5">
            <Shield className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#166534] leading-snug font-medium">
              Your password is sent directly to Base44 and never stored — only
              the returned session token is saved in your browser.
            </p>
          </div>

          {done ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="h-16 w-16 rounded-full bg-[#dcfce7] flex items-center justify-center">
                <Check className="h-9 w-9 text-[#22c55e]" strokeWidth={3} />
              </div>
              <p className="text-sm font-bold text-black">Connected!</p>
            </div>
          ) : (
            <>
              {/* Tab switcher */}
              <div className="flex bg-[#f3f2ee] rounded-2xl p-1">
                {(["login", "token"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(""); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      tab === t
                        ? "bg-white text-black shadow-sm"
                        : "text-black/40"
                    }`}
                  >
                    {t === "login" ? "Email & Password" : "Auth Token"}
                  </button>
                ))}
              </div>

              {tab === "login" && (
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      className="w-full rounded-2xl border border-[#eee] bg-[#f7f6f1] pl-10 pr-4 py-3.5 text-sm outline-none focus:border-[#f97316]"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      className="w-full rounded-2xl border border-[#eee] bg-[#f7f6f1] pl-10 pr-11 py-3.5 text-sm outline-none focus:border-[#f97316]"
                    />
                    <button
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {tab === "token" && (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-black/40 leading-relaxed">
                    Get your token from{" "}
                    <a
                      href="https://app.base44.com/settings"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#f97316] font-semibold underline"
                    >
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
                      onKeyDown={(e) => e.key === "Enter" && handleToken()}
                      className="w-full rounded-2xl border border-[#eee] bg-[#f7f6f1] px-4 pr-11 py-3.5 text-sm font-mono outline-none focus:border-[#f97316]"
                    />
                    <button
                      onClick={() => setShowRaw(!showRaw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30"
                    >
                      {showRaw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-2xl p-3">
                  <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#991b1b] font-medium">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={tab === "login" ? handleLogin : handleToken}
                disabled={loading}
                className="w-full rounded-2xl py-4 font-bold text-white text-[15px] flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                    <ellipse cx="12" cy="12" rx="10" ry="3" />
                    <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(60 12 12)" />
                    <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(120 12 12)" />
                  </svg>
                )}
                {loading ? "Connecting…" : "Connect to Base44"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Page ─────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`h-6 w-11 rounded-full p-0.5 transition-colors ${on ? "bg-[#8b5cf6]" : "bg-[#e5e5e5]"}`}
    >
      <span
        className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

function StatusBadge({ connected }: { connected: boolean }) {
  return connected ? (
    <span className="flex items-center gap-1 text-[#22c55e] text-xs font-semibold">
      <Check className="h-3.5 w-3.5" strokeWidth={3} /> Connected
    </span>
  ) : (
    <span className="flex items-center gap-1 text-[#ef4444] text-xs font-semibold">
      <X className="h-3.5 w-3.5" strokeWidth={3} /> Not connected
    </span>
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
    } catch (e: any) {
      toast.error(e.message ?? "Invalid GitHub token");
    } finally {
      setGhLoading(false);
    }
  };

  const isBase44Connected = !!creds.base44Token;
  const isGitHubConnected = !!creds.githubToken && !!ghUser;

  return (
    <AppShell>
      <Toaster position="top-center" richColors />

      {showLoginModal && (
        <Base44LoginModal
          onSuccess={handleBase44Success}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Profile hero */}
      <section
        className="relative rounded-[32px] px-6 py-6 overflow-hidden mb-5"
        style={{ backgroundColor: "#e9e4f8" }}
      >
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-[#8b5cf6] flex items-center justify-center ring-4 ring-white shrink-0">
            <User className="h-10 w-10 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-black truncate">
              {creds.base44Email || "Not signed in"}
            </h2>
            {ghUser && (
              <p className="text-xs text-black/60 truncate">@{ghUser.login} on GitHub</p>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className={`inline-block text-white text-[10px] font-bold rounded-full px-2.5 py-1 ${isBase44Connected ? "bg-[#f97316]" : "bg-black/25"}`}>
                {isBase44Connected ? "BASE44 ✓" : "BASE44 ✗"}
              </span>
              <span className={`inline-block text-white text-[10px] font-bold rounded-full px-2.5 py-1 ${isGitHubConnected ? "bg-[#1a1a1a]" : "bg-black/25"}`}>
                {isGitHubConnected ? "GITHUB ✓" : "GITHUB ✗"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Base44 Account */}
      <SectionCard title="Base44 Account">
        <div className="flex items-center justify-between mb-4">
          <StatusBadge connected={isBase44Connected} />
          {isBase44Connected && (
            <button
              onClick={() => { updateCreds({ base44Token: "", base44Email: "" }); toast.success("Base44 disconnected"); }}
              className="text-xs text-[#ef4444] font-semibold"
            >
              Disconnect
            </button>
          )}
        </div>

        {isBase44Connected ? (
          <div
            className="flex items-center gap-3 rounded-2xl p-4"
            style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)" }}
          >
            <div
              className="h-11 w-11 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
                <ellipse cx="12" cy="12" rx="10" ry="3" />
                <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(60 12 12)" />
                <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(120 12 12)" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-black truncate">{creds.base44Email || "Connected"}</div>
              <div className="text-[11px] text-black/50">Authenticated via Base44</div>
            </div>
            <Check className="h-5 w-5 text-[#f97316] shrink-0" strokeWidth={3} />
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full rounded-2xl py-4 font-bold text-white text-[15px] flex items-center justify-center gap-2.5"
            style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <ellipse cx="12" cy="12" rx="10" ry="3" />
              <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(60 12 12)" />
              <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(120 12 12)" />
            </svg>
            Login with Base44
          </button>
        )}
      </SectionCard>

      {/* GitHub Account */}
      <SectionCard title="GitHub Account">
        <div className="flex items-center justify-between mb-4">
          <StatusBadge connected={isGitHubConnected} />
          {isGitHubConnected && (
            <button
              onClick={() => { updateCreds({ githubToken: "", githubUsername: "" }); setGhUser(null); toast.success("GitHub disconnected"); }}
              className="text-xs text-[#ef4444] font-semibold"
            >
              Disconnect
            </button>
          )}
        </div>

        {isGitHubConnected && ghUser ? (
          <div className="flex items-center gap-3 rounded-2xl bg-[#f3f2ee] p-4">
            <div className="h-11 w-11 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
              <Github className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-black truncate">{ghUser.name}</div>
              <div className="text-[11px] text-black/50">@{ghUser.login}</div>
            </div>
            <a href={`https://github.com/${ghUser.login}`} target="_blank" rel="noreferrer" className="text-black/30">
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[12px] text-black/50 leading-relaxed">
              Create a token at{" "}
              <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noreferrer"
                className="text-[#8b5cf6] font-semibold underline">
                github.com/settings/tokens
              </a>{" "}
              with <strong>repo</strong> scope.
            </p>
            <div className="relative">
              <input
                type={showGhToken ? "text" : "password"}
                placeholder="ghp_xxxxxxxxxxxx"
                value={ghToken}
                onChange={(e) => setGhToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && connectGitHub()}
                className="w-full rounded-2xl border border-[#eee] bg-[#f7f6f1] px-4 py-3.5 text-sm font-mono outline-none focus:border-[#1a1a1a] pr-11"
              />
              <button
                onClick={() => setShowGhToken(!showGhToken)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/40"
              >
                {showGhToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              onClick={connectGitHub}
              disabled={ghLoading}
              className="w-full bg-[#1a1a1a] text-white font-bold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {ghLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
              {ghLoading ? "Connecting…" : "Connect GitHub"}
            </button>
          </div>
        )}
      </SectionCard>

      {/* Defaults */}
      <SectionCard title="Push Defaults">
        <div>
          <label className="text-xs font-semibold text-black/50 mb-1.5 block">
            Default branch
          </label>
          <input
            value={defaultBranch}
            onChange={(e) => setDefaultBranch(e.target.value)}
            onBlur={() => updateCreds({ defaultBranch })}
            placeholder="main"
            className="w-full rounded-2xl border border-[#eee] bg-[#f7f6f1] px-4 py-3 text-sm outline-none focus:border-[#8b5cf6]"
          />
        </div>
      </SectionCard>

      {/* Preferences */}
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

      {/* Security */}
      <SectionCard title="Privacy & Security">
        <div className="rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] p-4 text-[12px] text-[#166534] leading-relaxed flex gap-2.5">
          <Shield className="h-4 w-4 shrink-0 mt-0.5 text-[#22c55e]" />
          <span>
            Your password is never stored. Only the session token returned by Base44
            is saved — in your browser only, never on any server.
          </span>
        </div>
      </SectionCard>

      <button
        onClick={() => { signOut(); setGhUser(null); toast.success("Signed out"); }}
        className="w-full bg-white rounded-2xl py-4 flex items-center justify-center gap-2 text-[#ef4444] font-bold text-sm mb-3"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
      <p className="text-center text-[11px] text-black/40 font-medium">Base44 Push · v2.0.0</p>
    </AppShell>
  );
}
