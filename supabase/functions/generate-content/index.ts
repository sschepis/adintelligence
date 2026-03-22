import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BrandGuardrails {
  forbiddenWords?: string[];
  avoidTopics?: string[];
  toneAvoid?: string[];
  competitorMentions?: boolean;
  enabled?: boolean;
}

interface BrandVoice {
  toneSpectrum?: Record<string, number>;
  vocabulary?: { preferred?: string[]; avoided?: string[] };
  emotionalSignature?: string[];
}

interface BrandPersonality {
  archetype?: string;
  traits?: string[];
  values?: string[];
}

interface BrandStory {
  mission?: string;
  vision?: string;
  tagline?: string;
}

interface BrandDNA {
  voice?: BrandVoice;
  personality?: BrandPersonality;
  story?: BrandStory;
  guardrails?: BrandGuardrails;
}

interface ContentRequest {
  contentType: string;
  title: string;
  brief: string;
  tone: string;
  targetAudience: string;
  keywords: string[];
  brandContext?: string;
  brandDNA?: BrandDNA;
}

const getSystemPrompt = (contentType: string, brandDNA?: BrandDNA) => {
  const basePrompts: Record<string, string> = {
    "multi-platform-ad": `You are an expert advertising copywriter. Create compelling, conversion-focused ad copy that works across multiple platforms (Facebook, Instagram, Google, LinkedIn). 
    Provide variations for different platforms with appropriate character limits and formats.
    Return JSON with: { headline, primaryText, callToAction, facebookVersion, instagramVersion, googleVersion, linkedinVersion }`,
    
    "email-campaign": `You are an expert email marketing specialist. Create engaging email campaigns with high open rates and click-through rates.
    Return JSON with: { subjectLine, preheaderText, greeting, body, callToAction, signature, followUpSubject, followUpBody }`,
    
    "blog-post": `You are an expert content writer and SEO specialist. Create comprehensive, engaging blog posts optimized for search engines and reader engagement.
    Return JSON with: { title, metaDescription, introduction, sections (array of {heading, content}), conclusion, seoKeywords }`,
    
    "landing-page": `You are an expert conversion copywriter. Create persuasive landing page copy that drives conversions.
    Return JSON with: { headline, subheadline, heroText, benefitPoints (array), features (array of {title, description}), testimonialPrompts, callToAction, urgencyElement }`
  };

  let systemPrompt = basePrompts[contentType] || basePrompts["multi-platform-ad"];

  // Add Brand DNA context if available
  if (brandDNA) {
    systemPrompt += "\n\n=== BRAND DNA GUIDELINES (MUST FOLLOW) ===\n";

    // Brand Voice
    if (brandDNA.voice) {
      const voice = brandDNA.voice;
      systemPrompt += "\nBRAND VOICE:";
      if (voice.toneSpectrum) {
        const toneDescriptions: string[] = [];
        if (voice.toneSpectrum.formal > 60) toneDescriptions.push("formal");
        if (voice.toneSpectrum.casual > 60) toneDescriptions.push("casual");
        if (voice.toneSpectrum.playful > 60) toneDescriptions.push("playful");
        if (voice.toneSpectrum.friendly > 60) toneDescriptions.push("friendly");
        if (voice.toneSpectrum.authoritative > 60) toneDescriptions.push("authoritative");
        if (voice.toneSpectrum.professional > 60) toneDescriptions.push("professional");
        if (toneDescriptions.length > 0) {
          systemPrompt += `\n- Tone: ${toneDescriptions.join(", ")}`;
        }
      }
      if (voice.vocabulary?.preferred?.length) {
        systemPrompt += `\n- USE these words/phrases when appropriate: ${voice.vocabulary.preferred.join(", ")}`;
      }
      if (voice.emotionalSignature?.length) {
        systemPrompt += `\n- Emotional signature: ${voice.emotionalSignature.join(", ")}`;
      }
    }

    // Brand Personality
    if (brandDNA.personality) {
      const personality = brandDNA.personality;
      systemPrompt += "\n\nBRAND PERSONALITY:";
      if (personality.archetype) {
        systemPrompt += `\n- Brand archetype: ${personality.archetype}`;
      }
      if (personality.traits?.length) {
        systemPrompt += `\n- Core traits: ${personality.traits.join(", ")}`;
      }
      if (personality.values?.length) {
        systemPrompt += `\n- Brand values: ${personality.values.join(", ")}`;
      }
    }

    // Brand Story
    if (brandDNA.story) {
      const story = brandDNA.story;
      if (story.mission || story.vision || story.tagline) {
        systemPrompt += "\n\nBRAND STORY:";
        if (story.tagline) systemPrompt += `\n- Tagline: "${story.tagline}"`;
        if (story.mission) systemPrompt += `\n- Mission: ${story.mission}`;
        if (story.vision) systemPrompt += `\n- Vision: ${story.vision}`;
      }
    }

    // Brand Guardrails (CRITICAL)
    if (brandDNA.guardrails?.enabled !== false) {
      const guardrails = brandDNA.guardrails;
      systemPrompt += "\n\n⚠️ BRAND GUARDRAILS - STRICTLY ENFORCE:";
      
      if (guardrails?.forbiddenWords?.length) {
        systemPrompt += `\n- NEVER use these words: ${guardrails.forbiddenWords.join(", ")}`;
      }
      if (guardrails?.avoidTopics?.length) {
        systemPrompt += `\n- NEVER mention or reference these topics: ${guardrails.avoidTopics.join(", ")}`;
      }
      if (guardrails?.toneAvoid?.length) {
        systemPrompt += `\n- NEVER use these tones/styles: ${guardrails.toneAvoid.join(", ")}`;
      }
      if (brandDNA.voice?.vocabulary?.avoided?.length) {
        systemPrompt += `\n- AVOID these words/phrases: ${brandDNA.voice.vocabulary.avoided.join(", ")}`;
      }
      if (guardrails?.competitorMentions === false) {
        systemPrompt += "\n- NEVER mention competitors or competitor products";
      }
    }

    systemPrompt += "\n\n=== END BRAND DNA GUIDELINES ===";
  }

  return systemPrompt;
};

serve(async (req) => {
  console.log("generate-content function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, title, brief, tone, targetAudience, keywords, brandContext, brandDNA }: ContentRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = getSystemPrompt(contentType, brandDNA);
    
    console.log("Brand DNA guardrails enabled:", brandDNA?.guardrails?.enabled !== false);
    if (brandDNA?.guardrails?.forbiddenWords?.length) {
      console.log("Forbidden words count:", brandDNA.guardrails.forbiddenWords.length);
    }
    
    const userPrompt = `Create ${contentType.replace(/-/g, " ")} content with the following specifications:

Title/Topic: ${title}
Brief: ${brief}
Tone: ${tone}
Target Audience: ${targetAudience}
Keywords to include: ${keywords.join(", ")}
${brandContext ? `Brand Context: ${brandContext}` : ""}

Generate professional, high-converting content that aligns with these specifications and STRICTLY FOLLOWS all Brand DNA guidelines provided in the system prompt. Ensure the content is original, engaging, and optimized for the intended platform(s).`;

    console.log("Calling Lovable AI for content generation");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    console.log("Content generated successfully");

    // Try to parse as JSON, fallback to raw text
    let parsedContent;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = generatedContent.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[1]);
      } else {
        parsedContent = JSON.parse(generatedContent);
      }
    } catch {
      parsedContent = { rawContent: generatedContent };
    }

    return new Response(JSON.stringify({ content: parsedContent }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in generate-content:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
