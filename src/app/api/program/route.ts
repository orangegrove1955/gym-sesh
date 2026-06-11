import { NextResponse } from "next/server";
import { getSessionUser, getServerClient } from "@/lib/supabase/auth";

export async function GET() {
  const [user, supabase] = await Promise.all([getSessionUser(), getServerClient()]);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return all programs with template counts
  const { data: programs } = await supabase
    .from("programs")
    .select("*, workout_templates(id, name, day_number, focus_areas)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    programs: programs ?? [],
    userId: user.id,
  });
}
