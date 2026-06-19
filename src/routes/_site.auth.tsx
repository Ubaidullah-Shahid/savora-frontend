import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Label }   from "@/components/ui/label";
import { UtensilsCrossed, ChevronRight, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import api, { session } from "@/lib/api";

export const Route = createFileRoute("/_site/auth")({
  head: () => ({ meta: [{ title: "Sign in — Savora" }] }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();

  const [mode,     setMode]     = useState<Mode>("signin");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<string[]>([]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors([]);
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!email.trim())                     { setErrors(["Email is required"]); return; }
    if (!password.trim())                  { setErrors(["Password is required"]); return; }
    if (mode === "signup" && !name.trim()) { setErrors(["Full name is required"]); return; }
    if (password.length < 6)              { setErrors(["Password must be at least 6 characters"]); return; }

    setLoading(true);
    try {
      let data: { token: string; user: { role: string; name: string } };

      if (mode === "signup") {
        const res = await api.post("/api/auth/register", { name: name.trim(), email: email.trim(), password });
        data = res.data;
        toast.success(`Welcome, ${data.user.name}! Account created.`);
      } else {
        const res = await api.post("/api/auth/login", { email: email.trim(), password });
        data = res.data;
        toast.success(`Welcome back, ${data.user.name}!`);
      }

      session.save(data.token, data.user);

      if (data.user.role === "admin")      navigate({ to: "/admin" });
      else if (data.user.role === "staff") navigate({ to: "/staff" });
      else                                  navigate({ to: "/" });

    } catch (err: any) {
      const serverErrors = err.response?.data?.errors as string[] | undefined;
      const serverMsg    = err.response?.data?.message as string | undefined;
      if (serverErrors?.length) setErrors(serverErrors);
      else if (serverMsg)       setErrors([serverMsg]);
      else if (!err.response)   setErrors(["Cannot reach server. Make sure backend is running on port 5000."]);
      else                      setErrors(["Something went wrong. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[92vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-warm shadow-warm">
            <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-semibold">Savora</span>
        </Link>

        <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-soft md:p-10">

          {/* Tab switcher */}
          <div className="mb-7 flex rounded-2xl border border-border/60 bg-secondary/50 p-1 gap-1">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? "bg-card text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h1 className="font-display text-[1.6rem] font-semibold leading-tight">
            {mode === "signin" ? "Welcome back 👋" : "Join Savora 🍽️"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Enter your credentials to access your account."
              : "Create an account to start ordering."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>

            {/* Name — signup only */}
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-name">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="auth-email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="auth-password">Password</Label>
                {mode === "signup" && (
                  <span className="text-xs text-muted-foreground">Min. 6 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="auth-password"
                  type={showPass ? "text" : "password"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error box */}
            {errors.length > 0 && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 space-y-1">
                {errors.map((e, i) => (
                  <p key={i} className="text-sm text-destructive leading-snug">⚠ {e}</p>
                ))}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full shadow-warm mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {mode === "signin" ? "Signing in…" : "Creating account…"}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {mode === "signin" ? "Sign in" : "Create account"}
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground">or continue with</span>
            </div>
          </div>

          {/* Google button — simple <a> tag, full page navigation */}
          <a
            href="http://localhost:5000/api/auth/google"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-border/60 bg-background px-4 py-2.5 text-sm font-medium transition-all hover:border-primary hover:bg-primary/5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continue with Google
          </a>

          {/* Info note */}
          <p className="mt-5 rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-center text-xs text-muted-foreground leading-relaxed">
            {mode === "signup"
              ? "New accounts are always created as Customer. Admin & staff accounts are set up by the manager."
              : "Sign in with your email and password. The system will take you to the right page based on your role."}
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}