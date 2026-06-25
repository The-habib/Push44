import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Push History · Push44" },
      { name: "description", content: "Browse every GitHub push — commit hashes, file counts, branches and timestamps." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
