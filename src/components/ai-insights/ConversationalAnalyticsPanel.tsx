import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConversationalAnalytics, SentimentAnalysis, CompetitorSentiment, CompetitorSentimentReport } from "@/hooks/useConversationalAnalytics";
import { MessageSquare, Send, Sparkles, TrendingUp, Package, Loader2, ThumbsUp, ThumbsDown, Meh, Heart, Users, Target, AlertCircle, Plus, X } from "lucide-react";

function SentimentDisplay({ sentiment }: { sentiment: SentimentAnalysis }) {
  const getOverallIcon = () => {
    switch (sentiment.overall) {
      case 'positive': return <ThumbsUp className="h-5 w-5 text-green-500" />;
      case 'negative': return <ThumbsDown className="h-5 w-5 text-red-500" />;
      case 'mixed': return <Heart className="h-5 w-5 text-amber-500" />;
      default: return <Meh className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-3 p-3 rounded-lg bg-muted/50 border">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          {getOverallIcon()}
          Sentiment Analysis
        </h4>
        <Badge variant={sentiment.overall === 'positive' ? 'default' : sentiment.overall === 'negative' ? 'destructive' : 'secondary'}>
          {sentiment.overall}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16">Positive</span>
          <Progress value={sentiment.breakdown.positive} className="flex-1 h-2" />
          <span className="text-xs w-8">{sentiment.breakdown.positive}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16">Neutral</span>
          <Progress value={sentiment.breakdown.neutral} className="flex-1 h-2" />
          <span className="text-xs w-8">{sentiment.breakdown.neutral}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16">Negative</span>
          <Progress value={sentiment.breakdown.negative} className="flex-1 h-2" />
          <span className="text-xs w-8">{sentiment.breakdown.negative}%</span>
        </div>
      </div>

      {sentiment.keywords && sentiment.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {sentiment.keywords.slice(0, 6).map((kw, i) => (
            <Badge
              key={i}
              variant="outline"
              className={`text-xs ${
                kw.sentiment === 'positive' ? 'border-green-500/50 text-green-600' :
                kw.sentiment === 'negative' ? 'border-red-500/50 text-red-600' :
                'border-muted-foreground/50'
              }`}
            >
              {kw.word}
            </Badge>
          ))}
        </div>
      )}

      {sentiment.summary && (
        <p className="text-xs text-muted-foreground">{sentiment.summary}</p>
      )}
    </div>
  );
}

