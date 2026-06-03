import { DEFAULT_EXERCISES } from "@/lib/exercises";
import { getDefaultProgramData } from "@/lib/default-program";
import type {
  Exercise,
  Program,
  WorkoutTemplate,
  TemplateExercise,
  WorkoutSession,
  SetLog,
  UserProfile,
  Difficulty,
} from "@/types/database";

// --- Demo mode check ---
export function isDemoMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}

// --- User & Profile ---
export const demoUser = { id: "demo-user", email: "matt@demo.com" };

export const demoProfile: UserProfile = {
  id: "demo-user",
  display_name: "Matt",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// --- Exercises ---
const now = new Date();
export const demoExercises: Exercise[] = DEFAULT_EXERCISES.map((e, i) => ({
  id: `demo-exercise-${i + 1}`,
  user_id: null,
  name: e.name,
  muscle_group: e.muscle_group,
  equipment: e.equipment,
  is_compound: e.is_compound ?? false,
  weight_increment: e.weight_increment ?? 2.5,
  created_at: now.toISOString(),
}));

function getExerciseByName(name: string): Exercise {
  const ex = demoExercises.find((e) => e.name === name);
  if (!ex) throw new Error(`Demo exercise not found: ${name}`);
  return ex;
}

export const getDemoExerciseByName = getExerciseByName;

// --- Program ---
const programData = getDefaultProgramData();

export const demoProgram: Program = {
  id: "demo-program-1",
  user_id: "demo-user",
  name: programData.program.name,
  description: programData.program.description,
  is_active: true,
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
};

// --- Templates & Template Exercises ---
export const demoTemplates: WorkoutTemplate[] = [];
export const demoTemplateExercises: TemplateExercise[] = [];

let teCounter = 0;
for (const day of programData.days) {
  const templateId = `demo-template-${day.day_number}`;
  demoTemplates.push({
    id: templateId,
    program_id: demoProgram.id,
    day_number: day.day_number,
    name: day.name,
    focus_areas: day.focus_areas,
    created_at: now.toISOString(),
  });

  for (const ex of day.exercises) {
    teCounter++;
    const exercise = getExerciseByName(ex.exercise_name);
    demoTemplateExercises.push({
      id: `demo-te-${teCounter}`,
      template_id: templateId,
      exercise_id: exercise.id,
      sort_order: ex.sort_order,
      sets: ex.sets,
      min_reps: ex.min_reps,
      max_reps: ex.max_reps,
      is_backoff_set: ex.is_backoff_set,
      rest_seconds: ex.rest_seconds,
      notes: ex.notes ?? null,
      superset_group: null,
      created_at: now.toISOString(),
    });
  }
}

// --- Helper ---
export function getDemoTemplateExercisesForTemplate(
  templateId: string
): TemplateExercise[] {
  return demoTemplateExercises
    .filter((te) => te.template_id === templateId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

// --- Base weights for exercises (kg) ---
const BASE_WEIGHTS: Record<string, number> = {
  "Bench Press": 60,
  "Incline Bench Press": 50,
  "Cable Fly": 15,
  "Weighted Pullup": 10,
  "Lat Pulldown": 55,
  "Barbell Row": 60,
  "Seated Cable Row": 50,
  "Overhead Press": 40,
  "Lateral Raise": 10,
  "Bent Over Rear Delt Fly": 8,
  "Preacher Curl": 12,
  "Hammer Curl": 14,
  "Strict Curl": 30,
  "Tricep Pushdown": 25,
  "Skullcrusher": 25,
  Squat: 80,
  "Leg Press": 120,
  "Lying Leg Curl": 35,
  "Romanian Deadlift": 70,
  "Hip Thrust": 80,
  "Glute Kickback": 20,
  "Calf Raise": 60,
  "Cable Crunch": 30,
  "Hanging Leg Raise": 0,
  "Decline Crunch": 0,
};

// --- Sessions & Set Logs ---
export const demoSessions: WorkoutSession[] = [];
export const demoSetLogs: SetLog[] = [];

let sessionCounter = 0;
let setLogCounter = 0;

// Generate 15 sessions over past 30 days
const sessionDates: Date[] = [];
for (let i = 0; i < 15; i++) {
  // Spread over ~30 days, roughly every 2 days
  const daysAgo = 30 - Math.floor((i / 14) * 28);
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(7 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);
  sessionDates.push(d);
}

const difficulties: Difficulty[] = ["easy", "challenging", "hard"];

for (let i = 0; i < 15; i++) {
  sessionCounter++;
  const dayIndex = i % 3; // Cycle through 3 templates
  const template = demoTemplates[dayIndex];
  const startDate = sessionDates[i];
  const endDate = new Date(startDate.getTime() + (50 + Math.random() * 30) * 60000); // 50-80 min

  const sessionId = `demo-session-${sessionCounter}`;
  demoSessions.push({
    id: sessionId,
    user_id: "demo-user",
    template_id: template.id,
    started_at: startDate.toISOString(),
    completed_at: endDate.toISOString(),
    notes: null,
    created_at: startDate.toISOString(),
  });

  // Get template exercises for this day
  const tes = getDemoTemplateExercisesForTemplate(template.id);

  // Progress factor: later sessions = slightly heavier
  const progressFactor = i / 14; // 0 to 1

  for (const te of tes) {
    const exercise = demoExercises.find((e) => e.id === te.exercise_id)!;
    const baseWeight = BASE_WEIGHTS[exercise.name] ?? 20;
    // Add 0 to ~5kg progression over the 15 sessions
    const progression = Math.floor(progressFactor * 2) * exercise.weight_increment;
    const weight = baseWeight + progression;

    const diff = difficulties[Math.floor(Math.random() * 3)];
    // Bias toward "challenging"
    const actualDiff: Difficulty =
      Math.random() < 0.5 ? "challenging" : Math.random() < 0.5 ? "easy" : "hard";

    for (let s = 1; s <= te.sets; s++) {
      setLogCounter++;
      const reps =
        te.min_reps + Math.floor(Math.random() * (te.max_reps - te.min_reps + 1));
      const completedAt = new Date(
        startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
      );

      demoSetLogs.push({
        id: `demo-setlog-${setLogCounter}`,
        session_id: sessionId,
        exercise_id: te.exercise_id,
        template_exercise_id: te.id,
        set_number: s,
        prescribed_weight: weight,
        prescribed_reps: reps,
        actual_weight: weight,
        actual_reps: reps,
        difficulty: actualDiff,
        completed: true,
        completed_at: completedAt.toISOString(),
        is_banded: false,
        went_to_failure: false,
        equipment_used: null,
        created_at: startDate.toISOString(),
      });
    }
  }
}

// Sort sessions by date ascending
demoSessions.sort(
  (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
);

// --- Helpers ---
export function getDemoSetLogsForSession(sessionId: string): SetLog[] {
  return demoSetLogs.filter((sl) => sl.session_id === sessionId);
}

export function getDemoSetLogsForExercise(exerciseId: string): SetLog[] {
  return demoSetLogs
    .filter((sl) => sl.exercise_id === exerciseId && sl.completed)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
}
