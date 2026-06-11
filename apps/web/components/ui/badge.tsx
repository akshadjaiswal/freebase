import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--surface-raised)] text-[var(--text-secondary)] border border-[var(--border)]",
        accent:
          "bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/20",
        open:
          "bg-[var(--status-open-bg)] text-[var(--status-open)]",
        planned:
          "bg-[var(--status-planned-bg)] text-[var(--status-planned)]",
        "in-progress":
          "bg-[var(--status-in-progress-bg)] text-[var(--status-in-progress)]",
        done:
          "bg-[var(--status-done-bg)] text-[var(--status-done)]",
        closed:
          "bg-[var(--status-closed-bg)] text-[var(--status-closed)]",
        feature:
          "bg-[var(--accent-subtle)] text-[var(--accent)]",
        improvement:
          "bg-blue-500/10 text-blue-400",
        "bug-fix":
          "bg-red-500/10 text-red-400",
        announcement:
          "bg-purple-500/10 text-purple-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
