import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get Started · Push44" }] }),
});
