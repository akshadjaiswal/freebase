"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="border-t border-[var(--border)] px-8 py-24">
      <motion.div
        className="mx-auto max-w-xl text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
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
      </motion.div>
    </section>
  );
}
