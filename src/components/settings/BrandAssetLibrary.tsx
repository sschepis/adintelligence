import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Image, 
  Type, 
  FileImage, 
  Plus, 
  Trash2, 
  Download,
  Upload,
  ExternalLink,
  FolderOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BrandAsset {
  id: string;
  name: string;
  type: "logo" | "font" | "image" | "icon";
  url: string;
  format?: string;
  createdAt: string;
}

interface BrandAssetLibraryProps {
  orgId: string;
}

const STORAGE_KEY = "brand_assets";

const getStoredAssets = (orgId: string): BrandAsset[] => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${orgId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveAssets = (orgId: string, assets: BrandAsset[]) => {
  localStorage.setItem(`${STORAGE_KEY}_${orgId}`, JSON.stringify(assets));
};

export function BrandAssetLibrary({ orgId }: BrandAssetLibraryProps) {
  const { toast } = useToast();
  const [assets, setAssets] = useState<BrandAsset[]>(() => getStoredAssets(orgId));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: "",
    type: "logo" as BrandAsset["type"],
    url: "",
    format: "",
  });

  const handleAddAsset = () => {
    if (!newAsset.name || !newAsset.url) {
      toast({
        title: "Missing information",
        description: "Please provide a name and URL for the asset.",
        variant: "destructive",
      });
      return;
    }

    const asset: BrandAsset = {
      id: crypto.randomUUID(),
      name: newAsset.name,
      type: newAsset.type,
      url: newAsset.url,
      format: newAsset.format || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedAssets = [...assets, asset];
    setAssets(updatedAssets);
    saveAssets(orgId, updatedAssets);

    setNewAsset({ name: "", type: "logo", url: "", format: "" });
    setIsAddDialogOpen(false);

    toast({
      title: "Asset added",
      description: `${asset.name} has been added to your brand library.`,
    });
  };

  const handleDeleteAsset = (id: string) => {
    const updatedAssets = assets.filter(a => a.id !== id);
    setAssets(updatedAssets);
    saveAssets(orgId, updatedAssets);

    toast({
      title: "Asset removed",
      description: "The asset has been removed from your library.",
    });
  };

  const handleExportAssets = () => {
    const dataStr = JSON.stringify(assets, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "brand-assets.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Assets exported",
      description: "Your brand assets have been exported as JSON.",
    });
  };

  const handleImportAssets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          const validAssets = imported.filter(
            (a) => a.id && a.name && a.type && a.url
          );
          const merged = [...assets, ...validAssets.map(a => ({
            ...a,
            id: crypto.randomUUID(), // Generate new IDs to avoid conflicts
          }))];
          setAssets(merged);
          saveAssets(orgId, merged);
          toast({
            title: "Assets imported",
            description: `${validAssets.length} assets have been imported.`,
          });
        }
      } catch {
        toast({
          title: "Import failed",
          description: "Could not parse the asset file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const getAssetsByType = (type: BrandAsset["type"]) => 
    assets.filter(a => a.type === type);

  const getTypeIcon = (type: BrandAsset["type"]) => {
    switch (type) {
      case "logo": return <Image className="h-4 w-4" />;
      case "font": return <Type className="h-4 w-4" />;
      case "image": return <FileImage className="h-4 w-4" />;
      case "icon": return <FolderOpen className="h-4 w-4" />;
    }
  };

  const AssetCard = ({ asset }: { asset: BrandAsset }) => (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30 group focus-within:ring-2 focus-within:ring-primary/50"
      role="listitem"
      aria-label={`${asset.type}: ${asset.name}`}
    >
      <div 
        className="w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center overflow-hidden border border-border/50"
        aria-hidden="true"
      >
        {(asset.type === "logo" || asset.type === "image" || asset.type === "icon") ? (
          <img 
            src={asset.url} 
            alt=""
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          getTypeIcon(asset.type)
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{asset.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {asset.type}
          </Badge>
          {asset.format && (
            <span className="text-xs text-muted-foreground uppercase">
              {asset.format}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => window.open(asset.url, '_blank')}
          aria-label={`Open ${asset.name} in new tab`}
        >
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => handleDeleteAsset(asset.id)}
          aria-label={`Delete ${asset.name}`}
        >
          <Trash2 className="h-3 w-3" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card 
      className="border-border/50 bg-card/50 backdrop-blur-sm"
      role="region"
      aria-labelledby="asset-library-title"
    >
      <CardHeader className="pb-3">
        <CardTitle 
          id="asset-library-title"
          className="text-sm font-medium flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" aria-hidden="true" />
            Brand Asset Library
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" aria-label={`${assets.length} assets total`}>
              {assets.length} assets
            </Badge>
            <label className="cursor-pointer">
              <Input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportAssets}
                aria-label="Import assets from JSON file"
              />
              <Button variant="ghost" size="sm" className="h-7 gap-1" asChild>
                <span>
                  <Upload className="h-3 w-3" aria-hidden="true" />
                  Import
                </span>
              </Button>
            </label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 gap-1"
              onClick={handleExportAssets}
              disabled={assets.length === 0}
              aria-label="Export assets to JSON file"
            >
              <Download className="h-3 w-3" aria-hidden="true" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all" className="text-xs">
              All ({assets.length})
            </TabsTrigger>
            <TabsTrigger value="logo" className="text-xs">
              Logos ({getAssetsByType("logo").length})
            </TabsTrigger>
            <TabsTrigger value="font" className="text-xs">
              Fonts ({getAssetsByType("font").length})
            </TabsTrigger>
            <TabsTrigger value="image" className="text-xs">
              Images ({getAssetsByType("image").length})
            </TabsTrigger>
            <TabsTrigger value="icon" className="text-xs">
              Icons ({getAssetsByType("icon").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2 mt-3">
            {assets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No assets yet</p>
                <p className="text-xs">Add logos, fonts, and images to your brand library</p>
              </div>
            ) : (
              assets.map(asset => <AssetCard key={asset.id} asset={asset} />)
            )}
          </TabsContent>

          {(["logo", "font", "image", "icon"] as const).map(type => (
            <TabsContent key={type} value={type} className="space-y-2 mt-3">
              {getAssetsByType(type).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {getTypeIcon(type)}
                  <p className="text-sm mt-2">No {type}s yet</p>
                </div>
              ) : (
                getAssetsByType(type).map(asset => (
                  <AssetCard key={asset.id} asset={asset} />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Brand Asset</DialogTitle>
              <DialogDescription>
                Add a new asset to your brand library. Provide a URL to an existing asset or upload a new one.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="asset-name">Asset Name</Label>
                <Input
                  id="asset-name"
                  placeholder="e.g., Primary Logo"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-type">Asset Type</Label>
                <div className="flex gap-2">
                  {(["logo", "font", "image", "icon"] as const).map(type => (
                    <Button
                      key={type}
                      variant={newAsset.type === type ? "default" : "outline"}
                      size="sm"
                      className="flex-1 gap-1 capitalize"
                      onClick={() => setNewAsset({ ...newAsset, type })}
                    >
                      {getTypeIcon(type)}
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-url">Asset URL</Label>
                <Input
                  id="asset-url"
                  placeholder="https://..."
                  value={newAsset.url}
                  onChange={(e) => setNewAsset({ ...newAsset, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-format">Format (optional)</Label>
                <Input
                  id="asset-format"
                  placeholder="e.g., SVG, PNG, WOFF2"
                  value={newAsset.format}
                  onChange={(e) => setNewAsset({ ...newAsset, format: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAsset}>
                Add Asset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
