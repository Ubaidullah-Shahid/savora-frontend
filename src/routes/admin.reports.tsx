import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart,
} from "recharts";
import { Loader2, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast }  from "sonner";
import api from "@/lib/api";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReports,
});

const COLORS = [
  "oklch(0.62 0.17 38)",
  "oklch(0.78 0.15 75)",
  "oklch(0.55 0.12 145)",
  "oklch(0.65 0.18 15)",
  "oklch(0.60 0.14 250)",
];

// ── Turn raw orders array into chart-ready data ──────────────────────────
function buildStats(orders: any[]) {
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const totalOrders  = orders.length;
  const avgOrder     = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Orders by status
  const statusCount: Record<string, number> = {};
  orders.forEach((o) => {
    statusCount[o.status] = (statusCount[o.status] ?? 0) + 1;
  });

  // Revenue grouped by day-of-week from createdAt
  const dayMap: Record<string, { sales: number; orders: number }> = {
    Sun:{sales:0,orders:0}, Mon:{sales:0,orders:0}, Tue:{sales:0,orders:0},
    Wed:{sales:0,orders:0}, Thu:{sales:0,orders:0}, Fri:{sales:0,orders:0}, Sat:{sales:0,orders:0},
  };
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  orders.forEach((o) => {
    const d   = o.createdAt ? dayNames[new Date(o.createdAt).getDay()] : null;
    if (d) { dayMap[d].sales += Number(o.total ?? 0); dayMap[d].orders += 1; }
  });
  const trendData = dayNames.map((d) => ({ day: d, ...dayMap[d] }));

  // Category breakdown from items
  const catMap: Record<string, number> = {};
  orders.forEach((o) => {
    (o.items ?? []).forEach((it: any) => {
      catMap[it.category ?? "Other"] = (catMap[it.category ?? "Other"] ?? 0) + it.qty;
    });
  });
  const catData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  return { totalRevenue, totalOrders, avgOrder, trendData, catData, statusCount };
}

function AdminReports() {
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // ── Fetch all orders — we compute all stats from them ───────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/orders");
      setOrders(res.data?.data ?? []);
    } catch (err: any) {
      const msg = !err.response
        ? "Cannot reach server."
        : (err.response?.data?.message ?? "Failed to load reports.");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">Loading reports…</p>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center">
      <WifiOff className="h-10 w-10 text-destructive/60" />
      <p className="font-semibold text-destructive">{error}</p>
      <Button variant="outline" className="rounded-full" onClick={fetchOrders}>
        <RefreshCw className="mr-2 h-4 w-4" /> Try again
      </Button>
    </div>
  );

  const { totalRevenue, totalOrders, avgOrder, trendData, catData, statusCount } =
    buildStats(orders);

  const statCards = [
    { label: "Total revenue",  value: `$${totalRevenue.toFixed(2)}` },
    { label: "Total orders",   value: totalOrders.toString() },
    { label: "Avg. order",     value: `$${avgOrder.toFixed(2)}` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Reports</h2>
        <Button variant="outline" size="sm" className="rounded-full" onClick={fetchOrders}>
          <RefreshCw className="mr-1 h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Order status breakdown ─────────────────────────────────────────── */}
      {Object.keys(statusCount).length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-6">
          {Object.entries(statusCount).map(([status, count]) => (
            <div key={status} className="rounded-xl border border-border/60 bg-card p-3 text-center shadow-soft">
              <p className="text-xs text-muted-foreground">{status}</p>
              <p className="mt-1 font-display text-2xl font-semibold">{count}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">

        {/* ── Revenue trend chart ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft lg:col-span-2">
          <h3 className="mb-4 font-display text-lg font-semibold">Revenue by day of week</h3>
          {orders.length === 0 ? (
            <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
              No orders yet — place some orders to see revenue data.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="oklch(0.62 0.17 38)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="oklch(0.62 0.17 38)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 70 / 0.5)" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                    formatter={(val: number | undefined) => val !== undefined ? [`$${val.toFixed(2)}`, "Revenue"] : ["$0.00", "Revenue"]}
                  />
                  <Area
                    type="monotone" dataKey="sales"
                    stroke="oklch(0.62 0.17 38)" strokeWidth={3} fill="url(#rev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ── Category pie chart ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold">Items by category</h3>
          {catData.length === 0 ? (
            <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
              No category data yet.
            </div>
          ) : (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={catData} dataKey="value" nameKey="name"
                      innerRadius={50} outerRadius={85} paddingAngle={3}
                    >
                      {catData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-1">
                {catData.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                      {c.name}
                    </div>
                    <span className="font-medium">{c.value} items</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Orders per day bar chart ─────────────────────────────────────── */}
      {orders.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold">Orders count by day</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 70 / 0.5)" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="orders" fill="oklch(0.62 0.17 38)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
