import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentVariant } from "@/hooks/useWritingForge";
import { ContentPreview } from "./ContentPreview";

interface ContentCompareViewProps {
  compareLeft: string;
  compareRight: string | null;
  contentVariants: ContentVariant[];
  copiedField: string | null;
  onCompareLeftChange: (id: string) => void;
  onCompareRightChange: (id: string) => void;
  onClose: () => void;
  onCopy: (text: string, field: string) => void;
  getContentById: (id: string) => any;
  getContentLabel: (id: string) => string;
}

export function ContentCompareView({
  compareLeft,
  compareRight,
  contentVariants,
  copiedField,
  onCompareLeftChange,
  onCompareRightChange,
  onClose,
  onCopy,
  getContentById,
  getContentLabel,
}: ContentCompareViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Left Side</Label>
            <Select value={compareLeft} onValueChange={onCompareLeftChange}>
              <SelectTrigger className="w-36 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original</SelectItem>
                {contentVariants.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Right Side</Label>
            <Select value={compareRight || ""} onValueChange={onCompareRightChange}>
              <SelectTrigger className="w-36 h-8">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original</SelectItem>
                {contentVariants.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-primary/30">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm">{getContentLabel(compareLeft)}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ScrollArea className="h-[350px]">
              <ContentPreview 
                content={getContentById(compareLeft)} 
                copiedField={copiedField}
                onCopy={onCopy}
              />
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="border-accent/30">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm">{compareRight ? getContentLabel(compareRight) : "Select variant"}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ScrollArea className="h-[350px]">
              {compareRight ? (
                <ContentPreview 
                  content={getContentById(compareRight)} 
                  copiedField={copiedField}
                  onCopy={onCopy}
                />
              ) : (
                <p className="text-muted-foreground text-sm py-8 text-center">Select a variant to compare</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
