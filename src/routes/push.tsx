import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/push")({
  head: () => ({
    meta: [{ title: "Push to GitHub · Push44" }],
  }),
});
