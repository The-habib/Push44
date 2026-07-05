import { createFileRoute, Link } from "@tanstack/react-router";
import appLogo from "@/assets/logo.png";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Push44" },
      { name: "description", content: "Push44's privacy policy. Push44 has no backend and no servers — your credentials and code never leave your browser except to talk directly to GitHub or your chosen AI platform." },
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
    title: "1. No backend, no server-side storage",
    body: "Push44 is a client-side only application. There is no Push44 server or database. Your GitHub token, platform tokens (Base44, Rocket.new, Floot, Zite), and push history are stored exclusively in your browser's localStorage on your own device. We never see them, store them, or have access to them.",
  },
  {
    title: "2. What data leaves your browser",
    body: "When you use Push44, your browser makes direct API requests to GitHub and to the AI platform you connect (Base44, Rocket.new, Floot, or Zite) using the credentials you provide. These requests go straight from your browser to those services — Push44 does not proxy, log, or intercept this traffic on any server we control.",
  },
  {
    title: "3. Analytics",
    body: "Push44 does not run user-tracking analytics, does not use advertising cookies, and does not sell or share any data, because no personal data is ever collected on our side. Standard hosting-provider access logs (IP address, request path, timestamp) may be retained briefly by our static hosting provider for security and abuse prevention.",
  },
  {
    title: "4. Third-party services",
    body: "GitHub, Base44, Rocket.new, Floot, and Zite each have their own privacy policies governing data you send them directly. Push44 is not affiliated with any of these platforms; we simply provide a client-side tool that talks to their public/authenticated APIs on your behalf, using credentials you control.",
  },
  {
    title: "5. No server-side logic",
    body: "Push44 has no backend database or server that processes your data. All credential storage and API calls happen entirely in your own browser session. There is nothing to audit server-side because there is no server.",
  },
  {
    title: "6. Changes to this policy",
    body: "If this policy changes, the updated version will be posted on this page with a revised date. Continued use of Push44 after changes means you accept the revised policy.",
  },
  {
    title: "7. Contact",
    body: "Questions about this policy? Reach out via the contact information on the Push44 website.",
  },
];

function LegalLayout({ pageTitle, updated, children }: { pageTitle: string; updated: string; children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", color: "#18181b", minHeight: "100vh", background: "#fff" }}>
      <nav style={{ borderBottom: "1px solid #f4f4f5", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", gap: 9 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <img src={appLogo} alt="Push44" style={{ width: 26, height: 26, borderRadius: 7, objectFit: "contain" }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#09090b" }}>Push44</span>
          </Link>
        </div>
      </nav>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 96px" }}>
        <h1 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 8px", color: "#09090b" }}>{pageTitle}</h1>
        <p style={{ color: "#a1a1aa", fontSize: 13, margin: "0 0 40px" }}>Last updated: {updated}</p>
        {children}
        <div style={{ marginTop: 56, paddingTop: 24, borderTop: "1px solid #f4f4f5" }}>
          <Link to="/" style={{ color: "#f97316", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>&larr; Back to Push44</Link>
        </div>
      </div>
    </div>
  );
}

function PrivacyPage() {
  return (
    <LegalLayout pageTitle="Privacy Policy" updated="July 3, 2026">
      <p style={{ fontSize: 15, color: "#52525b", lineHeight: 1.75, marginBottom: 32 }}>
        Push44 is built to be radically simple on privacy: there is nothing to collect, because there is no server.
        This page explains exactly what that means.
      </p>
      {SECTIONS.map(s => (
        <div key={s.title} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#09090b", margin: "0 0 8px" }}>{s.title}</h2>
          <p style={{ fontSize: 15, color: "#52525b", lineHeight: 1.75, margin: 0 }}>{s.body}</p>
        </div>
      ))}
    </LegalLayout>
  );
}
