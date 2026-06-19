import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChefHat, CheckCircle2, Clock, Loader2, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { staffNav } from "@/components/dashboard-shell";
import api from "@/lib/api";

export const Route = createFileRoute("/staff/")({
  component: StaffDashboard,
});

function StaffDashboard() {
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/orders")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const count = (status: string | string[]) =>
    orders.filter((o) =>
      Array.isArray(status) ? status.includes(o.status) : o.status === status
    ).length;

  const summary = [
    { label: "Pending",           value: count("Pending"),                       icon: Clock,        color: "from-warning to-accent"         },
    { label: "Preparing",         value: count("Preparing"),                     icon: ChefHat,      color: "from-primary to-primary-glow"   },
    { label: "Ready",             value: count("Ready"),                         icon: CheckCircle2, color: "from-success to-success"        },
    { label: "Served / Delivered",value: count(["Served", "Delivered"]),         icon: Utensils,     color: "from-chart-4 to-chart-5"        },
  ];

  const pendingCount = count("Pending");

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="mt-2 font-display text-4xl font-semibold">{s.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-primary-foreground`}>
                <s.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-warning" />
            <div className="flex-1">
              <p className="font-semibold">{pendingCount} new order{pendingCount > 1 ? "s" : ""} just came in</p>
              <p className="text-sm text-muted-foreground">Tap below to head to the kitchen view.</p>
            </div>
            <Link to="/staff/kitchen" className="rounded-full bg-warning px-4 py-2 text-sm font-medium text-warning-foreground">
              Open kitchen
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="mb-3 font-display text-lg font-semibold">Latest orders</h3>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((o) => {
                const id = o._id ?? o.id;
                return (
                  <div key={id} className="flex items-center justify-between rounded-xl bg-secondary/40 p-3">
                    <div>
                    <p className="font-medium">
  {typeof o.customer === "object" && o.customer !== null
    ? o.customer.name ?? "Guest"
    : o.customer ?? o.user?.name ?? "Guest"}
</p>
                      <p className="text-xs text-muted-foreground">
                        #{id.slice(-6).toUpperCase()} · {o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="mb-3 font-display text-lg font-semibold">Quick links</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {staffNav.map((n) => (
              <Link key={n.to} to={n.to} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-4 transition-colors hover:border-primary hover:bg-primary/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-warm text-primary-foreground">
                  <n.icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{n.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}