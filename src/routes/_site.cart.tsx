import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";

export const Route = createFileRoute("/_site/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Savora" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();
  const sub = subtotal();
  const delivery = sub > 0 ? 3.5 : 0;
  const total = sub + delivery;

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <ShoppingBag className="h-9 w-9 text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Let's fix that — your favorites are waiting.</p>
        <Link to="/menu" className="mt-6">
          <Button size="lg" className="rounded-full">Browse menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto grid gap-10 px-4 py-12 md:py-16 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Your cart</h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} item{items.length > 1 ? "s" : ""}</p>

        <div className="mt-6 space-y-3">
          {items.map((i) => (
            <div key={i.id} className="flex gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
              <img src={i.image} alt={i.name} loading="lazy" className="h-24 w-24 flex-shrink-0 rounded-xl object-cover" />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold leading-tight">{i.name}</h3>
                    <p className="text-xs text-muted-foreground">{i.category}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(i.id)} aria-label="Remove">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => setQty(i.id, i.qty - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">{i.qty}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => setQty(i.id, i.qty + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="font-display text-lg font-semibold text-primary">${(i.price * i.qty).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${sub.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>${delivery.toFixed(2)}</span></div>
          </div>
          <div className="my-4 border-t border-border" />
          <div className="flex justify-between font-display text-lg font-semibold">
            <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
          </div>
          <Link to="/checkout">
            <Button size="lg" className="mt-5 w-full rounded-full shadow-warm">Proceed to checkout</Button>
          </Link>
          <Link to="/menu">
            <Button variant="ghost" className="mt-2 w-full rounded-full">Add more items</Button>
          </Link>
        </div>
      </aside>
    </div>
  );
}
