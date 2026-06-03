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

// Standard 5-min cool-down stretches appended to every lifting day
// 6 stretches × 30 sec each side ≈ 5 minutes
function cooldownStretches(startOrder: number): TemplateExerciseData[] {
  const stretches = [
    { name: "Chest Doorway Stretch", notes: "Hold 30 sec each side" },
    { name: "Lat Stretch", notes: "Hold 30 sec each side" },
    { name: "Hip Flexor Stretch", notes: "Hold 30 sec each side — kneel and push hips forward" },
    { name: "Standing Hamstring Stretch", notes: "Hold 30 sec each leg" },
    { name: "Shoulder Cross-Body Stretch", notes: "Hold 30 sec each arm" },
    { name: "Quad Stretch", notes: "Hold 30 sec each leg" },
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

export function getDefaultProgramData(): ProgramData {
  return {
    program: {
      name: "4-Day Full Body + Mobility",
      description:
        "3 full body lifting days with rotating emphasis, plus a dedicated mobility/flexibility session. Each lifting day ends with essential stretches.",
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
          { exercise_name: "Lateral Raise", sort_order: 5, sets: 4, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60, notes: "Slow negatives — key for width" },
          { exercise_name: "Face Pull", sort_order: 6, sets: 3, min_reps: 15, max_reps: 20, is_backoff_set: false, rest_seconds: 60, notes: "Rear delts + external rotation" },
          { exercise_name: "Tricep Pushdown", sort_order: 7, sets: 3, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Preacher Curl", sort_order: 8, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Squat", sort_order: 9, sets: 2, min_reps: 5, max_reps: 8, is_backoff_set: false, rest_seconds: 180, notes: "Heavy working sets" },
          { exercise_name: "Squat", sort_order: 10, sets: 1, min_reps: 8, max_reps: 12, is_backoff_set: true, rest_seconds: 120, notes: "Backoff set" },
          { exercise_name: "Lying Leg Curl", sort_order: 11, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 90 },
          { exercise_name: "Calf Raise", sort_order: 12, sets: 3, min_reps: 8, max_reps: 12, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Cable Crunch", sort_order: 13, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Cable Woodchop", sort_order: 14, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60, notes: "Each side" },
          ...cooldownStretches(15),
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
          { exercise_name: "Cable Lateral Raise", sort_order: 6, sets: 3, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60, notes: "Constant tension — great for lateral delts" },
          { exercise_name: "Skullcrusher", sort_order: 7, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Hip Thrust", sort_order: 8, sets: 3, min_reps: 8, max_reps: 12, is_backoff_set: false, rest_seconds: 120 },
          { exercise_name: "Leg Press", sort_order: 9, sets: 3, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 120 },
          { exercise_name: "Calf Raise", sort_order: 10, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Hanging Leg Raise", sort_order: 11, sets: 3, min_reps: 10, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Pallof Press", sort_order: 12, sets: 3, min_reps: 10, max_reps: 15, is_backoff_set: false, rest_seconds: 60, notes: "Each side — anti-rotation" },
          ...cooldownStretches(13),
        ],
      },
      {
        day_number: 3,
        name: "Shoulders & Arms Focused",
        focus_areas: ["shoulders", "biceps", "triceps"],
        exercises: [
          { exercise_name: "Overhead Press", sort_order: 1, sets: 2, min_reps: 5, max_reps: 8, is_backoff_set: false, rest_seconds: 180, notes: "Heavy working sets" },
          { exercise_name: "Overhead Press", sort_order: 2, sets: 1, min_reps: 8, max_reps: 12, is_backoff_set: true, rest_seconds: 120, notes: "Backoff set" },
          { exercise_name: "Upright Row", sort_order: 3, sets: 3, min_reps: 10, max_reps: 15, is_backoff_set: false, rest_seconds: 60, notes: "Wide grip to target lateral delts — don't go above chin height" },
          { exercise_name: "Lateral Raise", sort_order: 4, sets: 4, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60, notes: "Slow negatives — key for width" },
          { exercise_name: "Bent Over Rear Delt Fly", sort_order: 5, sets: 3, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Strict Curl", sort_order: 6, sets: 2, min_reps: 5, max_reps: 8, is_backoff_set: false, rest_seconds: 120, notes: "Heavy working sets" },
          { exercise_name: "Strict Curl", sort_order: 7, sets: 1, min_reps: 8, max_reps: 12, is_backoff_set: true, rest_seconds: 90, notes: "Backoff set" },
          { exercise_name: "Skullcrusher", sort_order: 8, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Cable Fly", sort_order: 9, sets: 3, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Seated Cable Row", sort_order: 10, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 120 },
          { exercise_name: "Romanian Deadlift", sort_order: 11, sets: 3, min_reps: 8, max_reps: 12, is_backoff_set: false, rest_seconds: 120 },
          { exercise_name: "Glute Kickback", sort_order: 12, sets: 3, min_reps: 12, max_reps: 20, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Calf Raise", sort_order: 13, sets: 3, min_reps: 15, max_reps: 20, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Decline Crunch", sort_order: 14, sets: 3, min_reps: 12, max_reps: 15, is_backoff_set: false, rest_seconds: 60 },
          { exercise_name: "Bicycle Crunch", sort_order: 15, sets: 3, min_reps: 15, max_reps: 20, is_backoff_set: false, rest_seconds: 60, notes: "Slow and controlled — each side" },
          ...cooldownStretches(16),
        ],
      },
      {
        day_number: 4,
        name: "Mobility & Flexibility",
        focus_areas: ["glutes", "hamstrings", "back", "shoulders"],
        exercises: [
          // Dynamic warm-up
          { exercise_name: "Cat-Cow Stretch", sort_order: 1, sets: 1, min_reps: 10, max_reps: 10, is_backoff_set: false, rest_seconds: 0, notes: "Slow, 10 reps flowing between cat and cow" },
          { exercise_name: "World's Greatest Stretch", sort_order: 2, sets: 1, min_reps: 5, max_reps: 5, is_backoff_set: false, rest_seconds: 0, notes: "5 each side — lunge, twist, reach" },
          // Lower body — longer holds for flexibility gains
          { exercise_name: "Hip Flexor Stretch", sort_order: 3, sets: 2, min_reps: 45, max_reps: 45, is_backoff_set: false, rest_seconds: 0, notes: "45 sec each side — deep lunge position" },
          { exercise_name: "Pigeon Stretch", sort_order: 4, sets: 2, min_reps: 45, max_reps: 45, is_backoff_set: false, rest_seconds: 0, notes: "45 sec each side — sink into the stretch" },
          { exercise_name: "Standing Hamstring Stretch", sort_order: 5, sets: 2, min_reps: 45, max_reps: 45, is_backoff_set: false, rest_seconds: 0, notes: "45 sec each leg" },
          { exercise_name: "Quad Stretch", sort_order: 6, sets: 2, min_reps: 45, max_reps: 45, is_backoff_set: false, rest_seconds: 0, notes: "45 sec each leg" },
          { exercise_name: "Figure-4 Glute Stretch", sort_order: 7, sets: 2, min_reps: 45, max_reps: 45, is_backoff_set: false, rest_seconds: 0, notes: "45 sec each side — lying or seated" },
          { exercise_name: "Calf Stretch", sort_order: 8, sets: 2, min_reps: 30, max_reps: 30, is_backoff_set: false, rest_seconds: 0, notes: "30 sec each leg — straight and bent knee" },
          // Upper body
          { exercise_name: "Chest Doorway Stretch", sort_order: 9, sets: 2, min_reps: 45, max_reps: 45, is_backoff_set: false, rest_seconds: 0, notes: "45 sec — try different arm angles" },
          { exercise_name: "Lat Stretch", sort_order: 10, sets: 2, min_reps: 45, max_reps: 45, is_backoff_set: false, rest_seconds: 0, notes: "45 sec each side" },
          { exercise_name: "Shoulder Cross-Body Stretch", sort_order: 11, sets: 2, min_reps: 30, max_reps: 30, is_backoff_set: false, rest_seconds: 0, notes: "30 sec each arm" },
          { exercise_name: "Tricep Overhead Stretch", sort_order: 12, sets: 2, min_reps: 30, max_reps: 30, is_backoff_set: false, rest_seconds: 0, notes: "30 sec each arm" },
          { exercise_name: "Neck Side Stretch", sort_order: 13, sets: 1, min_reps: 30, max_reps: 30, is_backoff_set: false, rest_seconds: 0, notes: "30 sec each side — gentle, no forcing" },
          { exercise_name: "Wrist Flexor Stretch", sort_order: 14, sets: 1, min_reps: 30, max_reps: 30, is_backoff_set: false, rest_seconds: 0, notes: "30 sec each hand" },
          // Spine & core mobility
          { exercise_name: "Spinal Twist", sort_order: 15, sets: 2, min_reps: 45, max_reps: 45, is_backoff_set: false, rest_seconds: 0, notes: "45 sec each side — lying twist, let gravity do the work" },
          { exercise_name: "Cobra Stretch", sort_order: 16, sets: 1, min_reps: 30, max_reps: 30, is_backoff_set: false, rest_seconds: 0, notes: "30 sec — open the front body" },
          { exercise_name: "Child's Pose", sort_order: 17, sets: 1, min_reps: 60, max_reps: 60, is_backoff_set: false, rest_seconds: 0, notes: "60 sec — breathe deep, relax everything" },
        ],
      },
    ],
  };
}
