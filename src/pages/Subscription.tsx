import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleBackground } from "@/components/effects/ParticleBackground";
import { GlowingCard } from "@/components/effects/GlowingCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Stripe price and product IDs
const SUBSCRIPTION_TIERS = {
  starter: {
    monthly: {
      priceId: "price_1SbvA0FQYw8h4rbm1yMEhu3G",
      price: 49,
    },
    annual: {
      priceId: "price_1SbvaDFQYw8h4rbmfm2iGe9t",
      price: 39, // $468/year = $39/mo equivalent
      yearlyTotal: 468,
    },
    productId: "prod_TZ3GUgvXoroOA4",
  },
  growth: {
    monthly: {
      priceId: "price_1SbvA2FQYw8h4rbmcW8fJFIr",
      price: 149,
    },
    annual: {
      priceId: "price_1SbvaEFQYw8h4rbm6aCwqLJL",
      price: 119, // $1428/year = $119/mo equivalent
      yearlyTotal: 1428,
    },
    productId: "prod_TZ3GXXeqzd3fiq",
  },
  enterprise: {
    monthly: {
      priceId: "price_1SbvA4FQYw8h4rbm68Jd15uU",
      price: 499,
    },
    annual: {
      priceId: "price_1SbvaGFQYw8h4rbms83vzCzo",
      price: 399, // $4788/year = $399/mo equivalent
      yearlyTotal: 4788,
    },
    productId: "prod_TZ3GOll4adkdDe",
  },
};

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Zap,
    description: 'For growing brands',
    features: [
      'Up to 100 products',
      '5 AI simulations/month',
      'Basic trend detection',
      'Email support',
    ],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'growth',
    name: 'Growth',
    icon: Sparkles,
    description: 'For scaling brands',
    popular: true,
    features: [
      'Up to 1,000 products',
      'Unlimited AI simulations',
      'Advanced trend detection',
      'Real-time morphing',
      'Priority support',
      'API access',
    ],
    color: 'from-primary to-accent',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Crown,
    description: 'For large operations',
    features: [
      'Unlimited products',
      'Custom AI models',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'On-premise option',
    ],
    color: 'from-amber-500 to-orange-500',
  },
];

const Subscription = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [trialEnds, setTrialEnds] = useState<Date | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    // Check for canceled checkout
    if (searchParams.get('canceled') === 'true') {
      toast.error("Checkout was canceled. You can try again or start a free trial.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    } else if (user) {
      fetchOrgDetails();
    }
  }, [user, authLoading, navigate]);

  const fetchOrgDetails = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profile?.org_id) {
      const { data: org } = await supabase
        .from('organizations')
        .select('trial_ends_at, subscription_status')
        .eq('id', profile.org_id)
        .single();

      if (org?.trial_ends_at) {
        setTrialEnds(new Date(org.trial_ends_at));
      }

      // If already subscribed, redirect to dashboard
      if (org?.subscription_status === 'active') {
        navigate('/dashboard');
      }
    }
  };

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    setIsProcessing(true);

    try {
      const tier = SUBSCRIPTION_TIERS[planId as keyof typeof SUBSCRIPTION_TIERS];
      if (!tier) {
        toast.error("Invalid plan selected");
        return;
      }

      const priceId = billingPeriod === 'annual' ? tier.annual.priceId : tier.monthly.priceId;

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId, priceId }
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
      toast.info("Checkout opened in a new tab. Complete your purchase there.");
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || "Failed to start checkout. Please try again.");
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const handleStartTrial = async () => {
    setIsProcessing(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('user_id', user!.id)
        .single();

      if (profile?.org_id) {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);
        
        await supabase
          .from('organizations')
          .update({ 
            subscription_status: 'trial',
            trial_ends_at: trialEndDate.toISOString()
          })
          .eq('id', profile.org_id);
      }

      toast.success("Your 7-day trial has started!");
      navigate('/dashboard');
    } catch (error) {
      console.error('Trial start error:', error);
      toast.error("Failed to start trial. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getPrice = (planId: string) => {
    const tier = SUBSCRIPTION_TIERS[planId as keyof typeof SUBSCRIPTION_TIERS];
    return billingPeriod === 'annual' ? tier.annual.price : tier.monthly.price;
  };

  const getSavings = (planId: string) => {
    const tier = SUBSCRIPTION_TIERS[planId as keyof typeof SUBSCRIPTION_TIERS];
    const monthlyTotal = tier.monthly.price * 12;
    const annualTotal = tier.annual.yearlyTotal;
    return monthlyTotal - annualTotal;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Instincts AI</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start with a 7-day free trial. No credit card required.
          </p>
          {trialEnds && (
            <p className="text-sm text-primary mt-2">
              Trial ends: {trialEnds.toLocaleDateString()}
            </p>
          )}
        </motion.div>

        {/* Billing Toggle */}
        <motion.div 
          className="flex items-center justify-center gap-4 mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              <GlowingCard 
                className={`p-6 h-full relative ${plan.popular ? 'border-primary/50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${getPrice(plan.id)}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  {billingPeriod === 'annual' && (
                    <p className="text-xs text-green-400 mt-1">
                      Save ${getSavings(plan.id)}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90' 
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isProcessing}
                >
                  {isProcessing && selectedPlan === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </GlowingCard>
            </motion.div>
          ))}
        </div>

        {/* Skip to Trial */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={handleStartTrial}
            disabled={isProcessing}
            className="text-muted-foreground hover:text-foreground"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting trial...
              </>
            ) : (
              'Skip for now → Start 7-day trial'
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Subscription;
