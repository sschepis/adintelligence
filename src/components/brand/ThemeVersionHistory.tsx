import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { History, RotateCcw, Eye, GitCompare, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";

export interface ThemeVersion {
  id: string;
  timestamp: string;
  label?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: number;
    headingWeight: string;
    bodyWeight: string;
    lineHeight: number;
  };
  spacing: {
    baseUnit: number;
    borderRadius: number;
  };
  effects: {
    enableGradients: boolean;
    enableShadows: boolean;
    shadowIntensity: number;
  };
}

interface ThemeVersionHistoryProps {
  versions: ThemeVersion[];
  currentTheme: Omit<ThemeVersion, 'id' | 'timestamp'>;
  onRestore: (version: ThemeVersion) => void;
}

export function ThemeVersionHistory({
  versions,
  currentTheme,
  onRestore,
}: ThemeVersionHistoryProps) {
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ThemeVersion | null>(null);
  const [previewVersion, setPreviewVersion] = useState<ThemeVersion | null>(null);

  const handleCompare = (version: ThemeVersion) => {
    setSelectedVersion(version);
    setCompareDialogOpen(true);
  };

  const handleRestore = (version: ThemeVersion) => {
    onRestore(version);
    toast.success(`Restored theme from ${format(new Date(version.timestamp), 'MMM d, yyyy')}`);
    setCompareDialogOpen(false);
  };

  const getColorDiff = (oldColor: string, newColor: string) => {
    return oldColor !== newColor;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>Track and restore previous theme versions</CardDescription>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No version history yet</p>
              <p className="text-sm">Changes will be tracked automatically when you save</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className={`p-4 rounded-lg border transition-all hover:border-primary/50 ${
                      previewVersion?.id === version.id ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onMouseEnter={() => setPreviewVersion(version)}
                    onMouseLeave={() => setPreviewVersion(null)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {format(new Date(version.timestamp), 'MMM d, yyyy')}
                            </span>
                            {index === 0 && (
                              <Badge variant="secondary" className="text-[10px]">Latest</Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(version.timestamp), 'h:mm a')}
                          </span>
                          {version.label && (
                            <p className="text-xs text-muted-foreground mt-1">{version.label}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Color preview */}
                        <div className="flex gap-0.5 mr-2">
                          {Object.values(version.colors).slice(0, 3).map((color, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full border border-border/50"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompare(version)}
                        >
                          <GitCompare className="h-4 w-4 mr-1" />
                          Compare
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(version)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Compare Dialog */}
      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Compare Theme Versions</DialogTitle>
            <DialogDescription>
              Compare the selected version with your current theme
            </DialogDescription>
          </DialogHeader>

          {selectedVersion && (
            <div className="grid grid-cols-2 gap-6 py-4">
              {/* Previous Version */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Previous Version</h4>
                  <Badge variant="secondary">
                    {format(new Date(selectedVersion.timestamp), 'MMM d, yyyy')}
                  </Badge>
                </div>
                
                {/* Colors */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Colors</p>
                  <div className="space-y-2">
                    {Object.entries(selectedVersion.colors).map(([key, color]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-border"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm capitalize">{key}</span>
                        <span className="text-xs font-mono text-muted-foreground ml-auto">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Typography</p>
                  <p className="text-sm">Heading: {selectedVersion.typography.headingFont}</p>
                  <p className="text-sm">Body: {selectedVersion.typography.bodyFont}</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </div>

              {/* Current Version */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Current Theme</h4>
                  <Badge>Now</Badge>
                </div>
                
                {/* Colors */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Colors</p>
                  <div className="space-y-2">
                    {Object.entries(currentTheme.colors).map(([key, color]) => {
                      const oldColor = selectedVersion.colors[key as keyof typeof selectedVersion.colors];
                      const isDifferent = getColorDiff(oldColor, color);
                      
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded border ${isDifferent ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm capitalize">{key}</span>
                          <span className={`text-xs font-mono ml-auto ${isDifferent ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                            {color}
                          </span>
                          {isDifferent && (
                            <Badge variant="outline" className="text-[10px] h-4">Changed</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Typography */}
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Typography</p>
                  <p className={`text-sm ${selectedVersion.typography.headingFont !== currentTheme.typography.headingFont ? 'text-primary font-medium' : ''}`}>
                    Heading: {currentTheme.typography.headingFont}
                  </p>
                  <p className={`text-sm ${selectedVersion.typography.bodyFont !== currentTheme.typography.bodyFont ? 'text-primary font-medium' : ''}`}>
                    Body: {currentTheme.typography.bodyFont}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCompareDialogOpen(false)}>
              Close
            </Button>
            {selectedVersion && (
              <Button onClick={() => handleRestore(selectedVersion)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore This Version
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
