import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FlaskConical, GitBranch, Loader2 } from "lucide-react";

interface VariantGeneratorPanelProps {
  onGenerateVariant: (type: 'A' | 'B' | 'casual' | 'formal' | 'short' | 'detailed') => void;
  isGenerating: boolean;
}

export function VariantGeneratorPanel({ onGenerateVariant, isGenerating }: VariantGeneratorPanelProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="py-4">
        <CardTitle className="text-base flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-primary" />
          A/B Variants
        </CardTitle>
        <CardDescription className="text-xs">
          Generate variations for testing different approaches
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-2">
          {[
            { type: 'A' as const, label: 'Variant A', desc: 'Alt hook' },
            { type: 'B' as const, label: 'Variant B', desc: 'Alt angle' },
            { type: 'casual' as const, label: 'Casual', desc: 'Relaxed tone' },
            { type: 'formal' as const, label: 'Formal', desc: 'Pro tone' },
            { type: 'short' as const, label: 'Short', desc: '50% shorter' },
            { type: 'detailed' as const, label: 'Detailed', desc: 'Expanded' },
          ].map(({ type, label, desc }) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className="flex-col h-auto py-2 gap-0"
              onClick={() => onGenerateVariant(type)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <GitBranch className="w-3 h-3 mb-1" />
              )}
              <span className="text-xs font-medium">{label}</span>
              <span className="text-[10px] text-muted-foreground">{desc}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
