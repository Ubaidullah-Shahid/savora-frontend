import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { session } from "@/lib/api";

export const Route = createFileRoute("/_site/auth-callback")({
  component: AuthCallback,
});

function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const role   = params.get("role");
    const name   = params.get("name");
     console.log("✅ Callback useEffect ran");
  console.log("token:", token);
  console.log("role:", role);
  console.log("name:", name);

    if (token && role && name) {
      session.save(token, { role, name: decodeURIComponent(name) });

      setTimeout(() => {
        toast.success(`Welcome, ${decodeURIComponent(name)}!`);
        if (role === "admin")      window.location.href = "/admin";
        else if (role === "staff") window.location.href = "/staff";
        else                       window.location.href = "/";
      }, 100);

    } else {
      toast.error("Google login failed. Please try again.");
      window.location.href = "/auth";
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-muted-foreground">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm font-medium">Signing you in with Google…</p>
      <p className="text-xs">Please wait a moment</p>
    </div>
  );
}