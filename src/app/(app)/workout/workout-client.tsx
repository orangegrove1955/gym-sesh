"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculatePrescription } from "@/lib/progression";
import { getDemoSetLogsForExercise } from "@/lib/demo-data";
import {
  demoCreateSession,
  demoInsertSetLogs,
  demoUpdateSetLog,
  demoCompleteSession,
} from "@/lib/demo-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Play,
  Check,
  ChevronRight,
  Trophy,
  Clock,
  Dumbbell,
} from "lucide-react";
import type {
  WorkoutTemplate,
  TemplateExercise,
  Exercise,
  Difficulty,
} from "@/types/database";

type Phase = "select" | "active" | "complete";

interface SetState {
  id: string;
  exerciseId: string;
  templateExerciseId: string;
  setNumber: number;
  prescribedWeight: number;
  prescribedReps: number;
  actualWeight: string; // string for clean input handling
  actualReps: string;
  completed: boolean;
  difficulty: Difficulty | null;
}

interface Props {
  userId: string;
  templates: WorkoutTemplate[];
  templateExercises: TemplateExercise[];
  exercises: Exercise[];
  nextDayNumber: number;
  demoMode?: boolean;
}

// Session storage key for persisting active workout
const STORAGE_KEY = "gymsesh_active_workout";

interface PersistedState {
  phase: Phase;
  sessionId: string | null;
  sets: SetState[];
  currentExerciseIndex: number;
  startedAt: string; // ISO string
  selectedTemplateId: string | null;
}

