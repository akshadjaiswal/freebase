"use client";

import { motion } from "motion/react";
import { UserPlus, Code2, RefreshCw } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create your board",
    description: "Sign up in seconds. Get your own org URL with a feedback board, changelog, and roadmap — ready to share with users.",
  },
  {
    number: "02",
    icon: Code2,
    title: "Add the widget",
    description: "One script tag. The embeddable widget drops into any app or website. Users can submit feedback without leaving your product.",
  },
  {
    number: "03",
    icon: RefreshCw,
    title: "Close the loop",
    description: "Triage feedback, update your roadmap, and publish changelogs. Users who asked for a feature get notified when it ships.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-[var(--border)] px-8 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2
            className="mb-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
            style={{ fontFamily: "var(--font-cal)" }}
          >
            Up and running in minutes
          </h2>
          <p className="text-[var(--text-secondary)]">Three steps from zero to a feedback-driven product workflow.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: i * 0.08, ease: "easeOut" }}
              className="relative rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="text-4xl font-semibold text-[var(--border)]"
                  style={{ fontFamily: "var(--font-cal)" }}
                >
                  {step.number}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] bg-[var(--accent-subtle)]">
                  <step.icon className="h-4 w-4 text-[var(--accent)]" />
                </div>
              </div>
              <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{step.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
