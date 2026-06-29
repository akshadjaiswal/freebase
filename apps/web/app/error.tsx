"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0e0e10] p-8 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#10b981]">
            Error
          </p>
          <h1 className="mb-3 text-2xl font-semibold text-[#e2e2e5]">
            Something went wrong
          </h1>
          <p className="mb-8 text-sm text-[#a1a1aa]">
            An unexpected error occurred. Try refreshing or go back home.
          </p>
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="rounded px-4 py-2 text-sm font-medium bg-[#10b981] text-white hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded px-4 py-2 text-sm font-medium border border-[#2a2a2d] text-[#a1a1aa] hover:text-[#e2e2e5] transition-colors"
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
