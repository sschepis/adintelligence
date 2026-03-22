import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mic, 
  Brain, 
  BookOpen, 
  Shield, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface BrandVoice {
  toneSpectrum?: {
    formal?: number;
    casual?: number;
    professional?: number;
    friendly?: number;
    authoritative?: number;
    playful?: number;
  };
  vocabulary?: {
    preferred?: string[];
    avoided?: string[];
  };
  emotionalSignature?: string[];
  communicationPatterns?: string[];
  sentenceStyle?: string;
}

interface BrandPersonality {
  archetype?: string | null;
  secondaryArchetype?: string | null;
  traits?: string[];
  values?: string[];
  emotionalTone?: string | null;
}

interface BrandStory {
  mission?: string | null;
  vision?: string | null;
  tagline?: string | null;
  origin?: string | null;
  enemyStatement?: string | null;
  transformationPromise?: string | null;
}

interface BrandGuardrails {
  forbiddenWords?: string[];
  avoidTopics?: string[];
  toneAvoid?: string[];
  visualAvoid?: string[];
  competitorMentions?: boolean;
}

interface BrandDNA {
  voice?: BrandVoice;
  personality?: BrandPersonality;
  story?: BrandStory;
  guardrails?: BrandGuardrails;
}

interface BrandDNAPreviewProps {
  brandDNA?: BrandDNA;
  onUpdate: (dna: BrandDNA) => void;
}

