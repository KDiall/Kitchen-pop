import { createClient } from "@supabase/supabase-js";

const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const url = raw.replace(/\/(rest\/v1\/?.*)$/, "").replace(/\/+$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const db = createClient(url, key, {
  auth: { persistSession: false },
});
