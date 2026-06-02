import { NextResponse } from "next/server";
import { getCurrentUser, getServerClient } from "@/lib/supabase/auth";

export async function GET() {
  const [user, supabase] = await Promise.all([getCurrentUser(), getServerClient()]);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Need program first for template query
  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!program) {
    return NextResponse.json({ error: "no_program" });
  }

  // Fetch templates first (needed for templateIds)
  const { data: templates } = await supabase
    .from("workout_templates")
    .select("*")
    .eq("program_id", program.id)
    .order("day_number", { ascending: true });

  if (!templates || templates.length === 0) {
    return NextResponse.json({
      userId: user.id,
      templates: [],
      templateExercises: [],
      exercises: [],
      nextDayNumber: 1,
    });
  }

  const templateIds = templates.map((t) => t.id);

  const [templateExercisesRes, exercisesRes, lastSessionRes] =
    await Promise.all([
      supabase
        .from("template_exercises")
        .select("*")
        .in("template_id", templateIds)
        .order("sort_order", { ascending: true }),
      supabase.from("exercise_library").select("*").eq("user_id", user.id),
      supabase
        .from("workout_sessions")
        .select("template_id")
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

  let nextDayNumber = 1;
  const lastSession = lastSessionRes.data;
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

  return NextResponse.json({
    userId: user.id,
    templates,
    templateExercises: templateExercisesRes.data ?? [],
    exercises: exercisesRes.data ?? [],
    nextDayNumber,
  });
}
