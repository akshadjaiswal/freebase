import type { ReactNode } from "react";

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  info?: ReactNode;
}

export function SectionHeader({ icon: Icon, title, info }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-4 w-4 text-[var(--text-muted)]" />
      <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
      {info}
    </div>
  );
}
