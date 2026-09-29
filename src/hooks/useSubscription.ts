import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface SubscriptionState {
  subscribed: boolean;
  tier: string | null;
  productId: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  error: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    tier: null,
    productId: null,
    subscriptionEnd: null,
    loading: true,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setState({
        subscribed: data.subscribed || false,
        tier: data.tier || null,
        productId: data.product_id || null,
        subscriptionEnd: data.subscription_end || null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Subscription check error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to check subscription',
      }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Refresh subscription status every minute
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      if (data?.billing_configured === false) throw new Error(data.error || 'Billing is not configured yet.');
      if (!data?.url) throw new Error('No portal URL returned');
      
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Customer portal error:', error);
      throw error;
    }
  };

  return {
    ...state,
    checkSubscription,
    openCustomerPortal,
  };
}
