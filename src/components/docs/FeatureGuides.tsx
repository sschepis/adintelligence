import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Sparkles, PenTool, Users, BarChart3, Brain, Palette, Shield } from "lucide-react";

export const FeatureGuides = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Feature Guides</h2>
        <p className="text-muted-foreground">
          Detailed guides for each feature in Instincts AI
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {/* Signal Intelligence */}
        <AccordionItem value="signal-intelligence" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-semibold">Signal Intelligence</span>
              <Badge variant="secondary">Core Feature</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Signal Intelligence aggregates trend data from multiple sources including social media, 
              search engines, and market data to identify emerging opportunities for your brand.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Key Features</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Trend Discovery:</strong> Real-time trending topics from TikTok, Instagram, Pinterest, and Google Trends</li>
                <li><strong>Velocity Tracking:</strong> Monitor how quickly trends are growing or declining</li>
                <li><strong>Sentiment Analysis:</strong> Understand the emotional context around trends</li>
                <li><strong>Visual Pattern Matching:</strong> Identify color and aesthetic patterns in trending content</li>
                <li><strong>Save & Compare:</strong> Save trends for later analysis and comparison</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">How to Use</h4>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                <li>Navigate to Signal Intelligence from the sidebar</li>
                <li>Browse trending topics or search for specific keywords</li>
                <li>Click on a trend to see detailed analysis including velocity, sentiment, and related content</li>
                <li>Save relevant trends for use in Commerce Loop</li>
                <li>Use the comparison view to analyze multiple trends side-by-side</li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Commerce Loop */}
        <AccordionItem value="commerce-loop" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-semibold">Commerce Loop</span>
              <Badge variant="secondary">Core Feature</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Commerce Loop connects your inventory with detected trends, helping you identify 
              opportunities to market existing products or develop new ones.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Key Features</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Inventory Matching:</strong> AI-powered matching of trends to your product catalog</li>
                <li><strong>Visual Analysis:</strong> Color and pattern matching for trend-product alignment</li>
                <li><strong>Bundle Suggestions:</strong> Smart product bundle recommendations</li>
                <li><strong>Gap Analysis:</strong> Identify trends with no matching inventory</li>
                <li><strong>Manufacturing Briefs:</strong> AI-generated product development briefs</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Workflow</h4>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                <li>Select a saved trend from Signal Intelligence</li>
                <li>Review automatically matched products based on keywords and visual patterns</li>
                <li>Analyze suggested product bundles for campaign creation</li>
                <li>If no matches exist, generate a Manufacturing Brief for product development</li>
                <li>Deploy campaigns directly from matched products</li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Writing Forge */}
        <AccordionItem value="writing-forge" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <PenTool className="h-5 w-5 text-primary" />
              <span className="font-semibold">Writing Forge</span>
              <Badge variant="secondary">AI Content</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Writing Forge generates on-brand content using AI, maintaining consistency with your 
              Brand DNA profile across all content types.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Content Types</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Multi-Platform Ads:</strong> Ad copy optimized for different platforms</li>
                <li><strong>Email Campaigns:</strong> Full email sequences with subject lines</li>
                <li><strong>Blog Posts:</strong> SEO-optimized long-form content</li>
                <li><strong>Landing Pages:</strong> Conversion-focused page copy</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Features</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>A/B Variants:</strong> Generate multiple versions for testing</li>
                <li><strong>Version History:</strong> Track and restore previous versions</li>
                <li><strong>Brand Consistency:</strong> All content respects Brand DNA guardrails</li>
                <li><strong>Side-by-Side Compare:</strong> Compare content versions visually</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Visual Forge */}
        <AccordionItem value="visual-forge" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Visual Forge</span>
              <Badge variant="secondary">Creative Assets</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Visual Forge is a custom creative service where you submit requests for visual assets 
              and our team creates them iteratively with your feedback.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Asset Types</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>TikTok Feed Video:</strong> Short-form video content</li>
                <li><strong>Instagram Story Ad:</strong> Vertical story format ads</li>
                <li><strong>Instagram Feed Post:</strong> Square and landscape posts</li>
                <li><strong>Display Banner Ad:</strong> Various display sizes</li>
                <li><strong>Landing Page Hero:</strong> Hero images and banners</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Request Workflow</h4>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                <li>Submit a new request with asset type and description</li>
                <li>Add reference URLs and brand guidelines</li>
                <li>Our team creates initial deliverables</li>
                <li>Review and provide feedback for revisions</li>
                <li>Accept final deliverables when satisfied</li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Simulation Studio */}
        <AccordionItem value="simulation-studio" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">Simulation Studio</span>
              <Badge variant="secondary">Testing</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Test your campaigns against AI-powered personas before deploying to real audiences.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Features</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Custom Personas:</strong> Create personas matching your target audience</li>
                <li><strong>Persona Templates:</strong> Start with pre-built persona templates</li>
                <li><strong>Simulated Reactions:</strong> AI-generated feedback and reactions</li>
                <li><strong>Scoring:</strong> Overall effectiveness score with breakdown</li>
                <li><strong>History:</strong> Review past simulation results</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand DNA */}
        <AccordionItem value="brand-dna" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-primary" />
              <span className="font-semibold">Brand DNA</span>
              <Badge variant="secondary">Brand Identity</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Define and protect your brand identity across all AI-generated content.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Components</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Brand Voice:</strong> Tone spectrum, vocabulary, emotional signature</li>
                <li><strong>Brand Personality:</strong> Archetype and personality traits</li>
                <li><strong>Brand Story:</strong> Mission, vision, tagline, origin story</li>
                <li><strong>Guardrails:</strong> Forbidden words, topics to avoid, visual restrictions</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Health Dashboard</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Consistency Score:</strong> Overall brand health metric (0-100)</li>
                <li><strong>Drift Alerts:</strong> Notifications when content strays from brand guidelines</li>
                <li><strong>Content Audit:</strong> Review generated content for compliance</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* AI Insights */}
        <AccordionItem value="ai-insights" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-semibold">AI Insights</span>
              <Badge variant="secondary">Intelligence</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              AI-powered analytics and predictions to drive smarter decisions.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Capabilities</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Trend Lifecycle Prediction:</strong> Forecast trend duration and peak timing</li>
                <li><strong>Revenue Forecasting:</strong> Project campaign revenue potential</li>
                <li><strong>Demand Planning:</strong> Inventory recommendations based on trends</li>
                <li><strong>Conversational Analytics:</strong> Natural language queries for data</li>
                <li><strong>Voice-to-Brief:</strong> Speak campaign ideas, get structured briefs</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Analytics */}
        <AccordionItem value="analytics" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="font-semibold">Analytics</span>
              <Badge variant="secondary">Reporting</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Comprehensive analytics and reporting for all platform activities.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Metrics</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Campaign Performance:</strong> Impressions, clicks, conversions, CTR</li>
                <li><strong>Trend Comparison:</strong> Period-over-period analysis</li>
                <li><strong>Revenue Tracking:</strong> Spend and revenue metrics</li>
                <li><strong>Platform Breakdown:</strong> Performance by deployment platform</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
