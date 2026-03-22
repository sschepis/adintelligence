import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PERSONA_TEMPLATES } from "@/hooks/usePersonas";
import type { Persona } from "@/components/simulation/PersonaCard";
import { Sparkles, Plus, Check } from "lucide-react";

interface PersonaTemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: Omit<Persona, 'id' | 'selected'>) => void;
}

export function PersonaTemplates({ open, onOpenChange, onSelectTemplate }: PersonaTemplatesProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (template: Omit<Persona, 'id' | 'selected'>, index: number) => {
    setSelectedIndex(index);
    onSelectTemplate(template);
    setTimeout(() => {
      setSelectedIndex(null);
      onOpenChange(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Persona Templates
          </DialogTitle>
          <DialogDescription>
            Choose a template to quickly create a persona. You can customize it after adding.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PERSONA_TEMPLATES.map((template, index) => (
              <button
                key={index}
                onClick={() => handleSelect(template, index)}
                className={`
                  text-left p-4 rounded-xl border transition-all duration-200
                  ${selectedIndex === index 
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                    : 'border-border/40 bg-card/60 hover:border-primary/40 hover:bg-card/80'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{template.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{template.name}</h3>
                      {selectedIndex === index && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {template.occupation} • {template.age}
                    </p>
                    <p className="text-xs text-muted-foreground/80 mb-2">
                      {template.income}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {template.traits.slice(0, 3).map((trait) => (
                        <Badge key={trait} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {trait}
                        </Badge>
                      ))}
                      {template.traits.length > 3 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          +{template.traits.length - 3}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground/70 line-clamp-2">
                      {template.buyingBehavior}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
