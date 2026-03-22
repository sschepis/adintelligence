import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, Wand2, Check, RefreshCw } from "lucide-react";

interface ThemeSuggestion {
  name: string;
  description: string;
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
  };
}

interface ThemeAISuggestionsProps {
  brandName: string;
  websiteUrl?: string;
  currentColors: Record<string, string>;
  onApplySuggestion: (suggestion: ThemeSuggestion) => void;
}

export function ThemeAISuggestions({
  brandName,
  websiteUrl,
  currentColors,
  onApplySuggestion,
}: ThemeAISuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ThemeSuggestion[]>([]);
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);

  const generateSuggestions = async () => {
    setLoading(true);
    setSuggestions([]);
    setAppliedIndex(null);

    try {
      const { data, error } = await supabase.functions.invoke('suggest-theme', {
        body: {
          brandName,
          websiteUrl,
          currentColors,
        },
      });

      if (error) throw error;

      if (!data.success || !data.themes) {
        throw new Error(data.error || "Failed to generate suggestions");
      }

      setSuggestions(data.themes);
      toast.success("Generated 3 theme suggestions");
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (suggestion: ThemeSuggestion, index: number) => {
    onApplySuggestion(suggestion);
    setAppliedIndex(index);
    toast.success(`Applied "${suggestion.name}" theme`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Theme Suggestions
          </CardTitle>
          <CardDescription>
            Let AI analyze your brand and suggest optimal color combinations
          </CardDescription>
        </div>
        <Button onClick={generateSuggestions} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Analyzing...
            </>
          ) : suggestions.length > 0 ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Suggestions
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 && !loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wand2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Click "Generate Suggestions" to get AI-powered theme recommendations</p>
            <p className="text-sm mt-1">Based on your brand: {brandName}</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Analyzing your brand...</p>
            <p className="text-sm text-muted-foreground mt-1">Generating optimal color combinations and typography</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`relative p-4 rounded-xl border transition-all ${
                  appliedIndex === index
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {appliedIndex === index && (
                  <Badge className="absolute -top-2 -right-2 bg-primary">
                    <Check className="h-3 w-3 mr-1" />
                    Applied
                  </Badge>
                )}

                {/* Theme Name */}
                <h4 className="font-semibold mb-2">{suggestion.name}</h4>
                
                {/* Color Preview */}
                <div className="flex gap-1 mb-3 rounded-lg overflow-hidden">
                  {Object.entries(suggestion.colors).map(([key, color]) => (
                    <div
                      key={key}
                      className="flex-1 h-12 relative group"
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                        <span className="text-[10px] text-white font-mono">{color}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Typography */}
                <div className="text-xs text-muted-foreground mb-3">
                  <p><strong>Heading:</strong> {suggestion.typography.headingFont}</p>
                  <p><strong>Body:</strong> {suggestion.typography.bodyFont}</p>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {suggestion.description}
                </p>

                {/* Apply Button */}
                <Button
                  className="w-full"
                  variant={appliedIndex === index ? "secondary" : "default"}
                  size="sm"
                  onClick={() => handleApply(suggestion, index)}
                >
                  {appliedIndex === index ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Applied
                    </>
                  ) : (
                    "Apply Theme"
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
