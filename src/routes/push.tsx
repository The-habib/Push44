import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/push")({
  head: () => ({
    meta: [
      { title: "Push to GitHub · Push44" },
      { name: "description", content: "Select a Base44 or Rocket.new app, pick a GitHub repo and push all source files in one atomic commit." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
