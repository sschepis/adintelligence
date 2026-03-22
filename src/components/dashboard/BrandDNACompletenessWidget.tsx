import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Dna, CheckCircle2, AlertCircle, ArrowRight, Mic, Brain, BookOpen, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBrandDNA } from "@/hooks/useBrandDNA";
import { Skeleton } from "@/components/ui/skeleton";

interface SectionStatus {
  key: string;
  label: string;
  icon: React.ElementType;
  complete: boolean;
  autoPopulated: boolean;
}

export function BrandDNACompletenessWidget() {
  const { brandDNA, loading, getDNACompleteness } = useBrandDNA();
  
  const completeness = getDNACompleteness();
  
  const sections: SectionStatus[] = useMemo(() => {
    if (!brandDNA) return [];
    
    const voice = brandDNA.voice;
    const personality = brandDNA.personality;
    const story = brandDNA.story;
    const guardrails = brandDNA.guardrails;
    
    // Check if voice has real content (not just defaults)
    const voiceHasContent = voice && (
      voice.emotionalSignature?.length > 0 ||
      voice.vocabulary?.preferred?.length > 0 ||
      voice.communicationPatterns?.length > 0
    );
    
    // Check if personality has real content
    const personalityHasContent = personality && (
      personality.archetype ||
      (personality.traits && personality.traits.length > 0) ||
      (personality.values && personality.values.length > 0)
    );
    
    // Check if story has real content
    const storyHasContent = story && (
      story.mission ||
      story.vision ||
      story.tagline ||
      story.origin
    );
    
    // Check if guardrails have been configured
    const guardrailsHasContent = guardrails && (
      (guardrails.forbiddenWords && guardrails.forbiddenWords.length > 0) ||
      (guardrails.avoidTopics && guardrails.avoidTopics.length > 0)
    );
    
    return [
      { 
        key: "voice", 
        label: "Brand Voice", 
        icon: Mic,
        complete: !!voiceHasContent,
        autoPopulated: !!voice?.analyzedAt
      },
      { 
        key: "personality", 
        label: "Personality", 
        icon: Brain,
        complete: !!personalityHasContent,
        autoPopulated: !!personality?.completedAt
      },
      { 
        key: "story", 
        label: "Brand Story", 
        icon: BookOpen,
        complete: !!storyHasContent,
        autoPopulated: !!(story?.mission || story?.vision)
      },
      { 
        key: "guardrails", 
        label: "Guardrails", 
        icon: Shield,
        complete: !!guardrailsHasContent,
        autoPopulated: false
      },
    ];
  }, [brandDNA]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-card via-card to-secondary/20 border-border/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-2 w-full" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const autoPopulatedCount = sections.filter(s => s.autoPopulated).length;
  const needsInputCount = sections.filter(s => !s.complete).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Dna className="h-4 w-4 text-primary" />
              Brand DNA Health
            </CardTitle>
            <Badge 
              variant={completeness >= 80 ? "default" : completeness >= 50 ? "secondary" : "outline"}
              className="text-xs"
            >
              {completeness}%
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-1">
            <Progress value={completeness} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{autoPopulatedCount} auto-populated</span>
              <span>{needsInputCount} need input</span>
            </div>
          </div>

          {/* Section grid */}
          <div className="grid grid-cols-2 gap-2">
            {sections.map(({ key, label, icon: Icon, complete, autoPopulated }) => (
              <div
                key={key}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  complete 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'bg-secondary/30 border border-transparent'
                }`}
              >
                <div className={`p-1 rounded ${complete ? 'bg-primary/20' : 'bg-muted'}`}>
                  <Icon className={`h-3 w-3 ${complete ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {complete ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5 text-primary" />
                        {autoPopulated ? "Auto-filled" : "Complete"}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-2.5 w-2.5" />
                        Needs input
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link to="/brand-dna">
            <Button variant="ghost" size="sm" className="w-full gap-2 text-xs">
              {completeness < 100 ? "Complete Brand DNA" : "View Brand DNA"}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
