import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { DollarSign, Loader2, RefreshCw, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { toast }  from "sonner";
import api from "@/lib/api";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildChartData(orders: any[]) {
  const map: Record<string, { day: string; sales: number; orders: number }> = {};
  DAY_NAMES.forEach((d) => { map[d] = { day: d, sales: 0, orders: 0 }; });
  orders.forEach((o) => {
    if (!o.createdAt) return;
    const d = DAY_NAMES[new Date(o.createdAt).getDay()];
    map[d].sales  += Number(o.total ?? 0);
    map[d].orders += 1;
  });
  return DAY_NAMES.map((d) => map[d]);
}

function AdminDashboard() {
  const [orders,  setOrders]  = useState<any[]>([]);
  const [users,   setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, uRes] = await Promise.all([
        api.get("/api/orders"),
        api.get("/api/users"),
      ]);
      setOrders(oRes.data?.data ?? []);
      setUsers(uRes.data?.data   ?? []);
    } catch {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // --- compute stats from real data ---
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const avgOrder     = orders.length > 0 ? totalRevenue / orders.length : 0;
  const todayStr     = new Date().toDateString();
  const todayOrders  = orders.filter((o) => o.createdAt && new Date(o.createdAt).toDateString() === todayStr);
  const todayRev     = todayOrders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const chartData    = buildChartData(orders);

  const stats = [
    { label: "Revenue today",   value: `$${todayRev.toFixed(2)}`,  icon: DollarSign,  color: "from-primary to-primary-glow" },
    { label: "Orders today",    value: String(todayOrders.length),  icon: ShoppingBag, color: "from-accent to-warning" },
    { label: "Total customers", value: String(users.length),        icon: Users,       color: "from-success to-success" },
    { label: "Avg. order",      value: `$${avgOrder.toFixed(2)}`,   icon: TrendingUp,  color: "from-chart-4 to-chart-5" },
  ];

  if (loading) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">Loading dashboard…</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Dashboard</h2>
        <Button variant="outline" size="sm" className="rounded-full" onClick={fetchAll}>
          <RefreshCw className="mr-1 h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="mt-2 font-display text-3xl font-semibold">{s.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-primary-foreground`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Weekly revenue</h3>
            <span className="text-xs text-muted-foreground">By day of week</span>
          </div>
          <div className="h-72">
            {orders.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Place some orders to see revenue data here.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="oklch(0.9 0.02 70 / 0.5)" strokeDasharray="3 3" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}
                    formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
                  />
                  <Line type="monotone" dataKey="sales" stroke="oklch(0.62 0.17 38)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold">Orders / day</h3>
          <div className="h-72">
            {orders.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No orders yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="oklch(0.9 0.02 70 / 0.5)" strokeDasharray="3 3" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Bar dataKey="orders" fill="oklch(0.78 0.15 75)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-soft">
        <div className="flex items-center justify-between p-6">
          <h3 className="font-display text-lg font-semibold">Recent orders</h3>
          <span className="text-xs text-muted-foreground">{orders.length} total</span>
        </div>
        {orders.length === 0 ? (
          <p className="px-6 pb-8 text-sm text-muted-foreground">No orders yet. Orders placed by customers will appear here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y border-border/60 bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 text-left">Order ID</th>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Placed at</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((o) => {
                  const id   = o._id ?? o.id;
                  const name = o.customer?.name ?? o.customer ?? "Guest";
                  const time = o.createdAt ? new Date(o.createdAt).toLocaleString() : "—";
                  return (
                    <tr key={id} className="border-b border-border/40 last:border-0">
                      <td className="px-6 py-4 font-mono text-xs">{id.toString().slice(-10).toUpperCase()}</td>
                      <td className="px-6 py-4 font-medium">{name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{o.type ?? "Delivery"}</td>
                      <td className="px-6 py-4 font-semibold text-primary">${Number(o.total).toFixed(2)}</td>
                      <td className="px-6 py-4"><StatusBadge status={o.status} /></td>
                      <td className="px-6 py-4 text-muted-foreground">{time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}