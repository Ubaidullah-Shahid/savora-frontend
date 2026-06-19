import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, ChefHat, ClipboardList, LayoutDashboard, LogOut, type LucideIcon, ShoppingBag, UtensilsCrossed, Users } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface NavItem { to: string; label: string; icon: LucideIcon }

export function DashboardShell({
  title,
  brand,
  brandIcon: BrandIcon,
  nav,
  children,
}: {
  title: string;
  brand: string;
  brandIcon: LucideIcon;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const loc = useLocation();
  return (
    <div className="flex min-h-screen bg-secondary/20">
      <aside className="hidden w-64 flex-col border-r border-border/60 bg-sidebar p-4 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-warm">
            <BrandIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold">{brand}</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((n) => {
            const active = loc.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground shadow-warm" : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <Link to="/" className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" />
          Exit
        </Link>
      </aside>

      <div className="flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur md:px-8">
          <div>
            <h1 className="font-display text-xl font-semibold md:text-2xl">{title}</h1>
            <p className="hidden text-xs text-muted-foreground md:block">Welcome back — here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-sunset text-sm font-semibold text-primary-foreground md:flex">
              JD
            </div>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-border/60 bg-background/95 py-2 backdrop-blur md:hidden">
          {nav.slice(0, 5).map((n) => {
            const active = loc.pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}>
                <n.icon className="h-5 w-5" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <main className="p-4 pb-24 md:p-8 md:pb-8">{children}</main>
      </div>
    </div>
  );
}

export const adminNav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export const staffNav: NavItem[] = [
  { to: "/staff", label: "Overview", icon: LayoutDashboard },
  { to: "/staff/kitchen", label: "Kitchen", icon: ChefHat },
  { to: "/staff/waiter", label: "Waiter", icon: ClipboardList },
  { to: "/staff/tables", label: "Tables", icon: Users },
];
