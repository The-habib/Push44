import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get Started with Push44 — Connect Base44 or Rocket.new to GitHub" },
      { name: "description", content: "Set up Push44 in under 2 minutes. Connect your Base44 or Rocket.new account plus a GitHub token to start pushing vibe-coded apps to GitHub instantly. Free, no backend." },
      { name: "keywords", content: "push Base44 to GitHub setup, connect Base44 GitHub, Rocket.new GitHub setup, get started Push44, vibe app GitHub backup setup" },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Push44" },
      { property: "og:title", content: "Get Started with Push44 — Connect Base44 or Rocket.new to GitHub" },
      { property: "og:description", content: "Set up Push44 in under 2 minutes. Connect your Base44 or Rocket.new account plus a GitHub token to start pushing apps to GitHub." },
      { property: "og:url", content: "https://push-44.vercel.app/onboarding" },
      { property: "og:image", content: "https://push-44.vercel.app/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Get Started with Push44 — Connect Base44 or Rocket.new to GitHub" },
      { name: "twitter:description", content: "Set up Push44 in under 2 minutes. Connect your Base44 or Rocket.new account plus a GitHub token." },
      { name: "twitter:image", content: "https://push-44.vercel.app/og-image.png" },
    ],
    links: [
      { rel: "canonical", href: "https://push-44.vercel.app/onboarding" },
    ],
  }),
});
