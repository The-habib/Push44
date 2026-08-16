import * as React from "react";
import { addPropertyControls, ControlType } from "framer";
import { motion } from "framer-motion";

interface Tier {
  name: string;
  price: number;
  description: string;
  popular?: boolean;
  features: string[];
}

interface PricingTableProps {
  sectionTitle: string;
  sectionSubtitle: string;
  annualDiscountPercentage: number;
  accentColor: string;
}

const defaultTiers: Tier[] = [
  {
    name: "Starter",
    price: 0,
    description: "For hobbyists and individual creators exploring Framer exports.",
    features: ["Up to 3 Framer exports / month", "Standard GitHub Sync", "Community Discord Support"],
  },
  {
    name: "Pro",
    price: 29,
    popular: true,
    description: "For freelance designers and developers delivering client projects.",
    features: [
      "Unlimited Framer & Vite Exports",
      "Instant GitHub PR & Branch Sync",
      "Custom Domain Deploys",
      "Framer Motion Animation Presets",
      "Priority 24/7 Support",
    ],
  },
  {
    name: "Team",
    price: 79,
    description: "For agencies and design teams managing multiple project workspaces.",
    features: [
      "Everything in Pro",
      "Unlimited Team Seats",
      "Shared CMS Schemas & Data",
      "Automated CI/CD Webhooks",
      "Dedicated Account Manager",
    ],
  },
];

export default function PricingTable({
  sectionTitle = "Simple, transparent pricing",
  sectionSubtitle = "Export your Framer designs into production React code with zero vendor lock-in.",
  annualDiscountPercentage = 20,
  accentColor = "#ff5500",
}: PricingTableProps) {
  const [isAnnual, setIsAnnual] = React.useState(true);

  return (
    <section
      style={{
        padding: "80px 24px",
        backgroundColor: "#120f0d",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2
        style={{
          fontSize: "clamp(30px, 4vw, 44px)",
          fontWeight: 700,
          textAlign: "center",
          margin: "0 0 16px 0",
          letterSpacing: "-0.02em",
        }}
      >
        {sectionTitle}
      </h2>

      <p
        style={{
          fontSize: "16px",
          color: "#a19992",
          textAlign: "center",
          maxWidth: "540px",
          margin: "0 0 32px 0",
          lineHeight: 1.5,
        }}
      >
        {sectionSubtitle}
      </p>

      {/* Billing toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "rgba(255,255,255,0.06)",
          padding: "6px 12px",
          borderRadius: 999,
          marginBottom: "48px",
          cursor: "pointer",
        }}
        onClick={() => setIsAnnual(!isAnnual)}
      >
        <span style={{ fontSize: "14px", color: !isAnnual ? "#ffffff" : "#a19992", fontWeight: 500 }}>
          Monthly
        </span>
        <div
          style={{
            width: "44px",
            height: "24px",
            backgroundColor: isAnnual ? accentColor : "rgba(255,255,255,0.2)",
            borderRadius: "12px",
            position: "relative",
            transition: "background-color 0.2s ease",
          }}
        >
          <motion.div
            animate={{ x: isAnnual ? 22 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#ffffff",
              borderRadius: "50%",
              position: "absolute",
              top: "2px",
            }}
          />
        </div>
        <span style={{ fontSize: "14px", color: isAnnual ? "#ffffff" : "#a19992", fontWeight: 500 }}>
          Annual <span style={{ color: accentColor, fontWeight: 700 }}>(-{annualDiscountPercentage}%)</span>
        </span>
      </div>

      {/* Pricing Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          maxWidth: "1080px",
          width: "100%",
        }}
      >
        {defaultTiers.map((tier) => {
          const finalPrice = isAnnual
            ? Math.round(tier.price * (1 - annualDiscountPercentage / 100))
            : tier.price;

          return (
            <motion.div
              key={tier.name}
              whileHover={{ y: -6 }}
              style={{
                backgroundColor: tier.popular ? "#1c1815" : "#161311",
                border: tier.popular ? `2px solid ${accentColor}` : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "36px 28px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: tier.popular ? `0 16px 32px -8px ${accentColor}25` : "none",
              }}
            >
              {tier.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: accentColor,
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    padding: "4px 12px",
                    borderRadius: 999,
                  }}
                >
                  Most Popular
                </div>
              )}

              <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px 0" }}>{tier.name}</h3>
              <p style={{ fontSize: "14px", color: "#a19992", margin: "0 0 24px 0", minHeight: "42px" }}>
                {tier.description}
              </p>

              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "28px" }}>
                <span style={{ fontSize: "40px", fontWeight: 800 }}>${finalPrice}</span>
                <span style={{ fontSize: "14px", color: "#a19992" }}>/ month</span>
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", flex: 1 }}>
                {tier.features.map((feature, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "14px",
                      color: "#d4d4d8",
                      marginBottom: "12px",
                    }}
                  >
                    <span style={{ color: accentColor, fontWeight: "bold" }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: tier.popular ? "none" : "1px solid rgba(255,255,255,0.15)",
                  backgroundColor: tier.popular ? accentColor : "transparent",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Choose {tier.name}
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

addPropertyControls(PricingTable, {
  sectionTitle: {
    type: ControlType.String,
    title: "Title",
    defaultValue: "Simple, transparent pricing",
  },
  sectionSubtitle: {
    type: ControlType.String,
    title: "Subtitle",
    defaultValue: "Export your Framer designs into production React code with zero vendor lock-in.",
  },
  annualDiscountPercentage: {
    type: ControlType.Number,
    title: "Annual Discount %",
    defaultValue: 20,
    min: 0,
    max: 50,
  },
  accentColor: {
    type: ControlType.Color,
    title: "Accent Color",
    defaultValue: "#ff5500",
  },
});
