import { createFileRoute } from "@tanstack/react-router";
import { Edit2, Plus, Trash2, Search, Loader2, RefreshCw, AlertCircle, WifiOff } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { categories, type MenuItem, type Category } from "@/lib/mock-data";
import { toast } from "sonner";
import api from "@/lib/api";

export const Route = createFileRoute("/admin/menu")({ component: AdminMenu });

// ─── Types ─────────────────────────────────────────────────────────────────
type Draft = {
  name: string; description: string;
  price: number; category: Category; image: string;
};

const emptyDraft: Draft = { name: "", description: "", price: 0, category: "Mains", image: "" };

// ─── Safely extract array from any API response shape ─────────────────────
// Backend sends { success, data: [...] }  →  res.data.data
// If that is undefined for any reason, fall back gracefully
function extractArray(responseData: any): MenuItem[] {
  // Shape: { success: true, data: [...] }
  if (Array.isArray(responseData?.data))    return responseData.data;
  // Shape: { success: true, data: { ... } } — single object (shouldn't happen but guard it)
  if (Array.isArray(responseData))          return responseData;
  // Anything else → empty array, never undefined
  return [];
}

// ─── Shared form used for both Add and Edit ────────────────────────────────
function MenuItemForm({ initial, onSave, onClose, submitLabel, saving }: {
  initial: Draft;
  onSave: (d: Draft) => Promise<void>;
  onClose: () => void;
  submitLabel: string;
  saving: boolean;
}) {
  const [d, setD] = useState<Draft>({ ...initial });
  const set = (k: keyof Draft, v: string | number) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.name.trim())  { toast.error("Name is required");              return; }
    if (d.price <= 0)    { toast.error("Price must be greater than 0"); return; }
    await onSave(d);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label>Name *</Label>
        <Input
          required value={d.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Truffle Mushroom Risotto"
          className="mt-1"
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          rows={3} value={d.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Brief description of the dish…"
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Price ($) *</Label>
          <Input
            required type="number" step="0.01" min="0.01"
            value={d.price || ""}
            onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
            placeholder="0.00" className="mt-1"
          />
        </div>
        <div>
          <Label>Category *</Label>
          <Select value={d.category} onValueChange={(v) => set("category", v as Category)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Image URL</Label>
        <Input
          value={d.image}
          onChange={(e) => set("image", e.target.value)}
          placeholder="https://images.unsplash.com/…"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Leave blank to show a category emoji fallback.
        </p>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" className="flex-1 rounded-full" disabled={saving}>
          {saving
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
            : submitLabel}
        </Button>
        <Button
          type="button" variant="outline" className="rounded-full"
          onClick={onClose} disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ─── Image with emoji fallback ─────────────────────────────────────────────
const EMOJIS: Record<string, string> = {
  Starters: "🥗", Mains: "🍽️", "Fast Food": "🍔", Drinks: "🍹", Desserts: "🍰",
};

function ItemImage({ src, name, category }: { src: string; name: string; category: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-secondary/60 gap-2">
        <span className="text-5xl">{EMOJIS[category] ?? "🍽️"}</span>
        <span className="px-3 text-center text-xs text-muted-foreground line-clamp-1">{name}</span>
      </div>
    );
  }

  return (
    <img
      src={src} alt={name} loading="lazy"
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      onError={() => setFailed(true)}
    />
  );
}

// ─── Get the right ID whether item came from DB (_id) or mock (id) ─────────
const getId = (m: MenuItem) => (m as any)._id ?? m.id;

// ─── Main Component ────────────────────────────────────────────────────────
function AdminMenu() {
  const [items,      setItems]      = useState<MenuItem[]>([]);   // always an array
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search,     setSearch]     = useState("");
  const [filterCat,  setFilterCat]  = useState<Category | "All">("All");
  const [addOpen,    setAddOpen]    = useState(false);
  const [editItem,   setEditItem]   = useState<MenuItem | null>(null);

  // ── Fetch all items from MongoDB ─────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res  = await api.get("/api/menu");
      const list = extractArray(res.data);   // always an array, never undefined
      setItems(list);
    } catch (err: any) {
      const msg =
        !err.response
          ? "Cannot reach server — make sure the backend is running on port 5000."
          : err.response?.data?.message ?? "Failed to load menu.";
      setFetchError(msg);
      setItems([]);   // keep items as empty array so .filter() never crashes
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Add ──────────────────────────────────────────────────────────────────
  const handleAdd = async (draft: Draft) => {
    setSaving(true);
    try {
      const res     = await api.post("/api/menu", { ...draft, rating: 4.5, prepTime: 15, popular: false });
      const newItem = res.data?.data ?? res.data;   // handle both shapes
      if (newItem) {
        setItems((prev) => [...prev, newItem]);
        toast.success(`"${draft.name}" added to menu 🎉`);
        setAddOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to add item.");
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = async (draft: Draft) => {
    if (!editItem) return;
    const id = getId(editItem);
    setSaving(true);
    try {
      const res     = await api.put(`/api/menu/${id}`, draft);
      const updated = res.data?.data ?? res.data;
      if (updated) {
        setItems((prev) => prev.map((m) => getId(m) === id ? updated : m));
        toast.success(`"${draft.name}" updated ✅`);
        setEditItem(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to update item.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    const id = getId(item);
    setSaving(true);
    try {
      await api.delete(`/api/menu/${id}`);
      setItems((prev) => prev.filter((m) => getId(m) !== id));
      toast.success(`"${item.name}" removed`);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to delete item.");
    } finally {
      setSaving(false);
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────────
  // items is guaranteed to be an array so .filter() can never crash
  const filtered = items.filter((m) => {
    const q   = search.toLowerCase();
    const hit = !q || m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
    const cat = filterCat === "All" || m.category === filterCat;
    return hit && cat;
  });

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Loading menu from database…</p>
      </div>
    );
  }

  // ── Fetch error ──────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 text-center p-8">
        <WifiOff className="h-10 w-10 text-destructive/60" />
        <div>
          <p className="font-semibold text-destructive">Could not load menu</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{fetchError}</p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={fetchItems}>
          <RefreshCw className="mr-2 h-4 w-4" /> Try again
        </Button>
      </div>
    );
  }

  // ── Main UI ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Menu Management</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} items in database · {filtered.length} shown
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm" className="rounded-full"
            onClick={fetchItems} disabled={loading || saving}
          >
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>

          {/* Add dialog */}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full shadow-warm" disabled={saving}>
                <Plus className="mr-1 h-4 w-4" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">New Menu Item</DialogTitle>
              </DialogHeader>
              <MenuItemForm
                initial={emptyDraft}
                onSave={handleAdd}
                onClose={() => setAddOpen(false)}
                submitLabel="Create Item"
                saving={saving}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["All", ...categories] as const).map((cat) => (
            <Button
              key={cat} size="sm"
              variant={filterCat === cat ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setFilterCat(cat as Category | "All")}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {items.length === 0
              ? 'No items yet — click "Add Item" to create your first menu item.'
              : "No items match your search."}
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((m) => {
          const id = getId(m);
          return (
            <div
              key={id}
              className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-warm"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
                <ItemImage src={m.image} name={m.name} category={m.category} />
                {m.popular && (
                  <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
                    Popular
                  </Badge>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold leading-tight">{m.name}</h3>
                  <span className="font-display font-semibold text-primary whitespace-nowrap">
                    ${Number(m.price).toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.description}</p>
                <Badge variant="secondary" className="mt-2 text-xs">{m.category}</Badge>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  {/* Edit */}
                  <Dialog
                    open={editItem !== null && getId(editItem) === id}
                    onOpenChange={(open) => { if (!open) setEditItem(null); }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm" variant="outline" className="flex-1 rounded-full"
                        onClick={() => setEditItem(m)}
                        disabled={saving}
                      >
                        <Edit2 className="mr-1 h-3 w-3" /> Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-display text-xl">Edit — {m.name}</DialogTitle>
                      </DialogHeader>
                      {editItem !== null && getId(editItem) === id && (
                        <MenuItemForm
                          initial={{
                            name:        m.name,
                            description: m.description,
                            price:       m.price,
                            category:    m.category,
                            image:       m.image,
                          }}
                          onSave={handleEdit}
                          onClose={() => setEditItem(null)}
                          submitLabel="Save Changes"
                          saving={saving}
                        />
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Delete */}
                  <Button
                    size="sm" variant="ghost"
                    className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(m)}
                    disabled={saving}
                  >
                    {saving
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Trash2 className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
