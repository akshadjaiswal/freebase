"use client";

import { motion } from "motion/react";

interface LogoLoaderProps {
  size?: number;
  fullPage?: boolean;
  label?: string;
}

export function LogoLoader({ size = 48, fullPage = true, label }: LogoLoaderProps) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <motion.rect
          x="9" y="9" width="17" height="17" rx="4" fill="#059669"
          animate={{ scale: [1, 1.12, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
          style={{ transformOrigin: "17.5px 17.5px" }}
        />
        <motion.rect
          x="6" y="6" width="17" height="17" rx="4" fill="#10b981"
          animate={{ scale: [1, 1.12, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "14.5px 14.5px" }}
        />
      </motion.svg>
      {label && (
        <span className="text-xs text-[var(--text-muted)]">{label}</span>
      )}
    </div>
  );

  if (!fullPage) return inner;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]">
      {inner}
    </div>
  );
}
