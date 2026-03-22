import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const includeSentiment = context?.includeSentiment === true;
    const sentimentOnly = context?.sentimentOnly === true;
    const competitorAnalysis = context?.competitorAnalysis === true;

    let systemPrompt: string;

    if (sentimentOnly) {
      systemPrompt = `You are a sentiment analysis expert. Analyze the emotional tone of text and provide detailed sentiment breakdown.

Always respond with structured JSON:
{
  "answer": "Brief sentiment summary",
  "data": {
    "sentiment": {
      "overall": "positive" | "negative" | "neutral" | "mixed",
      "score": -1 to 1 (number),
      "breakdown": {
        "positive": 0-100 (percentage),
        "negative": 0-100 (percentage),
        "neutral": 0-100 (percentage)
      },
      "keywords": [{"word": "...", "sentiment": "positive" | "negative" | "neutral"}],
      "summary": "Detailed analysis of emotional tone and key sentiment drivers"
    }
  },
  "sources": ["Sentiment Analysis"]
}`;
    } else if (competitorAnalysis) {
      const competitors = context?.competitors || [];
      systemPrompt = `You are a competitive intelligence analyst specializing in brand sentiment analysis. Analyze how customers perceive ${context?.brandName || 'the brand'} compared to competitors: ${competitors.join(', ')}.

Provide comprehensive sentiment comparison including:
1. Overall sentiment for each brand
2. Specific strength and weakness areas
3. Example mentions (realistic but simulated for analysis)
4. Strategic recommendations

Always respond with structured JSON:
{
  "answer": "Executive summary of competitive sentiment landscape",
  "data": {
    "competitorSentiment": {
      "yourBrand": {
        "overall": "positive" | "negative" | "neutral" | "mixed",
        "score": -1 to 1,
        "breakdown": {"positive": 0-100, "negative": 0-100, "neutral": 0-100},
        "keywords": [{"word": "...", "sentiment": "positive" | "negative" | "neutral"}],
        "summary": "Analysis of your brand's perception"
      },
      "competitors": [
        {
          "competitor": "competitor name",
          "sentiment": {
            "overall": "positive" | "negative" | "neutral" | "mixed",
            "score": -1 to 1,
            "breakdown": {"positive": 0-100, "negative": 0-100, "neutral": 0-100},
            "keywords": [{"word": "...", "sentiment": "positive" | "negative" | "neutral"}],
            "summary": "Analysis"
          },
          "comparison": {
            "vsYourBrand": "better" | "worse" | "similar",
            "strengthAreas": ["area1", "area2"],
            "weaknessAreas": ["area1", "area2"]
          },
          "recentMentions": [
            {"text": "Example customer quote", "sentiment": "positive" | "negative" | "neutral", "source": "Twitter/Review/etc"}
          ]
        }
      ],
      "marketInsights": ["insight1", "insight2"],
      "recommendations": ["recommendation1", "recommendation2"]
    }
  },
  "sources": ["Competitive Intelligence Analysis", "Social Listening", "Review Analysis"]
}`;
    } else {
      systemPrompt = `You are an AI analytics assistant for a commerce platform. Your role is to analyze inventory and trend data to provide actionable insights.

Context:
- Brand: ${context?.brandName || 'Unknown'}
- Inventory: ${JSON.stringify(context?.inventory || [])}
- Trends: ${JSON.stringify(context?.trends || [])}

When analyzing:
1. Identify slow-moving inventory (high stock, low sales velocity)
2. Match inventory to trending products/colors/styles
3. Suggest bundles and promotions
4. Provide specific, actionable recommendations
${includeSentiment ? '5. Analyze sentiment in trend discussions and customer feedback when relevant' : ''}

Always respond with structured JSON containing:
{
  "answer": "Natural language response",
  "data": {
    "trends": [{"name": "...", "matchScore": 0-100, "reason": "..."}],
    "products": [{"name": "...", "stock": number, "suggestion": "..."}],
    "insights": ["insight 1", "insight 2"]${includeSentiment ? `,
    "sentiment": {
      "overall": "positive" | "negative" | "neutral" | "mixed",
      "score": -1 to 1 (number),
      "breakdown": {
        "positive": 0-100,
        "negative": 0-100,
        "neutral": 0-100
      },
      "keywords": [{"word": "...", "sentiment": "positive" | "negative" | "neutral"}],
      "summary": "Brief sentiment analysis if relevant to the query"
    }` : ''}
  },
  "sources": ["data sources used"]
}

Only include sentiment analysis in your response if the query relates to customer feedback, brand perception, or trend discussions.`;
    }

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
          { role: 'user', content: query }
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
        answer: content,
        data: { trends: [], products: [], insights: [] },
        sources: ['AI Analysis']
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Conversational analytics error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: message,
      answer: "I'm having trouble processing your query. Please try again.",
      data: { trends: [], products: [], insights: [] }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
