import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, UploadCloud, BookOpen, History, Settings } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import appLogo from "@/assets/logo.webp";

const NAV = [
  { to: "/dashboard",    label: "Dashboard",  Icon: LayoutDashboard },
  { to: "/push",         label: "Push",        Icon: UploadCloud },
  { to: "/repositories", label: "Repos",       Icon: BookOpen },
  { to: "/history",      label: "History",     Icon: History },
  { to: "/settings",     label: "Settings",    Icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const { creds } = useApp();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden-mobile"
        style={{
          width: "var(--sidebar-w)",
          background: "var(--sidebar-bg)",    /* #18120e — very deep warm brown-black */
          display: "flex", flexDirection: "column",
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
          borderRight: "1px solid var(--sidebar-border)",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "18px 14px 16px", borderBottom: "1px solid var(--sidebar-border)" }}>
           <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
             <img src={appLogo} alt="Push44" style={{ width: 30, height: 30, borderRadius: 8, boxShadow: "0 0 0 4px rgba(249,115,22,.08), 0 4px 18px rgba(249,115,22,.18)" }} />
             <span style={{ color: "#fffefb", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "-0.04em" }}>Push44</span>
          </Link>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ to, label, Icon }) => {
            const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                   padding: "10px 11px", borderRadius: 9, textDecoration: "none",
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  color: active ? "var(--sidebar-active-text)" : "var(--sidebar-text)",
                  background: active ? "var(--sidebar-active-bg)" : "transparent",
                   transition: "background .18s ease, color .18s ease, transform .18s ease, box-shadow .18s ease",
                   boxShadow: active ? "inset 3px 0 0 var(--accent), 0 6px 20px rgba(0,0,0,.12)" : "none",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "var(--sidebar-hover-bg)";
                    (e.currentTarget as HTMLElement).style.color = "#c5c0b1";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text)";
                  }
                }}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        {creds.githubUsername && (
          <div style={{ padding: "12px 14px", borderTop: "1px solid var(--sidebar-border)" }}>
            <Link to="/settings" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", borderRadius: 8, padding: "6px 4px", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--sidebar-hover-bg)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
               <img
                src={`https://github.com/${creds.githubUsername}.png?size=32`}
                alt={creds.githubUsername}
                 style={{ width: 30, height: 30, borderRadius: "50%", background: "#2f2320", flexShrink: 0, border: "2px solid rgba(249,115,22,.35)" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "#e2d9d2", fontSize: 12, fontWeight: 600, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {creds.githubUsername}
                </div>
                <div style={{ color: "#4a4540", fontSize: 11 }}>GitHub</div>
              </div>
            </Link>
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, marginLeft: "var(--sidebar-w)", minHeight: "100vh", background: "var(--canvas)" }} className="main-content">
        {children}
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mobile-nav">
        {NAV.map(({ to, label, Icon }) => {
          const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 3, padding: "6px 4px", textDecoration: "none",
                color: active ? "var(--accent)" : "#939084",
                fontSize: 10, fontWeight: 600,
                transition: "color 0.15s",
                flex: 1,
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .main-content  { margin-left: 0 !important; padding-bottom: 64px; }
          .mobile-nav    { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-nav { display: none !important; }
        }
        .mobile-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #fffefb;
          border-top: 1px solid #e6e1da;
          z-index: 50; height: 58px;
          display: flex; align-items: stretch;
          box-shadow: 0 -2px 12px rgba(32,21,21,0.06);
        }
      `}</style>
    </div>
  );
}
