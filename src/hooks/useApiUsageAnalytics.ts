import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { startOfDay, subDays, format } from 'date-fns';

export interface ApiUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitHits: number;
  avgResponseTime: number;
  requestsByEndpoint: { endpoint: string; count: number }[];
  requestsByMethod: { method: string; count: number }[];
  requestsByToken: { token_name: string; token_prefix: string; count: number }[];
  requestsOverTime: { date: string; count: number; rateLimited: number }[];
  topStatusCodes: { status_code: number; count: number }[];
}

export interface ApiUsageLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number | null;
  rate_limited: boolean;
  created_at: string;
  token_id: string | null;
}

export function useApiUsageAnalytics(days: number = 7) {
  const { organization } = useOrganization();
  const [stats, setStats] = useState<ApiUsageStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<ApiUsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!organization?.id) return;

    setLoading(true);
    const startDate = subDays(new Date(), days).toISOString();

    try {
      // Fetch all logs for the period
      const { data: logs, error } = await supabase
        .from('api_usage_logs')
        .select('*')
        .eq('org_id', organization.id)
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching API usage:', error);
        setLoading(false);
        return;
      }

      // Also fetch token info for names
      const { data: tokens } = await supabase
        .from('api_tokens')
        .select('id, name, token_prefix')
        .eq('org_id', organization.id);

      const tokenMap = new Map(tokens?.map(t => [t.id, t]) || []);

      // Calculate stats
      const totalRequests = logs?.length || 0;
      const successfulRequests = logs?.filter(l => l.status_code >= 200 && l.status_code < 300).length || 0;
      const failedRequests = logs?.filter(l => l.status_code >= 400).length || 0;
      const rateLimitHits = logs?.filter(l => l.rate_limited).length || 0;
      
      const responseTimes = logs?.filter(l => l.response_time_ms).map(l => l.response_time_ms as number) || [];
      const avgResponseTime = responseTimes.length > 0 
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;

      // Group by endpoint
      const endpointCounts = new Map<string, number>();
      logs?.forEach(l => {
        endpointCounts.set(l.endpoint, (endpointCounts.get(l.endpoint) || 0) + 1);
      });
      const requestsByEndpoint = Array.from(endpointCounts.entries())
        .map(([endpoint, count]) => ({ endpoint, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Group by method
      const methodCounts = new Map<string, number>();
      logs?.forEach(l => {
        methodCounts.set(l.method, (methodCounts.get(l.method) || 0) + 1);
      });
      const requestsByMethod = Array.from(methodCounts.entries())
        .map(([method, count]) => ({ method, count }))
        .sort((a, b) => b.count - a.count);

      // Group by token
      const tokenCounts = new Map<string, number>();
      logs?.forEach(l => {
        if (l.token_id) {
          tokenCounts.set(l.token_id, (tokenCounts.get(l.token_id) || 0) + 1);
        }
      });
      const requestsByToken = Array.from(tokenCounts.entries())
        .map(([tokenId, count]) => {
          const token = tokenMap.get(tokenId);
          return {
            token_name: token?.name || 'Unknown',
            token_prefix: token?.token_prefix || 'N/A',
            count
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Group by date
      const dateCounts = new Map<string, { count: number; rateLimited: number }>();
      for (let i = days - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dateCounts.set(date, { count: 0, rateLimited: 0 });
      }
      logs?.forEach(l => {
        const date = format(new Date(l.created_at), 'yyyy-MM-dd');
        const existing = dateCounts.get(date) || { count: 0, rateLimited: 0 };
        dateCounts.set(date, {
          count: existing.count + 1,
          rateLimited: existing.rateLimited + (l.rate_limited ? 1 : 0)
        });
      });
      const requestsOverTime = Array.from(dateCounts.entries())
        .map(([date, data]) => ({ date, ...data }));

      // Group by status code
      const statusCounts = new Map<number, number>();
      logs?.forEach(l => {
        statusCounts.set(l.status_code, (statusCounts.get(l.status_code) || 0) + 1);
      });
      const topStatusCodes = Array.from(statusCounts.entries())
        .map(([status_code, count]) => ({ status_code, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalRequests,
        successfulRequests,
        failedRequests,
        rateLimitHits,
        avgResponseTime,
        requestsByEndpoint,
        requestsByMethod,
        requestsByToken,
        requestsOverTime,
        topStatusCodes
      });

      // Set recent logs (last 20)
      setRecentLogs((logs || []).slice(0, 20));
    } catch (err) {
      console.error('Error processing API usage data:', err);
    } finally {
      setLoading(false);
    }
  }, [organization?.id, days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    stats,
    recentLogs,
    loading,
    refresh: fetchAnalytics
  };
}
