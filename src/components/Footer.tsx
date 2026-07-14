import { Link } from "@tanstack/react-router";
import { Shield, Github, Twitter } from "lucide-react";
import appLogo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer style={{ background: "#18120e", color: "#8a7f78" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 24px 0" }}>

        {/* Top grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "40px 48px",
          paddingBottom: 56,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>

          {/* Brand column */}
          <div style={{ gridColumn: "span 2" }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, textDecoration: "none", marginBottom: 16 }}>
              <img src={appLogo} alt="Push44" style={{ width: 30, height: 30, borderRadius: 7 }} />
              <span style={{ fontWeight: 800, fontSize: 16, color: "#fffefb", letterSpacing: "-0.03em" }}>Push44</span>
            </Link>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#605d52", maxWidth: 220, margin: "0 0 24px" }}>
              Export AI-generated code from any platform to GitHub. Free, zero backend, no data collected.
            </p>

            {/* Trust badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              fontSize: 12, fontWeight: 600, color: "#605d52",
              padding: "6px 13px", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 99, marginBottom: 20,
            }}>
              <Shield size={13} color="#f97316" /> Free Forever · No Signup
            </div>

            {/* Social links */}
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { icon: <Github size={15} />, href: "https://github.com/push44", label: "GitHub" },
                { icon: <Twitter size={15} />, href: "https://twitter.com/push44app", label: "Twitter" },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank" rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 34, height: 34, borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#605d52",
                    textDecoration: "none",
                    transition: "color 0.15s, border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = "#fffefb";
                    el.style.borderColor = "rgba(255,255,255,0.18)";
                    el.style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = "#605d52";
                    el.style.borderColor = "rgba(255,255,255,0.08)";
                    el.style.background = "transparent";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Product" links={[
            { label: "Features",       href: "/#features" },
            { label: "Platforms",      href: "/#platforms" },
            { label: "How it works",   href: "/#how-it-works" },
            { label: "FAQ",            href: "/#faq" },
          ]} />

          <FooterCol title="Platforms" links={[
            { label: "Base44",      to: "/platforms/$platform", params: { platform: "base44" } },
            { label: "Rocket.new",  to: "/platforms/$platform", params: { platform: "rocket-new" } },
            { label: "Floot",       to: "/platforms/$platform", params: { platform: "floot" } },
            { label: "Zite",        to: "/platforms/$platform", params: { platform: "zite" } },
            { label: "bolt.new",    to: "/platforms/$platform", params: { platform: "bolt-new" } },
          ]} />

          <FooterCol title="Resources" links={[
            { label: "Blog",         to: "/blog/" },
            { label: "Guides",       to: "/blog/" },
            { label: "Comparisons",  to: "/compare/base44-vs-rocket-new" },
          ]} />

          <FooterCol title="Company" links={[
            { label: "Privacy Policy",   to: "/privacy" },
            { label: "Terms of Service", to: "/terms" },
          ]} />
        </div>

        {/* Bottom bar */}
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center",
          justifyContent: "space-between", gap: 12,
          padding: "22px 0", fontSize: 12, color: "#3d3530",
        }}>
          <span>© 2026 Push44. All rights reserved.</span>
          <span style={{ color: "#3d3530" }}>Made for developers who own their code</span>
        </div>
      </div>
    </footer>
  );
}

type FooterLink = { label: string; href?: string; to?: string; params?: Record<string, string> };

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  const linkStyle: React.CSSProperties = {
    display: "block", fontSize: 13, color: "#605d52",
    textDecoration: "none", padding: "3px 0",
    transition: "color 0.12s",
  };
  return (
    <div>
      <h4 style={{
        fontSize: 10, fontWeight: 700, color: "#4a4540",
        textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 18,
      }}>{title}</h4>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 11 }}>
        {links.map(l => (
          <li key={l.label}>
            {l.to
              ? <Link to={l.to as any} params={l.params as any} style={linkStyle}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c5c0b1"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#605d52"}
                >{l.label}</Link>
              : <a href={l.href} target={l.href?.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer" style={linkStyle}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c5c0b1"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#605d52"}
                >{l.label}</a>
            }
          </li>
        ))}
      </ul>
    </div>
  );
}
