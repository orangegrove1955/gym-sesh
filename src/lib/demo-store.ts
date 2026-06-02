"use client";

import type { SetLog, WorkoutSession } from "@/types/database";

// In-memory store for demo mode mutations
let sessions: WorkoutSession[] = [];
let setLogs: SetLog[] = [];
let counter = 0;

function nextId(prefix: string): string {
  counter++;
  return `demo-live-${prefix}-${counter}`;
}

export function demoCreateSession(data: {
  user_id: string;
  template_id: string;
}): WorkoutSession {
  const id = nextId("session");
  const session: WorkoutSession = {
    id,
    user_id: data.user_id,
    template_id: data.template_id,
    started_at: new Date().toISOString(),
    completed_at: null,
    notes: null,
    created_at: new Date().toISOString(),
  };
  sessions.push(session);
  return session;
}

export function demoInsertSetLogs(
  data: Array<{
    session_id: string;
    exercise_id: string;
    template_exercise_id: string;
    set_number: number;
    prescribed_weight: number;
    prescribed_reps: number;
  }>
): SetLog[] {
  const inserted: SetLog[] = [];
  for (const d of data) {
    const id = nextId("setlog");
    const log: SetLog = {
      id,
      session_id: d.session_id,
      exercise_id: d.exercise_id,
      template_exercise_id: d.template_exercise_id,
      set_number: d.set_number,
      prescribed_weight: d.prescribed_weight,
      prescribed_reps: d.prescribed_reps,
      actual_weight: null,
      actual_reps: null,
      difficulty: null,
      completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
    };
    setLogs.push(log);
    inserted.push(log);
  }
  return inserted;
}

export function demoUpdateSetLog(
  id: string,
  data: Partial<SetLog>
): void {
  setLogs = setLogs.map((sl) =>
    sl.id === id ? { ...sl, ...data } : sl
  );
}

export function demoCompleteSession(id: string): void {
  sessions = sessions.map((s) =>
    s.id === id ? { ...s, completed_at: new Date().toISOString() } : s
  );
}

export function getDemoSessionSetLogs(sessionId: string): SetLog[] {
  return setLogs.filter((sl) => sl.session_id === sessionId);
}
