import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ChefHat, Clock, Leaf, Star, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import { Button }   from "@/components/ui/button";
import { DishCard } from "@/components/dish-card";
import { menuItems as seedItems, testimonials, type MenuItem } from "@/lib/mock-data";
import heroImg from "@/assets/hero.jpg";
import api, { session } from "@/lib/api";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "Savora — Modern Bistro & Delivery" },
      { name: "description", content: "Seasonal dishes, hand-crafted by our chefs." },
      { property: "og:title", content: "Savora — Modern Bistro" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [popular, setPopular] = useState<MenuItem[]>(
    seedItems.filter((m) => m.popular)
  );

  // Google OAuth reload fix — runs INSIDE the component
  useEffect(() => {
    const justLoggedIn = new URLSearchParams(window.location.search).get("t");
    if (justLoggedIn && session.loggedIn()) {
      window.history.replaceState({}, "", "/");
      window.location.reload();
    }
  }, []);

  // Load popular menu items from backend
  useEffect(() => {
    api.get("/api/menu")
      .then((res) => {
        const items: MenuItem[] = res.data?.data ?? [];
        if (items.length === 0) return;
        const pop = items.filter((m) => m.popular);
        setPopular(pop.length > 0 ? pop : items.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-2 md:py-24 md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center"
          >
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Leaf className="h-3 w-3" /> Seasonal · Local · Hand-crafted
            </span>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] text-balance md:text-7xl">
              A warm bistro,<br />
              <span className="bg-gradient-warm bg-clip-text text-transparent">made to be shared.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              From our open kitchen to your table — or your doorstep. Reserve, order, and savor.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/menu">
                <Button size="lg" className="rounded-full shadow-warm">
                  Order Now <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/reservation">
                <Button size="lg" variant="outline" className="rounded-full">Book a Table</Button>
              </Link>
            </div>
            <div className="mt-10 flex gap-8">
              {[
                { n: "12k+", l: "Happy guests"    },
                { n: "4.9",  l: "Avg. rating"     },
                { n: "30 min", l: "Avg. delivery"  },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-2xl font-semibold text-primary">{s.n}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-sunset opacity-30 blur-3xl" />
            <img
              src={heroImg}
              alt="Beautifully plated dishes on a warm rustic table"
              className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-warm md:aspect-[4/4]"
            />
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border/60 bg-card p-4 shadow-soft md:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/30 text-accent-foreground">
                  <ChefHat className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Chef's special tonight</div>
                  <div className="text-xs text-muted-foreground">Truffle Mushroom Risotto</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular dishes */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <span className="text-sm font-medium uppercase tracking-wider text-primary">Featured</span>
            <h2 className="font-display text-3xl font-semibold md:text-5xl">Tonight's most loved</h2>
          </div>
          <Link to="/menu" className="hidden text-sm font-medium text-primary hover:underline md:inline-flex">
            View full menu →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((item) => (
            <DishCard key={item._id ?? item.id} item={item} />
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link to="/menu">
            <Button variant="outline" className="rounded-full">View full menu</Button>
          </Link>
        </div>
      </section>

      {/* Why Savora */}
      <section className="bg-secondary/40 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold md:text-5xl">Crafted, never rushed.</h2>
            <p className="mt-4 text-muted-foreground">Three things we never compromise on.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Leaf,    title: "Local & seasonal", text: "Sourced from farms within 80km. Menu shifts with the seasons." },
              { icon: ChefHat, title: "Open kitchen",     text: "Watch every dish come together. No shortcuts, no hidden corners." },
              { icon: Clock,   title: "30-min delivery",  text: "Hot, fresh, on time. Real-time tracking from oven to door." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl bg-card p-7 shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-warm text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-primary">Guests are saying</span>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-5xl">Kind words, full hearts.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border/60 bg-card p-7 shadow-soft">
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="mt-4 text-base leading-relaxed">"{t.text}"</p>
              <div className="mt-5 text-sm font-medium">{t.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-warm px-8 py-14 text-center shadow-warm md:py-20">
          <UtensilsCrossed className="mx-auto h-10 w-10 text-primary-foreground/80" />
          <h2 className="mt-4 font-display text-3xl font-semibold text-primary-foreground md:text-5xl">
            Hungry? We're ready.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
            Browse the full menu or book your table — your favorite spot is one tap away.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/menu">
              <Button size="lg" variant="secondary" className="rounded-full">View Menu</Button>
            </Link>
            <Link to="/reservation">
              <Button size="lg" variant="outline" className="rounded-full border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Reserve
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}