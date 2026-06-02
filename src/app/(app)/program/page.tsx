"use client";

import { useState, useEffect } from "react";
import { ProgramEditor } from "./program-editor";
import ProgramLoading from "./loading";
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

  useEffect(() => {
    fetch("/api/program")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <ProgramLoading />;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Program</h1>
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
