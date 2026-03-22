import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NoticeState } from "@/components/shared";
import { Target, TrendingUp, Zap, Shield } from "lucide-react";

export const BestPractices = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Best Practices</h2>
        <p className="text-muted-foreground">
          Optimization strategies and workflow recommendations for getting the most out of Instincts AI
        </p>
      </div>

      {/* Trend Detection Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trend Detection
          </CardTitle>
          <CardDescription>
            Maximize the value of Signal Intelligence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <NoticeState
              type="success"
              title="Do: Act on emerging trends early"
              description="Trends with 'rising' velocity offer the best opportunity. Act within 48-72 hours of detection."
              className="p-3"
            />
            
            <NoticeState
              type="success"
              title="Do: Cross-reference multiple platforms"
              description="Trends appearing on 3+ platforms have higher longevity and broader appeal."
              className="p-3"
            />

            <NoticeState
              type="warning"
              title="Avoid: Chasing peaked trends"
              description="Trends showing 'declining' velocity may be too late to capitalize on effectively."
              className="p-3"
            />

            <NoticeState
              type="tip"
              title="Pro Tip: Use sentiment as a filter"
              description="Positive sentiment trends (70%+) generally perform better for commercial campaigns."
              className="p-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Campaign Deployment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Campaign Deployment
          </CardTitle>
          <CardDescription>
            Optimize your campaign performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card/50 space-y-2">
              <Badge variant="secondary">Budget Allocation</Badge>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Start with 20-30% of total budget for testing</li>
                <li>• Scale winning campaigns to 50-70%</li>
                <li>• Reserve 10% for trend-reactive campaigns</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg border bg-card/50 space-y-2">
              <Badge variant="secondary">Timing</Badge>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Deploy trend campaigns within 24-48 hours</li>
                <li>• Use AI Insights optimal timing predictions</li>
                <li>• Monitor for the first 72 hours closely</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg border bg-card/50 space-y-2">
              <Badge variant="secondary">Creative</Badge>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Test 2-3 creative variants per campaign</li>
                <li>• Always include trend-relevant imagery</li>
                <li>• Match visual colors to trend palette</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg border bg-card/50 space-y-2">
              <Badge variant="secondary">Inventory</Badge>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Verify stock levels before campaign launch</li>
                <li>• Set up automatic pause on stockout</li>
                <li>• Reserve inventory for trend campaigns</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand DNA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Brand DNA Management
          </CardTitle>
          <CardDescription>
            Maintain brand consistency across all content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <NoticeState
              type="success"
              title="Complete your Brand DNA profile fully"
              description="AI content quality improves dramatically with complete voice, personality, and guardrails data."
              className="p-3"
            />
            
            <NoticeState
              type="success"
              title="Set specific guardrails"
              description="Define forbidden words, topics to avoid, and visual restrictions to prevent off-brand content."
              className="p-3"
            />

            <NoticeState
              type="success"
              title="Monitor the Health Dashboard weekly"
              description="Address drift alerts promptly to maintain brand consistency over time."
              className="p-3"
            />

            <NoticeState
              type="warning"
              title="Avoid: Incomplete personality profiles"
              description="Take the personality quiz - it significantly improves content tone matching."
              className="p-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Workflow Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Workflow Optimization
          </CardTitle>
          <CardDescription>
            Streamline your daily operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-card/50">
              <h4 className="font-semibold mb-2">Daily Routine (15 min)</h4>
              <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                <li>Check AI Dashboard for critical insights and alerts</li>
                <li>Review new trends in Signal Intelligence</li>
                <li>Monitor active campaign performance</li>
                <li>Address any drift alerts from Brand DNA</li>
              </ol>
            </div>

            <div className="p-4 rounded-lg border bg-card/50">
              <h4 className="font-semibold mb-2">Weekly Routine (1 hour)</h4>
              <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                <li>Review weekly analytics and trend reports</li>
                <li>Analyze campaign performance and adjust budgets</li>
                <li>Update product inventory and catalog</li>
                <li>Generate new content for upcoming campaigns</li>
                <li>Test campaigns in Simulation Studio</li>
              </ol>
            </div>

            <div className="p-4 rounded-lg border bg-card/50">
              <h4 className="font-semibold mb-2">Monthly Routine (2-3 hours)</h4>
              <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                <li>Review Brand DNA health and update guardrails</li>
                <li>Analyze competitive intelligence reports</li>
                <li>Review API usage and adjust rate limits</li>
                <li>Plan next month's campaign calendar</li>
                <li>Review and update product catalog</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
