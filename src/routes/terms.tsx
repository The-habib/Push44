import { createFileRoute, Link } from "@tanstack/react-router";
import appLogo from "@/assets/logo.png";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Push44" },
      { name: "description", content: "Push44's terms of service. Push44 is a free client-side tool used to export AI-generated code from Base44, Rocket.new, Floot, Zite, and bolt.new to GitHub." },
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
    title: "1. Acceptance of terms",
    body: "By using Push44, you agree to these terms. If you don't agree, don't use the app — it's that simple. There's no account creation, so using the site is how you accept these terms.",
  },
  {
    title: "2. What Push44 is",
    body: "Push44 is a free, client-side tool that reads project files from AI coding platforms you've connected (Base44, Rocket.new, Floot, Zite, bolt.new) using credentials you provide, and pushes them to a GitHub repository you control, or bundles them into a ZIP file for download.",
  },
  {
    title: "3. No warranty",
    body: "Push44 is provided \"as is\", without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee Push44 will work with every account, project, or platform version, since Push44 depends on third-party APIs that can change without notice.",
  },
  {
    title: "4. Your responsibility for credentials",
    body: "You are solely responsible for the security of the GitHub tokens and platform credentials you enter into Push44. Because Push44 stores these only in your own browser, you control their lifecycle — revoke them from GitHub or the relevant platform at any time if you have concerns.",
  },
  {
    title: "5. No liability",
    body: "To the maximum extent permitted by law, Push44's maintainers are not liable for any damages, data loss, failed exports, incorrect pushes, or account issues on GitHub or any connected platform arising from use of this tool. Always review the diff preview before pushing.",
  },
  {
    title: "6. Acceptable use",
    body: "You agree not to use Push44 to violate the terms of service of GitHub or any connected AI platform, and not to use it for any unlawful purpose.",
  },
  {
    title: "7. Changes to the service or terms",
    body: "We may update Push44 or these terms at any time. Continued use after an update constitutes acceptance of the revised terms.",
  },
  {
    title: "8. Contact",
    body: "Questions about these terms? Reach out via the contact information on the Push44 website.",
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

function TermsPage() {
  return (
    <LegalLayout pageTitle="Terms of Service" updated="July 3, 2026">
      <p style={{ fontSize: 15, color: "#52525b", lineHeight: 1.75, marginBottom: 32 }}>
        These terms govern your use of Push44. Because Push44 is free with no account system,
        we've kept this as short and plain as possible.
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
