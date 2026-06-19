import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input  } from "@/components/ui/input";

interface Message {
  role:    "user" | "assistant";
  content: string;
}

// ── Rule based response engine ─────────────────────────────────────────────
// Checks message for keywords and returns the matching response
// Order matters — more specific checks come first
const getResponse = (raw: string): string => {
  const msg = raw.toLowerCase().trim();

  // Greetings
  if (msg.match(/^(hi|hello|hey|salam|assalam|good morning|good evening|good afternoon)/))
    return "Hello! Welcome to Savora 🍽️ I am your restaurant assistant. Ask me about our menu, delivery, reservations, payments, or anything else!";

  // Thanks
  if (msg.includes("thank") || msg.includes("shukriya") || msg.includes("shukria"))
    return "You are most welcome! 😊 Enjoy your meal at Savora. Is there anything else I can help you with?";

  // Popular / best / recommend
  if (msg.includes("popular") || msg.includes("best") || msg.includes("recommend") || msg.includes("special") || msg.includes("favourite") || msg.includes("favorite"))
    return "Our most loved dishes are 🌟\n\n• Truffle Mushroom Risotto — $18.50\n• Smash Burger — $12.50\n• Tiramisu Classico — $8.50\n• Grilled Atlantic Salmon — $22.00\n\nAll marked as Popular on our Menu page!";

  // Specific dishes
  if (msg.includes("risotto"))
    return "Truffle Mushroom Risotto 🍄 — $18.50\nCreamy arborio rice with wild mushrooms, shaved truffle and parmesan. Takes about 22 minutes to prepare. One of our most popular dishes!";

  if (msg.includes("burger"))
    return "Smash Burger 🍔 — $12.50\nDouble beef patty, aged cheddar, house sauce, brioche bun. Ready in just 12 minutes. A customer favourite!";

  if (msg.includes("salmon"))
    return "Grilled Atlantic Salmon 🐟 — $22.00\nPan-seared salmon fillet with lemon butter sauce and seasonal greens. Ready in 18 minutes.";

  if (msg.includes("pizza") || msg.includes("margherita"))
    return "Wood-Fired Margherita 🍕 — $14.00\nSan Marzano tomato, fior di latte mozzarella, fresh basil. Baked in our wood-fired oven in 15 minutes!";

  if (msg.includes("tiramisu"))
    return "Tiramisu Classico 🍮 — $8.50\nEspresso-soaked ladyfingers with mascarpone cream and dusted cocoa. A classic Italian dessert ready in 5 minutes!";

  if (msg.includes("calamari"))
    return "Crispy Calamari 🦑 — $10.00\nLightly fried squid with lemon aioli and fresh herbs. A perfect starter ready in 10 minutes!";

  if (msg.includes("burrata"))
    return "Burrata & Heirloom 🍅 — $13.00\nCreamy burrata with colourful heirloom tomatoes, basil oil and sourdough toast. Ready in just 8 minutes!";

  if (msg.includes("fries") || msg.includes("chips"))
    return "Loaded Fries 🍟 — $8.00\nHand-cut fries with melted cheddar, smoked bacon and pickled jalapeños. Ready in 10 minutes. Absolutely delicious!";

  if (msg.includes("wrap") || msg.includes("tikka"))
    return "Chicken Tikka Wrap 🌯 — $11.00\nSpiced chicken tikka, mint yoghurt, pickled onions in a soft naan. Ready in 9 minutes!";

  if (msg.includes("chocolate") || msg.includes("lava") || msg.includes("molten"))
    return "Molten Chocolate Cake 🍫 — $9.00\nWarm dark chocolate lava cake with vanilla bean ice cream. Ready in 12 minutes. Perfect for dessert lovers!";

  if (msg.includes("aperol") || msg.includes("spritz"))
    return "Aperol Spritz 🍊 — $9.50\nAperol, prosecco, soda water with a fresh orange slice. Ready in just 3 minutes!";

  if (msg.includes("coffee") || msg.includes("cold brew"))
    return "Cold Brew Coffee ☕ — $5.00\n24-hour cold-extracted single origin coffee served over ice. Ready in 2 minutes. Perfect pick-me-up!";

  // Menu categories
  if (msg.includes("starter") || msg.includes("appetizer"))
    return "Our Starters 🥗\n\n• Crispy Calamari — $10.00\n• Burrata & Heirloom — $13.00\n\nPerfect to share while you wait for your main course!";

  if (msg.includes("dessert") || msg.includes("sweet"))
    return "Our Desserts 🍰\n\n• Tiramisu Classico — $8.50\n• Molten Chocolate Cake — $9.00\n\nThe perfect ending to your meal!";

  if (msg.includes("drink") || msg.includes("beverage"))
    return "Our Drinks 🍹\n\n• Aperol Spritz — $9.50\n• Cold Brew Coffee — $5.00\n\nRefreshing and delicious!";

  if (msg.includes("fast food") || msg.includes("quick"))
    return "Our Fast Food 🍔\n\n• Smash Burger — $12.50\n• Loaded Fries — $8.00\n• Chicken Tikka Wrap — $11.00\n\nQuick, delicious and satisfying!";

  if (msg.includes("main") || msg.includes("mains"))
    return "Our Mains 🍽️\n\n• Truffle Mushroom Risotto — $18.50\n• Wood-Fired Margherita — $14.00\n• Grilled Atlantic Salmon — $22.00\n\nAll made fresh to order!";

  // Full menu
  if (msg.includes("menu") || msg.includes("food") || msg.includes("dish") || msg.includes("eat") || msg.includes("order"))
    return "Here is our full menu 🍽️\n\nStarters: Calamari $10 · Burrata $13\nMains: Risotto $18.50 · Margherita $14 · Salmon $22\nFast Food: Burger $12.50 · Fries $8 · Wrap $11\nDesserts: Tiramisu $8.50 · Chocolate Cake $9\nDrinks: Aperol Spritz $9.50 · Cold Brew $5\n\nVisit our Menu page to add items to your cart!";

  // Price
  if (msg.includes("price") || msg.includes("cost") || msg.includes("how much") || msg.includes("cheap") || msg.includes("expensive"))
    return "Our prices range from $5 to $22 💰\n\nMost affordable: Cold Brew Coffee — $5.00\nMost premium: Grilled Atlantic Salmon — $22.00\n\nGreat quality at every price point!";

  // Opening hours
  if (msg.includes("hour") || msg.includes("open") || msg.includes("close") || msg.includes("time") || msg.includes("timing"))
    return "We are open 7 days a week ⏰\n\n🕙 11:00 AM — 11:00 PM\n\nKitchen closes at 10:30 PM. We are here every day including weekends and holidays!";

  // Location
  if (msg.includes("location") || msg.includes("address") || msg.includes("where") || msg.includes("find") || msg.includes("direction"))
    return "📍 You can find us in the heart of the city!\n\nYou can also order online for delivery straight to your door. Just go to our Menu page, add items to cart, and checkout!";

  // Delivery
  if (msg.includes("deliver") || msg.includes("delivery") || msg.includes("ship"))
    return "Delivery info 🚚\n\n⏱ Average time: 30 minutes\n💰 Delivery fee: $3.50\n📍 We deliver to nearby areas\n\nYou can track your order live on the Track Order page after placing it!";

  // Takeaway
  if (msg.includes("takeaway") || msg.includes("take away") || msg.includes("pickup") || msg.includes("pick up") || msg.includes("collect"))
    return "Yes we offer Takeaway! 🛍️\n\nJust select Takeaway when placing your order. Your food will be ready in the estimated prep time and you can collect it from our restaurant!";

  // Reservation / booking
  if (msg.includes("reserv") || msg.includes("book") || msg.includes("table") || msg.includes("seat") || msg.includes("dine in") || msg.includes("dine-in"))
    return "Book a table at Savora 📅\n\nGo to our Reservation page and fill in:\n• Your name and phone\n• Date and time\n• Number of guests\n• Any special requests\n\nWe will confirm your booking shortly!";

  // Payment
  if (msg.includes("pay") || msg.includes("payment") || msg.includes("method") || msg.includes("jazzcash") || msg.includes("jazz cash") || msg.includes("card") || msg.includes("cash"))
    return "We accept 3 payment methods 💳\n\n💵 Cash on Delivery — pay when your order arrives\n💳 Bank Card — Visa, Mastercard (secure)\n📱 JazzCash — mobile wallet payment\n\nAll payments are safe and secure!";

  // Track order
  if (msg.includes("track") || msg.includes("status") || msg.includes("where is my") || msg.includes("order status"))
    return "Track your order 📦\n\nGo to the Track Order page while logged in. You will see all your orders and their current status:\n\nPending → Preparing → Ready → Out for Delivery → Delivered\n\nUpdated in real time!";

  // Cancel order
  if (msg.includes("cancel") || msg.includes("refund"))
    return "For order cancellations or refunds please contact our staff directly 📞\n\nWe will do our best to help you. Note that orders already being prepared cannot be cancelled.";

  // Allergy / dietary
  if (msg.includes("allerg") || msg.includes("vegan") || msg.includes("vegetarian") || msg.includes("gluten") || msg.includes("halal"))
    return "We take dietary requirements very seriously 🌿\n\nPlease mention any allergies or dietary needs in the Special Requests field when placing your order or making a reservation. Our kitchen staff will accommodate you!";

  // Wifi
  if (msg.includes("wifi") || msg.includes("wi-fi") || msg.includes("internet"))
    return "Yes we have free WiFi for dine-in customers! 📶\n\nAsk our staff for the password when you arrive. We hope you enjoy your meal and stay connected!";

  // Staff / contact
  if (msg.includes("staff") || msg.includes("manager") || msg.includes("contact") || msg.includes("call") || msg.includes("phone") || msg.includes("help"))
    return "Need to speak with our team? 👨‍🍳\n\nOur staff are available during opening hours (11am–11pm). For urgent matters please visit us directly or leave a message and we will get back to you as soon as possible!";

  // Compliment
  if (msg.includes("great") || msg.includes("amazing") || msg.includes("love") || msg.includes("delicious") || msg.includes("awesome") || msg.includes("excellent"))
    return "Thank you so much! 🥰 We put our heart into every dish. Your kind words mean everything to our team. We hope to see you again soon at Savora!";

  // Complaint
  if (msg.includes("bad") || msg.includes("terrible") || msg.includes("awful") || msg.includes("disappoint") || msg.includes("complaint") || msg.includes("wrong"))
    return "We are truly sorry to hear that 😔 Your experience matters to us deeply. Please speak with our manager directly so we can make it right. We appreciate your feedback and will work hard to improve!";

  // Goodbye
  if (msg.match(/(bye|goodbye|see you|take care|khuda hafiz)/))
    return "Goodbye! 👋 Thank you for visiting Savora. We hope to serve you again soon. Have a wonderful day! 🍽️";

  // Default — unknown question
  return "I am not sure about that, but I would love to help! 😊\n\nYou can ask me about:\n• Our menu and prices\n• Delivery and timing\n• Reservations\n• Payment methods\n• Order tracking\n\nOr visit any page from the navigation menu!";
};

