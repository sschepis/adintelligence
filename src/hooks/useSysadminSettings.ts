import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AlertEmailRecipients {
  emails: string[];
}

interface ApiRateLimitSettings {
  dataforSeoLimit: number;
  apifyLimit: number;
  rainforestLimit: number;
}

interface RetrySettings {
  retryIntervalMinutes: number;
  maxRetryAttempts: number;
  autoRetryEnabled: boolean;
}

export function useSysadminSettings() {
  const [loading, setLoading] = useState(false);
  const [alertRecipients, setAlertRecipients] = useState<string[]>([]);
  const [rateLimits, setRateLimits] = useState<ApiRateLimitSettings>({
    dataforSeoLimit: 1000,
    apifyLimit: 500,
    rainforestLimit: 200,
  });
  const [retrySettings, setRetrySettings] = useState<RetrySettings>({
    retryIntervalMinutes: 15,
    maxRetryAttempts: 3,
    autoRetryEnabled: true,
  });

  const fetchAlertRecipients = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("sysadmin_settings")
        .select("setting_value")
        .eq("setting_key", "alert_email_recipients")
        .single();

      if (error) throw error;
      
      const value = data?.setting_value as unknown as AlertEmailRecipients;
      setAlertRecipients(value?.emails || []);
      return value?.emails || [];
    } catch (err) {
      console.error("[SysadminSettings] Failed to fetch alert recipients:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAlertRecipients = useCallback(async (emails: string[]) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("sysadmin_settings")
        .update({
          setting_value: { emails },
          updated_by: userData?.user?.id,
        })
        .eq("setting_key", "alert_email_recipients");

      if (error) throw error;
      
      setAlertRecipients(emails);
      return true;
    } catch (err) {
      console.error("[SysadminSettings] Failed to update alert recipients:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRateLimits = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("sysadmin_settings")
        .select("setting_value")
        .eq("setting_key", "api_rate_limits")
        .maybeSingle();

      if (error) throw error;

      if (data?.setting_value) {
        const limits = data.setting_value as unknown as ApiRateLimitSettings;
        setRateLimits(limits);
        return limits;
      }
      return rateLimits;
    } catch (err) {
      console.error("[SysadminSettings] Failed to fetch rate limits:", err);
      return rateLimits;
    }
  }, [rateLimits]);

  const updateRateLimits = useCallback(async (limits: ApiRateLimitSettings) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: existing } = await supabase
        .from("sysadmin_settings")
        .select("id")
        .eq("setting_key", "api_rate_limits")
        .maybeSingle();

      const jsonValue = JSON.parse(JSON.stringify(limits));

      if (existing) {
        const { error } = await supabase
          .from("sysadmin_settings")
          .update({
            setting_value: jsonValue,
            updated_by: userData?.user?.id,
          })
          .eq("setting_key", "api_rate_limits");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("sysadmin_settings")
          .insert([{
            setting_key: "api_rate_limits",
            setting_value: jsonValue,
            updated_by: userData?.user?.id,
          }]);
        if (error) throw error;
      }

      setRateLimits(limits);
      return true;
    } catch (err) {
      console.error("[SysadminSettings] Failed to update rate limits:", err);
      return false;
    }
  }, []);

  const fetchRetrySettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("sysadmin_settings")
        .select("setting_value")
        .eq("setting_key", "retry_settings")
        .maybeSingle();

      if (error) throw error;

      if (data?.setting_value) {
        const settings = data.setting_value as unknown as RetrySettings;
        setRetrySettings(settings);
        return settings;
      }
      return retrySettings;
    } catch (err) {
      console.error("[SysadminSettings] Failed to fetch retry settings:", err);
      return retrySettings;
    }
  }, [retrySettings]);

  const updateRetrySettings = useCallback(async (settings: RetrySettings) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: existing } = await supabase
        .from("sysadmin_settings")
        .select("id")
        .eq("setting_key", "retry_settings")
        .maybeSingle();

      const jsonValue = JSON.parse(JSON.stringify(settings));

      if (existing) {
        const { error } = await supabase
          .from("sysadmin_settings")
          .update({
            setting_value: jsonValue,
            updated_by: userData?.user?.id,
          })
          .eq("setting_key", "retry_settings");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("sysadmin_settings")
          .insert([{
            setting_key: "retry_settings",
            setting_value: jsonValue,
            updated_by: userData?.user?.id,
          }]);
        if (error) throw error;
      }

      setRetrySettings(settings);
      return true;
    } catch (err) {
      console.error("[SysadminSettings] Failed to update retry settings:", err);
      return false;
    }
  }, []);

  return {
    loading,
    alertRecipients,
    rateLimits,
    retrySettings,
    fetchAlertRecipients,
    updateAlertRecipients,
    fetchRateLimits,
    updateRateLimits,
    fetchRetrySettings,
    updateRetrySettings,
  };
}
