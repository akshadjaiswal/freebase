"use client";

import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { FieldInfo } from "@/components/ui/field-info";

interface OrganizationSectionProps {
  org: { name: string; slug: string; accentColor: string };
  orgName: string;
  setOrgName: (v: string) => void;
  accentColor: string;
  setAccentColor: (v: string) => void;
  savingOrg: boolean;
  orgSaved: boolean;
  onSave: () => void;
}

export function OrganizationSection({ org, orgName, setOrgName, accentColor, setAccentColor, savingOrg, orgSaved, onSave }: OrganizationSectionProps) {
  return (
    <section>
      <SectionHeader icon={Globe} title="Organization" />
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
        <div className="p-4 flex items-end gap-3">
          <div className="flex-1">
            <Label className="mb-1.5 block text-xs text-[var(--text-secondary)]">Organization name</Label>
            <Input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSave()}
            />
          </div>
          <Button size="sm" onClick={onSave} disabled={savingOrg || (orgName === org.name && accentColor === org.accentColor)}>
            {orgSaved ? <Check className="h-3.5 w-3.5" /> : "Save"}
          </Button>
        </div>
        <div className="p-4">
          <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            Org slug (URL)
            <FieldInfo text="Used in all your public URLs: /{slug}/feedback, /{slug}/changelog, /{slug}/roadmap. Cannot be changed after creation." />
          </Label>
          <code className="block rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--text-muted)] font-mono">
            {org.slug}
          </code>
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">Slug cannot be changed after creation.</p>
        </div>
        <div className="p-4 flex items-center gap-4">
          <div className="flex-1">
            <Label className="mb-1.5 block text-xs text-[var(--text-secondary)]">Accent color</Label>
            <p className="text-xs text-[var(--text-muted)]">Used on public pages and the embedded widget.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded-[var(--radius)] border border-[var(--border)] bg-transparent p-0.5"
              aria-label="Accent color"
            />
            <code className="text-xs font-mono text-[var(--text-muted)]">{accentColor}</code>
          </div>
        </div>
      </div>
    </section>
  );
}
