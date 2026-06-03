import type { Database } from "@/types/database";

type ExerciseInsert = Omit<
  Database["public"]["Tables"]["exercise_library"]["Insert"],
  "id" | "user_id" | "created_at"
>;

export const DEFAULT_EXERCISES: ExerciseInsert[] = [
  // Chest
  { name: "Bench Press", muscle_group: "chest", equipment: "barbell", is_compound: true, weight_increment: 2.5 },
  { name: "Incline Bench Press", muscle_group: "chest", equipment: "barbell", is_compound: true, weight_increment: 2.5 },
  { name: "Cable Fly", muscle_group: "chest", equipment: "cable", is_compound: false, weight_increment: 2.5 },

  // Back
  { name: "Weighted Pullup", muscle_group: "back", equipment: "bodyweight", is_compound: true, weight_increment: 2.5 },
  { name: "Lat Pulldown", muscle_group: "back", equipment: "cable", is_compound: true, weight_increment: 2.5 },
  { name: "Barbell Row", muscle_group: "back", equipment: "barbell", is_compound: true, weight_increment: 2.5 },
  { name: "Seated Cable Row", muscle_group: "back", equipment: "cable", is_compound: true, weight_increment: 2.5 },

  // Shoulders
  { name: "Overhead Press", muscle_group: "shoulders", equipment: "barbell", is_compound: true, weight_increment: 2.5 },
  { name: "Lateral Raise", muscle_group: "shoulders", equipment: "dumbbell", is_compound: false, weight_increment: 1 },
  { name: "Bent Over Rear Delt Fly", muscle_group: "shoulders", equipment: "dumbbell", is_compound: false, weight_increment: 1 },

  // Biceps
  { name: "Preacher Curl", muscle_group: "biceps", equipment: "dumbbell", is_compound: false, weight_increment: 1 },
  { name: "Hammer Curl", muscle_group: "biceps", equipment: "dumbbell", is_compound: false, weight_increment: 1 },
  { name: "Strict Curl", muscle_group: "biceps", equipment: "barbell", is_compound: false, weight_increment: 1 },

  // Triceps
  { name: "Tricep Pushdown", muscle_group: "triceps", equipment: "cable", is_compound: false, weight_increment: 2.5 },
  { name: "Skullcrusher", muscle_group: "triceps", equipment: "barbell", is_compound: false, weight_increment: 2.5 },

  // Quads
  { name: "Squat", muscle_group: "quads", equipment: "barbell", is_compound: true, weight_increment: 2.5 },
  { name: "Leg Press", muscle_group: "quads", equipment: "machine", is_compound: true, weight_increment: 5 },

  // Hamstrings
  { name: "Lying Leg Curl", muscle_group: "hamstrings", equipment: "machine", is_compound: false, weight_increment: 2.5 },
  { name: "Romanian Deadlift", muscle_group: "hamstrings", equipment: "barbell", is_compound: true, weight_increment: 2.5 },

  // Glutes
  { name: "Hip Thrust", muscle_group: "glutes", equipment: "barbell", is_compound: true, weight_increment: 2.5 },
  { name: "Glute Kickback", muscle_group: "glutes", equipment: "cable", is_compound: false, weight_increment: 2.5 },

  // Calves
  { name: "Calf Raise", muscle_group: "calves", equipment: "machine", is_compound: false, weight_increment: 2.5 },

  // Abs
  { name: "Cable Crunch", muscle_group: "abs", equipment: "cable", is_compound: false, weight_increment: 2.5 },
  { name: "Hanging Leg Raise", muscle_group: "abs", equipment: "bodyweight", is_compound: false, weight_increment: 0 },
  { name: "Decline Crunch", muscle_group: "abs", equipment: "bodyweight", is_compound: false, weight_increment: 0 },

  // Stretches (full body)
  { name: "Standing Hamstring Stretch", muscle_group: "hamstrings", equipment: "bodyweight", is_compound: false, weight_increment: 0 },
  { name: "Quad Stretch", muscle_group: "quads", equipment: "bodyweight", is_compound: false, weight_increment: 0 },
  { name: "Chest Doorway Stretch", muscle_group: "chest", equipment: "bodyweight", is_compound: false, weight_increment: 0 },
  { name: "Lat Stretch", muscle_group: "back", equipment: "bodyweight", is_compound: false, weight_increment: 0 },
  { name: "Shoulder Cross-Body Stretch", muscle_group: "shoulders", equipment: "bodyweight", is_compound: false, weight_increment: 0 },
  { name: "Tricep Overhead Stretch", muscle_group: "triceps", equipment: "bodyweight", is_compound: false, weight_increment: 0 },
  { name: "Hip Flexor Stretch", muscle_group: "glutes", equipment: "bodyweight", is_compound: false, weight_increment: 0 },
  { name: "Calf Stretch", muscle_group: "calves", equipment: "bodyweight", is_compound: false, weight_increment: 0 },
];
