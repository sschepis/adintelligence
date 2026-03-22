import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Loader2,
  Sparkles,
  Mic,
  Shield,
  Trophy
} from "lucide-react";
import { useBrandDNA } from "@/hooks/useBrandDNA";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function BrandDNAHealthDashboard() {
  const { brandDNA, scoreConsistency, getDNACompleteness, loading } = useBrandDNA();
  const [testContent, setTestContent] = useState("");
  const [isScoring, setIsScoring] = useState(false);
  const [latestScore, setLatestScore] = useState<any>(null);

  const completeness = getDNACompleteness();
  const overallScore = brandDNA.score.overall;

  const handleScoreContent = async () => {
    if (!testContent.trim()) return;
    
    setIsScoring(true);
    try {
      const score = await scoreConsistency(testContent);
      setLatestScore(score);
    } catch (error) {
      console.error('Scoring error:', error);
    } finally {
      setIsScoring(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-destructive';
  };

  const getScoreBg = (score: number | null) => {
    if (score === null) return 'bg-muted';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-destructive';
  };

  const scoreHistory = brandDNA.score.scoreHistory.map((item, i) => ({
    ...item,
    index: i + 1
  }));

  return (
    <div className="space-y-6">
      {/* Completeness Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Brand DNA Completeness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-8 border-secondary flex items-center justify-center">
                <span className="text-2xl font-bold">{completeness}%</span>
              </div>
              <svg className="absolute inset-0 h-24 w-24 -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeDasharray={`${completeness * 2.51} 251`}
                  className="transition-all duration-500"
                />
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Mic className={`h-4 w-4 ${brandDNA.voice.analyzedAt ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">Voice Analysis</span>
                {brandDNA.voice.analyzedAt ? (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                ) : (
                  <span className="text-xs text-muted-foreground ml-auto">Not done</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Trophy className={`h-4 w-4 ${brandDNA.personality.archetype ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">Personality Quiz</span>
                {brandDNA.personality.archetype ? (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                ) : (
                  <span className="text-xs text-muted-foreground ml-auto">Not done</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Shield className={`h-4 w-4 ${brandDNA.guardrails.forbiddenWords.length > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">Guardrails Set</span>
                {brandDNA.guardrails.forbiddenWords.length > 0 || brandDNA.guardrails.avoidTopics.length > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                ) : (
                  <span className="text-xs text-muted-foreground ml-auto">Not set</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Brand Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {overallScore !== null ? (
            <>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
                    {overallScore}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <div className={`text-2xl font-bold ${getScoreColor(brandDNA.score.voiceAlignment)}`}>
                    {brandDNA.score.voiceAlignment ?? '—'}
                  </div>
                  <p className="text-xs text-muted-foreground">Voice</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <div className={`text-2xl font-bold ${getScoreColor(brandDNA.score.personalityAlignment)}`}>
                    {brandDNA.score.personalityAlignment ?? '—'}
                  </div>
                  <p className="text-xs text-muted-foreground">Personality</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <div className={`text-2xl font-bold ${getScoreColor(brandDNA.score.guardrailsCompliance)}`}>
                    {brandDNA.score.guardrailsCompliance ?? '—'}
                  </div>
                  <p className="text-xs text-muted-foreground">Guardrails</p>
                </div>
              </div>

              {/* Score History Chart */}
              {scoreHistory.length > 1 && (
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreHistory}>
                      <XAxis dataKey="index" hide />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload?.[0]) {
                            return (
                              <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                                <p className="text-sm font-medium">Score: {payload[0].value}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(payload[0].payload.date).toLocaleDateString()}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {brandDNA.score.lastCalculated && (
                <p className="text-xs text-muted-foreground text-center">
                  Last calculated: {new Date(brandDNA.score.lastCalculated).toLocaleString()}
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No health score yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Test your content below to get a brand consistency score
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Tester */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test Content Consistency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Paste any content to check how well it aligns with your Brand DNA.
          </p>
          
          <Textarea
            placeholder="Paste your content here (ad copy, email, blog post, etc.)..."
            value={testContent}
            onChange={(e) => setTestContent(e.target.value)}
            rows={4}
          />

          <Button 
            onClick={handleScoreContent}
            disabled={isScoring || !testContent.trim() || completeness < 20}
            className="w-full gap-2"
          >
            {isScoring ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Score Content
              </>
            )}
          </Button>

          {completeness < 20 && (
            <p className="text-xs text-muted-foreground text-center">
              Complete at least 20% of your Brand DNA to use the content tester
            </p>
          )}

          {/* Latest Score Results */}
          {latestScore && (
            <div className="p-4 rounded-lg bg-secondary/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Consistency Score</span>
                <Badge className={getScoreBg(latestScore.overall)}>
                  {latestScore.overall}/100
                </Badge>
              </div>

              {latestScore.violations?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Guardrail Violations
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {latestScore.violations.map((v: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {latestScore.suggestions?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Suggestions
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {latestScore.suggestions.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-sm">Drift Level:</span>
                <Badge variant={
                  latestScore.driftLevel === 'none' ? 'secondary' :
                  latestScore.driftLevel === 'minor' ? 'outline' :
                  latestScore.driftLevel === 'moderate' ? 'default' : 'destructive'
                }>
                  {latestScore.driftLevel || 'Unknown'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drift Alerts */}
      {brandDNA.score.driftAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Recent Drift Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {brandDNA.score.driftAlerts.slice(0, 5).map((alert, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                    alert.severity === 'high' ? 'text-destructive' :
                    alert.severity === 'medium' ? 'text-yellow-500' : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
