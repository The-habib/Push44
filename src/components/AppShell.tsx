import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  UploadCloud,
  Archive,
  History,
  Settings,
  Github,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/push", icon: UploadCloud, label: "Push" },
  { to: "/repositories", icon: Archive, label: "Repositories" },
  { to: "/history", icon: History, label: "History" },
  { to: "/settings", icon: Settings, label: "Settings" },
] as const;

function AvatarBubble({
  name,
  size = 36,
  fontSize = 14,
}: {
  name: string;
  size?: number;
  fontSize?: number;
}) {
  const initials = name.trim()
    ? name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  return (
    <div
      className="rounded-full flex items-center justify-center font-extrabold text-white shrink-0"
      style={{
        width: size,
        height: size,
        fontSize,
        background: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
      }}
    >
      {initials}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { creds } = useApp();
  const displayName =
    creds.displayName || creds.base44Email || creds.githubUsername || "";

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#f3f2ee" }}>

      {/* ── Desktop layout ──────────────────────────────────────── */}
      <div className="hidden md:flex min-h-screen">

        {/* Sidebar */}
        <aside
          className="w-64 shrink-0 flex flex-col sticky top-0 h-screen border-r"
          style={{ backgroundColor: "#ffffff", borderColor: "#e8e6e0" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "#e8e6e0" }}>
            <div className="h-10 w-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shrink-0">
              <span className="text-[#a78bfa] font-extrabold text-lg italic">B</span>
            </div>
            <span className="text-[20px] font-extrabold text-black tracking-tight">
              Push<span className="text-[#8b5cf6]">44</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl font-semibold text-sm transition-all ${
                    active
                      ? "bg-[#dce99a] text-black"
                      : "text-black/50 hover:text-black hover:bg-black/5"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="px-4 py-4 border-t" style={{ borderColor: "#e8e6e0" }}>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <AvatarBubble name={displayName} size={36} fontSize={13} />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#22c55e] ring-2 ring-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-black truncate">
                  {creds.displayName || "My Account"}
                </div>
                <div className="text-[11px] text-black/40 truncate">
                  {creds.base44Email || creds.githubUsername || "Not connected"}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop topbar */}
          <header
            className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 border-b bg-white/80 backdrop-blur-sm"
            style={{ borderColor: "#e8e6e0" }}
          >
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-xl bg-[#f3f2ee] flex items-center justify-center text-black/50 hover:text-black transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <div className="relative">
                <AvatarBubble name={displayName} size={36} fontSize={13} />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#22c55e] ring-2 ring-white" />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-8 py-6 max-w-3xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* ── Mobile layout ───────────────────────────────────────── */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="flex items-center justify-between px-5 pt-4 pb-3 bg-[#f3f2ee]">
          <div className="h-11 w-11" /> {/* spacer to balance avatar */}
          <div className="flex items-center gap-2.5">
            <div className="h-11 w-11 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-[#a78bfa] font-extrabold text-xl italic">B</span>
            </div>
            <h1 className="text-[22px] font-extrabold text-black tracking-tight">
              Push<span className="text-[#8b5cf6]">44</span>
            </h1>
          </div>
          <Link to="/settings" className="relative h-11 w-11 block">
            <AvatarBubble name={displayName} size={44} fontSize={16} />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#22c55e] ring-2 ring-[#f3f2ee]" />
          </Link>
        </header>

        {/* Mobile page content */}
        <main className="flex-1 px-5 pt-2 pb-28">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[28px] shadow-[0_-4px_20px_rgba(0,0,0,0.07)] px-4 pt-3 pb-6 z-50">
          <div className="flex items-center justify-between">
            {navItems.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} className="flex flex-col items-center gap-1 flex-1">
                  <span className={`h-9 w-12 rounded-full flex items-center justify-center ${active ? "bg-[#dce99a]" : ""}`}>
                    <Icon className={`h-5 w-5 ${active ? "text-black" : "text-black/70"}`} strokeWidth={active ? 2.5 : 2} />
                  </span>
                  <span className={`text-[10px] ${active ? "font-bold text-black" : "text-black/60 font-medium"}`}>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white rounded-2xl p-5 mb-5 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-black text-base">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
