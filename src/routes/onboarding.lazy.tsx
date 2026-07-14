import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CheckCircle, Eye, EyeOff, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { GitHubLogo, Base44Logo, RocketLogo, FlootLogo, ZiteLogo, BoltLogo, LovableLogo } from "@/components/BrandLogos";
import { PlatformPicker, type PlatformOption } from "@/components/PlatformPicker";
import { RocketModal } from "@/components/RocketModal";
import { useApp } from "@/contexts/AppContext";
import { getGitHubUser } from "@/lib/github-api";
import { base44Login, validateBase44Token } from "@/lib/base44-api";
import { validateFlootToken } from "@/lib/floot-api";
import { loginToZite } from "@/lib/zite-api";
import { boltLogin } from "@/lib/bolt-api";
import { lovableLogin } from "@/lib/lovable-api";
import { markOnboardingDone } from "@/lib/storage";
import { toast } from "sonner";
import appLogo from "@/assets/logo.webp";

export const Route = createLazyFileRoute("/onboarding")({ component: OnboardingPage });

const ONBOARDING_PLATFORMS: Array<{ id: string; label: string; icon: React.ReactNode; credKey: string }> = [
  { id: "base44",  label: "Base44",     icon: <Base44Logo size={28} />,  credKey: "base44Token" },
  { id: "rocket",  label: "Rocket.new", icon: <RocketLogo size={28} />,  credKey: "rocketToken" },
  { id: "floot",   label: "Floot",      icon: <FlootLogo size={28} />,   credKey: "flootToken" },
  { id: "zite",    label: "Zite",       icon: <ZiteLogo size={28} />,    credKey: "ziteSession" },
  { id: "bolt",    label: "bolt.new",   icon: <BoltLogo size={28} />,    credKey: "boltToken" },
  { id: "lovable", label: "Lovable",    icon: <LovableLogo size={28} />, credKey: "lovableToken" },
];

