import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <input
          type={type}
          className={cn(
            "flex h-8 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[var(--error)] focus-visible:ring-[var(--error)]",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-[var(--error)]">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
