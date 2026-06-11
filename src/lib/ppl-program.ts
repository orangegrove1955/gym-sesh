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

// Short cool-down: 4 stretches × ~30s ≈ 3 minutes
function quickCooldown(startOrder: number): TemplateExerciseData[] {
  const stretches = [
    { name: "Chest Doorway Stretch", notes: "Hold 30 sec each side" },
    { name: "Lat Stretch", notes: "Hold 30 sec each side" },
    { name: "Hip Flexor Stretch", notes: "Hold 30 sec each side" },
    { name: "Shoulder Cross-Body Stretch", notes: "Hold 30 sec each arm" },
  ];
  return stretches.map((s, i) => ({
    exercise_name: s.name,
    sort_order: startOrder + i,
    sets: 1,
    min_reps: 30,
    max_reps: 30,
    is_backoff_set: false,
    rest_seconds: 0,
    notes: s.notes,
  }));
}

export function getPPLProgramData(): ProgramData {
  return {
    program: {
      name: "PPL + Light Full Body",
      description:
        "Push/Pull/Legs split with a light full body session. Each workout is 30-45 min with compound exercises, shoulder and core work every session. Designed for beginners building a solid foundation.",
    },
    days: [
      {
        day_number: 1,
        name: "Push",
        focus_areas: ["chest", "shoulders", "triceps"],
        exercises: [
          { exercise_name: "Bench Press", sort_order: 1, sets: 3, min_reps: 8, max_reps: 12, is_backoff_set: false, rest_seconds: 120, notes: "Main compound — control the eccentric" },
          { exercise_name: "Overhead Press", sort_order: 2, sets: 3, min_reps: 8, max_reps: 12, is_backoff_set: false, rest_seconds: 120, notes: "Brace core, strict form" },
          { exercise_name: "Incline Bench Press", sort_order: 3, sets: 2, min_reps: 10, max_reps: 15, is_backoff_set: false, rest_seconds: 90 },
          { exercise_name: "Lateral Raise", sort_order: 4, sets: 3, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60, notes: "Slow negatives — shoulder width builder" },
          { exercise_name: "Tricep Pushdown", sort_order: 5, sets: 2, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Cable Crunch", sort_order: 6, sets: 2, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Cable Woodchop", sort_order: 7, sets: 2, min_reps: 10, max_reps: 12, is_backoff_set: false, rest_seconds: 60, notes: "Each side — oblique focus" },
          ...quickCooldown(8),
        ],
      },
      {
        day_number: 2,
        name: "Pull",
        focus_areas: ["back", "biceps", "shoulders"],
        exercises: [
          { exercise_name: "Barbell Row", sort_order: 1, sets: 3, min_reps: 8, max_reps: 12, is_backoff_set: false, rest_seconds: 120, notes: "Main compound — drive elbows back" },
          { exercise_name: "Lat Pulldown", sort_order: 2, sets: 3, min_reps: 10, max_reps: 15, is_backoff_set: false, rest_seconds: 90 },
          { exercise_name: "Face Pull", sort_order: 3, sets: 3, min_reps: 15, max_reps: 20, is_backoff_set: false, rest_seconds: 60, notes: "Rear delts + external rotation — posture builder" },
          { exercise_name: "Lateral Raise", sort_order: 4, sets: 2, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60, notes: "Extra shoulder width work" },
          { exercise_name: "Hammer Curl", sort_order: 5, sets: 2, min_reps: 10, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Preacher Curl", sort_order: 6, sets: 2, min_reps: 10, max_reps: 15, is_backoff_set: false, rest_seconds: 60, notes: "Slow eccentric — full stretch at bottom" },
          { exercise_name: "Hanging Leg Raise", sort_order: 7, sets: 2, min_reps: 10, max_reps: 15, is_backoff_set: false, rest_seconds: 60, notes: "Controlled, no swinging" },
          { exercise_name: "Pallof Press", sort_order: 8, sets: 2, min_reps: 10, max_reps: 12, is_backoff_set: false, rest_seconds: 60, notes: "Each side — anti-rotation core" },
          ...quickCooldown(9),
        ],
      },
      {
        day_number: 3,
        name: "Legs",
        focus_areas: ["quads", "hamstrings", "glutes"],
        exercises: [
          { exercise_name: "Squat", sort_order: 1, sets: 3, min_reps: 8, max_reps: 12, is_backoff_set: false, rest_seconds: 150, notes: "Main compound — depth to parallel" },
          { exercise_name: "Romanian Deadlift", sort_order: 2, sets: 3, min_reps: 8, max_reps: 12, is_backoff_set: false, rest_seconds: 120, notes: "Feel the hamstring stretch, hinge at hips" },
          { exercise_name: "Leg Press", sort_order: 3, sets: 2, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 90 },
          { exercise_name: "Lying Leg Curl", sort_order: 4, sets: 2, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Calf Raise", sort_order: 5, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60, notes: "Full range — pause at bottom" },
          { exercise_name: "Cable Lateral Raise", sort_order: 6, sets: 2, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60, notes: "Shoulders every session" },
          { exercise_name: "Decline Crunch", sort_order: 7, sets: 2, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Bicycle Crunch", sort_order: 8, sets: 2, min_reps: 15, max_reps: 20, is_backoff_set: false, rest_seconds: 60, notes: "Slow and controlled — each side" },
          ...quickCooldown(9),
        ],
      },
      {
        day_number: 4,
        name: "Light Full Body",
        focus_areas: ["chest", "back", "shoulders", "quads"],
        exercises: [
          { exercise_name: "Bench Press", sort_order: 1, sets: 2, min_reps: 10, max_reps: 15, is_backoff_set: false, rest_seconds: 90, notes: "Light — focus on form and mind-muscle" },
          { exercise_name: "Barbell Row", sort_order: 2, sets: 2, min_reps: 10, max_reps: 15, is_backoff_set: false, rest_seconds: 90, notes: "Light — squeeze at the top" },
          { exercise_name: "Squat", sort_order: 3, sets: 2, min_reps: 10, max_reps: 15, is_backoff_set: false, rest_seconds: 90, notes: "Light — work on depth and control" },
          { exercise_name: "Overhead Press", sort_order: 4, sets: 2, min_reps: 10, max_reps: 15, is_backoff_set: false, rest_seconds: 90 },
          { exercise_name: "Cable Fly", sort_order: 5, sets: 2, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60, notes: "Squeeze at peak contraction" },
          { exercise_name: "Cable Lateral Raise", sort_order: 6, sets: 2, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Hip Thrust", sort_order: 7, sets: 2, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Strict Curl", sort_order: 8, sets: 2, min_reps: 10, max_reps: 15, is_backoff_set: false, rest_seconds: 60, notes: "Light — focus on strict form" },
          { exercise_name: "Cable Crunch", sort_order: 9, sets: 2, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          ...quickCooldown(10),
        ],
      },
    ],
  };
}
