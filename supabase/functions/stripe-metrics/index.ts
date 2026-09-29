import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-METRICS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verify admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) throw new Error("Admin access required");
    logStep("Admin access verified");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("STRIPE_SECRET_KEY not configured, returning empty metrics");
      return new Response(JSON.stringify({
        totalRevenue: 0,
        monthlyRevenue: 0,
        revenueGrowth: 0,
        mrr: 0,
        activeSubscriptions: 0,
        totalCustomers: 0,
        revenueByMonth: [],
        subscriptionTiers: [],
        balance: { available: 0, pending: 0 },
        billing_configured: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch balance
    const balance = await stripe.balance.retrieve();
    logStep("Balance retrieved");

    // Fetch all charges for revenue calculation
    const chargesThisMonth = await stripe.charges.list({
      created: { gte: Math.floor(startOfMonth.getTime() / 1000) },
      limit: 100,
    });

    const chargesLastMonth = await stripe.charges.list({
      created: {
        gte: Math.floor(startOfLastMonth.getTime() / 1000),
        lte: Math.floor(endOfLastMonth.getTime() / 1000),
      },
      limit: 100,
    });

    // Calculate monthly revenue
    const monthlyRevenue = chargesThisMonth.data
      .filter((c: Stripe.Charge) => c.status === 'succeeded')
      .reduce((sum: number, c: Stripe.Charge) => sum + c.amount, 0) / 100;

    const lastMonthRevenue = chargesLastMonth.data
      .filter((c: Stripe.Charge) => c.status === 'succeeded')
      .reduce((sum: number, c: Stripe.Charge) => sum + c.amount, 0) / 100;

    // Revenue growth percentage
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Get all customers for count
    const customers = await stripe.customers.list({ limit: 100 });
    const totalCustomers = customers.data.length;

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({ status: 'active', limit: 100 });
    const activeSubscriptions = subscriptions.data.length;

    // Get subscription MRR
    const mrr = subscriptions.data.reduce((sum: number, sub: Stripe.Subscription) => {
      const item = sub.items.data[0];
      const amount = item?.price?.unit_amount || 0;
      const interval = item?.price?.recurring?.interval;
      // Convert to monthly
      if (interval === 'year') return sum + (amount / 12);
      return sum + amount;
    }, 0) / 100;

    // Get total revenue (all time)
    const allCharges = await stripe.charges.list({ limit: 100 });
    const totalRevenue = allCharges.data
      .filter((c: Stripe.Charge) => c.status === 'succeeded')
      .reduce((sum: number, c: Stripe.Charge) => sum + c.amount, 0) / 100;

    // Get revenue by month for chart (last 6 months)
    const revenueByMonth: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthCharges = await stripe.charges.list({
        created: {
          gte: Math.floor(monthStart.getTime() / 1000),
          lte: Math.floor(monthEnd.getTime() / 1000),
        },
        limit: 100,
      });

      const monthRevenue = monthCharges.data
        .filter((c: Stripe.Charge) => c.status === 'succeeded')
        .reduce((sum: number, c: Stripe.Charge) => sum + c.amount, 0) / 100;

      revenueByMonth.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        revenue: monthRevenue,
      });
    }

    // Get subscription tier breakdown
    const tierBreakdown: Record<string, number> = {};
    for (const sub of subscriptions.data) {
      const productId = sub.items.data[0]?.price?.product as string;
      if (productId) {
        try {
          const product = await stripe.products.retrieve(productId);
          const tierName = product.name || 'Unknown';
          tierBreakdown[tierName] = (tierBreakdown[tierName] || 0) + 1;
        } catch {
          tierBreakdown['Unknown'] = (tierBreakdown['Unknown'] || 0) + 1;
        }
      }
    }

    const subscriptionTiers = Object.entries(tierBreakdown).map(([name, value]) => ({
      name,
      value,
    }));

    logStep("Metrics calculated", { 
      totalRevenue, 
      monthlyRevenue, 
      mrr, 
      activeSubscriptions,
      totalCustomers 
    });

    return new Response(JSON.stringify({
      totalRevenue,
      monthlyRevenue,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      mrr,
      activeSubscriptions,
      totalCustomers,
      revenueByMonth,
      subscriptionTiers,
      balance: {
        available: balance.available.reduce((sum: number, b: Stripe.Balance.Available) => sum + b.amount, 0) / 100,
        pending: balance.pending.reduce((sum: number, b: Stripe.Balance.Pending) => sum + b.amount, 0) / 100,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
