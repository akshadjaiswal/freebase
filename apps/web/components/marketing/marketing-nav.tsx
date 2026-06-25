"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export function MarketingNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex items-center justify-between border-b border-[var(--border)] px-8 py-4"
    >
      <Link href="/" className="flex items-center gap-2">
        <Logo size={20} />
        <span
          className="text-base font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-cal)" }}
        >
          Freebase
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/login">
          <Button variant="ghost" size="sm">Sign in</Button>
        </Link>
        <Link href="/new">
          <Button size="sm">Start free</Button>
        </Link>
      </div>
    </motion.nav>
  );
}
