import { useState, useEffect, useRef } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { rocketRequestOTP, rocketVerifyOTP } from "@/lib/rocket-api";

interface Props {
  onSuccess: (token: string, email: string, companyId: string) => void;
  onClose: () => void;
}

export function RocketModal({ onSuccess, onClose }: Props) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "otp") setTimeout(() => otpRef.current?.focus(), 100);
  }, [step]);

  const sendOtp = async () => {
    if (!email.trim()) { setError("Enter your Rocket.new email"); return; }
    setError(""); setLoading(true);
    try {
      await rocketRequestOTP({ data: { email: email.trim() } });
      setStep("otp");
    } catch (e: any) {
      setError(e?.message ?? "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 4) { setError("Enter the verification code"); return; }
    setError(""); setLoading(true);
    try {
      const r = await rocketVerifyOTP({ data: { email: email.trim(), otp: otp.trim() } });
      setDone(true);
      setTimeout(() => onSuccess(r.token, email.trim(), r.companyId), 600);
    } catch (e: any) {
      setError(e?.message ?? "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 400, padding: 28, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, border: "none", background: "none", cursor: "pointer", color: "#64748b", padding: 4, lineHeight: 1 }}>
          <X size={18} />
        </button>

        {done ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <CheckCircle size={44} color="#22c55e" style={{ margin: "0 auto 12px", display: "block" }} />
            <div style={{ fontWeight: 800, fontSize: 17 }}>Connected to Rocket.new!</div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Connect Rocket.new</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>
                {step === "email" ? "We'll email you a one-time login code." : `Check ${email} for your code.`}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {step === "email" ? (
                <input
                  className="input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                  autoFocus
                />
              ) : (
                <>
                  <input
                    ref={otpRef}
                    className="input"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
                    style={{ letterSpacing: "0.25em", fontSize: 20, textAlign: "center" }}
                  />
                  <button className="btn btn-ghost btn-sm" onClick={() => { setStep("email"); setOtp(""); setError(""); }}>
                    ← Change email
                  </button>
                </>
              )}

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#dc2626", fontSize: 13 }}>
                  <AlertCircle size={14} />{error}
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: 4 }}
                disabled={loading}
                onClick={step === "email" ? sendOtp : verifyOtp}
              >
                {loading ? <><span className="spinner spinner-sm" />{step === "email" ? "Sending…" : "Verifying…"}</> : step === "email" ? "Send Code →" : "Verify Code →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
