import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import { useState, useEffect } from "react";
import {
  Github,
  Moon,
  LogOut,
  ChevronRight,
  Shield,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  KeyRound,
  User,
  ExternalLink,
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

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
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
  const navigate = useNavigate();

  // Base44 state
  const [b44Email, setB44Email] = useState("");
  const [b44Password, setB44Password] = useState("");
  const [b44Token, setB44Token] = useState("");
  const [b44Mode, setB44Mode] = useState<"login" | "token">("login");
  const [showB44Pass, setShowB44Pass] = useState(false);
  const [b44Loading, setB44Loading] = useState(false);

  // GitHub state
  const [ghToken, setGhToken] = useState("");
  const [showGhToken, setShowGhToken] = useState(false);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghUser, setGhUser] = useState<{ login: string; name: string } | null>(null);

  // Preferences
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [defaultBranch, setDefaultBranch] = useState("main");

  useEffect(() => {
    if (!isLoaded) return;
    if (creds.githubToken) {
      setGhToken(creds.githubToken);
    }
    if (creds.defaultBranch) setDefaultBranch(creds.defaultBranch);
  }, [isLoaded, creds]);

  // Auto-validate GitHub token on load
  useEffect(() => {
    if (!isLoaded || !creds.githubToken) return;
    getGitHubUser({ data: { token: creds.githubToken } })
      .then((u) => setGhUser({ login: u.login, name: u.name }))
      .catch(() => setGhUser(null));
  }, [isLoaded, creds.githubToken]);

  const connectBase44WithLogin = async () => {
    if (!b44Email.trim() || !b44Password.trim()) {
      toast.error("Enter your Base44 email and password");
      return;
    }
    setB44Loading(true);
    try {
      const result = await base44Login({
        data: { email: b44Email.trim(), password: b44Password },
      });
      updateCreds({
        base44Token: result.token,
        base44Email: result.email,
      });
      toast.success(`Connected as ${result.email}`);
      setB44Password("");
    } catch (e: any) {
      toast.error(e.message ?? "Base44 login failed");
    } finally {
      setB44Loading(false);
    }
  };

  const connectBase44WithToken = async () => {
    if (!b44Token.trim()) {
      toast.error("Enter your Base44 auth token");
      return;
    }
    setB44Loading(true);
    try {
      const result = await validateBase44Token({
        data: { token: b44Token.trim() },
      });
      updateCreds({
        base44Token: b44Token.trim(),
        base44Email: result.email || b44Email,
      });
      toast.success(`Base44 connected as ${result.email || "user"}`);
      setB44Token("");
    } catch (e: any) {
      toast.error(e.message ?? "Invalid Base44 token");
    } finally {
      setB44Loading(false);
    }
  };

  const connectGitHub = async () => {
    if (!ghToken.trim()) {
      toast.error("Enter your GitHub Personal Access Token");
      return;
    }
    setGhLoading(true);
    try {
      const user = await getGitHubUser({ data: { token: ghToken.trim() } });
      updateCreds({
        githubToken: ghToken.trim(),
        githubUsername: user.login,
        defaultOwner: user.login,
      });
      setGhUser({ login: user.login, name: user.name });
      toast.success(`GitHub connected as ${user.login}`);
    } catch (e: any) {
      toast.error(e.message ?? "Invalid GitHub token");
    } finally {
      setGhLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    setGhUser(null);
    toast.success("Signed out");
  };

  const isBase44Connected = !!creds.base44Token;
  const isGitHubConnected = !!creds.githubToken && !!ghUser;

  return (
    <AppShell>
      <Toaster position="top-center" richColors />

      {/* Profile hero */}
      <section
        className="relative rounded-[32px] px-6 py-6 overflow-hidden mb-5"
        style={{ backgroundColor: "#e9e4f8" }}
      >
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-[#8b5cf6] flex items-center justify-center ring-4 ring-white">
            <User className="h-10 w-10 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-black truncate">
              {creds.base44Email || "Not signed in"}
            </h2>
            {ghUser && (
              <p className="text-xs text-black/60 truncate">
                @{ghUser.login} on GitHub
              </p>
            )}
            <div className="flex gap-2 mt-2">
              <span
                className={`inline-block text-white text-[10px] font-bold rounded-full px-2.5 py-1 ${isBase44Connected ? "bg-[#8b5cf6]" : "bg-black/30"}`}
              >
                {isBase44Connected ? "BASE44 ✓" : "BASE44 ✗"}
              </span>
              <span
                className={`inline-block text-white text-[10px] font-bold rounded-full px-2.5 py-1 ${isGitHubConnected ? "bg-[#1a1a1a]" : "bg-black/30"}`}
              >
                {isGitHubConnected ? "GITHUB ✓" : "GITHUB ✗"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Base44 Account */}
      <SectionCard title="Base44 Account">
        <div className="flex items-center justify-between mb-3">
          <StatusBadge connected={isBase44Connected} />
          {isBase44Connected && (
            <button
              onClick={() => {
                updateCreds({ base44Token: "", base44Email: "" });
                toast.success("Base44 disconnected");
              }}
              className="text-xs text-[#ef4444] font-semibold"
            >
              Disconnect
            </button>
          )}
        </div>

        {isBase44Connected ? (
          <div className="flex items-center gap-3 rounded-xl bg-[#f3f2ee] p-3">
            <div className="h-9 w-9 rounded-lg bg-[#8b5cf6] flex items-center justify-center">
              <span className="text-white font-extrabold text-lg italic">B</span>
            </div>
            <div>
              <div className="text-sm font-bold text-black">
                {creds.base44Email}
              </div>
              <div className="text-[11px] text-black/55">
                Auth token saved securely
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Mode tabs */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setB44Mode("login")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${b44Mode === "login" ? "bg-[#8b5cf6] text-white" : "bg-[#f3f2ee] text-black/60"}`}
              >
                Login
              </button>
              <button
                onClick={() => setB44Mode("token")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${b44Mode === "token" ? "bg-[#8b5cf6] text-white" : "bg-[#f3f2ee] text-black/60"}`}
              >
                Auth Token
              </button>
            </div>

            {b44Mode === "login" ? (
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Base44 email"
                  value={b44Email}
                  onChange={(e) => setB44Email(e.target.value)}
                  className="w-full rounded-xl border border-[#eee] bg-[#f7f6f1] px-4 py-3 text-sm outline-none focus:border-[#8b5cf6]"
                />
                <div className="relative">
                  <input
                    type={showB44Pass ? "text" : "password"}
                    placeholder="Password"
                    value={b44Password}
                    onChange={(e) => setB44Password(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && connectBase44WithLogin()
                    }
                    className="w-full rounded-xl border border-[#eee] bg-[#f7f6f1] px-4 py-3 text-sm outline-none focus:border-[#8b5cf6] pr-10"
                  />
                  <button
                    onClick={() => setShowB44Pass(!showB44Pass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40"
                  >
                    {showB44Pass ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <button
                  onClick={connectBase44WithLogin}
                  disabled={b44Loading}
                  className="w-full bg-[#8b5cf6] text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {b44Loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {b44Loading ? "Connecting…" : "Connect Base44"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-black/55 leading-relaxed">
                  Find your auth token in Base44 account settings → API Keys.
                </p>
                <div className="relative">
                  <input
                    type={showB44Pass ? "text" : "password"}
                    placeholder="Paste auth token"
                    value={b44Token}
                    onChange={(e) => setB44Token(e.target.value)}
                    className="w-full rounded-xl border border-[#eee] bg-[#f7f6f1] px-4 py-3 text-sm font-mono outline-none focus:border-[#8b5cf6] pr-10"
                  />
                  <button
                    onClick={() => setShowB44Pass(!showB44Pass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40"
                  >
                    {showB44Pass ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <button
                  onClick={connectBase44WithToken}
                  disabled={b44Loading}
                  className="w-full bg-[#8b5cf6] text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {b44Loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {b44Loading ? "Validating…" : "Connect with Token"}
                </button>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* GitHub Account */}
      <SectionCard title="GitHub Account">
        <div className="flex items-center justify-between mb-3">
          <StatusBadge connected={isGitHubConnected} />
          {isGitHubConnected && (
            <button
              onClick={() => {
                updateCreds({ githubToken: "", githubUsername: "" });
                setGhUser(null);
                toast.success("GitHub disconnected");
              }}
              className="text-xs text-[#ef4444] font-semibold"
            >
              Disconnect
            </button>
          )}
        </div>

        {isGitHubConnected && ghUser ? (
          <div className="flex items-center gap-3 rounded-xl bg-[#f3f2ee] p-3 mb-3">
            <div className="h-9 w-9 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
              <Github className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-black">{ghUser.name}</div>
              <div className="text-[11px] text-black/55">@{ghUser.login}</div>
            </div>
            <a
              href={`https://github.com/${ghUser.login}`}
              target="_blank"
              rel="noreferrer"
              className="text-black/40"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-black/55 leading-relaxed">
              Create a token at{" "}
              <a
                href="https://github.com/settings/tokens/new?scopes=repo"
                target="_blank"
                rel="noreferrer"
                className="text-[#8b5cf6] font-semibold underline"
              >
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
                className="w-full rounded-xl border border-[#eee] bg-[#f7f6f1] px-4 py-3 text-sm font-mono outline-none focus:border-[#1a1a1a] pr-10"
              />
              <button
                onClick={() => setShowGhToken(!showGhToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40"
              >
                {showGhToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <button
              onClick={connectGitHub}
              disabled={ghLoading}
              className="w-full bg-[#1a1a1a] text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {ghLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Github className="h-4 w-4" />
              )}
              {ghLoading ? "Connecting…" : "Connect GitHub"}
            </button>
          </div>
        )}
      </SectionCard>

      {/* Defaults */}
      <SectionCard title="Push Defaults">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-black/60 mb-1 block">
              Default branch
            </label>
            <input
              value={defaultBranch}
              onChange={(e) => setDefaultBranch(e.target.value)}
              onBlur={() => updateCreds({ defaultBranch })}
              placeholder="main"
              className="w-full rounded-xl border border-[#eee] bg-[#f7f6f1] px-4 py-3 text-sm outline-none focus:border-[#8b5cf6]"
            />
          </div>
        </div>
      </SectionCard>

      {/* Preferences */}
      <SectionCard title="Preferences">
        <div className="divide-y divide-[#f0f0ec]">
          <div className="flex items-center gap-3 py-3">
            <div className="h-10 w-10 rounded-xl bg-[#e9e4f8] flex items-center justify-center">
              <Moon className="h-5 w-5 text-black" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-black">Dark Mode</div>
              <div className="text-[11px] text-black/55">Coming soon</div>
            </div>
            <Toggle on={darkMode} onChange={setDarkMode} />
          </div>
        </div>
      </SectionCard>

      {/* Security */}
      <SectionCard title="Security">
        <div className="rounded-xl bg-[#f7f6f1] p-4 text-[12px] text-black/60 leading-relaxed flex gap-2">
          <Shield className="h-4 w-4 shrink-0 mt-0.5 text-[#22c55e]" />
          <span>
            Your tokens are stored only in your browser's local storage. They are
            never sent to any server other than GitHub and Base44 directly.
          </span>
        </div>
      </SectionCard>

      <button
        onClick={handleSignOut}
        className="w-full bg-white rounded-2xl py-4 flex items-center justify-center gap-2 text-[#ef4444] font-bold text-sm mb-3"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
      <p className="text-center text-[11px] text-black/40 font-medium">
        Base44 Push · v2.0.0
      </p>
    </AppShell>
  );
}
