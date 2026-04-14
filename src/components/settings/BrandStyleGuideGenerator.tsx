import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Loader2, Palette, Type, AlertCircle } from "lucide-react";

interface BrandColors {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
}

interface BrandStyleGuideGeneratorProps {
  brandName: string;
  logoUrl?: string;
  colors: BrandColors;
  fonts?: { heading?: string; body?: string };
  guidelines?: string;
}

export function BrandStyleGuideGenerator({
  brandName,
  logoUrl,
  colors,
  fonts = { heading: "Inter", body: "Inter" },
  guidelines = "",
}: BrandStyleGuideGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customGuidelines, setCustomGuidelines] = useState(guidelines);
  const [headingFont, setHeadingFont] = useState(fonts.heading || "Inter");
  const [bodyFont, setBodyFont] = useState(fonts.body || "Inter");

  const generateStyleGuide = async () => {
    setIsGenerating(true);
    
    try {
      // Create HTML content for the style guide
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brandName} - Brand Style Guide</title>
  <link href="https://fonts.googleapis.com/css2?family=${headingFont.replace(' ', '+')}:wght@400;600;700&family=${bodyFont.replace(' ', '+')}:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: '${bodyFont}', sans-serif; 
      background: #fafafa; 
      color: #1a1a1a;
      line-height: 1.6;
    }
    .container { max-width: 900px; margin: 0 auto; padding: 60px 40px; }
    .header { text-align: center; margin-bottom: 60px; padding-bottom: 40px; border-bottom: 2px solid #eee; }
    .header h1 { font-family: '${headingFont}', sans-serif; font-size: 36px; margin-bottom: 8px; }
    .header p { color: #666; font-size: 14px; }
    .logo-section { margin-bottom: 60px; }
    .section { margin-bottom: 50px; }
    .section-title { 
      font-family: '${headingFont}', sans-serif; 
      font-size: 24px; 
      margin-bottom: 24px; 
      padding-bottom: 12px;
      border-bottom: 1px solid #eee;
    }
    .color-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 20px; }
    .color-card { 
      border-radius: 12px; 
      overflow: hidden; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      background: white;
    }
    .color-swatch { height: 100px; }
    .color-info { padding: 16px; }
    .color-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
    .color-hex { font-family: monospace; font-size: 13px; color: #666; }
    .font-sample { 
      background: white; 
      padding: 24px; 
      border-radius: 12px; 
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .font-name { font-size: 12px; color: #888; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .font-heading { font-family: '${headingFont}', sans-serif; font-size: 32px; font-weight: 700; }
    .font-body { font-family: '${bodyFont}', sans-serif; font-size: 16px; line-height: 1.8; }
    .guidelines { 
      background: white; 
      padding: 30px; 
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      white-space: pre-wrap;
    }
    .footer { 
      margin-top: 60px; 
      padding-top: 30px; 
      border-top: 1px solid #eee; 
      text-align: center; 
      color: #888;
      font-size: 12px;
    }
    ${logoUrl ? `.logo { max-width: 200px; max-height: 80px; margin-bottom: 20px; }` : ''}
    @media print {
      body { background: white; }
      .container { padding: 40px 20px; }
      .color-card, .font-sample, .guidelines { box-shadow: none; border: 1px solid #eee; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="${brandName} logo" class="logo">` : ''}
      <h1>${brandName}</h1>
      <p>Brand Style Guide</p>
    </header>

    <section class="section">
      <h2 class="section-title">Brand Colors</h2>
      <div class="color-grid">
        <div class="color-card">
          <div class="color-swatch" style="background: ${colors.primary_color}"></div>
          <div class="color-info">
            <div class="color-name">Primary</div>
            <div class="color-hex">${colors.primary_color}</div>
          </div>
        </div>
        <div class="color-card">
          <div class="color-swatch" style="background: ${colors.secondary_color}"></div>
          <div class="color-info">
            <div class="color-name">Secondary</div>
            <div class="color-hex">${colors.secondary_color}</div>
          </div>
        </div>
        <div class="color-card">
          <div class="color-swatch" style="background: ${colors.accent_color}"></div>
          <div class="color-info">
            <div class="color-name">Accent</div>
            <div class="color-hex">${colors.accent_color}</div>
          </div>
        </div>
        <div class="color-card">
          <div class="color-swatch" style="background: ${colors.background_color}"></div>
          <div class="color-info">
            <div class="color-name">Background</div>
            <div class="color-hex">${colors.background_color}</div>
          </div>
        </div>
        <div class="color-card">
          <div class="color-swatch" style="background: ${colors.text_color}"></div>
          <div class="color-info">
            <div class="color-name">Text</div>
            <div class="color-hex">${colors.text_color}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Typography</h2>
      <div class="font-sample">
        <div class="font-name">Heading Font: ${headingFont}</div>
        <div class="font-heading">The quick brown fox jumps over the lazy dog</div>
      </div>
      <div class="font-sample">
        <div class="font-name">Body Font: ${bodyFont}</div>
        <div class="font-body">
          Sample paragraph demonstrating the brand's typographic style. This text shows how your body font renders in different weights and sizes across your brand materials.
        </div>
      </div>
    </section>

    ${customGuidelines ? `
    <section class="section">
      <h2 class="section-title">Usage Guidelines</h2>
      <div class="guidelines">${customGuidelines}</div>
    </section>
    ` : ''}

    <footer class="footer">
      Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </footer>
  </div>
</body>
</html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${brandName.toLowerCase().replace(/\s+/g, "-")}-style-guide.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Style guide generated",
        description: "Your brand style guide has been downloaded. Open it in a browser and use Print > Save as PDF.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate style guide.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Style Guide Generator
        </CardTitle>
        <CardDescription className="text-xs">
          Generate a downloadable brand style guide with colors, fonts, and usage guidelines.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1">
              <Type className="h-3 w-3" /> Heading Font
            </Label>
            <Input
              value={headingFont}
              onChange={(e) => setHeadingFont(e.target.value)}
              placeholder="e.g., Playfair Display"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1">
              <Type className="h-3 w-3" /> Body Font
            </Label>
            <Input
              value={bodyFont}
              onChange={(e) => setBodyFont(e.target.value)}
              placeholder="e.g., Inter"
              className="h-9 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Usage Guidelines (Optional)</Label>
          <Textarea
            value={customGuidelines}
            onChange={(e) => setCustomGuidelines(e.target.value)}
            placeholder="Add custom usage guidelines, dos and don'ts, or brand notes..."
            rows={3}
            className="text-sm resize-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 p-2 rounded-lg">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>The style guide is generated as an HTML file. Open it in your browser and use Print → Save as PDF for a PDF version.</span>
        </div>

        <Button
          variant="gradient"
          size="sm"
          className="w-full gap-2"
          onClick={generateStyleGuide}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Generate Style Guide
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
