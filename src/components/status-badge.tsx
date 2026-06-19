const colors: Record<string, string> = {
  Pending: "bg-warning/20 text-warning-foreground border-warning/40",
  Preparing: "bg-primary/15 text-primary border-primary/30",
  Ready: "bg-success/20 text-success border-success/40",
  "Out for Delivery": "bg-accent/30 text-accent-foreground border-accent/50",
  Delivered: "bg-secondary text-secondary-foreground border-border",
  Served: "bg-secondary text-secondary-foreground border-border",
  Available: "bg-success/20 text-success border-success/40",
  Occupied: "bg-primary/15 text-primary border-primary/30",
  Reserved: "bg-accent/30 text-accent-foreground border-accent/50",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-secondary text-secondary-foreground"}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
