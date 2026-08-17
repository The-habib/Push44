import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Terminal, UploadCloud, LayoutDashboard, Settings, Layers, BookOpen, Smartphone } from "lucide-react";
import appLogo from "@/assets/logo.png";
import { AndroidAppModal } from "./AndroidAppModal";
import { AndroidBanner } from "./AndroidBanner";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [androidModalOpen, setAndroidModalOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLanding   = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");
  const isPush      = pathname.startsWith("/push");
  const isSettings  = pathname.startsWith("/settings");
  const isRepos     = pathname.startsWith("/repositories");
  const isBlog      = pathname.startsWith("/blog");
  const isCompare   = pathname.startsWith("/compare");

  const isInApp = isDashboard || isPush || isSettings || isRepos;

  return (
    <>
      <AndroidBanner onOpenModal={() => setAndroidModalOpen(true)} />
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: scrolled ? "rgba(250, 248, 245, 0.94)" : "rgba(250, 248, 245, 0.8)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: `1px solid ${scrolled ? "#e7e2db" : "rgba(231, 226, 219, 0.6)"}`,
          transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
          boxShadow: scrolled ? "0 2px 14px rgba(25, 20, 17, 0.05)" : "none",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 20px",
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Brand Logo */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <img src={appLogo} alt="Push44" style={{ width: 28, height: 28, objectFit: "contain" }} />
            <span style={{ fontWeight: 900, fontSize: 16, color: "#191411", letterSpacing: "-0.04em" }}>
              Push44
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              flex: 1,
              justifyContent: "center",
            }}
            className="hidden-mobile"
          >
            {isInApp ? (
              <>
                <NavLink to="/push" active={isPush}>
                  <UploadCloud size={14} /> Push App
                </NavLink>
                <NavLink to="/dashboard" active={isDashboard}>
                  <LayoutDashboard size={14} /> Dashboard
                </NavLink>
                <NavLink to="/repositories" active={isRepos}>
                  <Layers size={14} /> Repos
                </NavLink>
                <NavLink to="/settings" active={isSettings}>
                  <Settings size={14} /> Settings
                </NavLink>
                <NavLink to="/blog/" active={isBlog}>
                  <BookOpen size={14} /> Blog
                </NavLink>
              </>
            ) : (
              <>
                {isLanding && (
                  <>
                    <NavLink href="#features">Features</NavLink>
                    <NavLink href="#android">Android App</NavLink>
                    <NavLink href="#cli">CLI Terminal</NavLink>
                    <NavLink href="#platforms">Platforms</NavLink>
                    <NavLink href="#faq">FAQ</NavLink>
                  </>
                )}
                <NavLink to="/dashboard" active={isDashboard}>Dashboard</NavLink>
                <NavLink to="/blog/" active={isBlog}>Blog</NavLink>
                <NavLink to="/compare/base44-vs-rocket-new" active={isCompare}>Compare</NavLink>
              </>
            )}
          </nav>

          {/* Action CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
            {/* Android APK Modal Trigger Button */}
            <button
              onClick={() => setAndroidModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 35,
                padding: "0 12px",
                background: "rgba(255, 85, 0, 0.08)",
                color: "#ff5500",
                fontWeight: 700,
                fontSize: 13,
                borderRadius: 9,
                border: "1px solid rgba(255, 85, 0, 0.25)",
                cursor: "pointer",
                letterSpacing: "-0.01em",
                transition: "all 0.15s ease",
              }}
              className="hidden-mobile"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 85, 0, 0.14)";
                e.currentTarget.style.borderColor = "rgba(255, 85, 0, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 85, 0, 0.08)";
                e.currentTarget.style.borderColor = "rgba(255, 85, 0, 0.25)";
              }}
            >
              <Smartphone size={14} />
              <span>Android APK</span>
            </button>

            <a
              href="#cli"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 35,
                padding: "0 12px",
                background: "#ffffff",
                color: "#191411",
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 9,
                textDecoration: "none",
                border: "1px solid #e7e2db",
                letterSpacing: "-0.01em",
                transition: "all 0.15s ease",
              }}
              className="hidden-mobile"
            >
              <Terminal size={13} color="#ff5500" />
              <span>CLI</span>
            </a>

            {isInApp ? (
              <Link
                to="/push"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 35,
                  padding: "0 15px",
                  background: "#ff5500",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 13,
                  borderRadius: 9,
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 4px 14px rgba(255,85,0,0.25)",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = "#e64d00";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = "#ff5500";
                  el.style.transform = "translateY(0)";
                }}
              >
                <UploadCloud size={14} /> Push Now
              </Link>
            ) : (
              <Link
                to="/onboarding"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 35,
                  padding: "0 16px",
                  background: "#ff5500",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 13,
                  borderRadius: 9,
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 4px 14px rgba(255,85,0,0.25)",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = "#e64d00";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = "#ff5500";
                  el.style.transform = "translateY(0)";
                }}
              >
                Launch App <ArrowRight size={13} strokeWidth={2.5} />
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: "none",
                padding: "6px 8px",
                borderRadius: 8,
                border: "1px solid #e7e2db",
                background: "#ffffff",
                cursor: "pointer",
                color: "#544e47",
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

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 58,
            left: 0,
            right: 0,
            zIndex: 49,
            background: "#faf8f5",
            borderBottom: "1px solid #e7e2db",
            padding: "14px 20px 22px",
            boxShadow: "0 12px 30px rgba(25, 20, 17, 0.1)",
          }}
          className="show-mobile"
        >
          <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <button
              onClick={() => {
                setMenuOpen(false);
                setAndroidModalOpen(true);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "11px 14px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                color: "#ff5500",
                background: "rgba(255, 85, 0, 0.08)",
                border: "1px solid rgba(255, 85, 0, 0.25)",
                marginBottom: 6,
                cursor: "pointer",
              }}
            >
              <Smartphone size={16} /> Get Android APK (4.5 MB)
            </button>
            <MobileNavLink to="/push" onClick={() => setMenuOpen(false)}>
              Push App
            </MobileNavLink>
            <MobileNavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
              Dashboard
            </MobileNavLink>
            <MobileNavLink to="/repositories" onClick={() => setMenuOpen(false)}>
              Repositories
            </MobileNavLink>
            <MobileNavLink to="/settings" onClick={() => setMenuOpen(false)}>
              Settings
            </MobileNavLink>
            <MobileNavLink to="/blog/" onClick={() => setMenuOpen(false)}>
              Blog &amp; Tutorials
            </MobileNavLink>

            <div style={{ marginTop: 12 }}>
              <Link
                to="/onboarding"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "12px 14px",
                  background: "#ff5500",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 14,
                  borderRadius: 10,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(255,85,0,0.3)",
                }}
              >
                Launch App <ArrowRight size={14} />
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Android Download Modal */}
      <AndroidAppModal
        isOpen={androidModalOpen}
        onClose={() => setAndroidModalOpen(false)}
      />

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
  href,
  to,
  children,
  active,
}: {
  href?: string;
  to?: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    letterSpacing: "-0.01em",
    textDecoration: "none",
    transition: "background 0.15s ease, color 0.15s ease",
    color: active ? "#191411" : "#78716c",
    background: active ? "#ffffff" : "transparent",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.04)" : "none",
    border: active ? "1px solid #e7e2db" : "1px solid transparent",
    whiteSpace: "nowrap",
  };

  if (to) {
    return (
      <Link to={to as any} style={base}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} style={base}>
      {children}
    </a>
  );
}

function MobileNavLink({
  href,
  to,
  children,
  onClick,
}: {
  href?: string;
  to?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const s: React.CSSProperties = {
    display: "block",
    padding: "11px 14px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    color: "#191411",
    textDecoration: "none",
    background: "#ffffff",
    border: "1px solid #e7e2db",
    marginBottom: 4,
  };

  if (to) {
    return (
      <Link to={to as any} style={s} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} style={s} onClick={onClick}>
      {children}
    </a>
  );
}
