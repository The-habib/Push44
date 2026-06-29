import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, UploadCloud, BookOpen, History, Settings } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import appLogo from "@/assets/logo.webp";

const NAV = [
  { to: "/dashboard",    label: "Dashboard",    Icon: LayoutDashboard },
  { to: "/push",         label: "Push",         Icon: UploadCloud },
  { to: "/repositories", label: "Repos",        Icon: BookOpen },
  { to: "/history",      label: "History",      Icon: History },
  { to: "/settings",     label: "Settings",     Icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { creds } = useApp();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: "var(--sidebar-w)",
        background: "var(--sidebar-bg)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }} className="hidden-mobile">
        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src={appLogo} alt="Push44" style={{ width: 30, height: 30, borderRadius: 7 }} />
            <span style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" }}>Push44</span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ to, label, Icon }) => {
            const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
            return (
              <Link key={to} to={to} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 6, textDecoration: "none",
                fontSize: 13, fontWeight: 500,
                color: active ? "var(--sidebar-active-text)" : "var(--sidebar-text)",
                background: active ? "var(--sidebar-active-bg)" : "transparent",
                transition: "background 0.15s, color 0.15s",
              }}>
                <Icon size={16} strokeWidth={1.8} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {creds.githubUsername && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Link to="/settings" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <img
                src={`https://github.com/${creds.githubUsername}.png?size=32`}
                alt={creds.githubUsername}
                style={{ width: 28, height: 28, borderRadius: "50%", background: "#1e293b" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div>
                <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{creds.githubUsername}</div>
                <div style={{ color: "#475569", fontSize: 11 }}>GitHub</div>
              </div>
            </Link>
          </div>
        )}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: "var(--sidebar-w)", minHeight: "100vh" }} className="main-content">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {NAV.map(({ to, label, Icon }) => {
          const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
          return (
            <Link key={to} to={to} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "6px 4px", textDecoration: "none",
              color: active ? "var(--accent)" : "#64748b",
              fontSize: 10, fontWeight: 600, transition: "color 0.15s",
              flex: 1,
            }}>
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .main-content { margin-left: 0 !important; padding-bottom: 64px; }
          .mobile-nav { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-nav { display: none !important; }
        }
        .mobile-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #fff; border-top: 1px solid var(--border);
          z-index: 50; height: 56px;
          display: flex; align-items: stretch;
        }
      `}</style>
    </div>
  );
}
