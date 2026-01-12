"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, ReactNode, useState } from "react";
import { createSupabaseClient } from "@level-up-life/api";
import type { SupabaseClient } from "@level-up-life/api";

export const SupabaseContext = createContext<SupabaseClient | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [supabase] = useState(() =>
    createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  );

  return (
    <SupabaseContext.Provider value={supabase}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SupabaseContext.Provider>
  );
}
