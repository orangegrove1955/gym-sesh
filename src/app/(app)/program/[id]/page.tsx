"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProgramEditor } from "../program-editor";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check } from "lucide-react";
import type {
  Program,
  WorkoutTemplate,
  TemplateExercise,
  Exercise,
} from "@/types/database";

interface ProgramData {
  program: Program;
  templates: WorkoutTemplate[];
  templateExercises: TemplateExercise[];
  exercises: Exercise[];
  userId: string;
}

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ProgramData | null>(null);
  const [activating, setActivating] = useState(false);

  const loadData = useCallback(() => {
    fetch(`/api/program/${id}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setActive = useCallback(async () => {
    if (!data) return;
    setActivating(true);
    const supabase = createClient();
    // Deactivate all
    await supabase
      .from("programs")
      .update({ is_active: false })
      .eq("user_id", data.userId);
    // Activate this one
    await supabase
      .from("programs")
      .update({ is_active: true })
      .eq("id", id);
    // Update local state
    setData((prev) =>
      prev ? { ...prev, program: { ...prev.program, is_active: true } } : prev,
    );
    setActivating(false);
  }, [data, id]);

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/program")}
          className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          All Programs
        </button>
        {!data.program.is_active ? (
          <Button
            size="sm"
            onClick={setActive}
            disabled={activating}
          >
            <Check className="h-4 w-4 mr-1.5" />
            Set as Active
          </Button>
        ) : (
          <Badge variant="success">Active Program</Badge>
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
