import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOrganization } from './useOrganization';
import { toast } from 'sonner';

export interface ApiToken {
  id: string;
  name: string;
  token_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  revoked_at: string | null;
  rate_limit_requests: number;
  rate_limit_window_seconds: number;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  last_status_code: number | null;
  failure_count: number;
  created_at: string;
}

export const WEBHOOK_EVENTS = [
  { value: 'campaign.created', label: 'Campaign Created' },
  { value: 'campaign.updated', label: 'Campaign Updated' },
  { value: 'campaign.deployed', label: 'Campaign Deployed' },
  { value: 'campaign.paused', label: 'Campaign Paused' },
  { value: 'trend.detected', label: 'New Trend Detected' },
  { value: 'trend.saved', label: 'Trend Saved' },
  { value: 'inventory.low', label: 'Low Inventory Alert' },
  { value: 'inventory.synced', label: 'Inventory Synced' },
  { value: 'content.generated', label: 'Content Generated' },
  { value: 'asset.created', label: 'Asset Created' },
  { value: 'brand.updated', label: 'Brand Updated' },
];

export const API_SCOPES = [
  { value: 'read', label: 'Read', description: 'Read access to all resources' },
  { value: 'write', label: 'Write', description: 'Create and update resources' },
  { value: 'delete', label: 'Delete', description: 'Delete resources' },
  { value: 'campaigns', label: 'Campaigns', description: 'Full access to campaigns' },
  { value: 'inventory', label: 'Inventory', description: 'Full access to inventory' },
  { value: 'analytics', label: 'Analytics', description: 'Access to analytics data' },
];

export const RATE_LIMIT_PRESETS = [
  { value: 'low', label: 'Low', description: '100 req/hour', requests: 100, windowSeconds: 3600 },
  { value: 'standard', label: 'Standard', description: '1,000 req/hour', requests: 1000, windowSeconds: 3600 },
  { value: 'high', label: 'High', description: '10,000 req/hour', requests: 10000, windowSeconds: 3600 },
  { value: 'unlimited', label: 'Unlimited', description: 'No rate limit', requests: 1000000, windowSeconds: 3600 },
];

// Generate a secure random token
const generateToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Simple hash function for demo (in production, use server-side hashing)
const hashToken = async (token: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export function useDeveloperSettings() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTokens = useCallback(async () => {
    if (!organization?.id) return;

    const { data, error } = await supabase
      .from('api_tokens')
      .select('id, name, token_prefix, scopes, last_used_at, expires_at, created_at, revoked_at, rate_limit_requests, rate_limit_window_seconds')
      .eq('org_id', organization.id)
      .is('revoked_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API tokens:', error);
      return;
    }

    setTokens((data || []).map(t => ({
      ...t,
      rate_limit_requests: t.rate_limit_requests ?? 1000,
      rate_limit_window_seconds: t.rate_limit_window_seconds ?? 3600,
    })));
  }, [organization?.id]);

  const fetchWebhooks = useCallback(async () => {
    if (!organization?.id) return;

    const { data, error } = await supabase
      .from('webhooks')
      .select('id, name, url, events, is_active, last_triggered_at, last_status_code, failure_count, created_at')
      .eq('org_id', organization.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching webhooks:', error);
      return;
    }

    setWebhooks(data || []);
  }, [organization?.id]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTokens(), fetchWebhooks()]);
      setLoading(false);
    };

    if (organization?.id) {
      loadData();
    }
  }, [organization?.id, fetchTokens, fetchWebhooks]);

  const createToken = async (
    name: string, 
    scopes: string[], 
    expiresAt?: Date,
    rateLimitRequests: number = 1000,
    rateLimitWindowSeconds: number = 3600
  ) => {
    if (!organization?.id || !user?.id) {
      toast.error('Organization not found');
      return null;
    }

    const token = `inst_${generateToken()}`;
    const tokenHash = await hashToken(token);
    const tokenPrefix = token.substring(0, 12);

    const { error } = await supabase
      .from('api_tokens')
      .insert({
        org_id: organization.id,
        name,
        token_hash: tokenHash,
        token_prefix: tokenPrefix,
        scopes,
        expires_at: expiresAt?.toISOString() || null,
        created_by: user.id,
        rate_limit_requests: rateLimitRequests,
        rate_limit_window_seconds: rateLimitWindowSeconds,
      });

    if (error) {
      console.error('Error creating token:', error);
      toast.error('Failed to create API token');
      return null;
    }

    toast.success('API token created');
    await fetchTokens();
    
    // Return the full token only once - user must save it
    return token;
  };

  const revokeToken = async (tokenId: string) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('api_tokens')
      .update({ 
        revoked_at: new Date().toISOString(),
        revoked_by: user.id 
      })
      .eq('id', tokenId);

    if (error) {
      console.error('Error revoking token:', error);
      toast.error('Failed to revoke token');
      return;
    }

    toast.success('API token revoked');
    await fetchTokens();
  };

  const createWebhook = async (name: string, url: string, events: string[]) => {
    if (!organization?.id || !user?.id) {
      toast.error('Organization not found');
      return false;
    }

    // Generate webhook secret
    const secret = `whsec_${generateToken().substring(0, 32)}`;

    const { error } = await supabase
      .from('webhooks')
      .insert({
        org_id: organization.id,
        name,
        url,
        secret,
        events,
        created_by: user.id,
      });

    if (error) {
      console.error('Error creating webhook:', error);
      toast.error('Failed to create webhook');
      return false;
    }

    toast.success('Webhook created');
    await fetchWebhooks();
    return true;
  };

  const updateWebhook = async (webhookId: string, updates: Partial<Pick<Webhook, 'name' | 'url' | 'events' | 'is_active'>>) => {
    const { error } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', webhookId);

    if (error) {
      console.error('Error updating webhook:', error);
      toast.error('Failed to update webhook');
      return false;
    }

    toast.success('Webhook updated');
    await fetchWebhooks();
    return true;
  };

  const deleteWebhook = async (webhookId: string) => {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId);

    if (error) {
      console.error('Error deleting webhook:', error);
      toast.error('Failed to delete webhook');
      return false;
    }

    toast.success('Webhook deleted');
    await fetchWebhooks();
    return true;
  };

  const testWebhook = async (webhookId: string) => {
    // In production, this would trigger a test event to the webhook URL
    toast.info('Test webhook triggered (demo mode)');
    return true;
  };

  return {
    tokens,
    webhooks,
    loading,
    createToken,
    revokeToken,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    refreshTokens: fetchTokens,
    refreshWebhooks: fetchWebhooks,
  };
}
