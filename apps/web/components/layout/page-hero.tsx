"use client";

import { motion } from "motion/react";
import { darkenHex } from "@/lib/color";

interface PageHeroProps {
  orgName: string;
  accentColor?: string;
  subtitle: string;
  wide?: boolean;
  actions?: React.ReactNode;
}

export function PageHero({ orgName, accentColor, subtitle, wide, actions }: PageHeroProps) {
  const accentVars = accentColor
    ? ({
        "--accent": accentColor,
        "--accent-hover": darkenHex(accentColor),
        "--accent-subtle": `${accentColor}1f`,
      } as React.CSSProperties)
    : undefined;

  return (
    <div
      className="border-b border-[var(--border)] bg-[var(--background)] px-4 py-10"
      style={accentVars}
    >
      <div className={wide ? "mx-auto max-w-5xl" : "mx-auto max-w-3xl"}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1
                className="text-2xl font-semibold text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-cal)" }}
              >
                {orgName}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
              <div
                className="mt-4 h-0.5 w-10 rounded-full"
                style={{ background: accentColor ?? "var(--accent)" }}
              />
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
