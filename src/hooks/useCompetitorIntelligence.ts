import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CompetitorKeyword {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  competitionLevel: string;
}

export interface CompetitorData {
  domain: string;
  topKeywords: CompetitorKeyword[];
  estimatedTraffic: number;
  estimatedAdSpend: string;
  shareOfVoice: number;
}

export interface WhiteSpaceOpportunity {
  keyword: string;
  opportunity: "high" | "medium" | "low";
  searchVolume: number;
  cpc: number;
  competitionGap: number;
}

export interface CompetitorAlert {
  id: string;
  type: "ad_spend" | "new_keyword" | "sov_change";
  competitor: string;
  message: string;
  change: string;
  severity: "high" | "medium" | "low";
  timestamp: Date;
  read: boolean;
  notified?: boolean;
}

export interface CompetitorIntelligence {
  competitors: CompetitorData[];
  whiteSpaces: WhiteSpaceOpportunity[];
  marketOverview: {
    totalMarketVolume: number;
    averageCpc: number;
    topCategories: string[];
  };
}

export interface AutoRefreshConfig {
  enabled: boolean;
  intervalMinutes: number;
  lastRefresh: Date | null;
  nextRefresh: Date | null;
}

export interface DigestConfig {
  enabled: boolean;
  frequency: "daily" | "weekly";
  email: string;
  lastSent: Date | null;
  nextScheduled: Date | null;
}

