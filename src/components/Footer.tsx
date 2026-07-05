import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import appLogo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer style={{ background: "#09090b", color: "#a1a1aa" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 20px 0" }}>

        {/* Top grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 40, paddingBottom: 48, borderBottom: "1px solid #27272a" }}>

          {/* Brand */}
          <div style={{ gridColumn: "span 2" }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 12 }}>
              <img src={appLogo} alt="Push44" style={{ width: 28, height: 28 }} />
              <span style={{ fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "-0.02em" }}>Push44</span>
            </Link>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: "#71717a", maxWidth: 240, margin: "0 0 20px" }}>
              Export AI-generated code from any platform to GitHub. Free, zero backend, no data collected.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: "#71717a", padding: "6px 12px", border: "1px solid #27272a", borderRadius: 6 }}>
              <Shield size={13} /> Free Forever
            </div>
          </div>

          {/* Product */}
          <FooterCol title="Product" links={[
            { label: "Features", href: "/#features" },
            { label: "Platforms", href: "/#platforms" },
            { label: "How it works", href: "/#how-it-works" },
            { label: "FAQ", href: "/#faq" },
          ]} />

          {/* Platforms */}
          <FooterCol title="Platforms" links={[
            { label: "Base44", to: "/platforms/$platform", params: { platform: "base44" } },
            { label: "Rocket.new", to: "/platforms/$platform", params: { platform: "rocket-new" } },
            { label: "Floot", to: "/platforms/$platform", params: { platform: "floot" } },
            { label: "Zite", to: "/platforms/$platform", params: { platform: "zite" } },
          ]} />

          {/* Resources */}
          <FooterCol title="Resources" links={[
            { label: "Blog", to: "/blog/" },
            { label: "Guides", to: "/blog/" },
            { label: "Comparisons", to: "/compare/base44-vs-rocket-new" },
          ]} />

          {/* Legal */}
          <FooterCol title="Company" links={[
            { label: "Privacy Policy", to: "/privacy" },
            { label: "Terms of Service", to: "/terms" },
          ]} />
        </div>

        {/* Bottom bar */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "20px 0", fontSize: 12, color: "#52525b" }}>
          <span>© 2026 Push44. All rights reserved.</span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span>Made for developers who own their code</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

type FooterLink = { label: string; href?: string; to?: string; params?: Record<string, string> };

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  const linkStyle: React.CSSProperties = { display: "block", fontSize: 13, color: "#71717a", textDecoration: "none", padding: "3px 0", transition: "color 0.12s" };
  return (
    <div>
      <h4 style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>{title}</h4>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(l => (
          <li key={l.label}>
            {l.to
              ? <Link to={l.to as any} params={l.params as any} style={linkStyle}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#e4e4e7"}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#71717a"}
                >{l.label}</Link>
              : <a href={l.href} target={l.href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={linkStyle}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#e4e4e7"}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#71717a"}
                >{l.label}</a>
            }
          </li>
        ))}
      </ul>
    </div>
  );
}
