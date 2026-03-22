import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBrandDNA } from "@/hooks/useBrandDNA";
import { useOrganization } from "@/hooks/useOrganization";
import { 
  Download, 
  FileText, 
  Loader2,
  CheckCircle,
  Palette,
  Mic,
  Trophy,
  Shield,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";

const archetypeDescriptions: Record<string, string> = {
  "The Innocent": "Optimistic, pure, and trustworthy. Strives for happiness and simplicity.",
  "The Sage": "Wise, knowledgeable, and thoughtful. Seeks truth and understanding.",
  "The Explorer": "Adventurous, independent, and pioneering. Values freedom and discovery.",
  "The Outlaw": "Rebellious, disruptive, and liberating. Challenges the status quo.",
  "The Magician": "Transformative, visionary, and innovative. Makes dreams come true.",
  "The Hero": "Courageous, determined, and inspiring. Overcomes challenges.",
  "The Lover": "Passionate, intimate, and sensual. Creates connection and beauty.",
  "The Jester": "Fun, playful, and entertaining. Brings joy and lightness.",
  "The Everyperson": "Relatable, authentic, and down-to-earth. Values belonging.",
  "The Caregiver": "Nurturing, protective, and supportive. Cares for others.",
  "The Ruler": "Commanding, premium, and authoritative. Creates order and success.",
  "The Creator": "Innovative, artistic, and imaginative. Brings vision to life."
};

export function BrandDNAExport() {
  const { brandDNA, getDNACompleteness } = useBrandDNA();
  const { organization } = useOrganization();
  const [exporting, setExporting] = useState(false);

  const generatePDFContent = () => {
    const completeness = getDNACompleteness();
    const brandName = organization?.name || "Your Brand";
    
    // Create HTML content that will be printed as PDF
    const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${brandName} - Brand Guidelines</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      padding-bottom: 40px;
      border-bottom: 2px solid #e5e5e5;
      margin-bottom: 40px;
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #0a0a0a;
    }
    
    .header p {
      color: #666;
      font-size: 14px;
    }
    
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #0a0a0a;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e5e5;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .section-icon {
      width: 20px;
      height: 20px;
    }
    
    .subsection {
      margin-bottom: 20px;
    }
    
    .subsection-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }
    
    .subsection-content {
      font-size: 14px;
      color: #555;
    }
    
    .color-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-top: 12px;
    }
    
    .color-swatch {
      text-align: center;
    }
    
    .color-box {
      width: 100%;
      height: 50px;
      border-radius: 8px;
      margin-bottom: 4px;
      border: 1px solid #e5e5e5;
    }
    
    .color-label {
      font-size: 10px;
      color: #666;
    }
    
    .color-value {
      font-size: 9px;
      color: #999;
      font-family: monospace;
    }
    
    .tone-bar {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .tone-label {
      width: 120px;
      font-size: 12px;
      color: #666;
    }
    
    .tone-track {
      flex: 1;
      height: 8px;
      background: #e5e5e5;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .tone-fill {
      height: 100%;
      background: linear-gradient(90deg, #f97316, #ec4899);
      border-radius: 4px;
    }
    
    .tone-value {
      width: 40px;
      text-align: right;
      font-size: 12px;
      color: #666;
    }
    
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    
    .tag {
      padding: 4px 12px;
      background: #f5f5f5;
      border-radius: 16px;
      font-size: 12px;
      color: #555;
    }
    
    .tag.forbidden {
      background: #fef2f2;
      color: #dc2626;
    }
    
    .tag.preferred {
      background: #f0fdf4;
      color: #16a34a;
    }
    
    .archetype-card {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      padding: 20px;
      border-radius: 12px;
      margin-top: 12px;
    }
    
    .archetype-name {
      font-size: 20px;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 8px;
    }
    
    .archetype-desc {
      font-size: 14px;
      color: #a16207;
    }
    
    .story-block {
      background: #fafafa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;
      border-left: 3px solid #f97316;
    }
    
    .story-label {
      font-size: 12px;
      font-weight: 600;
      color: #f97316;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    
    .story-text {
      font-size: 14px;
      color: #333;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    
    .completeness {
      display: inline-block;
      padding: 4px 12px;
      background: ${completeness >= 80 ? '#f0fdf4' : completeness >= 50 ? '#fffbeb' : '#fef2f2'};
      color: ${completeness >= 80 ? '#16a34a' : completeness >= 50 ? '#d97706' : '#dc2626'};
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${brandName}</h1>
    <p>Brand Guidelines Document</p>
    <p style="margin-top: 12px;"><span class="completeness">Brand DNA ${completeness}% Complete</span></p>
    <p style="margin-top: 8px; font-size: 12px;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  ${organization ? `
  <div class="section">
    <h2 class="section-title">🎨 Visual Identity</h2>
    <div class="color-grid">
      <div class="color-swatch">
        <div class="color-box" style="background: ${organization.primary_color || '#6366f1'}"></div>
        <div class="color-label">Primary</div>
        <div class="color-value">${organization.primary_color || '#6366f1'}</div>
      </div>
      <div class="color-swatch">
        <div class="color-box" style="background: ${organization.secondary_color || '#8b5cf6'}"></div>
        <div class="color-label">Secondary</div>
        <div class="color-value">${organization.secondary_color || '#8b5cf6'}</div>
      </div>
      <div class="color-swatch">
        <div class="color-box" style="background: ${organization.accent_color || '#ec4899'}"></div>
        <div class="color-label">Accent</div>
        <div class="color-value">${organization.accent_color || '#ec4899'}</div>
      </div>
      <div class="color-swatch">
        <div class="color-box" style="background: ${organization.background_color || '#ffffff'}"></div>
        <div class="color-label">Background</div>
        <div class="color-value">${organization.background_color || '#ffffff'}</div>
      </div>
      <div class="color-swatch">
        <div class="color-box" style="background: ${organization.text_color || '#1a1a1a'}"></div>
        <div class="color-label">Text</div>
        <div class="color-value">${organization.text_color || '#1a1a1a'}</div>
      </div>
    </div>
  </div>
  ` : ''}

  ${brandDNA.voice.analyzedAt ? `
  <div class="section">
    <h2 class="section-title">🎤 Brand Voice</h2>
    
    <div class="subsection">
      <div class="subsection-title">Tone Spectrum</div>
      ${Object.entries(brandDNA.voice.toneSpectrum).map(([key, value]) => `
        <div class="tone-bar">
          <span class="tone-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
          <div class="tone-track">
            <div class="tone-fill" style="width: ${value}%"></div>
          </div>
          <span class="tone-value">${value}%</span>
        </div>
      `).join('')}
    </div>

    ${brandDNA.voice.vocabulary.preferred.length > 0 ? `
    <div class="subsection">
      <div class="subsection-title">Preferred Vocabulary</div>
      <div class="tag-list">
        ${brandDNA.voice.vocabulary.preferred.map(word => `<span class="tag preferred">${word}</span>`).join('')}
      </div>
    </div>
    ` : ''}

    ${brandDNA.voice.vocabulary.avoided.length > 0 ? `
    <div class="subsection">
      <div class="subsection-title">Avoided Vocabulary</div>
      <div class="tag-list">
        ${brandDNA.voice.vocabulary.avoided.map(word => `<span class="tag forbidden">${word}</span>`).join('')}
      </div>
    </div>
    ` : ''}

    ${brandDNA.voice.emotionalSignature.length > 0 ? `
    <div class="subsection">
      <div class="subsection-title">Emotional Signature</div>
      <div class="tag-list">
        ${brandDNA.voice.emotionalSignature.map(emotion => `<span class="tag">${emotion}</span>`).join('')}
      </div>
    </div>
    ` : ''}
  </div>
  ` : ''}

  ${brandDNA.personality.archetype ? `
  <div class="section">
    <h2 class="section-title">🏆 Brand Personality</h2>
    
    <div class="archetype-card">
      <div class="archetype-name">${brandDNA.personality.archetype}</div>
      <div class="archetype-desc">${archetypeDescriptions[brandDNA.personality.archetype] || ''}</div>
    </div>

    ${brandDNA.personality.secondaryArchetype ? `
    <div class="subsection" style="margin-top: 16px;">
      <div class="subsection-title">Secondary Influence</div>
      <div class="subsection-content">${brandDNA.personality.secondaryArchetype}</div>
    </div>
    ` : ''}

    ${brandDNA.personality.traits.length > 0 ? `
    <div class="subsection" style="margin-top: 16px;">
      <div class="subsection-title">Core Traits</div>
      <div class="tag-list">
        ${brandDNA.personality.traits.map(trait => `<span class="tag">${trait}</span>`).join('')}
      </div>
    </div>
    ` : ''}

    ${brandDNA.personality.values.length > 0 ? `
    <div class="subsection" style="margin-top: 16px;">
      <div class="subsection-title">Brand Values</div>
      <div class="tag-list">
        ${brandDNA.personality.values.map(value => `<span class="tag">${value}</span>`).join('')}
      </div>
    </div>
    ` : ''}
  </div>
  ` : ''}

  ${brandDNA.story.mission || brandDNA.story.vision || brandDNA.story.origin ? `
  <div class="section">
    <h2 class="section-title">📖 Brand Story</h2>
    
    ${brandDNA.story.tagline ? `
    <div class="story-block" style="border-left-color: #8b5cf6;">
      <div class="story-label" style="color: #8b5cf6;">Tagline</div>
      <div class="story-text" style="font-size: 18px; font-weight: 500;">"${brandDNA.story.tagline}"</div>
    </div>
    ` : ''}
    
    ${brandDNA.story.origin ? `
    <div class="story-block">
      <div class="story-label">Origin Story</div>
      <div class="story-text">${brandDNA.story.origin}</div>
    </div>
    ` : ''}
    
    ${brandDNA.story.mission ? `
    <div class="story-block">
      <div class="story-label">Mission</div>
      <div class="story-text">${brandDNA.story.mission}</div>
    </div>
    ` : ''}
    
    ${brandDNA.story.vision ? `
    <div class="story-block">
      <div class="story-label">Vision</div>
      <div class="story-text">${brandDNA.story.vision}</div>
    </div>
    ` : ''}
    
    ${brandDNA.story.enemyStatement ? `
    <div class="story-block">
      <div class="story-label">Enemy Statement</div>
      <div class="story-text">${brandDNA.story.enemyStatement}</div>
    </div>
    ` : ''}
    
    ${brandDNA.story.transformationPromise ? `
    <div class="story-block">
      <div class="story-label">Transformation Promise</div>
      <div class="story-text">${brandDNA.story.transformationPromise}</div>
    </div>
    ` : ''}
  </div>
  ` : ''}

  ${brandDNA.guardrails.forbiddenWords.length > 0 || brandDNA.guardrails.avoidTopics.length > 0 ? `
  <div class="section">
    <h2 class="section-title">🛡️ Brand Guardrails</h2>
    
    ${brandDNA.guardrails.forbiddenWords.length > 0 ? `
    <div class="subsection">
      <div class="subsection-title">Forbidden Words</div>
      <div class="subsection-content">Never use these words in brand communications:</div>
      <div class="tag-list">
        ${brandDNA.guardrails.forbiddenWords.map(word => `<span class="tag forbidden">${word}</span>`).join('')}
      </div>
    </div>
    ` : ''}
    
    ${brandDNA.guardrails.avoidTopics.length > 0 ? `
    <div class="subsection">
      <div class="subsection-title">Topics to Avoid</div>
      <div class="subsection-content">Never reference these topics:</div>
      <div class="tag-list">
        ${brandDNA.guardrails.avoidTopics.map(topic => `<span class="tag forbidden">${topic}</span>`).join('')}
      </div>
    </div>
    ` : ''}
    
    ${brandDNA.guardrails.toneAvoid.length > 0 ? `
    <div class="subsection">
      <div class="subsection-title">Tones to Avoid</div>
      <div class="tag-list">
        ${brandDNA.guardrails.toneAvoid.map(tone => `<span class="tag forbidden">${tone}</span>`).join('')}
      </div>
    </div>
    ` : ''}
    
    ${brandDNA.guardrails.visualAvoid.length > 0 ? `
    <div class="subsection">
      <div class="subsection-title">Visual Elements to Avoid</div>
      <div class="tag-list">
        ${brandDNA.guardrails.visualAvoid.map(visual => `<span class="tag forbidden">${visual}</span>`).join('')}
      </div>
    </div>
    ` : ''}
  </div>
  ` : ''}

  <div class="footer">
    <p>Brand Guidelines generated by Instincts AI</p>
    <p style="margin-top: 4px;">${organization?.website_url || ''}</p>
  </div>
</body>
</html>
    `;

    return content;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const htmlContent = generatePDFContent();
      
      // Open in new window for printing as PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 250);
        };
      }
      
      toast.success("Brand guidelines opened - use Print > Save as PDF");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export brand guidelines");
    } finally {
      setExporting(false);
    }
  };

  const completeness = getDNACompleteness();

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Export Brand Guidelines</CardTitle>
            <CardDescription>Generate a PDF document of your complete brand identity</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <span>Visual Identity</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mic className="h-4 w-4 text-muted-foreground" />
            <span>Voice</span>
            {brandDNA.voice.analyzedAt ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <span className="text-xs text-muted-foreground">Not set</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span>Personality</span>
            {brandDNA.personality.archetype ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <span className="text-xs text-muted-foreground">Not set</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span>Story</span>
            {brandDNA.story.mission ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <span className="text-xs text-muted-foreground">Not set</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>Guardrails</span>
            {brandDNA.guardrails.forbiddenWords.length > 0 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <span className="text-xs text-muted-foreground">Not set</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Your Brand DNA is <span className="font-medium text-foreground">{completeness}%</span> complete
          </div>
          <Button onClick={handleExport} disabled={exporting} className="gap-2">
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export as PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
