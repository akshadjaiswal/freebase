interface CategoryChipProps {
  name: string;
  color: string;
  className?: string;
}

export function CategoryChip({ name, color, className }: CategoryChipProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs font-medium ${className ?? ""}`}
      style={{ backgroundColor: `${color}18`, color }}
    >
      {name}
    </span>
  );
}
