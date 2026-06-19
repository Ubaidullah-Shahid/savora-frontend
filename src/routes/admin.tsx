import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { UtensilsCrossed } from "lucide-react";
import { DashboardShell, adminNav } from "@/components/dashboard-shell";
import { session } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    // SSR guard — window doesn't exist on server
    if (typeof window === "undefined") {
      throw redirect({ to: "/auth" });
    }
    if (!session.loggedIn()) {
      throw redirect({ to: "/auth" });
    }
    if (session.role() !== "admin") {
      throw redirect({ to: "/auth" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <DashboardShell title="Admin" brand="Savora · Admin" brandIcon={UtensilsCrossed} nav={adminNav}>
      <Outlet />
    </DashboardShell>
  );
}