export function BrandDNAPreview({ brandDNA, onUpdate }: BrandDNAPreviewProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("voice");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [localDNA, setLocalDNA] = useState<BrandDNA>(brandDNA || {});

  const hasContent = (section: keyof BrandDNA) => {
    const data = localDNA[section];
    if (!data) return false;
    return Object.values(data).some(v => 
      v !== null && v !== undefined && 
      (Array.isArray(v) ? v.length > 0 : true) &&
      (typeof v === 'object' && !Array.isArray(v) ? Object.values(v).some(inner => inner !== null && inner !== undefined) : true)
    );
  };

  const updateLocalDNA = (section: keyof BrandDNA, field: string, value: any) => {
    const updated = {
      ...localDNA,
      [section]: {
        ...(localDNA[section] || {}),
        [field]: value
      }
    };
    setLocalDNA(updated);
    onUpdate(updated);
  };

  const sections = [
    { 
      key: "voice", 
      label: "Brand Voice", 
      icon: Mic,
      description: "Tone and communication style"
    },
    { 
      key: "personality", 
      label: "Personality", 
      icon: Brain,
      description: "Archetype and traits"
    },
    { 
      key: "story", 
      label: "Brand Story", 
      icon: BookOpen,
      description: "Mission, vision, and narrative"
    },
    { 
      key: "guardrails", 
      label: "Guardrails", 
      icon: Shield,
      description: "Content boundaries"
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Brand DNA Preview</h3>
        <Badge variant="secondary" className="text-xs">
          AI-Extracted
        </Badge>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Review and adjust the brand identity we detected from your website.
      </p>

      <div className="space-y-2">
        {sections.map(({ key, label, icon: Icon, description }) => (
          <Collapsible
            key={key}
            open={expandedSection === key}
            onOpenChange={(open) => setExpandedSection(open ? key : null)}
          >
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${hasContent(key as keyof BrandDNA) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasContent(key as keyof BrandDNA) ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  {expandedSection === key ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-secondary/20 rounded-b-lg border-t border-border/30"
              >
                {key === "voice" && (
                  <VoiceSection 
                    voice={localDNA.voice} 
                    onUpdate={(v) => {
                      setLocalDNA({ ...localDNA, voice: v });
                      onUpdate({ ...localDNA, voice: v });
                    }}
                  />
                )}
                {key === "personality" && (
                  <PersonalitySection 
                    personality={localDNA.personality}
                    onUpdate={(p) => {
                      setLocalDNA({ ...localDNA, personality: p });
                      onUpdate({ ...localDNA, personality: p });
                    }}
                  />
                )}
                {key === "story" && (
                  <StorySection 
                    story={localDNA.story}
                    onUpdate={(s) => {
                      setLocalDNA({ ...localDNA, story: s });
                      onUpdate({ ...localDNA, story: s });
                    }}
                  />
                )}
                {key === "guardrails" && (
                  <GuardrailsSection 
                    guardrails={localDNA.guardrails}
                    onUpdate={(g) => {
                      setLocalDNA({ ...localDNA, guardrails: g });
                      onUpdate({ ...localDNA, guardrails: g });
                    }}
                  />
                )}
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}

function VoiceSection({ voice, onUpdate }: { voice?: BrandVoice; onUpdate: (v: BrandVoice) => void }) {
  const toneLabels = [
    { key: "formal", label: "Formal", opposite: "Casual" },
    { key: "professional", label: "Professional", opposite: "Friendly" },
    { key: "authoritative", label: "Authoritative", opposite: "Playful" },
  ];

  return (
    <div className="space-y-3">
      {toneLabels.map(({ key, label, opposite }) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{label}</span>
            <span>{opposite}</span>
          </div>
          <Slider
            value={[voice?.toneSpectrum?.[key as keyof typeof voice.toneSpectrum] ?? 50]}
            onValueChange={([val]) => onUpdate({
              ...voice,
              toneSpectrum: { ...voice?.toneSpectrum, [key]: val }
            })}
            max={100}
            step={1}
            className="h-2"
          />
        </div>
      ))}
      
      {voice?.emotionalSignature && voice.emotionalSignature.length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-1">Emotional Signature</p>
          <div className="flex flex-wrap gap-1">
            {voice.emotionalSignature.map((emotion, i) => (
              <Badge key={i} variant="outline" className="text-xs">{emotion}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PersonalitySection({ personality, onUpdate }: { personality?: BrandPersonality; onUpdate: (p: BrandPersonality) => void }) {
  return (
    <div className="space-y-3">
      {personality?.archetype && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Primary Archetype</p>
          <Badge className="bg-primary/20 text-primary">{personality.archetype}</Badge>
          {personality.secondaryArchetype && (
            <Badge variant="outline" className="ml-2">{personality.secondaryArchetype}</Badge>
          )}
        </div>
      )}
      
      {personality?.traits && personality.traits.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Brand Traits</p>
          <div className="flex flex-wrap gap-1">
            {personality.traits.map((trait, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{trait}</Badge>
            ))}
          </div>
        </div>
      )}

      {personality?.values && personality.values.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Core Values</p>
          <div className="flex flex-wrap gap-1">
            {personality.values.map((value, i) => (
              <Badge key={i} variant="outline" className="text-xs">{value}</Badge>
            ))}
          </div>
        </div>
      )}

      {!personality?.archetype && !personality?.traits?.length && (
        <p className="text-xs text-muted-foreground italic">No personality data detected. You can add this later in Brand DNA settings.</p>
      )}
    </div>
  );
}

function StorySection({ story, onUpdate }: { story?: BrandStory; onUpdate: (s: BrandStory) => void }) {
  const [editField, setEditField] = useState<string | null>(null);

  const fields = [
    { key: "mission", label: "Mission" },
    { key: "vision", label: "Vision" },
    { key: "tagline", label: "Tagline" },
  ];

  return (
    <div className="space-y-3">
      {fields.map(({ key, label }) => {
        const value = story?.[key as keyof BrandStory];
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">{label}</p>
              <button 
                onClick={() => setEditField(editField === key ? null : key)}
                className="p-1 hover:bg-secondary rounded"
              >
                <Edit2 className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
            {editField === key ? (
              <Textarea
                value={value || ""}
                onChange={(e) => onUpdate({ ...story, [key]: e.target.value })}
                onBlur={() => setEditField(null)}
                className="text-sm min-h-[60px]"
                autoFocus
              />
            ) : (
              <p className={`text-sm ${value ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                {value || `No ${label.toLowerCase()} detected`}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GuardrailsSection({ guardrails, onUpdate }: { guardrails?: BrandGuardrails; onUpdate: (g: BrandGuardrails) => void }) {
  const hasForbidden = guardrails?.forbiddenWords && guardrails.forbiddenWords.length > 0;
  const hasAvoidTopics = guardrails?.avoidTopics && guardrails.avoidTopics.length > 0;

  return (
    <div className="space-y-3">
      {hasForbidden && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Forbidden Words</p>
          <div className="flex flex-wrap gap-1">
            {guardrails?.forbiddenWords?.map((word, i) => (
              <Badge key={i} variant="destructive" className="text-xs">{word}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {hasAvoidTopics && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Topics to Avoid</p>
          <div className="flex flex-wrap gap-1">
            {guardrails?.avoidTopics?.map((topic, i) => (
              <Badge key={i} variant="outline" className="text-xs border-destructive/50 text-destructive">{topic}</Badge>
            ))}
          </div>
        </div>
      )}

      {!hasForbidden && !hasAvoidTopics && (
        <p className="text-xs text-muted-foreground italic">
          No guardrails detected. You can configure content boundaries later in Brand DNA settings.
        </p>
      )}
    </div>
  );
}
