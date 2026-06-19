import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, ChefHat, Truck, Loader2, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { session } from "@/lib/api";
import api from "@/lib/api";

export const Route = createFileRoute("/_site/track")({
  head: () => ({ meta: [{ title: "Track Order — Savora" }] }),
  component: TrackPage,
});

const STEPS = [
  { key: "Pending",           label: "Order placed",      icon: Clock       },
  { key: "Preparing",         label: "Preparing",         icon: ChefHat     },
  { key: "Ready",             label: "Ready",             icon: CheckCircle2 },
  { key: "Out for Delivery",  label: "Out for delivery",  icon: Truck       },
  { key: "Delivered",         label: "Delivered",         icon: CheckCircle2 },
];

// Which step index is active for a given status
const stepIndex = (status: string) =>
  STEPS.findIndex((s) => s.key === status);

function TrackPage() {
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session.loggedIn()) {
      setLoading(false);
      return;
    }
    // GET /api/orders/mine — returns only this customer's orders
    api.get("/api/orders/mine")
      .then((res) => {
        const data = res.data?.data ?? [];
        setOrders(data);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  // ── Not logged in ──────────────────────────────────────────────────────
  if (!session.loggedIn()) return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <PackageOpen className="h-14 w-14 text-muted-foreground/40" />
      <h2 className="font-display text-2xl font-semibold">Sign in to track your orders</h2>
      <p className="text-muted-foreground">Your order history is saved to your account.</p>
      <Link to="/auth"><Button className="rounded-full">Sign in</Button></Link>
    </div>
  );

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">Loading your orders…</p>
    </div>
  );

  // ── No orders ──────────────────────────────────────────────────────────
  if (orders.length === 0) return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <PackageOpen className="h-14 w-14 text-muted-foreground/40" />
      <h2 className="font-display text-2xl font-semibold">No orders yet</h2>
      <p className="text-muted-foreground">Place your first order and track it here.</p>
      <Link to="/menu"><Button className="rounded-full">Browse menu</Button></Link>
    </div>
  );

  // ── Orders list ────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-10 md:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Your orders</h1>
        <p className="mt-1 text-muted-foreground">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
      </div>

      <div className="space-y-6">
        {orders.map((o) => {
          const id      = o._id ?? o.id;
          const current = stepIndex(o.status);
          const isDone  = o.status === "Delivered" || o.status === "Served";

          return (
            <div key={id} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              {/* Order header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{id.toString().slice(-10).toUpperCase()}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {o.type ?? "Delivery"}
                    {o.createdAt ? ` · Placed ${new Date(o.createdAt).toLocaleString()}` : ""}
                  </p>
                </div>
                <span className="font-display text-2xl font-semibold text-primary">
                  ${Number(o.total).toFixed(2)}
                </span>
              </div>

              {/* Progress steps — only for delivery orders */}
              {o.type !== "Dine-in" && (
                <div className="mt-6 flex items-center justify-between gap-1">
                  {STEPS.map((step, i) => {
                    const done   = i <= current;
                    const active = i === current;
                    return (
                      <div key={step.key} className="flex flex-1 flex-col items-center gap-1.5">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                          done
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground"
                        } ${active ? "ring-4 ring-primary/20" : ""}`}>
                          <step.icon className="h-4 w-4" />
                        </div>
                        <span className={`hidden text-center text-[10px] leading-tight sm:block ${done ? "font-medium text-primary" : "text-muted-foreground"}`}>
                          {step.label}
                        </span>
                        {/* Connector line */}
                        {i < STEPS.length - 1 && (
                          <div className={`absolute mt-4 hidden h-0.5 w-full sm:block ${i < current ? "bg-primary" : "bg-border"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Items */}
              <div className="mt-5 space-y-1 rounded-xl bg-secondary/40 p-3 text-sm">
                {(o.items ?? []).map((it: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>{it.qty}× {it.name}</span>
                    <span>${(Number(it.qty) * Number(it.price)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {isDone && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-success/10 p-3 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Order completed — enjoy your meal!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}