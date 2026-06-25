import { Skeleton } from "@/components/ui/skeleton";

export default function ChangelogLoading() {
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-8 w-32" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}
