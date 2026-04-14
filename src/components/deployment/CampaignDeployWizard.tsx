import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Rocket, 
  CheckCircle2, 
  Circle,
  DollarSign,
  Target,
  Calendar,
  Loader2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Package
} from "lucide-react";
import { useInventorySync } from "@/hooks/useInventorySync";
import { useBrand } from "@/contexts/BrandContext";

interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  estimatedReach: string;
  cpm: string;
}

interface CampaignDeployWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName?: string;
  onDeploy?: (config: DeployConfig) => void;
}

interface DeployConfig {
  platforms: string[];
  budget: number;
  dailyBudget: number;
  duration: number;
  targetAudience: string;
  objective: string;
  reserveInventory: boolean;
  selectedProducts: string[];
}

interface ProductForReservation {
  id: string;
  name: string;
  image_url?: string;
  stock?: number;
}

const platforms: Platform[] = [
  { id: "meta", name: "Meta Ads", icon: "📘", connected: false, estimatedReach: "2.5M", cpm: "$8.50" },
  { id: "google", name: "Google Ads", icon: "🔍", connected: false, estimatedReach: "3.2M", cpm: "$6.20" },
  { id: "tiktok", name: "TikTok Ads", icon: "🎵", connected: false, estimatedReach: "1.8M", cpm: "$4.80" },
  { id: "pinterest", name: "Pinterest Ads", icon: "📌", connected: false, estimatedReach: "890K", cpm: "$5.40" },
];

const objectives = [
  { id: "awareness", label: "Brand Awareness", description: "Maximize reach and impressions" },
  { id: "traffic", label: "Website Traffic", description: "Drive visitors to your site" },
  { id: "conversions", label: "Conversions", description: "Optimize for purchases" },
  { id: "engagement", label: "Engagement", description: "Increase likes, shares, comments" },
];

