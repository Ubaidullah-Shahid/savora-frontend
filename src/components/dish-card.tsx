import { Plus, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge }  from "@/components/ui/badge";
import type { MenuItem } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-store";
import { toast }  from "sonner";

// Beautiful SVG fallback — shows dish name on a warm gradient
function ImageFallback({ name, category }: { name: string; category: string }) {
  const emojis: Record<string, string> = {
    Starters: "🥗", Mains: "🍽️", "Fast Food": "🍔", Drinks: "🍹", Desserts: "🍰",
  };
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-secondary to-secondary/60 gap-2">
      <span className="text-5xl">{emojis[category] ?? "🍽️"}</span>
      <span className="px-3 text-center text-xs font-medium text-muted-foreground line-clamp-2">{name}</span>
    </div>
  );
}

export function DishCard({ item }: { item: MenuItem }) {
  const add = useCart((s) => s.add);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-warm">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
        {imgFailed ? (
          <ImageFallback name={item.name} category={item.category} />
        ) : (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgFailed(true)}
          />
        )}
        {item.popular && (
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground shadow-warm">
            Popular
          </Badge>
        )}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs font-medium backdrop-blur">
          <Star className="h-3 w-3 fill-accent text-accent" /> {item.rating}
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-tight">{item.name}</h3>
          <span className="font-display text-lg font-semibold text-primary whitespace-nowrap">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">{item.prepTime} min</span>
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => { add(item); toast.success(`${item.name} added to cart 🛒`); }}
          >
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}
