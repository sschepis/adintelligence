import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, 
  Scan, 
  Brain, 
  Palette, 
  Megaphone, 
  Users, 
  Rocket, 
  BarChart3,
  TrendingUp,
  Zap,
  CheckCircle2,
  Play,
  Pause
} from "lucide-react";
import { GlowingCard } from "@/components/effects/GlowingCard";
import { Button } from "@/components/ui/button";

const workflowSteps = [
  {
    id: "ingest",
    icon: Globe,
    title: "Ingest",
    subtitle: "Scan & Import",
    description: "Your brand URL becomes a complete product catalog",
    color: "from-signal-rising to-primary",
    colorClass: "bg-signal-rising",
  },
  {
    id: "analyze",
    icon: Brain,
    title: "Analyze",
    subtitle: "AI Detection",
    description: "Real-time trend signals matched to your inventory",
    color: "from-primary to-accent",
    colorClass: "bg-primary",
  },
  {
    id: "campaign",
    icon: Palette,
    title: "Campaign",
    subtitle: "Creative Generation",
    description: "AI generates optimized ad variations instantly",
    color: "from-accent to-signal-warm",
    colorClass: "bg-accent",
  },
  {
    id: "test",
    icon: Users,
    title: "Test",
    subtitle: "Focus Groups",
    description: "Synthetic personas validate before you spend",
    color: "from-signal-stable to-signal-stable",
    colorClass: "bg-signal-stable",
  },
  {
    id: "publish",
    icon: Rocket,
    title: "Publish",
    subtitle: "One-Click Deploy",
    description: "Live campaigns across all platforms instantly",
    color: "from-signal-rising to-primary",
    colorClass: "bg-signal-rising",
  },
  {
    id: "measure",
    icon: BarChart3,
    title: "Measure",
    subtitle: "Real-Time ROI",
    description: "Track performance and auto-optimize continuously",
    color: "from-signal-warm to-accent",
    colorClass: "bg-signal-warm",
  },
];

export function WorkflowDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentStep = workflowSteps[activeStep];

  return (
    <div className="space-y-8">
      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 md:gap-4">
        {workflowSteps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => {
              setActiveStep(index);
              setIsPlaying(false);
            }}
            className="group relative"
          >
            <motion.div
              className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                index === activeStep
                  ? `bg-gradient-to-br ${step.color} shadow-lg`
                  : index < activeStep
                  ? "bg-primary/20"
                  : "bg-muted/50"
              }`}
              animate={index === activeStep ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <step.icon className={`w-5 h-5 md:w-6 md:h-6 ${
                index === activeStep ? "text-white" : "text-muted-foreground"
              }`} />
              {index < activeStep && (
                <div className="absolute -top-1 -right-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500 fill-background" />
                </div>
              )}
            </motion.div>
            <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-medium whitespace-nowrap transition-colors ${
              index === activeStep ? "text-foreground" : "text-muted-foreground"
            }`}>
              {step.title}
            </div>
            {index < workflowSteps.length - 1 && (
              <div className={`absolute top-1/2 -right-1 md:-right-2 w-2 md:w-4 h-0.5 -translate-y-1/2 transition-colors ${
                index < activeStep ? "bg-primary/50" : "bg-border"
              }`} />
            )}
          </button>
        ))}
      </div>

      {/* Playback Control */}
      <div className="flex justify-center pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-muted-foreground"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause Demo
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Auto-Play
            </>
          )}
        </Button>
      </div>

      {/* Demo Visualization */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <GlowingCard className="p-8 min-h-[400px]">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: Description */}
              <div className="space-y-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${currentStep.color} text-white text-sm font-medium`}>
                  <currentStep.icon className="w-4 h-4" />
                  {currentStep.subtitle}
                </div>
                <h3 className="font-display font-bold text-3xl">{currentStep.title}</h3>
                <p className="text-lg text-muted-foreground">{currentStep.description}</p>
                
                {/* Step-specific details */}
                <StepDetails step={currentStep.id} />
              </div>

              {/* Right: Visualization */}
              <div className="relative">
                <StepVisualization step={currentStep.id} />
              </div>
            </div>
          </GlowingCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StepDetails({ step }: { step: string }) {
  const details: Record<string, { items: string[] }> = {
    ingest: {
      items: [
        "Automatic product catalog extraction",
        "Brand color & logo detection",
        "Category taxonomy mapping",
        "Competitor landscape analysis"
      ]
    },
    analyze: {
      items: [
        "Cross-platform signal monitoring",
        "Visual pattern recognition",
        "Velocity & sentiment scoring",
        "Inventory match suggestions"
      ]
    },
    campaign: {
      items: [
        "AI headline & copy generation",
        "Dynamic creative optimization",
        "Multi-format asset creation",
        "A/B variant suggestions"
      ]
    },
    test: {
      items: [
        "Demographic persona simulation",
        "Emotional reaction mapping",
        "Purchase intent prediction",
        "Objection identification"
      ]
    },
    publish: {
      items: [
        "Multi-platform deployment",
        "Budget allocation optimization",
        "Audience targeting sync",
        "Tracking pixel automation"
      ]
    },
    measure: {
      items: [
        "Real-time performance dashboards",
        "Attribution modeling",
        "Automated bid adjustments",
        "ROI forecasting"
      ]
    },
  };

  return (
    <ul className="space-y-2 pt-4">
      {details[step]?.items.map((item, i) => (
        <motion.li
          key={item}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Zap className="w-3 h-3 text-primary" />
          {item}
        </motion.li>
      ))}
    </ul>
  );
}

