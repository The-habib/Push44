import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { useState, useEffect, useRef, useCallback } from "react";
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
  Copy,
  CheckCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import {
  initiateBase44DeviceAuth,
  pollBase44DeviceAuth,
  validateBase44Token,
} from "@/lib/base44-api";
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

// ─── Base44 Device Code Modal ─────────────────────────────────────────────────

type DeviceFlowState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "waiting"; device_code: string; user_code: string; verification_uri: string; interval: number }
  | { phase: "confirming" }
  | { phase: "error"; message: string };

function Base44DeviceModal({
  onSuccess,
  onClose,
}: {
  onSuccess: (token: string, email: string, name: string) => void;
  onClose: () => void;
}) {
  const [state, setState] = useState<DeviceFlowState>({ phase: "idle" });
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  const startDeviceFlow = async () => {
    setState({ phase: "loading" });
    stopPolling();
    try {
      const result = await initiateBase44DeviceAuth({ data: undefined });
      if (!result.device_code || !result.user_code) {
        throw new Error("Invalid response from Base44 — missing device code.");
      }
      setState({
        phase: "waiting",
        device_code: result.device_code,
        user_code: result.user_code,
        verification_uri: result.verification_uri,
        interval: result.interval ?? 5,
      });
      beginPolling(result.device_code, result.interval ?? 5, result.expires_in ?? 900);
    } catch (e: any) {
      setState({ phase: "error", message: e.message ?? "Could not connect to Base44." });
    }
  };

  const beginPolling = (device_code: string, intervalSec: number, expiresSec: number) => {
    const expiresAt = Date.now() + expiresSec * 1000;
    pollRef.current = setInterval(async () => {
      if (Date.now() > expiresAt) {
        stopPolling();
        setState({ phase: "error", message: "Code expired. Please try again." });
        return;
      }
      try {
        const result = await pollBase44DeviceAuth({ data: { device_code } });
        if (result.status === "authorized") {
          stopPolling();
          setState({ phase: "confirming" });
          onSuccess(result.token!, result.email!, result.name!);
        } else if (result.status === "expired") {
          stopPolling();
          setState({ phase: "error", message: "Code expired. Please try again." });
        } else if (result.status === "denied") {
          stopPolling();
          setState({ phase: "error", message: "Access denied. Please try again." });
        }
        // "pending" — keep polling
      } catch {
        // Network hiccup — keep polling
      }
    }, intervalSec * 1000);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => { stopPolling(); onClose(); }}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          {/* Base44 logo */}
          <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
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
            onClick={() => { stopPolling(); onClose(); }}
            className="h-8 w-8 rounded-full bg-[#f3f2ee] flex items-center justify-center text-black/50 hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Security note */}
          <div className="flex items-start gap-2.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-3.5">
            <Shield className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#166534] leading-snug font-medium">
              Your credentials stay with Base44. We only get temporary access to your app's export.
            </p>
          </div>

          {state.phase === "idle" && (
            <button
              onClick={startDeviceFlow}
              className="w-full rounded-2xl py-4 font-bold text-white text-[15px] flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                <ellipse cx="12" cy="12" rx="10" ry="3" />
                <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(60 12 12)" />
                <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(120 12 12)" />
              </svg>
              Connect with Base44
            </button>
          )}

          {state.phase === "loading" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
              <p className="text-sm text-black/50 font-medium">Generating code…</p>
            </div>
          )}

          {state.phase === "waiting" && (
            <>
              <div>
                <p className="text-[12px] text-black/50 text-center mb-3 font-medium">
                  Enter this code at Base44:
                </p>
                {/* Code display */}
                <div className="flex items-center justify-center gap-3 bg-[#f7f6f1] rounded-2xl px-5 py-4">
                  <span className="font-mono font-extrabold text-[28px] tracking-[0.18em] text-black select-all">
                    {state.user_code}
                  </span>
                  <button
                    onClick={() => copyCode(state.user_code)}
                    className="h-9 w-9 rounded-xl bg-white border border-[#eee] flex items-center justify-center shrink-0 shadow-sm"
                  >
                    {copied ? (
                      <CheckCheck className="h-4 w-4 text-[#22c55e]" />
                    ) : (
                      <Copy className="h-4 w-4 text-black/50" />
                    )}
                  </button>
                </div>
              </div>

              {/* Open Base44 button */}
              <a
                href={state.verification_uri}
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-2xl py-4 font-bold text-white text-[15px] flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                  <ellipse cx="12" cy="12" rx="10" ry="3" />
                  <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(60 12 12)" />
                  <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(120 12 12)" />
                </svg>
                Login with Base44
                <ExternalLink className="h-4 w-4" />
              </a>

              {/* Polling indicator */}
              <div className="flex items-center justify-center gap-2 text-[12px] text-black/40 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Waiting for confirmation…
              </div>
            </>
          )}

          {state.phase === "confirming" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="h-14 w-14 rounded-full bg-[#dcfce7] flex items-center justify-center">
                <Check className="h-8 w-8 text-[#22c55e]" strokeWidth={3} />
              </div>
              <p className="text-sm font-bold text-black">Connected!</p>
            </div>
          )}

          {state.phase === "error" && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-2xl p-3.5">
                <AlertCircle className="h-4 w-4 text-[#ef4444] shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#991b1b] leading-snug font-medium">
                  {state.message}
                </p>
              </div>
              <button
                onClick={startDeviceFlow}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 bg-[#f3f2ee] text-black font-bold text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </div>
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
      <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
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

  const [showDeviceModal, setShowDeviceModal] = useState(false);
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
    setTimeout(() => setShowDeviceModal(false), 800);
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

      {/* Device Auth Modal */}
      {showDeviceModal && (
        <Base44DeviceModal
          onSuccess={handleBase44Success}
          onClose={() => setShowDeviceModal(false)}
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
              <span
                className={`inline-block text-white text-[10px] font-bold rounded-full px-2.5 py-1 ${isBase44Connected ? "bg-[#f97316]" : "bg-black/25"}`}
              >
                {isBase44Connected ? "BASE44 ✓" : "BASE44 ✗"}
              </span>
              <span
                className={`inline-block text-white text-[10px] font-bold rounded-full px-2.5 py-1 ${isGitHubConnected ? "bg-[#1a1a1a]" : "bg-black/25"}`}
              >
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
          <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)" }}>
            <div
              className="h-11 w-11 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
                <ellipse cx="12" cy="12" rx="10" ry="3" />
                <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(60 12 12)" />
                <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(120 12 12)" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-black truncate">{creds.base44Email || "Connected"}</div>
              <div className="text-[11px] text-black/50">Authenticated via device code</div>
            </div>
            <Check className="h-5 w-5 text-[#f97316] shrink-0" strokeWidth={3} />
          </div>
        ) : (
          <button
            onClick={() => setShowDeviceModal(true)}
            className="w-full rounded-2xl py-4 font-bold text-white text-[15px] flex items-center justify-center gap-2.5"
            style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
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

      {/* Security note */}
      <SectionCard title="Privacy & Security">
        <div className="rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] p-4 text-[12px] text-[#166534] leading-relaxed flex gap-2.5">
          <Shield className="h-4 w-4 shrink-0 mt-0.5 text-[#22c55e]" />
          <span>
            Tokens are stored only in your browser's local storage. They are
            never stored on any server — only sent directly to Base44 and GitHub.
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
