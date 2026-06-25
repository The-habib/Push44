import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Push44" },
      { name: "description", content: "Connect your Base44 or Rocket.new account and GitHub personal access token to start pushing apps to GitHub." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
