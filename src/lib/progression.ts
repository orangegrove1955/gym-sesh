import type { Difficulty } from "@/types/database";

/**
 * Smarter progression logic:
 *
 * Easy + at max reps → increase weight, reset to min reps
 * Easy + below max reps → same weight, increase reps toward max
 * Challenging → same weight, try to add 1 rep (capped at max)
 * Hard → same weight, same reps
 *
 * If wentToFailure on previous set, hold weight and drop 1 rep as recovery.
 */
export function calculateNextWeight(
  lastWeight: number,
  lastDifficulty: Difficulty,
  weightIncrement: number,
  minReps: number,
  maxReps: number,
  lastReps: number,
  lastWentToFailure?: boolean,
): { weight: number; targetReps: number } {
  // If they went to failure last time, hold weight and back off 1 rep
  if (lastWentToFailure) {
    return {
      weight: lastWeight,
      targetReps: Math.max(minReps, lastReps - 1),
    };
  }

  switch (lastDifficulty) {
    case "easy":
      if (lastReps >= maxReps) {
        // Hit top of range and it was easy — increase weight, reset reps
        return {
          weight: lastWeight + weightIncrement,
          targetReps: minReps,
        };
      }
      // Below max reps — increase reps first before adding weight
      return {
        weight: lastWeight,
        targetReps: Math.min(lastReps + 2, maxReps),
      };

    case "challenging":
      return {
        weight: lastWeight,
        targetReps: Math.min(lastReps + 1, maxReps),
      };

    case "hard":
      return {
        weight: lastWeight,
        targetReps: lastReps,
      };
  }
}

export function calculatePrescription(
  exerciseHistory: Array<{
    weight: number;
    reps: number;
    difficulty: Difficulty;
    wentToFailure?: boolean;
  }>,
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
    latest.wentToFailure,
  );
}
