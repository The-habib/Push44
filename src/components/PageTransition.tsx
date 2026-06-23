import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

export const EASE_OUT    = [0.22, 1, 0.36, 1]          as const;
export const EASE_INOUT  = [0.45, 0, 0.55, 1]          as const;
export const EASE_SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;
export const EASE_SPRING_SOFT = { type: "spring", stiffness: 280, damping: 28 } as const;
export const EASE_SPRING_SNAPPY = { type: "spring", stiffness: 540, damping: 38 } as const;

export function FadeUp({
  children,
  delay = 0,
  className = "",
  distance = 16,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  distance?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function BlurFade({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}) {
  const reduced = useReducedMotion();
  const dist = 18;
  const initial = reduced ? {} : {
    up:    { y: dist },
    down:  { y: -dist },
    left:  { x: dist },
    right: { x: -dist },
  }[direction];

  return (
    <motion.div
      initial={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(6px)", ...initial }}
      animate={{ opacity: 1, filter: "blur(0px)", x: 0, y: 0 }}
      transition={{ duration: 0.55, delay, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PopIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: reduced ? 1 : 0.82 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 28, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({
  children,
  delay = 0,
  className = "",
  from = "right",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  from?: "left" | "right" | "bottom";
}) {
  const reduced = useReducedMotion();
  const dist = 28;
  const initial = reduced ? {} : {
    left:   { x: -dist, opacity: 0 },
    right:  { x:  dist, opacity: 0 },
    bottom: { y:  dist, opacity: 0 },
  }[from];
  return (
    <motion.div
      initial={initial}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 30, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className = "",
  stagger = 0.07,
  delayChildren = 0.04,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: stagger, delayChildren } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.42, ease: EASE_OUT } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: reduced ? 1 : 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionCard({
  children,
  className = "",
  onClick,
  style,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={{ willChange: "transform", ...style }}
      onClick={onClick}
      whileHover={{
        y: -3,
        boxShadow: "0 12px 36px rgba(0,0,0,0.11)",
        transition: { type: "spring", stiffness: 480, damping: 30 },
      }}
      whileTap={{ scale: 0.985, transition: { type: "spring", stiffness: 600, damping: 32 } }}
    >
      {children}
    </motion.div>
  );
}

export function MotionButton({
  children,
  className = "",
  onClick,
  disabled,
  style,
  type = "button",
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
  type?: "button" | "submit";
}) {
  return (
    <motion.button
      type={type}
      className={className}
      style={{ willChange: "transform", ...style }}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.03, y: -1.5, transition: { type: "spring", stiffness: 500, damping: 30 } }}
      whileTap={disabled ? {} : { scale: 0.96, transition: { type: "spring", stiffness: 600, damping: 32 } }}
    >
      {children}
    </motion.button>
  );
}
