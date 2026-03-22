import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  type: "trend" | "alert" | "success" | "campaign" | "inventory" | "ai";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority?: "low" | "medium" | "high";
}

export interface NotificationPreferences {
  sound: boolean;
  push: boolean;
  types: {
    trend: boolean;
    alert: boolean;
    success: boolean;
    campaign: boolean;
    inventory: boolean;
    ai: boolean;
  };
}

const STORAGE_KEY = "app_notifications";
const PREFERENCES_KEY = "notification_preferences";

const defaultPreferences: NotificationPreferences = {
  sound: true,
  push: true,
  types: {
    trend: true,
    alert: true,
    success: true,
    campaign: true,
    inventory: true,
    ai: true
  }
};

const loadNotificationsFromStorage = (): Notification[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    }
  } catch (e) {
    console.error("Failed to load notifications:", e);
  }
  return [];
};

const saveNotificationsToStorage = (notifications: Notification[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error("Failed to save notifications:", e);
  }
};

const loadPreferences = (): NotificationPreferences => {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load preferences:", e);
  }
  return defaultPreferences;
};

const savePreferences = (prefs: NotificationPreferences) => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error("Failed to save preferences:", e);
  }
};

// Notification sound
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.log("Could not play notification sound:", e);
  }
};

// Request push notification permission
const requestPushPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }
  
  if (Notification.permission === "granted") {
    return true;
  }
  
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  
  return false;
};

// Show browser push notification
const showPushNotification = (title: string, body: string, onClick?: () => void) => {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: "instincts-notification",
      requireInteraction: false
    });
    
    if (onClick) {
      notification.onclick = () => {
        window.focus();
        onClick();
        notification.close();
      };
    }
    
    setTimeout(() => notification.close(), 5000);
  }
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(loadNotificationsFromStorage);
  const [preferences, setPreferences] = useState<NotificationPreferences>(loadPreferences);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied"
  );

  // Save to localStorage whenever notifications change
  useEffect(() => {
    saveNotificationsToStorage(notifications);
  }, [notifications]);

  // Save preferences when they change
  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  // Request push permission on mount if enabled
  useEffect(() => {
    if (preferences.push && pushPermission === "default") {
      requestPushPermission().then((granted) => {
        setPushPermission(granted ? "granted" : "denied");
      });
    }
  }, [preferences.push, pushPermission]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    // Check if notification type is enabled
    if (!preferences.types[notification.type]) {
      return;
    }

    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
      priority: notification.priority || "medium"
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));

    // Play sound for high/medium priority if enabled
    if (preferences.sound && (notification.priority === "high" || notification.priority === "medium")) {
      playNotificationSound();
    }

    // Show push notification for high priority if enabled
    if (preferences.push && notification.priority === "high" && pushPermission === "granted") {
      showPushNotification(notification.title, notification.message, () => {
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
      });
    }
  }, [preferences, pushPermission]);

  // Listen for real-time campaign changes
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const channel = supabase
        .channel('campaign-notifications')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'campaigns',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const campaign = payload.new as any;
            const oldCampaign = payload.old as any;
            
            // Check if campaign needs attention (low performance or over budget)
            if (campaign.performance_score && campaign.performance_score < 30) {
              addNotification({
                type: "alert",
                title: "Campaign Needs Attention",
                message: `"${campaign.name}" has a low performance score of ${campaign.performance_score}. Consider optimizing.`,
                actionUrl: "/deployment",
                priority: "high"
              });
            }
            
            if (campaign.spent > campaign.daily_budget * 0.9) {
              addNotification({
                type: "campaign",
                title: "Budget Alert",
                message: `"${campaign.name}" is approaching its daily budget limit.`,
                actionUrl: "/deployment",
                priority: "high"
              });
            }

            // Notify on status changes
            if (oldCampaign?.status !== campaign.status) {
              addNotification({
                type: "campaign",
                title: "Campaign Status Changed",
                message: `"${campaign.name}" is now ${campaign.status}.`,
                actionUrl: "/deployment",
                priority: "low"
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'campaigns',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const campaign = payload.new as any;
            addNotification({
              type: "success",
              title: "Campaign Created",
              message: `"${campaign.name}" has been created successfully.`,
              actionUrl: "/deployment",
              priority: "low"
            });
          }
        )
        .subscribe((status) => {
          console.log("Campaign notification subscription status:", status);
        });

      return channel;
    };

    let channel: ReturnType<typeof supabase.channel> | null = null;
    setupRealtimeSubscription().then(ch => { channel = ch; });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [addNotification]);

  // Listen for new saved trends
  useEffect(() => {
    const setupTrendSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const channel = supabase
        .channel('trend-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'saved_trends',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const trend = payload.new as any;
            addNotification({
              type: "trend",
              title: "New Trend Saved",
              message: `"${trend.trend_name}" has been added to your saved trends.`,
              actionUrl: "/signals",
              priority: "low"
            });
          }
        )
        .subscribe((status) => {
          console.log("Trend notification subscription status:", status);
        });

      return channel;
    };

    let channel: ReturnType<typeof supabase.channel> | null = null;
    setupTrendSubscription().then(ch => { channel = ch; });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [addNotification]);

  // Listen for A/B test results updates
  useEffect(() => {
    const setupABTestSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const channel = supabase
        .channel('abtest-notifications')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'ab_test_results',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const test = payload.new as any;
            if (test.status === 'concluded' && test.winner) {
              addNotification({
                type: "ai",
                title: "A/B Test Concluded",
                message: `Test for "${test.suggestion_text}" completed. Winner: ${test.winner}.`,
                actionUrl: "/deployment",
                priority: "medium"
              });
            }
          }
        )
        .subscribe((status) => {
          console.log("A/B test notification subscription status:", status);
        });

      return channel;
    };

    let channel: ReturnType<typeof supabase.channel> | null = null;
    setupABTestSubscription().then(ch => { channel = ch; });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [addNotification]);

  // Periodic check for trend opportunities
  useEffect(() => {
    const checkForTrendAlerts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (campaigns && campaigns.length > 0) {
          const underperforming = campaigns.filter(c => (c.performance_score || 0) < 40);
          if (underperforming.length > 0 && Math.random() > 0.7) {
            addNotification({
              type: "ai",
              title: "AI Recommendation",
              message: `${underperforming.length} campaign(s) could benefit from trend-based optimization.`,
              actionUrl: "/commerce",
              priority: "medium"
            });
          }
        }
      } catch (error) {
        console.error("Error checking trend alerts:", error);
      }
    };

    checkForTrendAlerts();
    const interval = setInterval(checkForTrendAlerts, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [addNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleTypePreference = useCallback((type: keyof NotificationPreferences["types"]) => {
    setPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type]
      }
    }));
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await requestPushPermission();
    setPushPermission(granted ? "granted" : "denied");
    return granted;
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    preferences,
    pushPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    updatePreferences,
    toggleTypePreference,
    requestPermission
  };
}
