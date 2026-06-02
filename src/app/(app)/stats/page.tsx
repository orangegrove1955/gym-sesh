"use client";

import { useState, useEffect } from "react";
import { StatsClient } from "./stats-client";
import StatsLoading from "./loading";

export default function StatsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <StatsLoading />;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Stats</h1>
      <StatsClient
        workoutDates={data.workoutDates as string[]}
        currentStreak={data.currentStreak as number}
        bestStreak={data.bestStreak as number}
        totalWorkouts={data.totalWorkouts as number}
        avgPerWeek={data.avgPerWeek as number}
        muscleDistData={data.muscleDistData as { name: string; value: number }[]}
        strengthData={
          data.strengthData as {
            exerciseName: string;
            history: { date: string; weight: number }[];
            prs: { reps: number; weight: number }[];
          }[]
        }
        weeklyVolume={data.weeklyVolume as { week: string; volume: number }[]}
        muscleVolume={
          data.muscleVolume as { week: string; [key: string]: string | number }[]
        }
        muscleGroups={data.muscleGroups as string[]}
        sessionVolume={
          data.sessionVolume as { date: string; volume: number }[]
        }
      />
    </div>
  );
}
