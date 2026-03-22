import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ShopifyConnection {
  id: string;
  shop_domain: string;
  created_at: string;
}

export function useShopifyConnection() {
  const { user } = useAuth();
  const [connection, setConnection] = useState<ShopifyConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnection = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user's org_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.org_id) {
        setLoading(false);
        return;
      }

      // Get Shopify connection for org
      const { data, error: fetchError } = await supabase
        .from('shopify_connections')
        .select('id, shop_domain, created_at')
        .eq('org_id', profile.org_id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setConnection(data);
    } catch (err: any) {
      console.error('Shopify connection fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  return {
    connection,
    loading,
    error,
    refetch: fetchConnection,
  };
}
