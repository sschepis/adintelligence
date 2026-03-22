import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface UsageStats {
  totalEvents: number;
  uniqueUsers: number;
  topFeatures: { feature: string; count: number }[];
  topActions: { action: string; count: number }[];
  dailyUsage: { date: string; count: number }[];
  featureBreakdown: { feature: string; users: number; events: number }[];
}

interface UsageEvent {
  id: string;
  user_id: string;
  org_id: string | null;
  feature_name: string;
  action_type: string;
  metadata: Record<string, any>;
  session_id: string | null;
  created_at: string;
}

export function useUsageAnalytics(dateRange: { from: Date; to: Date }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [events, setEvents] = useState<UsageEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch raw events within date range
      const { data: rawEvents, error } = await supabase
        .from("platform_usage")
        .select("*")
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const typedEvents = (rawEvents || []) as UsageEvent[];
      setEvents(typedEvents);

      // Calculate stats
      const uniqueUserIds = new Set(typedEvents.map(e => e.user_id));
      
      // Top features
      const featureCounts: Record<string, number> = {};
      typedEvents.forEach(e => {
        featureCounts[e.feature_name] = (featureCounts[e.feature_name] || 0) + 1;
      });
      const topFeatures = Object.entries(featureCounts)
        .map(([feature, count]) => ({ feature, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top actions
      const actionCounts: Record<string, number> = {};
      typedEvents.forEach(e => {
        actionCounts[e.action_type] = (actionCounts[e.action_type] || 0) + 1;
      });
      const topActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Daily usage
      const dailyCounts: Record<string, number> = {};
      typedEvents.forEach(e => {
        const date = new Date(e.created_at).toISOString().split('T')[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });
      const dailyUsage = Object.entries(dailyCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Feature breakdown with unique users
      const featureBreakdown = Object.entries(featureCounts).map(([feature, events]) => {
        const featureUserIds = new Set(
          typedEvents.filter(e => e.feature_name === feature).map(e => e.user_id)
        );
        return { feature, users: featureUserIds.size, events };
      }).sort((a, b) => b.events - a.events);

      setStats({
        totalEvents: typedEvents.length,
        uniqueUsers: uniqueUserIds.size,
        topFeatures,
        topActions,
        dailyUsage,
        featureBreakdown,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    stats,
    events,
    isLoading,
    refetch: fetchAnalytics,
  };
}
