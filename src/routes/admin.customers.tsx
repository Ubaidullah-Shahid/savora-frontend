import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  // ✅ hooks INSIDE the function
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/users");
     const all = res.data?.data ?? [];
setUsers(all.filter((u: any) => u.role === "customer"));
    } catch {
      toast.error("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-muted-foreground">
      Loading customers…
    </div>
  );

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-semibold">Customers</h2>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                    No users registered yet.
                  </td>
                </tr>
              )}
              {users.map((c) => (
                <tr key={c._id} className="border-b border-border/40 last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-warm text-xs font-bold text-primary-foreground">
                        {c.name?.split(" ").map((n: string) => n[0]).join("") ?? "?"}
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{c.email}</td>
                  <td className="px-6 py-4 capitalize">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {c.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}