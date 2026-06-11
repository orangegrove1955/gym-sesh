"use client";

import { useState, useEffect, useCallback } from "react";
import { ProgramEditor } from "./program-editor";
import ProgramLoading from "./loading";
import { createClient } from "@/lib/supabase/client";
import type {
  Program,
  WorkoutTemplate,
  TemplateExercise,
  Exercise,
} from "@/types/database";

interface ProgramData {
  program: Program | null;
  templates: WorkoutTemplate[];
  templateExercises: TemplateExercise[];
  exercises: Exercise[];
  userId: string;
}

export default function ProgramPage() {
  const [data, setData] = useState<ProgramData | null>(null);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [switching, setSwitching] = useState(false);

  const loadData = useCallback(() => {
    fetch("/api/program")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadData();
    // Also fetch all programs for the switcher
    const supabase = createClient();
    supabase
      .from("programs")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data: programs }) => {
        if (programs) setAllPrograms(programs as Program[]);
      });
  }, [loadData]);

  const switchProgram = useCallback(
    async (programId: string) => {
      setSwitching(true);
      const supabase = createClient();
      // Deactivate all programs
      const userId = data?.userId;
      if (!userId) return;
      await supabase
        .from("programs")
        .update({ is_active: false })
        .eq("user_id", userId);
      // Activate selected
      await supabase
        .from("programs")
        .update({ is_active: true })
        .eq("id", programId);
      // Update local state
      setAllPrograms((prev) =>
        prev.map((p) => ({ ...p, is_active: p.id === programId })),
      );
      // Reload program data
      loadData();
      setSwitching(false);
    },
    [data?.userId, loadData],
  );

  if (!data) return <ProgramLoading />;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Program</h1>
        {allPrograms.length > 1 && (
          <select
            value={data.program?.id ?? ""}
            onChange={(e) => switchProgram(e.target.value)}
            disabled={switching}
            className="text-sm rounded-lg border border-border bg-background-secondary px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {allPrograms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <ProgramEditor
        program={data.program}
        templates={data.templates}
        templateExercises={data.templateExercises}
        exercises={data.exercises}
        userId={data.userId}
      />
    </div>
  );
}
