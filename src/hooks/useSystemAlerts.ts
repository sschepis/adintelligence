import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SystemAlert {
  id: string;
  alert_type: string;
  service_name: string;
  message: string;
  details?: Record<string, any>;
  severity: "info" | "warning" | "error" | "critical";
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

export function useSystemAlerts() {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  const fetchAlerts = useCallback(async (includeResolved = false) => {
    setLoading(true);
    try {
      let query = supabase
        .from("system_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!includeResolved) {
        query = query.eq("resolved", false);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setAlerts((data as SystemAlert[]) || []);
      return data as SystemAlert[];
    } catch (err) {
      console.error("[SystemAlerts] Failed to fetch alerts:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("system_alerts")
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: userData?.user?.id,
        })
        .eq("id", alertId);

      if (error) throw error;
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      return true;
    } catch (err) {
      console.error("[SystemAlerts] Failed to resolve alert:", err);
      return false;
    }
  }, []);

  const getUnresolvedCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from("system_alerts")
        .select("*", { count: "exact", head: true })
        .eq("resolved", false);

      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error("[SystemAlerts] Failed to get count:", err);
      return 0;
    }
  }, []);

  return {
    loading,
    alerts,
    fetchAlerts,
    resolveAlert,
    getUnresolvedCount,
  };
}

// Helper to create an alert and send email notification for critical alerts
export async function createSystemAlert(
  serviceName: string,
  alertType: string,
  message: string,
  severity: "info" | "warning" | "error" | "critical" = "warning",
  details?: Record<string, any>
) {
  try {
    const { error } = await supabase.from("system_alerts").insert({
      service_name: serviceName,
      alert_type: alertType,
      message,
      severity,
      details,
    });

    if (error) {
      console.error("[SystemAlerts] Failed to create alert:", error);
      return;
    }

    // Send email notification for error and critical alerts
    if (severity === "error" || severity === "critical") {
      try {
        await supabase.functions.invoke("send-system-alert-email", {
          body: {
            alert_type: alertType,
            service_name: serviceName,
            message,
            severity,
            details,
          },
        });
        console.log("[SystemAlerts] Email notification sent for", severity, "alert");
      } catch (emailErr) {
        console.error("[SystemAlerts] Failed to send email notification:", emailErr);
      }
    }
  } catch (err) {
    console.error("[SystemAlerts] Failed to create alert:", err);
  }
}
