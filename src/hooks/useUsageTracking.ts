import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOrganization } from "./useOrganization";

export type FeatureName = 
  | "signal_intelligence"
  | "commerce_loop"
  | "trends_and_skus"
  | "simulation_studio"
  | "active_deployment"
  | "visual_forge"
  | "writing_forge"
  | "brand_settings"
  | "analytics"
  | "admin_dashboard";

export type ActionType = 
  | "page_view"
  | "feature_use"
  | "ai_generation"
  | "export"
  | "save"
  | "delete"
  | "search"
  | "filter"
  | "campaign_deploy"
  | "trend_analyze"
  | "simulation_run"
  | "asset_generate";

interface TrackEventOptions {
  feature: FeatureName;
  action: ActionType;
  metadata?: Record<string, any>;
}

export function useUsageTracking() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const sessionId = useRef(`session-${Date.now()}`);

  const trackEvent = useCallback(async (options: TrackEventOptions) => {
    if (!user) return;

    try {
      await supabase.from("platform_usage").insert({
        user_id: user.id,
        org_id: organization?.id || null,
        feature_name: options.feature,
        action_type: options.action,
        metadata: options.metadata || {},
        session_id: sessionId.current,
      });
    } catch (error) {
      // Silent fail - don't interrupt user experience for analytics
      console.error("Usage tracking error:", error);
    }
  }, [user, organization]);

  const trackPageView = useCallback((feature: FeatureName) => {
    trackEvent({ feature, action: "page_view" });
  }, [trackEvent]);

  const trackFeatureUse = useCallback((feature: FeatureName, metadata?: Record<string, any>) => {
    trackEvent({ feature, action: "feature_use", metadata });
  }, [trackEvent]);

  const trackAIGeneration = useCallback((feature: FeatureName, generationType: string, metadata?: Record<string, any>) => {
    trackEvent({ 
      feature, 
      action: "ai_generation", 
      metadata: { generationType, ...metadata } 
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackFeatureUse,
    trackAIGeneration,
  };
}
