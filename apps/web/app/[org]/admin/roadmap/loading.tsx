import { Skeleton } from "@/components/ui/skeleton";

export default function RoadmapLoading() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="space-y-2">
            <Skeleton className="h-6 w-24 mb-3" />
            {Array.from({ length: 3 + col }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
