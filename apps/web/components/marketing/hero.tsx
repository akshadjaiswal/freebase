"use client";

import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export function Hero() {
  return (
    <section className="relative overflow-hidden px-8 py-28 text-center">
      {/* Dot grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--border) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* Accent radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, var(--accent) 12%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-2xl">
        <motion.div {...fadeUp(0)}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-subtle)] px-3 py-1">
            <span className="text-xs text-[var(--accent)]">Open source · MIT License · Free forever</span>
          </div>
        </motion.div>

        <motion.h1
          {...fadeUp(0.08)}
          className="mb-5 text-5xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-6xl"
          style={{ fontFamily: "var(--font-cal)" }}
        >
          The product feedback platform{" "}
          <span className="text-[var(--accent)]">teams actually use</span>
        </motion.h1>

        <motion.p {...fadeUp(0.16)} className="mb-8 text-lg text-[var(--text-secondary)]">
          Collect feedback, ship changelogs, and publish your roadmap. All in one place.{" "}
          <span className="text-[var(--text-primary)]">Free forever.</span>
        </motion.p>

        <motion.div {...fadeUp(0.22)} className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/new">
            <Button size="lg" className="gap-2">
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a
            href="https://github.com/akshadjaiswal/freebase"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="gap-2">
              <Github className="h-4 w-4" />
              View on GitHub
            </Button>
          </a>
        </motion.div>

        <motion.p {...fadeUp(0.28)} className="mt-5 text-xs text-[var(--text-muted)]">
          No credit card required · Set up in minutes
        </motion.p>
      </div>
    </section>
  );
}
