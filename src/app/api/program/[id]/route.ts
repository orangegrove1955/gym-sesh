import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getServerClient } from "@/lib/supabase/auth";
import type { WorkoutTemplate, TemplateExercise } from "@/types/database";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [user, supabase] = await Promise.all([getSessionUser(), getServerClient()]);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [programRes, exercisesRes] = await Promise.all([
    supabase
      .from("programs")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("exercise_library")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order("muscle_group", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  const program = programRes.data;
  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  let templates: WorkoutTemplate[] = [];
  let templateExercises: TemplateExercise[] = [];

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
        templates.map((tmpl) => tmpl.id),
      )
      .order("sort_order", { ascending: true });
    templateExercises = te ?? [];
  }

  return NextResponse.json({
    program,
    templates,
    templateExercises,
    exercises: exercisesRes.data ?? [],
    userId: user.id,
  });
}
