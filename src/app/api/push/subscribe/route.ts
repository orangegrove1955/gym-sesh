import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getServerClient } from "@/lib/supabase/auth";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { endpoint, p256dh, auth } = await req.json();
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = await getServerClient();

  // Upsert push subscription
  const { error: subError } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh,
        auth_key: auth,
      },
      { onConflict: "user_id,endpoint" }
    );

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  // Upsert default preferences if none exist
  const { data: existing } = await supabase
    .from("notification_preferences")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    await supabase.from("notification_preferences").insert({
      user_id: user.id,
    });
  }

  return NextResponse.json({ ok: true });
}