export function CampaignDeployWizard({ 
  open, 
  onOpenChange, 
  campaignName = "New Campaign",
  onDeploy 
}: CampaignDeployWizardProps) {
  const [step, setStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const { inventory, reserveInventory } = useInventorySync();
  const { activeBrand } = useBrand();
  
  // Get products for reservation
  const products: ProductForReservation[] = (activeBrand?.products || []).slice(0, 6).map((p: any, i: number) => ({
    id: p.id || `product-${i}`,
    name: p.name || `Product ${i + 1}`,
    image_url: p.image_url,
    stock: p.stock ?? 0,
  }));
  
  const [config, setConfig] = useState<DeployConfig>({
    platforms: [],
    budget: 5000,
    dailyBudget: 500,
    duration: 14,
    targetAudience: "Custom Audience",
    objective: "conversions",
    reserveInventory: true,
    selectedProducts: [],
  });

  const togglePlatform = (platformId: string) => {
    setConfig(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const toggleProduct = (productId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter(p => p !== productId)
        : [...prev.selectedProducts, productId]
    }));
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    
    // Reserve inventory if enabled
    if (config.reserveInventory && config.selectedProducts.length > 0) {
      const quantities: Record<string, number> = {};
      config.selectedProducts.forEach(id => {
        quantities[id] = Math.ceil(config.budget / 100); // Reserve based on budget
      });
      // Generate temporary campaign ID for tracking, pass campaign name for movement records
      const tempCampaignId = `campaign-${Date.now()}`;
      await reserveInventory(config.selectedProducts, tempCampaignId, quantities, campaignName);
    }
    
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsDeploying(false);
    setDeploySuccess(true);
    onDeploy?.(config);
  };

  const estimatedReach = config.platforms.reduce((sum, pId) => {
    const platform = platforms.find(p => p.id === pId);
    if (!platform) return sum;
    const reach = parseFloat(platform.estimatedReach.replace(/[KM]/g, ''));
    const multiplier = platform.estimatedReach.includes('M') ? 1000000 : 1000;
    return sum + (reach * multiplier);
  }, 0);

  const formatReach = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const resetWizard = () => {
    setStep(1);
    setDeploySuccess(false);
    setConfig({
      platforms: [],
      budget: 5000,
      dailyBudget: 500,
      duration: 14,
      targetAudience: "Custom Audience",
      objective: "conversions",
      reserveInventory: true,
      selectedProducts: [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetWizard(); }}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Deploy Campaign: {campaignName}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        {!deploySuccess && (
          <div className="flex items-center justify-center gap-2 py-4">
            {[
              { num: 1, label: "Platforms" },
              { num: 2, label: "Budget" },
              { num: 3, label: "Review" },
            ].map(({ num, label }, i) => (
              <div key={num} className="flex items-center">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  step >= num ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                )}>
                  {step > num ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  {label}
                </div>
                {i < 2 && <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Platform Selection */}
        {step === 1 && !deploySuccess && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-sm text-muted-foreground">
              Select platforms to deploy your campaign
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    config.platforms.includes(platform.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{platform.icon}</span>
                    {!platform.connected && (
                      <Badge variant="outline" className="text-xs">
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium">{platform.name}</h4>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>Reach: {platform.estimatedReach}</span>
                    <span>CPM: {platform.cpm}</span>
                  </div>
                </button>
              ))}
            </div>

            {config.platforms.length > 0 && config.platforms.some(p => !platforms.find(pl => pl.id === p)?.connected) && (
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/30 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-accent">Connection Required</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Some platforms need to be connected before deploying. You'll be prompted to connect during deployment.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                variant="gradient"
                onClick={() => setStep(2)}
                disabled={config.platforms.length === 0}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Budget & Duration */}
        {step === 2 && !deploySuccess && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Campaign Objective
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {objectives.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setConfig(prev => ({ ...prev, objective: obj.id }))}
                    className={cn(
                      "p-3 rounded-lg text-left transition-all",
                      config.objective === obj.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <p className="font-medium text-sm">{obj.label}</p>
                    <p className={cn(
                      "text-xs mt-0.5",
                      config.objective === obj.id ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {obj.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Total Budget
                </Label>
                <span className="font-display font-bold text-lg">
                  ${config.budget.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[config.budget]}
                onValueChange={([v]) => setConfig(prev => ({ ...prev, budget: v }))}
                min={500}
                max={50000}
                step={500}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$500</span>
                <span>$50,000</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Duration
                </Label>
                <span className="font-display font-bold">
                  {config.duration} days
                </span>
              </div>
              <Slider
                value={[config.duration]}
                onValueChange={([v]) => setConfig(prev => ({ 
                  ...prev, 
                  duration: v,
                  dailyBudget: Math.round(prev.budget / v)
                }))}
                min={3}
                max={90}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3 days</span>
                <span>90 days</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily Budget</span>
                <span className="font-medium">${Math.round(config.budget / config.duration)}/day</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Reach</span>
                <span className="font-medium">{formatReach(estimatedReach)}</span>
              </div>
            </div>

            {/* Inventory Reservation */}
            {products.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Reserve Inventory
                  </Label>
                  <Checkbox
                    checked={config.reserveInventory}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, reserveInventory: !!checked }))
                    }
                  />
                </div>
                
                {config.reserveInventory && (
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg text-left transition-all text-sm",
                          config.selectedProducts.includes(product.id)
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-secondary/50 border-2 border-transparent hover:border-primary/30"
                        )}
                      >
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate text-xs">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.stock} units</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="gradient" onClick={() => setStep(3)}>
                Review Campaign
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Deploy */}
        {step === 3 && !deploySuccess && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
              <h4 className="font-medium">Campaign Summary</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platforms</span>
                  <span className="font-medium">
                    {config.platforms.map(p => platforms.find(pl => pl.id === p)?.name).join(", ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Objective</span>
                  <span className="font-medium">
                    {objectives.find(o => o.id === config.objective)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Budget</span>
                  <span className="font-medium">${config.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{config.duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Spend</span>
                  <span className="font-medium">${Math.round(config.budget / config.duration)}/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Reach</span>
                  <span className="font-medium text-primary">{formatReach(estimatedReach)}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-sm">
              <p className="text-primary font-medium">Ready to go live!</p>
              <p className="text-muted-foreground text-xs mt-1">
                Your campaign will start running immediately after deployment. You can pause or edit it anytime.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                variant="gradient" 
                onClick={handleDeploy}
                disabled={isDeploying}
                className="min-w-[140px]"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Deploy Now
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Success State */}
        {deploySuccess && (
          <div className="py-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-signal-rising/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-signal-rising" style={{ color: 'hsl(160 84% 45%)' }} />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">Campaign Deployed!</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Your campaign is now live on {config.platforms.length} platform{config.platforms.length > 1 ? 's' : ''}.
            </p>
            
            <div className="p-4 rounded-lg bg-secondary/50 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-display font-bold text-primary">
                    ${config.budget.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Budget</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-accent">
                    {config.duration}d
                  </p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-bold" style={{ color: 'hsl(160 84% 45%)' }}>
                    {formatReach(estimatedReach)}
                  </p>
                  <p className="text-xs text-muted-foreground">Est. Reach</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="glass" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button variant="gradient" className="gap-2">
                View Campaign
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
