import { createFileRoute, Navigate } from "@tanstack/react-router";
import { isOnboardingDone } from "@/lib/storage";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  return <Navigate to={isOnboardingDone() ? "/dashboard" : "/onboarding"} replace />;
}
