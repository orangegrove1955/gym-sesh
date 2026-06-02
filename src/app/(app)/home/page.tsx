import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Flame, CalendarDays, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  isDemoMode,
  demoProfile,
  demoSessions,
  demoTemplates,
} from "@/lib/demo-data";

export default async function HomePage() {
  let displayName = "Athlete";
  let totalWorkouts = 0;
  let weekWorkouts = 0;
  let streak = 0;
  let recentWorkouts: Array<{
    id: string;
    completed_at: string;
    templateName: string;
  }> = [];

  if (isDemoMode()) {
    displayName = demoProfile.display_name || "Matt";

    const completedSessions = demoSessions.filter((s) => s.completed_at);
    totalWorkouts = completedSessions.length;

    // This week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    weekWorkouts = completedSessions.filter(
      (s) => new Date(s.completed_at!) >= weekStart
    ).length;

    // Streak
    const workoutDays = new Set(
      completedSessions.map((s) =>
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

    // Recent
    const templateMap = new Map(demoTemplates.map((t) => [t.id, t]));
    recentWorkouts = [...completedSessions]
      .sort(
        (a, b) =>
          new Date(b.completed_at!).getTime() -
          new Date(a.completed_at!).getTime()
      )
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        completed_at: s.completed_at!,
        templateName: templateMap.get(s.template_id)?.name ?? "Workout",
      }));
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // Run all queries in parallel
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

    totalWorkouts = totalRes.count ?? 0;
    weekWorkouts = weekRes.count ?? 0;

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

    recentWorkouts = (recentRes.data || []).map((session) => ({
      id: session.id,
      completed_at: session.completed_at!,
      templateName:
        (session.workout_templates as unknown as { name: string })?.name ??
        "Workout",
    }));

    displayName =
      profileRes.data?.display_name || user.email?.split("@")[0] || "Athlete";
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {displayName}</h1>
        <p className="text-foreground-muted text-sm mt-1">
          Ready to crush it today?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Dumbbell className="h-5 w-5 mx-auto mb-1 text-accent" />
            <p className="text-2xl font-bold">{totalWorkouts}</p>
            <p className="text-xs text-foreground-muted">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-5 w-5 mx-auto mb-1 text-warning" />
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-foreground-muted">Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CalendarDays className="h-5 w-5 mx-auto mb-1 text-success" />
            <p className="text-2xl font-bold">{weekWorkouts}</p>
            <p className="text-xs text-foreground-muted">This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Start Workout CTA */}
      <Link href="/workout" className="block">
        <Button size="lg" className="w-full h-14 text-lg gap-3">
          <Play className="h-6 w-6" />
          Start Workout
        </Button>
      </Link>

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Workouts</h2>
          {recentWorkouts.map((session) => (
            <Card key={session.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{session.templateName}</p>
                  <p className="text-xs text-foreground-muted">
                    {formatDistanceToNow(new Date(session.completed_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Badge variant="success">Completed</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {recentWorkouts.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-foreground-muted">
            <p>No workouts yet. Start your first one!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
