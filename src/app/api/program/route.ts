import { NextResponse } from "next/server";
import { getCurrentUser, getServerClient } from "@/lib/supabase/auth";
import type { WorkoutTemplate, TemplateExercise } from "@/types/database";

export async function GET() {
  const [user, supabase] = await Promise.all([getCurrentUser(), getServerClient()]);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch program and exercises in parallel
  const [programRes, exercisesRes] = await Promise.all([
    supabase
      .from("programs")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single(),
    supabase
      .from("exercise_library")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order("muscle_group", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  const program = programRes.data;
  let templates: WorkoutTemplate[] = [];
  let templateExercises: TemplateExercise[] = [];

  if (program) {
    const { data: t } = await supabase
      .from("workout_templates")
      .select("*")
      .eq("program_id", program.id)
      .order("day_number", { ascending: true });
    templates = t ?? [];

    if (templates.length > 0) {
      const { data: te } = await supabase
        .from("template_exercises")
        .select("*")
        .in(
          "template_id",
          templates.map((tmpl) => tmpl.id)
        )
        .order("sort_order", { ascending: true });
      templateExercises = te ?? [];
    }
  }

  return NextResponse.json({
    program: program ?? null,
    templates,
    templateExercises,
    exercises: exercisesRes.data ?? [],
    userId: user.id,
  });
}
