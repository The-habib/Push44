import { motion } from "framer-motion";

type CornerVariant =
  | "dashboard"
  | "push"
  | "repos"
  | "history"
  | "settings"
  | "onboarding";

const PALETTE: Record<CornerVariant, { a: string; b: string }> = {
  dashboard: { a: "#e9e4f8", b: "#dce99a" },
  push:      { a: "#ede9fe", b: "#ddd6fe" },
  repos:     { a: "#dcfce7", b: "#dce99a" },
  history:   { a: "#fff7ed", b: "#fde2cf" },
  settings:  { a: "#f0ebff", b: "#e9e4f8" },
  onboarding:{ a: "#f0ebff", b: "#fff7ed" },
};

export function AnimatedCorner({ variant = "dashboard" }: { variant?: CornerVariant }) {
  const { a, b } = PALETTE[variant];
  return (
    <>
      <motion.div
        className="fixed top-0 right-0 w-[480px] h-[480px] pointer-events-none -z-10 rounded-full"
        style={{ background: `radial-gradient(circle at 80% 20%, ${a} 0%, transparent 65%)`, filter: "blur(48px)" }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed bottom-0 left-0 w-[380px] h-[380px] pointer-events-none -z-10 rounded-full"
        style={{ background: `radial-gradient(circle at 20% 80%, ${b} 0%, transparent 65%)`, filter: "blur(56px)" }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 10, delay: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}
