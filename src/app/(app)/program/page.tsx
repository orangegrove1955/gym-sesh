"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

interface ProgramWithTemplates {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  workout_templates: {
    id: string;
    name: string;
    day_number: number;
    focus_areas: string[];
  }[];
}

export default function ProgramPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<ProgramWithTemplates[] | null>(null);

  useEffect(() => {
    fetch("/api/program")
      .then((r) => r.json())
      .then((data) => setPrograms(data.programs))
      .catch(console.error);
  }, []);

  if (!programs) {
    return (
      <div className="px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Programs</h1>
        <p className="text-foreground-muted text-sm mt-1">
          Tap a program to view and edit
        </p>
      </div>

      <div className="space-y-3">
        {programs.map((p) => (
          <Card
            key={p.id}
            className="cursor-pointer transition-all hover:border-accent active:scale-[0.98]"
            onClick={() => router.push(`/program/${p.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold truncate">{p.name}</h2>
                    {p.is_active && (
                      <Badge variant="success" className="shrink-0">Active</Badge>
                    )}
                  </div>
                  {p.description && (
                    <p className="text-xs text-foreground-muted line-clamp-2 mb-2">
                      {p.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {p.workout_templates
                      .sort((a, b) => a.day_number - b.day_number)
                      .map((t) => (
                        <Badge key={t.id} variant="secondary" className="text-xs">
                          {t.name}
                        </Badge>
                      ))}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-foreground-muted shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
