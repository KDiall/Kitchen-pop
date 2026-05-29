import { createClient } from "@supabase/supabase-js";

const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const url = raw.replace(/\/(rest\/v1\/?.*)$/, "").replace(/\/+$/, "");

export const db = createClient(url, key, {
  auth: { persistSession: false },
});
