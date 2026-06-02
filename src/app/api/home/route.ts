import { NextResponse } from "next/server";
import { getCurrentUser, getServerClient } from "@/lib/supabase/auth";

export async function GET() {
  const [user, supabase] = await Promise.all([getCurrentUser(), getServerClient()]);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const [profileRes, totalRes, weekRes, streakRes, recentRes] =
    await Promise.all([
      supabase
        .from("user_profiles")
        .select("display_name")
        .eq("id", user.id)
        .single(),
      supabase
        .from("workout_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("completed_at", "is", null),
      supabase
        .from("workout_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .gte("completed_at", weekStart.toISOString()),
      supabase
        .from("workout_sessions")
        .select("completed_at")
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(30),
      supabase
        .from("workout_sessions")
        .select(
          "id, started_at, completed_at, template_id, workout_templates(name)"
        )
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(5),
    ]);

  const totalWorkouts = totalRes.count ?? 0;
  const weekWorkouts = weekRes.count ?? 0;

  let streak = 0;
  const recentSessions = streakRes.data;
  if (recentSessions && recentSessions.length > 0) {
    const workoutDays = new Set(
      recentSessions.map((s) =>
        new Date(s.completed_at!).toISOString().slice(0, 10)
      )
    );
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (workoutDays.has(key)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
  }

  const recentWorkouts = (recentRes.data || []).map((session) => ({
    id: session.id,
    completed_at: session.completed_at!,
    templateName:
      (session.workout_templates as unknown as { name: string })?.name ??
      "Workout",
  }));

  const displayName =
    profileRes.data?.display_name || user.email?.split("@")[0] || "Athlete";

  return NextResponse.json({
    displayName,
    totalWorkouts,
    weekWorkouts,
    streak,
    recentWorkouts,
  });
}
