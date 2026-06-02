import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format, subDays, startOfWeek, differenceInCalendarWeeks } from "date-fns";
import { StatsClient } from "./stats-client";
import {
  isDemoMode,
  demoSessions,
  demoSetLogs,
  demoExercises,
} from "@/lib/demo-data";
import type { WorkoutSession, SetLog, Exercise } from "@/types/database";

function computeStats(
  safeSessions: WorkoutSession[],
  safeSetLogs: SetLog[],
  safeExercises: Exercise[]
) {
  const exerciseMap = new Map(safeExercises.map((e) => [e.id, e]));
  const sessionIds = new Set(safeSessions.map((s) => s.id));
  const userSetLogs = safeSetLogs.filter((sl) => sessionIds.has(sl.session_id));

  const workoutDates = [
    ...new Set(
      safeSessions.map((s) => format(new Date(s.started_at), "yyyy-MM-dd"))
    ),
  ];

  const sortedDates = [...workoutDates].sort().reverse();
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

  if (sortedDates.length > 0) {
    const startDate = sortedDates[0] === today || sortedDates[0] === yesterday ? 0 : -1;
    if (startDate >= 0) {
      for (let i = startDate; i < sortedDates.length; i++) {
        const expected = format(subDays(new Date(), i), "yyyy-MM-dd");
        if (sortedDates.includes(expected)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    const allSorted = [...workoutDates].sort();
    tempStreak = 1;
    bestStreak = 1;
    for (let i = 1; i < allSorted.length; i++) {
      const prev = new Date(allSorted[i - 1]);
      const curr = new Date(allSorted[i]);
      const diffMs = curr.getTime() - prev.getTime();
      if (diffMs <= 86400000 * 1.5) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
  }

  const totalWorkouts = safeSessions.length;
  const firstWorkout = safeSessions[0]?.started_at;
  const weeksActive = firstWorkout
    ? Math.max(1, differenceInCalendarWeeks(new Date(), new Date(firstWorkout)) + 1)
    : 1;
  const avgPerWeek = Math.round((totalWorkouts / weeksActive) * 10) / 10;

  const muscleDistribution: Record<string, number> = {};
  for (const sl of userSetLogs) {
    const ex = exerciseMap.get(sl.exercise_id);
    if (ex) {
      muscleDistribution[ex.muscle_group] =
        (muscleDistribution[ex.muscle_group] || 0) + 1;
    }
  }
  const muscleDistData = Object.entries(muscleDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const compoundExercises = safeExercises.filter((e) => e.is_compound);
  const strengthData = compoundExercises
    .map((ex) => {
      const logs = userSetLogs.filter(
        (sl) => sl.exercise_id === ex.id && sl.actual_weight && sl.actual_reps
      );
      if (logs.length === 0) return null;

      const sessionMap = new Map(safeSessions.map((s) => [s.id, s]));
      const bySession: Record<string, number> = {};
      const prMap: Record<number, number> = {};

      for (const log of logs) {
        const session = sessionMap.get(log.session_id);
        if (!session) continue;
        const dateKey = format(new Date(session.started_at), "MMM d");
        bySession[dateKey] = Math.max(bySession[dateKey] || 0, log.actual_weight!);
        const reps = log.actual_reps!;
        prMap[reps] = Math.max(prMap[reps] || 0, log.actual_weight!);
      }

      const history = Object.entries(bySession).map(([date, weight]) => ({
        date,
        weight,
      }));

      const prs = Object.entries(prMap)
        .map(([reps, weight]) => ({ reps: Number(reps), weight }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3);

      return { exerciseName: ex.name, history, prs };
    })
    .filter(Boolean) as {
    exerciseName: string;
    history: { date: string; weight: number }[];
    prs: { reps: number; weight: number }[];
  }[];

  const weeklyVolumeMap: Record<string, number> = {};
  const muscleWeeklyMap: Record<string, Record<string, number>> = {};
  const sessionVolumeMap: Record<string, number> = {};

  for (const sl of userSetLogs) {
    if (!sl.actual_weight || !sl.actual_reps) continue;
    const session = safeSessions.find((s) => s.id === sl.session_id);
    if (!session) continue;

    const vol = sl.actual_weight * sl.actual_reps;
    const weekKey = format(
      startOfWeek(new Date(session.started_at), { weekStartsOn: 1 }),
      "MMM d"
    );
    const dateKey = format(new Date(session.started_at), "MMM d");

    weeklyVolumeMap[weekKey] = (weeklyVolumeMap[weekKey] || 0) + vol;
    sessionVolumeMap[dateKey] = (sessionVolumeMap[dateKey] || 0) + vol;

    const ex = exerciseMap.get(sl.exercise_id);
    if (ex) {
      if (!muscleWeeklyMap[weekKey]) muscleWeeklyMap[weekKey] = {};
      muscleWeeklyMap[weekKey][ex.muscle_group] =
        (muscleWeeklyMap[weekKey][ex.muscle_group] || 0) + vol;
    }
  }

  const weeklyVolume = Object.entries(weeklyVolumeMap).map(([week, volume]) => ({
    week,
    volume: Math.round(volume),
  }));

  const allMuscleGroups = [
    ...new Set(
      Object.values(muscleWeeklyMap).flatMap((m) => Object.keys(m))
    ),
  ];

  const muscleVolume = Object.entries(muscleWeeklyMap).map(([week, muscles]) => ({
    week,
    ...Object.fromEntries(
      allMuscleGroups.map((mg) => [mg, Math.round(muscles[mg] || 0)])
    ),
  }));

  const sessionVolume = Object.entries(sessionVolumeMap).map(
    ([date, volume]) => ({ date, volume: Math.round(volume) })
  );

  return {
    workoutDates,
    currentStreak,
    bestStreak,
    totalWorkouts,
    avgPerWeek,
    muscleDistData,
    strengthData,
    weeklyVolume,
    muscleVolume,
    allMuscleGroups,
    sessionVolume,
  };
}

export default async function StatsPage() {
  let safeSessions: WorkoutSession[];
  let safeSetLogs: SetLog[];
  let safeExercises: Exercise[];

  if (isDemoMode()) {
    safeSessions = demoSessions.filter((s) => s.completed_at);
    safeSetLogs = demoSetLogs.filter((sl) => sl.completed);
    safeExercises = demoExercises;
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: sessions } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", user.id)
      .not("completed_at", "is", null)
      .order("started_at", { ascending: true });

    const { data: setLogs } = await supabase
      .from("set_logs")
      .select("*")
      .eq("completed", true);

    const { data: exercises } = await supabase
      .from("exercise_library")
      .select("*");

    safeSessions = sessions ?? [];
    safeSetLogs = setLogs ?? [];
    safeExercises = exercises ?? [];
  }

  const stats = computeStats(safeSessions, safeSetLogs, safeExercises);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Stats</h1>
      <StatsClient
        workoutDates={stats.workoutDates}
        currentStreak={stats.currentStreak}
        bestStreak={stats.bestStreak}
        totalWorkouts={stats.totalWorkouts}
        avgPerWeek={stats.avgPerWeek}
        muscleDistData={stats.muscleDistData}
        strengthData={stats.strengthData}
        weeklyVolume={stats.weeklyVolume}
        muscleVolume={stats.muscleVolume}
        muscleGroups={stats.allMuscleGroups}
        sessionVolume={stats.sessionVolume}
      />
    </div>
  );
}
