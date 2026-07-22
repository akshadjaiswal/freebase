"use client";

import { useState } from "react";
import { Check, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { FieldInfo } from "@/components/ui/field-info";

interface AllowedOriginsSectionProps {
  allowedOrigins: string[];
  setAllowedOrigins: (v: string[]) => void;
  savedAllowedOrigins: string[];
  savingOrg: boolean;
  orgSaved: boolean;
  onSave: () => void;
}

export function AllowedOriginsSection({
  allowedOrigins,
  setAllowedOrigins,
  savedAllowedOrigins,
  savingOrg,
  orgSaved,
  onSave,
}: AllowedOriginsSectionProps) {
  const [draft, setDraft] = useState("");

  function addOrigin() {
    const value = draft.trim().replace(/\/$/, "");
    if (!value) return;
    if (!allowedOrigins.includes(value)) {
      setAllowedOrigins([...allowedOrigins, value]);
    }
    setDraft("");
  }

  function removeOrigin(origin: string) {
    setAllowedOrigins(allowedOrigins.filter((o) => o !== origin));
  }

  const unchanged = JSON.stringify(allowedOrigins) === JSON.stringify(savedAllowedOrigins);

  return (
    <section>
      <SectionHeader
        icon={ShieldAlert}
        title="Allowed Origins"
        info={<FieldInfo text="Restricts which websites may embed your widget. Leave empty to allow any site (current default)." />}
      />
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
        {allowedOrigins.length === 0 ? (
          <p className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)]">
            <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
            Any website can currently embed this widget. Add a domain below to restrict embedding to only those sites.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allowedOrigins.map((origin) => (
              <span
                key={origin}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-xs font-mono text-[var(--text-secondary)]"
              >
                {origin}
                <button
                  type="button"
                  onClick={() => removeOrigin(origin)}
                  aria-label={`Remove ${origin}`}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label className="mb-1.5 block text-xs text-[var(--text-secondary)]">Add an origin</Label>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addOrigin();
                }
              }}
              placeholder="https://yourapp.com"
            />
          </div>
          <Button size="sm" variant="secondary" onClick={addOrigin} disabled={!draft.trim()}>
            Add
          </Button>
          <Button size="sm" onClick={onSave} disabled={savingOrg || unchanged}>
            {orgSaved ? <Check className="h-3.5 w-3.5" /> : "Save"}
          </Button>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Full origin only, no path or trailing slash — e.g. <code className="font-mono">https://yourapp.com</code>, not <code className="font-mono">yourapp.com</code>.
        </p>
      </div>
    </section>
  );
}
