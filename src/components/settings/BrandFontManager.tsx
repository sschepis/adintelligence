import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Type, Search, Check, ExternalLink, Loader2 } from "lucide-react";

// Popular Google Fonts
const POPULAR_FONTS = [
  { name: "Inter", category: "sans-serif", weights: "400,500,600,700" },
  { name: "Roboto", category: "sans-serif", weights: "400,500,700" },
  { name: "Open Sans", category: "sans-serif", weights: "400,600,700" },
  { name: "Lato", category: "sans-serif", weights: "400,700" },
  { name: "Montserrat", category: "sans-serif", weights: "400,500,600,700" },
  { name: "Poppins", category: "sans-serif", weights: "400,500,600,700" },
  { name: "Source Sans Pro", category: "sans-serif", weights: "400,600,700" },
  { name: "Playfair Display", category: "serif", weights: "400,600,700" },
  { name: "Merriweather", category: "serif", weights: "400,700" },
  { name: "Lora", category: "serif", weights: "400,600,700" },
  { name: "PT Serif", category: "serif", weights: "400,700" },
  { name: "Libre Baskerville", category: "serif", weights: "400,700" },
  { name: "Crimson Text", category: "serif", weights: "400,600,700" },
  { name: "DM Sans", category: "sans-serif", weights: "400,500,600,700" },
  { name: "Work Sans", category: "sans-serif", weights: "400,500,600,700" },
  { name: "Raleway", category: "sans-serif", weights: "400,500,600,700" },
  { name: "Nunito", category: "sans-serif", weights: "400,600,700" },
  { name: "Oswald", category: "sans-serif", weights: "400,500,600,700" },
  { name: "Space Grotesk", category: "sans-serif", weights: "400,500,600,700" },
  { name: "Cormorant Garamond", category: "serif", weights: "400,500,600,700" },
];

interface SelectedFonts {
  heading: string;
  body: string;
}

interface BrandFontManagerProps {
  selectedFonts: SelectedFonts;
  onFontsChange: (fonts: SelectedFonts) => void;
}

export function BrandFontManager({ selectedFonts, onFontsChange }: BrandFontManagerProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [loadingFont, setLoadingFont] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"heading" | "body">("heading");

  const filteredFonts = POPULAR_FONTS.filter((font) =>
    font.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    font.category.includes(searchQuery.toLowerCase())
  );

  const loadFont = async (fontName: string, weights: string) => {
    if (loadedFonts.has(fontName)) return;
    
    setLoadingFont(fontName);
    
    try {
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@${weights}&display=swap`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
      
      // Wait for font to load
      await document.fonts.ready;
      
      setLoadedFonts((prev) => new Set([...prev, fontName]));
    } catch (error) {
      console.error("Failed to load font:", fontName);
    } finally {
      setLoadingFont(null);
    }
  };

  const handleSelectFont = async (font: typeof POPULAR_FONTS[0]) => {
    await loadFont(font.name, font.weights);
    
    const newFonts = { ...selectedFonts };
    if (activeTab === "heading") {
      newFonts.heading = font.name;
    } else {
      newFonts.body = font.name;
    }
    onFontsChange(newFonts);
    
    toast({
      title: "Font selected",
      description: `${font.name} set as ${activeTab} font.`,
    });
  };

  // Preload selected fonts
  useEffect(() => {
    const preloadFonts = async () => {
      for (const font of POPULAR_FONTS) {
        if (font.name === selectedFonts.heading || font.name === selectedFonts.body) {
          await loadFont(font.name, font.weights);
        }
      }
    };
    preloadFonts();
  }, [selectedFonts]);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Type className="h-4 w-4 text-primary" />
          Font Manager
        </CardTitle>
        <CardDescription className="text-xs">
          Choose typography from Google Fonts for your brand.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="space-y-3 p-4 rounded-xl bg-secondary/30 border border-border/30">
          <div className="text-xs text-muted-foreground mb-2">Preview</div>
          <div 
            className="text-2xl font-semibold"
            style={{ fontFamily: `'${selectedFonts.heading}', sans-serif` }}
          >
            {selectedFonts.heading || "Select Heading Font"}
          </div>
          <div 
            className="text-sm"
            style={{ fontFamily: `'${selectedFonts.body}', sans-serif` }}
          >
            This is how your body text will appear using {selectedFonts.body || "the body font"}.
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === "heading" ? "gradient" : "glass"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("heading")}
          >
            Heading: {selectedFonts.heading || "None"}
          </Button>
          <Button
            variant={activeTab === "body" ? "gradient" : "glass"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("body")}
          >
            Body: {selectedFonts.body || "None"}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fonts..."
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Font list */}
        <ScrollArea className="h-[200px] rounded-lg border border-border/50">
          <div className="p-2 space-y-1">
            {filteredFonts.map((font) => {
              const isSelected = 
                (activeTab === "heading" && selectedFonts.heading === font.name) ||
                (activeTab === "body" && selectedFonts.body === font.name);
              const isLoading = loadingFont === font.name;
              
              return (
                <button
                  key={font.name}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    isSelected
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-secondary/50"
                  }`}
                  onClick={() => handleSelectFont(font)}
                  disabled={isLoading}
                  onMouseEnter={() => loadFont(font.name, font.weights)}
                >
                  <div className="flex-1 min-w-0">
                    <div 
                      className="font-medium text-sm truncate"
                      style={{ fontFamily: loadedFonts.has(font.name) ? `'${font.name}', ${font.category}` : font.category }}
                    >
                      {font.name}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {font.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* External link */}
        <a
          href="https://fonts.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Browse more fonts on Google Fonts
        </a>
      </CardContent>
    </Card>
  );
}
