import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCompetitiveIntelligence } from "@/hooks/useCompetitiveIntelligence";
import { 
  Target, PieChart, Lightbulb, Loader2, Search, 
  TrendingUp, TrendingDown, Minus, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

const CompetitiveIntelligence = () => {
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  
  const { 
    isLoading, 
    competitorAnalysis, 
    shareOfVoice, 
    marketGaps,
    analyzeCompetitors,
    calculateShareOfVoice,
    detectMarketGaps
  } = useCompetitiveIntelligence();

  const handleAnalyzeCompetitor = async () => {
    if (!competitorUrl) {
      toast.error("Enter a competitor URL to analyze");
      return;
    }
    await analyzeCompetitors([competitorUrl], undefined, industry || undefined);
  };

  const handleTrackSOV = async () => {
    if (!brandName) {
      toast.error("Enter your brand name");
      return;
    }
    await calculateShareOfVoice(brandName, undefined, industry ? [industry] : undefined);
  };

  const handleDetectGaps = async () => {
    if (!industry) {
      toast.error("Enter an industry to analyze");
      return;
    }
    await detectMarketGaps(industry);
  };

  const getSentimentIcon = (trend: string) => {
    switch (trend) {
      case "gaining":
      case "improving": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "losing":
      case "declining": return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Competitive Intelligence"
        description="AI-powered competitor analysis • Share of voice tracking • Market gap detection"
        badge={<Badge variant="secondary" className="bg-primary/10 text-primary">Live Intel</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Competitor Analysis */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Competitor Analysis
            </CardTitle>
            <CardDescription>Extract competitor ad strategies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Competitor URL</label>
              <Input 
                value={competitorUrl} 
                onChange={(e) => setCompetitorUrl(e.target.value)}
                placeholder="https://competitor.com"
              />
            </div>
            <Button 
              variant="gradient" 
              className="w-full gap-2" 
              onClick={handleAnalyzeCompetitor}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Analyze Competitor
            </Button>
            
            {competitorAnalysis && (
              <div className="space-y-3 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Analysis Complete</span>
                  <Badge variant="outline">{competitorAnalysis.competitorProfiles?.length || 0} profiles</Badge>
                </div>
                
                {competitorAnalysis.competitorProfiles?.slice(0, 2).map((profile, i) => (
                  <div key={i} className="p-2 rounded-lg bg-muted/50 text-xs">
                    <p className="font-medium mb-1">{profile.name}</p>
                    <p className="text-muted-foreground">{profile.positioning}</p>
                  </div>
                ))}
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Market Patterns</p>
                  <div className="flex flex-wrap gap-1">
                    {competitorAnalysis.marketPatterns?.commonThemes?.slice(0, 4).map((theme, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{theme}</Badge>
                    ))}
                  </div>
                </div>
                
                {competitorAnalysis.opportunities?.length > 0 && (
                  <div className="p-2 rounded-lg bg-green-500/10 text-xs">
                    <p className="font-medium text-green-600 mb-1">Top Opportunity</p>
                    <p>{competitorAnalysis.opportunities[0].opportunity}</p>
                  </div>
                )}
                
                {competitorAnalysis.threatAssessment?.immediateThreats?.length > 0 && (
                  <div className="p-2 rounded-lg bg-amber-500/10 text-xs">
                    <p className="font-medium text-amber-600 mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Threats
                    </p>
                    <ul className="space-y-1">
                      {competitorAnalysis.threatAssessment.immediateThreats.slice(0, 2).map((t, i) => (
                        <li key={i}>• {t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Share of Voice */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Share of Voice
            </CardTitle>
            <CardDescription>Monitor brand mentions & sentiment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Your Brand Name</label>
              <Input 
                value={brandName} 
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Your Brand"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Industry (optional)</label>
              <Input 
                value={industry} 
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., skincare, fashion..."
              />
            </div>
            <Button 
              variant="gradient" 
              className="w-full gap-2" 
              onClick={handleTrackSOV}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PieChart className="h-4 w-4" />}
              Track Share of Voice
            </Button>
            
            {shareOfVoice && (
              <div className="space-y-3 pt-4 border-t border-border/30">
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Your Share of Voice</p>
                  <p className="text-3xl font-bold text-primary">{shareOfVoice.overallShareOfVoice?.brand || 0}%</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Competitor Shares</p>
                  {shareOfVoice.competitorComparison?.slice(0, 4).map((comp, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{comp.competitor}</span>
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(comp.trend)}
                        <span className="font-medium">{comp.shareOfVoice}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <p className="text-green-600 font-semibold">{shareOfVoice.sentiment?.positive || 0}%</p>
                    <p className="text-muted-foreground">Positive</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="font-semibold">{shareOfVoice.sentiment?.neutral || 0}%</p>
                    <p className="text-muted-foreground">Neutral</p>
                  </div>
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <p className="text-red-600 font-semibold">{shareOfVoice.sentiment?.negative || 0}%</p>
                    <p className="text-muted-foreground">Negative</p>
                  </div>
                </div>
                
                {shareOfVoice.alerts?.length > 0 && (
                  <div className="space-y-1">
                    {shareOfVoice.alerts.filter(a => a.priority === "high").slice(0, 2).map((alert, i) => (
                      <div key={i} className={`p-2 rounded text-xs ${alert.type === "threat" ? "bg-red-500/10 text-red-600" : "bg-green-500/10 text-green-600"}`}>
                        {alert.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Gaps */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Market Gaps
            </CardTitle>
            <CardDescription>Identify untapped opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Industry</label>
              <Input 
                value={industry} 
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., beauty, fashion, wellness..."
              />
            </div>
            <Button 
              variant="gradient" 
              className="w-full gap-2" 
              onClick={handleDetectGaps}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
              Detect Market Gaps
            </Button>
            
            {marketGaps && (
              <div className="space-y-3 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Opportunities Found</span>
                  <Badge variant="secondary">{marketGaps.gaps?.length || 0} gaps</Badge>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {marketGaps.gaps?.map((gap, i) => (
                    <div key={gap.id || i} className="p-3 rounded-xl bg-muted/50 border border-border/30 space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="font-medium text-sm">{gap.title}</span>
                        <Badge 
                          variant={gap.urgency === "high" ? "destructive" : gap.urgency === "medium" ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {gap.urgency}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{gap.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-primary font-medium">{gap.marketSize}</span>
                        <span className="text-muted-foreground">{gap.confidence}% confidence</span>
                      </div>
                      {gap.actionPlan?.shortTerm?.length > 0 && (
                        <div className="pt-2 border-t border-border/20">
                          <p className="text-xs font-medium mb-1">Quick Action:</p>
                          <p className="text-xs text-muted-foreground">{gap.actionPlan.shortTerm[0]}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {marketGaps.priorityMatrix?.quickWins?.length > 0 && (
                  <div className="p-2 rounded-lg bg-primary/5 text-xs">
                    <p className="font-medium text-primary mb-1">Quick Wins</p>
                    <div className="flex flex-wrap gap-1">
                      {marketGaps.priorityMatrix.quickWins.slice(0, 3).map((win, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{win}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default CompetitiveIntelligence;
