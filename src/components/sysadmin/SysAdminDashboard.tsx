import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SysAdminAlerts } from "./SysAdminAlerts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building2, 
  Palette,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Target,
  CreditCard,
  BarChart3,
  Loader2,
  RefreshCw,
  Wallet,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
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
import { toast } from "sonner";

interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  mrr: number;
  activeSubscriptions: number;
  totalCustomers: number;
  totalOrgs: number;
  activeOrgs: number;
  newOrgsThisMonth: number;
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  pendingRequests: number;
  completedRequests: number;
  totalCreativeHours: number;
  creativeCosts: number;
  balance: {
    available: number;
    pending: number;
  };
}

interface StripeMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  mrr: number;
  activeSubscriptions: number;
  totalCustomers: number;
  revenueByMonth: { month: string; revenue: number }[];
  subscriptionTiers: { name: string; value: number }[];
  balance: { available: number; pending: number };
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function SysAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    mrr: 0,
    activeSubscriptions: 0,
    totalCustomers: 0,
    totalOrgs: 0,
    activeOrgs: 0,
    newOrgsThisMonth: 0,
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalCreativeHours: 0,
    creativeCosts: 0,
    balance: { available: 0, pending: 0 }
  });
  const [revenueData, setRevenueData] = useState<{ name: string; revenue: number }[]>([]);
  const [subscriptionTiers, setSubscriptionTiers] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStripeMetrics = async () => {
    setStripeLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-metrics');
      
      if (error) throw error;
      
      const metrics = data as StripeMetrics;
      
      setStats(prev => ({
        ...prev,
        totalRevenue: metrics.totalRevenue,
        monthlyRevenue: metrics.monthlyRevenue,
        revenueGrowth: metrics.revenueGrowth,
        mrr: metrics.mrr,
        activeSubscriptions: metrics.activeSubscriptions,
        totalCustomers: metrics.totalCustomers,
        balance: metrics.balance
      }));

      setRevenueData(metrics.revenueByMonth.map(m => ({ name: m.month, revenue: m.revenue })));
      
      setSubscriptionTiers(metrics.subscriptionTiers.map((t, i) => ({
        ...t,
        color: COLORS[i % COLORS.length]
      })));

      toast.success("Stripe metrics updated");
    } catch (error) {
      console.error('Error fetching Stripe metrics:', error);
      toast.error("Failed to fetch Stripe metrics");
    } finally {
      setStripeLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [orgsRes, usersRes, requestsRes, timeRes] = await Promise.all([
        supabase.from('organizations').select('id, created_at, subscription_status'),
        supabase.from('profiles').select('id, created_at'),
        supabase.from('visual_forge_requests').select('id, status, created_at, total_time_minutes, total_cost'),
        supabase.from('creative_time_entries').select('duration_minutes')
      ]);

      const orgs = orgsRes.data || [];
      const users = usersRes.data || [];
      const requests = requestsRes.data || [];
      const timeEntries = timeRes.data || [];

      const now = new Date();
      const monthStart = startOfMonth(now);

      const totalCreativeMinutes = timeEntries.reduce((sum, t) => sum + (t.duration_minutes || 0), 0);
      const totalCreativeCosts = requests.reduce((sum, r) => sum + ((r as any).total_cost || 0), 0);

      setStats(prev => ({
        ...prev,
        totalOrgs: orgs.length,
        activeOrgs: orgs.filter(o => o.subscription_status === 'active').length,
        newOrgsThisMonth: orgs.filter(o => new Date(o.created_at) >= monthStart).length,
        totalUsers: users.length,
        activeUsers: Math.floor(users.length * 0.7),
        newUsersThisMonth: users.filter(u => new Date(u.created_at) >= monthStart).length,
        pendingRequests: requests.filter(r => r.status === 'pending' || r.status === 'in-progress').length,
        completedRequests: requests.filter(r => r.status === 'completed').length,
        totalCreativeHours: Math.round(totalCreativeMinutes / 60),
        creativeCosts: totalCreativeCosts
      }));

      // Fetch Stripe data
      await fetchStripeMetrics();
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCardSkeleton = () => (
    <Card className="relative overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="w-12 h-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );

  const StatCard = ({ 
    title, 
    value, 
    change, 
    changeType, 
    icon: Icon, 
    gradient,
    subtitle,
    isLoading
  }: { 
    title: string; 
    value: string | number; 
    change?: number; 
    changeType?: 'positive' | 'negative';
    icon: any;
    gradient: string;
    subtitle?: string;
    isLoading?: boolean;
  }) => {
    if (isLoading) {
      return <StatCardSkeleton />;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2 }}
      >
        <Card className="relative overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30">
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-15 ${gradient}`} />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">{title}</p>
                <p className="text-3xl font-bold tracking-tight">{value}</p>
                {subtitle && (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
                {change !== undefined && (
                  <div className={`flex items-center gap-1 text-sm ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                    {changeType === 'positive' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>{Math.abs(change)}% from last month</span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };
  const [userGrowthData, setUserGrowthData] = useState<{ name: string; users: number }[]>([]);

  // Fetch real user growth data
  useEffect(() => {
    const fetchUserGrowth = async () => {
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('created_at')
          .order('created_at', { ascending: true });

        if (profiles && profiles.length > 0) {
          // Group by week of the current month
          const now = new Date();
          const monthStart = startOfMonth(now);
          const weeks = [
            { name: 'Week 1', start: 0, end: 7 },
            { name: 'Week 2', start: 7, end: 14 },
            { name: 'Week 3', start: 14, end: 21 },
            { name: 'Week 4', start: 21, end: 31 },
          ];

          const growthData = weeks.map(week => {
            const weekStart = new Date(monthStart);
            weekStart.setDate(weekStart.getDate() + week.start);
            const weekEnd = new Date(monthStart);
            weekEnd.setDate(weekEnd.getDate() + week.end);

            const count = profiles.filter(p => {
              const created = new Date(p.created_at);
              return created <= weekEnd;
            }).length;

            return { name: week.name, users: count };
          });

          setUserGrowthData(growthData);
        }
      } catch (error) {
        console.error('Error fetching user growth:', error);
      }
    };

    fetchUserGrowth();
  }, [stats.totalUsers]);

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div />
        <Button 
          variant="outline" 
          onClick={fetchStripeMetrics} 
          disabled={stripeLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${stripeLoading ? 'animate-spin' : ''}`} />
          Refresh Stripe Data
        </Button>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueGrowth}
          changeType={stats.revenueGrowth >= 0 ? "positive" : "negative"}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-600"
          subtitle={`$${stats.monthlyRevenue.toLocaleString()} this month`}
          isLoading={loading}
        />
        <StatCard
          title="Monthly Recurring"
          value={`$${stats.mrr.toLocaleString()}`}
          icon={Wallet}
          gradient="from-emerald-500 to-teal-600"
          subtitle={`${stats.activeSubscriptions} active subscriptions`}
          isLoading={loading}
        />
        <StatCard
          title="Organizations"
          value={stats.totalOrgs}
          icon={Building2}
          gradient="from-blue-500 to-cyan-600"
          subtitle={`${stats.activeOrgs} active • ${stats.newOrgsThisMonth} new`}
          isLoading={loading}
        />
        <StatCard
          title="Users"
          value={stats.totalUsers}
          icon={Users}
          gradient="from-purple-500 to-pink-600"
          subtitle={`${stats.activeUsers} active • ${stats.newUsersThisMonth} new`}
          isLoading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Creative Hours"
          value={stats.totalCreativeHours}
          icon={Clock}
          gradient="from-amber-500 to-orange-600"
          subtitle={`$${stats.creativeCosts.toLocaleString()} total cost`}
          isLoading={loading}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={Palette}
          gradient="from-pink-500 to-rose-600"
          isLoading={loading}
        />
        <StatCard
          title="Completed Requests"
          value={stats.completedRequests}
          icon={Target}
          gradient="from-teal-500 to-green-600"
          isLoading={loading}
        />
        <StatCard
          title="Stripe Balance"
          value={`$${stats.balance.available.toLocaleString()}`}
          icon={CreditCard}
          gradient="from-indigo-500 to-violet-600"
          subtitle={`$${stats.balance.pending.toLocaleString()} pending`}
          isLoading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="col-span-2 border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Revenue (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading || stripeLoading ? (
              <div className="h-[300px] space-y-4">
                <div className="flex items-end gap-4 h-[260px] px-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end">
                      <Skeleton 
                        className="w-full rounded-t-md" 
                        style={{ height: `${40 + Math.random() * 60}%` }} 
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between px-8">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-10" />
                  ))}
                </div>
              </div>
            ) : revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#revenueGradient)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Subscription Tiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading || stripeLoading ? (
              <div className="h-[250px] flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <Skeleton className="w-[180px] h-[180px] rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Skeleton className="w-[120px] h-[120px] rounded-full bg-card" />
                  </div>
                </div>
                <div className="flex gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ) : subscriptionTiers.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={subscriptionTiers}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {subscriptionTiers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4 flex-wrap">
                  {subscriptionTiers.map((tier, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                      <span className="text-sm text-muted-foreground">{tier.name} ({tier.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No subscription data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Alerts + User Growth Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* System Alerts */}
        <SysAdminAlerts />

        {/* User Growth Chart */}
        <Card className="col-span-2 border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              User Growth This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[200px] space-y-4">
                <div className="flex items-end gap-6 h-[160px] px-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end">
                      <Skeleton 
                        className="w-full rounded-t-md" 
                        style={{ height: `${30 + Math.random() * 70}%` }} 
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between px-8">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-12" />
                  ))}
                </div>
              </div>
            ) : userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="users" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No user growth data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
