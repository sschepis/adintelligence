import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ContentItem } from "@/hooks/useWritingForge";
import { ContentPreview } from "./ContentPreview";
import { getContentType } from "./ContentTypeGrid";

interface ContentViewPanelProps {
  content: ContentItem;
  copiedField: string | null;
  onDelete: (id: string) => void;
  onCopy: (text: string, field: string) => void;
}

export function ContentViewPanel({ 
  content, 
  copiedField, 
  onDelete, 
  onCopy 
}: ContentViewPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{content.title}</CardTitle>
            <CardDescription>
              {getContentType(content.content_type)?.name} • Created {format(new Date(content.created_at), "MMMM d, yyyy")}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive"
            onClick={() => onDelete(content.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 rounded-lg bg-secondary/50">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Tone:</span> {content.tone}
            </div>
            <div>
              <span className="text-muted-foreground">Audience:</span> {content.target_audience}
            </div>
            <div>
              <span className="text-muted-foreground">Keywords:</span> {content.keywords?.join(", ")}
            </div>
          </div>
        </div>
        <ScrollArea className="h-[500px] pr-4">
          <ContentPreview 
            content={content.generated_content} 
            copiedField={copiedField}
            onCopy={onCopy}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
