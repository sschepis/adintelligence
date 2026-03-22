import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentPreviewProps {
  content: any;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}

export function ContentPreview({ content, copiedField, onCopy }: ContentPreviewProps) {
  if (!content) return null;

  if (content.rawContent) {
    return <p className="whitespace-pre-wrap">{content.rawContent}</p>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(content).map(([key, value]) => {
        if (!value) return null;
        
        const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
        
        if (Array.isArray(value)) {
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{formattedKey}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onCopy(value.join("\n"), key)}
                  className="h-6 px-2"
                >
                  {copiedField === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {(value as string[]).map((item, i) => (
                  <li key={i} className="text-sm">{typeof item === "object" ? JSON.stringify(item) : item}</li>
                ))}
              </ul>
            </div>
          );
        }

        if (typeof value === "object") {
          return (
            <div key={key} className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{formattedKey}</p>
              <pre className="text-sm bg-secondary/50 p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          );
        }

        return (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{formattedKey}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onCopy(String(value), key)}
                className="h-6 px-2"
              >
                {copiedField === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
            <p className="text-sm bg-secondary/50 p-3 rounded-lg">{String(value)}</p>
          </div>
        );
      })}
    </div>
  );
}
