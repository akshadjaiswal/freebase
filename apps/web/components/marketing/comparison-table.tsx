"use client";

import { motion } from "motion/react";
import { Check, X } from "lucide-react";

const rows = [
  { feature: "Feedback Board", freebase: true, featurebase: true, canny: true },
  { feature: "Public Changelog", freebase: true, featurebase: true, canny: true },
  { feature: "Roadmap", freebase: true, featurebase: true, canny: "Paid" },
  { feature: "Embeddable Widget", freebase: true, featurebase: true, canny: "Paid" },
  { feature: "Email Subscriptions", freebase: true, featurebase: "Paid", canny: "Paid" },
  { feature: "Webhooks + API", freebase: true, featurebase: "Paid", canny: "Paid" },
];

type CellValue = boolean | string;

function Cell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  if (value === true)
    return (
      <td className={`px-4 py-3 text-center ${highlight ? "bg-[var(--accent-subtle)]" : ""}`}>
        <Check className="mx-auto h-4 w-4 text-[var(--accent)]" />
      </td>
    );
  if (value === false)
    return (
      <td className={`px-4 py-3 text-center ${highlight ? "bg-[var(--accent-subtle)]" : ""}`}>
        <X className="mx-auto h-4 w-4 text-[var(--text-muted)]" />
      </td>
    );
  return (
    <td className={`px-4 py-3 text-center text-xs text-[var(--text-muted)] ${highlight ? "bg-[var(--accent-subtle)]" : ""}`}>
      {value}
    </td>
  );
}

const rowVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const trVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function ComparisonTable() {
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
            Everything Featurebase charges for.{" "}
            <span className="text-[var(--accent)]">Free.</span>
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Full feature parity with the leading paid tools. No paywalls, no seat limits.
          </p>
        </motion.div>

        <motion.div
          className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">Feature</th>
                <th className="bg-[var(--accent-subtle)] px-4 py-3 text-center text-xs font-semibold text-[var(--accent)]">
                  Freebase
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--text-muted)]">Featurebase</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--text-muted)]">Canny</th>
              </tr>
            </thead>
            <motion.tbody
              variants={rowVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
            >
              {rows.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  variants={trVariants}
                  className={`border-b border-[var(--border)] last:border-0 ${i % 2 === 1 ? "bg-[var(--surface-raised)]/30" : ""}`}
                >
                  <td className="px-4 py-3 text-xs font-medium text-[var(--text-primary)]">{row.feature}</td>
                  <Cell value={row.freebase} highlight />
                  <Cell value={row.featurebase} />
                  <Cell value={row.canny} />
                </motion.tr>
              ))}
              {/* Price row */}
              <motion.tr
                variants={trVariants}
                className="border-t border-[var(--border)] bg-[var(--surface)]"
              >
                <td className="px-4 py-3 text-xs font-semibold text-[var(--text-primary)]">Price</td>
                <td className="bg-[var(--accent-subtle)] px-4 py-3 text-center text-xs font-bold text-[var(--accent)]">
                  Free
                </td>
                <td className="px-4 py-3 text-center text-xs text-[var(--text-muted)]">$49+/mo</td>
                <td className="px-4 py-3 text-center text-xs text-[var(--text-muted)]">$79+/mo</td>
              </motion.tr>
            </motion.tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
