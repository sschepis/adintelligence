import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBrandDNA, BrandStory } from "@/hooks/useBrandDNA";
import { 
  BookOpen, 
  Target, 
  Eye, 
  Swords, 
  Sparkles, 
  Quote,
  Save,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";

const storyPrompts = {
  origin: "How did your brand come to be? What problem did you set out to solve?",
  mission: "What is your brand's purpose? Why does your brand exist beyond making profit?",
  vision: "What future are you working toward? What change do you want to see in the world?",
  enemyStatement: "What status quo or problem are you fighting against?",
  transformationPromise: "What transformation do you promise your customers?",
  tagline: "A short, memorable phrase that captures your brand essence"
};

const storyExamples = {
  origin: "We started when our founder couldn't find sustainable alternatives to everyday products...",
  mission: "To make sustainable living accessible and affordable for everyone.",
  vision: "A world where every purchase is a vote for the planet.",
  enemyStatement: "We're fighting against the throwaway culture that's destroying our environment.",
  transformationPromise: "We help conscious consumers become environmental champions.",
  tagline: "Live better. Leave less."
};

export function BrandStoryEditor() {
  const { brandDNA, updateStory, saving } = useBrandDNA();
  const [localStory, setLocalStory] = useState<BrandStory>(brandDNA.story);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalStory(brandDNA.story);
    setHasChanges(false);
  }, [brandDNA.story]);

  const handleChange = (field: keyof BrandStory, value: string) => {
    setLocalStory(prev => ({ ...prev, [field]: value || null }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updateStory(localStory);
    setHasChanges(false);
    toast.success("Brand story saved");
  };

  const getCompletionCount = () => {
    const fields = ['origin', 'mission', 'vision', 'enemyStatement', 'transformationPromise', 'tagline'];
    return fields.filter(f => localStory[f as keyof BrandStory]).length;
  };

  const storyFields: Array<{
    key: keyof BrandStory;
    label: string;
    icon: React.ReactNode;
    isTextarea: boolean;
  }> = [
    { key: 'tagline', label: 'Brand Tagline', icon: <Quote className="h-4 w-4" />, isTextarea: false },
    { key: 'origin', label: 'Origin Story', icon: <BookOpen className="h-4 w-4" />, isTextarea: true },
    { key: 'mission', label: 'Mission Statement', icon: <Target className="h-4 w-4" />, isTextarea: true },
    { key: 'vision', label: 'Vision Statement', icon: <Eye className="h-4 w-4" />, isTextarea: true },
    { key: 'enemyStatement', label: 'Enemy Statement', icon: <Swords className="h-4 w-4" />, isTextarea: true },
    { key: 'transformationPromise', label: 'Transformation Promise', icon: <Sparkles className="h-4 w-4" />, isTextarea: true },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Brand Story</CardTitle>
                <CardDescription>Define your brand's narrative and core messaging</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {getCompletionCount()}/6 sections completed
              </span>
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges || saving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Story"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {storyFields.map(({ key, label, icon, isTextarea }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center gap-2">
                {icon}
                <Label htmlFor={key} className="font-medium">{label}</Label>
              </div>
              <p className="text-sm text-muted-foreground">{storyPrompts[key]}</p>
              {isTextarea ? (
                <Textarea
                  id={key}
                  value={localStory[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={storyExamples[key]}
                  className="min-h-[100px] bg-background/50"
                />
              ) : (
                <Input
                  id={key}
                  value={localStory[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={storyExamples[key]}
                  className="bg-background/50"
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Lightbulb className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-base">Writing Tips</CardTitle>
              <CardDescription>Best practices for crafting your brand story</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Origin:</strong> Be authentic. Share the real motivation behind starting your brand.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Mission:</strong> Focus on impact, not products. What change are you making?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Vision:</strong> Paint a picture of the future you're building toward.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Enemy:</strong> Define what you're against—this creates clarity and passion.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Transformation:</strong> Make it about the customer, not your brand.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Tagline:</strong> Keep it short (3-7 words), memorable, and action-oriented.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
