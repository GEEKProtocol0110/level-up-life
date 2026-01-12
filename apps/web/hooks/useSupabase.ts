"use client";

import { useContext } from "react";
import { SupabaseContext } from "../app/providers";

export function useSupabase() {
  const supabase = useContext(SupabaseContext);
  if (!supabase) {
    throw new Error("useSupabase must be used within SupabaseContext");
  }
  return supabase;
}
