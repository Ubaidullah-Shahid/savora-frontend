import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, ShoppingBag, UtensilsCrossed, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge }  from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { useCart }     from "@/lib/cart-store";
import { session }     from "@/lib/api";
import { toast }       from "sonner";

export function SiteNavbar() {
  const [open, setOpen] = useState(false);
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const loc       = useLocation();
  const navigate  = useNavigate();

  // ── Re-read localStorage on every mount ──────────────────────────────────
  // This is critical for Google OAuth — after the hard redirect from Google,
  // React re-mounts this component and reads the fresh token from localStorage
  // ✅ Replace with these
const [loggedIn,  setLoggedIn]  = useState(false);
const [role,      setRole]      = useState<string | null>(null);
const [userName,  setUserName]  = useState<string | null>(null);

  useEffect(() => {
    setLoggedIn(session.loggedIn());
    setRole(session.role());
    setUserName(session.name());
  }, []);

  const baseLinks = [
    { to: "/",            label: "Home"        },
    { to: "/menu",        label: "Menu"        },
    { to: "/reservation", label: "Reserve"     },
    { to: "/track",       label: "Track Order" },
  ] as const;

  const dashLink =
    role === "admin" ? { to: "/admin", label: "Admin Panel" } :
    role === "staff" ? { to: "/staff", label: "Staff Panel" } : null;

  const allLinks = dashLink ? [...baseLinks, dashLink] : [...baseLinks];

  const signOut = () => {
    session.clear();
    setLoggedIn(false);
    setRole(null);
    setUserName(null);
    toast.success("Signed out. See you soon!");
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-warm shadow-warm">
            <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-semibold">Savora</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {allLinks.map((l) => {
            const active = loc.pathname === l.to || (l.to !== "/" && loc.pathname.startsWith(l.to));
            return (
              <Link key={l.to} to={l.to}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          {/* Cart — only for customers */}
          {(!role || role === "customer") && (
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-primary px-1 text-[10px]">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          {/* Auth — desktop */}
          {loggedIn ? (
            <div className="hidden items-center gap-2 md:flex">
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/60 px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-warm text-[10px] font-bold text-primary-foreground">
                  {userName?.[0]?.toUpperCase() ?? "?"}
                </div>
                <span className="max-w-[100px] truncate text-sm font-medium">{userName}</span>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold capitalize text-primary">
                  {role}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link to="/auth" className="hidden md:block">
              <Button className="rounded-full">Sign in</Button>
            </Link>
          )}

          {/* Mobile hamburger */}
          <Button variant="ghost" size="icon" className="md:hidden"
            onClick={() => setOpen((o) => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {allLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary">
                {l.label}
              </Link>
            ))}
            {loggedIn ? (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 rounded-xl border bg-secondary/40 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-warm text-xs font-bold text-primary-foreground">
                    {userName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs capitalize text-muted-foreground">{role}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full rounded-full"
                  onClick={() => { signOut(); setOpen(false); }}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </Button>
              </div>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)}>
                <Button className="mt-2 w-full rounded-full">Sign in</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}