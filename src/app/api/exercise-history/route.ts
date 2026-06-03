import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getServerClient } from "@/lib/supabase/auth";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exerciseId = request.nextUrl.searchParams.get("exerciseId");
  if (!exerciseId) return NextResponse.json({ error: "exerciseId required" }, { status: 400 });

  const supabase = await getServerClient();

  // Fetch exercise
  const { data: exercise, error: exError } = await supabase
    .from("exercise_library")
    .select("id, name, muscle_group, equipment, is_compound, weight_increment")
    .eq("id", exerciseId)
    .single();

  if (exError || !exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  // Fetch all completed set_logs for this exercise, joined with session date
  const { data: setLogs } = await supabase
    .from("set_logs")
    .select(`
      set_number,
      actual_weight,
      actual_reps,
      difficulty,
      went_to_failure,
      is_banded,
      equipment_used,
      session_id,
      workout_sessions!inner(id, started_at)
    `)
    .eq("exercise_id", exerciseId)
    .eq("completed", true)
    .not("actual_weight", "is", null)
    .not("actual_reps", "is", null)
    .order("created_at", { ascending: false });

  if (!setLogs || setLogs.length === 0) {
    return NextResponse.json({
      exercise,
      history: [],
      prs: { heaviestWeight: null, mostReps: null, highestVolume: null, estimated1RM: null },
    });
  }

  // Group by session
  const sessionMap = new Map<string, {
    date: string;
    sessionId: string;
    sets: typeof setLogs;
  }>();

  for (const log of setLogs) {
    const session = log.workout_sessions as unknown as { id: string; started_at: string };
    const sessionId = session.id;
    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, {
        date: session.started_at,
        sessionId,
        sets: [],
      });
    }
    sessionMap.get(sessionId)!.sets.push(log);
  }

  // Sort by date descending, limit to 20
  const allSessions = [...sessionMap.values()]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  const history = allSessions.map((s) => ({
    date: s.date,
    sessionId: s.sessionId,
    sets: s.sets
      .sort((a, b) => a.set_number - b.set_number)
      .map((set) => ({
        set_number: set.set_number,
        weight: set.actual_weight!,
        reps: set.actual_reps!,
        difficulty: set.difficulty,
        went_to_failure: set.went_to_failure,
        is_banded: set.is_banded,
        equipment_used: set.equipment_used,
      })),
  }));

  // Calculate PRs across ALL sets (not just last 20 sessions)
  let heaviestWeight: { weight: number; reps: number; date: string } | null = null;
  let mostReps: { weight: number; reps: number; date: string } | null = null;
  let highestVolume: { volume: number; date: string } | null = null;
  let estimated1RM: { value: number; date: string; weight: number; reps: number } | null = null;

  for (const log of setLogs) {
    const w = log.actual_weight!;
    const r = log.actual_reps!;
    const session = log.workout_sessions as unknown as { id: string; started_at: string };
    const date = session.started_at;

    if (!heaviestWeight || w > heaviestWeight.weight) {
      heaviestWeight = { weight: w, reps: r, date };
    }

    if (!mostReps || r > mostReps.reps) {
      mostReps = { weight: w, reps: r, date };
    }

    const vol = w * r;
    if (!highestVolume || vol > highestVolume.volume) {
      highestVolume = { volume: vol, date };
    }

    const e1rm = w * (1 + r / 30);
    if (!estimated1RM || e1rm > estimated1RM.value) {
      estimated1RM = { value: Math.round(e1rm * 10) / 10, date, weight: w, reps: r };
    }
  }

  return NextResponse.json({
    exercise,
    history,
    prs: { heaviestWeight, mostReps, highestVolume, estimated1RM },
  });
}
