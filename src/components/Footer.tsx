import { Link } from "@tanstack/react-router";
import { Shield, Github, Terminal, Sparkles, Heart, Smartphone, Download } from "lucide-react";
import appLogo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer style={{ background: "#120e0b", color: "#a8a29e", borderTop: "1px solid #241c17" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 24px 0" }}>
        {/* Top Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "40px 48px",
            paddingBottom: 56,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Brand Column */}
          <div style={{ gridColumn: "span 2", minWidth: 240 }}>
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                textDecoration: "none",
                marginBottom: 16,
              }}
            >
              <img src={appLogo} alt="Push44" style={{ width: 30, height: 30, borderRadius: 8 }} />
              <span style={{ fontWeight: 900, fontSize: 18, color: "#fafaf9", letterSpacing: "-0.04em" }}>
                Push44
              </span>
            </Link>
            <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#78716c", maxWidth: 280, margin: "0 0 20px" }}>
              The universal developer hub to export AI-generated code from Base44, Framer, Lovable, Rocket, Floot, and Zite directly to GitHub. 100% free, zero backend.
            </p>

            {/* Privacy & Android Badges */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#ff5500",
                  padding: "6px 14px",
                  border: "1px solid rgba(255,85,0,0.25)",
                  background: "rgba(255,85,0,0.08)",
                  borderRadius: 99,
                  width: "fit-content",
                }}
              >
                <Shield size={13} /> Zero Backend · 100% Client-Side Privacy
              </div>

              <a
                href="/Push44-release.apk"
                download="Push44-release.apk"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#38bdf8",
                  padding: "6px 14px",
                  border: "1px solid rgba(56,189,248,0.25)",
                  background: "rgba(56,189,248,0.08)",
                  borderRadius: 99,
                  width: "fit-content",
                  textDecoration: "none",
                  transition: "background 0.15s ease",
                }}
              >
                <Smartphone size={13} /> Android APK v1.0.0 (4.5 MB)
              </a>
            </div>
          </div>

          <FooterCol
            title="Product"
            links={[
              { label: "Features", href: "/#features" },
              { label: "Android App (APK)", href: "/Push44-release.apk" },
              { label: "Terminal CLI (p44)", href: "/#cli" },
              { label: "Platforms", href: "/#platforms" },
              { label: "FAQ", href: "/#faq" },
            ]}
          />

          <FooterCol
            title="Platforms"
            links={[
              { label: "Base44", to: "/platforms/$platform", params: { platform: "base44" } },
              { label: "Framer", to: "/platforms/$platform", params: { platform: "framer" } },
              { label: "Lovable", to: "/platforms/$platform", params: { platform: "lovable" } },
              { label: "Rocket.new", to: "/platforms/$platform", params: { platform: "rocket-new" } },
              { label: "Floot", to: "/platforms/$platform", params: { platform: "floot" } },
              { label: "Zite", to: "/platforms/$platform", params: { platform: "zite" } },
              { label: "bolt.new", to: "/platforms/$platform", params: { platform: "bolt-new" } },
            ]}
          />

          <FooterCol
            title="Resources"
            links={[
              { label: "Blog & Tutorials", to: "/blog/" },
              { label: "Tool Comparisons", to: "/compare/base44-vs-rocket-new" },
              { label: "Export Best Practices", to: "/blog/ai-project-backup-best-practices/" },
              { label: "Code Ownership Guide", to: "/blog/ai-code-ownership-guide/" },
              { label: "GitHub Release APK", href: "https://github.com/The-habib/Push44/releases/tag/v1.0.0-apk" },
            ]}
          />

          <FooterCol
            title="Legal & Trust"
            links={[
              { label: "Privacy Policy", to: "/privacy" },
              { label: "Terms of Service", to: "/terms" },
            ]}
          />
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            padding: "28px 0 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            fontSize: 13,
            color: "#78716c",
          }}
        >
          <div>© {new Date().getFullYear()} Push44. Built for developer code ownership.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>Free forever · No credit card required</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{
    label: string;
    href?: string;
    to?: string;
    params?: Record<string, string>;
  }>;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "#fafaf9",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map((link) => {
          const style: React.CSSProperties = {
            fontSize: 13.5,
            color: "#a8a29e",
            textDecoration: "none",
            transition: "color 0.15s ease",
          };
          if (link.to) {
            return (
              <Link
                key={link.label}
                to={link.to as any}
                params={link.params as any}
                style={style}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ff5500")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#a8a29e")}
              >
                {link.label}
              </Link>
            );
          }
          return (
            <a
              key={link.label}
              href={link.href}
              download={link.href?.endsWith(".apk") ? "Push44-release.apk" : undefined}
              target={link.href?.startsWith("http") ? "_blank" : undefined}
              rel={link.href?.startsWith("http") ? "noopener noreferrer" : undefined}
              style={style}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ff5500")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#a8a29e")}
            >
              {link.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
