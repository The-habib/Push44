import * as React from "react";
import { addPropertyControls, ControlType } from "framer";
import { motion } from "framer-motion";

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  badgeText: string;
  accentColor: string;
  showBadge: boolean;
}

export default function HeroSection({
  headline = "Ship beautiful React apps from your design canvas",
  subheadline = "The developer-first bridge connecting Framer design systems and live React codebases.",
  primaryCtaText = "Start Free Trial",
  secondaryCtaText = "View Live Demo",
  badgeText = "⚡ Powered by Framer Motion & React 19",
  accentColor = "#ff5500",
  showBadge = true,
}: HeroSectionProps) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        textAlign: "center",
        backgroundColor: "#0d0b09",
        color: "#ffffff",
        minHeight: "75vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {showBadge && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 14px",
            borderRadius: 999,
            backgroundColor: "rgba(255, 85, 0, 0.12)",
            border: `1px solid rgba(255, 85, 0, 0.3)`,
            color: accentColor,
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "24px",
          }}
        >
          {badgeText}
        </motion.div>
      )}

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          fontSize: "clamp(36px, 6vw, 68px)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          maxWidth: "840px",
          margin: "0 0 20px 0",
        }}
      >
        {headline}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          fontSize: "clamp(16px, 2vw, 20px)",
          color: "#a19992",
          maxWidth: "620px",
          lineHeight: 1.6,
          margin: "0 0 36px 0",
        }}
      >
        {subheadline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            backgroundColor: accentColor,
            color: "#ffffff",
            padding: "14px 28px",
            borderRadius: "12px",
            border: "none",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: `0 8px 24px -4px ${accentColor}60`,
          }}
        >
          {primaryCtaText}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04, backgroundColor: "rgba(255,255,255,0.08)" }}
          whileTap={{ scale: 0.96 }}
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            color: "#e4e4e7",
            padding: "14px 28px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.12)",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {secondaryCtaText}
        </motion.button>
      </motion.div>
    </section>
  );
}

addPropertyControls(HeroSection, {
  headline: {
    type: ControlType.String,
    title: "Headline",
    defaultValue: "Ship beautiful React apps from your design canvas",
  },
  subheadline: {
    type: ControlType.String,
    title: "Subheadline",
    defaultValue: "The developer-first bridge connecting Framer design systems and live React codebases.",
  },
  primaryCtaText: {
    type: ControlType.String,
    title: "Primary CTA",
    defaultValue: "Start Free Trial",
  },
  secondaryCtaText: {
    type: ControlType.String,
    title: "Secondary CTA",
    defaultValue: "View Live Demo",
  },
  badgeText: {
    type: ControlType.String,
    title: "Badge Text",
    defaultValue: "⚡ Powered by Framer Motion & React 19",
  },
  accentColor: {
    type: ControlType.Color,
    title: "Accent Color",
    defaultValue: "#ff5500",
  },
  showBadge: {
    type: ControlType.Boolean,
    title: "Show Badge",
    defaultValue: true,
  },
});