function CompetitorSentimentDisplay({ report }: { report: CompetitorSentimentReport }) {
  return (
    <div className="space-y-4">
      {/* Your Brand */}
      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Your Brand
        </h4>
        <SentimentDisplay sentiment={report.yourBrand} />
      </div>

      {/* Competitors */}
      {report.competitors.map((comp, i) => (
        <div key={i} className="p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              {comp.competitor}
            </h4>
            <Badge variant={
              comp.comparison.vsYourBrand === 'worse' ? 'default' :
              comp.comparison.vsYourBrand === 'better' ? 'destructive' : 'secondary'
            }>
              {comp.comparison.vsYourBrand === 'worse' ? 'You lead' :
               comp.comparison.vsYourBrand === 'better' ? 'They lead' : 'Similar'}
            </Badge>
          </div>
          
          <SentimentDisplay sentiment={comp.sentiment} />
          
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <p className="text-xs font-medium text-green-600 mb-1">Their Strengths</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {comp.comparison.strengthAreas.slice(0, 2).map((a, j) => (
                  <li key={j}>• {a}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-red-600 mb-1">Their Weaknesses</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {comp.comparison.weaknessAreas.slice(0, 2).map((a, j) => (
                  <li key={j}>• {a}</li>
                ))}
              </ul>
            </div>
          </div>

          {comp.recentMentions.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs font-medium mb-1">Recent Mentions</p>
              {comp.recentMentions.slice(0, 2).map((m, j) => (
                <div key={j} className="text-xs text-muted-foreground flex gap-1">
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {m.source}
                  </Badge>
                  <span className="line-clamp-1">"{m.text}"</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Insights & Recommendations */}
      {(report.marketInsights.length > 0 || report.recommendations.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {report.marketInsights.length > 0 && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Market Insights</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {report.marketInsights.map((i, j) => (
                  <li key={j}>• {i}</li>
                ))}
              </ul>
            </div>
          )}
          {report.recommendations.length > 0 && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Recommendations</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {report.recommendations.map((r, j) => (
                  <li key={j}>• {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ConversationalAnalyticsPanel() {
  const [query, setQuery] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [competitorInput, setCompetitorInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const { isLoading, response, competitorReport, askQuestion, analyzeCompetitorSentiment, suggestedQueries } = useConversationalAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await askQuestion(query);
      setQuery("");
    }
  };

  const handleSuggestedQuery = async (q: string) => {
    setQuery(q);
    await askQuestion(q);
  };

  const handleAddCompetitor = () => {
    if (competitorInput.trim() && !competitors.includes(competitorInput.trim())) {
      setCompetitors([...competitors, competitorInput.trim()]);
      setCompetitorInput("");
    }
  };

  const handleRemoveCompetitor = (comp: string) => {
    setCompetitors(competitors.filter(c => c !== comp));
  };

  const handleAnalyzeCompetitors = async () => {
    if (competitors.length > 0) {
      await analyzeCompetitorSentiment(competitors);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
          Conversational Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat Analytics</TabsTrigger>
            <TabsTrigger value="competitors">Competitor Sentiment</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            {/* Suggested Queries */}
            {!response && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQueries.slice(0, 3).map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSuggestedQuery(q)}
                      disabled={isLoading}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Response */}
            {response && (
              <ScrollArea className="h-[300px] rounded-lg border bg-muted/30 p-4">
                <div className="space-y-4">
                  <p className="text-sm">{response.answer}</p>

                  {response.data?.sentiment && (
                    <SentimentDisplay sentiment={response.data.sentiment} />
                  )}
                  
                  {response.data?.trends && response.data.trends.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" /> Matching Trends
                      </h4>
                      {response.data.trends.map((trend, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-background">
                          <span className="text-sm">{trend.name}</span>
                          <Badge variant="secondary">{trend.matchScore}% match</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {response.data?.products && response.data.products.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-1">
                        <Package className="h-4 w-4" /> Product Suggestions
                      </h4>
                      {response.data.products.map((product, i) => (
                        <div key={i} className="p-2 rounded bg-background">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{product.name}</span>
                            <Badge variant="outline">{product.stock} in stock</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{product.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {response.data?.insights && response.data.insights.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-1">
                        <Sparkles className="h-4 w-4" /> Insights
                      </h4>
                      <ul className="space-y-1">
                        {response.data.insights.map((insight, i) => (
                          <li key={i} className="text-sm text-muted-foreground">• {insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about inventory, trends, or sentiment..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !query.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Add competitors to track how customers perceive them vs your brand
              </p>
              
              <div className="flex gap-2">
                <Input
                  value={competitorInput}
                  onChange={(e) => setCompetitorInput(e.target.value)}
                  placeholder="Enter competitor name..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCompetitor())}
                />
                <Button variant="outline" onClick={handleAddCompetitor}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {competitors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {competitors.map((comp, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {comp}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                        onClick={() => handleRemoveCompetitor(comp)}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              <Button 
                onClick={handleAnalyzeCompetitors} 
                disabled={isLoading || competitors.length === 0}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Analyze Competitor Sentiment
                  </>
                )}
              </Button>
            </div>

            {competitorReport && (
              <ScrollArea className="h-[350px]">
                <CompetitorSentimentDisplay report={competitorReport} />
              </ScrollArea>
            )}

            {!competitorReport && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Add competitors above to analyze sentiment</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
