import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ChefHat } from "lucide-react";
import { DashboardShell, staffNav } from "@/components/dashboard-shell";
import { session } from "@/lib/api";

export const Route = createFileRoute("/staff")({
  beforeLoad: () => {
    // SSR guard — window doesn't exist on server
    if (typeof window === "undefined") {
      throw redirect({ to: "/auth" });
    }
    if (!session.loggedIn()) {
      throw redirect({ to: "/auth" });
    }
    if (!["admin", "staff"].includes(session.role() ?? "")) {
      throw redirect({ to: "/auth" });
    }
  },
  component: StaffLayout,
});

function StaffLayout() {
  return (
    <DashboardShell title="Staff" brand="Savora · Staff" brandIcon={ChefHat} nav={staffNav}>
      <Outlet />
    </DashboardShell>
  );
}