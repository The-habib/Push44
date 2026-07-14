import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import appLogo from "@/assets/logo.png";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const pathname = useRouterState({ select: s => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLanding   = pathname === "/";
  const isBlog      = pathname.startsWith("/blog");
  const isCompare   = pathname.startsWith("/compare");

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: scrolled ? "rgba(255,254,251,0.95)" : "#fffefb",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: `1px solid ${scrolled ? "#e6e1da" : "#ede8e2"}`,
        transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
        boxShadow: scrolled ? "0 1px 12px rgba(32,21,21,0.07)" : "none",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 24px", height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>

          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
            <img src={appLogo} alt="Push44" style={{ width: 28, height: 28, objectFit: "contain" }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#201515", letterSpacing: "-0.03em" }}>Push44</span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 1, flex: 1, justifyContent: "center" }} className="hidden-mobile">
            {isLanding && (
              <>
                <NavLink href="#features">Features</NavLink>
                <NavLink href="#platforms">Platforms</NavLink>
                <NavLink href="#how-it-works">How it works</NavLink>
                <NavLink href="#faq">FAQ</NavLink>
              </>
            )}
            <NavLink to="/blog/"    active={isBlog}>Blog</NavLink>
            <NavLink to="/compare/base44-vs-rocket-new" active={isCompare}>Compare</NavLink>
          </nav>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Link
              to="/onboarding"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                height: 36, padding: "0 16px",
                background: "#f97316", color: "#fff",
                fontWeight: 700, fontSize: 13, borderRadius: 10,
                textDecoration: "none", letterSpacing: "-0.01em",
                boxShadow: "0 1px 3px rgba(0,0,0,0.10), 0 4px 12px rgba(249,115,22,0.22)",
                transition: "background 0.15s, box-shadow 0.15s, transform 0.12s",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "#ea6c0a";
                el.style.transform = "translateY(-1px)";
                el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12), 0 6px 20px rgba(249,115,22,0.30)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "#f97316";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.10), 0 4px 12px rgba(249,115,22,0.22)";
              }}
            >
              Launch App <ArrowRight size={13} strokeWidth={2.5} />
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: "none", padding: "6px 7px", borderRadius: 8,
                border: "1px solid #e6e1da", background: "transparent",
                cursor: "pointer", color: "#605d52",
                transition: "background 0.15s",
              }}
              className="show-mobile"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: 56, left: 0, right: 0, zIndex: 49,
          background: "#fffefb", borderBottom: "1px solid #e6e1da",
          padding: "12px 20px 18px",
          boxShadow: "0 8px 24px rgba(32,21,21,0.10)",
        }} className="show-mobile">
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {isLanding && (
              <>
                <MobileNavLink href="#features"    onClick={() => setMenuOpen(false)}>Features</MobileNavLink>
                <MobileNavLink href="#platforms"   onClick={() => setMenuOpen(false)}>Platforms</MobileNavLink>
                <MobileNavLink href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</MobileNavLink>
                <MobileNavLink href="#faq"         onClick={() => setMenuOpen(false)}>FAQ</MobileNavLink>
              </>
            )}
            <MobileNavLink to="/blog/" onClick={() => setMenuOpen(false)}>Blog</MobileNavLink>
            <div style={{ marginTop: 10 }}>
              <Link
                to="/onboarding"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "11px 14px",
                  background: "#f97316", color: "#fff",
                  fontWeight: 700, fontSize: 14, borderRadius: 10,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(249,115,22,0.28)",
                }}
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
          .show-mobile   { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
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
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center",
    padding: "5px 11px", borderRadius: 7,
    fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em",
    textDecoration: "none", transition: "background 0.12s, color 0.12s",
    color: active ? "#201515" : "#939084",
    background: active ? "#f5f0eb" : "transparent",
    whiteSpace: "nowrap",
  };
  const onEnter = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.background = "#f5f0eb";
    el.style.color = "#201515";
  };
  const onLeave = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    if (!active) {
      el.style.background = "transparent";
      el.style.color = "#939084";
    }
  };
  if (to) return <Link to={to as any} style={base} onMouseEnter={onEnter} onMouseLeave={onLeave}>{children}</Link>;
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
      style={base} onMouseEnter={onEnter} onMouseLeave={onLeave}
    >{children}</a>
  );
}

function MobileNavLink({ href, to, children, onClick }: { href?: string; to?: string; children: React.ReactNode; onClick?: () => void }) {
  const s: React.CSSProperties = {
    display: "block", padding: "10px 12px", borderRadius: 8,
    fontSize: 14, fontWeight: 500, color: "#2f2a26", textDecoration: "none",
    transition: "background 0.12s",
  };
  if (to) return <Link to={to as any} style={s} onClick={onClick}>{children}</Link>;
  return <a href={href} style={s} onClick={onClick}>{children}</a>;
}
