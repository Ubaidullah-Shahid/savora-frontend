import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, UtensilsCrossed } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/30">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-warm">
              <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-semibold">Savora</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            A modern bistro serving seasonal, hand-crafted dishes from open kitchen to your table — or doorstep.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/menu" className="hover:text-foreground">Menu</Link></li>
            <li><Link to="/reservation" className="hover:text-foreground">Reservations</Link></li>
            <li><Link to="/track" className="hover:text-foreground">Track Order</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Visit us</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>24 Olive Lane, Lisbon</li>
            <li>Open daily · 12pm – 11pm</li>
            <li>+351 912 345 678</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Follow</h4>
          <div className="flex gap-3">
            <a aria-label="Instagram" href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition-colors"><Instagram className="h-4 w-4" /></a>
            <a aria-label="Twitter" href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition-colors"><Twitter className="h-4 w-4" /></a>
            <a aria-label="Facebook" href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition-colors"><Facebook className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Savora · Crafted with care.
      </div>
    </footer>
  );
}
