import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { AppProvider, useApp } from "../contexts/AppContext";
import { isOnboardingDone, markOnboardingDone } from "../lib/storage";
import { AppShell } from "../components/AppShell";
import { Toaster } from "sonner";

const APP_ROUTES = ["/dashboard", "/push", "/repositories", "/history", "/settings"];

function NotFoundPage() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
      <span style={{ fontSize: 48, fontWeight: 800, color: "#0f172a" }}>404</span>
      <p style={{ color: "#64748b", margin: 0 }}>Page not found</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}>Go home</Link>
    </div>
  );
}

function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12, padding: 24 }}>
      <span style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Something went wrong</span>
      <p style={{ color: "#64748b", margin: 0, textAlign: "center", maxWidth: 360 }}>{error.message}</p>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button className="btn btn-primary" onClick={reset}>Try again</button>
        <a href="/" className="btn btn-secondary">Go home</a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});

function OnboardingGuard() {
  const { creds } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (pathname === "/onboarding" || pathname === "/") return;
    if ((creds.base44Token || creds.rocketToken || creds.ziteSession || creds.flootToken) && creds.githubToken) {
      markOnboardingDone();
      return;
    }
    if (!isOnboardingDone()) {
      navigate({ to: "/onboarding" });
    }
  }, [pathname, creds.base44Token, creds.rocketToken, creds.ziteSession, creds.flootToken, creds.githubToken]);

  if (APP_ROUTES.includes(pathname)) {
    return (
      <AppShell>
        <Outlet />
      </AppShell>
    );
  }

  return <Outlet />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <OnboardingGuard />
        <Toaster position="top-right" richColors closeButton />
      </AppProvider>
    </QueryClientProvider>
  );
}
