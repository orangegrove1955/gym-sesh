"use client";

import { useState, useEffect } from "react";
import { WorkoutClient } from "./workout-client";
import WorkoutLoading from "./loading";
import type {
  WorkoutTemplate,
  TemplateExercise,
  Exercise,
} from "@/types/database";

interface WorkoutData {
  userId: string;
  templates: WorkoutTemplate[];
  templateExercises: TemplateExercise[];
  exercises: Exercise[];
  nextDayNumber: number;
  error?: string;
}

export default function WorkoutPage() {
  const [data, setData] = useState<WorkoutData | null>(null);

  useEffect(() => {
    fetch("/api/workout")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <WorkoutLoading />;

  if (data.error === "no_program") {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-foreground-muted">No active program found.</p>
        <p className="text-sm text-foreground-muted mt-2">
          Set up a program first to start working out.
        </p>
      </div>
    );
  }

  if (!data.templates || data.templates.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-foreground-muted">
          No workout templates in this program.
        </p>
      </div>
    );
  }

  return (
    <WorkoutClient
      userId={data.userId}
      templates={data.templates}
      templateExercises={data.templateExercises}
      exercises={data.exercises}
      nextDayNumber={data.nextDayNumber}
    />
  );
}
