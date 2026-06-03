type TemplateExerciseData = {
  exercise_name: string;
  sort_order: number;
  sets: number;
  min_reps: number;
  max_reps: number;
  is_backoff_set: boolean;
  rest_seconds: number;
  notes?: string;
};

type DayData = {
  day_number: number;
  name: string;
  focus_areas: string[];
  exercises: TemplateExerciseData[];
};

type ProgramData = {
  program: { name: string; description: string };
  days: DayData[];
};

export function getDefaultProgramData(): ProgramData {
  return {
    program: {
      name: "3-Day Full Body",
      description:
        "A 3-day full body program with rotating emphasis on chest & quads, back & glutes, and shoulders & arms.",
    },
    days: [
      {
        day_number: 1,
        name: "Chest & Quad Focused",
        focus_areas: ["chest", "quads"],
        exercises: [
          { exercise_name: "Bench Press", sort_order: 1, sets: 2, min_reps: 5, max_reps: 8, is_backoff_set: false, rest_seconds: 180, notes: "Heavy working sets" },
          { exercise_name: "Bench Press", sort_order: 2, sets: 1, min_reps: 8, max_reps: 12, is_backoff_set: true, rest_seconds: 120, notes: "Backoff set" },
          { exercise_name: "Incline Bench Press", sort_order: 3, sets: 3, min_reps: 8, max_reps: 12, is_backoff_set: false, rest_seconds: 120 },
          { exercise_name: "Weighted Pullup", sort_order: 4, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 120 },
          { exercise_name: "Lateral Raise", sort_order: 5, sets: 3, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Tricep Pushdown", sort_order: 6, sets: 3, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Preacher Curl", sort_order: 7, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Squat", sort_order: 8, sets: 2, min_reps: 5, max_reps: 8, is_backoff_set: false, rest_seconds: 180, notes: "Heavy working sets" },
          { exercise_name: "Squat", sort_order: 9, sets: 1, min_reps: 8, max_reps: 12, is_backoff_set: true, rest_seconds: 120, notes: "Backoff set" },
          { exercise_name: "Lying Leg Curl", sort_order: 10, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 90 },
          { exercise_name: "Calf Raise", sort_order: 11, sets: 3, min_reps: 8, max_reps: 12, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Cable Crunch", sort_order: 12, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Chest Doorway Stretch", sort_order: 13, sets: 1, min_reps: 30, max_reps: 30, is_backoff_set: false, rest_seconds: 0, notes: "Hold 30 seconds each side" },
          { exercise_name: "Quad Stretch", sort_order: 14, sets: 1, min_reps: 30, max_reps: 30, is_backoff_set: false, rest_seconds: 0, notes: "Hold 30 seconds each side" },
          { exercise_name: "Standing Hamstring Stretch", sort_order: 15, sets: 1, min_reps: 30, max_reps: 30, is_backoff_set: false, rest_seconds: 0, notes: "Hold 30 seconds each side" },
        ],
      },
      {
        day_number: 2,
        name: "Back & Glute Focused",
        focus_areas: ["back", "glutes"],
        exercises: [
          { exercise_name: "Lat Pulldown", sort_order: 1, sets: 3, min_reps: 8, max_reps: 12, is_backoff_set: false, rest_seconds: 120 },
          { exercise_name: "Barbell Row", sort_order: 2, sets: 3, min_reps: 8, max_reps: 12, is_backoff_set: false, rest_seconds: 120 },
          { exercise_name: "Bench Press", sort_order: 3, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 120 },
          { exercise_name: "Hammer Curl", sort_order: 4, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Overhead Press", sort_order: 5, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 120 },
          { exercise_name: "Skullcrusher", sort_order: 6, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Hip Thrust", sort_order: 7, sets: 3, min_reps: 8, max_reps: 12, is_backoff_set: false, rest_seconds: 120 },
          { exercise_name: "Leg Press", sort_order: 8, sets: 3, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 120 },
          { exercise_name: "Calf Raise", sort_order: 9, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Hanging Leg Raise", sort_order: 10, sets: 3, min_reps: 10, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Lat Stretch", sort_order: 11, sets: 1, min_reps: 30, max_reps: 30, is_backoff_set: false, rest_seconds: 0, notes: "Hold 30 seconds each side" },
          { exercise_name: "Hip Flexor Stretch", sort_order: 12, sets: 1, min_reps: 30, max_reps: 30, is_backoff_set: false, rest_seconds: 0, notes: "Hold 30 seconds each side" },
          { exercise_name: "Calf Stretch", sort_order: 13, sets: 1, min_reps: 30, max_reps: 30, is_backoff_set: false, rest_seconds: 0, notes: "Hold 30 seconds each side" },
        ],
      },
      {
        day_number: 3,
        name: "Shoulders & Arms Focused",
        focus_areas: ["shoulders", "biceps", "triceps"],
        exercises: [
          { exercise_name: "Overhead Press", sort_order: 1, sets: 2, min_reps: 5, max_reps: 8, is_backoff_set: false, rest_seconds: 180, notes: "Heavy working sets" },
          { exercise_name: "Overhead Press", sort_order: 2, sets: 1, min_reps: 8, max_reps: 12, is_backoff_set: true, rest_seconds: 120, notes: "Backoff set" },
          { exercise_name: "Bent Over Rear Delt Fly", sort_order: 3, sets: 3, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Strict Curl", sort_order: 4, sets: 2, min_reps: 5, max_reps: 8, is_backoff_set: false, rest_seconds: 120, notes: "Heavy working sets" },
          { exercise_name: "Strict Curl", sort_order: 5, sets: 1, min_reps: 8, max_reps: 12, is_backoff_set: true, rest_seconds: 90, notes: "Backoff set" },
          { exercise_name: "Skullcrusher", sort_order: 6, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Cable Fly", sort_order: 7, sets: 3, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Seated Cable Row", sort_order: 8, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 120 },
          { exercise_name: "Romanian Deadlift", sort_order: 9, sets: 3, min_reps: 8, max_reps: 12, is_backoff_set: false, rest_seconds: 120 },
          { exercise_name: "Glute Kickback", sort_order: 10, sets: 3, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Calf Raise", sort_order: 11, sets: 3, min_reps: 15, max_reps: 20, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Decline Crunch", sort_order: 12, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Shoulder Cross-Body Stretch", sort_order: 13, sets: 1, min_reps: 30, max_reps: 30, is_backoff_set: false, rest_seconds: 0, notes: "Hold 30 seconds each side" },
          { exercise_name: "Tricep Overhead Stretch", sort_order: 14, sets: 1, min_reps: 30, max_reps: 30, is_backoff_set: false, rest_seconds: 0, notes: "Hold 30 seconds each side" },
          { exercise_name: "Standing Hamstring Stretch", sort_order: 15, sets: 1, min_reps: 30, max_reps: 30, is_backoff_set: false, rest_seconds: 0, notes: "Hold 30 seconds each side" },
        ],
      },
    ],
  };
}
