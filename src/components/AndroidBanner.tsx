import { useState, useEffect } from "react";
import { Smartphone, X, Download, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AndroidBannerProps {
  onOpenModal: () => void;
}

export function AndroidBanner({ onOpenModal }: AndroidBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on client side
    if (typeof window === "undefined") return;

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isDismissed = localStorage.getItem("push44_android_banner_dismissed") === "true";

    if (isAndroid && !isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("push44_android_banner_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          style={{
            background: "linear-gradient(90deg, #181411 0%, #241c17 100%)",
            borderBottom: "1px solid rgba(255, 85, 0, 0.3)",
            color: "#fafaf9",
            padding: "10px 16px",
            position: "relative",
            zIndex: 60,
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(255, 85, 0, 0.15)",
                  border: "1px solid rgba(255, 85, 0, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ff5500",
                  flexShrink: 0,
                }}
              >
                <Smartphone size={15} />
              </div>
              <div style={{ fontSize: 13, color: "#d6d3d1" }}>
                <strong style={{ color: "#fff" }}>Using Android?</strong> Install the native Push44 App for direct ZIP exports & background downloads.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={onOpenModal}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  background: "#ff5500",
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: 800,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(255, 85, 0, 0.3)",
                }}
              >
                <Download size={13} />
                Get Android APK
              </button>

              <button
                onClick={handleDismiss}
                aria-label="Dismiss banner"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#a8a29e",
                  cursor: "pointer",
                  padding: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
