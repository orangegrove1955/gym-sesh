import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProgramEditor } from "./program-editor";
import type { WorkoutTemplate, TemplateExercise } from "@/types/database";
import {
  isDemoMode,
  demoProgram,
  demoTemplates,
  demoTemplateExercises,
  demoExercises,
} from "@/lib/demo-data";

export default async function ProgramPage() {
  if (isDemoMode()) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Program</h1>
        <ProgramEditor
          program={demoProgram}
          templates={demoTemplates}
          templateExercises={demoTemplateExercises}
          exercises={demoExercises}
          userId="demo-user"
          demoMode
        />
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch active program
  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  let templates: WorkoutTemplate[] = [];
  let templateExercises: TemplateExercise[] = [];

  if (program) {
    const { data: t } = await supabase
      .from("workout_templates")
      .select("*")
      .eq("program_id", program.id)
      .order("day_number", { ascending: true });
    templates = t ?? [];

    if (t && t.length > 0) {
      const { data: te } = await supabase
        .from("template_exercises")
        .select("*")
        .in(
          "template_id",
          t.map((tmpl) => tmpl.id)
        )
        .order("sort_order", { ascending: true });
      templateExercises = te ?? [];
    }
  }

  // Fetch all exercises
  const { data: exercises } = await supabase
    .from("exercise_library")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order("muscle_group", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Program</h1>
      <ProgramEditor
        program={program}
        templates={templates ?? []}
        templateExercises={templateExercises ?? []}
        exercises={exercises ?? []}
        userId={user.id}
      />
    </div>
  );
}
