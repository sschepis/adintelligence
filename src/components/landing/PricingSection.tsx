import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { GlowingCard } from "@/components/effects/GlowingCard";
import { Button } from "@/components/ui/button";

const plans = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 49,
    annualPrice: 39,
    annualSavings: 120,
    description: "Perfect for emerging brands testing trend-driven commerce",
    icon: Sparkles,
    popular: false,
    features: [
      "Up to 100 products monitored",
      "3 trend signals per day",
      "Basic inventory matching",
      "5 synthetic focus group tests/mo",
      "Single ad platform integration",
      "Email support",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 149,
    annualPrice: 119,
    annualSavings: 360,
    description: "For scaling brands ready to dominate their market",
    icon: Zap,
    popular: true,
    features: [
      "Up to 1,000 products monitored",
      "Unlimited trend signals",
      "Advanced inventory intelligence",
      "50 synthetic focus group tests/mo",
      "All ad platform integrations",
      "Real-time campaign morphing",
      "Priority support",
      "Custom brand theming",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 499,
    annualPrice: 399,
    annualSavings: 1200,
    description: "For market leaders requiring custom solutions",
    icon: Crown,
    popular: false,
    features: [
      "Unlimited products",
      "Custom AI model training",
      "Dedicated trend analyst",
      "Unlimited focus group tests",
      "White-label options",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Start Free Trial",
  },
];

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const handleGetStarted = () => {
    // Scroll to top where the onboarding form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <motion.div 
        className="flex items-center justify-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <button
          onClick={() => setBillingPeriod('monthly')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            billingPeriod === 'monthly'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingPeriod('annual')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
            billingPeriod === 'annual'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          Annual
          <span className="bg-signal-stable/20 text-signal-stable text-xs px-2 py-0.5 rounded-full">
            Save 20%
          </span>
        </button>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="relative"
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-xs font-semibold text-primary-foreground">
                  Most Popular
                </span>
              </div>
            )}
            
            <GlowingCard 
              className={`p-6 lg:p-8 h-full flex flex-col ${
                plan.popular 
                  ? "border-primary/50 bg-gradient-to-b from-primary/5 to-transparent" 
                  : ""
              }`}
            >
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.popular 
                      ? "bg-gradient-to-br from-primary to-accent" 
                      : "bg-muted"
                  }`}>
                    <plan.icon className={`w-5 h-5 ${plan.popular ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <h3 className="font-display font-semibold text-xl">{plan.name}</h3>
                </div>
                
                <div className="mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display font-bold">
                      ${billingPeriod === 'annual' ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {billingPeriod === 'annual' && (
                    <p className="text-xs text-signal-stable mt-1">
                      Save ${plan.annualSavings}/year
                    </p>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? "text-primary" : "text-signal-stable"}`} />
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button 
                className={`w-full h-12 ${
                  plan.popular 
                    ? "bg-gradient-to-r from-primary to-accent hover:opacity-90" 
                    : ""
                }`}
                variant={plan.popular ? "default" : "outline"}
                onClick={handleGetStarted}
              >
                {plan.cta}
              </Button>
            </GlowingCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
