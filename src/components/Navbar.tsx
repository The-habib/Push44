import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, Github, ArrowRight } from "lucide-react";
import appLogo from "@/assets/logo.png";

const GITHUB_URL = "https://github.com/The-habib/Push44";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: s => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLanding = pathname === "/";
  const isBlog = pathname.startsWith("/blog");
  const isCompare = pathname.startsWith("/compare");
  const isPlatforms = pathname.startsWith("/platforms");

  return (
    <>
      <header
        style={{
          position: "sticky", top: 0, zIndex: 50,
          background: scrolled ? "rgba(255,255,255,0.96)" : "#fff",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: "1px solid #e4e4e7",
          transition: "background 0.2s",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
            <img src={appLogo} alt="Push44" style={{ width: 28, height: 28, objectFit: "contain" }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: "#09090b", letterSpacing: "-0.02em" }}>Push44</span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }} className="hidden-mobile">
            {isLanding && (
              <>
                <NavLink href="#features">Features</NavLink>
                <NavLink href="#platforms">Platforms</NavLink>
                <NavLink href="#how-it-works">How it works</NavLink>
                <NavLink href="#faq">FAQ</NavLink>
              </>
            )}
            <NavLink to="/blog/" active={isBlog}>Blog</NavLink>
            <NavLink to="/compare/base44-vs-rocket-new" active={isCompare}>Compare</NavLink>
            <NavLink href={GITHUB_URL} external>
              <Github size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
              GitHub
            </NavLink>
          </nav>

          {/* CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Link
              to="/onboarding"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                height: 34, padding: "0 14px",
                background: "#f97316", color: "#fff",
                fontWeight: 600, fontSize: 13, borderRadius: 7,
                textDecoration: "none", transition: "background 0.15s",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#ea6c0a"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "#f97316"}
            >
              Launch App <ArrowRight size={13} />
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: "none", padding: 7, borderRadius: 6, border: "1px solid #e4e4e7", background: "transparent", cursor: "pointer", color: "#52525b" }}
              className="show-mobile"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "fixed", top: 56, left: 0, right: 0, zIndex: 49, background: "#fff", borderBottom: "1px solid #e4e4e7", padding: "12px 20px 16px" }} className="show-mobile">
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {isLanding && (
              <>
                <MobileNavLink href="#features" onClick={() => setMenuOpen(false)}>Features</MobileNavLink>
                <MobileNavLink href="#platforms" onClick={() => setMenuOpen(false)}>Platforms</MobileNavLink>
                <MobileNavLink href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</MobileNavLink>
                <MobileNavLink href="#faq" onClick={() => setMenuOpen(false)}>FAQ</MobileNavLink>
              </>
            )}
            <MobileNavLink to="/blog/" onClick={() => setMenuOpen(false)}>Blog</MobileNavLink>
            <MobileNavLink href={GITHUB_URL}>GitHub</MobileNavLink>
            <div style={{ marginTop: 8 }}>
              <Link
                to="/onboarding"
                onClick={() => setMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 14px", background: "#f97316", color: "#fff", fontWeight: 600, fontSize: 14, borderRadius: 7, textDecoration: "none" }}
              >
                Launch App <ArrowRight size={14} />
              </Link>
            </div>
          </nav>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function NavLink({
  href, to, children, active, external,
}: {
  href?: string; to?: string; children: React.ReactNode; active?: boolean; external?: boolean;
}) {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center",
    padding: "5px 10px", borderRadius: 6,
    fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em",
    textDecoration: "none", transition: "background 0.12s, color 0.12s",
    color: active ? "#09090b" : "#71717a",
    background: active ? "#f4f4f5" : "transparent",
    whiteSpace: "nowrap",
  };

  if (to) {
    return (
      <Link to={to as any} style={baseStyle}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#f4f4f5"; (e.currentTarget as HTMLAnchorElement).style.color = "#09090b"; }}
        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "#71717a"; } }}
      >
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} style={baseStyle}
      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#f4f4f5"; (e.currentTarget as HTMLAnchorElement).style.color = "#09090b"; }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "#71717a"; } }}
    >
      {children}
    </a>
  );
}

function MobileNavLink({ href, to, children, onClick }: { href?: string; to?: string; children: React.ReactNode; onClick?: () => void }) {
  const s: React.CSSProperties = { display: "block", padding: "9px 12px", borderRadius: 6, fontSize: 14, fontWeight: 500, color: "#3f3f46", textDecoration: "none" };
  if (to) return <Link to={to as any} style={s} onClick={onClick}>{children}</Link>;
  return <a href={href} style={s} onClick={onClick}>{children}</a>;
}
