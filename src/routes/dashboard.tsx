import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Push44" },
      { name: "description", content: "View your Base44 apps, GitHub repos, push stats and recent activity at a glance." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
