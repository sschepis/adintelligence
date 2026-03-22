import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { ABTestConfig, MorphSuggestion } from "./useCampaignMorphing";

export interface SavedABTest {
  id: string;
  user_id: string;
  suggestion_id: string;
  suggestion_type: string;
  suggestion_text: string;
  campaign_name: string | null;
  traffic_percent: number;
  started_at: string;
  concluded_at: string | null;
  status: string;
  control_impressions: number;
  control_clicks: number;
  control_conversions: number;
  control_ctr: number;
  variant_impressions: number;
  variant_clicks: number;
  variant_conversions: number;
  variant_ctr: number;
  winner: string | null;
  confidence_level: string | null;
  created_at: string;
  updated_at: string;
}

export interface ABTestSchedule {
  id: string;
  user_id: string;
  name: string;
  enabled: boolean;
  schedule_type: "time_of_day" | "audience_segment";
  start_time: string | null;
  end_time: string | null;
  days_of_week: number[];
  audience_segments: string[] | null;
  traffic_percent: number;
  auto_conclude_hours: number;
  created_at: string;
  updated_at: string;
}

export function useABTestPersistence() {
  const { user } = useAuth();
  const [savedTests, setSavedTests] = useState<SavedABTest[]>([]);
  const [schedules, setSchedules] = useState<ABTestSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved tests from database
  const loadSavedTests = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ab_test_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedTests((data as SavedABTest[]) || []);
    } catch (error) {
      console.error("Error loading saved tests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load schedules from database
  const loadSchedules = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("ab_test_schedules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSchedules((data as ABTestSchedule[]) || []);
    } catch (error) {
      console.error("Error loading schedules:", error);
    }
  }, [user]);

  // Save a new test to database
  const saveTest = useCallback(async (
    test: ABTestConfig,
    suggestion: MorphSuggestion,
    campaignName?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("ab_test_results")
        .insert({
          user_id: user.id,
          suggestion_id: test.suggestionId,
          suggestion_type: suggestion.type,
          suggestion_text: suggestion.suggestion,
          campaign_name: campaignName,
          traffic_percent: test.trafficPercent,
          started_at: test.startedAt.toISOString(),
          status: test.status,
          control_impressions: test.controlMetrics.impressions,
          control_clicks: test.controlMetrics.clicks,
          control_conversions: test.controlMetrics.conversions,
          control_ctr: test.controlMetrics.ctr,
          variant_impressions: test.variantMetrics.impressions,
          variant_clicks: test.variantMetrics.clicks,
          variant_conversions: test.variantMetrics.conversions,
          variant_ctr: test.variantMetrics.ctr,
          winner: test.winner || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setSavedTests(prev => [data as SavedABTest, ...prev]);
      toast.success("A/B test saved to history");
      return data;
    } catch (error) {
      console.error("Error saving test:", error);
      toast.error("Failed to save test");
      return null;
    }
  }, [user]);

  // Update test results in database
  const updateTestResults = useCallback(async (
    suggestionId: string,
    test: ABTestConfig,
    confidenceLevel?: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("ab_test_results")
        .update({
          status: test.status,
          concluded_at: test.status === "concluded" ? new Date().toISOString() : null,
          control_impressions: test.controlMetrics.impressions,
          control_clicks: test.controlMetrics.clicks,
          control_conversions: test.controlMetrics.conversions,
          control_ctr: test.controlMetrics.ctr,
          variant_impressions: test.variantMetrics.impressions,
          variant_clicks: test.variantMetrics.clicks,
          variant_conversions: test.variantMetrics.conversions,
          variant_ctr: test.variantMetrics.ctr,
          winner: test.winner || null,
          confidence_level: confidenceLevel || null,
        })
        .eq("suggestion_id", suggestionId)
        .eq("user_id", user.id)
        .eq("status", "running");

      if (error) throw error;
      
      await loadSavedTests();
      return true;
    } catch (error) {
      console.error("Error updating test:", error);
      return false;
    }
  }, [user, loadSavedTests]);

  // Delete a saved test
  const deleteTest = useCallback(async (testId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("ab_test_results")
        .delete()
        .eq("id", testId)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setSavedTests(prev => prev.filter(t => t.id !== testId));
      toast.success("Test deleted");
      return true;
    } catch (error) {
      console.error("Error deleting test:", error);
      toast.error("Failed to delete test");
      return false;
    }
  }, [user]);

  // Create a new schedule
  const createSchedule = useCallback(async (schedule: Omit<ABTestSchedule, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("ab_test_schedules")
        .insert({
          user_id: user.id,
          ...schedule,
        })
        .select()
        .single();

      if (error) throw error;
      
      setSchedules(prev => [data as ABTestSchedule, ...prev]);
      toast.success("Schedule created");
      return data;
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast.error("Failed to create schedule");
      return null;
    }
  }, [user]);

  // Update a schedule
  const updateSchedule = useCallback(async (scheduleId: string, updates: Partial<ABTestSchedule>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("ab_test_schedules")
        .update(updates)
        .eq("id", scheduleId)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setSchedules(prev => prev.map(s => 
        s.id === scheduleId ? { ...s, ...updates } : s
      ));
      return true;
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule");
      return false;
    }
  }, [user]);

  // Toggle schedule enabled/disabled
  const toggleSchedule = useCallback(async (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return false;

    return updateSchedule(scheduleId, { enabled: !schedule.enabled });
  }, [schedules, updateSchedule]);

  // Delete a schedule
  const deleteSchedule = useCallback(async (scheduleId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("ab_test_schedules")
        .delete()
        .eq("id", scheduleId)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      toast.success("Schedule deleted");
      return true;
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
      return false;
    }
  }, [user]);

  // Check if current time matches any schedule
  const checkActiveSchedules = useCallback(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    return schedules.filter(schedule => {
      if (!schedule.enabled) return false;
      
      if (schedule.schedule_type === "time_of_day") {
        const dayMatch = schedule.days_of_week.includes(currentDay);
        if (!dayMatch) return false;
        
        if (schedule.start_time && schedule.end_time) {
          return currentTime >= schedule.start_time && currentTime <= schedule.end_time;
        }
      }
      
      return schedule.enabled;
    });
  }, [schedules]);

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadSavedTests();
      loadSchedules();
    }
  }, [user, loadSavedTests, loadSchedules]);

  return {
    savedTests,
    schedules,
    isLoading,
    loadSavedTests,
    loadSchedules,
    saveTest,
    updateTestResults,
    deleteTest,
    createSchedule,
    updateSchedule,
    toggleSchedule,
    deleteSchedule,
    checkActiveSchedules,
  };
}
