import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function StatsLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      <Skeleton className="h-8 w-20" />

      {/* Tab bar */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Heatmap placeholder */}
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* Chart placeholder */}
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
