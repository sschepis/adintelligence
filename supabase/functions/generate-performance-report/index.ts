import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { period, brandId, brandName, includeMetrics, includeRecommendations } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch real data for the report
    let campaignData = { total: 0, active: 0 };
    let trendData = { tracked: 0 };
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        // Get campaign stats
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('status')
          .eq('user_id', user.id);
        
        if (campaigns) {
          campaignData.total = campaigns.length;
          campaignData.active = campaigns.filter(c => c.status === 'active').length;
        }

        // Get saved trends
        const { data: trends } = await supabase
          .from('saved_trends')
          .select('id')
          .eq('user_id', user.id);
        
        if (trends) {
          trendData.tracked = trends.length;
        }
      }
    }

    const periodLabel = period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly';
    const dateRange = period === 'daily' ? 'last 24 hours' : period === 'weekly' ? 'last 7 days' : 'last 30 days';

    const systemPrompt = `You are an expert marketing analyst generating ${periodLabel} performance reports.

Generate a comprehensive performance summary report with:
1. Executive summary (2-3 sentences)
2. Key highlights (3-5 bullet points)
3. Performance metrics analysis
4. Actionable recommendations (3-5 items)

Current Data:
- Brand: ${brandName || 'Unknown'}
- Campaigns: ${campaignData.total} total, ${campaignData.active} active
- Tracked Trends: ${trendData.tracked}
- Period: ${dateRange}

Format as JSON:
{
  "title": "${periodLabel} Performance Report - ${new Date().toLocaleDateString()}",
  "summary": "Executive summary...",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "metrics": {
    "campaigns": { "total": ${campaignData.total}, "active": ${campaignData.active}, "performance": "summary" },
    "trends": { "tracked": ${trendData.tracked}, "matched": 0, "topTrend": "trend name" },
    "inventory": { "totalProducts": 0, "lowStock": 0, "trending": 0 },
    "revenue": { "estimated": "$0", "change": "+0%" }
  },
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "rawContent": "Full markdown report content..."
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a ${periodLabel.toLowerCase()} performance report for ${brandName || 'our brand'}. ${includeMetrics ? 'Include detailed metrics.' : ''} ${includeRecommendations ? 'Include actionable recommendations.' : ''}` }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        title: `${periodLabel} Performance Report`,
        summary: "Report generation encountered an issue. Please try again.",
        highlights: [],
        metrics: {
          campaigns: campaignData,
          trends: trendData,
          inventory: { totalProducts: 0, lowStock: 0, trending: 0 }
        },
        recommendations: [],
        rawContent: content
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Report generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: message,
      title: "Report Generation Failed",
      summary: "Unable to generate report at this time.",
      highlights: [],
      metrics: {},
      recommendations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
