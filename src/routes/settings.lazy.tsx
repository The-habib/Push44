import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, AlertCircle, Loader2, ExternalLink, LogOut, RefreshCw } from "lucide-react";
import { GitHubLogo, Base44Logo, RocketLogo, FlootLogo, ZiteLogo } from "@/components/BrandLogos";
import { RocketModal } from "@/components/RocketModal";
import { useApp } from "@/contexts/AppContext";
import { getGitHubUser } from "@/lib/github-api";
import { base44Login, validateBase44Token } from "@/lib/base44-api";
import { validateFlootToken } from "@/lib/floot-api";
import { loginToZite, validateZiteSession } from "@/lib/zite-api";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/settings")({ component: SettingsPage });

type TestState = "idle" | "loading" | "ok" | "fail";

function TestBtn({ state, onClick }: { state: TestState; onClick: () => void }) {
  const styles = {
    idle:    { bg: "#f8fafc", bc: "#e2e8f0", color: "#64748b", label: "Test"    },
    loading: { bg: "#f8fafc", bc: "#e2e8f0", color: "#64748b", label: "…"       },
    ok:      { bg: "#f0fdf4", bc: "#bbf7d0", color: "#15803d", label: "OK ✓"    },
    fail:    { bg: "#fef2f2", bc: "#fecaca", color: "#b91c1c", label: "Failed"  },
  }[state];
  return (
    <button
      className="btn btn-sm"
      style={{ background: styles.bg, borderColor: styles.bc, color: styles.color }}
      onClick={onClick}
      disabled={state === "loading"}
    >
      {state === "loading" && <Loader2 size={12} style={{ animation: "spin 0.6s linear infinite" }} />}
      {styles.label}
    </button>
  );
}

