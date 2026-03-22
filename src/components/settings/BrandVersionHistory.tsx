import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface BrandVersion {
  id: string;
  timestamp: string;
  colors: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
  };
  taxonomy: Array<{ name: string; subcategories: string[] }>;
  products: Array<{ name: string; price: number; category: string }>;
  changeType: "manual" | "rescan" | "import";
}

interface BrandVersionHistoryProps {
  orgId: string;
  currentData: {
    colors: BrandVersion["colors"];
    taxonomy: BrandVersion["taxonomy"];
    products: BrandVersion["products"];
  };
  onRestore: (version: BrandVersion) => void;
}

const STORAGE_KEY = "brand_version_history";

export function BrandVersionHistory({ orgId, currentData, onRestore }: BrandVersionHistoryProps) {
  const [versions, setVersions] = useState<BrandVersion[]>(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${orgId}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<BrandVersion | null>(null);

  const saveVersion = (changeType: BrandVersion["changeType"]) => {
    const newVersion: BrandVersion = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      colors: currentData.colors,
      taxonomy: currentData.taxonomy,
      products: currentData.products,
      changeType,
    };

    const updatedVersions = [newVersion, ...versions].slice(0, 20); // Keep last 20 versions
    setVersions(updatedVersions);
    localStorage.setItem(`${STORAGE_KEY}_${orgId}`, JSON.stringify(updatedVersions));
    toast.success("Version saved to history");
  };

  const handleRestore = () => {
    if (selectedVersion) {
      onRestore(selectedVersion);
      setRestoreDialogOpen(false);
      toast.success("Brand data restored from version");
    }
  };

  const handleDelete = () => {
    if (selectedVersion) {
      const updatedVersions = versions.filter((v) => v.id !== selectedVersion.id);
      setVersions(updatedVersions);
      localStorage.setItem(`${STORAGE_KEY}_${orgId}`, JSON.stringify(updatedVersions));
      setDeleteDialogOpen(false);
      toast.success("Version deleted");
    }
  };

  const getChangeTypeBadge = (type: BrandVersion["changeType"]) => {
    const variants = {
      manual: { label: "Manual Edit", className: "bg-primary/10 text-primary" },
      rescan: { label: "Rescan", className: "bg-accent/10 text-accent" },
      import: { label: "Import", className: "bg-secondary text-secondary-foreground" },
    };
    return variants[type];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h4 className="font-medium">Version History</h4>
          <Badge variant="secondary" className="text-xs">
            {versions.length} saved
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => saveVersion("manual")}>
          Save Current Version
        </Button>
      </div>

      {versions.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No versions saved yet</p>
          <p className="text-xs mt-1">Save your current brand data to start tracking changes</p>
        </Card>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="space-y-2 pr-4">
            {versions.map((version) => {
              const badge = getChangeTypeBadge(version.changeType);
              const isExpanded = expandedId === version.id;

              return (
                <Card key={version.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : version.id)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(version.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={badge.className}>{badge.label}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {version.taxonomy.length} categories • {version.products.length} products
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVersion(version);
                          setRestoreDialogOpen(true);
                        }}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVersion(version);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Colors</p>
                        <div className="flex gap-2">
                          {Object.entries(version.colors).map(([key, value]) => (
                            <div
                              key={key}
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: value }}
                              title={`${key}: ${value}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Categories</p>
                        <p className="text-xs">
                          {version.taxonomy.map((c) => c.name).join(", ") || "None"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Products</p>
                        <p className="text-xs">
                          {version.products
                            .slice(0, 3)
                            .map((p) => p.name)
                            .join(", ") || "None"}
                          {version.products.length > 3 && ` +${version.products.length - 3} more`}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current brand data with this saved version. Your current data
              will be lost unless you save it first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this version from your history. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Export helper to save versions from parent components
export function saveBrandVersion(
  orgId: string,
  data: BrandVersion["colors"] & { taxonomy: BrandVersion["taxonomy"]; products: BrandVersion["products"] },
  changeType: BrandVersion["changeType"]
) {
  const stored = localStorage.getItem(`${STORAGE_KEY}_${orgId}`);
  const versions: BrandVersion[] = stored ? JSON.parse(stored) : [];

  const newVersion: BrandVersion = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    colors: {
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      accent_color: data.accent_color,
      background_color: data.background_color,
      text_color: data.text_color,
    },
    taxonomy: data.taxonomy,
    products: data.products,
    changeType,
  };

  const updatedVersions = [newVersion, ...versions].slice(0, 20);
  localStorage.setItem(`${STORAGE_KEY}_${orgId}`, JSON.stringify(updatedVersions));
}
