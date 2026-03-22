import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Eye,
  Palette,
  FileText,
  Zap,
  Activity,
  Clock,
  ArrowUpRight,
  Globe,
  Users,
  RefreshCw,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useUsageAnalytics } from "@/hooks/useUsageAnalytics";

interface FeatureUsage {
  feature: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

interface DailyActivity {
  date: string;
  signups: number;
  visualRequests: number;
  writingContent: number;
  simulations: number;
}

interface PlatformUsageEvent {
  id: string;
  user_id: string;
  org_id: string | null;
  feature_name: string;
  action_type: string;
  metadata: Record<string, any>;
  session_id: string | null;
  created_at: string;
}

export function SysAdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [topOrgs, setTopOrgs] = useState<{name: string; activity: number}[]>([]);
  const [platformUsage, setPlatformUsage] = useState<PlatformUsageEvent[]>([]);
  const [dateRange] = useState({ from: subDays(new Date(), 30), to: new Date() });
  
  const { stats, events, isLoading: analyticsLoading, refetch } = useUsageAnalytics(dateRange);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [visualRes, writingRes, simRes, campaignRes, trendsRes] = await Promise.all([
        supabase.from('visual_forge_requests').select('id, created_at'),
        supabase.from('writing_forge_content').select('id, created_at'),
        supabase.from('simulation_results').select('id, created_at'),
        supabase.from('campaigns').select('id, created_at'),
        supabase.from('saved_trends').select('id, saved_at')
      ]);

      // Feature usage stats
      setFeatureUsage([
        { feature: 'Visual Forge', count: visualRes.data?.length || 0, trend: 'up' },
        { feature: 'Writing Forge', count: writingRes.data?.length || 0, trend: 'up' },
        { feature: 'Simulations', count: simRes.data?.length || 0, trend: 'stable' },
        { feature: 'Campaigns', count: campaignRes.data?.length || 0, trend: 'up' },
        { feature: 'Saved Trends', count: trendsRes.data?.length || 0, trend: 'down' },
      ]);

      // Fetch profiles for signup data
      const { data: profilesRes } = await supabase
        .from('profiles')
        .select('created_at');

      // Generate daily activity for last 7 days with real data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        const signups = profilesRes?.filter(p => {
          const created = new Date(p.created_at);
          return created >= dayStart && created <= dayEnd;
        }).length || 0;
        
        const visualRequests = visualRes.data?.filter(r => {
          const created = new Date(r.created_at);
          return created >= dayStart && created <= dayEnd;
        }).length || 0;
        const writingContent = writingRes.data?.filter(r => {
          const created = new Date(r.created_at);
          return created >= dayStart && created <= dayEnd;
        }).length || 0;
        const simulations = simRes.data?.filter(r => {
          const created = new Date(r.created_at);
          return created >= dayStart && created <= dayEnd;
        }).length || 0;

        return {
          date: format(date, 'EEE'),
          signups,
          visualRequests,
          writingContent,
          simulations
        };
      });

      setDailyActivity(last7Days);

      // Fetch real top organizations by activity
      const { data: orgsData } = await supabase.from('organizations').select('id, name');
      const { data: usageData } = await supabase.from('platform_usage').select('org_id');
      
      if (orgsData && usageData) {
        const orgActivityMap = new Map<string, number>();
        usageData.forEach(u => {
          if (u.org_id) {
            orgActivityMap.set(u.org_id, (orgActivityMap.get(u.org_id) || 0) + 1);
          }
        });

        const topOrgsData = orgsData
          .map(org => ({
            name: org.name,
            activity: orgActivityMap.get(org.id) || 0
          }))
          .sort((a, b) => b.activity - a.activity)
          .slice(0, 5);

        setTopOrgs(topOrgsData.length > 0 ? topOrgsData : []);
      } else {
        setTopOrgs([]);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const featureIcons: Record<string, any> = {
    'Visual Forge': Palette,
    'Writing Forge': FileText,
    'Simulations': Zap,
    'Campaigns': TrendingUp,
    'Saved Trends': Eye
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">Platform usage and engagement metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            Last 30 days
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { fetchAnalytics(); refetch(); }}
            disabled={loading || analyticsLoading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${(loading || analyticsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real Usage Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-border/40 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm hover:border-primary/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/15">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-gradient-to-br from-accent/10 to-accent/5 backdrop-blur-sm hover:border-primary/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/15">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
                  <p className="text-xs text-muted-foreground">Unique Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-gradient-to-br from-signal-rising/10 to-signal-rising/5 backdrop-blur-sm hover:border-primary/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-signal-rising/15">
                  <Zap className="w-5 h-5 text-signal-rising" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.topActions.find(a => a.action === 'ai_generation')?.count || 0}</p>
                  <p className="text-xs text-muted-foreground">AI Generations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-sm hover:border-primary/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/15">
                  <Eye className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.topActions.find(a => a.action === 'page_view')?.count || 0}</p>
                  <p className="text-xs text-muted-foreground">Page Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feature Usage Cards */}
      <div className="grid grid-cols-5 gap-4">
        {featureUsage.map((feature, idx) => {
          const Icon = featureIcons[feature.feature] || Activity;
          return (
            <Card key={feature.feature} className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${COLORS[idx]}20` }}>
                    <Icon className="w-4 h-4" style={{ color: COLORS[idx] }} />
                  </div>
                  {feature.trend === 'up' && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      <ArrowUpRight className="w-3 h-3" />
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold">{feature.count}</p>
                <p className="text-sm text-muted-foreground">{feature.feature}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Daily Activity Chart */}
        <Card className="col-span-2 border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Daily Activity (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyActivity}>
                <defs>
                  <linearGradient id="visualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="writingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="simGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="visualRequests" 
                  name="Visual Forge"
                  stroke="hsl(var(--chart-1))" 
                  fill="url(#visualGradient)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="writingContent" 
                  name="Writing Forge"
                  stroke="hsl(var(--chart-2))" 
                  fill="url(#writingGradient)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="simulations" 
                  name="Simulations"
                  stroke="hsl(var(--chart-3))" 
                  fill="url(#simGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Organizations */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Most Active Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topOrgs.length > 0 ? (
              <div className="space-y-4">
                {topOrgs.map((org, idx) => (
                  <div key={org.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: COLORS[idx] }}
                      >
                        {idx + 1}
                      </div>
                      <span className="font-medium">{org.name}</span>
                    </div>
                    <span className="text-muted-foreground">{org.activity} actions</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
                <Globe className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No organization activity yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Distribution */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Feature Usage Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={featureUsage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="feature" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Real-Time Usage Breakdown from platform_usage table */}
      {stats && stats.featureBreakdown.length > 0 && (
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Real-Time Feature Engagement
              <Badge variant="secondary" className="ml-2 text-xs">Live Data</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3">By Feature</h4>
                <div className="space-y-3">
                  {stats.featureBreakdown.slice(0, 6).map((item, idx) => (
                    <div key={item.feature} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                        />
                        <span className="text-sm capitalize">{item.feature.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{item.users} users</span>
                        <span className="font-medium">{item.events} events</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-3">By Action Type</h4>
                <div className="space-y-3">
                  {stats.topActions.slice(0, 6).map((item, idx) => (
                    <div key={item.action} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[(idx + 2) % COLORS.length] }} 
                        />
                        <span className="text-sm capitalize">{item.action.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="font-medium text-sm">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Usage Trend */}
      {stats && stats.dailyUsage.length > 0 && (
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-signal-rising" />
              Daily Usage Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.dailyUsage}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="Events"
                  stroke="hsl(var(--primary))" 
                  fill="url(#usageGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
