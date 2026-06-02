import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkoutClient } from "./workout-client";
import {
  isDemoMode,
  demoProgram,
  demoTemplates,
  demoTemplateExercises,
  demoExercises,
  demoSessions,
} from "@/lib/demo-data";

export default async function WorkoutPage() {
  if (isDemoMode()) {
    // Determine next day from demo sessions
    const completedSessions = demoSessions.filter((s) => s.completed_at);
    let nextDayNumber = 1;
    if (completedSessions.length > 0) {
      const lastSession = completedSessions[completedSessions.length - 1];
      const lastTemplate = demoTemplates.find(
        (t) => t.id === lastSession.template_id
      );
      if (lastTemplate) {
        nextDayNumber =
          lastTemplate.day_number >= demoTemplates.length
            ? 1
            : lastTemplate.day_number + 1;
      }
    }

    // Filter exercises to only those used in templates
    const exerciseIds = new Set(
      demoTemplateExercises.map((te) => te.exercise_id)
    );
    const exercises = demoExercises.filter((e) => exerciseIds.has(e.id));

    return (
      <WorkoutClient
        userId="demo-user"
        templates={demoTemplates}
        templateExercises={demoTemplateExercises}
        exercises={exercises}
        nextDayNumber={nextDayNumber}
        demoMode
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get program + last session in parallel
  const [programRes, lastSessionRes] = await Promise.all([
    supabase
      .from("programs")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single(),
    supabase
      .from("workout_sessions")
      .select("template_id")
      .eq("user_id", user.id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  const program = programRes.data;
  const lastSession = lastSessionRes.data;

  if (!program) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-foreground-muted">No active program found.</p>
        <p className="text-sm text-foreground-muted mt-2">
          Set up a program first to start working out.
        </p>
      </div>
    );
  }

  // Get templates + exercises in parallel
  const { data: templates } = await supabase
    .from("workout_templates")
    .select("*")
    .eq("program_id", program.id)
    .order("day_number", { ascending: true });

  if (!templates || templates.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-foreground-muted">
          No workout templates in this program.
        </p>
      </div>
    );
  }

  const templateIds = templates.map((t) => t.id);
  const [templateExercisesRes, exercisesRes] = await Promise.all([
    supabase
      .from("template_exercises")
      .select("*")
      .in("template_id", templateIds)
      .order("sort_order", { ascending: true }),
    supabase
      .from("exercise_library")
      .select("*")
      .eq("user_id", user.id),
  ]);

  const templateExercises = templateExercisesRes.data;
  const exercises = exercisesRes.data;

  let nextDayNumber = 1;
  if (lastSession) {
    const lastTemplate = templates.find(
      (t) => t.id === lastSession.template_id
    );
    if (lastTemplate) {
      nextDayNumber =
        lastTemplate.day_number >= templates.length
          ? 1
          : lastTemplate.day_number + 1;
    }
  }

  return (
    <WorkoutClient
      userId={user.id}
      templates={templates}
      templateExercises={templateExercises || []}
      exercises={exercises || []}
      nextDayNumber={nextDayNumber}
    />
  );
}
