"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { logger } from "@/lib/logger";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    logger.error("Admin layout error boundary triggered", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">Something went wrong</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          {error.message ?? "An unexpected error occurred."}
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-[4px] bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
