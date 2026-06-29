import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/repositories")({
  head: () => ({ meta: [{ title: "Repositories · Push44" }] }),
});
