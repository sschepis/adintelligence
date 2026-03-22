import { useState } from 'react';
import { Activity, TrendingUp, AlertTriangle, Clock, BarChart3, RefreshCw, Zap, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SettingsSection } from '@/components/shared';
import { useApiUsageAnalytics } from '@/hooks/useApiUsageAnalytics';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#10b981', '#f59e0b'];

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    POST: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    PATCH: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    PUT: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    DELETE: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  return (
    <Badge variant="outline" className={`font-mono text-xs ${colors[method] || ''}`}>
      {method}
    </Badge>
  );
}

function StatusBadge({ code }: { code: number }) {
  let className = 'bg-muted text-muted-foreground';
  if (code >= 200 && code < 300) className = 'bg-emerald-500/10 text-emerald-600';
  else if (code >= 400 && code < 500) className = 'bg-amber-500/10 text-amber-600';
  else if (code >= 500) className = 'bg-red-500/10 text-red-600';

  return (
    <Badge variant="outline" className={className}>
      {code}
    </Badge>
  );
}

export function ApiUsageAnalytics() {
  const [timeRange, setTimeRange] = useState<string>('7');
  const { stats, recentLogs, loading, refresh } = useApiUsageAnalytics(parseInt(timeRange));

  const chartData = stats?.requestsOverTime.map(d => ({
    ...d,
    date: format(new Date(d.date), 'MMM d'),
  })) || [];

  return (
    <SettingsSection
      icon={Activity}
      title="API Usage Analytics"
      animationDelay="200ms"
    >
      <div className="space-y-6">
        {/* Header with controls */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Monitor API token usage, rate limits, and popular endpoints.
          </p>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={refresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 rounded-lg bg-muted/50 animate-pulse" />
              ))}
            </div>
            <div className="h-64 rounded-lg bg-muted/50 animate-pulse" />
          </div>
        ) : !stats || stats.totalRequests === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No API usage data yet</p>
            <p className="text-sm">Usage will appear here once you start making API requests</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs">Total Requests</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.successfulRequests} successful
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs">Rate Limited</span>
                </div>
                <p className="text-2xl font-bold text-amber-500">{stats.rateLimitHits.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalRequests > 0 ? ((stats.rateLimitHits / stats.totalRequests) * 100).toFixed(1) : 0}% of requests
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">Avg Response</span>
                </div>
                <p className="text-2xl font-bold">{stats.avgResponseTime}ms</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Response time
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Server className="h-4 w-4" />
                  <span className="text-xs">Error Rate</span>
                </div>
                <p className="text-2xl font-bold text-red-500">
                  {stats.totalRequests > 0 ? ((stats.failedRequests / stats.totalRequests) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.failedRequests} failed requests
                </p>
              </div>
            </div>

            {/* Request Volume Chart */}
            <div className="rounded-lg border bg-card/50 p-4">
              <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Request Volume
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Requests"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="rateLimited"
                      name="Rate Limited"
                      stroke="hsl(var(--destructive))"
                      fill="hsl(var(--destructive))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Popular Endpoints */}
              <div className="rounded-lg border bg-card/50 p-4">
                <h4 className="text-sm font-medium mb-3">Popular Endpoints</h4>
                <div className="space-y-2">
                  {stats.requestsByEndpoint.slice(0, 5).map((ep, idx) => (
                    <div key={ep.endpoint} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{idx + 1}.</span>
                        <code className="text-xs font-mono truncate max-w-[180px]">{ep.endpoint}</code>
                      </div>
                      <Badge variant="secondary">{ep.count.toLocaleString()}</Badge>
                    </div>
                  ))}
                  {stats.requestsByEndpoint.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No endpoint data</p>
                  )}
                </div>
              </div>

              {/* Usage by Token */}
              <div className="rounded-lg border bg-card/50 p-4">
                <h4 className="text-sm font-medium mb-3">Usage by Token</h4>
                <div className="space-y-2">
                  {stats.requestsByToken.map((token) => (
                    <div key={token.token_prefix} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate max-w-[140px]">{token.token_name}</span>
                        <code className="text-xs text-muted-foreground font-mono">{token.token_prefix}...</code>
                      </div>
                      <Badge variant="secondary">{token.count.toLocaleString()}</Badge>
                    </div>
                  ))}
                  {stats.requestsByToken.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No token usage data</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Requests */}
            <div className="rounded-lg border bg-card/50 p-4">
              <h4 className="text-sm font-medium mb-3">Recent Requests</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <MethodBadge method={log.method} />
                      <code className="text-xs font-mono truncate max-w-[200px]">{log.endpoint}</code>
                    </div>
                    <div className="flex items-center gap-3">
                      {log.rate_limited && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 text-xs">
                          Rate Limited
                        </Badge>
                      )}
                      <StatusBadge code={log.status_code} />
                      {log.response_time_ms && (
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {log.response_time_ms}ms
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {recentLogs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent requests</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </SettingsSection>
  );
}
