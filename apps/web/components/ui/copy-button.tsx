"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      aria-label="Copy to clipboard"
      className={className ?? "ml-1.5 rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[var(--accent)]" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
