import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, DollarSign, TrendingUp, Clock, Percent } from "lucide-react";
import { GlowingCard } from "@/components/effects/GlowingCard";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export function ROICalculator() {
  const [monthlyAdSpend, setMonthlyAdSpend] = useState(25000);
  const [currentROAS, setCurrentROAS] = useState(2.5);
  const [campaignsPerMonth, setCampaignsPerMonth] = useState(4);

  // Calculations based on platform improvements
  const roasImprovement = 1.47; // 47% improvement
  const timeReduction = 0.85; // 85% time saved
  const additionalCampaigns = Math.floor(campaignsPerMonth * 2.5); // More campaigns possible
  
  const currentRevenue = monthlyAdSpend * currentROAS;
  const projectedROAS = currentROAS * roasImprovement;
  const projectedRevenue = monthlyAdSpend * projectedROAS;
  const additionalRevenue = projectedRevenue - currentRevenue;
  const yearlyGain = additionalRevenue * 12;
  const hoursSaved = campaignsPerMonth * 40 * timeReduction; // 40 hours per campaign

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Inputs */}
      <GlowingCard className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-xl">Your Current Numbers</h3>
        </div>

        <div className="space-y-8">
          {/* Monthly Ad Spend */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Monthly Ad Spend</Label>
              <span className="text-lg font-bold text-foreground">{formatCurrency(monthlyAdSpend)}</span>
            </div>
            <Slider
              value={[monthlyAdSpend]}
              onValueChange={(v) => setMonthlyAdSpend(v[0])}
              min={5000}
              max={500000}
              step={5000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$5K</span>
              <span>$500K</span>
            </div>
          </div>

          {/* Current ROAS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Current ROAS</Label>
              <span className="text-lg font-bold text-foreground">{currentROAS.toFixed(1)}x</span>
            </div>
            <Slider
              value={[currentROAS]}
              onValueChange={(v) => setCurrentROAS(v[0])}
              min={0.5}
              max={6}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5x</span>
              <span>6x</span>
            </div>
          </div>

          {/* Campaigns per Month */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Campaigns per Month</Label>
              <span className="text-lg font-bold text-foreground">{campaignsPerMonth}</span>
            </div>
            <Slider
              value={[campaignsPerMonth]}
              onValueChange={(v) => setCampaignsPerMonth(v[0])}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>20</span>
            </div>
          </div>
        </div>
      </GlowingCard>

      {/* Results */}
      <div className="space-y-4">
        <GlowingCard className="p-6 bg-gradient-to-br from-signal-stable/10 to-signal-stable/5 border-signal-stable/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-signal-stable/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-signal-stable" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Projected Additional Revenue</div>
              <div className="text-3xl font-display font-bold text-signal-stable">
                {formatCurrency(additionalRevenue)}
                <span className="text-lg text-signal-stable/70">/mo</span>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            That's <span className="text-signal-stable font-semibold">{formatCurrency(yearlyGain)}</span> extra per year
          </div>
        </GlowingCard>

        <div className="grid grid-cols-2 gap-4">
          <GlowingCard className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Projected ROAS</span>
            </div>
            <div className="text-2xl font-bold text-primary">{projectedROAS.toFixed(1)}x</div>
            <div className="text-xs text-signal-stable mt-1">+{((roasImprovement - 1) * 100).toFixed(0)}% improvement</div>
          </GlowingCard>

          <GlowingCard className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Hours Saved</span>
            </div>
            <div className="text-2xl font-bold text-accent">{Math.floor(hoursSaved)}</div>
            <div className="text-xs text-muted-foreground mt-1">per month</div>
          </GlowingCard>

          <GlowingCard className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-signal-rising" />
              <span className="text-xs text-muted-foreground">Current Revenue</span>
            </div>
            <div className="text-2xl font-bold text-foreground/70">{formatCurrency(currentRevenue)}</div>
            <div className="text-xs text-muted-foreground mt-1">per month</div>
          </GlowingCard>

          <GlowingCard className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-signal-stable" />
              <span className="text-xs text-muted-foreground">Projected Revenue</span>
            </div>
            <div className="text-2xl font-bold text-signal-stable">{formatCurrency(projectedRevenue)}</div>
            <div className="text-xs text-muted-foreground mt-1">per month</div>
          </GlowingCard>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          *Based on average results from 2,800+ brands using Instincts AI
        </p>
      </div>
    </div>
  );
}
