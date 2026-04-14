import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RealtimeSubscriptionConfig {
  channelName: string;
  table: string;
  event: "INSERT" | "UPDATE" | "DELETE" | "*";
  filterColumn?: string;
  onPayload: (payload: { new: Record<string, unknown>; old: Record<string, unknown> }) => void;
}

export function useRealtimeSubscription(configs: RealtimeSubscriptionConfig[]) {
  useEffect(() => {
    let channels: ReturnType<typeof supabase.channel>[] = [];

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channels = configs.map((config) => {
        const filter = config.filterColumn
          ? `${config.filterColumn}=eq.${user.id}`
          : undefined;

        return supabase
          .channel(config.channelName)
          .on(
            "postgres_changes",
            {
              event: config.event,
              schema: "public",
              table: config.table,
              ...(filter ? { filter } : {}),
            },
            (payload) => {
              config.onPayload(payload as any);
            }
          )
          .subscribe();
      });
    };

    setup();

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [configs]);
}
