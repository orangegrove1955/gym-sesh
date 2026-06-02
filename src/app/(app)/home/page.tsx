"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dumbbell, Flame, CalendarDays, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface HomeData {
  displayName: string;
  totalWorkouts: number;
  weekWorkouts: number;
  streak: number;
  recentWorkouts: Array<{
    id: string;
    completed_at: string;
    templateName: string;
  }>;
}

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);

  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Welcome — show immediately with skeleton name */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back,{" "}
          {data ? data.displayName : <Skeleton className="inline-block h-7 w-28" />}
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Ready to crush it today?
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Dumbbell className="h-5 w-5 mx-auto mb-1 text-accent" />
            {data ? (
              <p className="text-2xl font-bold">{data.totalWorkouts}</p>
            ) : (
              <Skeleton className="h-8 w-10 mx-auto" />
            )}
            <p className="text-xs text-foreground-muted">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-5 w-5 mx-auto mb-1 text-warning" />
            {data ? (
              <p className="text-2xl font-bold">{data.streak}</p>
            ) : (
              <Skeleton className="h-8 w-10 mx-auto" />
            )}
            <p className="text-xs text-foreground-muted">Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CalendarDays className="h-5 w-5 mx-auto mb-1 text-success" />
            {data ? (
              <p className="text-2xl font-bold">{data.weekWorkouts}</p>
            ) : (
              <Skeleton className="h-8 w-10 mx-auto" />
            )}
            <p className="text-xs text-foreground-muted">This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* CTA always visible */}
      <Link href="/workout" className="block">
        <Button size="lg" className="w-full h-14 text-lg gap-3">
          <Play className="h-6 w-6" />
          Start Workout
        </Button>
      </Link>

      {/* Recent workouts */}
      {!data && (
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.recentWorkouts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Workouts</h2>
          {data.recentWorkouts.map((session) => (
            <Card key={session.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{session.templateName}</p>
                  <p className="text-xs text-foreground-muted">
                    {formatDistanceToNow(new Date(session.completed_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Badge variant="success">Completed</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.recentWorkouts.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-foreground-muted">
            <p>No workouts yet. Start your first one!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
