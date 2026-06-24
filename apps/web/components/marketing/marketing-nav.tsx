import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingNav() {
  return (
    <nav className="flex items-center justify-between border-b border-[var(--border)] px-8 py-4">
      <span
        className="text-base font-semibold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-cal)" }}
      >
        Freebase
      </span>
      <div className="flex items-center gap-3">
        <Link href="/login">
          <Button variant="ghost" size="sm">Sign in</Button>
        </Link>
        <Link href="/new">
          <Button size="sm">Start free</Button>
        </Link>
      </div>
    </nav>
  );
}
