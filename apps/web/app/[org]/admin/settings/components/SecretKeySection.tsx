"use client";

import { Eye, EyeOff, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { SectionHeader } from "@/components/ui/section-header";
import { FieldInfo } from "@/components/ui/field-info";
import type { ConfirmAction } from "../hooks/types";

interface SecretKeySectionProps {
  secretKey: string;
  showSecret: boolean;
  setShowSecret: (v: boolean | ((prev: boolean) => boolean)) => void;
  regenerating: boolean;
  onRequestRegen: (action: ConfirmAction) => void;
}

export function SecretKeySection({ secretKey, showSecret, setShowSecret, regenerating, onRequestRegen }: SecretKeySectionProps) {
  return (
    <section>
      <SectionHeader icon={Key} title="Widget Secret Key" info={<FieldInfo text="Your backend signs a JWT with this key and passes it to window.Freebase('identify', { jwt }). The widget sends the JWT so votes and feedback are tied to real users. Never expose in client-side code." />} />
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
        <p className="text-xs text-[var(--text-secondary)]">
          Use this key to sign <code className="text-[var(--accent)]">window.Freebase(&apos;identify&apos;, &#123; jwt &#125;)</code> calls on your backend. Keep it secret.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-mono text-[var(--text-muted)] truncate">
            {showSecret ? secretKey : "•".repeat(40)}
          </code>
          <button
            onClick={() => setShowSecret((v) => !v)}
            className="rounded p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label={showSecret ? "Hide secret key" : "Show secret key"}
          >
            {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
          {showSecret && <CopyButton text={secretKey} />}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onRequestRegen({ type: "regen-secret" })} disabled={regenerating}>
            {regenerating ? "Regenerating…" : "Regenerate secret"}
          </Button>
          <FieldInfo text="Invalidates all existing widget JWTs immediately. Identified users will fall back to anonymous until re-identified." />
        </div>
      </div>
    </section>
  );
}
