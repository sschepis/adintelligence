import { supabase } from "@/integrations/supabase/client";

/** Creates the organization + brand for a signed-in user from a scan-website result. */
export async function createBrandWorkspace(userId: string, websiteUrl: string, scanData: any) {
  const colors = scanData.branding?.colors ?? {};
  const common = {
    name: scanData.brandName || "My Brand",
    website_url: websiteUrl,
    logo_url: scanData.branding?.logo,
    primary_color: colors.primary || "#6366f1",
    secondary_color: colors.secondary || "#8b5cf6",
    accent_color: colors.accent || "#ec4899",
    background_color: colors.background || "#0a0a0a",
    text_color: colors.text || "#ffffff",
    taxonomy: scanData.taxonomy || [],
    products: scanData.products || [],
  };

  const { data: orgData, error: orgError } = await supabase
    .from("organizations")
    .insert({ owner_id: userId, ...common } as any)
    .select()
    .single();
  if (orgError) throw orgError;

  const dna = scanData.brandDNA ?? {};
  const brandInsert: any = { org_id: orgData.id, ...common };
  if (dna.voice) {
    brandInsert.brand_voice = {
      analyzedAt: new Date().toISOString(),
      toneSpectrum: dna.voice.toneSpectrum,
      vocabulary: dna.voice.vocabulary,
      emotionalSignature: dna.voice.emotionalSignature,
      communicationPatterns: dna.voice.communicationPatterns,
      sentenceStyle: dna.voice.sentenceStyle,
    };
  }
  if (dna.personality) {
    brandInsert.brand_personality = {
      ...dna.personality,
      completedAt: dna.personality.archetype ? new Date().toISOString() : null,
    };
  }
  if (dna.story) brandInsert.brand_story = dna.story;
  if (dna.guardrails) brandInsert.brand_guardrails = { ...dna.guardrails, enabled: true };
  if (scanData.rawProfile) brandInsert.raw_profile = scanData.rawProfile;

  const { data: brandData, error: brandError } = await supabase
    .from("brands")
    .insert(brandInsert)
    .select()
    .single();
  if (brandError) console.error("Brand creation error:", brandError);

  await supabase
    .from("profiles")
    .update({ org_id: orgData.id, active_brand_id: brandData?.id || null } as any)
    .eq("user_id", userId);

  if (brandData) {
    await supabase.from("user_org_memberships").insert({
      user_id: userId,
      org_id: orgData.id,
      role: "owner",
      brand_access: [brandData.id],
    } as any);
  }
  return { org: orgData, brand: brandData };
}
