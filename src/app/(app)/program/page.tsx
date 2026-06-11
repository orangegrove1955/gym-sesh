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

  const loadData = useCallback(async () => {
    const res = await fetch("/api/program");
    const json = await res.json();
    setData(json);
    return json;
  }, []);

  const loadAllPrograms = useCallback(async () => {
    const supabase = createClient();
    const { data: programs } = await supabase
      .from("programs")
      .select("*")
      .order("created_at", { ascending: true });
    if (programs) setAllPrograms(programs as Program[]);
  }, []);

  useEffect(() => {
    loadData();
    loadAllPrograms();
  }, [loadData, loadAllPrograms]);

  const switchProgram = useCallback(
    async (programId: string) => {
      setSwitching(true);
      try {
        const supabase = createClient();
        const userId = data?.userId;
        if (!userId) return;
        // Deactivate all, then activate selected
        await supabase
          .from("programs")
          .update({ is_active: false })
          .eq("user_id", userId);
        await supabase
          .from("programs")
          .update({ is_active: true })
          .eq("id", programId);
        // Reload both program data and programs list
        await Promise.all([loadData(), loadAllPrograms()]);
      } finally {
        setSwitching(false);
      }
    },
    [data?.userId, loadData, loadAllPrograms],
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
