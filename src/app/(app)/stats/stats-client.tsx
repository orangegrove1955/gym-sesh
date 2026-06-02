"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WorkoutHeatmap } from "@/components/stats/workout-heatmap";
import { MuscleDistribution } from "@/components/stats/muscle-distribution";
import { StrengthChart } from "@/components/stats/strength-chart";
import { VolumeChart } from "@/components/stats/volume-chart";
import { Flame, Trophy, Dumbbell, TrendingUp } from "lucide-react";

interface StatsClientProps {
  workoutDates: string[];
  currentStreak: number;
  bestStreak: number;
  totalWorkouts: number;
  avgPerWeek: number;
  muscleDistData: { name: string; value: number }[];
  strengthData: {
    exerciseName: string;
    history: { date: string; weight: number }[];
    prs: { reps: number; weight: number }[];
  }[];
  weeklyVolume: { week: string; volume: number }[];
  muscleVolume: { week: string; [key: string]: string | number }[];
  muscleGroups: string[];
  sessionVolume: { date: string; volume: number }[];
}

export function StatsClient({
  workoutDates,
  currentStreak,
  bestStreak,
  totalWorkouts,
  avgPerWeek,
  muscleDistData,
  strengthData,
  weeklyVolume,
  muscleVolume,
  muscleGroups,
  sessionVolume,
}: StatsClientProps) {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="w-full">
        <TabsTrigger value="overview" className="flex-1">
          Overview
        </TabsTrigger>
        <TabsTrigger value="strength" className="flex-1">
          Strength
        </TabsTrigger>
        <TabsTrigger value="volume" className="flex-1">
          Volume
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6 mt-4">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-foreground-muted text-xs mb-1">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                Current Streak
              </div>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-xs text-foreground-muted">days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-foreground-muted text-xs mb-1">
                <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                Best Streak
              </div>
              <p className="text-2xl font-bold">{bestStreak}</p>
              <p className="text-xs text-foreground-muted">days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-foreground-muted text-xs mb-1">
                <Dumbbell className="h-3.5 w-3.5 text-blue-500" />
                Total
              </div>
              <p className="text-2xl font-bold">{totalWorkouts}</p>
              <p className="text-xs text-foreground-muted">workouts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-foreground-muted text-xs mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                Average
              </div>
              <p className="text-2xl font-bold">{avgPerWeek}</p>
              <p className="text-xs text-foreground-muted">per week</p>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkoutHeatmap workoutDates={workoutDates} />
          </CardContent>
        </Card>

        {/* Muscle distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Muscle Group Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <MuscleDistribution data={muscleDistData} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="strength" className="mt-4">
        <StrengthChart exercises={strengthData} />
      </TabsContent>

      <TabsContent value="volume" className="mt-4">
        <VolumeChart
          weeklyVolume={weeklyVolume}
          muscleVolume={muscleVolume}
          muscleGroups={muscleGroups}
          sessionVolume={sessionVolume}
        />
      </TabsContent>
    </Tabs>
  );
}
