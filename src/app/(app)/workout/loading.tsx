import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function WorkoutLoading() {
  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>

      {/* Day cards */}
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[...Array(6)].map((_, j) => (
                <Skeleton key={j} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Start button */}
      <Skeleton className="h-14 w-full rounded-lg" />
    </div>
  );
}
