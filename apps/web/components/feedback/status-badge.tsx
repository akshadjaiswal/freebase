import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type Status = "open" | "planned" | "in-progress" | "done" | "closed";

const STATUS_LABELS: Record<Status, string> = {
  open: "Open",
  planned: "Planned",
  "in-progress": "In Progress",
  done: "Done",
  closed: "Closed",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const safeStatus = (STATUS_LABELS[status as Status] ? status : "open") as Status;

  return (
    <Badge
      variant={safeStatus as "open" | "planned" | "in-progress" | "done" | "closed"}
      className={cn("capitalize", className)}
    >
      {STATUS_LABELS[safeStatus]}
    </Badge>
  );
}