// ── Chatbot component ──────────────────────────────────────────────────────
export function Chatbot() {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role:    "assistant",
      content: "👋 Hi! I am Savora Assistant.\n\nI can help you with our menu, delivery, reservations, and more. What can I help you with today?",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text || loading) return;

    // Add user message immediately
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    // Simulate thinking delay — feels more natural
    setTimeout(() => {
      const reply = getResponse(text);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setLoading(false);
    }, 600);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const suggestions = [
    "Show me the menu 🍽️",
    "How long is delivery? 🚚",
    "Book a table 📅",
    "Payment methods 💳",
  ];

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex w-[340px] flex-col rounded-3xl border border-border/60 bg-card shadow-warm overflow-hidden md:right-8">

          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-warm px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-display font-semibold text-primary-foreground">Savora Assistant</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <p className="text-xs text-primary-foreground/70">Online — always ready</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-3 overflow-y-auto p-4 max-h-[380px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}>
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                    : "rounded-tl-sm bg-secondary text-secondary-foreground"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-secondary px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions — only shown at start */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => setInput(s)}
                  className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs transition-colors hover:border-primary hover:bg-primary/5">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="flex gap-2 border-t border-border/60 p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything…"
              className="rounded-full"
              disabled={loading}
              autoFocus
            />
            <Button size="icon" onClick={send} disabled={!input.trim() || loading}
              className="rounded-full flex-shrink-0 shadow-warm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-warm shadow-warm transition-all duration-200 hover:scale-110 active:scale-95 md:right-8"
        aria-label="Open Savora Assistant"
      >
        {open
          ? <X             className="h-6 w-6 text-primary-foreground" />
          : <MessageCircle className="h-6 w-6 text-primary-foreground" />}
      </button>
    </>
  );
}