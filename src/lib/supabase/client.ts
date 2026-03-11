import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL_INTERNAL || "http://localhost:8000",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "replace-with-anon-key"
  );
}