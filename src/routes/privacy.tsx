import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, ShieldCheck, Lock, Database, EyeOff, ServerOff, RefreshCw, Mail, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Push44" },
      { name: "description", content: "Push44's privacy policy. Push44 has zero backend and no servers — your credentials and code never leave your browser except to talk directly to GitHub or your chosen AI platform." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Privacy Policy — Push44" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://push44.vercel.app/privacy" }],
  }),
  component: PrivacyPage,
});

const SECTIONS = [
  {
    icon: ServerOff,
    title: "1. Zero Backend & No Server Storage",
    body: "Push44 is a purely client-side application. There are no Push44 backend servers, databases, or user telemetry collectors. Your GitHub personal access tokens, platform session tokens (Base44, Rocket.new, Floot, Zite, Bolt.new, Lovable.dev, Framer), and push history are stored exclusively in your browser's localStorage on your personal device.",
  },
  {
    icon: Lock,
    title: "2. Direct Browser-to-Service Communication",
    body: "When you export or push code with Push44, your browser initiates direct encrypted HTTPS connections to GitHub's REST API and to the AI platform endpoints you connect. Your tokens and project code pass directly between your device and the destination APIs — Push44 does not proxy, intercept, or log source code content.",
  },
  {
    icon: EyeOff,
    title: "3. Zero Telemetry & No Tracking",
    body: "Push44 does not load third-party analytics scripts, does not use advertising tracking cookies, and does not record behavioral telemetry. Standard edge CDN access logs (IP address, requested path, timestamp) may be retained briefly by our static hosting provider (Vercel) solely for DDOS mitigation and security.",
  },
  {
    icon: ShieldCheck,
    title: "4. Third-Party Platform Policies",
    body: "GitHub, Base44, StackBlitz (Bolt), Rocket.new, Floot, Zite, Lovable, and Framer maintain their own respective terms of service and privacy policies governing data sent to their APIs. Push44 is an independent open-source client utility designed to interface with public or authenticated platform endpoints using credentials you control.",
  },
  {
    icon: Database,
    title: "5. Local Storage Lifecycle",
    body: "Because all credentials and history records live solely in your browser's localStorage (or AES-256-GCM encrypted local configuration files in the CLI), you have complete autonomy over your data lifecycle. You can wipe all credentials instantly via Settings > Clear Data, or by clearing your browser cache.",
  },
  {
    icon: RefreshCw,
    title: "6. Changes to this Policy",
    body: "Any updates or refinements to this privacy policy will be published directly to this page with an updated timestamp. Continued use of Push44 following revisions constitutes agreement with the terms described.",
  },
  {
    icon: Mail,
    title: "7. Inquiries & Support",
    body: "If you have questions regarding this privacy document or the cryptographic implementation of our client storage, please open an issue or inquiry on our official GitHub repository.",
  },
];

function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] bg-[#faf8f5] text-[#191411] font-sans selection:bg-[#f50]/20">
      <Navbar />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="relative pt-32 pb-16 px-6 border-b border-[#e7e2db] bg-gradient-to-b from-[#fff8f3] via-[#faf8f5] to-[#faf8f5] overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[280px] bg-gradient-to-b from-[#f50]/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-4xl mx-auto z-10 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-[13px] font-medium text-[#8c857b] mb-6">
            <Link to="/" className="hover:text-[#191411] transition-colors">Push44</Link>
            <ChevronRight size={12} className="text-[#cfc8bd]" />
            <span className="text-[#191411] font-semibold">Privacy Policy</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-bold uppercase tracking-wider mb-5">
            <ShieldCheck size={14} className="text-emerald-600" />
            Zero-Backend · Local-First Architecture
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191411] tracking-tight leading-[1.15] mb-4">
            Privacy Policy
          </h1>

          <p className="text-base sm:text-lg text-[#544e47] max-w-2xl mx-auto leading-relaxed">
            Push44 is designed with a radical zero-backend architecture: we have nothing to collect, store, or sell because there are no intermediary servers.
          </p>

          <div className="mt-6 text-[12.5px] font-semibold text-[#8c857b]">
            Effective Date: August 2026
          </div>
        </div>
      </header>

      {/* ── SECTIONS ─────────────────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-6">
        {SECTIONS.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-[#e7e2db] rounded-2xl p-6 sm:p-8 shadow-2xs space-y-3"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#fff4ed] text-[#f50] border border-[#f50]/20 flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <h2 className="text-[18px] sm:text-[19px] font-bold text-[#191411] tracking-tight">
                  {section.title}
                </h2>
              </div>
              <p className="text-[15px] text-[#544e47] leading-relaxed pl-0 sm:pl-12.5 m-0">
                {section.body}
              </p>
            </div>
          );
        })}

        {/* Bottom Back Button */}
        <div className="pt-8 flex items-center justify-between border-t border-[#e7e2db]">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[14px] font-bold text-[#f50] hover:text-[#e64d00] transition-colors"
          >
            &larr; Return to Push44 Home
          </Link>
          <Link
            to="/terms"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#544e47] hover:text-[#191411] transition-colors"
          >
            Terms of Service <ArrowRight size={14} />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
