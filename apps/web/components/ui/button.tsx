"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]",
        destructive:
          "bg-[var(--error)] text-white hover:bg-red-600",
        outline:
          "border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-raised)]",
        secondary:
          "bg-[var(--surface-raised)] text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]",
        ghost:
          "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]",
        link:
          "bg-transparent text-[var(--accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3 py-1.5 text-sm rounded-[var(--radius)]",
        sm: "h-7 px-2.5 text-xs rounded-[var(--radius-sm)]",
        lg: "h-10 px-4 text-sm rounded-[var(--radius)]",
        icon: "h-8 w-8 rounded-[var(--radius)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