export default function OnboardingPage() {
  const { creds, updateCreds } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ── GitHub ──────────────────────────────────────────────────────────────────
  const [ghToken, setGhToken]         = useState(creds.githubToken ?? "");
  const [showGhToken, setShowGhToken] = useState(false);
  const [ghLoading, setGhLoading]     = useState(false);
  const [ghError, setGhError]         = useState("");
  const [ghUser, setGhUser]           = useState<{ login: string; avatar_url: string } | null>(null);

  // ── Platform picker ─────────────────────────────────────────────────────────
  const [selectedPlatform, setSelectedPlatform] = useState<string>("base44");

  // ── Base44 ──────────────────────────────────────────────────────────────────
  const [b44Email, setB44Email]     = useState("");
  const [b44Password, setB44Password] = useState("");
  const [b44Token, setB44Token]     = useState("");
  const [b44Tab, setB44Tab]         = useState<"login" | "token">("login");
  const [showB44Pass, setShowB44Pass] = useState(false);
  const [b44Loading, setB44Loading] = useState(false);
  const [b44Error, setB44Error]     = useState("");

  // ── Rocket ──────────────────────────────────────────────────────────────────
  const [showRocketModal, setShowRocketModal] = useState(false);

  // ── Floot ───────────────────────────────────────────────────────────────────
  const [flootToken, setFlootToken]   = useState("");
  const [flootLoading, setFlootLoading] = useState(false);
  const [flootError, setFlootError]   = useState("");

  // ── Zite ────────────────────────────────────────────────────────────────────
  const [ziteEmail, setZiteEmail]   = useState("");
  const [zitePass, setZitePass]     = useState("");
  const [showZitePass, setShowZitePass] = useState(false);
  const [ziteLoading, setZiteLoading] = useState(false);
  const [ziteError, setZiteError]   = useState("");

  // ── bolt.new ─────────────────────────────────────────────────────────────────
  const [boltEmail, setBoltEmail]   = useState("");
  const [boltPass, setBoltPass]     = useState("");
  const [showBoltPass, setShowBoltPass] = useState(false);
  const [boltLoading, setBoltLoading] = useState(false);
  const [boltError, setBoltError]   = useState("");

  // ── Lovable ──────────────────────────────────────────────────────────────────
  const [lovEmail, setLovEmail]     = useState("");
  const [lovPass, setLovPass]       = useState("");
  const [showLovPass, setShowLovPass] = useState(false);
  const [lovLoading, setLovLoading] = useState(false);
  const [lovError, setLovError]     = useState("");

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const platformConnected = (id: string) => {
    if (id === "base44")  return !!creds.base44Token;
    if (id === "rocket")  return !!creds.rocketToken;
    if (id === "floot")   return !!creds.flootToken;
    if (id === "zite")    return !!creds.ziteSession;
    if (id === "bolt")    return !!creds.boltToken;
    if (id === "lovable") return !!creds.lovableToken;
    return false;
  };

  const hasAnyPlatform = ONBOARDING_PLATFORMS.some(p => platformConnected(p.id));

  // ── GitHub OAuth callback ───────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("github_token");
    const error = params.get("github_error");
    if (token || error) window.history.replaceState({}, "", "/onboarding");
    if (error) { setGhError(decodeURIComponent(error)); return; }
    if (token) {
      setGhLoading(true);
      getGitHubUser({ data: { token } })
        .then(user => {
          updateCreds({ githubToken: token, githubUsername: user.login, githubName: user.name, githubEmail: user.email, githubId: user.id });
          setGhUser(user);
          setTimeout(() => setStep(2), 700);
        })
        .catch(() => setGhError("Token received but validation failed — try again."))
        .finally(() => setGhLoading(false));
    }
  }, []);

  // ── Connect functions ───────────────────────────────────────────────────────
  const connectGitHub = async () => {
    if (!ghToken.trim()) { setGhError("Paste your GitHub token"); return; }
    setGhLoading(true); setGhError("");
    try {
      const user = await getGitHubUser({ data: { token: ghToken.trim() } });
      updateCreds({ githubToken: ghToken.trim(), githubUsername: user.login, githubName: user.name, githubEmail: user.email, githubId: user.id });
      setGhUser(user);
      setTimeout(() => setStep(2), 700);
    } catch (e: any) {
      setGhError(e?.message ?? "Invalid token");
    } finally { setGhLoading(false); }
  };

  const connectBase44 = async () => {
    setB44Loading(true); setB44Error("");
    try {
      if (b44Tab === "login") {
        if (!b44Email.trim() || !b44Password) { setB44Error("Enter email and password"); return; }
        const r = await base44Login({ data: { email: b44Email.trim(), password: b44Password } });
        updateCreds({ base44Token: r.token, base44Email: r.email, displayName: r.name });
        toast.success("Base44 connected!");
      } else {
        if (!b44Token.trim()) { setB44Error("Paste your API token"); return; }
        const info = await validateBase44Token({ data: { token: b44Token.trim() } });
        updateCreds({ base44Token: b44Token.trim(), base44Email: info.email, displayName: info.name });
        toast.success("Base44 connected!");
      }
    } catch (e: any) {
      setB44Error(e?.message ?? "Login failed");
      if (e?.message?.includes("Google") || e?.message?.includes("Auth Token")) setB44Tab("token");
    } finally { setB44Loading(false); }
  };

  const connectFloot = async () => {
    if (!flootToken.trim()) { setFlootError("Paste your session token"); return; }
    setFlootLoading(true); setFlootError("");
    try {
      const info = await validateFlootToken({ data: { token: flootToken.trim() } });
      updateCreds({ flootToken: flootToken.trim(), flootEmail: info.email });
      toast.success("Floot connected!");
    } catch (e: any) {
      setFlootError(e?.message ?? "Invalid token");
    } finally { setFlootLoading(false); }
  };

  const connectZite = async () => {
    if (!ziteEmail.trim() || !zitePass) { setZiteError("Enter email and password"); return; }
    setZiteLoading(true); setZiteError("");
    try {
      const r = await loginToZite({ data: { email: ziteEmail.trim(), password: zitePass } });
      updateCreds({ ziteSession: r.session, ziteCsrf: r.csrf, ziteEmail: r.email });
      toast.success("Zite connected!");
    } catch (e: any) {
      setZiteError(e?.message ?? "Login failed");
    } finally { setZiteLoading(false); }
  };

  const connectBolt = async () => {
    if (!boltEmail.trim() || !boltPass) { setBoltError("Enter email and password"); return; }
    setBoltLoading(true); setBoltError("");
    try {
      const r = await boltLogin({ data: { email: boltEmail.trim(), password: boltPass } });
      updateCreds({ boltToken: r.token, boltEmail: r.email });
      toast.success("bolt.new connected!");
    } catch (e: any) {
      setBoltError(e?.message ?? "Login failed");
    } finally { setBoltLoading(false); }
  };

  const connectLovable = async () => {
    if (!lovEmail.trim() || !lovPass) { setLovError("Enter email and password"); return; }
    setLovLoading(true); setLovError("");
    try {
      const r = await lovableLogin({ data: { email: lovEmail.trim(), password: lovPass } });
      updateCreds({ lovableToken: r.token, lovableEmail: r.email });
      toast.success("Lovable connected!");
    } catch (e: any) {
      setLovError(e?.message ?? "Login failed");
    } finally { setLovLoading(false); }
  };

  const finish = () => { markOnboardingDone(); navigate({ to: "/dashboard" }); };

  const stepLabels = ["Connect GitHub", "Connect Platform", "All set!"];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0eb", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src={appLogo} alt="Push44" style={{ width: 48, height: 48, borderRadius: 12, margin: "0 auto 10px" }} />
          <div style={{ fontWeight: 800, fontSize: 22, color: "#201515", letterSpacing: "-0.03em" }}>Push44</div>
          <div style={{ color: "#939084", fontSize: 13 }}>Push your apps to GitHub in one click</div>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
          {stepLabels.map((label, idx) => {
            const n = idx + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", flex: idx < stepLabels.length - 1 ? 1 : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, flexShrink: 0,
                    background: done ? "#16a34a" : active ? "#f97316" : "#e6e1da",
                    color: done || active ? "#fff" : "#939084",
                    transition: "background 0.2s",
                    boxShadow: active ? "0 2px 8px rgba(249,115,22,0.25)" : "none",
                  }}>
                    {done ? "✓" : n}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: active ? "#201515" : "#939084", whiteSpace: "nowrap" }}>{label}</div>
                </div>
                {idx < stepLabels.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: done ? "#16a34a" : "#e6e1da", margin: "0 8px", marginBottom: 20, transition: "background 0.3s" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: GitHub ── */}
        {step === 1 && (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <GitHubLogo size={22} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#201515" }}>Connect GitHub</div>
                <div style={{ fontSize: 12, color: "#939084" }}>Required to push files to your repos</div>
              </div>
            </div>

            {ghUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "#ecfdf5", border: "1px solid #bbf7d0", marginBottom: 12 }}>
                <img src={ghUser.avatar_url} alt={ghUser.login} style={{ width: 32, height: 32, borderRadius: "50%" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#201515" }}>@{ghUser.login}</div>
                  <div style={{ fontSize: 12, color: "#16a34a" }}>Connected ✓</div>
                </div>
              </div>
            ) : (
              <>
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", gap: 8, marginBottom: 16 }}
                  disabled={ghLoading}
                  onClick={() => { window.location.href = `/api/github-oauth?action=start&return_to=/onboarding`; }}
                >
                  {ghLoading
                    ? <><Loader2 size={14} style={{ animation: "spin 0.6s linear infinite" }} /> Connecting…</>
                    : <><GitHubLogo size={14} /> Continue with GitHub</>}
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ flex: 1, height: 1, background: "#e6e1da" }} />
                  <span style={{ fontSize: 11, color: "#939084", whiteSpace: "nowrap" }}>or paste a token manually</span>
                  <div style={{ flex: 1, height: 1, background: "#e6e1da" }} />
                </div>

                <div style={{ position: "relative", marginBottom: 10 }}>
                  <input
                    className="input"
                    type={showGhToken ? "text" : "password"}
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={ghToken}
                    onChange={e => setGhToken(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && connectGitHub()}
                    style={{ paddingRight: 40 }}
                  />
                  <button onClick={() => setShowGhToken(!showGhToken)} aria-label={showGhToken ? "Hide token" : "Show token"}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#939084", padding: 0 }}>
                    {showGhToken ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {ghError && <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#dc2626", fontSize: 13, marginBottom: 10 }}><AlertCircle size={14} />{ghError}</div>}
                <button className="btn btn-secondary" style={{ width: "100%" }} disabled={ghLoading || !ghToken.trim()} onClick={connectGitHub}>
                  Connect GitHub →
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Step 2: Platform ── */}
        {step === 2 && (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#201515", marginBottom: 4 }}>Connect a Platform</div>
              <div style={{ fontSize: 13, color: "#939084" }}>
                Pick any platform you build with. You can connect more later in Settings.
              </div>
            </div>

            {/* Grid picker */}
            <PlatformPicker
              platforms={ONBOARDING_PLATFORMS.map((p): PlatformOption => ({
                id: p.id,
                label: p.label,
                icon: p.icon,
                connected: platformConnected(p.id),
              }))}
              selected={selectedPlatform}
              onSelect={setSelectedPlatform}
            />

            {/* Per-platform form */}
            <div style={{ marginTop: 16 }}>

              {/* ── Base44 ── */}
              {selectedPlatform === "base44" && !platformConnected("base44") && (
                <PlatformForm title="Connect Base44">
                  <div className="tabs" style={{ marginBottom: 12 }}>
                    <button className={`tab${b44Tab === "login" ? " active" : ""}`} onClick={() => setB44Tab("login")}>Email / Password</button>
                    <button className={`tab${b44Tab === "token" ? " active" : ""}`} onClick={() => setB44Tab("token")}>API Token</button>
                  </div>
                  {b44Tab === "login" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input className="input" type="email" placeholder="Email" value={b44Email} onChange={e => setB44Email(e.target.value)} />
                      <div style={{ position: "relative" }}>
                        <input className="input" type={showB44Pass ? "text" : "password"} placeholder="Password" value={b44Password} onChange={e => setB44Password(e.target.value)} onKeyDown={e => e.key === "Enter" && connectBase44()} style={{ paddingRight: 40 }} />
                        <button onClick={() => setShowB44Pass(!showB44Pass)} aria-label={showB44Pass ? "Hide" : "Show"}
                          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#939084", padding: 0 }}>
                          {showB44Pass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <p style={{ fontSize: 12, color: "#605d52", margin: 0 }}>
                        Get your API key from <a href="https://app.base44.com/settings/account" target="_blank" rel="noopener" style={{ color: "#f97316" }}>app.base44.com/settings <ExternalLink size={10} style={{ display: "inline" }} /></a>
                      </p>
                      <input className="input" type="password" placeholder="Paste API key…" value={b44Token} onChange={e => setB44Token(e.target.value)} onKeyDown={e => e.key === "Enter" && connectBase44()} />
                    </div>
                  )}
                  {b44Error && <ErrorMsg>{b44Error}</ErrorMsg>}
                  <button className="btn btn-primary" style={{ width: "100%", marginTop: 10, justifyContent: "center" }} disabled={b44Loading} onClick={connectBase44}>
                    {b44Loading ? <><span className="spinner spinner-sm" />Connecting…</> : "Connect Base44 →"}
                  </button>
                </PlatformForm>
              )}
              {selectedPlatform === "base44" && platformConnected("base44") && <ConnectedBadge name="Base44" />}

              {/* ── Rocket.new ── */}
              {selectedPlatform === "rocket" && !platformConnected("rocket") && (
                <PlatformForm title="Connect Rocket.new">
                  <p style={{ fontSize: 13, color: "#605d52", margin: "0 0 12px" }}>Connects via a one-time email code — no password needed.</p>
                  <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setShowRocketModal(true)}>
                    Connect via Email Code →
                  </button>
                </PlatformForm>
              )}
              {selectedPlatform === "rocket" && platformConnected("rocket") && <ConnectedBadge name="Rocket.new" />}

              {/* ── Floot ── */}
              {selectedPlatform === "floot" && !platformConnected("floot") && (
                <PlatformForm title="Connect Floot">
                  <p style={{ fontSize: 12, color: "#605d52", margin: "0 0 10px" }}>
                    Get your session token from <a href="https://floot.com" target="_blank" rel="noopener" style={{ color: "#f97316" }}>floot.com</a> → open DevTools → Application → Cookies → copy <code style={{ fontSize: 11 }}>next-auth.session-token</code>
                  </p>
                  <input className="input" type="password" placeholder="Paste session token…" value={flootToken} onChange={e => setFlootToken(e.target.value)} onKeyDown={e => e.key === "Enter" && connectFloot()} />
                  {flootError && <ErrorMsg>{flootError}</ErrorMsg>}
                  <button className="btn btn-primary" style={{ width: "100%", marginTop: 10, justifyContent: "center" }} disabled={flootLoading} onClick={connectFloot}>
                    {flootLoading ? <><span className="spinner spinner-sm" />Connecting…</> : "Connect Floot →"}
                  </button>
                </PlatformForm>
              )}
              {selectedPlatform === "floot" && platformConnected("floot") && <ConnectedBadge name="Floot" />}

              {/* ── Zite ── */}
              {selectedPlatform === "zite" && !platformConnected("zite") && (
                <PlatformForm title="Connect Zite">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input className="input" type="email" placeholder="Email" value={ziteEmail} onChange={e => setZiteEmail(e.target.value)} />
                    <div style={{ position: "relative" }}>
                      <input className="input" type={showZitePass ? "text" : "password"} placeholder="Password" value={zitePass} onChange={e => setZitePass(e.target.value)} onKeyDown={e => e.key === "Enter" && connectZite()} style={{ paddingRight: 40 }} />
                      <button onClick={() => setShowZitePass(!showZitePass)} aria-label="Toggle" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#939084", padding: 0 }}>
                        {showZitePass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  {ziteError && <ErrorMsg>{ziteError}</ErrorMsg>}
                  <button className="btn btn-primary" style={{ width: "100%", marginTop: 10, justifyContent: "center" }} disabled={ziteLoading} onClick={connectZite}>
                    {ziteLoading ? <><span className="spinner spinner-sm" />Connecting…</> : "Connect Zite →"}
                  </button>
                </PlatformForm>
              )}
              {selectedPlatform === "zite" && platformConnected("zite") && <ConnectedBadge name="Zite" />}

              {/* ── bolt.new ── */}
              {selectedPlatform === "bolt" && !platformConnected("bolt") && (
                <PlatformForm title="Connect bolt.new">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input className="input" type="email" placeholder="bolt.new email" value={boltEmail} onChange={e => setBoltEmail(e.target.value)} />
                    <div style={{ position: "relative" }}>
                      <input className="input" type={showBoltPass ? "text" : "password"} placeholder="Password" value={boltPass} onChange={e => setBoltPass(e.target.value)} onKeyDown={e => e.key === "Enter" && connectBolt()} style={{ paddingRight: 40 }} />
                      <button onClick={() => setShowBoltPass(!showBoltPass)} aria-label="Toggle" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#939084", padding: 0 }}>
                        {showBoltPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  {boltError && <ErrorMsg>{boltError}</ErrorMsg>}
                  <button className="btn btn-primary" style={{ width: "100%", marginTop: 10, justifyContent: "center" }} disabled={boltLoading} onClick={connectBolt}>
                    {boltLoading ? <><span className="spinner spinner-sm" />Connecting…</> : "Connect bolt.new →"}
                  </button>
                </PlatformForm>
              )}
              {selectedPlatform === "bolt" && platformConnected("bolt") && <ConnectedBadge name="bolt.new" />}

              {/* ── Lovable ── */}
              {selectedPlatform === "lovable" && !platformConnected("lovable") && (
                <PlatformForm title="Connect Lovable">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input className="input" type="email" placeholder="Lovable email" value={lovEmail} onChange={e => setLovEmail(e.target.value)} />
                    <div style={{ position: "relative" }}>
                      <input className="input" type={showLovPass ? "text" : "password"} placeholder="Password" value={lovPass} onChange={e => setLovPass(e.target.value)} onKeyDown={e => e.key === "Enter" && connectLovable()} style={{ paddingRight: 40 }} />
                      <button onClick={() => setShowLovPass(!showLovPass)} aria-label="Toggle" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#939084", padding: 0 }}>
                        {showLovPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  {lovError && <ErrorMsg>{lovError}</ErrorMsg>}
                  <button className="btn btn-primary" style={{ width: "100%", marginTop: 10, justifyContent: "center" }} disabled={lovLoading} onClick={connectLovable}>
                    {lovLoading ? <><span className="spinner spinner-sm" />Connecting…</> : "Connect Lovable →"}
                  </button>
                </PlatformForm>
              )}
              {selectedPlatform === "lovable" && platformConnected("lovable") && <ConnectedBadge name="Lovable" />}
            </div>

            {/* Footer actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTop: "1px solid #e6e1da", gap: 12 }}>
              <button
                style={{ fontSize: 13, color: "#939084", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                onClick={() => setStep(3)}
              >
                Skip for now →
              </button>
              <button
                className="btn btn-primary"
                disabled={!hasAnyPlatform}
                onClick={() => setStep(3)}
                style={{ opacity: hasAnyPlatform ? 1 : 0.45 }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Done ── */}
        {step === 3 && (
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <CheckCircle size={48} color="#16a34a" style={{ margin: "0 auto 16px", display: "block" }} />
            <div style={{ fontWeight: 800, fontSize: 20, color: "#201515", marginBottom: 8 }}>You're all set!</div>
            <p style={{ color: "#605d52", fontSize: 14, margin: "0 0 24px", lineHeight: 1.65 }}>
              {hasAnyPlatform
                ? "Everything is connected. Push your first app to GitHub in one click."
                : "Connect your platforms in Settings whenever you're ready."}
            </p>
            <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={finish}>
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>

      {showRocketModal && (
        <RocketModal
          onSuccess={(token, email, companyId) => {
            updateCreds({ rocketToken: token, rocketEmail: email, rocketCompanyId: companyId });
            setShowRocketModal(false);
            toast.success("Rocket.new connected!");
          }}
          onClose={() => setShowRocketModal(false)}
        />
      )}
    </div>
  );
}

function PlatformForm({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #e6e1da", borderRadius: 10, padding: 16, background: "#f5f0eb" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#201515", marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function ConnectedBadge({ name }: { name: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 16px", borderRadius: 10,
      background: "#ecfdf5", border: "1px solid #bbf7d0",
    }}>
      <CheckCircle size={18} color="#16a34a" />
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#15803d" }}>{name} connected</div>
        <div style={{ fontSize: 12, color: "#16a34a" }}>Ready to push your apps</div>
      </div>
    </div>
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#dc2626", fontSize: 13, marginTop: 8 }}>
      <AlertCircle size={14} />{children}
    </div>
  );
}
