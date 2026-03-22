import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, Shield, X, Trash2, Loader2, 
  CheckCircle, TrendingDown, Mic, Brain, Eye
} from "lucide-react";
import { useBrandDNADrift, DriftAlert } from "@/hooks/useBrandDNADrift";
import { format } from "date-fns";

const CATEGORY_ICONS = {
  voice: Mic,
  personality: Brain,
  guardrails: Shield,
  visual: Eye
};

const SEVERITY_COLORS = {
  low: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  medium: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  high: "bg-destructive/10 text-destructive border-destructive/20"
};

export function BrandDNADriftMonitor() {
  const { 
    isAnalyzing, 
    driftAlerts, 
    analyzeContentForDrift, 
    dismissAlert, 
    clearAllAlerts,
    getAlertsSummary 
  } = useBrandDNADrift();
  
  const [testContent, setTestContent] = useState("");
  const [lastAnalysis, setLastAnalysis] = useState<{
    overallDrift: number;
    recommendation: string;
  } | null>(null);

  const summary = getAlertsSummary();

  const handleAnalyze = async () => {
    if (!testContent.trim()) return;
    const result = await analyzeContentForDrift(testContent);
    if (result) {
      setLastAnalysis({
        overallDrift: result.overallDrift,
        recommendation: result.recommendation
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.high}</p>
              <p className="text-xs text-muted-foreground">High Priority</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.medium}</p>
              <p className="text-xs text-muted-foreground">Medium Priority</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.low}</p>
              <p className="text-xs text-muted-foreground">Low Priority</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.total}</p>
              <p className="text-xs text-muted-foreground">Total Alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Analyzer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Drift Analyzer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste content to check for brand drift..."
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              rows={6}
            />
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !testContent.trim()}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Check for Drift
                </>
              )}
            </Button>

            {lastAnalysis && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Drift Level</span>
                  <Badge variant={lastAnalysis.overallDrift > 30 ? "destructive" : lastAnalysis.overallDrift > 15 ? "secondary" : "default"}>
                    {lastAnalysis.overallDrift.toFixed(0)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{lastAnalysis.recommendation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
            {driftAlerts.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllAlerts}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {driftAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No drift alerts</p>
                <p className="text-sm">Your content is aligned with Brand DNA</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {driftAlerts.map((alert) => {
                    const Icon = CATEGORY_ICONS[alert.category];
                    return (
                      <div 
                        key={alert.id} 
                        className={`p-3 rounded-lg border ${SEVERITY_COLORS[alert.severity]}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <Icon className="h-4 w-4 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{alert.message}</p>
                              {alert.contentSample && (
                                <p className="text-xs opacity-70 italic">"{alert.contentSample}"</p>
                              )}
                              <p className="text-xs opacity-50">
                                {format(new Date(alert.createdAt), "MMM d, h:mm a")}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => dismissAlert(alert.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}