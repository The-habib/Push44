import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionCard } from "@/components/AppShell";
import avatar from "@/assets/avatar.png";
import { Bell, Lock, Github, Moon, Globe, HelpCircle, LogOut, ChevronRight, Shield, CreditCard } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Base44" },
      { name: "description", content: "Manage your account and preferences." },
    ],
  }),
  component: SettingsPage,
});

function Toggle({ on = false }: { on?: boolean }) {
  return (
    <span className={`h-6 w-11 rounded-full p-0.5 transition-colors ${on ? "bg-[#8b5cf6]" : "bg-[#e5e5e5]"}`}>
      <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
    </span>
  );
}

function Row({ icon: Icon, iconBg, label, sub, right }: { icon: any; iconBg: string; label: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
        <Icon className="h-5 w-5 text-black" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-black truncate">{label}</div>
        {sub && <div className="text-[11px] text-black/55 truncate">{sub}</div>}
      </div>
      {right ?? <ChevronRight className="h-4 w-4 text-black/40" />}
    </div>
  );
}

function SettingsPage() {
  return (
    <AppShell>
      {/* Profile card */}
      <section className="relative rounded-[32px] px-6 py-6 overflow-hidden mb-5" style={{ backgroundColor: "#e9e4f8" }}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={avatar} alt="Profile" className="h-20 w-20 rounded-full object-cover ring-4 ring-white" width={80} height={80} loading="lazy" />
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-[#22c55e] ring-2 ring-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-black truncate">John Doe</h2>
            <p className="text-xs text-black/60 truncate">john.doe@base44.dev</p>
            <span className="inline-block mt-2 bg-[#1a1a1a] text-white text-[10px] font-bold rounded-full px-2.5 py-1">PRO MEMBER</span>
          </div>
        </div>
      </section>

      <SectionCard title="Account">
        <div className="divide-y divide-[#f0f0ec]">
          <Row icon={Github} iconBg="#f3f2ee" label="Connected to GitHub" sub="johndoe" />
          <Row icon={Shield} iconBg="#dcfce7" label="Two-Factor Auth" sub="Enabled" right={<Toggle on />} />
          <Row icon={Lock} iconBg="#fde2cf" label="Change Password" />
          <Row icon={CreditCard} iconBg="#e9e4f8" label="Billing & Plan" sub="Pro · Renews Jul 12" />
        </div>
      </SectionCard>

      <SectionCard title="Preferences">
        <div className="divide-y divide-[#f0f0ec]">
          <Row icon={Bell} iconBg="#fde2cf" label="Push Notifications" sub="Get notified on push events" right={<Toggle on />} />
          <Row icon={Moon} iconBg="#e9e4f8" label="Dark Mode" sub="System default" right={<Toggle />} />
          <Row icon={Globe} iconBg="#dce99a" label="Language" sub="English (US)" />
        </div>
      </SectionCard>

      <SectionCard title="Support">
        <div className="divide-y divide-[#f0f0ec]">
          <Row icon={HelpCircle} iconBg="#f3f2ee" label="Help Center" />
          <Row icon={Shield} iconBg="#f3f2ee" label="Privacy Policy" />
        </div>
      </SectionCard>

      <button className="w-full bg-white rounded-2xl py-4 flex items-center justify-center gap-2 text-[#ef4444] font-bold text-sm mb-3">
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
      <p className="text-center text-[11px] text-black/40 font-medium">Base44 Push · v1.2.0</p>
    </AppShell>
  );
}