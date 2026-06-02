"use server";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./server";

// Full auth validation — hits Supabase auth server (use in layout/middleware)
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// Fast auth — decodes JWT locally, no network call (use in API routes)
export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
});

// Cache the supabase client creation per-request
export const getServerClient = cache(async () => {
  return await createClient();
});

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
