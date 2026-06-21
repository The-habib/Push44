import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Home, UploadCloud, Archive, History, Settings } from "lucide-react";
import avatar from "@/assets/avatar.png";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/push", icon: UploadCloud, label: "Push" },
  { to: "/repositories", icon: Archive, label: "Repositories" },
  { to: "/history", icon: History, label: "History" },
  { to: "/settings", icon: Settings, label: "Settings" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ backgroundColor: "#f3f2ee" }}>
      <div className="w-full max-w-[430px] px-5 pt-4 pb-28 relative">
        <header className="flex items-center justify-between mb-5">
          <button className="h-11 w-11 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Menu className="h-5 w-5 text-black" strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="h-11 w-11 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-[#a78bfa] font-extrabold text-xl italic">B</span>
            </div>
            <h1 className="text-[22px] font-extrabold text-black tracking-tight">
              Base44 <span className="text-[#8b5cf6]">Push</span>
            </h1>
          </div>
          <div className="relative h-11 w-11">
            <img src={avatar} alt="Profile" className="h-11 w-11 rounded-full object-cover" width={44} height={44} loading="lazy" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#22c55e] ring-2 ring-[#f3f2ee]" />
          </div>
        </header>

        {children}

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[28px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-4 pt-3 pb-6 z-50">
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

export function SectionCard({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
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