import { useState } from "react";
import { SettingsSection, ErrorState, NoticeState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { BrandColorEditor } from "./BrandColorEditor";
import { BrandCategoryEditor } from "./BrandCategoryEditor";
import { BrandProductEditor } from "./BrandProductEditor";
import { BrandComparisonView } from "./BrandComparisonView";
import { BrandColorPreview } from "./BrandColorPreview";
import { BrandDataExport } from "./BrandDataExport";
import { BrandVersionHistory, saveBrandVersion } from "./BrandVersionHistory";
import { BrandColorPaletteGenerator } from "./BrandColorPaletteGenerator";
import { BrandColorAccessibilityChecker } from "./BrandColorAccessibilityChecker";
import { BrandAssetLibrary } from "./BrandAssetLibrary";
import { BrandStyleGuideGenerator } from "./BrandStyleGuideGenerator";
import { BrandFontManager } from "./BrandFontManager";
import { BrandToneOfVoice } from "./BrandToneOfVoice";
import { 
  RefreshCw, 
  AlertTriangle, 
  Loader2,
  CheckCircle2,
  Palette,
  Tag,
  Package,
  Globe,
  ChevronDown,
  Pencil,
  Save,
  RotateCcw
} from "lucide-react";

type ScanStep = 'idle' | 'scanning' | 'analyzing' | 'comparing' | 'updating' | 'complete' | 'error';

interface ScanProgress {
  step: ScanStep;
  progress: number;
  message: string;
}

interface BrandColors {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
}

interface Product {
  name: string;
  category?: string;
}

interface ScannedData {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  taxonomy?: string[];
  products?: Product[];
  name?: string;
}

export function BrandRescanSection() {
  const { toast } = useToast();
  const { organization, refetch } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    step: 'idle',
    progress: 0,
    message: ''
  });
  
  // Manual edit states
  const [editColors, setEditColors] = useState<BrandColors>({
    primary_color: "",
    secondary_color: "",
    accent_color: "",
    background_color: "",
    text_color: "",
  });
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editProducts, setEditProducts] = useState<Product[]>([]);
  const [brandFonts, setBrandFonts] = useState({ heading: "Inter", body: "Inter" });
  const [toneSettings, setToneSettings] = useState({
    formality: 50,
    humor: 30,
    technicalLevel: 40,
    enthusiasm: 60,
    directness: 50,
  });

  // Comparison states
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [selections, setSelections] = useState({
    colors: true,
    categories: true,
    products: true,
  });

  const initializeEditStates = () => {
    if (organization) {
      setEditColors({
        primary_color: organization.primary_color || "#6366f1",
        secondary_color: organization.secondary_color || "#8b5cf6",
        accent_color: organization.accent_color || "#ec4899",
        background_color: organization.background_color || "#0a0a0a",
        text_color: organization.text_color || "#ffffff",
      });
      setEditCategories(
        Array.isArray(organization.taxonomy) 
          ? organization.taxonomy.map((t: unknown) => typeof t === 'string' ? t : String(t))
          : []
      );
      setEditProducts(
        Array.isArray(organization.products) 
          ? organization.products.map((p: unknown) => {
              if (typeof p === 'object' && p !== null && 'name' in p) {
                return p as Product;
              }
              return { name: String(p) };
            })
          : []
      );
    }
  };

  const handleEditOpen = () => {
    initializeEditStates();
    setIsEditOpen(true);
  };

  const handleSaveManualEdits = async () => {
    if (!organization) return;
    
    setIsSaving(true);
    try {
      // Save current version before updating
      saveBrandVersion(
        organization.id,
        {
          ...editColors,
          taxonomy: editCategories.map(c => ({ name: c, subcategories: [] })),
          products: editProducts.map(p => ({ name: p.name, price: 0, category: p.category || "" })),
        },
        "manual"
      );

      const { error } = await supabase
        .from('organizations')
        .update({
          primary_color: editColors.primary_color,
          secondary_color: editColors.secondary_color,
          accent_color: editColors.accent_color,
          background_color: editColors.background_color,
          text_color: editColors.text_color,
          taxonomy: editCategories as unknown as null,
          products: editProducts as unknown as null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', organization.id);

      if (error) throw error;

      await refetch();
      setIsEditOpen(false);
      toast({
        title: "Brand data updated",
        description: "Your manual changes have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreVersion = async (version: {
    colors: BrandColors;
    taxonomy: Array<{ name: string; subcategories: string[] }>;
    products: Array<{ name: string; price: number; category: string }>;
  }) => {
    setEditColors(version.colors);
    setEditCategories(version.taxonomy.map(t => t.name));
    setEditProducts(version.products.map(p => ({ name: p.name, category: p.category })));
    setIsEditOpen(true);
  };

  const handleApplyPaletteColor = (colorType: string, color: string) => {
    setEditColors(prev => ({ ...prev, [colorType]: color }));
  };

  const handleRescan = async () => {
    if (!organization?.website_url) {
      toast({
        title: "No website configured",
        description: "Please configure a website URL first.",
        variant: "destructive",
      });
      return;
    }

    setIsOpen(false);
    
    try {
      // Step 1: Scanning website
      setScanProgress({ step: 'scanning', progress: 20, message: 'Scanning website content...' });
      await new Promise(r => setTimeout(r, 500));

      // Step 2: Analyzing with AI
      setScanProgress({ step: 'analyzing', progress: 40, message: 'Analyzing brand elements with AI...' });
      
      const { data, error } = await supabase.functions.invoke('scan-website', {
        body: { url: organization.website_url }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to scan website');
      }

      const brandData = data.brandData || {};
      
      // Step 3: Show comparison view
      setScanProgress({ step: 'comparing', progress: 60, message: 'Review detected changes...' });
      setScannedData({
        primary_color: brandData.primaryColor,
        secondary_color: brandData.secondaryColor,
        accent_color: brandData.accentColor,
        background_color: brandData.backgroundColor,
        text_color: brandData.textColor,
        taxonomy: brandData.taxonomy,
        products: brandData.products,
        name: brandData.brandName,
      });
      setSelections({ colors: true, categories: true, products: true });

    } catch (error: any) {
      console.error('Rescan error:', error);
      setScanProgress({ step: 'error', progress: 0, message: error.message || 'Scan failed' });
      toast({
        title: "Rescan failed",
        description: error.message || "Failed to rescan brand website",
        variant: "destructive",
      });
      
      setTimeout(() => {
        setScanProgress({ step: 'idle', progress: 0, message: '' });
      }, 3000);
    }
  };

  const handleApplySelectedChanges = async () => {
    if (!organization || !scannedData) return;

    setScanProgress({ step: 'updating', progress: 80, message: 'Applying selected changes...' });

    try {
      const updatePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (selections.colors) {
        if (scannedData.primary_color) updatePayload.primary_color = scannedData.primary_color;
        if (scannedData.secondary_color) updatePayload.secondary_color = scannedData.secondary_color;
        if (scannedData.accent_color) updatePayload.accent_color = scannedData.accent_color;
        if (scannedData.background_color) updatePayload.background_color = scannedData.background_color;
        if (scannedData.text_color) updatePayload.text_color = scannedData.text_color;
      }

      if (selections.categories && scannedData.taxonomy) {
        updatePayload.taxonomy = scannedData.taxonomy;
      }

      if (selections.products && scannedData.products) {
        updatePayload.products = scannedData.products;
      }

      if (scannedData.name) {
        updatePayload.name = scannedData.name;
      }

      const { error: updateError } = await supabase
        .from('organizations')
        .update(updatePayload)
        .eq('id', organization.id);

      if (updateError) throw updateError;

      setScanProgress({ step: 'complete', progress: 100, message: 'Brand profile updated successfully!' });
      await refetch();
      setScannedData(null);

      toast({
        title: "Brand rescanned",
        description: "Selected changes have been applied.",
      });

      setTimeout(() => {
        setScanProgress({ step: 'idle', progress: 0, message: '' });
      }, 2000);

    } catch (error: any) {
      console.error('Update error:', error);
      setScanProgress({ step: 'error', progress: 0, message: error.message || 'Update failed' });
      toast({
        title: "Update failed",
        description: error.message || "Failed to apply changes",
        variant: "destructive",
      });
    }
  };

  const handleCancelComparison = () => {
    setScannedData(null);
    setScanProgress({ step: 'idle', progress: 0, message: '' });
  };

  const isScanning = ['scanning', 'analyzing', 'updating'].includes(scanProgress.step);

  const handleImport = (data: {
    name?: string;
    website_url?: string;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    background_color?: string;
    text_color?: string;
    taxonomy?: unknown[];
    products?: unknown[];
  }) => {
    // Update edit states with imported data
    setEditColors({
      primary_color: data.primary_color || editColors.primary_color,
      secondary_color: data.secondary_color || editColors.secondary_color,
      accent_color: data.accent_color || editColors.accent_color,
      background_color: data.background_color || editColors.background_color,
      text_color: data.text_color || editColors.text_color,
    });
    if (data.taxonomy && Array.isArray(data.taxonomy)) {
      setEditCategories(data.taxonomy.map((t: unknown) => String(t)));
    }
    if (data.products && Array.isArray(data.products)) {
      setEditProducts(
        data.products.map((p: unknown) => {
          if (typeof p === 'object' && p !== null && 'name' in p) {
            return p as Product;
          }
          return { name: String(p) };
        })
      );
    }
    // Open the edit panel to show imported data
    setIsEditOpen(true);
  };

  return (
    <SettingsSection icon={RefreshCw} title="Brand Data" animationDelay="50ms">
      <div className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Edit brand data manually or rescan your website to update colors, categories, and products.
          </p>
          {organization?.website_url && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
              <Globe className="h-3 w-3" />
              <span>{organization.website_url}</span>
            </div>
          )}
          {/* Export/Import buttons */}
          {organization && (
            <BrandDataExport
              brandData={{
                name: organization.name,
                website_url: organization.website_url,
                primary_color: organization.primary_color || undefined,
                secondary_color: organization.secondary_color || undefined,
                accent_color: organization.accent_color || undefined,
                background_color: organization.background_color || undefined,
                text_color: organization.text_color || undefined,
                logo_url: organization.logo_url || undefined,
                taxonomy: Array.isArray(organization.taxonomy) ? organization.taxonomy : [],
                products: Array.isArray(organization.products) ? organization.products : [],
              }}
              onImport={handleImport}
            />
          )}
        </div>

        {/* Current brand summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
            <Palette className="h-4 w-4 text-primary" />
            <div className="text-xs">
              <span className="text-muted-foreground">Colors</span>
              <div className="flex gap-1 mt-1">
                {organization?.primary_color && (
                  <div 
                    className="w-4 h-4 rounded border border-border/50" 
                    style={{ backgroundColor: organization.primary_color }}
                  />
                )}
                {organization?.secondary_color && (
                  <div 
                    className="w-4 h-4 rounded border border-border/50" 
                    style={{ backgroundColor: organization.secondary_color }}
                  />
                )}
                {organization?.accent_color && (
                  <div 
                    className="w-4 h-4 rounded border border-border/50" 
                    style={{ backgroundColor: organization.accent_color }}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
            <Tag className="h-4 w-4 text-primary" />
            <div className="text-xs">
              <span className="text-muted-foreground">Categories</span>
              <p className="font-medium">{Array.isArray(organization?.taxonomy) ? organization.taxonomy.length : 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
            <Package className="h-4 w-4 text-primary" />
            <div className="text-xs">
              <span className="text-muted-foreground">Products</span>
              <p className="font-medium">{Array.isArray(organization?.products) ? organization.products.length : 0}</p>
            </div>
          </div>
        </div>

        {/* Manual Edit Section */}
        <Collapsible open={isEditOpen} onOpenChange={setIsEditOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 w-full justify-between" onClick={handleEditOpen}>
              <span className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Edit Brand Data Manually
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isEditOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-6 pt-4">
            {/* Colors */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Brand Colors
              </h4>
              <BrandColorEditor colors={editColors} onChange={setEditColors} />
            </div>

            {/* Color Palette Generator */}
            <BrandColorPaletteGenerator 
              primaryColor={editColors.primary_color} 
              onApplyColor={handleApplyPaletteColor}
            />

            {/* Color Preview */}
            <BrandColorPreview colors={editColors} />

            {/* Accessibility Checker */}
            <BrandColorAccessibilityChecker 
              colors={editColors} 
              onApplySuggestion={handleApplyPaletteColor}
            />

            {/* Font Manager */}
            <BrandFontManager
              selectedFonts={brandFonts}
              onFontsChange={setBrandFonts}
            />

            {/* Style Guide Generator */}
            {organization && (
              <BrandStyleGuideGenerator
                brandName={organization.name}
                logoUrl={organization.logo_url || undefined}
                colors={editColors}
                fonts={brandFonts}
              />
            )}

            {/* Tone of Voice */}
            <BrandToneOfVoice
              initialSettings={toneSettings}
              onSettingsChange={setToneSettings}
            />

            {/* Asset Library */}
            {organization && (
              <BrandAssetLibrary orgId={organization.id} />
            )}

            {/* Version History */}
            {organization && (
              <BrandVersionHistory
                orgId={organization.id}
                currentData={{
                  colors: editColors,
                  taxonomy: editCategories.map(c => ({ name: c, subcategories: [] })),
                  products: editProducts.map(p => ({ name: p.name, price: 0, category: p.category || "" })),
                }}
                onRestore={handleRestoreVersion}
              />
            )}

            {/* Categories */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Categories
              </h4>
              <BrandCategoryEditor categories={editCategories} onChange={setEditCategories} />
            </div>

            {/* Products */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Products
              </h4>
              <BrandProductEditor products={editProducts} onChange={setEditProducts} />
            </div>

            <div className="flex justify-end">
              <Button 
                variant="gradient" 
                size="sm" 
                className="gap-2"
                onClick={handleSaveManualEdits}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Scanning progress */}
        {isScanning && (
          <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              <span className="text-sm font-medium">{scanProgress.message}</span>
            </div>
            <Progress value={scanProgress.progress} className="h-2" />
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span className={scanProgress.step === 'scanning' ? 'text-primary font-medium' : ''}>
                1. Scanning
              </span>
              <span className={scanProgress.step === 'analyzing' ? 'text-primary font-medium' : ''}>
                2. Analyzing
              </span>
              <span className={scanProgress.step === 'comparing' ? 'text-primary font-medium' : ''}>
                3. Review
              </span>
              <span className={scanProgress.step === 'updating' ? 'text-primary font-medium' : ''}>
                4. Updating
              </span>
            </div>
          </div>
        )}

        {/* Comparison view */}
        {scanProgress.step === 'comparing' && scannedData && (
          <BrandComparisonView
            currentData={{
              primary_color: organization?.primary_color || undefined,
              secondary_color: organization?.secondary_color || undefined,
              accent_color: organization?.accent_color || undefined,
              taxonomy: Array.isArray(organization?.taxonomy) 
                ? organization.taxonomy.map((t: unknown) => String(t)) 
                : [],
              products: Array.isArray(organization?.products) 
                ? organization.products.map((p: unknown) => {
                    if (typeof p === 'object' && p !== null && 'name' in p) {
                      return p as Product;
                    }
                    return { name: String(p) };
                  })
                : [],
            }}
            newData={scannedData}
            selections={selections}
            onSelectionChange={(key, value) => setSelections(prev => ({ ...prev, [key]: value }))}
            onApply={handleApplySelectedChanges}
            onCancel={handleCancelComparison}
          />
        )}

        {/* Success state */}
        {scanProgress.step === 'complete' && (
          <NoticeState
            type="success"
            message={scanProgress.message}
          />
        )}

        {/* Error state */}
        {scanProgress.step === 'error' && (
          <ErrorState
            variant="inline"
            title="Scan Failed"
            message={scanProgress.message}
            onRetry={handleRescan}
            retryLabel="Retry Scan"
            icon={<RotateCcw className="h-5 w-5 text-destructive" />}
          />
        )}

        {/* Rescan button with confirmation */}
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="glass" 
              size="sm" 
              className="gap-2"
              disabled={isScanning || scanProgress.step === 'comparing'}
            >
              <RefreshCw className="h-4 w-4" />
              Rescan Website
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Rescan Brand Website
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  This will scan your website for brand data. You'll be able to <strong>review and selectively apply</strong> any changes:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Brand colors (primary, secondary, accent)</li>
                  <li>Product categories and taxonomy</li>
                  <li>Product catalog</li>
                  <li>Logo and brand name</li>
                </ul>
                <p className="text-muted-foreground text-sm">
                  You can choose which updates to apply after reviewing.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRescan}
                className="bg-primary hover:bg-primary/90"
              >
                Start Rescan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SettingsSection>
  );
}
