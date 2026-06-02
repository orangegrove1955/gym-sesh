"use client";

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface WeeklyVolumeData {
  week: string;
  volume: number;
}

interface MuscleVolumeData {
  week: string;
  [muscleGroup: string]: string | number;
}

interface SessionVolumeData {
  date: string;
  volume: number;
}

interface VolumeChartProps {
  weeklyVolume: WeeklyVolumeData[];
  muscleVolume: MuscleVolumeData[];
  muscleGroups: string[];
  sessionVolume: SessionVolumeData[];
}

const MUSCLE_COLORS: Record<string, string> = {
  chest: "#3b82f6",
  back: "#8b5cf6",
  shoulders: "#ec4899",
  biceps: "#f97316",
  triceps: "#eab308",
  quads: "#22c55e",
  hamstrings: "#06b6d4",
  glutes: "#f43f5e",
  calves: "#a855f7",
  abs: "#14b8a6",
  forearms: "#64748b",
};

export function VolumeChart({
  weeklyVolume,
  muscleVolume,
  muscleGroups,
  sessionVolume,
}: VolumeChartProps) {
  const tooltipStyle = {
    backgroundColor: "#1e1e2e",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#fff",
  };

  return (
    <div className="space-y-6">
      {/* Weekly total volume */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Volume</CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyVolume.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyVolume}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke="#888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888" fontSize={11} tickLine={false} width={50} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [
                    `${Number(value).toLocaleString()} kg`,
                    "Volume",
                  ]}
                />
                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-foreground-muted text-sm">
              No volume data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Volume by muscle group over time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Volume by Muscle Group</CardTitle>
        </CardHeader>
        <CardContent>
          {muscleVolume.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={muscleVolume}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke="#888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888" fontSize={11} tickLine={false} width={50} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "#888", fontSize: 12 }}>{value}</span>
                  )}
                />
                {muscleGroups.map((mg) => (
                  <Area
                    key={mg}
                    type="monotone"
                    dataKey={mg}
                    stackId="1"
                    stroke={MUSCLE_COLORS[mg] || "#888"}
                    fill={MUSCLE_COLORS[mg] || "#888"}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-foreground-muted text-sm">
              No volume data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Volume per session trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Volume Per Session</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionVolume.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sessionVolume}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888" fontSize={11} tickLine={false} width={50} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [
                    `${Number(value).toLocaleString()} kg`,
                    "Volume",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-foreground-muted text-sm">
              Need more sessions to show trend
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
