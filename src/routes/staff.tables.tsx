import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Users, Loader2, RefreshCw, WifiOff, CalendarDays } from "lucide-react";
import { type TableStatus } from "@/lib/mock-data";
import { Button }  from "@/components/ui/button";
import { Badge }   from "@/components/ui/badge";
import { toast }   from "sonner";
import api         from "@/lib/api";

export const Route = createFileRoute("/staff/tables")({ component: TablesPage });

const TOTAL_TABLES = 10; // 👈 change this to your actual table count

const tone: Record<TableStatus, string> = {
  Available: "border-success/50 bg-success/10 text-success",
  Occupied:  "border-primary/50 bg-primary/10 text-primary",
  Reserved:  "border-accent/60 bg-accent/20 text-accent-foreground",
};

const resBadge = (status: string) =>
  status === "Confirmed"  ? "bg-success/20 text-success border-success/40" :
  status === "Cancelled"  ? "bg-destructive/20 text-destructive border-destructive/40" :
  "bg-warning/20 text-warning border-warning/40";

function TablesPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [resLoading,   setResLoading]   = useState(true);
  const [resError,     setResError]     = useState<string | null>(null);

  // ── Fetch reservations from backend ─────────────────────────────────────
  const fetchReservations = useCallback(async () => {
    setResLoading(true);
    setResError(null);
    try {
      const res = await api.get("/api/reservations");
      setReservations(res.data?.data ?? []);
    } catch (err: any) {
      const msg = !err.response
        ? "Cannot reach server."
        : (err.response?.data?.message ?? "Failed to load reservations.");
      setResError(msg);
    } finally {
      setResLoading(false);
    }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  // ── Derive tables from real reservations ────────────────────────────────
  const today = new Date().toISOString().split("T")[0];

  const tables = Array.from({ length: TOTAL_TABLES }, (_, i) => {
    const tableNum = i + 1;
    // Match today's confirmed reservations to this table number
    const reservation = reservations.find(
      (r) => r.tableNumber === tableNum &&
             r.date === today &&
             r.status === "Confirmed"
    );
    return {
      id: tableNum,
      seats: 4, // 👈 adjust seats per table if needed
      status: (reservation ? "Reserved" : "Available") as TableStatus,
      guest:  reservation ? reservation.name : undefined,
      time:   reservation ? reservation.time : undefined,
      guests: reservation ? reservation.guests : undefined,
      resId:  reservation ? reservation._id : undefined,
    };
  });

  // ── Update reservation status in DB ─────────────────────────────────────
  const updateResStatus = async (id: string, status: string) => {
    try {
      await api.put(`/api/reservations/${id}`, { status });
      setReservations((prev) =>
        prev.map((r) => r._id === id ? { ...r, status } : r)
      );
      toast.success(`Reservation ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update reservation.");
    }
  };

  return (
    <div className="space-y-8">

      {/* ── Tables section ────────────────────────────────────────────────── */}
      <div>
        <h2 className="font-display text-2xl font-semibold">Tables</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Table status is based on today's confirmed reservations from MongoDB.
        </p>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          {(["Available", "Reserved"] as TableStatus[]).map((s) => (
            <span key={s} className={`rounded-full border px-3 py-1 font-medium ${tone[s]}`}>
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
              {s}
            </span>
          ))}
        </div>

        {/* Loading */}
        {resLoading && (
          <div className="mt-6 flex h-40 items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm">Loading tables…</span>
          </div>
        )}

        {/* Table grid */}
        {!resLoading && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {tables.map((t) => (
              <div key={t.id} className={`rounded-2xl border-2 p-5 shadow-soft transition-all hover:-translate-y-1 ${tone[t.status]}`}>
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-semibold">Table {t.id}</span>
                  <Users className="h-5 w-5" />
                </div>
                <p className="mt-1 text-sm">{t.seats} seats</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider">{t.status}</p>

                {/* Show reservation info if reserved */}
                {t.status === "Reserved" && (
                  <div className="mt-2 space-y-0.5">
                    <p className="truncate text-sm font-medium text-foreground">{t.guest}</p>
                    <p className="text-xs text-muted-foreground">{t.guests} guests · {t.time}</p>
                  </div>
                )}

                {/* Cancel reserved table */}
                {t.status === "Reserved" && t.resId && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full rounded-full bg-background"
                    onClick={() => updateResStatus(t.resId!, "Cancelled")}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Reservations from MongoDB ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">Reservations</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Booked through the customer reservation form — stored in MongoDB.
            </p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={fetchReservations}>
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>
        </div>

        {/* Loading */}
        {resLoading && (
          <div className="mt-6 flex h-40 items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm">Loading reservations…</span>
          </div>
        )}

        {/* Error */}
        {!resLoading && resError && (
          <div className="mt-6 flex h-40 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 text-center">
            <WifiOff className="h-8 w-8 text-destructive/60" />
            <p className="text-sm text-destructive">{resError}</p>
            <Button variant="outline" size="sm" className="rounded-full" onClick={fetchReservations}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try again
            </Button>
          </div>
        )}

        {/* Empty */}
        {!resLoading && !resError && reservations.length === 0 && (
          <div className="mt-6 flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No reservations yet. Customers can book a table from the Reservation page.
            </p>
          </div>
        )}

        {/* Reservations table */}
        {!resLoading && !resError && reservations.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border/60 bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left">Guest</th>
                    <th className="px-5 py-3 text-left">Phone</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left">Time</th>
                    <th className="px-5 py-3 text-left">Guests</th>
                    <th className="px-5 py-3 text-left">Notes</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r._id} className="border-b border-border/40 last:border-0">
                      <td className="px-5 py-4 font-medium">{r.name}</td>
                      <td className="px-5 py-4 text-muted-foreground">{r.phone}</td>
                      <td className="px-5 py-4">{r.date}</td>
                      <td className="px-5 py-4">{r.time}</td>
                      <td className="px-5 py-4">{r.guests}</td>
                      <td className="px-5 py-4 max-w-[160px] truncate text-muted-foreground">
                        {r.notes || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${resBadge(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {r.status !== "Confirmed" && (
                            <Button
                              size="sm"
                              className="rounded-full bg-success hover:bg-success/90 text-xs h-7 px-3"
                              onClick={() => updateResStatus(r._id, "Confirmed")}
                            >
                              Confirm
                            </Button>
                          )}
                          {r.status !== "Cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full text-xs h-7 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => updateResStatus(r._id, "Cancelled")}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}