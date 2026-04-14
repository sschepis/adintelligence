import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { notifySysadmin } from "@/lib/systemAlerts";

interface UseSupabaseFunctionConfig {
  functionName: string;
  serviceName: string;
  onError?: "return-empty-array" | "return-null" | "throw";
  enableSysadminAlerts?: boolean;
}

interface UseSupabaseFunctionState {
  loading: boolean;
  error: string | null;
  apiUnavailable: boolean;
}

type InvokeResult<T> = T | null | never[];

export function useSupabaseFunction(config: UseSupabaseFunctionConfig) {
  const {
    functionName,
    serviceName,
    onError = "return-empty-array",
    enableSysadminAlerts = true,
  } = config;

  const [state, setState] = useState<UseSupabaseFunctionState>({
    loading: false,
    error: null,
    apiUnavailable: false,
  });

  const invoke = useCallback(
    async <T>(
      action: string,
      params: Record<string, unknown>
    ): Promise<InvokeResult<T>> => {
      if (state.apiUnavailable) {
        return onError === "return-null" ? null : ([] as never[]);
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          functionName,
          {
            body: { action, params },
          }
        );

        if (fnError) throw fnError;

        // Handle API unavailable response (used by rainforest-products)
        if (data?.apiUnavailable) {
          setState((prev) => ({
            ...prev,
            loading: false,
            apiUnavailable: true,
          }));
          return onError === "return-null"
            ? null
            : ({ success: false, data: [] } as unknown as T);
        }

        if (!data?.success) {
          throw new Error(data?.error || `Failed to ${action}`);
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          apiUnavailable: false,
        }));
        return data as T;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : `Failed to ${action}`;

        if (enableSysadminAlerts) {
          await notifySysadmin(serviceName, message, action);
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
          apiUnavailable: true,
        }));

        if (onError === "throw") throw err;
        if (onError === "return-null") return null;
        return [] as never[];
      }
    },
    [functionName, serviceName, onError, enableSysadminAlerts, state.apiUnavailable]
  );

  return {
    loading: state.loading,
    error: state.error,
    apiUnavailable: state.apiUnavailable,
    invoke,
  };
}
