"use client";

import { motion } from "motion/react";
import { MessageSquare, BookOpen, Map } from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://freebase.app";

const surfaces = [
  {
    icon: MessageSquare,
    title: "Feedback Form",
    description: "Floating button + floating window. Users submit ideas without leaving your app.",
  },
  {
    icon: BookOpen,
    title: "Changelog Popup",
    description: "\"What's new\" button with unread badge. Announces shipped features inline.",
  },
  {
    icon: Map,
    title: "Roadmap Panel",
    description: "Read-only kanban window. Users see what's planned and in progress.",
  },
];

export function WidgetSnippet() {
  return (
    <section className="border-t border-[var(--border)] px-8 py-20">
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h2
            className="mb-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
            style={{ fontFamily: "var(--font-cal)" }}
          >
            Add it to your app in 2 lines
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Drop a script tag, call init. Works with React, Vue, plain HTML, any framework.
          </p>
        </motion.div>

        <motion.div
          className="mb-8 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-5"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
        >
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--error)]/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--warning)]/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]/60" />
          </div>
          <pre className="overflow-x-auto font-mono text-xs text-[var(--text-secondary)]">
            <code>{`<script src="${APP_URL}/cdn/v1/sdk.js" async></script>
<script>
  window.Freebase?.('init', { org: 'your-org' })
</script>`}</code>
          </pre>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-3">
          {surfaces.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: 0.14 + i * 0.06, ease: "easeOut" }}
            >
              <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-[var(--radius)] bg-[var(--accent-subtle)]">
                <Icon className="h-3.5 w-3.5 text-[var(--accent)]" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
              <p className="text-xs text-[var(--text-secondary)]">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
