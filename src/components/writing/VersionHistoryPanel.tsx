import { History, ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { ContentVersion } from "@/hooks/useWritingForge";

interface VersionHistoryPanelProps {
  versions: ContentVersion[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: (version: ContentVersion) => void;
}

export function VersionHistoryPanel({ 
  versions, 
  isOpen, 
  onOpenChange, 
  onRestore 
}: VersionHistoryPanelProps) {
  if (versions.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="py-3 cursor-pointer hover:bg-secondary/50 transition-colors">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                Version History ({versions.length})
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {versions.map((version) => (
                <div 
                  key={version.version} 
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{version.label || `Version ${version.version}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(version.createdAt), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRestore(version)}
                    className="gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
