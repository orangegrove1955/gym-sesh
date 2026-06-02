import type { Difficulty } from "@/types/database";

export function calculateNextWeight(
  lastWeight: number,
  lastDifficulty: Difficulty,
  weightIncrement: number,
  minReps: number,
  maxReps: number,
  lastReps: number,
): { weight: number; targetReps: number } {
  switch (lastDifficulty) {
    case "easy":
      return { weight: lastWeight + weightIncrement, targetReps: minReps };
    case "challenging":
      return { weight: lastWeight, targetReps: Math.min(lastReps + 1, maxReps) };
    case "hard":
      return { weight: lastWeight, targetReps: lastReps };
  }
}

export function calculatePrescription(
  exerciseHistory: Array<{ weight: number; reps: number; difficulty: Difficulty }>,
  weightIncrement: number,
  minReps: number,
  maxReps: number,
): { weight: number; targetReps: number } {
  if (exerciseHistory.length === 0) {
    return { weight: 0, targetReps: minReps };
  }

  const latest = exerciseHistory[exerciseHistory.length - 1];
  return calculateNextWeight(
    latest.weight,
    latest.difficulty,
    weightIncrement,
    minReps,
    maxReps,
    latest.reps,
  );
}
