"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface MuscleDistributionProps {
  data: { name: string; value: number }[];
}

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#f43f5e",
  "#a855f7",
  "#14b8a6",
  "#64748b",
];

export function MuscleDistribution({ data }: MuscleDistributionProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-foreground-muted text-sm">
        No workout data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e1e2e",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "#fff",
          }}
          formatter={(value) => [`${value} sets`, "Volume"]}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: "#888", fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
