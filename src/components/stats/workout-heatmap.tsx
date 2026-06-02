"use client";

import { useMemo } from "react";
import { format, subDays, startOfWeek, differenceInWeeks, addDays } from "date-fns";

interface WorkoutHeatmapProps {
  workoutDates: string[]; // ISO date strings (yyyy-MM-dd)
  days?: number;
}

export function WorkoutHeatmap({ workoutDates, days = 90 }: WorkoutHeatmapProps) {
  const dateSet = useMemo(() => new Set(workoutDates), [workoutDates]);

  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(subDays(today, days), { weekStartsOn: 1 });
    const end = today;
    const totalWeeks = differenceInWeeks(end, start) + 1;

    const weeks: { date: Date; dateStr: string; hasWorkout: boolean }[][] = [];
    const monthLabels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < totalWeeks; w++) {
      const week: { date: Date; dateStr: string; hasWorkout: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = addDays(start, w * 7 + d);
        const dateStr = format(date, "yyyy-MM-dd");
        week.push({ date, dateStr, hasWorkout: dateSet.has(dateStr) });

        if (d === 0 && date.getMonth() !== lastMonth) {
          lastMonth = date.getMonth();
          monthLabels.push({ label: format(date, "MMM"), weekIndex: w });
        }
      }
      weeks.push(week);
    }

    return { weeks, monthLabels };
  }, [dateSet, days]);

  const cellSize = 14;
  const gap = 3;
  const labelWidth = 28;
  const headerHeight = 20;

  return (
    <div className="overflow-x-auto">
      <svg
        width={labelWidth + weeks.length * (cellSize + gap)}
        height={headerHeight + 7 * (cellSize + gap)}
        className="text-foreground-muted"
      >
        {/* Month labels */}
        {monthLabels.map((m) => (
          <text
            key={`${m.label}-${m.weekIndex}`}
            x={labelWidth + m.weekIndex * (cellSize + gap)}
            y={12}
            fill="#888"
            fontSize={10}
          >
            {m.label}
          </text>
        ))}

        {/* Day labels */}
        {["M", "", "W", "", "F", "", ""].map((label, i) => (
          <text
            key={i}
            x={0}
            y={headerHeight + i * (cellSize + gap) + cellSize - 2}
            fill="#888"
            fontSize={10}
          >
            {label}
          </text>
        ))}

        {/* Grid cells */}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const isFuture = day.date > new Date();
            return (
              <rect
                key={day.dateStr}
                x={labelWidth + wi * (cellSize + gap)}
                y={headerHeight + di * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={3}
                fill={
                  isFuture
                    ? "transparent"
                    : day.hasWorkout
                    ? "#3b82f6"
                    : "#1e1e2e"
                }
                opacity={isFuture ? 0 : day.hasWorkout ? 1 : 0.5}
              >
                <title>
                  {format(day.date, "EEE, MMM d")}
                  {day.hasWorkout ? " - Workout" : ""}
                </title>
              </rect>
            );
          })
        )}
      </svg>
    </div>
  );
}
