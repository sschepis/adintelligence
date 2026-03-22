import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandDNA {
  voice?: {
    toneSpectrum?: Record<string, number>;
    vocabulary?: { preferred?: string[]; avoided?: string[] };
    emotionalSignature?: string[];
  };
  personality?: {
    archetype?: string;
    traits?: string[];
  };
  guardrails?: {
    forbiddenWords?: string[];
    avoidTopics?: string[];
    visualAvoid?: string[];
    toneAvoid?: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style, assetType, brandColors, brandDNA } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build Brand DNA context for visual generation
    let brandContext = "";
    if (brandDNA) {
      const dna = brandDNA as BrandDNA;
      
      if (dna.voice?.emotionalSignature?.length) {
        brandContext += `\nBrand emotional tone: ${dna.voice.emotionalSignature.join(", ")}.`;
      }
      
      if (dna.personality?.archetype) {
        brandContext += `\nBrand archetype: ${dna.personality.archetype}. Visuals should reflect this personality.`;
      }
      
      if (dna.personality?.traits?.length) {
        brandContext += `\nBrand traits to convey: ${dna.personality.traits.join(", ")}.`;
      }
      
      if (dna.guardrails?.visualAvoid?.length) {
        brandContext += `\n\nVISUAL GUARDRAILS - AVOID: ${dna.guardrails.visualAvoid.join(", ")}.`;
      }
      
      if (dna.guardrails?.toneAvoid?.length) {
        brandContext += `\nTONE TO AVOID in visuals: ${dna.guardrails.toneAvoid.join(", ")}.`;
      }
    }

    // Build enhanced prompt based on asset type and style
    let enhancedPrompt = prompt;
    
    if (assetType) {
      const assetPrompts: Record<string, string> = {
        'tiktok_video': 'Create a vibrant, attention-grabbing thumbnail for a TikTok video. Vertical 9:16 aspect ratio, bold colors, modern aesthetic.',
        'instagram_story': 'Design an Instagram Story visual. Vertical format, trendy aesthetic, clean typography-friendly composition.',
        'instagram_feed': 'Create a professional Instagram feed post. Square format, high-quality, visually striking.',
        'landing_page_hero': 'Design a hero section background for a landing page. Wide format, professional, creates visual impact.',
        'display_banner': 'Create a display banner ad visual. Clean, attention-grabbing, leaves space for text overlay.',
        'facebook_ad': 'Design a Facebook ad creative. Engaging, thumb-stopping, optimized for feed scrolling.',
      };
      enhancedPrompt = `${assetPrompts[assetType] || ''} ${prompt}`;
    }

    if (style) {
      enhancedPrompt += ` Style: ${style}.`;
    }

    if (brandColors && brandColors.length > 0) {
      enhancedPrompt += ` Use these brand colors: ${brandColors.join(', ')}.`;
    }

    if (brandContext) {
      enhancedPrompt += brandContext;
    }

    enhancedPrompt += " Ultra high quality, professional marketing creative, photorealistic when appropriate.";

    console.log("Generating image with Brand DNA context:", brandDNA ? "yes" : "no");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const message = data.choices?.[0]?.message;
    const images = message?.images || [];
    const textContent = message?.content || "";

    if (images.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No image generated. The AI may have declined the request.",
          textResponse: textContent 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const generatedImages = images.map((img: any, index: number) => ({
      id: `gen-${Date.now()}-${index}`,
      url: img.image_url?.url || img.url,
      prompt: enhancedPrompt,
      assetType,
      style,
      generatedAt: new Date().toISOString(),
    }));

    console.log("Successfully generated", generatedImages.length, "images");

    return new Response(
      JSON.stringify({ 
        success: true, 
        images: generatedImages,
        textResponse: textContent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-creative-asset:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate creative asset";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
