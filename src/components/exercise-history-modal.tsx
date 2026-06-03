"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { X, Trophy, Dumbbell, TrendingUp, Zap } from "lucide-react";

interface SetData {
  set_number: number;
  weight: number;
  reps: number;
  difficulty: string | null;
  went_to_failure: boolean;
  is_banded: boolean;
  equipment_used: string | null;
}

interface SessionHistory {
  date: string;
  sessionId: string;
  sets: SetData[];
}

interface PRs {
  heaviestWeight: { weight: number; reps: number; date: string } | null;
  mostReps: { weight: number; reps: number; date: string } | null;
  highestVolume: { volume: number; date: string } | null;
  estimated1RM: { value: number; date: string; weight: number; reps: number } | null;
}

interface ExerciseData {
  exercise: {
    id: string;
    name: string;
    muscle_group: string;
    equipment: string;
    is_compound: boolean;
    weight_increment: number;
  };
  history: SessionHistory[];
  prs: PRs;
}

interface Props {
  exerciseId: string;
  exerciseName: string;
  open: boolean;
  onClose: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
  });
}

function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ExerciseHistoryModal({ exerciseId, exerciseName, open, onClose }: Props) {
  const [data, setData] = useState<ExerciseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !exerciseId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/exercise-history?exerciseId=${exerciseId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((d) => setData(d))
      .catch(() => setError("Could not load exercise history"))
      .finally(() => setLoading(false));
  }, [open, exerciseId]);

  const chartData = data
    ? [...data.history]
        .reverse()
        .map((s) => ({
          date: formatDate(s.date),
          weight: Math.max(...s.sets.map((set) => set.weight)),
        }))
    : [];

  // 1RM trend per session
  const oneRmTrend = data
    ? [...data.history]
        .reverse()
        .map((s) => {
          const best = Math.max(
            ...s.sets.map((set) => set.weight * (1 + set.reps / 30))
          );
          return { date: formatDate(s.date), e1rm: Math.round(best * 10) / 10 };
        })
    : [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{exerciseName}</DialogTitle>
              {data?.exercise.muscle_group && (
                <Badge variant="secondary" className="mt-1.5">
                  {data.exercise.muscle_group}
                </Badge>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-background-secondary transition-colors cursor-pointer"
            >
              <X className="h-5 w-5 text-foreground-muted" />
            </button>
          </div>
        </DialogHeader>

        {loading && <LoadingSkeleton />}
        {error && <p className="text-sm text-destructive py-8 text-center">{error}</p>}

        {data && !loading && (
          <Tabs defaultValue="history">
            <TabsList className="w-full">
              <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
              <TabsTrigger value="prs" className="flex-1">PRs</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="mt-4 space-y-4">
              {chartData.length > 1 ? (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#888" fontSize={11} tickLine={false} />
                      <YAxis
                        stroke="#888"
                        fontSize={11}
                        tickLine={false}
                        width={40}
                        domain={["dataMin - 5", "dataMax + 5"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e1e2e",
                          border: "1px solid #333",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        formatter={(value) => [`${value} kg`, "Max Weight"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : chartData.length === 1 ? (
                <div className="text-center text-foreground-muted text-sm py-4">
                  Need more sessions to show trend
                </div>
              ) : null}

              {data.history.length === 0 ? (
                <p className="text-center text-foreground-muted text-sm py-8">
                  No history yet
                </p>
              ) : (
                <div className="space-y-3">
                  {data.history.map((session) => (
                    <Card key={session.sessionId}>
                      <CardContent className="p-3">
                        <p className="text-xs text-foreground-muted mb-2">
                          {formatDateLong(session.date)}
                        </p>
                        <div className="space-y-1">
                          {session.sets.map((set) => (
                            <div
                              key={set.set_number}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span className="text-foreground-muted w-12 shrink-0">
                                Set {set.set_number}:
                              </span>
                              <span className="font-medium">
                                {set.weight}kg x {set.reps}
                              </span>
                              {set.went_to_failure && (
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                  F
                                </Badge>
                              )}
                              {set.is_banded && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  B
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="prs" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <PRCard
                  icon={<Dumbbell className="h-4 w-4" />}
                  label="Heaviest Weight"
                  pr={data.prs.heaviestWeight}
                  render={(pr) => (
                    <>
                      <p className="text-xl font-bold text-yellow-400">{pr.weight}kg</p>
                      <p className="text-xs text-foreground-muted">
                        x {pr.reps} reps &middot; {formatDate(pr.date)}
                      </p>
                    </>
                  )}
                />
                <PRCard
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Most Reps"
                  pr={data.prs.mostReps}
                  render={(pr) => (
                    <>
                      <p className="text-xl font-bold text-yellow-400">{pr.reps} reps</p>
                      <p className="text-xs text-foreground-muted">
                        @ {pr.weight}kg &middot; {formatDate(pr.date)}
                      </p>
                    </>
                  )}
                />
                <PRCard
                  icon={<Zap className="h-4 w-4" />}
                  label="Best Volume"
                  pr={data.prs.highestVolume}
                  render={(pr) => (
                    <>
                      <p className="text-xl font-bold text-yellow-400">
                        {pr.volume.toLocaleString()}kg
                      </p>
                      <p className="text-xs text-foreground-muted">
                        single set &middot; {formatDate(pr.date)}
                      </p>
                    </>
                  )}
                />
                <PRCard
                  icon={<Trophy className="h-4 w-4" />}
                  label="Est. 1RM"
                  pr={data.prs.estimated1RM}
                  render={(pr) => (
                    <>
                      <p className="text-xl font-bold text-yellow-400">{pr.value}kg</p>
                      <p className="text-xs text-foreground-muted">
                        {pr.weight}kg x {pr.reps} &middot; {formatDate(pr.date)}
                      </p>
                    </>
                  )}
                />
              </div>

              {/* 1RM explanation and trend */}
              <div className="space-y-3 pt-2">
                <div className="text-xs text-foreground-muted">
                  <p className="font-medium text-foreground mb-1">Estimated 1RM</p>
                  <p>Estimated using the Epley formula: weight x (1 + reps/30)</p>
                </div>

                {oneRmTrend.length >= 3 && (
                  <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={oneRmTrend}>
                        <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#888" fontSize={10} tickLine={false} />
                        <YAxis
                          stroke="#888"
                          fontSize={10}
                          tickLine={false}
                          width={40}
                          domain={["dataMin - 5", "dataMax + 5"]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e1e2e",
                            border: "1px solid #333",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          formatter={(value) => [`${value} kg`, "Est. 1RM"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="e1rm"
                          stroke="#eab308"
                          strokeWidth={2}
                          dot={{ fill: "#eab308", r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PRCard<T>({
  icon,
  label,
  pr,
  render,
}: {
  icon: React.ReactNode;
  label: string;
  pr: T | null;
  render: (pr: T) => React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 text-foreground-muted text-xs mb-2">
          {icon}
          {label}
        </div>
        {pr ? render(pr) : (
          <p className="text-sm text-foreground-muted">No records yet</p>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 py-4">
      <div className="h-5 w-24 bg-background-secondary rounded animate-pulse" />
      <div className="h-[200px] bg-background-secondary rounded-lg animate-pulse" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-background-secondary rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
