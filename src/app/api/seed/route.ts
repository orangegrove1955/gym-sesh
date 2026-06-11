import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_EXERCISES } from "@/lib/exercises";
import { getDefaultProgramData } from "@/lib/default-program";
import { getPPLProgramData } from "@/lib/ppl-program";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for force reseed via query param
    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "true";

    // Check if user already has programs
    const { data: existingPrograms } = await supabase
      .from("programs")
      .select("id")
      .eq("user_id", user.id);

    if (existingPrograms && existingPrograms.length > 0) {
      if (!force) {
        return NextResponse.json({ message: "Programs already exist. Use ?force=true to reseed." });
      }
      // Delete all existing programs (cascades to templates, template_exercises)
      for (const p of existingPrograms) {
        await supabase.from("programs").delete().eq("id", p.id);
      }
      // Delete existing exercises owned by this user
      await supabase.from("exercise_library").delete().eq("user_id", user.id);
    }

    // Insert exercises owned by this user
    const exercisesToInsert = DEFAULT_EXERCISES.map((e) => ({
      ...e,
      user_id: user.id,
    }));

    const { error: exerciseError } = await supabase
      .from("exercise_library")
      .upsert(exercisesToInsert, { onConflict: "name,user_id", ignoreDuplicates: true });

    if (exerciseError) {
      return NextResponse.json({ error: "Failed to seed exercises", details: exerciseError }, { status: 500 });
    }

    // Fetch all exercises to get their IDs
    const { data: exercises, error: fetchError } = await supabase
      .from("exercise_library")
      .select("id, name")
      .eq("user_id", user.id);

    if (fetchError || !exercises) {
      return NextResponse.json({ error: "Failed to fetch exercises", details: fetchError }, { status: 500 });
    }

    const exerciseMap = new Map(exercises.map((e) => [e.name, e.id]));

    // Seed all programs
    const allPrograms = [getDefaultProgramData(), getPPLProgramData()];

    for (let pIdx = 0; pIdx < allPrograms.length; pIdx++) {
      const programData = allPrograms[pIdx];

      // First program is active by default
      const { data: program, error: programError } = await supabase
        .from("programs")
        .insert({
          user_id: user.id,
          name: programData.program.name,
          description: programData.program.description,
          is_active: pIdx === 0,
        })
        .select("id")
        .single();

      if (programError || !program) {
        return NextResponse.json({ error: `Failed to create program: ${programData.program.name}`, details: programError }, { status: 500 });
      }

      for (const day of programData.days) {
        const { data: template, error: templateError } = await supabase
          .from("workout_templates")
          .insert({
            program_id: program.id,
            day_number: day.day_number,
            name: day.name,
            focus_areas: day.focus_areas,
          })
          .select("id")
          .single();

        if (templateError || !template) {
          return NextResponse.json({ error: `Failed to create template for day ${day.day_number}`, details: templateError }, { status: 500 });
        }

        const templateExercises = day.exercises.map((ex) => {
          const exerciseId = exerciseMap.get(ex.exercise_name);
          if (!exerciseId) {
            throw new Error(`Exercise not found: ${ex.exercise_name}`);
          }
          return {
            template_id: template.id,
            exercise_id: exerciseId,
            sort_order: ex.sort_order,
            sets: ex.sets,
            min_reps: ex.min_reps,
            max_reps: ex.max_reps,
            is_backoff_set: ex.is_backoff_set,
            rest_seconds: ex.rest_seconds,
            notes: ex.notes ?? null,
          };
        });

        const { error: teError } = await supabase
          .from("template_exercises")
          .insert(templateExercises);

        if (teError) {
          return NextResponse.json({ error: `Failed to create exercises for ${programData.program.name} day ${day.day_number}`, details: teError }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ message: `Seed completed — ${allPrograms.length} programs created` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
