import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Smartphone,
  Github,
  ShieldCheck,
  Zap,
  Check,
  Copy,
  ExternalLink,
  PackageCheck,
  QrCode,
  HardDriveDownload,
} from "lucide-react";
import appLogo from "@/assets/logo.png";

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AndroidAppModal({ isOpen, onClose }: AndroidAppModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const APK_DOWNLOAD_URL = "/Push44-release.apk";
  const GITHUB_RELEASE_URL = "https://github.com/The-habib/Push44/releases/tag/v1.0.0-apk";
  const SHA256_HASH = "51b81bb9f77dc240263ea54606c1eac8f566609b78c9df178f5f6b216503f5";

  const handleCopyHash = () => {
    navigator.clipboard.writeText(SHA256_HASH);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(10, 8, 7, 0.75)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 540,
              background: "#181411",
              border: "1px solid #2e2621",
              borderRadius: 20,
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 85, 0, 0.12)",
              color: "#fafaf9",
              overflow: "hidden",
            }}
          >
            {/* Header / Brand Banner */}
            <div
              style={{
                padding: "24px 28px 20px",
                borderBottom: "1px solid #28201a",
                background: "linear-gradient(180deg, rgba(255, 85, 0, 0.08) 0%, rgba(24, 20, 17, 0) 100%)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <img
                  src={appLogo}
                  alt="Push44"
                  style={{ width: 44, height: 44, borderRadius: 12, border: "1px solid rgba(255,85,0,0.3)" }}
                />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em", margin: 0, color: "#fff" }}>
                      Push44 for Android
                    </h2>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: "2px 8px",
                        background: "rgba(34, 197, 94, 0.15)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        color: "#4ade80",
                        borderRadius: 99,
                      }}
                    >
                      v1.0.0 Stable
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "#a8a29e", margin: "4px 0 0" }}>
                    Native Android client with background ZIP downloads & GPU acceleration
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close dialog"
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 10,
                  color: "#a8a29e",
                  padding: 7,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#a8a29e";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div style={{ padding: "24px 28px" }}>
              {/* Feature Highlights Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 22,
                }}
              >
                <FeatureBadge
                  icon={<Zap size={15} color="#ff5500" />}
                  title="GPU Accelerated"
                  desc="Ultra-smooth UI navigation"
                />
                <FeatureBadge
                  icon={<HardDriveDownload size={15} color="#ff5500" />}
                  title="Direct ZIP Exports"
                  desc="Android DownloadManager"
                />
                <FeatureBadge
                  icon={<ShieldCheck size={15} color="#22c55e" />}
                  title="100% Client-Side"
                  desc="Zero telemetry & zero servers"
                />
                <FeatureBadge
                  icon={<PackageCheck size={15} color="#38bdf8" />}
                  title="4.5 MB Lightweight"
                  desc="Zero bloat, instant launch"
                />
              </div>

              {/* Main Download CTA Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <a
                  href={APK_DOWNLOAD_URL}
                  download="Push44-release.apk"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: "14px 20px",
                    background: "linear-gradient(135deg, #ff5500 0%, #ea580c 100%)",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: 15,
                    borderRadius: 12,
                    textDecoration: "none",
                    boxShadow: "0 4px 16px rgba(255, 85, 0, 0.35)",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 6px 22px rgba(255, 85, 0, 0.45)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(255, 85, 0, 0.35)";
                  }}
                >
                  <Download size={18} />
                  Download Release APK (4.51 MB)
                </a>

                <div style={{ display: "flex", gap: 10 }}>
                  <a
                    href={GITHUB_RELEASE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "10px 14px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#fafaf9",
                      fontWeight: 600,
                      fontSize: 13,
                      borderRadius: 10,
                      textDecoration: "none",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
                  >
                    <Github size={15} /> GitHub Release <ExternalLink size={12} style={{ opacity: 0.6 }} />
                  </a>

                  <button
                    onClick={() => setShowQr(!showQr)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                      padding: "10px 16px",
                      background: showQr ? "rgba(255, 85, 0, 0.15)" : "rgba(255, 255, 255, 0.05)",
                      border: `1px solid ${showQr ? "rgba(255, 85, 0, 0.4)" : "rgba(255, 255, 255, 0.12)"}`,
                      color: showQr ? "#ff5500" : "#fafaf9",
                      fontWeight: 600,
                      fontSize: 13,
                      borderRadius: 10,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <QrCode size={15} /> {showQr ? "Hide QR" : "Scan QR"}
                  </button>
                </div>
              </div>

              {/* QR Code Collapsible */}
              <AnimatePresence>
                {showQr && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      background: "#110e0c",
                      border: "1px solid #2e2621",
                      borderRadius: 14,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        background: "#ffffff",
                        padding: 10,
                        borderRadius: 10,
                        marginBottom: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                          "https://push44.vercel.app/Push44-release.apk"
                        )}`}
                        alt="Scan to download APK"
                        style={{ width: 150, height: 150, display: "block" }}
                      />
                    </div>
                    <p style={{ fontSize: 12, color: "#a8a29e", margin: 0, textAlign: "center" }}>
                      Scan with your phone camera to download directly on Android
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3-Step Installation Guide */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid #28201a",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: "#ff5500", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Quick 3-Step Installation
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: "#d6d3d1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={stepNumberStyle}>1</span>
                    <span>Download <strong>Push44-release.apk</strong> using the button above.</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={stepNumberStyle}>2</span>
                    <span>Open your phone's <strong>Downloads</strong> folder or tap the download notification.</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={stepNumberStyle}>3</span>
                    <span>Tap <strong>Install</strong> (Allow <em>Install Unknown Apps</em> if prompted).</span>
                  </div>
                </div>
              </div>

              {/* SHA-256 Checksum Verification */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "#120e0b",
                  border: "1px solid #241c17",
                  borderRadius: 8,
                  fontSize: 11,
                  color: "#78716c",
                  fontFamily: "monospace",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <ShieldCheck size={13} color="#22c55e" />
                  <span>SHA-256: {SHA256_HASH.slice(0, 16)}...{SHA256_HASH.slice(-8)}</span>
                </div>
                <button
                  onClick={handleCopyHash}
                  style={{
                    background: "none",
                    border: "none",
                    color: copied ? "#22c55e" : "#a8a29e",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11,
                    padding: "2px 6px",
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FeatureBadge({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: 10,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <div style={{ marginTop: 2 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#f5f5f4" }}>{title}</div>
        <div style={{ fontSize: 11, color: "#78716c", marginTop: 1 }}>{desc}</div>
      </div>
    </div>
  );
}

const stepNumberStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: 99,
  background: "rgba(255, 85, 0, 0.2)",
  color: "#ff5500",
  fontSize: 10,
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
