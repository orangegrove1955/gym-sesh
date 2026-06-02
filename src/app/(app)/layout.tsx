import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "./bottom-nav";
import { isDemoMode, demoProfile } from "@/lib/demo-data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let displayName = "Athlete";

  if (isDemoMode()) {
    displayName = demoProfile.display_name || "Matt";
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    // Use metadata display_name (set during signup) to avoid an extra DB query
    displayName =
      (user.user_metadata?.display_name as string) ||
      user.email?.split("@")[0] ||
      "Athlete";
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-medium text-foreground-muted">
          {displayName}
        </span>
        {!isDemoMode() && (
          <form action="/auth/sign-out" method="POST">
            <button
              type="submit"
              className="text-xs text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </form>
        )}
        {isDemoMode() && (
          <span className="text-xs text-foreground-muted">Demo Mode</span>
        )}
      </header>

      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      <BottomNav />
    </div>
  );
}