export function useCompetitorIntelligence() {
  const [isLoading, setIsLoading] = useState(false);
  const [intelligence, setIntelligence] = useState<CompetitorIntelligence | null>(null);
  const [alerts, setAlerts] = useState<CompetitorAlert[]>([]);
  const [trackedKeywords, setTrackedKeywords] = useState<string[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState<AutoRefreshConfig>({
    enabled: false,
    intervalMinutes: 15,
    lastRefresh: null,
    nextRefresh: null
  });
  const [digestConfig, setDigestConfig] = useState<DigestConfig>({
    enabled: false,
    frequency: "daily",
    email: "",
    lastSent: null,
    nextScheduled: null
  });
  const [isSendingDigest, setIsSendingDigest] = useState(false);
  const previousIntelligence = useRef<CompetitorIntelligence | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const digestIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const analyzeCompetitors = useCallback(async (
    seedKeywords: string[],
    competitorDomains?: string[]
  ) => {
    setIsLoading(true);
    try {
      const { data: relatedData, error: relatedError } = await supabase.functions.invoke("dataforseo", {
        body: {
          action: "related_keywords",
          params: { keywords: seedKeywords }
        }
      });

      if (relatedError) throw relatedError;

      const { data: volumeData, error: volumeError } = await supabase.functions.invoke("dataforseo", {
        body: {
          action: "search_volume",
          params: { keywords: seedKeywords }
        }
      });

      if (volumeError) throw volumeError;

      const relatedKeywords = relatedData?.data || [];
      const volumeResults = volumeData?.data || [];

      const whiteSpaces: WhiteSpaceOpportunity[] = relatedKeywords
        .filter((kw: any) => kw.competition < 0.5 && kw.searchVolume > 1000)
        .slice(0, 8)
        .map((kw: any) => ({
          keyword: kw.keyword,
          opportunity: kw.competition < 0.2 ? "high" : kw.competition < 0.4 ? "medium" : "low",
          searchVolume: kw.searchVolume,
          cpc: kw.cpc,
          competitionGap: Math.round((1 - kw.competition) * 100)
        }));

      const totalVolume = volumeResults.reduce((sum: number, kw: any) => sum + (kw.searchVolume || 0), 0);
      const avgCpc = volumeResults.length > 0 
        ? volumeResults.reduce((sum: number, kw: any) => sum + (kw.cpc || 0), 0) / volumeResults.length 
        : 0;

      const competitors: CompetitorData[] = (competitorDomains || ["competitor1.com", "competitor2.com"]).map((domain, index) => ({
        domain,
        topKeywords: relatedKeywords.slice(index * 3, (index + 1) * 3).map((kw: any) => ({
          keyword: kw.keyword,
          searchVolume: kw.searchVolume || 0,
          cpc: kw.cpc || 0,
          competition: kw.competition || 0,
          competitionLevel: kw.competition > 0.7 ? "HIGH" : kw.competition > 0.4 ? "MEDIUM" : "LOW"
        })),
        estimatedTraffic: Math.floor(totalVolume * (0.3 - index * 0.1)),
        estimatedAdSpend: `$${Math.floor(avgCpc * totalVolume * (0.3 - index * 0.1) / 1000)}K/mo`,
        shareOfVoice: Math.floor(30 - index * 8)
      }));

      const intelligenceData: CompetitorIntelligence = {
        competitors,
        whiteSpaces,
        marketOverview: {
          totalMarketVolume: totalVolume,
          averageCpc: Math.round(avgCpc * 100) / 100,
          topCategories: seedKeywords.slice(0, 3)
        }
      };

      // Check for changes and generate alerts
      if (previousIntelligence.current && isTracking) {
        generateAlerts(previousIntelligence.current, intelligenceData);
      }
      
      previousIntelligence.current = intelligenceData;
      setIntelligence(intelligenceData);
      
      // Update auto-refresh timestamps
      setAutoRefresh(prev => ({
        ...prev,
        lastRefresh: new Date(),
        nextRefresh: prev.enabled ? new Date(Date.now() + prev.intervalMinutes * 60 * 1000) : null
      }));
      
      toast.success("Competitor intelligence loaded");
      return intelligenceData;

    } catch (error) {
      console.error("Competitor intelligence error:", error);
      toast.error("Failed to fetch competitor data");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isTracking]);

  const generateAlerts = useCallback((prev: CompetitorIntelligence, current: CompetitorIntelligence) => {
    const newAlerts: CompetitorAlert[] = [];
    
    current.competitors.forEach((competitor, index) => {
      const prevCompetitor = prev.competitors[index];
      if (!prevCompetitor) return;

      // Check for ad spend changes
      const prevSpend = parseInt(prevCompetitor.estimatedAdSpend.replace(/\D/g, ''));
      const currentSpend = parseInt(competitor.estimatedAdSpend.replace(/\D/g, ''));
      const spendChange = ((currentSpend - prevSpend) / prevSpend) * 100;
      
      if (Math.abs(spendChange) > 10) {
        newAlerts.push({
          id: `spend-${Date.now()}-${index}`,
          type: "ad_spend",
          competitor: competitor.domain,
          message: `${competitor.domain} ${spendChange > 0 ? 'increased' : 'decreased'} ad spend`,
          change: `${spendChange > 0 ? '+' : ''}${spendChange.toFixed(0)}%`,
          severity: Math.abs(spendChange) > 30 ? "high" : "medium",
          timestamp: new Date(),
          read: false,
          notified: false
        });
      }

      // Check for new keywords
      const prevKeywords = new Set(prevCompetitor.topKeywords.map(k => k.keyword));
      const newKeywords = competitor.topKeywords.filter(k => !prevKeywords.has(k.keyword));
      
      newKeywords.forEach(kw => {
        newAlerts.push({
          id: `keyword-${Date.now()}-${kw.keyword}`,
          type: "new_keyword",
          competitor: competitor.domain,
          message: `${competitor.domain} targeting new keyword: "${kw.keyword}"`,
          change: `${(kw.searchVolume / 1000).toFixed(0)}K vol`,
          severity: kw.searchVolume > 10000 ? "high" : "medium",
          timestamp: new Date(),
          read: false,
          notified: false
        });
      });

      // Check for share of voice changes
      const sovChange = competitor.shareOfVoice - prevCompetitor.shareOfVoice;
      if (Math.abs(sovChange) > 5) {
        newAlerts.push({
          id: `sov-${Date.now()}-${index}`,
          type: "sov_change",
          competitor: competitor.domain,
          message: `${competitor.domain} share of voice ${sovChange > 0 ? 'increased' : 'decreased'}`,
          change: `${sovChange > 0 ? '+' : ''}${sovChange}%`,
          severity: Math.abs(sovChange) > 10 ? "high" : "low",
          timestamp: new Date(),
          read: false,
          notified: false
        });
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 50));
      toast.warning(`${newAlerts.length} new competitor alert${newAlerts.length > 1 ? 's' : ''}`);
      
      // Send notifications for high-priority alerts
      const highPriorityAlerts = newAlerts.filter(a => a.severity === "high");
      if (highPriorityAlerts.length > 0) {
        sendAlertNotifications(highPriorityAlerts);
      }
    }
  }, []);

  const sendAlertNotifications = useCallback(async (alertsToNotify: CompetitorAlert[]) => {
    try {
      // Request browser notification permission
      if ("Notification" in window && Notification.permission === "granted") {
        alertsToNotify.forEach(alert => {
          new Notification("Competitor Alert", {
            body: alert.message,
            icon: "/favicon.ico",
            tag: alert.id
          });
        });
      }
      
      // Mark alerts as notified
      setAlerts(prev => prev.map(a => 
        alertsToNotify.some(n => n.id === a.id) ? { ...a, notified: true } : a
      ));

      // Send email notification via edge function
      await supabase.functions.invoke("send-access-notification", {
        body: {
          type: "competitor_alert",
          alerts: alertsToNotify.map(a => ({
            competitor: a.competitor,
            message: a.message,
            change: a.change,
            severity: a.severity
          }))
        }
      });
    } catch (error) {
      console.error("Failed to send alert notifications:", error);
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }, []);

  const startTracking = useCallback((keywords: string[]) => {
    setTrackedKeywords(keywords);
    setIsTracking(true);
    toast.success(`Tracking ${keywords.length} keywords for competitor changes`);
  }, []);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    toast.info("Competitor tracking paused");
  }, []);

  const enableAutoRefresh = useCallback((intervalMinutes: number = 15) => {
    setAutoRefresh(prev => ({
      ...prev,
      enabled: true,
      intervalMinutes,
      nextRefresh: new Date(Date.now() + intervalMinutes * 60 * 1000)
    }));
    toast.success(`Auto-refresh enabled every ${intervalMinutes} minutes`);
  }, []);

  const disableAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    setAutoRefresh(prev => ({
      ...prev,
      enabled: false,
      nextRefresh: null
    }));
    toast.info("Auto-refresh disabled");
  }, []);

  const setRefreshInterval = useCallback((minutes: number) => {
    setAutoRefresh(prev => ({
      ...prev,
      intervalMinutes: minutes,
      nextRefresh: prev.enabled ? new Date(Date.now() + minutes * 60 * 1000) : null
    }));
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh.enabled && trackedKeywords.length > 0) {
      refreshIntervalRef.current = setInterval(() => {
        analyzeCompetitors(trackedKeywords);
      }, autoRefresh.intervalMinutes * 60 * 1000);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh.enabled, autoRefresh.intervalMinutes, trackedKeywords, analyzeCompetitors]);

  const markAlertRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, read: true } : a
    ));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const clearIntelligence = useCallback(() => {
    setIntelligence(null);
  }, []);

  const sendDigest = useCallback(async (email?: string) => {
    if (!intelligence) {
      toast.error("No intelligence data to send");
      return false;
    }

    const targetEmail = email || digestConfig.email;
    if (!targetEmail) {
      toast.error("No email configured for digest");
      return false;
    }

    setIsSendingDigest(true);
    try {
      const now = new Date();
      const periodStart = digestConfig.frequency === "daily" 
        ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
        : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { error } = await supabase.functions.invoke("send-competitor-digest", {
        body: {
          email: targetEmail,
          digestType: digestConfig.frequency,
          data: {
            competitors: intelligence.competitors,
            whiteSpaces: intelligence.whiteSpaces,
            alerts: alerts.slice(0, 10).map(a => ({
              type: a.type,
              competitor: a.competitor,
              message: a.message,
              change: a.change,
              severity: a.severity
            })),
            marketOverview: intelligence.marketOverview
          },
          periodStart: periodStart.toISOString(),
          periodEnd: now.toISOString()
        }
      });

      if (error) throw error;

      setDigestConfig(prev => ({
        ...prev,
        lastSent: now,
        nextScheduled: prev.enabled ? getNextScheduledDate(prev.frequency) : null
      }));

      toast.success(`${digestConfig.frequency === "daily" ? "Daily" : "Weekly"} digest sent to ${targetEmail}`);
      return true;
    } catch (error) {
      console.error("Failed to send digest:", error);
      toast.error("Failed to send digest email");
      return false;
    } finally {
      setIsSendingDigest(false);
    }
  }, [intelligence, alerts, digestConfig]);

  const enableDigest = useCallback((email: string, frequency: "daily" | "weekly" = "daily") => {
    const nextScheduled = getNextScheduledDate(frequency);
    setDigestConfig({
      enabled: true,
      frequency,
      email,
      lastSent: null,
      nextScheduled
    });
    toast.success(`${frequency === "daily" ? "Daily" : "Weekly"} digest enabled for ${email}`);
  }, []);

  const disableDigest = useCallback(() => {
    if (digestIntervalRef.current) {
      clearInterval(digestIntervalRef.current);
      digestIntervalRef.current = null;
    }
    setDigestConfig(prev => ({
      ...prev,
      enabled: false,
      nextScheduled: null
    }));
    toast.info("Email digest disabled");
  }, []);

  const updateDigestFrequency = useCallback((frequency: "daily" | "weekly") => {
    setDigestConfig(prev => ({
      ...prev,
      frequency,
      nextScheduled: prev.enabled ? getNextScheduledDate(frequency) : null
    }));
  }, []);

  // Digest scheduling effect
  useEffect(() => {
    if (digestConfig.enabled && digestConfig.email && intelligence) {
      const checkAndSendDigest = () => {
        const now = new Date();
        if (digestConfig.nextScheduled && now >= digestConfig.nextScheduled) {
          sendDigest();
        }
      };

      // Check every hour
      digestIntervalRef.current = setInterval(checkAndSendDigest, 60 * 60 * 1000);

      return () => {
        if (digestIntervalRef.current) {
          clearInterval(digestIntervalRef.current);
        }
      };
    }
  }, [digestConfig.enabled, digestConfig.email, digestConfig.nextScheduled, intelligence, sendDigest]);

  const unreadAlertCount = alerts.filter(a => !a.read).length;

  return {
    intelligence,
    isLoading,
    alerts,
    unreadAlertCount,
    isTracking,
    trackedKeywords,
    autoRefresh,
    digestConfig,
    isSendingDigest,
    analyzeCompetitors,
    startTracking,
    stopTracking,
    enableAutoRefresh,
    disableAutoRefresh,
    setRefreshInterval,
    requestNotificationPermission,
    markAlertRead,
    clearAlerts,
    clearIntelligence,
    enableDigest,
    disableDigest,
    updateDigestFrequency,
    sendDigest
  };
}

function getNextScheduledDate(frequency: "daily" | "weekly"): Date {
  const now = new Date();
  if (frequency === "daily") {
    // Schedule for 9 AM next day
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    next.setHours(9, 0, 0, 0);
    return next;
  } else {
    // Schedule for Monday 9 AM
    const next = new Date(now);
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    next.setDate(next.getDate() + daysUntilMonday);
    next.setHours(9, 0, 0, 0);
    return next;
  }
}
