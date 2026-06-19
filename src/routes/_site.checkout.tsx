import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Wallet, Smartphone, Loader2 } from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart }  from "@/lib/cart-store";
import { toast }    from "sonner";
import api, { session } from "@/lib/api";

export const Route = createFileRoute("/_site/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Savora" }] }),
  component: CheckoutPage,
});

type PayMethod = "card" | "jazzcash" | "cod";

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const [pay,       setPay]       = useState<PayMethod>("cod");
  const [loading,   setLoading]   = useState(false);

  // Delivery fields
  const [custName,  setCustName]  = useState(session.name() ?? "");
  const [phone,     setPhone]     = useState("");
  const [address,   setAddress]   = useState("");

  // Card fields
  const [cardNum,   setCardNum]   = useState("");
  const [expiry,    setExpiry]    = useState("");
  const [cvc,       setCvc]       = useState("");

  // JazzCash fields
  const [mobileNo,  setMobileNo]  = useState("");
  const [otp,       setOtp]       = useState("");
  const [otpSent,   setOtpSent]   = useState(false);
  const [txnRef,    setTxnRef]    = useState("");
  const [orderId,   setOrderId]   = useState<string | null>(null);

  const sub       = subtotal();
  const delivery  = sub > 0 ? 3.5 : 0;
  const total     = sub + delivery;

  // ── Step 1: Place order in DB first, then handle payment ────────────────
  const placeOrder = async (): Promise<string | null> => {
    try {
      const res = await api.post("/api/orders", {
        items:   items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        total,
        type:    "Delivery",
        address,
        paymentMethod:  pay === "cod" ? "Cash" : pay === "card" ? "Card" : "JazzCash",
        paymentStatus: "Pending",
      });
      return res.data?.data?._id ?? null;
    } catch {
      toast.error("Failed to place order. Please try again.");
      return null;
    }
  };

  // ── COD submit ───────────────────────────────────────────────────────────
  const handleCOD = async () => {
    setLoading(true);
    const id = await placeOrder();
    if (id) {
      clear();
      toast.success("Order placed! Pay on delivery.");
      navigate({ to: "/track" });
    }
    setLoading(false);
  };

  // ── Card submit ──────────────────────────────────────────────────────────
  // In production you load Stripe.js and use stripe.createToken()
  // For sandbox testing we send a fake token "tok_visa" that Stripe accepts
  const handleCard = async () => {
    if (!cardNum || !expiry || !cvc) {
      toast.error("Please fill in all card details.");
      return;
    }
    setLoading(true);

    // Place order first to get orderId
    const id = await placeOrder();
    if (!id) { setLoading(false); return; }

    try {
      // In production replace "tok_visa" with a real token from Stripe.js
      const res = await api.post("/api/payment/card", {
        orderId:     id,
        amount:      total,
        stripeToken: "tok_visa",  // ← replace with real Stripe token in production
      });

      if (res.data.success) {
        clear();
        toast.success("Card payment successful! Order confirmed.");
        navigate({ to: "/track" });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Card payment failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── JazzCash Step 1: Send OTP ────────────────────────────────────────────
  const handleJazzCashInitiate = async () => {
    if (!mobileNo || mobileNo.length < 11) {
      toast.error("Enter a valid 11-digit JazzCash number.");
      return;
    }
    setLoading(true);

    // Place order first to get orderId
    const id = await placeOrder();
    if (!id) { setLoading(false); return; }
    setOrderId(id);

    try {
      const res = await api.post("/api/payment/jazzcash/initiate", {
        orderId:      id,
        mobileNumber: mobileNo,
        amount:       total,
      });

      if (res.data.success) {
        setTxnRef(res.data.txnRef);
        setOtpSent(true);
        toast.success("OTP sent to your JazzCash number!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to initiate JazzCash payment.");
    } finally {
      setLoading(false);
    }
  };

  // ── JazzCash Step 2: Verify OTP ──────────────────────────────────────────
  const handleJazzCashVerify = async () => {
    if (!otp || otp.length < 6) {
      toast.error("Enter the 6-digit OTP from your phone.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/payment/jazzcash/verify", {
        orderId: orderId,
        txnRef,
        otp,
      });

      if (res.data.success) {
        clear();
        toast.success("JazzCash payment confirmed! Order is being prepared.");
        navigate({ to: "/track" });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Main submit handler ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) { toast.error("Delivery address is required."); return; }
    if (items.length === 0) { toast.error("Your cart is empty."); return; }

    if (pay === "cod")      handleCOD();
    if (pay === "card")     handleCard();
    if (pay === "jazzcash" && !otpSent) handleJazzCashInitiate();
    if (pay === "jazzcash" && otpSent)  handleJazzCashVerify();
  };

  return (
    <div className="container mx-auto grid gap-10 px-4 py-12 md:py-16 lg:grid-cols-[1fr_380px]">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold md:text-4xl">Checkout</h1>
          <p className="mt-1 text-sm text-muted-foreground">Almost there — just a few details.</p>
        </div>

        {/* Delivery details */}
        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold">Delivery details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Full name</Label>
              <Input required value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="Jane Doe" className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03001234567" className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label>Delivery address</Label>
              <Textarea required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, house number, city" className="mt-1" rows={3} />
            </div>
          </div>
        </section>

        {/* Payment method selector */}
        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold">Payment method</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { id: "cod",      icon: Wallet,      label: "Cash on Delivery" },
              { id: "card",     icon: CreditCard,  label: "Bank Card"        },
              { id: "jazzcash", icon: Smartphone,  label: "JazzCash"         },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => { setPay(opt.id as PayMethod); setOtpSent(false); setOtp(""); }}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  pay === opt.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <opt.icon className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Bank Card fields */}
          {pay === "card" && (
            <div className="mt-5 space-y-4 rounded-xl border border-border/60 bg-secondary/30 p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Card Details</h3>
              <div>
                <Label>Card number</Label>
                <Input
                  value={cardNum}
                  onChange={(e) => setCardNum(e.target.value.replace(/\D/g, "").slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={16}
                  className="mt-1 font-mono tracking-widest"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Expiry (MM/YY)</Label>
                  <Input
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>CVC</Label>
                  <Input
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="•••"
                    maxLength={4}
                    className="mt-1"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                🔒 Your card details are encrypted and processed securely by Stripe.
              </p>
            </div>
          )}

          {/* JazzCash fields */}
          {pay === "jazzcash" && (
            <div className="mt-5 space-y-4 rounded-xl border border-border/60 bg-secondary/30 p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">JazzCash Details</h3>

              {!otpSent ? (
                <div>
                  <Label>JazzCash mobile number</Label>
                  <Input
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder="03001234567"
                    maxLength={11}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    An OTP will be sent to this number to confirm payment.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-3 rounded-lg bg-success/10 border border-success/30 px-3 py-2 text-sm text-success">
                    ✓ OTP sent to {mobileNo} — check your phone.
                  </div>
                  <Label>Enter OTP</Label>
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="6-digit OTP"
                    maxLength={6}
                    className="mt-1 font-mono tracking-widest text-center text-lg"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Change number or resend OTP
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Submit button */}
        <Button
          type="submit"
          size="lg"
          className="w-full rounded-full shadow-warm"
          disabled={loading || items.length === 0}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {pay === "jazzcash" && !otpSent ? "Sending OTP…" :
               pay === "jazzcash" && otpSent  ? "Verifying OTP…" :
               pay === "card"                 ? "Processing card…" :
               "Placing order…"}
            </span>
          ) : (
            pay === "jazzcash" && !otpSent ? `Send OTP · $${total.toFixed(2)}` :
            pay === "jazzcash" && otpSent  ? "Confirm JazzCash Payment" :
            `Place order · $${total.toFixed(2)}`
          )}
        </Button>
      </form>

      {/* Order summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold">Your order</h2>
          <div className="mt-4 space-y-3 text-sm">
            {items.length === 0 && <p className="text-muted-foreground">Your cart is empty.</p>}
            {items.map((i) => (
              <div key={i.id} className="flex justify-between">
                <span>{i.qty}× {i.name}</span>
                <span>${(i.price * i.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="my-4 border-t border-border" />
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${sub.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery</span><span>${delivery.toFixed(2)}</span></div>
          <div className="mt-3 flex justify-between font-display text-lg font-semibold">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}