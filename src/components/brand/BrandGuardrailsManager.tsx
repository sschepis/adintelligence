import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Plus, 
  X, 
  AlertTriangle,
  MessageSquareOff,
  Palette,
  Volume2,
  Building2
} from "lucide-react";
import { useBrandDNA } from "@/hooks/useBrandDNA";

const COMMON_FORBIDDEN_WORDS = [
  "cheap", "best", "guaranteed", "free", "unlimited", "revolutionary",
  "synergy", "leverage", "paradigm", "disrupt"
];

const COMMON_AVOID_TOPICS = [
  "Politics", "Religion", "Controversial social issues",
  "Competitor bashing", "Unverified claims", "Medical advice"
];

export function BrandGuardrailsManager() {
  const { brandDNA, updateGuardrails, saving } = useBrandDNA();
  const [newForbiddenWord, setNewForbiddenWord] = useState("");
  const [newAvoidTopic, setNewAvoidTopic] = useState("");
  const [newVisualAvoid, setNewVisualAvoid] = useState("");
  const [newToneAvoid, setNewToneAvoid] = useState("");

  const addForbiddenWord = (word?: string) => {
    const wordToAdd = word || newForbiddenWord.trim();
    if (!wordToAdd || brandDNA.guardrails.forbiddenWords.includes(wordToAdd)) return;
    
    updateGuardrails({
      forbiddenWords: [...brandDNA.guardrails.forbiddenWords, wordToAdd]
    });
    setNewForbiddenWord("");
  };

  const removeForbiddenWord = (word: string) => {
    updateGuardrails({
      forbiddenWords: brandDNA.guardrails.forbiddenWords.filter(w => w !== word)
    });
  };

  const addAvoidTopic = (topic?: string) => {
    const topicToAdd = topic || newAvoidTopic.trim();
    if (!topicToAdd || brandDNA.guardrails.avoidTopics.includes(topicToAdd)) return;
    
    updateGuardrails({
      avoidTopics: [...brandDNA.guardrails.avoidTopics, topicToAdd]
    });
    setNewAvoidTopic("");
  };

  const removeAvoidTopic = (topic: string) => {
    updateGuardrails({
      avoidTopics: brandDNA.guardrails.avoidTopics.filter(t => t !== topic)
    });
  };

  const addVisualAvoid = () => {
    if (!newVisualAvoid.trim() || brandDNA.guardrails.visualAvoid.includes(newVisualAvoid.trim())) return;
    
    updateGuardrails({
      visualAvoid: [...brandDNA.guardrails.visualAvoid, newVisualAvoid.trim()]
    });
    setNewVisualAvoid("");
  };

  const removeVisualAvoid = (item: string) => {
    updateGuardrails({
      visualAvoid: brandDNA.guardrails.visualAvoid.filter(v => v !== item)
    });
  };

  const addToneAvoid = () => {
    if (!newToneAvoid.trim() || brandDNA.guardrails.toneAvoid.includes(newToneAvoid.trim())) return;
    
    updateGuardrails({
      toneAvoid: [...brandDNA.guardrails.toneAvoid, newToneAvoid.trim()]
    });
    setNewToneAvoid("");
  };

  const removeToneAvoid = (item: string) => {
    updateGuardrails({
      toneAvoid: brandDNA.guardrails.toneAvoid.filter(t => t !== item)
    });
  };

  const toggleGuardrails = () => {
    updateGuardrails({ enabled: !brandDNA.guardrails.enabled });
  };

  const toggleCompetitorMentions = () => {
    updateGuardrails({ competitorMentions: !brandDNA.guardrails.competitorMentions });
  };

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={`h-6 w-6 ${brandDNA.guardrails.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <h3 className="font-semibold">Brand Guardrails</h3>
                <p className="text-sm text-muted-foreground">
                  {brandDNA.guardrails.enabled 
                    ? 'Active - AI content will respect your guardrails'
                    : 'Disabled - AI content won\'t be restricted'}
                </p>
              </div>
            </div>
            <Switch
              checked={brandDNA.guardrails.enabled}
              onCheckedChange={toggleGuardrails}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="words" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="words" className="gap-2">
            <MessageSquareOff className="h-4 w-4" />
            <span className="hidden sm:inline">Words</span>
          </TabsTrigger>
          <TabsTrigger value="topics" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Topics</span>
          </TabsTrigger>
          <TabsTrigger value="visual" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Visual</span>
          </TabsTrigger>
          <TabsTrigger value="tone" className="gap-2">
            <Volume2 className="h-4 w-4" />
            <span className="hidden sm:inline">Tone</span>
          </TabsTrigger>
        </TabsList>

        {/* Forbidden Words */}
        <TabsContent value="words">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquareOff className="h-4 w-4 text-destructive" />
                Forbidden Words & Phrases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Words and phrases that should never appear in AI-generated content.
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="Add word or phrase..."
                  value={newForbiddenWord}
                  onChange={(e) => setNewForbiddenWord(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addForbiddenWord()}
                  className="flex-1"
                />
                <Button size="icon" onClick={() => addForbiddenWord()} disabled={saving}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {brandDNA.guardrails.forbiddenWords.map((word) => (
                  <Badge 
                    key={word} 
                    variant="destructive"
                    className="gap-1 pr-1"
                  >
                    {word}
                    <button
                      onClick={() => removeForbiddenWord(word)}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Quick Add Suggestions */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Quick add common words:</p>
                <div className="flex flex-wrap gap-1">
                  {COMMON_FORBIDDEN_WORDS.filter(
                    w => !brandDNA.guardrails.forbiddenWords.includes(w)
                  ).map((word) => (
                    <Button
                      key={word}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => addForbiddenWord(word)}
                    >
                      + {word}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Avoid Topics */}
        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Topics to Avoid
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sensitive topics that AI should steer clear of.
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="Add topic to avoid..."
                  value={newAvoidTopic}
                  onChange={(e) => setNewAvoidTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAvoidTopic()}
                  className="flex-1"
                />
                <Button size="icon" onClick={() => addAvoidTopic()} disabled={saving}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {brandDNA.guardrails.avoidTopics.map((topic) => (
                  <Badge 
                    key={topic} 
                    variant="outline"
                    className="gap-1 pr-1 border-yellow-500/30 text-yellow-600 dark:text-yellow-400"
                  >
                    {topic}
                    <button
                      onClick={() => removeAvoidTopic(topic)}
                      className="ml-1 hover:bg-yellow-500/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Quick Add Suggestions */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Quick add common topics:</p>
                <div className="flex flex-wrap gap-1">
                  {COMMON_AVOID_TOPICS.filter(
                    t => !brandDNA.guardrails.avoidTopics.includes(t)
                  ).map((topic) => (
                    <Button
                      key={topic}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => addAvoidTopic(topic)}
                    >
                      + {topic}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Competitor Mentions Toggle */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="competitor-mentions" className="text-sm">
                      Allow competitor mentions
                    </Label>
                  </div>
                  <Switch
                    id="competitor-mentions"
                    checked={brandDNA.guardrails.competitorMentions}
                    onCheckedChange={toggleCompetitorMentions}
                    disabled={saving}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  {brandDNA.guardrails.competitorMentions 
                    ? 'AI may reference competitors when relevant'
                    : 'AI will not mention any competitors'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visual Guardrails */}
        <TabsContent value="visual">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-purple-500" />
                Visual Elements to Avoid
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Visual styles, colors, or imagery types to exclude from generated assets.
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="e.g., 'stock photos', 'neon colors', 'clip art'..."
                  value={newVisualAvoid}
                  onChange={(e) => setNewVisualAvoid(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addVisualAvoid()}
                  className="flex-1"
                />
                <Button size="icon" onClick={addVisualAvoid} disabled={saving}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {brandDNA.guardrails.visualAvoid.map((item) => (
                  <Badge 
                    key={item} 
                    variant="outline"
                    className="gap-1 pr-1 border-purple-500/30 text-purple-600 dark:text-purple-400"
                  >
                    {item}
                    <button
                      onClick={() => removeVisualAvoid(item)}
                      className="ml-1 hover:bg-purple-500/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {brandDNA.guardrails.visualAvoid.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No visual restrictions added yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tone Guardrails */}
        <TabsContent value="tone">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-blue-500" />
                Tone & Emotion Restrictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Communication tones or emotional appeals to avoid.
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="e.g., 'fear-mongering', 'aggressive sales', 'sarcasm'..."
                  value={newToneAvoid}
                  onChange={(e) => setNewToneAvoid(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addToneAvoid()}
                  className="flex-1"
                />
                <Button size="icon" onClick={addToneAvoid} disabled={saving}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {brandDNA.guardrails.toneAvoid.map((item) => (
                  <Badge 
                    key={item} 
                    variant="outline"
                    className="gap-1 pr-1 border-blue-500/30 text-blue-600 dark:text-blue-400"
                  >
                    {item}
                    <button
                      onClick={() => removeToneAvoid(item)}
                      className="ml-1 hover:bg-blue-500/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {brandDNA.guardrails.toneAvoid.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No tone restrictions added yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
