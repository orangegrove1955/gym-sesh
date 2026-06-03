"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExerciseStrengthData {
  exerciseId?: string;
  exerciseName: string;
  history: { date: string; weight: number }[];
  prs: { reps: number; weight: number }[];
}

interface StrengthChartProps {
  exercises: ExerciseStrengthData[];
  onExerciseClick?: (exerciseId: string, exerciseName: string) => void;
}

export function StrengthChart({ exercises, onExerciseClick }: StrengthChartProps) {
  if (exercises.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-foreground-muted text-sm">
        No strength data yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {exercises.map((ex) => (
        <Card key={ex.exerciseName}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              {onExerciseClick && ex.exerciseId ? (
                <CardTitle
                  className="text-base cursor-pointer hover:text-accent transition-colors underline decoration-dotted underline-offset-4 decoration-foreground-muted/40"
                  onClick={() => onExerciseClick(ex.exerciseId!, ex.exerciseName)}
                >
                  {ex.exerciseName}
                </CardTitle>
              ) : (
                <CardTitle className="text-base">{ex.exerciseName}</CardTitle>
              )}
              <div className="flex gap-1.5 flex-wrap">
                {ex.prs.map((pr) => (
                  <Badge key={pr.reps} variant="secondary" className="text-xs">
                    {pr.weight}kg x {pr.reps}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {ex.history.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={ex.history}>
                  <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    fontSize={11}
                    tickLine={false}
                  />
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
                    formatter={(value) => [`${value} kg`, "Weight"]}
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
            ) : (
              <div className="flex items-center justify-center h-[100px] text-foreground-muted text-sm">
                Need more sessions to show trend
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
