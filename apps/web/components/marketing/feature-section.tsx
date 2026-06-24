"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";

interface FeatureSectionProps {
  label: string;
  headline: string;
  bullets: string[];
  mockup: React.ReactNode;
  reverse?: boolean;
}

export function FeatureSection({ label, headline, bullets, mockup, reverse }: FeatureSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16 ${reverse ? "lg:flex-row-reverse" : ""}`}
    >
      {/* Copy */}
      <div className="flex-1 space-y-5">
        <span className="inline-block rounded-[var(--radius-sm)] bg-[var(--accent-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
          {label}
        </span>
        <h2
          className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
          style={{ fontFamily: "var(--font-cal)" }}
        >
          {headline}
        </h2>
        <ul className="space-y-2.5">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Mockup */}
      <div className="flex-1">{mockup}</div>
    </motion.div>
  );
}
