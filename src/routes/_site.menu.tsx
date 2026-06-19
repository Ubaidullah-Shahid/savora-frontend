import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Loader2, RefreshCw, Search, WifiOff } from "lucide-react";
import { DishCard }    from "@/components/dish-card";
import { Button }      from "@/components/ui/button";
import { Input }       from "@/components/ui/input";
import { categories, menuItems as seedItems, type Category, type MenuItem } from "@/lib/mock-data";
import { toast }       from "sonner";
import api             from "@/lib/api";

export const Route = createFileRoute("/_site/menu")({
  head: () => ({ meta: [{ title: "Menu — Savora" }] }),
  component: MenuPage,
});

function MenuPage() {
  const [items,      setItems]      = useState<MenuItem[]>(seedItems); // start with seed, replace with DB
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState("");
  const [activecat,  setActiveCat]  = useState<Category | "All">("All");

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // GET /api/menu — public, no token needed
      const res = await api.get("/api/menu");
      const data: MenuItem[] = res.data?.data ?? [];
      // If DB has items, use them; otherwise keep seed data
      if (data.length > 0) setItems(data);
    } catch (err: any) {
      // Don't show error — seed data is already shown
      console.error("Menu fetch failed, using seed data:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  const filtered = useMemo(() =>
    items.filter((m) => {
      const q   = search.toLowerCase();
      const hit = !q || m.name.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q);
      const cat = activecat === "All" || m.category === activecat;
      return hit && cat;
    }),
    [items, search, activecat]
  );

  return (
    <div className="container mx-auto px-4 py-10 md:py-16">
      {/* Page header */}
      <div className="text-center">
        <span className="text-sm font-medium uppercase tracking-wider text-primary">Our menu</span>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-6xl">What's cooking today.</h1>
        <p className="mt-4 text-muted-foreground">
          {items.length} dishes · freshened up daily.
        </p>
      </div>

      {/* Search + filters */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search dishes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full"
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {(["All", ...categories] as const).map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={activecat === cat ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setActiveCat(cat as Category | "All")}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="mt-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading menu…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-20 flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-lg font-medium">No dishes found</p>
          <p className="text-sm text-muted-foreground">Try a different search or category.</p>
          <Button variant="outline" className="rounded-full" onClick={() => { setSearch(""); setActiveCat("All"); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <DishCard key={item._id ?? item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}