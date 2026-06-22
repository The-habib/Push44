import { motion, useReducedMotion } from "framer-motion";

type CornerVariant =
  | "dashboard"
  | "push"
  | "repos"
  | "history"
  | "settings"
  | "onboarding";

const VARIANTS: Record<CornerVariant, { primary: string; secondary: string; accent: string }> = {
  dashboard: { primary: "#8b5cf6", secondary: "#dce99a", accent: "#f97316" },
  push:       { primary: "#7c3aed", secondary: "#a78bfa", accent: "#dce99a" },
  repos:      { primary: "#22c55e", secondary: "#dce99a", accent: "#8b5cf6" },
  history:    { primary: "#f97316", secondary: "#fde2cf", accent: "#8b5cf6" },
  settings:   { primary: "#8b5cf6", secondary: "#e9e4f8", accent: "#22c55e" },
  onboarding: { primary: "#f97316", secondary: "#8b5cf6", accent: "#dce99a" },
};

function FloatingOrb({
  x, y, size, color, delay, duration,
}: { x: string; y: string; size: number; color: string; delay: number; duration: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color, filter: "blur(1px)" }}
      animate={reduced ? {} : {
        y: [0, -18, 6, -10, 0],
        x: [0, 10, -6, 8, 0],
        scale: [1, 1.08, 0.95, 1.04, 1],
        opacity: [0.7, 1, 0.8, 1, 0.7],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function SpinningRing({
  x, y, size, color, delay, clockwise,
}: { x: string; y: string; size: number; color: string; delay: number; clockwise: boolean }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y, width: size, height: size,
        border: `2px solid ${color}`,
        opacity: 0.4,
      }}
      animate={reduced ? {} : { rotate: clockwise ? 360 : -360 }}
      transition={{ duration: 12 + delay * 2, delay, repeat: Infinity, ease: "linear" }}
    />
  );
}

function Particle({
  x, y, color, delay,
}: { x: string; y: string; color: string; delay: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: 4, height: 4, background: color }}
      animate={reduced ? {} : {
        y: [0, -24, 0],
        opacity: [0, 1, 0],
        scale: [0.5, 1.5, 0.5],
      }}
      transition={{ duration: 2.4, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function GlowBlob({
  x, y, size, color, delay,
}: { x: string; y: string; size: number; color: string; delay: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y, width: size, height: size,
        background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
        filter: "blur(8px)",
      }}
      animate={reduced ? {} : {
        scale: [1, 1.3, 1],
        opacity: [0.5, 0.9, 0.5],
      }}
      transition={{ duration: 4 + delay, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function BouncingDot({
  x, y, color, delay, size = 6,
}: { x: string; y: string; color: string; delay: number; size?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color }}
      animate={reduced ? {} : { y: [0, -10, 0], opacity: [1, 0.5, 1] }}
      transition={{ duration: 1.6, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function AnimatedCorner({ variant = "dashboard" }: { variant?: CornerVariant }) {
  const { primary, secondary, accent } = VARIANTS[variant];

  return (
    <>
      {/* ── Top-right corner cluster ───────────────────────── */}
      <div className="fixed top-0 right-0 w-64 h-64 pointer-events-none overflow-hidden z-0" aria-hidden>
        <GlowBlob x="40%" y="-10%" size={140} color={primary} delay={0} />
        <GlowBlob x="60%" y="10%" size={90} color={secondary} delay={1.5} />
        <FloatingOrb x="70%" y="8%" size={20} color={primary + "cc"} delay={0} duration={4.5} />
        <FloatingOrb x="55%" y="22%" size={12} color={secondary + "aa"} delay={1.2} duration={3.8} />
        <FloatingOrb x="82%" y="30%" size={8} color={accent + "99"} delay={0.6} duration={5} />
        <SpinningRing x="60%" y="5%" size={55} color={primary} delay={0} clockwise />
        <SpinningRing x="52%" y="18%" size={30} color={secondary} delay={2} clockwise={false} />
        <Particle x="65%" y="35%" color={primary} delay={0} />
        <Particle x="75%" y="20%" color={secondary} delay={0.8} />
        <Particle x="58%" y="45%" color={accent} delay={1.6} />
      </div>

      {/* ── Bottom-left corner cluster ─────────────────────── */}
      <div className="fixed bottom-0 left-0 w-56 h-56 pointer-events-none overflow-hidden z-0" aria-hidden>
        <GlowBlob x="-10%" y="40%" size={120} color={secondary} delay={0.8} />
        <GlowBlob x="10%" y="60%" size={80} color={primary} delay={2.2} />
        <FloatingOrb x="8%" y="55%" size={16} color={secondary + "cc"} delay={0.3} duration={4} />
        <FloatingOrb x="22%" y="40%" size={10} color={primary + "99"} delay={1.8} duration={5.2} />
        <SpinningRing x="5%" y="50%" size={44} color={secondary} delay={1} clockwise={false} />
        <BouncingDot x="30%" y="60%" color={primary} delay={0} />
        <BouncingDot x="15%" y="72%" color={secondary} delay={0.5} />
        <BouncingDot x="40%" y="50%" color={accent} delay={1} size={4} />
        <Particle x="20%" y="55%" color={primary} delay={0.4} />
        <Particle x="35%" y="68%" color={accent} delay={1.2} />
      </div>

      {/* ── Top-left subtle accent ─────────────────────────── */}
      <div className="fixed top-0 left-0 w-40 h-40 pointer-events-none overflow-hidden z-0" aria-hidden>
        <GlowBlob x="-15%" y="-15%" size={100} color={accent} delay={1} />
        <FloatingOrb x="5%" y="10%" size={10} color={accent + "88"} delay={2} duration={6} />
        <BouncingDot x="18%" y="22%" color={primary} delay={1.3} size={5} />
      </div>

      {/* ── Bottom-right subtle accent ─────────────────────── */}
      <div className="fixed bottom-16 right-0 w-36 h-36 pointer-events-none overflow-hidden z-0" aria-hidden>
        <GlowBlob x="50%" y="50%" size={90} color={accent} delay={0.5} />
        <FloatingOrb x="60%" y="60%" size={9} color={accent + "aa"} delay={1.1} duration={3.5} />
        <BouncingDot x="45%" y="45%" color={secondary} delay={0.9} size={4} />
      </div>
    </>
  );
}
