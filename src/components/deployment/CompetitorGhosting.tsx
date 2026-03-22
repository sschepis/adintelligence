import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Eye, 
  EyeOff, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Search, 
  Loader2,
  BarChart3,
  Bell,
  BellOff,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  Settings,
  Mail,
  Send,
  Calendar
} from "lucide-react";
import { useCompetitorIntelligence, CompetitorData, WhiteSpaceOpportunity, CompetitorAlert } from "@/hooks/useCompetitorIntelligence";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// No static mock data - we only show real data from API calls

const opportunityColors = {
  high: "bg-signal-rising/10 text-signal-rising border-signal-rising/20",
  medium: "bg-accent/10 text-accent border-accent/20",
  low: "bg-muted text-muted-foreground border-muted",
};

interface CompetitorGhostingProps {
  className?: string;
}

const alertTypeIcons = {
  ad_spend: DollarSign,
  new_keyword: Target,
  sov_change: TrendingUp
};

const severityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-accent/10 text-accent border-accent/20",
  low: "bg-muted text-muted-foreground border-muted"
};

export function CompetitorGhosting({ className }: CompetitorGhostingProps) {
  const [searchKeywords, setSearchKeywords] = useState("");
  const [showAlerts, setShowAlerts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [digestEmail, setDigestEmail] = useState("");
  const { 
    intelligence, 
    isLoading, 
    alerts,
    unreadAlertCount,
    isTracking,
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
    enableDigest,
    disableDigest,
    updateDigestFrequency,
    sendDigest
  } = useCompetitorIntelligence();

  useEffect(() => {
    // Check notification permission on mount
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  const handleSearch = () => {
    if (!searchKeywords.trim()) return;
    const keywords = searchKeywords.split(",").map(k => k.trim()).filter(Boolean);
    analyzeCompetitors(keywords);
  };

  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking();
      disableAutoRefresh();
    } else {
      const keywords = searchKeywords.split(",").map(k => k.trim()).filter(Boolean);
      if (keywords.length > 0) {
        startTracking(keywords);
      }
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
  };

  const competitors = intelligence?.competitors?.map((c, i) => ({
    ...c,
    id: String(i + 1),
    bidding: i < 2
  })) || [];

  const whiteSpaces = intelligence?.whiteSpaces || [];

  const formatNextRefresh = (date: Date | null) => {
    if (!date) return null;
    const diff = date.getTime() - Date.now();
    const minutes = Math.ceil(diff / 60000);
    return minutes > 0 ? `${minutes}m` : "now";
  };

  return (
    <div className={cn("glass-card rounded-xl p-5 animate-slide-up", className)} style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-lg">Competitor Intelligence</h3>
          <p className="text-sm text-muted-foreground">Real-time competitor analysis with alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="gap-1.5"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant={isTracking ? "gradient" : "glass"}
            size="sm"
            onClick={handleToggleTracking}
            disabled={!searchKeywords.trim() && !isTracking}
            className="gap-1.5"
          >
            {isTracking ? (
              <>
                <Bell className="h-4 w-4" />
                Tracking
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4" />
                Track
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative gap-1.5"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                {unreadAlertCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-5 p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Tracking Settings</span>
          </div>
          
          <div className="space-y-3">
            {/* Auto-refresh */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className={cn("h-4 w-4", autoRefresh.enabled && "animate-spin text-primary")} />
                <span className="text-xs">Auto-refresh</span>
              </div>
              <div className="flex items-center gap-2">
                <Select 
                  value={String(autoRefresh.intervalMinutes)}
                  onValueChange={(v) => setRefreshInterval(parseInt(v))}
                  disabled={!isTracking}
                >
                  <SelectTrigger className="h-7 w-[100px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant={autoRefresh.enabled ? "gradient" : "outline"}
                  size="sm"
                  onClick={() => autoRefresh.enabled ? disableAutoRefresh() : enableAutoRefresh(autoRefresh.intervalMinutes)}
                  disabled={!isTracking}
                  className="h-7 text-xs"
                >
                  {autoRefresh.enabled ? "On" : "Off"}
                </Button>
              </div>
            </div>
            
            {autoRefresh.enabled && autoRefresh.nextRefresh && (
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Next refresh in {formatNextRefresh(autoRefresh.nextRefresh)}</span>
                {autoRefresh.lastRefresh && (
                  <>
                    <span>•</span>
                    <span>Last: {autoRefresh.lastRefresh.toLocaleTimeString()}</span>
                  </>
                )}
              </div>
            )}

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="text-xs">Push notifications</span>
              </div>
              <Button
                variant={notificationsEnabled ? "gradient" : "outline"}
                size="sm"
                onClick={handleEnableNotifications}
                disabled={notificationsEnabled}
                className="h-7 text-xs gap-1.5"
              >
                {notificationsEnabled ? (
                  <>
                    <Bell className="h-3 w-3" />
                    Enabled
                  </>
                ) : (
                  "Enable"
                )}
              </Button>
            </div>
            
            {notificationsEnabled && (
              <p className="text-[10px] text-muted-foreground">
                You'll receive browser notifications for high-priority competitor alerts
              </p>
            )}

            {/* Email Digest */}
            <div className="border-t border-border pt-3 mt-3">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Email Digest</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Email address..."
                    value={digestEmail || digestConfig.email}
                    onChange={(e) => setDigestEmail(e.target.value)}
                    className="h-7 text-xs flex-1"
                    disabled={digestConfig.enabled}
                  />
                  <Select 
                    value={digestConfig.frequency}
                    onValueChange={(v) => updateDigestFrequency(v as "daily" | "weekly")}
                    disabled={!digestConfig.enabled}
                  >
                    <SelectTrigger className="h-7 w-[80px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={digestConfig.enabled ? "gradient" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (digestConfig.enabled) {
                        disableDigest();
                      } else if (digestEmail) {
                        enableDigest(digestEmail, digestConfig.frequency);
                      }
                    }}
                    disabled={!digestConfig.enabled && !digestEmail}
                    className="h-7 text-xs flex-1 gap-1.5"
                  >
                    <Calendar className="h-3 w-3" />
                    {digestConfig.enabled ? "Scheduled" : "Enable"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendDigest(digestEmail || digestConfig.email)}
                    disabled={isSendingDigest || !intelligence || (!digestEmail && !digestConfig.email)}
                    className="h-7 text-xs gap-1.5"
                  >
                    {isSendingDigest ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    Send Now
                  </Button>
                </div>
                
                {digestConfig.enabled && digestConfig.nextScheduled && (
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Next: {digestConfig.nextScheduled.toLocaleDateString()} at {digestConfig.nextScheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
                
                {digestConfig.lastSent && (
                  <p className="text-[10px] text-muted-foreground">
                    Last sent: {digestConfig.lastSent.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Panel */}
      {showAlerts && (
        <div className="mb-5 p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Competitor Alerts ({alerts.length})</span>
            </div>
            {alerts.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAlerts} className="h-6 text-xs">
                Clear All
              </Button>
            )}
          </div>
          {alerts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No alerts yet. Enable tracking to monitor competitor changes.
            </p>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {alerts.map((alert) => {
                  const Icon = alertTypeIcons[alert.type];
                  return (
                    <div 
                      key={alert.id}
                      className={cn(
                        "p-2.5 rounded-lg border transition-all cursor-pointer",
                        alert.read ? "bg-secondary/30 opacity-60" : "bg-secondary/50",
                        severityColors[alert.severity]
                      )}
                      onClick={() => markAlertRead(alert.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="p-1 rounded bg-background/50">
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-medium">{alert.competitor}</span>
                            <Badge variant="outline" className={cn("text-[10px]", severityColors[alert.severity])}>
                              {alert.change}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{alert.message}</p>
                          <span className="text-[9px] text-muted-foreground/60">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        {!alert.read && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex gap-2 mb-5">
        <Input
          placeholder="Enter keywords (comma-separated)..."
          value={searchKeywords}
          onChange={(e) => setSearchKeywords(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button 
          variant="gradient" 
          size="sm" 
          onClick={handleSearch}
          disabled={isLoading || !searchKeywords.trim()}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Analyze
        </Button>
      </div>

      {/* Market Overview */}
      {intelligence?.marketOverview && (
        <div className="grid grid-cols-3 gap-3 mb-5 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="text-center">
            <span className="text-[10px] text-muted-foreground">Total Volume</span>
            <p className="text-sm font-bold">{(intelligence.marketOverview.totalMarketVolume / 1000).toFixed(0)}K</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-muted-foreground">Avg CPC</span>
            <p className="text-sm font-bold">${intelligence.marketOverview.averageCpc}</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-muted-foreground">Categories</span>
            <p className="text-sm font-bold">{intelligence.marketOverview.topCategories.length}</p>
          </div>
        </div>
      )}

      {/* Competitor List */}
      <div className="space-y-3 mb-6">
        {competitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Eye className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No competitor data yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Enter keywords above to analyze competitors
            </p>
          </div>
        ) : (
          competitors.map((competitor, index) => (
            <div
              key={competitor.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors animate-slide-in-right"
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  competitor.bidding ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                )}>
                  {competitor.bidding ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-medium text-sm">{competitor.domain}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{competitor.estimatedAdSpend}</span>
                    <span>•</span>
                    <span>{competitor.shareOfVoice}% SOV</span>
                    <span>•</span>
                    <span>{(competitor.estimatedTraffic / 1000).toFixed(0)}K traffic</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                {competitor.topKeywords.slice(0, 2).map((kw, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {kw.keyword}
                  </Badge>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* White Space Opportunities */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">White Space Opportunities</h4>
          {intelligence && (
            <Badge variant="outline" className="text-[10px] ml-auto">
              <BarChart3 className="h-3 w-3 mr-1" />
              Live Analysis
            </Badge>
          )}
        </div>
        
        {whiteSpaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Target className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">
              Analyze competitors to find opportunities
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {whiteSpaces.map((space, index) => (
              <div
                key={space.keyword}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer animate-slide-in-right"
                style={{ animationDelay: `${400 + index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium border capitalize",
                    opportunityColors[space.opportunity]
                  )}>
                    {space.opportunity}
                  </span>
                  <span className="font-medium text-sm">{space.keyword}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>${space.cpc.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{(space.searchVolume / 1000).toFixed(0)}K/mo</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-signal-rising">
                    {space.competitionGap}% gap
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
