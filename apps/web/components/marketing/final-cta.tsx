import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="border-t border-[var(--border)] px-8 py-24">
      <div className="mx-auto max-w-xl text-center">
        <h2
          className="mb-4 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
          style={{ fontFamily: "var(--font-cal)" }}
        >
          Start collecting feedback today
        </h2>
        <p className="mb-8 text-[var(--text-secondary)]">
          Set up your board in minutes. No credit card required. Free forever.
        </p>
        <Link href="/new">
          <Button size="lg" className="gap-2">
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
