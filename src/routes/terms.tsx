import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, FileText, Scale, ShieldAlert, KeyRound, AlertOctagon, HelpCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Push44" },
      { name: "description", content: "Push44's terms of service. Push44 is a free client-side tool used to export AI-generated code from Base44, Rocket.new, Floot, Zite, Bolt.new, Lovable.dev, and Framer to GitHub." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Terms of Service — Push44" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://push44.vercel.app/terms" }],
  }),
  component: TermsPage,
});

const SECTIONS = [
  {
    icon: FileText,
    title: "1. Acceptance of Terms",
    body: "By accessing or using Push44 (web application, CLI utility, or Android application), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the application.",
  },
  {
    icon: Scale,
    title: "2. Nature of the Service",
    body: "Push44 is a free, open-source, client-side utility that communicates directly with third-party AI vibe-coding platforms (Base44, Rocket.new, Floot, Zite, Bolt.new, Lovable.dev, Framer) and GitHub using user-provided credentials. It allows users to view sandbox files, compute local diffs, download ZIP archives, and commit directly to GitHub repositories.",
  },
  {
    icon: ShieldAlert,
    title: "3. Disclaimer of Warranties (\"As Is\")",
    body: "Push44 is provided on an \"AS IS\" and \"AS AVAILABLE\" basis without warranties of any kind, whether express, implied, or statutory. Because Push44 depends on external third-party APIs that may modify, throttle, or deprecate endpoints without notice, we make no guarantee of uninterrupted availability or compatibility with every platform version.",
  },
  {
    icon: KeyRound,
    title: "4. User Credential Responsibility",
    body: "You are solely responsible for maintaining the confidentiality and security of any GitHub Personal Access Tokens and third-party platform credentials you input into Push44. Since all credentials reside locally on your device, you have sole authority over revoking or rotating keys at any time through GitHub or the relevant provider.",
  },
  {
    icon: AlertOctagon,
    title: "5. Limitation of Liability",
    body: "To the fullest extent permitted by applicable law, Push44's maintainers and contributors shall not be liable for any indirect, incidental, punitive, or consequential damages, loss of code, data loss, failed Git operations, repository overwrites, or account actions on connected platforms. Users should always inspect visual diff previews prior to executing commits.",
  },
  {
    icon: ShieldCheck,
    title: "6. Acceptable Use",
    body: "You agree to use Push44 in compliance with all applicable local, national, and international laws, and in accordance with GitHub's and connected AI platforms' terms of service. You may not use Push44 to attempt unauthorized access to projects you do not own or have permission to access.",
  },
  {
    icon: HelpCircle,
    title: "7. Modifications & Inquiries",
    body: "We reserve the right to modify these terms at any time by updating this document. Continued use of Push44 following modifications signifies your acceptance of the updated terms. For inquiries or open-source contributions, visit the official Push44 GitHub repository.",
  },
];

function TermsPage() {
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
            <span className="text-[#191411] font-semibold">Terms of Service</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f50]/10 border border-[#f50]/20 text-[#f50] text-[12px] font-bold uppercase tracking-wider mb-5">
            <Scale size={14} className="text-[#f50]" />
            Open Source · Transparent Terms
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191411] tracking-tight leading-[1.15] mb-4">
            Terms of Service
          </h1>

          <p className="text-base sm:text-lg text-[#544e47] max-w-2xl mx-auto leading-relaxed">
            These terms govern your use of the Push44 web app, CLI, and mobile utilities. Because Push44 is a free client tool with no user accounts, our terms are concise and transparent.
          </p>

          <div className="mt-4 text-[12.5px] font-semibold text-[#8c857b]">
            Effective Date: August 2026
          </div>
        </div>
      </header>

      {/* ── HIGHLIGHTS BENTO SUMMARY ─────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#e7e2db] rounded-2xl p-5 shadow-sm text-center space-y-1">
            <div className="text-2xl font-black text-[#191411]">Open Source</div>
            <div className="text-[12.5px] font-medium text-[#8c857b]">MIT licensed & community built</div>
          </div>
          <div className="bg-white border border-[#e7e2db] rounded-2xl p-5 shadow-sm text-center space-y-1">
            <div className="text-2xl font-black text-emerald-600">No Paywalls</div>
            <div className="text-[12.5px] font-medium text-[#8c857b]">100% free export utility</div>
          </div>
          <div className="bg-white border border-[#e7e2db] rounded-2xl p-5 shadow-sm text-center space-y-1">
            <div className="text-2xl font-black text-[#f50]">You Own Code</div>
            <div className="text-[12.5px] font-medium text-[#8c857b]">Direct commits to your repos</div>
          </div>
        </div>
      </section>

      {/* ── SECTIONS ─────────────────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-6">
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
            to="/privacy"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#544e47] hover:text-[#191411] transition-colors"
          >
            Privacy Policy <ArrowRight size={14} />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
