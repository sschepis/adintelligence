import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Rocket, Globe, Palette, TrendingUp, Target, Sparkles } from "lucide-react";

export const GettingStartedGuide = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Getting Started with Instincts AI</h2>
        <p className="text-muted-foreground">
          Welcome to Instincts AI, your Predictive Commerce Engine. This guide will help you get up and running quickly.
        </p>
      </div>

      {/* Quick Start Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Quick Start Guide
          </CardTitle>
          <CardDescription>
            Complete these steps to start using Instincts AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              step: 1,
              title: "Create Your Account",
              description: "Sign up with your business email. We'll verify your domain to ensure brand authenticity.",
              tips: ["Use your company email domain", "Complete email verification"],
            },
            {
              step: 2,
              title: "Scan Your Brand",
              description: "Enter your website URL and our AI will automatically extract your brand colors, products, and identity.",
              tips: ["Ensure your website is accessible", "Products will be imported automatically"],
            },
            {
              step: 3,
              title: "Configure Brand DNA",
              description: "Review and refine your Brand DNA profile including voice, personality, and guardrails.",
              tips: ["Complete the personality quiz", "Set content guardrails"],
            },
            {
              step: 4,
              title: "Explore Trends",
              description: "Visit Signal Intelligence to discover trending topics relevant to your industry.",
              tips: ["Save trends for campaign creation", "Analyze trend velocity"],
            },
            {
              step: 5,
              title: "Deploy Your First Campaign",
              description: "Match trends to your inventory and deploy campaigns with one click.",
              tips: ["Use AI-generated creative assets", "Test with Simulation Studio first"],
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 p-4 rounded-lg border bg-card/50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {item.step}
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  {item.tips.map((tip, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {tip}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Platform Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
          <CardDescription>
            Understand the core modules of Instincts AI
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          {[
            {
              icon: TrendingUp,
              title: "Signal Intelligence",
              description: "Real-time trend detection from social media, search, and market data.",
            },
            {
              icon: Target,
              title: "Commerce Loop",
              description: "Match trends to your inventory and create smart product bundles.",
            },
            {
              icon: Sparkles,
              title: "Creative Forge",
              description: "AI-powered content and visual asset generation aligned to your brand.",
            },
            {
              icon: Globe,
              title: "Campaign Deployment",
              description: "One-click campaign deployment with real-time optimization.",
            },
            {
              icon: Palette,
              title: "Brand DNA",
              description: "Define and protect your brand voice, personality, and guardrails.",
            },
            {
              icon: Rocket,
              title: "Simulation Studio",
              description: "Test campaigns against AI personas before going live.",
            },
          ].map((module) => (
            <div key={module.title} className="p-4 rounded-lg border bg-card/50 space-y-2">
              <div className="flex items-center gap-2">
                <module.icon className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">{module.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{module.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Account Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Account Setup</CardTitle>
          <CardDescription>
            Configure your account for optimal performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold">Profile Settings</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
                <span><strong>Display Name:</strong> Set how your name appears across the platform</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
                <span><strong>Avatar:</strong> Upload a profile picture for your account</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
                <span><strong>Notifications:</strong> Configure email and in-app notification preferences</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Brand Configuration</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
                <span><strong>Brand Colors:</strong> Review and adjust your extracted brand colors</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
                <span><strong>Product Catalog:</strong> Manage your product inventory and categories</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
                <span><strong>Brand DNA:</strong> Complete your brand voice and personality profile</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Integration Setup</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
                <span><strong>Shopify:</strong> Connect your Shopify store for inventory sync</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
                <span><strong>API Access:</strong> Generate API tokens for programmatic access</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
                <span><strong>Webhooks:</strong> Set up event notifications for external systems</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
