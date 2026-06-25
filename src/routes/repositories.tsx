import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/repositories")({
  head: () => ({
    meta: [
      { title: "GitHub Repositories · Push44" },
      { name: "description", content: "Browse and manage all your GitHub repositories — stars, branches, languages and recent commits." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
