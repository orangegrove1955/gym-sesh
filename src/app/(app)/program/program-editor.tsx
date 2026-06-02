"use client";

import { useState, useCallback, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Exercise,
  Program,
  WorkoutTemplate,
  TemplateExercise,
  MuscleGroup,
  Equipment,
} from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Search,
  X,
  Pencil,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgramEditorProps {
  program: Program | null;
  templates: WorkoutTemplate[];
  templateExercises: TemplateExercise[];
  exercises: Exercise[];
  userId: string;
  demoMode?: boolean;
}

export function ProgramEditor({
  program: initialProgram,
  templates: initialTemplates,
  templateExercises: initialTemplateExercises,
  exercises: initialExercises,
  userId,
  demoMode = false,
}: ProgramEditorProps) {
  const supabase = demoMode ? null : createClient();
  const [isPending, startTransition] = useTransition();

  const [program, setProgram] = useState(initialProgram);
  const [templates, setTemplates] = useState(initialTemplates);
  const [templateExercises, setTemplateExercises] = useState(
    initialTemplateExercises
  );
  const [exercises, setExercises] = useState(initialExercises);

  const [activeDay, setActiveDay] = useState(
    templates[0]?.id ?? ""
  );
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [editingProgramName, setEditingProgramName] = useState(false);
  const [programName, setProgramName] = useState(program?.name ?? "My Program");

  // Exercise picker dialog
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerFilter, setPickerFilter] = useState<MuscleGroup | "all">("all");

  // Create exercise dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: "",
    muscle_group: "chest" as MuscleGroup,
    equipment: "barbell" as Equipment,
    is_compound: false,
    weight_increment: 2.5,
  });

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Get exercises for the active template
  const activeTemplate = templates.find((t) => t.id === activeDay);
  const activeExercises = templateExercises
    .filter((te) => te.template_id === activeDay)
    .sort((a, b) => a.sort_order - b.sort_order);

  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

  // --- Program name ---
  const saveProgramName = useCallback(async () => {
    if (!program) return;
    setEditingProgramName(false);
    setProgram({ ...program, name: programName });
    if (!demoMode) {
      await supabase!
        .from("programs")
        .update({ name: programName })
        .eq("id", program.id);
    }
  }, [program, programName, supabase, demoMode]);

  // --- Add day ---
  let demoCounter = 0;
  const addDay = useCallback(async () => {
    if (!program) return;
    const nextDay = templates.length + 1;
    if (demoMode) {
      demoCounter++;
      const data = {
        id: `demo-new-template-${demoCounter}-${Date.now()}`,
        program_id: program.id,
        day_number: nextDay,
        name: `Day ${nextDay}`,
        focus_areas: [] as string[],
        created_at: new Date().toISOString(),
      };
      setTemplates((prev) => [...prev, data]);
      setActiveDay(data.id);
    } else {
      const { data } = await supabase!
        .from("workout_templates")
        .insert({
          program_id: program.id,
          day_number: nextDay,
          name: `Day ${nextDay}`,
          focus_areas: [],
        })
        .select()
        .single();
      if (data) {
        setTemplates((prev) => [...prev, data]);
        setActiveDay(data.id);
      }
    }
  }, [program, templates.length, supabase, demoMode]);

  // --- Add exercise to template ---
  const addExercise = useCallback(
    async (exerciseId: string) => {
      if (!activeDay) return;
      const nextOrder = activeExercises.length;
      if (demoMode) {
        const data = {
          id: `demo-new-te-${Date.now()}-${nextOrder}`,
          template_id: activeDay,
          exercise_id: exerciseId,
          sort_order: nextOrder,
          sets: 3,
          min_reps: 8,
          max_reps: 12,
          is_backoff_set: false,
          rest_seconds: 120,
          notes: null,
          created_at: new Date().toISOString(),
        };
        setTemplateExercises((prev) => [...prev, data]);
      } else {
        const { data } = await supabase!
          .from("template_exercises")
          .insert({
            template_id: activeDay,
            exercise_id: exerciseId,
            sort_order: nextOrder,
            sets: 3,
            min_reps: 8,
            max_reps: 12,
            is_backoff_set: false,
            rest_seconds: 120,
          })
          .select()
          .single();
        if (data) {
          setTemplateExercises((prev) => [...prev, data]);
        }
      }
      setPickerOpen(false);
    },
    [activeDay, activeExercises.length, supabase, demoMode]
  );

  // --- Update template exercise ---
  const updateTemplateExercise = useCallback(
    async (id: string, updates: Partial<TemplateExercise>) => {
      setTemplateExercises((prev) =>
        prev.map((te) => (te.id === id ? { ...te, ...updates } : te))
      );
      if (!demoMode) {
        await supabase!.from("template_exercises").update(updates).eq("id", id);
      }
    },
    [supabase, demoMode]
  );

  // --- Delete exercise ---
  const deleteExercise = useCallback(
    async (id: string) => {
      setTemplateExercises((prev) => prev.filter((te) => te.id !== id));
      setDeleteTarget(null);
      if (!demoMode) {
        await supabase!.from("template_exercises").delete().eq("id", id);
      }
    },
    [supabase, demoMode]
  );

  // --- Reorder ---
  const moveExercise = useCallback(
    async (id: string, direction: "up" | "down") => {
      const idx = activeExercises.findIndex((e) => e.id === id);
      if (
        (direction === "up" && idx === 0) ||
        (direction === "down" && idx === activeExercises.length - 1)
      )
        return;

      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      const a = activeExercises[idx];
      const b = activeExercises[swapIdx];

      setTemplateExercises((prev) =>
        prev.map((te) => {
          if (te.id === a.id) return { ...te, sort_order: b.sort_order };
          if (te.id === b.id) return { ...te, sort_order: a.sort_order };
          return te;
        })
      );

      if (!demoMode) {
        await Promise.all([
          supabase!
            .from("template_exercises")
            .update({ sort_order: b.sort_order })
            .eq("id", a.id),
          supabase!
            .from("template_exercises")
            .update({ sort_order: a.sort_order })
            .eq("id", b.id),
        ]);
      }
    },
    [activeExercises, supabase, demoMode]
  );

  // --- Create new exercise in library ---
  const createExercise = useCallback(async () => {
    if (!newExercise.name.trim()) return;
    if (demoMode) {
      const data = {
        id: `demo-new-exercise-${Date.now()}`,
        user_id: userId,
        name: newExercise.name,
        muscle_group: newExercise.muscle_group,
        equipment: newExercise.equipment,
        is_compound: newExercise.is_compound,
        weight_increment: newExercise.weight_increment,
        created_at: new Date().toISOString(),
      };
      setExercises((prev) => [...prev, data]);
      setCreateOpen(false);
      setNewExercise({
        name: "",
        muscle_group: "chest",
        equipment: "barbell",
        is_compound: false,
        weight_increment: 2.5,
      });
      addExercise(data.id);
    } else {
      const { data } = await supabase!
        .from("exercise_library")
        .insert({
          ...newExercise,
          user_id: userId,
        })
        .select()
        .single();
      if (data) {
        setExercises((prev) => [...prev, data]);
        setCreateOpen(false);
        setNewExercise({
          name: "",
          muscle_group: "chest",
          equipment: "barbell",
          is_compound: false,
          weight_increment: 2.5,
        });
        addExercise(data.id);
      }
    }
  }, [newExercise, userId, supabase, addExercise, demoMode]);

  // Exercises already in this day
  const exerciseIdsInDay = new Set(activeExercises.map((te) => te.exercise_id));

  // Filtered exercises for picker
  const filteredExercises = exercises.filter((e) => {
    if (pickerFilter !== "all" && e.muscle_group !== pickerFilter) return false;
    if (
      pickerSearch &&
      !e.name.toLowerCase().includes(pickerSearch.toLowerCase())
    )
      return false;
    return true;
  });

  // Group by muscle group
  const groupedExercises = filteredExercises.reduce<Record<string, Exercise[]>>(
    (acc, e) => {
      (acc[e.muscle_group] ??= []).push(e);
      return acc;
    },
    {}
  );

  if (!program) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-foreground-muted">
          No active program found. Create one to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Program name */}
      <div className="flex items-center gap-2">
        {editingProgramName ? (
          <>
            <Input
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="text-lg font-semibold max-w-xs"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") saveProgramName();
              }}
            />
            <Button size="sm" variant="ghost" onClick={saveProgramName}>
              <Check className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">{program.name}</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingProgramName(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>

      {/* Day tabs */}
      <Tabs value={activeDay} onValueChange={setActiveDay}>
        <div className="flex items-center gap-2">
          <TabsList className="flex-1 overflow-x-auto scrollbar-hide">
            {templates.map((t, i) => (
              <TabsTrigger key={t.id} value={t.id} className="shrink-0">
                Day {t.day_number}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button size="sm" variant="outline" onClick={addDay}>
            <Plus className="h-4 w-4 mr-1" />
            Day
          </Button>
        </div>

        {templates.map((template) => (
          <TabsContent key={template.id} value={template.id} className="mt-4">
            <h3 className="text-sm font-medium text-foreground-muted mb-3">{template.name}</h3>
            <div className="space-y-2">
              {activeExercises.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-foreground-muted text-sm">
                    No exercises yet. Add some to get started.
                  </CardContent>
                </Card>
              )}

              {activeExercises.map((te, idx) => {
                const exercise = exerciseMap.get(te.exercise_id);
                if (!exercise) return null;
                const isExpanded = expandedExercise === te.id;

                return (
                  <Card
                    key={te.id}
                    className={cn(
                      "transition-all",
                      isExpanded && "ring-1 ring-accent/50"
                    )}
                  >
                    <CardContent className="p-0">
                      {/* Exercise row */}
                      <div
                        className="flex items-center gap-2 p-3 cursor-pointer"
                        onClick={() =>
                          setExpandedExercise(isExpanded ? null : te.id)
                        }
                      >
                        <GripVertical className="h-4 w-4 text-foreground-muted shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {exercise.name}
                            </span>
                            {te.is_backoff_set && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                              >
                                Backoff
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-foreground-muted">
                            {te.sets} sets x {te.min_reps}-{te.max_reps} reps
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveExercise(te.id, "up");
                            }}
                            disabled={idx === 0}
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveExercise(te.id, "down");
                            }}
                            disabled={idx === activeExercises.length - 1}
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 text-foreground-muted transition-transform",
                              isExpanded && "rotate-90"
                            )}
                          />
                        </div>
                      </div>

                      {/* Expanded edit form */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-0 border-t border-border">
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div>
                              <label className="text-xs text-foreground-muted mb-1 block">
                                Sets
                              </label>
                              <Input
                                type="number"
                                min={1}
                                max={10}
                                value={te.sets}
                                onChange={(e) =>
                                  updateTemplateExercise(te.id, {
                                    sets: Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs text-foreground-muted mb-1 block">
                                Rest (sec)
                              </label>
                              <Input
                                type="number"
                                min={30}
                                max={600}
                                step={15}
                                value={te.rest_seconds}
                                onChange={(e) =>
                                  updateTemplateExercise(te.id, {
                                    rest_seconds: Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs text-foreground-muted mb-1 block">
                                Min Reps
                              </label>
                              <Input
                                type="number"
                                min={1}
                                max={30}
                                value={te.min_reps}
                                onChange={(e) =>
                                  updateTemplateExercise(te.id, {
                                    min_reps: Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs text-foreground-muted mb-1 block">
                                Max Reps
                              </label>
                              <Input
                                type="number"
                                min={1}
                                max={30}
                                value={te.max_reps}
                                onChange={(e) =>
                                  updateTemplateExercise(te.id, {
                                    max_reps: Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={te.is_backoff_set}
                                onChange={(e) =>
                                  updateTemplateExercise(te.id, {
                                    is_backoff_set: e.target.checked,
                                  })
                                }
                                className="rounded border-border"
                              />
                              Backoff set
                            </label>
                          </div>
                          <div className="flex justify-end mt-3">
                            {deleteTarget === te.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-foreground-muted">
                                  Remove?
                                </span>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteExercise(te.id)}
                                >
                                  Yes
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDeleteTarget(null)}
                                >
                                  No
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteTarget(te.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Add exercise button */}
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() => {
                  setPickerSearch("");
                  setPickerFilter("all");
                  setPickerOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Exercise picker dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                placeholder="Search exercises..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={pickerFilter}
              onChange={(e) =>
                setPickerFilter(e.target.value as MuscleGroup | "all")
              }
              className="w-[140px]"
            >
              <SelectOption value="all">All muscles</SelectOption>
              {(
                [
                  "chest",
                  "back",
                  "shoulders",
                  "biceps",
                  "triceps",
                  "quads",
                  "hamstrings",
                  "glutes",
                  "calves",
                  "abs",
                  "forearms",
                ] as MuscleGroup[]
              ).map((mg) => (
                <SelectOption key={mg} value={mg}>
                  {mg.charAt(0).toUpperCase() + mg.slice(1)}
                </SelectOption>
              ))}
            </Select>
          </div>

          <div className="overflow-y-auto flex-1 -mx-6 px-6 space-y-4">
            {Object.entries(groupedExercises).map(([group, exs]) => (
              <div key={group}>
                <h4 className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2">
                  {group}
                </h4>
                <div className="space-y-1">
                  {exs.map((ex) => {
                    const inDay = exerciseIdsInDay.has(ex.id);
                    return (
                      <button
                        key={ex.id}
                        disabled={inDay}
                        onClick={() => addExercise(ex.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between cursor-pointer",
                          inDay
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-background-tertiary"
                        )}
                      >
                        <span>{ex.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {ex.equipment}
                          </Badge>
                          {ex.is_compound && (
                            <Badge variant="secondary" className="text-[10px]">
                              compound
                            </Badge>
                          )}
                          {inDay && (
                            <Check className="h-3.5 w-3.5 text-foreground-muted" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredExercises.length === 0 && (
              <div className="text-center text-foreground-muted text-sm py-8">
                No exercises found
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPickerOpen(false);
                setCreateOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Exercise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create exercise dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Exercise</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-foreground-muted mb-1 block">
                Name
              </label>
              <Input
                value={newExercise.name}
                onChange={(e) =>
                  setNewExercise({ ...newExercise, name: e.target.value })
                }
                placeholder="Exercise name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-foreground-muted mb-1 block">
                  Muscle Group
                </label>
                <Select
                  value={newExercise.muscle_group}
                  onChange={(e) =>
                    setNewExercise({
                      ...newExercise,
                      muscle_group: e.target.value as MuscleGroup,
                    })
                  }
                >
                  {(
                    [
                      "chest",
                      "back",
                      "shoulders",
                      "biceps",
                      "triceps",
                      "quads",
                      "hamstrings",
                      "glutes",
                      "calves",
                      "abs",
                      "forearms",
                    ] as MuscleGroup[]
                  ).map((mg) => (
                    <SelectOption key={mg} value={mg}>
                      {mg.charAt(0).toUpperCase() + mg.slice(1)}
                    </SelectOption>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-xs text-foreground-muted mb-1 block">
                  Equipment
                </label>
                <Select
                  value={newExercise.equipment}
                  onChange={(e) =>
                    setNewExercise({
                      ...newExercise,
                      equipment: e.target.value as Equipment,
                    })
                  }
                >
                  {(
                    [
                      "barbell",
                      "dumbbell",
                      "cable",
                      "machine",
                      "bodyweight",
                    ] as Equipment[]
                  ).map((eq) => (
                    <SelectOption key={eq} value={eq}>
                      {eq.charAt(0).toUpperCase() + eq.slice(1)}
                    </SelectOption>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-foreground-muted mb-1 block">
                  Weight Increment (kg)
                </label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={newExercise.weight_increment}
                  onChange={(e) =>
                    setNewExercise({
                      ...newExercise,
                      weight_increment: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newExercise.is_compound}
                    onChange={(e) =>
                      setNewExercise({
                        ...newExercise,
                        is_compound: e.target.checked,
                      })
                    }
                    className="rounded border-border"
                  />
                  Compound movement
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createExercise}
              disabled={!newExercise.name.trim()}
            >
              Create & Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
