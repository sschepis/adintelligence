import { RefreshCw, Save, Columns, PenTool, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentVariant } from "@/hooks/useWritingForge";
import { ContentPreview } from "./ContentPreview";
import { ContentCompareView } from "./ContentCompareView";

interface GeneratedContentPanelProps {
  generatedContent: any;
  generating: boolean;
  generatingVariant: boolean;
  contentVariants: ContentVariant[];
  activeVariant: string;
  compareMode: boolean;
  compareLeft: string;
  compareRight: string | null;
  copiedField: string | null;
  onRegenerate: () => void;
  onSave: () => void;
  onToggleCompare: () => void;
  onVariantChange: (variantId: string) => void;
  onDeleteVariant: (variantId: string) => void;
  onCompareLeftChange: (id: string) => void;
  onCompareRightChange: (id: string) => void;
  onCloseCompare: () => void;
  onCopy: (text: string, field: string) => void;
  getActiveContent: () => any;
  getContentById: (id: string) => any;
  getContentLabel: (id: string) => string;
}

export function GeneratedContentPanel({
  generatedContent,
  generating,
  generatingVariant,
  contentVariants,
  activeVariant,
  compareMode,
  compareLeft,
  compareRight,
  copiedField,
  onRegenerate,
  onSave,
  onToggleCompare,
  onVariantChange,
  onDeleteVariant,
  onCompareLeftChange,
  onCompareRightChange,
  onCloseCompare,
  onCopy,
  getActiveContent,
  getContentById,
  getContentLabel,
}: GeneratedContentPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>
              AI-generated content based on your brief
            </CardDescription>
          </div>
          {generatedContent && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onRegenerate} className="gap-1">
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </Button>
              <Button size="sm" onClick={onSave} className="gap-1">
                <Save className="w-3 h-3" />
                Save
              </Button>
              {contentVariants.length > 0 && (
                <Button 
                  variant={compareMode ? "default" : "outline"} 
                  size="sm" 
                  onClick={onToggleCompare}
                  className="gap-1"
                >
                  <Columns className="w-3 h-3" />
                  Compare
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {compareMode && contentVariants.length > 0 ? (
          <ContentCompareView
            compareLeft={compareLeft}
            compareRight={compareRight}
            contentVariants={contentVariants}
            copiedField={copiedField}
            onCompareLeftChange={onCompareLeftChange}
            onCompareRightChange={onCompareRightChange}
            onClose={onCloseCompare}
            onCopy={onCopy}
            getContentById={getContentById}
            getContentLabel={getContentLabel}
          />
        ) : (
          <>
            {generatedContent && contentVariants.length > 0 && (
              <div className="mb-4">
                <Tabs value={activeVariant} onValueChange={onVariantChange}>
                  <TabsList className="bg-secondary">
                    <TabsTrigger value="original">Original</TabsTrigger>
                    {contentVariants.map((variant) => (
                      <TabsTrigger key={variant.id} value={variant.id} className="gap-1">
                        {variant.name}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteVariant(variant.id);
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            )}

            <ScrollArea className="h-[400px] pr-4">
              {generating || generatingVariant ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <Sparkles className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    {generatingVariant ? "Creating variant..." : "Crafting your content..."}
                  </p>
                </div>
              ) : generatedContent ? (
                <ContentPreview 
                  content={getActiveContent()} 
                  copiedField={copiedField}
                  onCopy={onCopy}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <PenTool className="w-12 h-12 mb-4 opacity-50" />
                  <p>Fill in the brief and click generate</p>
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}
