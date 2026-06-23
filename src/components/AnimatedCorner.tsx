import { motion } from "framer-motion";

type CornerVariant =
  | "dashboard"
  | "push"
  | "repos"
  | "history"
  | "settings"
  | "onboarding";

const PALETTE: Record<CornerVariant, { a: string; b: string; c: string }> = {
  dashboard:  { a: "#e9e4f8", b: "#dce99a", c: "#fde2cf" },
  push:       { a: "#ede9fe", b: "#ddd6fe", c: "#c7d2fe" },
  repos:      { a: "#dcfce7", b: "#dce99a", c: "#d1fae5" },
  history:    { a: "#fff7ed", b: "#fde2cf", c: "#fef3c7" },
  settings:   { a: "#f0ebff", b: "#e9e4f8", c: "#ede9fe" },
  onboarding: { a: "#f0ebff", b: "#fff7ed", c: "#e9e4f8" },
};

export function AnimatedCorner({ variant = "dashboard" }: { variant?: CornerVariant }) {
  const { a, b, c } = PALETTE[variant];
  return (
    <>
      {/* Top-right primary orb — drifts diagonally */}
      <motion.div
        className="fixed top-0 right-0 w-[520px] h-[520px] pointer-events-none -z-10 rounded-full"
        style={{
          background: `radial-gradient(circle at 70% 30%, ${a} 0%, transparent 68%)`,
          filter: "blur(52px)",
        }}
        animate={{
          x: [0, -28, 10, -14, 0],
          y: [0, 18, -12, 22, 0],
          scale: [1, 1.07, 0.96, 1.04, 1],
          opacity: [0.72, 1, 0.76, 0.95, 0.72],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
      />

      {/* Bottom-left secondary orb — counter-drifts */}
      <motion.div
        className="fixed bottom-0 left-0 w-[420px] h-[420px] pointer-events-none -z-10 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 70%, ${b} 0%, transparent 66%)`,
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, 20, -12, 16, 0],
          y: [0, -22, 14, -10, 0],
          scale: [1, 1.09, 0.94, 1.06, 1],
          opacity: [0.55, 0.82, 0.5, 0.75, 0.55],
        }}
        transition={{
          duration: 17,
          delay: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.3, 0.55, 0.8, 1],
        }}
      />

      {/* Center accent orb — slow float */}
      <motion.div
        className="fixed top-1/2 left-1/2 w-[300px] h-[300px] pointer-events-none -z-10 rounded-full"
        style={{
          marginLeft: -150,
          marginTop: -150,
          background: `radial-gradient(circle at 50% 50%, ${c} 0%, transparent 70%)`,
          filter: "blur(72px)",
        }}
        animate={{
          x: [0, 30, -20, 14, 0],
          y: [0, -18, 24, -12, 0],
          scale: [0.8, 1.05, 0.88, 0.98, 0.8],
          opacity: [0.2, 0.42, 0.22, 0.36, 0.2],
        }}
        transition={{
          duration: 22,
          delay: 4,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.28, 0.55, 0.78, 1],
        }}
      />
    </>
  );
}
