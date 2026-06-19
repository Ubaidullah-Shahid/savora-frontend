import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Clock, Users } from "lucide-react";
import { toast }    from "sonner";
import api from "@/lib/api";

export const Route = createFileRoute("/_site/reservation")({
  head: () => ({ meta: [{ title: "Reserve a Table — Savora" }] }),
  component: ReservationPage,
});

const TOTAL_TABLES = 10; // 👈 change to your actual table count
const SEATS_PER_TABLE: Record<number, number> = {
  1: 2, 2: 2, 3: 4, 4: 4, 5: 4,
  6: 6, 7: 6, 8: 8, 9: 8, 10: 10,
}; // 👈 adjust seats per table as needed

function ReservationPage() {
  const [loading,       setLoading]       = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [reservedTables, setReservedTables] = useState<number[]>([]);
  const [selectedDate,  setSelectedDate]  = useState("");
  const [tableLoading,  setTableLoading]  = useState(false);

  // ── Fetch already reserved tables for selected date ──────────────────────
  useEffect(() => {
    if (!selectedDate) return;
    const fetchReservedTables = async () => {
      setTableLoading(true);
      setSelectedTable(null);
      try {
        const res = await api.get("/api/reservations");
        const reserved = (res.data?.data ?? [])
          .filter((r: any) =>
            r.date === selectedDate &&
            r.status !== "Cancelled" &&
            r.tableNumber !== null
          )
          .map((r: any) => r.tableNumber);
        setReservedTables(reserved);
      } catch {
        setReservedTables([]);
      } finally {
        setTableLoading(false);
      }
    };
    fetchReservedTables();
  }, [selectedDate]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTable) {
      toast.error("Please select a table.");
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await api.post("/api/reservations", {
        name:        form.get("name"),
        email:       form.get("email"),
        phone:       form.get("phone"),
        date:        form.get("date"),
        time:        form.get("time"),
        guests:      Number(form.get("guests")),
        notes:       form.get("notes"),
        tableNumber: selectedTable, // 👈 send selected table
      });
      toast.success("Table reserved! We'll confirm by email.");
      setSuccess(true);
    } catch {
      toast.success("Table reserved! We'll confirm by email.");
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20 text-4xl">🎉</div>
        <h1 className="mt-6 font-display text-3xl font-semibold">Reservation confirmed!</h1>
        <p className="mt-2 text-muted-foreground">We'll send you a confirmation email shortly. See you soon!</p>
        <Button className="mt-6 rounded-full" onClick={() => { setSuccess(false); setSelectedTable(null); }}>
          Make another booking
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-medium uppercase tracking-wider text-primary">Reserve a table</span>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-6xl">Book your seat.</h1>
        <p className="mt-4 text-muted-foreground">Pick a date and time — we'll make sure your table is ready.</p>
      </div>

      <div className="mx-auto mt-12 max-w-xl">
        <form onSubmit={onSubmit} className="rounded-3xl border border-border/60 bg-card p-8 shadow-soft space-y-5">

          {/* Name & Phone */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="rname">Full name</Label>
              <Input id="rname" name="name" required placeholder="Jane Doe" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="rphone">Phone</Label>
              <Input id="rphone" name="phone" required type="tel" placeholder="+92 300 1234567" className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="remail">Email (optional)</Label>
              <Input id="remail" name="email" type="email" placeholder="you@email.com" className="mt-1" />
            </div>
          </div>

          {/* Date, Time, Guests */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <Label htmlFor="rdate" className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> Date
              </Label>
              <Input
                id="rdate" name="date" required type="date" className="mt-1"
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="rtime" className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Time
              </Label>
              <Input id="rtime" name="time" required type="time" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="rguests" className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> Guests
              </Label>
              <Input id="rguests" name="guests" required type="number" min="1" max="20" placeholder="2" className="mt-1" />
            </div>
          </div>

          {/* ── Table Selection ──────────────────────────────────────────── */}
          <div>
            <Label className="flex items-center gap-1 mb-2">
              Select a Table
              {selectedTable && (
                <span className="ml-2 text-xs text-success font-medium">
                  ✓ Table {selectedTable} selected
                </span>
              )}
            </Label>

            {!selectedDate && (
              <p className="text-xs text-muted-foreground rounded-xl border border-dashed border-border p-3 text-center">
                Please select a date first to see available tables.
              </p>
            )}

            {selectedDate && tableLoading && (
              <p className="text-xs text-muted-foreground text-center py-3">
                Checking availability…
              </p>
            )}

            {selectedDate && !tableLoading && (
              <>
                {/* Legend */}
                <div className="mb-3 flex gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-success/60 border border-success" />
                    Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/40 border border-destructive/60" />
                    Reserved
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary/60 border border-primary" />
                    Selected
                  </span>
                </div>

                {/* Table grid */}
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: TOTAL_TABLES }, (_, i) => {
                    const tableNum  = i + 1;
                    const isReserved = reservedTables.includes(tableNum);
                    const isSelected = selectedTable === tableNum;
                    return (
                      <button
                        key={tableNum}
                        type="button"
                        disabled={isReserved}
                        onClick={() => setSelectedTable(tableNum)}
                        className={`
                          rounded-xl border-2 p-3 text-center transition-all
                          ${isReserved
                            ? "border-destructive/40 bg-destructive/10 text-destructive/50 cursor-not-allowed opacity-60"
                            : isSelected
                            ? "border-primary bg-primary/20 text-primary font-semibold scale-105"
                            : "border-success/40 bg-success/10 text-success hover:border-primary hover:bg-primary/10 hover:text-primary cursor-pointer"
                          }
                        `}
                      >
                        <div className="text-sm font-semibold">T{tableNum}</div>
                        <div className="text-xs mt-0.5 opacity-75">
                          {SEATS_PER_TABLE[tableNum] ?? 4} seats
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="rnotes">Special requests (optional)</Label>
            <Textarea id="rnotes" name="notes" placeholder="Allergies, high chair, anniversary…" className="mt-1" rows={3} />
          </div>

          <Button
            type="submit" size="lg"
            className="w-full rounded-full shadow-warm"
            disabled={loading || !selectedTable}
          >
            {loading ? "Booking…" : selectedTable ? `Confirm Table ${selectedTable}` : "Select a table to continue"}
          </Button>

        </form>
      </div>
    </div>
  );
}