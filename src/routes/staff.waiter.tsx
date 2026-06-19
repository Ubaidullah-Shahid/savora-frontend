import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, Loader2, RefreshCw, WifiOff } from "lucide-react";
import { Button }     from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { tables }     from "@/lib/mock-data";
import { toast }      from "sonner";
import api            from "@/lib/api";

export const Route = createFileRoute("/staff/waiter")({ component: WaiterPanel });

function WaiterPanel() {
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Fetch all orders — we filter client-side for "Ready"
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/orders");
      setOrders(res.data?.data ?? []);
    } catch (err: any) {
      const msg = !err.response ? "Cannot reach server." : (err.response?.data?.message ?? "Failed to load orders.");
      setError(msg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Mark order as Served — persists to MongoDB
  const serve = async (order: any) => {
    const id = order._id ?? order.id;
    try {
      // PUT /api/orders/:id/status  →  { status: "Served" }
      await api.put(`/api/orders/${id}/status`, { status: "Served" });
      setOrders((prev) => prev.map((o) =>
        (o._id === id || o.id === id) ? { ...o, status: "Served" } : o
      ));
      toast.success("Order marked as served ✅");
    } catch {
      toast.error("Failed to update order.");
    }
  };

  if (loading) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">Loading waiter view…</p>
    </div>
  );

  if (error) return (
    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center">
      <WifiOff className="h-10 w-10 text-destructive/60" />
      <p className="font-semibold text-destructive">{error}</p>
      <Button variant="outline" className="rounded-full" onClick={fetchOrders}>
        <RefreshCw className="mr-2 h-4 w-4" /> Try again
      </Button>
    </div>
  );

  const ready = orders.filter((o) => o.status === "Ready");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Waiter</h2>
          <p className="text-sm text-muted-foreground">
            Ready to serve · {ready.length} order{ready.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full" onClick={fetchOrders}>
          <RefreshCw className="mr-1 h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Ready orders */}
      {ready.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-12 text-center shadow-soft">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <p className="mt-3 font-display text-lg">All caught up!</p>
          <p className="text-sm text-muted-foreground">Nothing to serve right now.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ready.map((o) => {
            const id   = o._id ?? o.id;
            const name = o.customer?.name ?? o.customer ?? "Guest";
            return (
              <div key={id} className="rounded-2xl border-2 border-success/40 bg-success/5 p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">
                    {id.toString().slice(-8).toUpperCase()}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
                <h3 className="mt-1 font-display text-lg font-semibold">{name}</h3>
                <p className="text-xs text-muted-foreground">
                  {o.type ?? "Delivery"}{o.table ? ` · Table ${o.table}` : ""}
                </p>
                <ul className="mt-3 space-y-1 border-t border-border/40 pt-3 text-sm">
                  {(o.items ?? []).map((it: any, i: number) => (
                    <li key={i}><b>{it.qty}×</b> {it.name}</li>
                  ))}
                </ul>
                <Button
                  onClick={() => serve(o)}
                  className="mt-4 w-full rounded-full bg-success hover:bg-success/90"
                >
                  Mark as served
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tables overview — visual reference (seed data) */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
        <h3 className="mb-3 font-display text-lg font-semibold">Tables at a glance</h3>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {tables.map((t) => (
            <div key={t.id} className={`rounded-xl p-3 text-center text-xs ${
              t.status === "Available" ? "bg-success/15 text-success" :
              t.status === "Occupied"  ? "bg-primary/15 text-primary" :
              "bg-accent/30 text-accent-foreground"
            }`}>
              <div className="font-display text-base font-semibold">T{t.id}</div>
              <div>{t.seats} seats</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}