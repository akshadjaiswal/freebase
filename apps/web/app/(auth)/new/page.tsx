"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

export default function NewOrgPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleOrgNameChange(value: string) {
    setOrgName(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlug(slugify(value));
    setSlugManual(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!orgName.trim()) newErrors.orgName = "Org name is required.";
    if (!slug.trim() || slug.length < 3) newErrors.slug = "Slug must be at least 3 characters.";
    if (!email.trim()) newErrors.email = "Email is required.";
    if (password.length < 8) newErrors.password = "Password must be at least 8 characters.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    startTransition(async () => {
      const res = await fetch("/api/auth/create-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName: orgName.trim(), slug, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ form: data.detail ?? "Something went wrong. Please try again." });
        }
        return;
      }

      router.push(`/${slug}/admin`);
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)]">
            <LayoutDashboard className="h-5 w-5 text-[var(--accent-foreground)]" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              Create your org
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Set up Freebase for your product
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Org name */}
          <div className="space-y-1.5">
            <Label htmlFor="orgName">Organization name</Label>
            <Input
              id="orgName"
              placeholder="Acme Inc."
              value={orgName}
              onChange={(e) => handleOrgNameChange(e.target.value)}
              error={errors.orgName}
              autoFocus
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slug">
              URL slug
              <span className="ml-1 text-[var(--text-muted)]">
                — used in your org&apos;s public URL
              </span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] pointer-events-none select-none">
                freebase.app/
              </span>
              <Input
                id="slug"
                placeholder="acme"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                error={errors.slug}
                className="pl-[88px]"
              />
            </div>
          </div>

          <div className="h-px bg-[var(--border)]" />

          {/* Admin account */}
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Admin account
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
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
              error={errors.password}
              autoComplete="new-password"
            />
          </div>

          {errors.form && (
            <p className="text-xs text-[var(--error)]">{errors.form}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating org…" : "Create org"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[var(--accent)] hover:text-[var(--accent-hover)] underline underline-offset-3"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
