import { useState, useEffect, useMemo } from "react";
import { PageContainer, SettingsPageHeader, ColorPickerField, isValidHexColor, FileUploadField, BrandColorPreview } from "@/components/shared";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Palette, Upload, Save, Loader2, RefreshCw, ArrowRight, Check, X, Package, Dna, LayoutDashboard } from "lucide-react";
import { BrandProductEditor, ProductData } from "@/components/settings/BrandProductEditor";
import { BrandDNAReanalyze } from "@/components/settings/BrandDNAReanalyze";
import { SidebarVisibilitySettings } from "@/components/settings/SidebarVisibilitySettings";

type ColorKey = 'primary_color' | 'secondary_color' | 'accent_color' | 'background_color' | 'text_color';

interface ScannedBranding {
  colors: Record<ColorKey, string>;
  logo?: string | null;
}

export default function BrandSettings() {
  const { organization, refetch } = useOrganization();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rescanning, setRescanning] = useState(false);
  const [rederiving, setRederiving] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [scannedBranding, setScannedBranding] = useState<ScannedBranding | null>(null);
  const [selectedColors, setSelectedColors] = useState<Record<ColorKey, boolean>>({
    primary_color: true,
    secondary_color: true,
    accent_color: true,
    background_color: true,
    text_color: true,
  });
  const [applyLogo, setApplyLogo] = useState(true);
  const [savingProducts, setSavingProducts] = useState(false);
  
  const [colors, setColors] = useState({
    primary_color: "#6366f1",
    secondary_color: "#8b5cf6",
    accent_color: "#ec4899",
    background_color: "#0a0a0a",
    text_color: "#ffffff",
  });

  const [products, setProducts] = useState<ProductData[]>([]);

  useEffect(() => {
    if (organization) {
      setColors({
        primary_color: organization.primary_color || "#6366f1",
        secondary_color: organization.secondary_color || "#8b5cf6",
        accent_color: organization.accent_color || "#ec4899",
        background_color: organization.background_color || "#0a0a0a",
        text_color: organization.text_color || "#ffffff",
      });
      // Load products from organization
      const orgProducts = (organization.products as ProductData[]) || [];
      setProducts(orgProducts);
    }
  }, [organization]);

  const colorErrors = useMemo(() => {
    const errors: Partial<Record<ColorKey, string>> = {};
    (Object.keys(colors) as ColorKey[]).forEach((key) => {
      if (!isValidHexColor(colors[key])) {
        errors[key] = "Invalid hex color (e.g., #FF5733)";
      }
    });
    return errors;
  }, [colors]);

  const hasErrors = Object.keys(colorErrors).length > 0;

  const handleColorChange = (key: ColorKey, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveColors = async () => {
    if (!organization) return;
    
    if (hasErrors) {
      toast.error("Please fix invalid color values before saving");
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update(colors)
        .eq('id', organization.id);

      if (error) throw error;
      
      await refetch();
      toast.success("Brand colors updated successfully");
    } catch (error) {
      console.error('Error saving colors:', error);
      toast.error("Failed to save colors");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProducts = async (updatedProducts: ProductData[]) => {
    if (!organization) return;
    
    setSavingProducts(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ products: updatedProducts as unknown as any })
        .eq('id', organization.id);

      if (error) throw error;
      
      setProducts(updatedProducts);
      await refetch();
      toast.success("Products updated successfully");
    } catch (error) {
      console.error('Error saving products:', error);
      toast.error("Failed to save products");
    } finally {
      setSavingProducts(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!organization) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organization.id}-logo.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('organizations')
        .update({ logo_url: publicUrl })
        .eq('id', organization.id);

      if (updateError) throw updateError;

      await refetch();
      toast.success("Logo updated successfully");
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleRescanBrand = async () => {
    if (!organization?.website_url) {
      toast.error("No website URL found for this organization");
      return;
    }

    setRescanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('scan-website', {
        body: { url: organization.website_url }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Failed to scan website");
      }

      // Store scanned data and show comparison dialog
      setScannedBranding({
        colors: {
          primary_color: data.branding?.colors?.primary || colors.primary_color,
          secondary_color: data.branding?.colors?.secondary || colors.secondary_color,
          accent_color: data.branding?.colors?.accent || colors.accent_color,
          background_color: data.branding?.colors?.background || colors.background_color,
          text_color: data.branding?.colors?.text || colors.text_color,
        },
        logo: data.branding?.logo || null,
      });
      setSelectedColors({
        primary_color: true,
        secondary_color: true,
        accent_color: true,
        background_color: true,
        text_color: true,
      });
      setApplyLogo(data.branding?.logo ? true : false);
      setShowCompareDialog(true);
    } catch (error) {
      console.error('Error rescanning brand:', error);
      toast.error(error instanceof Error ? error.message : "Failed to rescan website");
    } finally {
      setRescanning(false);
    }
  };

  const handleRederive = async () => {
    // Re-derive on the active brand row. We look up the active brand via profile.
    const { data: profile } = await supabase
      .from('profiles')
      .select('active_brand_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
      .maybeSingle();
    const brandId = profile?.active_brand_id;
    if (!brandId) {
      toast.error("No active brand to re-derive");
      return;
    }
    setRederiving(true);
    try {
      const { data, error } = await supabase.functions.invoke('rederive-from-raw-profile', {
        body: { brandId, applyToBrand: true },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Re-derive failed");
      await refetch();
      toast.success("Brand re-derived from stored profile");
    } catch (e: any) {
      console.error('Re-derive error:', e);
      toast.error(e.message || "Failed to re-derive brand");
    } finally {
      setRederiving(false);
    }
  };
    if (!organization || !scannedBranding) return;

    setSaving(true);
    try {
      const updateData: Record<string, string | null> = {};
      
      // Apply only selected colors
      (Object.keys(selectedColors) as ColorKey[]).forEach((key) => {
        if (selectedColors[key]) {
          updateData[key] = scannedBranding.colors[key];
        }
      });

      // Apply logo if selected
      if (applyLogo && scannedBranding.logo) {
        updateData.logo_url = scannedBranding.logo;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes selected to apply");
        setShowCompareDialog(false);
        return;
      }

      const { error } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', organization.id);

      if (error) throw error;

      await refetch();
      setShowCompareDialog(false);
      setScannedBranding(null);
      toast.success("Brand assets updated from website scan");
    } catch (error) {
      console.error('Error applying scanned colors:', error);
      toast.error("Failed to apply changes");
    } finally {
      setSaving(false);
    }
  };

  const toggleColorSelection = (key: ColorKey) => {
    setSelectedColors(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const colorFields: Array<{ key: ColorKey; label: string; description: string }> = [
    { key: 'primary_color', label: 'Primary Color', description: 'Main brand color used for buttons and accents' },
    { key: 'secondary_color', label: 'Secondary Color', description: 'Supporting color for UI elements' },
    { key: 'accent_color', label: 'Accent Color', description: 'Highlight color for special elements' },
    { key: 'background_color', label: 'Background Color', description: 'Main background color' },
    { key: 'text_color', label: 'Text Color', description: 'Primary text color' },
  ];

  const colorLabels: Record<ColorKey, string> = {
    primary_color: 'Primary',
    secondary_color: 'Secondary',
    accent_color: 'Accent',
    background_color: 'Background',
    text_color: 'Text',
  };

  return (
    <PageContainer className="max-w-4xl mx-auto space-y-8">
      <SettingsPageHeader
        title="Brand Settings"
        description="Customize your brand appearance across the platform"
      />

      {/* Rescan Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            AI Brand Scan
          </CardTitle>
          <CardDescription>
            Rescan your website, or re-derive colors/taxonomy/Brand DNA from the last full scan without hitting your site again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-muted-foreground">
              {organization?.website_url ? (
                <span>Website: <span className="font-medium text-foreground">{organization.website_url}</span></span>
              ) : (
                <span>No website URL configured</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRederive} disabled={rederiving} variant="outline">
                {rederiving ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Re-deriving...</>
                ) : (
                  <><Dna className="h-4 w-4 mr-2" />Re-derive from raw profile</>
                )}
              </Button>
              <Button
                onClick={handleRescanBrand}
                disabled={rescanning || !organization?.website_url}
                variant="outline"
              >
                {rescanning ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Scanning...</>
                ) : (
                  <><RefreshCw className="h-4 w-4 mr-2" />Rescan Website</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Brand Logo
          </CardTitle>
          <CardDescription>Upload your brand logo to personalize your experience</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadField
            id="logo-upload"
            label="Upload Logo"
            value={organization?.logo_url}
            onChange={handleLogoUpload}
            accept="image/*"
            description="Recommended: Square image, at least 200x200px"
            placeholder="No logo"
            uploading={uploading}
          />
        </CardContent>
      </Card>

      {/* Colors Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Brand Colors
          </CardTitle>
          <CardDescription>Define your brand color palette for a consistent look</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {colorFields.map(({ key, label, description }) => (
              <ColorPickerField
                key={key}
                id={key}
                label={label}
                value={colors[key]}
                onChange={(value) => handleColorChange(key, value)}
                description={description}
                error={colorErrors[key]}
              />
            ))}
          </div>

          {/* Preview */}
          <div className="pt-6 border-t border-border">
            <BrandColorPreview 
              colors={{
                primary: colors.primary_color,
                secondary: colors.secondary_color,
                accent: colors.accent_color,
                background: colors.background_color,
                text: colors.text_color,
              }} 
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveColors} disabled={saving || hasErrors}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Colors
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Catalog
          </CardTitle>
          <CardDescription>
            Manage your product catalog. Products are used for trend matching and inventory analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandProductEditor
            products={products}
            onChange={handleSaveProducts}
            saving={savingProducts}
          />
        </CardContent>
      </Card>

      {/* Brand DNA Re-analyze Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="h-5 w-5" />
            Brand DNA
          </CardTitle>
          <CardDescription>
            Re-analyze your website to extract updated brand voice, personality, and story
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandDNAReanalyze />
        </CardContent>
      </Card>

      {/* Sidebar Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Sidebar Navigation
          </CardTitle>
          <CardDescription>
            Configure which navigation items are visible in the sidebar for this brand (Admin only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SidebarVisibilitySettings />
        </CardContent>
      </Card>

      {/* Comparison Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Scanned Brand Assets</DialogTitle>
            <DialogDescription>
              Compare your current brand settings with the scanned results. Select which changes to apply.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Logo Comparison */}
            {scannedBranding?.logo && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="apply-logo"
                    checked={applyLogo}
                    onCheckedChange={(checked) => setApplyLogo(checked === true)}
                  />
                  <Label htmlFor="apply-logo" className="font-medium">Update Logo</Label>
                </div>
                <div className="flex items-center gap-4 pl-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">Current</p>
                    <div className="h-16 w-16 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
                      {organization?.logo_url ? (
                        <img src={organization.logo_url} alt="Current logo" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">Scanned</p>
                    <div className="h-16 w-16 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
                      <img src={scannedBranding.logo} alt="Scanned logo" className="h-full w-full object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Color Comparisons */}
            <div className="space-y-3">
              <Label className="font-medium">Colors</Label>
              <div className="space-y-2">
                {(Object.keys(colors) as ColorKey[]).map((key) => {
                  const currentColor = colors[key];
                  const newColor = scannedBranding?.colors[key] || currentColor;
                  const hasChanged = currentColor.toLowerCase() !== newColor.toLowerCase();

                  return (
                    <div key={key} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50">
                      <Checkbox
                        id={`color-${key}`}
                        checked={selectedColors[key]}
                        onCheckedChange={() => toggleColorSelection(key)}
                      />
                      <Label htmlFor={`color-${key}`} className="flex-1 flex items-center gap-3 cursor-pointer">
                        <span className="w-24 text-sm">{colorLabels[key]}</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-8 w-8 rounded-md border border-border shadow-sm"
                            style={{ backgroundColor: currentColor }}
                          />
                          <span className="text-xs font-mono text-muted-foreground w-16">{currentColor}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-8 w-8 rounded-md border border-border shadow-sm"
                            style={{ backgroundColor: newColor }}
                          />
                          <span className="text-xs font-mono text-muted-foreground w-16">{newColor}</span>
                        </div>
                        {hasChanged ? (
                          <span className="text-xs text-primary font-medium">Changed</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Same</span>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview Comparison */}
            <div className="space-y-3">
              <Label className="font-medium">Preview Comparison</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 text-center">Current</p>
                  <div 
                    className="rounded-lg p-4 border border-border"
                    style={{ backgroundColor: colors.background_color }}
                  >
                    <p className="text-sm mb-2" style={{ color: colors.text_color }}>Sample text</p>
                    <div className="flex gap-1">
                      <div className="h-6 w-6 rounded" style={{ backgroundColor: colors.primary_color }} />
                      <div className="h-6 w-6 rounded" style={{ backgroundColor: colors.secondary_color }} />
                      <div className="h-6 w-6 rounded" style={{ backgroundColor: colors.accent_color }} />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 text-center">After Apply</p>
                  <div 
                    className="rounded-lg p-4 border border-border"
                    style={{ 
                      backgroundColor: selectedColors.background_color 
                        ? scannedBranding?.colors.background_color 
                        : colors.background_color 
                    }}
                  >
                    <p 
                      className="text-sm mb-2" 
                      style={{ 
                        color: selectedColors.text_color 
                          ? scannedBranding?.colors.text_color 
                          : colors.text_color 
                      }}
                    >
                      Sample text
                    </p>
                    <div className="flex gap-1">
                      <div 
                        className="h-6 w-6 rounded" 
                        style={{ 
                          backgroundColor: selectedColors.primary_color 
                            ? scannedBranding?.colors.primary_color 
                            : colors.primary_color 
                        }} 
                      />
                      <div 
                        className="h-6 w-6 rounded" 
                        style={{ 
                          backgroundColor: selectedColors.secondary_color 
                            ? scannedBranding?.colors.secondary_color 
                            : colors.secondary_color 
                        }} 
                      />
                      <div 
                        className="h-6 w-6 rounded" 
                        style={{ 
                          backgroundColor: selectedColors.accent_color 
                            ? scannedBranding?.colors.accent_color 
                            : colors.accent_color 
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompareDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleApplyScannedColors} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Applying...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Apply Selected
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}