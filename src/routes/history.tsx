import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History · Push44" }] }),
});
