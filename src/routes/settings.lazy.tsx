import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, AlertCircle, Loader2, ExternalLink, LogOut, RefreshCw } from "lucide-react";
import { GitHubLogo, Base44Logo, RocketLogo, FlootLogo, ZiteLogo, BoltLogo, LovableLogo, FramerLogo } from "@/components/BrandLogos";
import { RocketModal } from "@/components/RocketModal";
import { useApp } from "@/contexts/AppContext";
import { getGitHubUser } from "@/lib/github-api";
import { base44Login, validateBase44Token } from "@/lib/base44-api";
import { validateFlootToken } from "@/lib/floot-api";
import { boltLogin, validateBoltProject, cleanBoltToken, cleanBoltProjectId } from "@/lib/bolt-api";
import { loginToZite, validateZiteSession } from "@/lib/zite-api";
import { lovableLogin, validateLovableToken } from "@/lib/lovable-api";
import { validateFramerAuth } from "@/lib/framer-api";
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

  // ── bolt.new ───────────────────────────────────────────────────────────────
  const [boltTab, setBoltTab]             = useState<"login" | "cookie">("login");
  const [boltEmail, setBoltEmail]         = useState("");
  const [boltPass, setBoltPass]           = useState("");
  const [showBoltPass, setShowBoltPass]   = useState(false);
  const [boltLoginLoading, setBoltLoginLoading] = useState(false);
  const [boltToken, setBoltToken]         = useState(creds.boltToken ?? "");
  const [boltProjectId, setBoltProjectId] = useState(creds.boltProjectId ?? "");
  const [showBoltTok, setShowBoltTok]     = useState(false);
  const [boltSaving, setBoltSaving]       = useState(false);
  const [boltTest, setBoltTest]           = useState<TestState>("idle");

  // ── Lovable ────────────────────────────────────────────────────────────────
  const [lovEmail, setLovEmail]           = useState("");
  const [lovPass, setLovPass]             = useState("");
  const [showLovPass, setShowLovPass]     = useState(false);
  const [lovSaving, setLovSaving]         = useState(false);
  const [lovTest, setLovTest]             = useState<TestState>("idle");

  // ── Framer ──────────────────────────────────────────────────────────────────
  const [framerTab, setFramerTab]         = useState<"cookie" | "apikey">("cookie");
  const [framerSession, setFramerSession] = useState(creds.framerSession ?? "");
  const [framerApiKey, setFramerApiKey]   = useState(creds.framerApiKey ?? "");
  const [showFramerSession, setShowFramerSession] = useState(false);
  const [showFramerApiKey, setShowFramerApiKey]   = useState(false);
  const [framerSaving, setFramerSaving]   = useState(false);
  const [framerTest, setFramerTest]       = useState<TestState>("idle");

  // ── Prefs ──────────────────────────────────────────────────────────────────
  const [branch, setBranch] = useState(creds.defaultBranch ?? "main");

  // ── GitHub OAuth callback capture ──────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authed = params.get("github_authed");
    const error = params.get("github_error");
    if (authed || error) {
      window.history.replaceState({}, "", "/settings");
    }
    if (error) {
      toast.error(decodeURIComponent(error));
    }
    if (authed) {
      // Token was delivered via a short-lived cookie (never in the URL).
      const match = document.cookie.match(/(?:^|;\s*)gh_token=([^;]+)/);
      const token = match ? decodeURIComponent(match[1]) : null;
      // Immediately delete the cookie so it can't be replayed.
      document.cookie = "gh_token=; Max-Age=0; Path=/; SameSite=Strict";
      if (!token) {
        toast.error("OAuth cookie missing — please try connecting again.");
        return;
      }
      setGhSaving(true);
      getGitHubUser({ data: { token } })
        .then((user) => {
          updateCreds({ githubToken: token, githubUsername: user.login, githubName: user.name, githubEmail: user.email, githubId: user.id });
          toast.success(`Connected as @${user.login}`);
        })
        .catch(() => {
          toast.error("Token received but GitHub validation failed — try again.");
        })
        .finally(() => setGhSaving(false));
    }
  }, []);

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

  // ── bolt.new actions ───────────────────────────────────────────────────────
  const connectBolt = async () => {
    if (!boltEmail.trim() || !boltPass) {
      toast.error("Enter your bolt.new email and password");
      return;
    }
    setBoltLoginLoading(true);
    try {
      const r = await boltLogin({ data: { email: boltEmail.trim(), password: boltPass } });
      const cleanTok = cleanBoltToken(r.token);
      updateCreds({ boltToken: cleanTok, boltEmail: r.email, boltProjectId: "", boltSiteUrl: "" });
      setBoltToken(cleanTok);
      setBoltTest("ok");
      toast.success("bolt.new connected — now enter your Project ID below");
    } catch (e: any) {
      toast.error(e?.message ?? "Login failed");
      setBoltTest("fail");
      // If the error mentions SSO or fails, switch to cookie tab
      if (e?.message?.toLowerCase().includes("session cookie") || e?.message?.toLowerCase().includes("google") || e?.message?.toLowerCase().includes("github")) {
        setBoltTab("cookie");
      }
    } finally { setBoltLoginLoading(false); }
  };

  const saveBolt = async () => {
    const cleanTok = cleanBoltToken(boltToken);
    const cleanPid = cleanBoltProjectId(boltProjectId);
    if (!cleanTok || !cleanPid) {
      toast.error("Paste your __session cookie and Project ID");
      return;
    }
    setBoltSaving(true);
    try {
      const info = await validateBoltProject({ data: { token: cleanTok, projectId: cleanPid } });
      updateCreds({ boltToken: cleanTok, boltProjectId: cleanPid, boltSiteUrl: info.siteUrl });
      setBoltToken(cleanTok);
      setBoltProjectId(cleanPid);
      setBoltTest("ok");
      toast.success(
        info.siteUrl
          ? `bolt.new connected — ${info.siteUrl}`
          : "bolt.new connected — deploy your project once to enable badge removal"
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Connection failed");
      setBoltTest("fail");
    } finally { setBoltSaving(false); }
  };

  const saveProject = async () => {
    const tok = cleanBoltToken(creds.boltToken || boltToken);
    const cleanPid = cleanBoltProjectId(boltProjectId);
    if (!tok || !cleanPid) {
      toast.error("Enter your Project ID");
      return;
    }
    setBoltSaving(true);
    try {
      const info = await validateBoltProject({ data: { token: tok, projectId: cleanPid } });
      updateCreds({ boltProjectId: cleanPid, boltSiteUrl: info.siteUrl });
      setBoltProjectId(cleanPid);
      setBoltTest("ok");
      toast.success(
        info.siteUrl
          ? `Project linked — ${info.siteUrl}`
          : "Project linked — deploy it once in bolt.new to enable badge removal"
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Connection failed");
      setBoltTest("fail");
    } finally { setBoltSaving(false); }
  };

  const testBolt = async () => {
    const tok = cleanBoltToken(boltToken || creds.boltToken || "");
    const pid = cleanBoltProjectId(boltProjectId || creds.boltProjectId || "");
    if (!tok || !pid) {
      toast.error("Session token and Project ID are required to test");
      return;
    }
    setBoltTest("loading");
    try {
      await validateBoltProject({ data: { token: tok, projectId: pid } });
      setBoltTest("ok");
      toast.success("bolt.new connection verified!");
    } catch (e: any) {
      setBoltTest("fail");
      toast.error(e?.message ?? "bolt.new validation failed");
    }
  };

  // ── Lovable actions ────────────────────────────────────────────────────────
  const connectLovable = async () => {
    if (!lovEmail.trim() || !lovPass) { toast.error("Enter your Lovable email and password"); return; }
    setLovSaving(true);
    try {
      const r = await lovableLogin({ data: { email: lovEmail.trim(), password: lovPass } });
      updateCreds({ lovableToken: r.token, lovableRefreshToken: r.refreshToken, lovableEmail: r.email });
      setLovTest("ok");
      toast.success("Lovable connected");
    } catch (e: any) {
      toast.error(e?.message ?? "Login failed");
      setLovTest("fail");
    } finally { setLovSaving(false); }
  };

  const testLovable = async () => {
    const tok = creds.lovableToken;
    if (!tok) return;
    setLovTest("loading");
    try { await validateLovableToken({ data: { token: tok } }); setLovTest("ok"); }
    catch { setLovTest("fail"); }
  };

  // ── Framer actions ─────────────────────────────────────────────────────────
  const connectFramer = async () => {
    setFramerSaving(true);
    try {
      if (framerTab === "cookie") {
        const val = framerSession.trim();
        if (!val) { toast.error("Please enter your Framer session cookie"); return; }
        const res = await validateFramerAuth({ sessionCookie: val });
        updateCreds({
          framerSession: val,
          framerEmail: res.user?.email || "",
          displayName: creds.displayName || res.user?.name || "",
        });
        toast.success(`Connected to Framer${res.user?.name ? ` as ${res.user.name}` : ""}`);
      } else {
        const val = framerApiKey.trim();
        if (!val) { toast.error("Please enter your Framer Project API Key"); return; }
        await validateFramerAuth({ apiKey: val });
        updateCreds({ framerApiKey: val });
        toast.success("Framer API Key saved");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to connect to Framer");
    } finally {
      setFramerSaving(false);
    }
  };

  const testFramer = async () => {
    const sess = framerSession.trim() || creds.framerSession;
    const key = framerApiKey.trim() || creds.framerApiKey;
    if (!sess && !key) {
      toast.error("Enter a session cookie or API key first");
      return;
    }
    setFramerTest("loading");
    try {
      const res = await validateFramerAuth({ sessionCookie: sess, apiKey: key });
      setFramerTest("ok");
      toast.success(res.user?.name ? `Verified Framer account: ${res.user.name}` : "Framer credentials verified!");
    } catch (e: any) {
      setFramerTest("fail");
      toast.error(e.message || "Framer verification failed");
    }
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
            window.location.href = `/api/github-oauth?action=start&return_to=/settings`;
          }}
          disabled={ghSaving}
        >
          {ghSaving
            ? <><Loader2 size={14} style={{ animation: "spin 0.6s linear infinite" }} /> Connecting…</>
            : <><GitHubLogo size={14} /> Connect with GitHub</>}
        </button>

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
              <button onClick={() => setShowZitePass(!showZitePass)} aria-label={showZitePass ? "Hide password" : "Show password"} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", lineHeight: 1, padding: 0 }}>
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
            <button onClick={() => setShowFlootTok(!showFlootTok)} aria-label={showFlootTok ? "Hide token" : "Show token"} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", lineHeight: 1, padding: 0 }}>
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

      {/* ── bolt.new ── */}
      <SectionCard
        title="bolt.new"
        subtitle="bolt.new — email / password login"
        icon={<BoltLogo size={20} />}
        connected={!!creds.boltToken}
        onDisconnect={() => {
          updateCreds({ boltToken: "", boltEmail: "", boltProjectId: "", boltSiteUrl: "" });
          setBoltToken(""); setBoltProjectId(""); setBoltEmail(""); setBoltPass("");
          setBoltTest("idle"); toast.success("Disconnected");
        }}
      >
        {/* ── Connected state ── */}
        {creds.boltToken ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Account info */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f5f3ff", borderRadius: 8, border: "1px solid #ddd6fe" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <BoltLogo size={14} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>bolt.new</div>
                {creds.boltEmail && <div style={{ fontSize: 12, color: "#6d28d9" }}>{creds.boltEmail}</div>}
                {creds.boltSiteUrl && <div style={{ fontSize: 12, color: "#64748b" }}>Project: {creds.boltSiteUrl}</div>}
              </div>
            </div>

            {/* Project ID input (always shown when connected — needed for badge removal) */}
            <div>
              <label className="label">Project ID</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="input"
                  placeholder="e.g. abc123xyz (from bolt.new/~/PROJECT_ID)"
                  value={boltProjectId}
                  onChange={(e) => { setBoltProjectId(e.target.value.trim()); setBoltTest("idle"); }}
                  onKeyDown={(e) => e.key === "Enter" && saveProject()}
                />
                <TestBtn state={boltTest} onClick={testBolt} />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={saveProject}
                  disabled={boltSaving || !boltProjectId.trim()}
                >
                  {boltSaving
                    ? <Loader2 size={12} style={{ animation: "spin 0.6s linear infinite" }} />
                    : <Check size={12} />}
                  Save
                </button>
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "6px 0 0" }}>
                Your Project ID is in the editor URL: <code style={{ background: "#f1f5f9", padding: "1px 4px", borderRadius: 3 }}>bolt.new/~/PROJECT_ID</code>
              </p>
            </div>
          </div>
        ) : (
          /* ── Not connected — tabbed login ── */
          <>
            <div className="tabs" style={{ marginBottom: 12 }}>
              <button className={`tab${boltTab === "login"  ? " active" : ""}`} onClick={() => setBoltTab("login")}>Email / Password</button>
              <button className={`tab${boltTab === "cookie" ? " active" : ""}`} onClick={() => setBoltTab("cookie")}>Session Cookie</button>
            </div>

            {boltTab === "login" ? (
              /* Email / password tab */
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  className="input"
                  type="email"
                  placeholder="bolt.new email"
                  value={boltEmail}
                  onChange={(e) => setBoltEmail(e.target.value)}
                />
                <div style={{ position: "relative" }}>
                  <input
                    className="input"
                    type={showBoltPass ? "text" : "password"}
                    placeholder="Password"
                    value={boltPass}
                    onChange={(e) => setBoltPass(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && connectBolt()}
                    style={{ paddingRight: 36 }}
                  />
                  <button
                    onClick={() => setShowBoltPass(!showBoltPass)}
                    aria-label={showBoltPass ? "Hide password" : "Show password"}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", lineHeight: 1, padding: 0 }}
                  >
                    {showBoltPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                  Signed up with Google or GitHub?{" "}
                  <button onClick={() => setBoltTab("cookie")} style={{ border: "none", background: "none", color: "#f97316", cursor: "pointer", padding: 0, fontSize: 12, fontWeight: 600 }}>
                    Use the Session Cookie tab
                  </button>{" "}instead.
                </p>
                <button className="btn btn-primary" disabled={boltLoginLoading} onClick={connectBolt}>
                  {boltLoginLoading
                    ? <><span className="spinner spinner-sm" />Connecting…</>
                    : "Connect bolt.new →"}
                </button>
              </div>
            ) : (
              /* Session cookie tab */
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <label className="label">Session Cookie (__session)</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="input"
                      type={showBoltTok ? "text" : "password"}
                      placeholder="eyJkIjoiMTVo…"
                      value={boltToken}
                      onChange={(e) => { setBoltToken(e.target.value); setBoltTest("idle"); }}
                      style={{ paddingRight: 36 }}
                    />
                    <button
                      onClick={() => setShowBoltTok(!showBoltTok)}
                      aria-label={showBoltTok ? "Hide token" : "Show token"}
                      style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", lineHeight: 1, padding: 0 }}
                    >
                      {showBoltTok ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Project ID</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="input"
                      placeholder="e.g. abc123xyz (from bolt.new/~/PROJECT_ID)"
                      value={boltProjectId}
                      onChange={(e) => { setBoltProjectId(e.target.value.trim()); setBoltTest("idle"); }}
                      onKeyDown={(e) => e.key === "Enter" && saveBolt()}
                    />
                    <TestBtn state={boltTest} onClick={testBolt} />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={saveBolt}
                      disabled={boltSaving || !boltToken.trim() || !boltProjectId.trim()}
                    >
                      {boltSaving
                        ? <Loader2 size={12} style={{ animation: "spin 0.6s linear infinite" }} />
                        : <Check size={12} />}
                      Save
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                  Go to <a href="https://bolt.new" target="_blank" rel="noopener" style={{ color: "#f97316" }}>bolt.new</a> → DevTools (F12) → Application → Cookies → copy value of{" "}
                  <code style={{ background: "#f1f5f9", padding: "1px 4px", borderRadius: 3 }}>__session</code>.
                  Project ID is in the editor URL: <code style={{ background: "#f1f5f9", padding: "1px 4px", borderRadius: 3 }}>bolt.new/~/PROJECT_ID</code>.
                </p>
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* ── Lovable ── */}
      <SectionCard
        title="Lovable"
        subtitle="lovable.dev — email / password login"
        icon={<LovableLogo size={20} />}
        connected={!!creds.lovableToken}
        onDisconnect={() => {
          updateCreds({ lovableToken: "", lovableRefreshToken: "", lovableEmail: "" });
          setLovEmail(""); setLovPass(""); setLovTest("idle");
          toast.success("Disconnected");
        }}
      >
        {creds.lovableEmail && (
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
            Signed in as <strong>{creds.lovableEmail}</strong>
          </div>
        )}

        {creds.lovableToken ? (
          <TestBtn state={lovTest} onClick={testLovable} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              className="input"
              type="email"
              placeholder="Lovable email"
              value={lovEmail}
              onChange={(e) => setLovEmail(e.target.value)}
            />
            <div style={{ position: "relative" }}>
              <input
                className="input"
                type={showLovPass ? "text" : "password"}
                placeholder="Password"
                value={lovPass}
                onChange={(e) => setLovPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && connectLovable()}
                style={{ paddingRight: 36 }}
              />
              <button
                onClick={() => setShowLovPass(!showLovPass)}
                aria-label={showLovPass ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", lineHeight: 1, padding: 0 }}
              >
                {showLovPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
              Sign in with your <a href="https://lovable.dev" target="_blank" rel="noopener" style={{ color: "#f97316" }}>lovable.dev</a> account email and password.
            </p>
            <button className="btn btn-primary" disabled={lovSaving} onClick={connectLovable}
              style={{ background: "linear-gradient(135deg,#e11d48,#f43f5e)", borderColor: "transparent" }}>
              {lovSaving ? <><span className="spinner spinner-sm" />Connecting…</> : "Connect Lovable →"}
            </button>
          </div>
        )}
      </SectionCard>

      {/* ── Framer ── */}
      <SectionCard
        title="Framer"
        subtitle="Export React 19 code components & CMS collections from Framer"
        icon={<FramerLogo size={20} />}
        connected={!!(creds.framerSession || creds.framerApiKey)}
        onDisconnect={() => {
          updateCreds({ framerSession: "", framerApiKey: "", framerEmail: "", framerProjectUrl: "" });
          setFramerSession("");
          setFramerApiKey("");
          setFramerTest("idle");
          toast.success("Disconnected Framer");
        }}
      >
        {creds.framerEmail && (
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
            Connected account: <strong>{creds.framerEmail}</strong>
          </div>
        )}

        {creds.framerSession || creds.framerApiKey ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TestBtn state={framerTest} onClick={testFramer} />
            <span style={{ fontSize: 12, color: "#15803d", fontWeight: 600 }}>✓ Framer connected and ready to export</span>
          </div>
        ) : (
          <div>
            <div className="tabs" style={{ marginBottom: 12 }}>
              <button
                className={`tab${framerTab === "cookie" ? " active" : ""}`}
                onClick={() => setFramerTab("cookie")}
              >
                Session Cookie
              </button>
              <button
                className={`tab${framerTab === "apikey" ? " active" : ""}`}
                onClick={() => setFramerTab("apikey")}
              >
                Project API Key
              </button>
            </div>

            {framerTab === "cookie" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label className="label">Framer Session Cookie (session)</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="input"
                    type={showFramerSession ? "text" : "password"}
                    placeholder="c5bf6b8f-53b3-4383-..."
                    value={framerSession}
                    onChange={(e) => {
                      setFramerSession(e.target.value);
                      setFramerTest("idle");
                    }}
                    style={{ paddingRight: 36 }}
                  />
                  <button
                    onClick={() => setShowFramerSession(!showFramerSession)}
                    aria-label={showFramerSession ? "Hide cookie" : "Show cookie"}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#94a3b8",
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    {showFramerSession ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
                  Inspect network on <a href="https://framer.com" target="_blank" rel="noopener" style={{ color: "#ff5500" }}>framer.com</a> and copy the <code style={{ background: "#f1f5f9", padding: "1px 4px", borderRadius: 3 }}>session</code> cookie.
                </p>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button
                    className="btn btn-primary"
                    disabled={framerSaving || !framerSession.trim()}
                    onClick={connectFramer}
                    style={{ background: "#0d0b09", borderColor: "#26221f" }}
                  >
                    {framerSaving ? <><span className="spinner spinner-sm" />Connecting…</> : "Connect Framer →"}
                  </button>
                  <TestBtn state={framerTest} onClick={testFramer} />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label className="label">Project API Key</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="input"
                    type={showFramerApiKey ? "text" : "password"}
                    placeholder="ap_..."
                    value={framerApiKey}
                    onChange={(e) => {
                      setFramerApiKey(e.target.value);
                      setFramerTest("idle");
                    }}
                    style={{ paddingRight: 36 }}
                  />
                  <button
                    onClick={() => setShowFramerApiKey(!showFramerApiKey)}
                    aria-label={showFramerApiKey ? "Hide key" : "Show key"}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#94a3b8",
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    {showFramerApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
                  Found in your Framer project under <strong>Site Settings → General → API Keys</strong>.
                </p>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button
                    className="btn btn-primary"
                    disabled={framerSaving || !framerApiKey.trim()}
                    onClick={connectFramer}
                    style={{ background: "#0d0b09", borderColor: "#26221f" }}
                  >
                    {framerSaving ? <><span className="spinner spinner-sm" />Saving…</> : "Save API Key →"}
                  </button>
                  <TestBtn state={framerTest} onClick={testFramer} />
                </div>
              </div>
            )}
          </div>
        )}
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