function StepVisualization({ step }: { step: string }) {
  switch (step) {
    case "ingest":
      return <IngestDemo />;
    case "analyze":
      return <AnalyzeDemo />;
    case "campaign":
      return <CampaignDemo />;
    case "test":
      return <TestDemo />;
    case "publish":
      return <PublishDemo />;
    case "measure":
      return <MeasureDemo />;
    default:
      return null;
  }
}

function IngestDemo() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => prev < 100 ? prev + 2 : 0);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const products = [
    { name: "Silk Serum", category: "Skincare" },
    { name: "Glow Mask", category: "Treatments" },
    { name: "Vitamin C", category: "Serums" },
    { name: "Night Cream", category: "Moisturizers" },
  ];

  return (
    <div className="space-y-4">
      {/* URL Input Mock */}
      <div className="bg-background/50 rounded-lg p-4 border border-border/50">
        <div className="flex items-center gap-2 text-sm">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">luxeskincare.com</span>
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="ml-auto"
          >
            <Scan className="w-4 h-4 text-primary" />
          </motion.div>
        </div>
        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Extracted Products */}
      <div className="grid grid-cols-2 gap-2">
        {products.map((product, i) => (
          <motion.div
            key={product.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15 }}
            className="bg-muted/30 rounded-lg p-3 border border-border/30"
          >
            <div className="text-sm font-medium">{product.name}</div>
            <div className="text-xs text-muted-foreground">{product.category}</div>
          </motion.div>
        ))}
      </div>

      {/* Color Palette */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Brand Colors:</span>
        {["#f472b6", "#c084fc", "#60a5fa", "#34d399"].map((color, i) => (
          <motion.div
            key={color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="w-6 h-6 rounded-full border border-border/50"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}

function AnalyzeDemo() {
  const trends = [
    { name: "#GlazedSkin", velocity: 94, platform: "TikTok", match: 3 },
    { name: "Clean Girl Aesthetic", velocity: 87, platform: "Instagram", match: 5 },
    { name: "Glass Skin Era", velocity: 76, platform: "Pinterest", match: 2 },
  ];

  return (
    <div className="space-y-3">
      {trends.map((trend, i) => (
        <motion.div
          key={trend.name}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.2 }}
          className="bg-background/50 rounded-lg p-4 border border-border/50"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                trend.velocity > 90 ? "bg-signal-hot" : trend.velocity > 80 ? "bg-signal-warm" : "bg-accent"
              } animate-pulse`} />
              <span className="font-medium text-sm">{trend.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{trend.platform}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Velocity</span>
                <span className="text-primary font-medium">{trend.velocity}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${trend.velocity}%` }}
                  transition={{ delay: i * 0.2 + 0.3, duration: 0.5 }}
                />
              </div>
            </div>
            <div className="text-xs">
              <span className="text-signal-stable font-medium">{trend.match} matches</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CampaignDemo() {
  const [activeVariant, setActiveVariant] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVariant(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const variants = [
    { headline: "Get That Glazed Glow ✨", cta: "Shop Now", score: 94 },
    { headline: "Your Glass Skin Era Starts Here", cta: "Discover", score: 87 },
    { headline: "Dewy Skin in 3 Steps", cta: "Try Today", score: 91 },
  ];

  return (
    <div className="space-y-4">
      {/* Ad Preview */}
      <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl p-6 border border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDIwIEwgMjAgMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTSAyMCAwIEwgMjAgMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2dyaWQpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeVariant}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-10 text-center"
          >
            <div className="text-xl font-display font-bold mb-3">{variants[activeVariant].headline}</div>
            <div className="inline-block px-4 py-2 rounded-full bg-white text-black text-sm font-medium">
              {variants[activeVariant].cta}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Variant Selector */}
      <div className="flex gap-2">
        {variants.map((v, i) => (
          <button
            key={i}
            onClick={() => setActiveVariant(i)}
            className={`flex-1 p-2 rounded-lg border transition-all ${
              i === activeVariant 
                ? "border-primary bg-primary/10" 
                : "border-border/50 bg-muted/20"
            }`}
          >
            <div className="text-xs font-medium mb-1">Variant {i + 1}</div>
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3 text-signal-stable" />
              <span className="text-xs text-signal-stable">{v.score}%</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TestDemo() {
  const personas = [
    { name: "Sarah, 28", type: "Early Adopter", reaction: "😍", score: 92 },
    { name: "Mike, 35", type: "Skeptical Buyer", reaction: "🤔", score: 67 },
    { name: "Emma, 24", type: "Trend Follower", reaction: "🔥", score: 95 },
  ];

  return (
    <div className="space-y-3">
      {personas.map((persona, i) => (
        <motion.div
          key={persona.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.2 }}
          className="bg-background/50 rounded-lg p-4 border border-border/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-lg">
              {persona.reaction}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{persona.name}</div>
              <div className="text-xs text-muted-foreground">{persona.type}</div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${
                persona.score > 80 ? "text-signal-stable" : persona.score > 60 ? "text-signal-warm" : "text-signal-hot"
              }`}>
                {persona.score}%
              </div>
              <div className="text-[10px] text-muted-foreground">Intent</div>
            </div>
          </div>
          <motion.div
            className="mt-2 h-1 bg-muted rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.2 + 0.3 }}
          >
            <motion.div
              className={`h-full ${
                persona.score > 80 ? "bg-signal-stable" : persona.score > 60 ? "bg-signal-warm" : "bg-signal-hot"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${persona.score}%` }}
              transition={{ delay: i * 0.2 + 0.4, duration: 0.5 }}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

function PublishDemo() {
  const [deployed, setDeployed] = useState<string[]>([]);
  
  useEffect(() => {
    const platforms = ["meta", "tiktok", "google"];
    let i = 0;
    const interval = setInterval(() => {
      if (i < platforms.length) {
        setDeployed(prev => [...prev, platforms[i]]);
        i++;
      } else {
        setDeployed([]);
        i = 0;
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const platforms = [
    { id: "meta", name: "Meta Ads", budget: "$2,500/day" },
    { id: "tiktok", name: "TikTok Ads", budget: "$1,800/day" },
    { id: "google", name: "Google Ads", budget: "$1,200/day" },
  ];

  return (
    <div className="space-y-3">
      {platforms.map((platform) => (
        <motion.div
          key={platform.id}
          className={`bg-background/50 rounded-lg p-4 border transition-all duration-300 ${
            deployed.includes(platform.id) 
              ? "border-signal-stable/50 bg-signal-stable/5" 
              : "border-border/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                deployed.includes(platform.id) ? "bg-signal-stable" : "bg-muted"
              }`}>
                {deployed.includes(platform.id) ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Rocket className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="font-medium text-sm">{platform.name}</div>
                <div className="text-xs text-muted-foreground">{platform.budget}</div>
              </div>
            </div>
            <div className={`text-xs font-medium ${
              deployed.includes(platform.id) ? "text-signal-stable" : "text-muted-foreground"
            }`}>
              {deployed.includes(platform.id) ? "Live ✓" : "Pending..."}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MeasureDemo() {
  const [metrics, setMetrics] = useState({ roas: 0, conv: 0, ctr: 0 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        roas: Math.random() * 2 + 3.5,
        conv: Math.random() * 100 + 200,
        ctr: Math.random() * 2 + 4,
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Main Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-background/50 rounded-lg p-3 border border-border/50 text-center">
          <div className="text-2xl font-bold text-signal-stable">{metrics.roas.toFixed(1)}x</div>
          <div className="text-xs text-muted-foreground">ROAS</div>
        </div>
        <div className="bg-background/50 rounded-lg p-3 border border-border/50 text-center">
          <div className="text-2xl font-bold text-primary">{Math.floor(metrics.conv)}</div>
          <div className="text-xs text-muted-foreground">Conversions</div>
        </div>
        <div className="bg-background/50 rounded-lg p-3 border border-border/50 text-center">
          <div className="text-2xl font-bold text-accent">{metrics.ctr.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">CTR</div>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="bg-background/50 rounded-lg p-4 border border-border/50">
        <div className="flex items-end justify-between h-24 gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-gradient-to-t from-primary to-primary/30 rounded-t"
              initial={{ height: 0 }}
              animate={{ height: `${30 + Math.random() * 70}%` }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>Now</span>
        </div>
      </div>
    </div>
  );
}
