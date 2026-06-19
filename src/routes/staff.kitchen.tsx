import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { AlertCircle, ChefHat, Clock, Loader2, RefreshCw, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { toast } from "sonner";
import api from "@/lib/api";

export const Route = createFileRoute("/staff/kitchen")({ component: KitchenView });

type KitchenStatus = "Pending" | "Preparing" | "Ready";

const cols: { title: string; status: KitchenStatus; tone: string }[] = [
  { title: "Incoming", status: "Pending",   tone: "border-warning/40 bg-warning/5" },
  { title: "Cooking",  status: "Preparing", tone: "border-primary/40 bg-primary/5" },
  { title: "Ready",    status: "Ready",      tone: "border-success/40 bg-success/5" },
];

function KitchenView() {
  const [list,    setList]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Fetch only active kitchen orders (Pending, Preparing, Ready)
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/orders");
      const all = res.data?.data ?? [];
      // Show only orders that kitchen needs to action
      setList(all.filter((o: any) => ["Pending", "Preparing", "Ready"].includes(o.status)));
    } catch (err: any) {
      const msg = !err.response ? "Cannot reach server." : (err.response?.data?.message ?? "Failed to load orders.");
      setError(msg);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Update order status in MongoDB, then update local state
  const update = async (order: any, status: KitchenStatus) => {
    const id = order._id ?? order.id;
    try {
      // PUT /api/orders/:id/status
      await api.put(`/api/orders/${id}/status`, { status });
      setList((prev) => prev.map((o) => (o._id === id || o.id === id) ? { ...o, status } : o));
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error("Failed to update order status.");
    }
  };

  if (loading) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">Loading kitchen orders…</p>
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

  const pendingCount = list.filter((o) => o.status === "Pending").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Kitchen</h2>
          <p className="text-sm text-muted-foreground">Handle urgent orders first.</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning">
              <AlertCircle className="h-3 w-3" /> {pendingCount} urgent
            </div>
          )}
          <Button variant="outline" size="sm" className="rounded-full" onClick={fetchOrders}>
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {list.length === 0 && (
        <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border text-center">
          <ChefHat className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No active kitchen orders right now.</p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {cols.map((c) => (
          <div key={c.status} className={`rounded-2xl border-2 ${c.tone} p-4`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">{c.title}</h3>
              <span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold">
                {list.filter((o) => o.status === c.status).length}
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {list.filter((o) => o.status === c.status).map((o) => {
                  const id   = o._id ?? o.id;
                  const name = o.customer?.name ?? o.customer ?? "Guest";
                  const time = o.createdAt ? new Date(o.createdAt).toLocaleTimeString() : (o.placedAt ?? "—");
                  return (
                    <motion.div
                      key={id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-xl border border-border/60 bg-card p-4 shadow-soft"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-xs text-muted-foreground">
                            {id.toString().slice(-8).toUpperCase()}
                          </span>
                          <h4 className="font-display font-semibold">{name}</h4>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> {time}
                          </p>
                        </div>
                        <StatusBadge status={o.status} />
                      </div>

                      <ul className="mt-3 space-y-1 border-t border-border/40 pt-3 text-sm">
                        {(o.items ?? []).map((it: any, i: number) => (
                          <li key={i}>
                            <span className="font-semibold">{it.qty}×</span> {it.name}
                            {it.notes && <span className="ml-1 text-xs italic text-warning">— {it.notes}</span>}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3 flex gap-2">
                        {o.status === "Pending" && (
                          <Button size="sm" className="flex-1 rounded-full" onClick={() => update(o, "Preparing")}>
                            <ChefHat className="mr-1 h-3 w-3" /> Start
                          </Button>
                        )}
                        {o.status === "Preparing" && (
                          <Button size="sm" className="flex-1 rounded-full bg-success hover:bg-success/90" onClick={() => update(o, "Ready")}>
                            Mark Ready
                          </Button>
                        )}
                        {o.status === "Ready" && (
                          <span className="flex-1 text-center text-xs text-muted-foreground py-1">Awaiting waiter…</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}