"use server";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./server";

// React cache() deduplicates this call within a single server request.
// So layout + page + API routes in the same request share one auth call.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// Also cache the supabase client creation per-request
export const getServerClient = cache(async () => {
  return await createClient();
});

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