function saveState(state: PersistedState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function loadState(): PersistedState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function WorkoutClient({
  userId,
  templates,
  templateExercises,
  exercises,
  nextDayNumber,
  demoMode = false,
}: Props) {
  const supabase = demoMode ? null : createClient();

  const [phase, setPhase] = useState<Phase>("select");
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkoutTemplate | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sets, setSets] = useState<SetState[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [restored, setRestored] = useState(false);

  const exerciseMap = useMemo(() => {
    const m = new Map<string, Exercise>();
    exercises.forEach((e) => m.set(e.id, e));
    return m;
  }, [exercises]);

  // Restore persisted state on mount
  useEffect(() => {
    const saved = loadState();
    if (saved && saved.phase === "active" && saved.sessionId) {
      setPhase(saved.phase);
      setSessionId(saved.sessionId);
      setSets(saved.sets);
      setCurrentExerciseIndex(saved.currentExerciseIndex);
      setStartedAt(new Date(saved.startedAt));
      const t = templates.find((t) => t.id === saved.selectedTemplateId);
      if (t) setSelectedTemplate(t);
    } else {
      // Default template selection
      const t = templates.find((t) => t.day_number === nextDayNumber);
      setSelectedTemplate(t || templates[0]);
    }
    setRestored(true);
  }, [templates, nextDayNumber]);

  // Persist state on changes
  useEffect(() => {
    if (!restored) return;
    if (phase === "active" && sessionId) {
      saveState({
        phase,
        sessionId,
        sets,
        currentExerciseIndex,
        startedAt: startedAt?.toISOString() || new Date().toISOString(),
        selectedTemplateId: selectedTemplate?.id || null,
      });
    } else if (phase === "complete" || phase === "select") {
      clearState();
    }
  }, [
    phase,
    sessionId,
    sets,
    currentExerciseIndex,
    startedAt,
    selectedTemplate,
    restored,
  ]);

  // Timer — calculate from startedAt, resilient to screen lock
  useEffect(() => {
    if (phase !== "active" || !startedAt) return;
    const update = () => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [phase, startedAt]);

  // Template exercises for selected template
  const currentTemplateExercises = useMemo(() => {
    if (!selectedTemplate) return [];
    return templateExercises
      .filter((te) => te.template_id === selectedTemplate.id)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [selectedTemplate, templateExercises]);

  // Group sets by exercise
  const exerciseGroups = useMemo(() => {
    const groups: Array<{
      templateExercise: TemplateExercise;
      exercise: Exercise;
      sets: SetState[];
    }> = [];
    for (const te of currentTemplateExercises) {
      const ex = exerciseMap.get(te.exercise_id);
      if (!ex) continue;
      groups.push({
        templateExercise: te,
        exercise: ex,
        sets: sets.filter((s) => s.templateExerciseId === te.id),
      });
    }
    return groups;
  }, [currentTemplateExercises, sets, exerciseMap]);

  const currentGroup = exerciseGroups[currentExerciseIndex];
  const nextGroup = exerciseGroups[currentExerciseIndex + 1] ?? null;

  const totalSets = sets.length;
  const completedSets = sets.filter((s) => s.completed).length;
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  const currentExerciseDone =
    currentGroup?.sets.every((s) => s.completed) ?? false;
  const currentExerciseDifficultySet =
    currentGroup?.sets[0]?.difficulty !== null &&
    currentGroup?.sets[0]?.difficulty !== undefined;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const startWorkout = useCallback(async () => {
    if (!selectedTemplate) return;
    setLoading(true);

    try {
      let sessionIdResult: string;

      if (demoMode) {
        const session = demoCreateSession({
          user_id: userId,
          template_id: selectedTemplate.id,
        });
        sessionIdResult = session.id;
      } else {
        const { data: session, error: sessionError } = await supabase!
          .from("workout_sessions")
          .insert({
            user_id: userId,
            template_id: selectedTemplate.id,
          })
          .select()
          .single();
        if (sessionError || !session) throw sessionError;
        sessionIdResult = session.id;
      }

      setSessionId(sessionIdResult);

      const exList = templateExercises
        .filter((te) => te.template_id === selectedTemplate.id)
        .sort((a, b) => a.sort_order - b.sort_order);

      const newSets: SetState[] = [];
      const setLogInserts: Array<{
        session_id: string;
        exercise_id: string;
        template_exercise_id: string;
        set_number: number;
        prescribed_weight: number;
        prescribed_reps: number;
      }> = [];

      // Fetch all exercise histories in parallel
      const uniqueExerciseIds = [
        ...new Set(exList.map((te) => te.exercise_id)),
      ];
      const historyMap = new Map<
        string,
        Array<{ weight: number; reps: number; difficulty: Difficulty }>
      >();

      if (demoMode) {
        for (const eid of uniqueExerciseIds) {
          const logs = getDemoSetLogsForExercise(eid);
          historyMap.set(
            eid,
            logs
              .filter(
                (h) =>
                  h.actual_weight != null &&
                  h.actual_reps != null &&
                  h.difficulty != null,
              )
              .slice(-5)
              .map((h) => ({
                weight: h.actual_weight!,
                reps: h.actual_reps!,
                difficulty: h.difficulty as Difficulty,
              })),
          );
        }
      } else {
        const historyResults = await Promise.all(
          uniqueExerciseIds.map((eid) =>
            supabase!
              .from("set_logs")
              .select("actual_weight, actual_reps, difficulty")
              .eq("exercise_id", eid)
              .eq("completed", true)
              .not("difficulty", "is", null)
              .not("actual_weight", "is", null)
              .not("actual_reps", "is", null)
              .order("created_at", { ascending: false })
              .limit(5),
          ),
        );
        uniqueExerciseIds.forEach((eid, i) => {
          historyMap.set(
            eid,
            (historyResults[i].data || [])
              .filter(
                (h) =>
                  h.actual_weight != null &&
                  h.actual_reps != null &&
                  h.difficulty != null,
              )
              .reverse()
              .map((h) => ({
                weight: h.actual_weight!,
                reps: h.actual_reps!,
                difficulty: h.difficulty as Difficulty,
              })),
          );
        });
      }

      for (const te of exList) {
        const ex = exerciseMap.get(te.exercise_id);
        if (!ex) continue;

        const exerciseHistory = historyMap.get(te.exercise_id) || [];
        const prescription = calculatePrescription(
          exerciseHistory,
          ex.weight_increment,
          te.min_reps,
          te.max_reps,
        );

        for (let s = 1; s <= te.sets; s++) {
          const setId = `${te.id}-${s}`;
          newSets.push({
            id: setId,
            exerciseId: te.exercise_id,
            templateExerciseId: te.id,
            setNumber: s,
            prescribedWeight: prescription.weight,
            prescribedReps: prescription.targetReps,
            actualWeight: String(prescription.weight),
            actualReps: String(prescription.targetReps),
            completed: false,
            difficulty: null,
          });
          setLogInserts.push({
            session_id: sessionIdResult,
            exercise_id: te.exercise_id,
            template_exercise_id: te.id,
            set_number: s,
            prescribed_weight: prescription.weight,
            prescribed_reps: prescription.targetReps,
          });
        }
      }

      if (demoMode) {
        const inserted = demoInsertSetLogs(setLogInserts);
        for (let i = 0; i < inserted.length; i++) {
          if (newSets[i]) newSets[i].id = inserted[i].id;
        }
      } else {
        const { data: insertedLogs } = await supabase!
          .from("set_logs")
          .insert(setLogInserts)
          .select();
        if (insertedLogs) {
          for (let i = 0; i < insertedLogs.length; i++) {
            if (newSets[i]) newSets[i].id = insertedLogs[i].id;
          }
        }
      }

      const now = new Date();
      setSets(newSets);
      setCurrentExerciseIndex(0);
      setStartedAt(now);
      setPhase("active");
    } catch (err) {
      console.error("Failed to start workout:", err);
    } finally {
      setLoading(false);
    }
  }, [
    selectedTemplate,
    supabase,
    userId,
    templateExercises,
    exerciseMap,
    demoMode,
  ]);

  const completeSet = useCallback(
    async (setId: string) => {
      const s = sets.find((s) => s.id === setId);
      if (!s || s.completed) return;

      const weight = parseFloat(s.actualWeight) || 0;
      const reps = parseInt(s.actualReps) || 0;

      if (demoMode) {
        demoUpdateSetLog(setId, {
          actual_weight: weight,
          actual_reps: reps,
          completed: true,
          completed_at: new Date().toISOString(),
        });
      } else {
        await supabase!
          .from("set_logs")
          .update({
            actual_weight: weight,
            actual_reps: reps,
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq("id", setId);
      }

      setSets((prev) =>
        prev.map((set) =>
          set.id === setId
            ? {
                ...set,
                completed: true,
                actualWeight: String(weight),
                actualReps: String(reps),
              }
            : set,
        ),
      );
    },
    [sets, supabase, demoMode],
  );

  const setDifficulty = useCallback(
    async (difficulty: Difficulty) => {
      if (!currentGroup) return;
      const setIds = currentGroup.sets.map((s) => s.id);

      if (demoMode) {
        for (const id of setIds) demoUpdateSetLog(id, { difficulty });
      } else {
        await supabase!
          .from("set_logs")
          .update({ difficulty })
          .in("id", setIds);
      }

      setSets((prev) =>
        prev.map((s) => (setIds.includes(s.id) ? { ...s, difficulty } : s)),
      );
    },
    [currentGroup, supabase, demoMode],
  );

  const nextExercise = useCallback(() => {
    if (currentExerciseIndex < exerciseGroups.length - 1) {
      setCurrentExerciseIndex((i) => i + 1);
    }
  }, [currentExerciseIndex, exerciseGroups.length]);

  const finishWorkout = useCallback(async () => {
    if (!sessionId) return;
    if (demoMode) {
      demoCompleteSession(sessionId);
    } else {
      await supabase!
        .from("workout_sessions")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", sessionId);
    }
    clearState();
    setPhase("complete");
  }, [sessionId, supabase, demoMode]);

  const updateSetValue = (
    setId: string,
    field: "actualWeight" | "actualReps",
    value: string,
  ) => {
    setSets((prev) =>
      prev.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
    );
  };

  // ---- SELECT PHASE ----
  if (phase === "select") {
    return (
      <div className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Next Workout</h1>
          <p className="text-foreground-muted text-sm mt-1">
            Select your workout for today
          </p>
        </div>

        <div className="space-y-3">
          {templates.map((t) => {
            const tExercises = templateExercises
              .filter((te) => te.template_id === t.id)
              .sort((a, b) => a.sort_order - b.sort_order);
            const isSelected = selectedTemplate?.id === t.id;
            const isNext = t.day_number === nextDayNumber;

            return (
              <Card
                key={t.id}
                className={cn(
                  "cursor-pointer transition-all",
                  isSelected && "ring-2 ring-accent border-accent",
                )}
                onClick={() => setSelectedTemplate(t)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{t.name}</h3>
                      {isNext && <Badge variant="secondary">Up Next</Badge>}
                    </div>
                    <span className="text-xs text-foreground-muted">
                      Day {t.day_number}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tExercises.map((te) => {
                      const ex = exerciseMap.get(te.exercise_id);
                      return ex ? (
                        <Badge key={te.id} variant="secondary">
                          {ex.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          size="lg"
          className="w-full h-14 text-lg gap-3"
          onClick={startWorkout}
          disabled={!selectedTemplate || loading}
        >
          {loading ? (
            "Preparing..."
          ) : (
            <>
              <Play className="h-6 w-6" />
              Start Workout
            </>
          )}
        </Button>
      </div>
    );
  }

  // ---- COMPLETE PHASE ----
  if (phase === "complete") {
    return (
      <div className="px-4 py-12 flex flex-col items-center text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center">
          <Trophy className="h-10 w-10 text-success" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Workout Complete!</h1>
          <p className="text-foreground-muted mt-2">{selectedTemplate?.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-accent" />
              <p className="text-xl font-bold">{formatTime(elapsedSeconds)}</p>
              <p className="text-xs text-foreground-muted">Duration</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Dumbbell className="h-5 w-5 mx-auto mb-1 text-accent" />
              <p className="text-xl font-bold">
                {completedSets}/{totalSets}
              </p>
              <p className="text-xs text-foreground-muted">Sets</p>
            </CardContent>
          </Card>
        </div>

        <div className="w-full max-w-xs space-y-2">
          {exerciseGroups.map((g) => (
            <div
              key={g.templateExercise.id}
              className="flex items-center justify-between text-sm"
            >
              <span>{g.exercise.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-foreground-muted">
                  {g.sets[0]?.actualWeight ?? 0}kg x{" "}
                  {g.sets[0]?.actualReps ?? 0}
                </span>
                {g.sets[0]?.difficulty && (
                  <Badge
                    variant={
                      g.sets[0].difficulty === "easy"
                        ? "success"
                        : g.sets[0].difficulty === "hard"
                          ? "destructive"
                          : "warning"
                    }
                  >
                    {g.sets[0].difficulty}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          size="lg"
          className="w-full max-w-xs"
          onClick={() => {
            setPhase("select");
            setSets([]);
            setSessionId(null);
            setCurrentExerciseIndex(0);
            setStartedAt(null);
            clearState();
          }}
        >
          Done
        </Button>
      </div>
    );
  }

  // ---- ACTIVE PHASE ----
  const isLastExercise = currentExerciseIndex === exerciseGroups.length - 1;

  return (
    <div className="flex flex-col min-h-[calc(100dvh-8rem)]">
      {/* Top bar */}
      <div className="px-4 py-3 border-b border-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{selectedTemplate?.name}</span>
          <span className="text-sm text-foreground-muted font-mono">
            {formatTime(elapsedSeconds)}
          </span>
        </div>
        <Progress value={progressPercent} />
        <p className="text-xs text-foreground-muted text-center">
          {completedSets} of {totalSets} sets complete
        </p>
      </div>

      {/* Exercise content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {currentGroup && (
          <>
            {/* Exercise header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {currentGroup.exercise.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">
                    {currentGroup.exercise.muscle_group}
                  </Badge>
                  {currentGroup.templateExercise.is_backoff_set && (
                    <Badge variant="warning">Backoff</Badge>
                  )}
                  <span className="text-xs text-foreground-muted">
                    Exercise {currentExerciseIndex + 1} of{" "}
                    {exerciseGroups.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Sets */}
            <div className="space-y-3">
              {currentGroup.sets.map((s) => (
                <Card
                  key={s.id}
                  className={cn(
                    "transition-all",
                    s.completed && "border-success/50 bg-success/5",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">
                        Set {s.setNumber} of{" "}
                        {currentGroup.templateExercise.sets}
                      </span>
                      {s.completed && (
                        <Check className="h-5 w-5 text-success" />
                      )}
                    </div>

                    {!s.completed ? (
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-foreground-muted block mb-1">
                            Weight (kg)
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={s.actualWeight}
                            onFocus={(e) => {
                              if (s.actualWeight === "0") {
                                updateSetValue(s.id, "actualWeight", "");
                              }
                              e.target.select();
                            }}
                            onBlur={() => {
                              if (s.actualWeight === "") {
                                updateSetValue(s.id, "actualWeight", "0");
                              }
                            }}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === "" || /^\d*\.?\d*$/.test(v)) {
                                updateSetValue(s.id, "actualWeight", v);
                              }
                            }}
                            className="h-12 w-full text-center text-lg font-bold rounded-lg border border-border bg-background-secondary px-3 focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-foreground-muted block mb-1">
                            Reps
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={s.actualReps}
                            onFocus={(e) => {
                              if (s.actualReps === "0") {
                                updateSetValue(s.id, "actualReps", "");
                              }
                              e.target.select();
                            }}
                            onBlur={() => {
                              if (s.actualReps === "") {
                                updateSetValue(s.id, "actualReps", "0");
                              }
                            }}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === "" || /^\d+$/.test(v)) {
                                updateSetValue(s.id, "actualReps", v);
                              }
                            }}
                            className="h-12 w-full text-center text-lg font-bold rounded-lg border border-border bg-background-secondary px-3 focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                        <Button
                          size="lg"
                          className="h-12 w-12 p-0 shrink-0"
                          onClick={() => completeSet(s.id)}
                        >
                          <Check className="h-6 w-6" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          <span className="font-bold text-lg">
                            {s.actualWeight}
                          </span>{" "}
                          kg
                        </span>
                        <span>
                          <span className="font-bold text-lg">
                            {s.actualReps}
                          </span>{" "}
                          reps
                        </span>
                      </div>
                    )}

                    {!s.completed && (
                      <p className="text-xs text-foreground-muted mt-2">
                        Target: {s.prescribedWeight}kg x {s.prescribedReps} reps
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Difficulty rating */}
            {currentExerciseDone && !currentExerciseDifficultySet && (
              <Card className="border-accent/50">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-medium text-center">
                    How did that feel?
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        {
                          value: "easy" as Difficulty,
                          label: "Easy",
                          color: "bg-success hover:bg-success-hover text-white",
                        },
                        {
                          value: "challenging" as Difficulty,
                          label: "Challenging",
                          color: "bg-warning hover:bg-warning-hover text-black",
                        },
                        {
                          value: "hard" as Difficulty,
                          label: "Hard",
                          color:
                            "bg-destructive hover:bg-destructive-hover text-white",
                        },
                      ] as const
                    ).map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setDifficulty(d.value)}
                        className={cn(
                          "h-14 rounded-lg font-semibold text-sm transition-colors cursor-pointer",
                          d.color,
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next exercise preview */}
            {nextGroup && (
              <div className="text-xs text-foreground-muted text-center pt-1">
                Up next:{" "}
                <span className="font-medium text-foreground">
                  {nextGroup.exercise.name}
                </span>{" "}
                — {nextGroup.templateExercise.sets} sets x{" "}
                {nextGroup.templateExercise.min_reps}-
                {nextGroup.templateExercise.max_reps} reps
              </div>
            )}

            {/* Next exercise / Finish button */}
            {currentExerciseDone && currentExerciseDifficultySet && (
              <div className="pt-2">
                {isLastExercise ? (
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg gap-2"
                    onClick={finishWorkout}
                  >
                    <Trophy className="h-6 w-6" />
                    Finish Workout
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg gap-2"
                    onClick={nextExercise}
                  >
                    Next Exercise
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
