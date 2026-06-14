"use client";

import { useEffect, useRef } from "react";

type FreebaseFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    Freebase?: FreebaseFn;
  }
}

interface Props {
  orgSlug: string;
}

export function WidgetDemo({ orgSlug }: Props) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !orgSlug) return;
    initialized.current = true;

    // Set up command queue stub so init call is queued before SDK loads
    if (!window.Freebase) {
      const fb: FreebaseFn = (...args: unknown[]) => {
        fb.q = fb.q ?? [];
        fb.q.push(args);
      };
      window.Freebase = fb;
    }

    window.Freebase("init", { org: orgSlug, theme: "dark", position: "bottom-right" });

    const script = document.createElement("script");
    script.src = "/cdn/v1/sdk.js";
    script.async = true;
    document.head.appendChild(script);
  }, [orgSlug]);

  return null;
}
