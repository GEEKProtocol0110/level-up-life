// Supabase client initialization

import { createClient, type SupabaseClient, type SupabaseClientOptions } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

let defaultClient: SupabaseClient<Database> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  defaultClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
} else {
  console.warn("Supabase URL or Anon Key not configured. Client will not work until provided.");
}

export const supabase = defaultClient;

export function createSupabaseClient(
  url = supabaseUrl,
  key = supabaseAnonKey,
  options?: SupabaseClientOptions<"public">
): SupabaseClient<Database> {
  return createClient<Database>(url, key, options);
}

export function requireClient(client?: SupabaseClient<Database>): SupabaseClient<Database> {
  if (client) return client;
  if (!defaultClient) {
    throw new Error("Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return defaultClient;
}

export type SupabaseDBClient = SupabaseClient<Database>;
export type { Database };
