import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProgramLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      <Skeleton className="h-8 w-28" />

      {/* Program name */}
      <Skeleton className="h-10 w-64 rounded-lg" />

      {/* Day tabs */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Exercise list */}
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add exercise button */}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}
