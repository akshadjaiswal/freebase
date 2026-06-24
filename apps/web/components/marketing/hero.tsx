"use client";

import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="px-8 py-28 text-center">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-subtle)] px-3 py-1">
            <span className="text-xs text-[var(--accent)]">Open source · MIT License · Free forever</span>
          </div>

          <h1
            className="mb-5 text-5xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-6xl"
            style={{ fontFamily: "var(--font-cal)" }}
          >
            The product feedback platform{" "}
            <span className="text-[var(--accent)]">teams actually use</span>
          </h1>

          <p className="mb-8 text-lg text-[var(--text-secondary)]">
            Collect feedback, ship changelogs, and publish your roadmap — all in one place.{" "}
            <span className="text-[var(--text-primary)]">Free forever.</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
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
          </div>

          <p className="mt-5 text-xs text-[var(--text-muted)]">
            No credit card required · Set up in minutes
          </p>
        </motion.div>
      </div>
    </section>
  );
}
