import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CheckCircle, Eye, EyeOff, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { GitHubLogo, Base44Logo, RocketLogo } from "@/components/BrandLogos";
import { RocketModal } from "@/components/RocketModal";
import { useApp } from "@/contexts/AppContext";
import { getGitHubUser } from "@/lib/github-api";
import { base44Login, validateBase44Token } from "@/lib/base44-api";
import { markOnboardingDone } from "@/lib/storage";
import { toast } from "sonner";
import appLogo from "@/assets/logo.webp";

export const Route = createLazyFileRoute("/onboarding")({ component: OnboardingPage });

export default function OnboardingPage() {
  const { creds, updateCreds } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // GitHub
  const [ghToken, setGhToken] = useState(creds.githubToken ?? "");
  const [showGhToken, setShowGhToken] = useState(false);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState("");
  const [ghUser, setGhUser] = useState<{ login: string; avatar_url: string } | null>(null);

  // Base44
  const [b44Email, setB44Email] = useState("");
  const [b44Password, setB44Password] = useState("");
  const [b44Token, setB44Token] = useState("");
  const [b44Tab, setB44Tab] = useState<"login" | "token">("login");
  const [showB44Pass, setShowB44Pass] = useState(false);
  const [b44Loading, setB44Loading] = useState(false);
  const [b44Error, setB44Error] = useState("");

  // Rocket
  const [showRocketModal, setShowRocketModal] = useState(false);

  const platform = step === 3 ? (creds.base44Token ? "base44" : creds.rocketToken ? "rocket" : null) : null;

  // ── GitHub OAuth callback capture ──────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("github_token");
    const error = params.get("github_error");
    if (token || error) window.history.replaceState({}, "", "/onboarding");
    if (error) { setGhError(decodeURIComponent(error)); return; }
    if (token) {
      setGhLoading(true);
      getGitHubUser({ data: { token } })
        .then((user) => {
          updateCreds({ githubToken: token, githubUsername: user.login });
          setGhUser(user);
          setTimeout(() => setStep(2), 700);
        })
        .catch(() => setGhError("Token received but validation failed — try again."))
        .finally(() => setGhLoading(false));
    }
  }, []);

  const connectGitHub = async () => {
    if (!ghToken.trim()) { setGhError("Paste your GitHub token"); return; }
    setGhLoading(true); setGhError("");
    try {
      const user = await getGitHubUser({ data: { token: ghToken.trim() } });
      updateCreds({ githubToken: ghToken.trim(), githubUsername: user.login });
      setGhUser(user);
      setTimeout(() => setStep(2), 700);
    } catch (e: any) {
      setGhError(e?.message ?? "Invalid token");
    } finally {
      setGhLoading(false);
    }
  };

  const connectBase44Login = async () => {
    if (!b44Email.trim() || !b44Password) { setB44Error("Enter email and password"); return; }
    setB44Loading(true); setB44Error("");
    try {
      const r = await base44Login({ data: { email: b44Email.trim(), password: b44Password } });
      updateCreds({ base44Token: r.token, base44Email: r.email, displayName: r.name });
      setStep(3);
    } catch (e: any) {
      setB44Error(e?.message ?? "Login failed");
      if (e?.message?.includes("Google") || e?.message?.includes("Auth Token")) setB44Tab("token");
    } finally {
      setB44Loading(false);
    }
  };

  const connectBase44Token = async () => {
    if (!b44Token.trim()) { setB44Error("Paste your API token"); return; }
    setB44Loading(true); setB44Error("");
    try {
      const info = await validateBase44Token({ data: { token: b44Token.trim() } });
      updateCreds({ base44Token: b44Token.trim(), base44Email: info.email, displayName: info.name });
      setStep(3);
    } catch (e: any) {
      setB44Error(e?.message ?? "Invalid token");
    } finally {
      setB44Loading(false);
    }
  };

  const finish = () => {
    markOnboardingDone();
    navigate({ to: "/dashboard" });
  };

  const stepLabels = ["Connect GitHub", "Connect Platform", "All set!"];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src={appLogo} alt="Push44" style={{ width: 48, height: 48, borderRadius: 12, margin: "0 auto 10px" }} />
          <div style={{ fontWeight: 800, fontSize: 22 }}>Push44</div>
          <div style={{ color: "#64748b", fontSize: 13 }}>Push your apps to GitHub in one click</div>
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
                    background: done ? "#22c55e" : active ? "#f97316" : "#e2e8f0",
                    color: done || active ? "#fff" : "#94a3b8",
                    transition: "background 0.2s",
                  }}>
                    {done ? "✓" : n}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: active ? "#0f172a" : "#94a3b8", whiteSpace: "nowrap" }}>{label}</div>
                </div>
                {idx < stepLabels.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: done ? "#22c55e" : "#e2e8f0", margin: "0 8px", marginBottom: 20, transition: "background 0.2s" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1 — GitHub */}
        {step === 1 && (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <GitHubLogo size={22} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Connect GitHub</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>Required to push files to your repos</div>
              </div>
            </div>

            {ghUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", marginBottom: 12 }}>
                <img src={ghUser.avatar_url} alt={ghUser.login} style={{ width: 32, height: 32, borderRadius: "50%" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>@{ghUser.login}</div>
                  <div style={{ fontSize: 12, color: "#15803d" }}>Connected ✓</div>
                </div>
              </div>
            ) : (
              <>
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", gap: 8, marginBottom: 16 }}
                  disabled={ghLoading}
                  onClick={() => {
                    window.location.href = `/api/github-oauth?action=start&return_to=/onboarding`;
                  }}
                >
                  {ghLoading
                    ? <><Loader2 size={14} style={{ animation: "spin 0.6s linear infinite" }} /> Connecting…</>
                    : <><GitHubLogo size={14} /> Continue with GitHub</>}
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                  <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>or paste a token manually</span>
                  <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                </div>

                <div style={{ position: "relative", marginBottom: 10 }}>
                  <input
                    className="input"
                    type={showGhToken ? "text" : "password"}
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={ghToken}
                    onChange={(e) => setGhToken(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && connectGitHub()}
                    style={{ paddingRight: 40 }}
                  />
                  <button onClick={() => setShowGhToken(!showGhToken)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}>
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

        {/* Step 2 — Platform */}
        {step === 2 && (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Connect a Platform</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Connect Base44 or Rocket.new to fetch your apps.</div>

            {/* Base44 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Base44Logo size={20} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Base44</span>
              </div>
              <div className="tabs" style={{ marginBottom: 12 }}>
                <button className={`tab${b44Tab === "login" ? " active" : ""}`} onClick={() => setB44Tab("login")}>Email / Password</button>
                <button className={`tab${b44Tab === "token" ? " active" : ""}`} onClick={() => setB44Tab("token")}>API Token</button>
              </div>
              {b44Tab === "login" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input className="input" type="email" placeholder="Email" value={b44Email} onChange={(e) => setB44Email(e.target.value)} />
                  <div style={{ position: "relative" }}>
                    <input className="input" type={showB44Pass ? "text" : "password"} placeholder="Password" value={b44Password} onChange={(e) => setB44Password(e.target.value)} onKeyDown={(e) => e.key === "Enter" && connectBase44Login()} style={{ paddingRight: 40 }} />
                    <button onClick={() => setShowB44Pass(!showB44Pass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}>
                      {showB44Pass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Get your API key from <a href="https://app.base44.com/settings/account" target="_blank" rel="noopener" style={{ color: "#f97316" }}>app.base44.com/settings/account <ExternalLink size={10} style={{ display: "inline" }} /></a></p>
                  <input className="input" type="password" placeholder="Paste API key…" value={b44Token} onChange={(e) => setB44Token(e.target.value)} onKeyDown={(e) => e.key === "Enter" && connectBase44Token()} />
                </div>
              )}
              {b44Error && <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#dc2626", fontSize: 13, marginTop: 8 }}><AlertCircle size={14} />{b44Error}</div>}
              <button className="btn btn-primary" style={{ width: "100%", marginTop: 10 }} disabled={b44Loading} onClick={b44Tab === "login" ? connectBase44Login : connectBase44Token}>
                {b44Loading ? <><span className="spinner spinner-sm" />Connecting…</> : "Connect Base44 →"}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              <span style={{ fontSize: 12, color: "#94a3b8" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>

            {/* Rocket */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <RocketLogo size={20} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Rocket.new</span>
              </div>
              <button className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setShowRocketModal(true)}>
                Connect via Email Code →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Done */}
        {step === 3 && (
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <CheckCircle size={48} color="#22c55e" style={{ margin: "0 auto 16px", display: "block" }} />
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>You're all set!</div>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>
              Push your first app to GitHub in one click.
            </p>
            <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={finish}>
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
            setStep(3);
          }}
          onClose={() => setShowRocketModal(false)}
        />
      )}
    </div>
  );
}
