import { cn } from "@/lib/cn";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius)] bg-[var(--surface-raised)]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
