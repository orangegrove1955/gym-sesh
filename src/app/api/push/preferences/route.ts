import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getServerClient } from "@/lib/supabase/auth";

const DEFAULTS = {
  enabled: false,
  schedule_type: "fixed_days",
  fixed_days: [1, 3, 5],
  days_interval: 2,
  reminder_hour: 9,
};

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getServerClient();
  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json(data || { ...DEFAULTS, user_id: user.id });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { enabled, schedule_type, fixed_days, days_interval, reminder_hour } = body;

  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("notification_preferences")
    .upsert(
      {
        user_id: user.id,
        enabled,
        schedule_type,
        fixed_days,
        days_interval,
        reminder_hour,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
