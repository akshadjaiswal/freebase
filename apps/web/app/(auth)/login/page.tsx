"use client";

import { Suspense, useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutDashboard } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const orgSlug = searchParams.get("org");
  const next = searchParams.get("next") ?? (orgSlug ? `/${orgSlug}/admin` : "/");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.orgSlug) {
          router.replace(`/${data.orgSlug}/admin`);
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // If no explicit next destination, look up the user's org and go to admin
      if (next === "/") {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          router.push(`/${data.orgSlug}/admin`);
          router.refresh();
          return;
        }
      }

      router.push(next);
      router.refresh();
    });
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)]">
            <LayoutDashboard className="h-5 w-5 text-[var(--accent-foreground)]" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              Sign in to Freebase
            </h1>
            {orgSlug && (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Accessing <span className="text-[var(--text-primary)]">{orgSlug}</span>
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs text-[var(--error)]">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          New to Freebase?{" "}
          <Link
            href="/new"
            className="text-[var(--accent)] hover:text-[var(--accent-hover)] underline underline-offset-3"
          >
            Create an org
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