function SectionCard({
  title, subtitle, icon, connected, onDisconnect, children,
}: {
  title: string; subtitle?: string; icon: React.ReactNode;
  connected?: boolean; onDisconnect?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="card" style={{ marginBottom: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border)", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {icon}
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: "#64748b" }}>{subtitle}</div>}
          </div>
          {connected !== undefined && (
            <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: connected ? "#f0fdf4" : "#f1f5f9", color: connected ? "#15803d" : "#94a3b8" }}>
              {connected ? "Connected" : "Not connected"}
            </span>
          )}
        </div>
        {connected && onDisconnect && (
          <button className="btn btn-ghost btn-sm" onClick={onDisconnect} style={{ color: "#ef4444" }}>
            <LogOut size={12} />Disconnect
          </button>
        )}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { creds, updateCreds, signOut } = useApp();

  // ── GitHub ─────────────────────────────────────────────────────────────────
  const [ghToken, setGhToken]     = useState(creds.githubToken ?? "");
  const [showGhTok, setShowGhTok] = useState(false);
  const [ghTest, setGhTest]       = useState<TestState>("idle");
  const [ghSaving, setGhSaving]   = useState(false);

  // ── Base44 ─────────────────────────────────────────────────────────────────
  const [b44Email, setB44Email]   = useState("");
  const [b44Pass, setB44Pass]     = useState("");
  const [b44Token, setB44Token]   = useState("");
  const [b44Tab, setB44Tab]       = useState<"login" | "token">("login");
  const [showB44Pass, setShowB44Pass] = useState(false);
  const [b44Saving, setB44Saving] = useState(false);
  const [b44Test, setB44Test]     = useState<TestState>("idle");

  // ── Rocket ─────────────────────────────────────────────────────────────────
  const [showRocketModal, setShowRocketModal] = useState(false);

  // ── Zite ───────────────────────────────────────────────────────────────────
  const [ziteEmail, setZiteEmail] = useState("");
  const [zitePass, setZitePass]   = useState("");
  const [showZitePass, setShowZitePass] = useState(false);
  const [ziteSaving, setZiteSaving]   = useState(false);
  const [ziteTest, setZiteTest]       = useState<TestState>("idle");

  // ── Floot ──────────────────────────────────────────────────────────────────
  const [flootToken, setFlootToken]   = useState(creds.flootToken ?? "");
  const [showFlootTok, setShowFlootTok] = useState(false);
  const [flootSaving, setFlootSaving] = useState(false);
  const [flootTest, setFlootTest]     = useState<TestState>("idle");

  // ── Prefs ──────────────────────────────────────────────────────────────────
  const [branch, setBranch] = useState(creds.defaultBranch ?? "main");

  // ── GitHub OAuth callback capture ──────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("github_token");
    const error = params.get("github_error");
    if (token || error) {
      window.history.replaceState({}, "", "/settings");
    }
    if (error) {
      toast.error(decodeURIComponent(error));
    }
    if (token) {
      setGhToken(token);
      setGhSaving(true);
      getGitHubUser({ data: { token } })
        .then((user) => {
          updateCreds({ githubToken: token, githubUsername: user.login });
          setGhTest("ok");
          toast.success(`Connected as @${user.login}`);
        })
        .catch(() => {
          toast.error("Token received but GitHub validation failed — try again.");
          setGhTest("fail");
        })
        .finally(() => setGhSaving(false));
    }
  }, []);

  // ── GitHub actions ─────────────────────────────────────────────────────────
  const saveGitHub = async () => {
    if (!ghToken.trim()) return;
    setGhSaving(true);
    try {
      const user = await getGitHubUser({ data: { token: ghToken.trim() } });
      updateCreds({ githubToken: ghToken.trim(), githubUsername: user.login });
      setGhTest("ok");
      toast.success(`Connected as @${user.login}`);
    } catch (e: any) {
      setGhTest("fail");
      toast.error(e?.message ?? "Invalid token");
    } finally { setGhSaving(false); }
  };

  const testGitHub = async () => {
    if (!ghToken.trim()) return;
    setGhTest("loading");
    try { await getGitHubUser({ data: { token: ghToken.trim() } }); setGhTest("ok"); }
    catch { setGhTest("fail"); }
  };

  // ── Base44 actions ─────────────────────────────────────────────────────────
  const connectBase44 = async () => {
    setB44Saving(true);
    try {
      if (b44Tab === "login") {
        if (!b44Email.trim() || !b44Pass) { toast.error("Enter email and password"); return; }
        const r = await base44Login({ data: { email: b44Email.trim(), password: b44Pass } });
        updateCreds({ base44Token: r.token, base44Email: r.email });
        setB44Test("ok"); toast.success("Base44 connected");
      } else {
        if (!b44Token.trim()) { toast.error("Paste your API token"); return; }
        const info = await validateBase44Token({ data: { token: b44Token.trim() } });
        updateCreds({ base44Token: b44Token.trim(), base44Email: info.email });
        setB44Test("ok"); toast.success("Base44 connected");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Connection failed");
      setB44Test("fail");
      if (e?.message?.includes("Google") || e?.message?.includes("Auth Token")) setB44Tab("token");
    } finally { setB44Saving(false); }
  };

  const testBase44 = async () => {
    if (!creds.base44Token) return;
    setB44Test("loading");
    try { await validateBase44Token({ data: { token: creds.base44Token } }); setB44Test("ok"); }
    catch { setB44Test("fail"); }
  };

  // ── Zite actions ───────────────────────────────────────────────────────────
  const connectZite = async () => {
    if (!ziteEmail.trim() || !zitePass) { toast.error("Enter email and password"); return; }
    setZiteSaving(true);
    try {
      const r = await loginToZite({ data: { email: ziteEmail.trim(), password: zitePass } });
      updateCreds({ ziteSession: r.session, ziteCsrf: r.csrf, ziteEmail: r.email });
      setZiteTest("ok"); toast.success("Zite connected");
    } catch (e: any) {
      toast.error(e?.message ?? "Login failed");
      setZiteTest("fail");
    } finally { setZiteSaving(false); }
  };

  const testZite = async () => {
    if (!creds.ziteSession) return;
    setZiteTest("loading");
    try { await validateZiteSession({ data: { session: creds.ziteSession, csrf: creds.ziteCsrf ?? "" } }); setZiteTest("ok"); }
    catch { setZiteTest("fail"); }
  };

  // ── Floot actions ──────────────────────────────────────────────────────────
  const saveFloot = async () => {
    if (!flootToken.trim()) return;
    setFlootSaving(true);
    try {
      const info = await validateFlootToken({ data: { token: flootToken.trim() } });
      updateCreds({ flootToken: flootToken.trim(), flootEmail: info.email });
      setFlootTest("ok"); toast.success(`Floot connected as ${info.email}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Invalid token");
      setFlootTest("fail");
    } finally { setFlootSaving(false); }
  };

  const testFloot = async () => {
    if (!flootToken.trim() && !creds.flootToken) return;
    setFlootTest("loading");
    try { await validateFlootToken({ data: { token: flootToken.trim() || creds.flootToken! } }); setFlootTest("ok"); }
    catch { setFlootTest("fail"); }
  };

  return (
    <div className="page">
      <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px" }}>Settings</h1>
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 24px" }}>Manage credentials for all connected platforms.</p>

      {/* ── GitHub ── */}
      <SectionCard
        title="GitHub"
        subtitle="Required — push all platforms to GitHub"
        icon={<GitHubLogo size={20} />}
        connected={!!creds.githubToken}
        onDisconnect={() => { updateCreds({ githubToken: "", githubUsername: "" }); setGhToken(""); setGhTest("idle"); toast.success("Disconnected"); }}
      >
        {creds.githubUsername && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 12px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
            <img src={`https://github.com/${creds.githubUsername}.png?size=40`} alt={creds.githubUsername} style={{ width: 32, height: 32, borderRadius: "50%" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>@{creds.githubUsername}</div>
              <div style={{ fontSize: 12, color: "#15803d" }}>Connected</div>
            </div>
          </div>
        )}
        <button
          className="btn btn-primary"
          style={{ width: "100%", marginBottom: 16, justifyContent: "center", gap: 8 }}
          onClick={() => {
            const state = Math.random().toString(36).slice(2);
            sessionStorage.setItem("gh_oauth_state", state);
            window.location.href = `/api/github-oauth?action=start&state=${state}`;
          }}
          disabled={ghSaving}
        >
          {ghSaving
            ? <><Loader2 size={14} style={{ animation: "spin 0.6s linear infinite" }} /> Connecting…</>
            : <><GitHubLogo size={14} /> Connect with GitHub</>}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>or paste a token manually</span>
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
        </div>

        <label className="label">Personal Access Token</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input className="input" type={showGhTok ? "text" : "password"} placeholder="ghp_xxxxxxxxxxxx" value={ghToken} onChange={(e) => { setGhToken(e.target.value); setGhTest("idle"); }} style={{ paddingRight: 36 }} onKeyDown={(e) => e.key === "Enter" && saveGitHub()} />
            <button onClick={() => setShowGhTok(!showGhTok)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", lineHeight: 1, padding: 0 }}>
              {showGhTok ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <TestBtn state={ghTest} onClick={testGitHub} />
          <button className="btn btn-primary btn-sm" onClick={saveGitHub} disabled={ghSaving || !ghToken.trim()}>
            {ghSaving ? <Loader2 size={12} style={{ animation: "spin 0.6s linear infinite" }} /> : <Check size={12} />}Save
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
          Create at <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noopener" style={{ color: "#f97316" }}>github.com/settings/tokens <ExternalLink size={10} style={{ display: "inline" }} /></a> with <strong>repo</strong> scope.
        </p>
      </SectionCard>

      {/* ── Base44 ── */}
      <SectionCard
        title="Base44"
        subtitle="app.base44.com"
        icon={<Base44Logo size={20} />}
        connected={!!creds.base44Token}
        onDisconnect={() => { updateCreds({ base44Token: "", base44Email: "" }); setB44Test("idle"); toast.success("Disconnected"); }}
      >
        {creds.base44Email && <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>Signed in as <strong>{creds.base44Email}</strong></div>}
        {creds.base44Token ? (
          <TestBtn state={b44Test} onClick={testBase44} />
        ) : (
          <>
            <div className="tabs" style={{ marginBottom: 12 }}>
              <button className={`tab${b44Tab === "login" ? " active" : ""}`} onClick={() => setB44Tab("login")}>Email / Password</button>
              <button className={`tab${b44Tab === "token" ? " active" : ""}`} onClick={() => setB44Tab("token")}>API Token</button>
            </div>
            {b44Tab === "login" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                <input className="input" type="email" placeholder="Email" value={b44Email} onChange={(e) => setB44Email(e.target.value)} />
                <div style={{ position: "relative" }}>
                  <input className="input" type={showB44Pass ? "text" : "password"} placeholder="Password" value={b44Pass} onChange={(e) => setB44Pass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && connectBase44()} style={{ paddingRight: 36 }} />
                  <button onClick={() => setShowB44Pass(!showB44Pass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", lineHeight: 1, padding: 0 }}>
                    {showB44Pass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Signed up with Google? Use the <button onClick={() => setB44Tab("token")} style={{ border: "none", background: "none", color: "#f97316", cursor: "pointer", padding: 0, fontSize: 12, fontWeight: 600 }}>API Token tab</button> instead.</p>
              </div>
            ) : (
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 8px" }}>
                  Get your API key from <a href="https://app.base44.com/settings/account" target="_blank" rel="noopener" style={{ color: "#f97316" }}>app.base44.com/settings/account <ExternalLink size={10} style={{ display: "inline" }} /></a>
                </p>
                <input className="input" type="password" placeholder="Paste API key…" value={b44Token} onChange={(e) => setB44Token(e.target.value)} onKeyDown={(e) => e.key === "Enter" && connectBase44()} />
              </div>
            )}
            <button className="btn btn-primary" disabled={b44Saving} onClick={connectBase44}>
              {b44Saving ? <><span className="spinner spinner-sm" />Connecting…</> : "Connect Base44 →"}
            </button>
          </>
        )}
      </SectionCard>

      {/* ── Rocket.new ── */}
      <SectionCard
        title="Rocket.new"
        subtitle="rocket.new — OTP email login"
        icon={<RocketLogo size={20} />}
        connected={!!creds.rocketToken}
        onDisconnect={() => { updateCreds({ rocketToken: "", rocketEmail: "", rocketCompanyId: "" }); toast.success("Disconnected"); }}
      >
        {creds.rocketEmail && <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>Signed in as <strong>{creds.rocketEmail}</strong></div>}
        {!creds.rocketToken && (
          <button className="btn btn-primary" onClick={() => setShowRocketModal(true)}>
            Connect via Email Code →
          </button>
        )}
      </SectionCard>

      {/* ── Zite ── */}
      <SectionCard
        title="Zite"
        subtitle="build.fillout.com — login with Fillout credentials"
        icon={<ZiteLogo size={20} />}
        connected={!!creds.ziteSession}
        onDisconnect={() => { updateCreds({ ziteSession: "", ziteCsrf: "", ziteEmail: "" }); setZiteTest("idle"); toast.success("Disconnected"); }}
      >
        {creds.ziteEmail && <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>Signed in as <strong>{creds.ziteEmail}</strong></div>}
        {creds.ziteSession ? (
          <TestBtn state={ziteTest} onClick={testZite} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input className="input" type="email" placeholder="Fillout email" value={ziteEmail} onChange={(e) => setZiteEmail(e.target.value)} />
            <div style={{ position: "relative" }}>
              <input className="input" type={showZitePass ? "text" : "password"} placeholder="Fillout password" value={zitePass} onChange={(e) => setZitePass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && connectZite()} style={{ paddingRight: 36 }} />
              <button onClick={() => setShowZitePass(!showZitePass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", lineHeight: 1, padding: 0 }}>
                {showZitePass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
              Sign in with your <a href="https://build.fillout.com" target="_blank" rel="noopener" style={{ color: "#f97316" }}>build.fillout.com</a> account credentials.
            </p>
            <button className="btn btn-primary" disabled={ziteSaving} onClick={connectZite}>
              {ziteSaving ? <><span className="spinner spinner-sm" />Connecting…</> : "Connect Zite →"}
            </button>
          </div>
        )}
      </SectionCard>

      {/* ── Floot ── */}
      <SectionCard
        title="Floot"
        subtitle="floot.com — paste session cookie"
        icon={<FlootLogo size={20} />}
        connected={!!creds.flootToken}
        onDisconnect={() => { updateCreds({ flootToken: "", flootEmail: "" }); setFlootToken(""); setFlootTest("idle"); toast.success("Disconnected"); }}
      >
        {creds.flootEmail && <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>Signed in as <strong>{creds.flootEmail}</strong></div>}
        <label className="label">Session Token</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input className="input" type={showFlootTok ? "text" : "password"} placeholder="nextauth.session-token value…" value={flootToken} onChange={(e) => { setFlootToken(e.target.value); setFlootTest("idle"); }} style={{ paddingRight: 36 }} />
            <button onClick={() => setShowFlootTok(!showFlootTok)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", lineHeight: 1, padding: 0 }}>
              {showFlootTok ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <TestBtn state={flootTest} onClick={testFloot} />
          <button className="btn btn-primary btn-sm" onClick={saveFloot} disabled={flootSaving || !flootToken.trim()}>
            {flootSaving ? <Loader2 size={12} style={{ animation: "spin 0.6s linear infinite" }} /> : <Check size={12} />}Save
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
          Log in at <a href="https://floot.com" target="_blank" rel="noopener" style={{ color: "#f97316" }}>floot.com</a> → DevTools (F12) → Application → Cookies → copy value of <code style={{ background: "#f1f5f9", padding: "1px 4px", borderRadius: 3 }}>nextauth.session-token</code>.
        </p>
      </SectionCard>

      {/* ── Preferences ── */}
      <div className="card" style={{ padding: 18, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Preferences</div>
        <label className="label">Default Branch</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" placeholder="main" value={branch} onChange={(e) => setBranch(e.target.value)} style={{ maxWidth: 200 }} />
          <button className="btn btn-secondary btn-sm" onClick={() => { updateCreds({ defaultBranch: branch }); toast.success("Saved"); }}>Save</button>
        </div>
      </div>

      {/* ── Sign out ── */}
      <div style={{ paddingTop: 8 }}>
        <button className="btn btn-danger" onClick={() => { signOut(); window.location.href = "/onboarding"; }}>
          <LogOut size={14} />Sign out &amp; clear all credentials
        </button>
      </div>

      {showRocketModal && (
        <RocketModal
          onSuccess={(token, email, companyId) => {
            updateCreds({ rocketToken: token, rocketEmail: email, rocketCompanyId: companyId });
            setShowRocketModal(false);
            toast.success("Rocket.new connected");
          }}
          onClose={() => setShowRocketModal(false)}
        />
      )}
    </div>
  );
}
