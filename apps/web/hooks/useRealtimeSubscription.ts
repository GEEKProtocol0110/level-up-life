"use client";

import { useSupabase } from "@/hooks/useSupabase";
import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeSubscription {
  table: string;
  event: "INSERT" | "UPDATE" | "DELETE" | "*";
  onUpdate?: (payload: any) => void;
}

export function useRealtimeSubscription({
  table,
  event = "*",
  onUpdate,
}: RealtimeSubscription) {
  const supabase = useSupabase();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        "postgres_changes" as const,
        {
          event: event,
          schema: "public",
          table: table,
        },
        (payload) => {
          onUpdate?.(payload);
        }
      )
      .subscribe();

    setChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, table, event, onUpdate]);

  return channel;
}
