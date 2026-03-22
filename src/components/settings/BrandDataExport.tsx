import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Copy, Check, FileJson } from "lucide-react";

interface BrandData {
  name?: string;
  website_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  logo_url?: string;
  taxonomy?: unknown[];
  products?: unknown[];
  brand_voice?: unknown;
  brand_personality?: unknown;
  brand_story?: unknown;
  brand_guardrails?: unknown;
}

interface BrandDataExportProps {
  brandData: BrandData;
  onImport: (data: BrandData) => void;
}

export function BrandDataExport({ brandData, onImport }: BrandDataExportProps) {
  const { toast } = useToast();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    brand: {
      name: brandData.name,
      website_url: brandData.website_url,
      colors: {
        primary: brandData.primary_color,
        secondary: brandData.secondary_color,
        accent: brandData.accent_color,
        background: brandData.background_color,
        text: brandData.text_color,
      },
      logo_url: brandData.logo_url,
      taxonomy: brandData.taxonomy,
      products: brandData.products,
      brand_voice: brandData.brand_voice,
      brand_personality: brandData.brand_personality,
      brand_story: brandData.brand_story,
      brand_guardrails: brandData.brand_guardrails,
    },
  };

  const handleExport = () => {
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `brand-data-${brandData.name?.toLowerCase().replace(/\s+/g, "-") || "export"}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Brand data exported",
      description: "Your brand data has been downloaded as JSON.",
    });
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Brand data JSON copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        validateAndImport(json);
      } catch (err) {
        setImportError("Invalid JSON file. Please select a valid brand data export.");
      }
    };
    reader.readAsText(file);
  };

  const validateAndImport = (json: unknown) => {
    setImportError(null);

    if (typeof json !== "object" || json === null) {
      setImportError("Invalid format: Expected an object.");
      return;
    }

    const data = json as Record<string, unknown>;
    const brand = data.brand as Record<string, unknown> | undefined;

    if (!brand) {
      setImportError("Invalid format: Missing 'brand' property.");
      return;
    }

    const colors = brand.colors as Record<string, string> | undefined;

    const importData: BrandData = {
      name: brand.name as string | undefined,
      website_url: brand.website_url as string | undefined,
      primary_color: colors?.primary,
      secondary_color: colors?.secondary,
      accent_color: colors?.accent,
      background_color: colors?.background,
      text_color: colors?.text,
      logo_url: brand.logo_url as string | undefined,
      taxonomy: brand.taxonomy as unknown[] | undefined,
      products: brand.products as unknown[] | undefined,
      brand_voice: brand.brand_voice,
      brand_personality: brand.brand_personality,
      brand_story: brand.brand_story,
      brand_guardrails: brand.brand_guardrails,
    };

    onImport(importData);
    setIsImportOpen(false);
    toast({
      title: "Brand data imported",
      description: "Your brand data has been loaded. Click 'Save Changes' to apply.",
    });
  };

  return (
    <div className="flex gap-2">
      <Button variant="ghost" size="sm" className="gap-2" onClick={handleExport}>
        <Download className="h-4 w-4" />
        Export
      </Button>

      <Button variant="ghost" size="sm" className="gap-2" onClick={handleCopyToClipboard}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy JSON"}
      </Button>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-primary" />
              Import Brand Data
            </DialogTitle>
            <DialogDescription>
              Upload a previously exported brand data JSON file to restore your brand settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Click to select a file</p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .json files exported from this platform
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {importError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{importError}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
