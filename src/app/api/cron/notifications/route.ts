// npm install web-push @types/web-push
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentDay = now.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  // Get all users whose reminder hour matches
  const { data: prefs, error: prefsError } = await supabaseAdmin
    .from("notification_preferences")
    .select("*")
    .eq("enabled", true)
    .eq("reminder_hour", currentHour);

  if (prefsError || !prefs) {
    return NextResponse.json({ error: prefsError?.message || "No prefs" }, { status: 500 });
  }

  const usersToNotify: string[] = [];

  for (const pref of prefs) {
    if (pref.schedule_type === "fixed_days") {
      if (pref.fixed_days && pref.fixed_days.includes(currentDay)) {
        usersToNotify.push(pref.user_id);
      }
    } else if (pref.schedule_type === "days_since_workout") {
      // Check last completed workout
      const { data: lastSession } = await supabaseAdmin
        .from("workout_sessions")
        .select("completed_at")
        .eq("user_id", pref.user_id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();

      if (!lastSession?.completed_at) {
        // No workouts ever — notify
        usersToNotify.push(pref.user_id);
      } else {
        const daysSince = Math.floor(
          (now.getTime() - new Date(lastSession.completed_at).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysSince >= (pref.days_interval ?? 2)) {
          usersToNotify.push(pref.user_id);
        }
      }
    }
  }

  if (usersToNotify.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Fetch subscriptions for these users
  const { data: subscriptions } = await supabaseAdmin
    .from("push_subscriptions")
    .select("*")
    .in("user_id", usersToNotify);

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const payload = JSON.stringify({
    title: "Time to train! 💪",
    body: "Your workout is waiting for you.",
    url: "/workout",
  });

  let sent = 0;
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth_key,
          },
        },
        payload
      );
      sent++;
    } catch (err: unknown) {
      // If subscription is expired/invalid, remove it
      if (err && typeof err === "object" && "statusCode" in err) {
        const statusCode = (err as { statusCode: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }
      }
    }
  }

  return NextResponse.json({ sent });
}
