import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Loader2, PackageOpen, RefreshCw, WifiOff } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button }      from "@/components/ui/button";
import { toast }       from "sonner";
import api from "@/lib/api";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

const FLOW = ["Pending", "Preparing", "Ready", "Out for Delivery", "Delivered"];

function AdminOrders() {
  const [list,    setList]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // ── Fetch all orders from MongoDB ────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/orders");
      setList(res.data?.data ?? []);
    } catch (err: any) {
      const msg = !err.response
        ? "Cannot reach server — make sure backend is running on port 5000."
        : (err.response?.data?.message ?? "Failed to load orders.");
      setError(msg);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Advance order status — saves to MongoDB ──────────────────────────────
  const advance = async (order: any) => {
    const id  = order._id ?? order.id;
    const idx = FLOW.indexOf(order.status);
    if (idx === -1 || idx === FLOW.length - 1) return;
    const next = FLOW[idx + 1];
    try {
      await api.put(`/api/orders/${id}/status`, { status: next });
      setList((prev) =>
        prev.map((o) => (o._id === id || o.id === id) ? { ...o, status: next } : o)
      );
      toast.success(`Order → ${next}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to update status.");
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">Loading orders from database…</p>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center">
      <WifiOff className="h-10 w-10 text-destructive/60" />
      <div>
        <p className="font-semibold text-destructive">Could not load orders</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>
      </div>
      <Button variant="outline" className="rounded-full" onClick={fetchOrders}>
        <RefreshCw className="mr-2 h-4 w-4" /> Try again
      </Button>
    </div>
  );

  // ── Empty ────────────────────────────────────────────────────────────────
  if (list.length === 0) return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Orders</h2>
        <Button variant="outline" size="sm" className="rounded-full" onClick={fetchOrders}>
          <RefreshCw className="mr-1 h-4 w-4" /> Refresh
        </Button>
      </div>
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border text-center">
        <PackageOpen className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No orders yet. Orders placed by customers will appear here.</p>
      </div>
    </div>
  );

  // ── Main UI ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Orders</h2>
          <p className="text-sm text-muted-foreground">{list.length} total orders</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full" onClick={fetchOrders}>
          <RefreshCw className="mr-1 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((o) => {
          const id           = o._id ?? o.id;
          const customerName = o.customer?.name ?? o.customer ?? "Guest";
          const placedAt     = o.createdAt
            ? new Date(o.createdAt).toLocaleString()
            : (o.placedAt ?? "—");
          const isDone = o.status === "Delivered" || o.status === "Served";
          const nextStatus = FLOW[FLOW.indexOf(o.status) + 1];

          return (
            <div key={id} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">
                      {id.toString().slice(-10).toUpperCase()}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                  <h3 className="mt-1 font-display text-lg font-semibold">{customerName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {o.type ?? "Delivery"}
                    {o.table ? ` · Table ${o.table}` : ""}
                    {" · "}{placedAt}
                  </p>
                </div>
                <span className="font-display text-xl font-semibold text-primary whitespace-nowrap">
                  ${Number(o.total).toFixed(2)}
                </span>
              </div>

              {/* Items list */}
              <div className="mt-4 space-y-1 rounded-xl bg-secondary/40 p-3 text-sm">
                {(o.items ?? []).map((it: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>
                      {it.qty}× {it.name}
                      {it.notes && (
                        <span className="ml-1 text-xs text-muted-foreground">({it.notes})</span>
                      )}
                    </span>
                    <span>${(Number(it.qty) * Number(it.price)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Advance button */}
              {!isDone && nextStatus && (
                <Button
                  onClick={() => advance(o)}
                  className="mt-4 w-full rounded-full"
                >
                  Advance → {nextStatus}
                </Button>
              )}
              {isDone && (
                <p className="mt-4 text-center text-xs text-muted-foreground">✓ Completed</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}