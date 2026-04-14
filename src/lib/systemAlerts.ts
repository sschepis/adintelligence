import { supabase } from "@/integrations/supabase/client";

// Track which services have already sent alerts this session to avoid spam
const alertsSent = new Set<string>();

export async function notifySysadmin(
  serviceName: string,
  error: string,
  action: string
): Promise<void> {
  const key = `${serviceName}:${action}`;
  if (alertsSent.has(key)) return;
  alertsSent.add(key);

  try {
    await supabase.from("system_alerts").insert({
      service_name: serviceName,
      alert_type: "api_error",
      message: `${serviceName} API error during ${action}: ${error}`,
      severity:
        error.includes("401") || error.includes("402") || error.includes("403")
          ? "critical"
          : "error",
      details: { action, error, timestamp: new Date().toISOString() },
    });
  } catch (e) {
    console.error(`[${serviceName}] Failed to create system alert:`, e);
  }
}

export function resetAlerts(): void {
  alertsSent.clear();
}
