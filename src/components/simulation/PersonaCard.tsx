import { cn } from "@/lib/utils";
import { Check, User } from "lucide-react";

export interface Persona {
  id: string;
  name: string;
  avatar: string;
  age: string;
  occupation: string;
  income: string;
  traits: string[];
  buyingBehavior: string;
  selected?: boolean;
}

interface PersonaCardProps {
  persona: Persona;
  onSelect: () => void;
  delay?: number;
}

export function PersonaCard({ persona, onSelect, delay = 0 }: PersonaCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "glass-card rounded-xl p-4 cursor-pointer transition-all duration-200 animate-slide-up",
        persona.selected 
          ? "border-primary ring-2 ring-primary/20 bg-primary/5" 
          : "hover:border-primary/30"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-2xl">
            {persona.avatar}
          </div>
          {persona.selected && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{persona.name}</h4>
          <p className="text-xs text-muted-foreground">{persona.age} • {persona.occupation}</p>
          <p className="text-xs text-muted-foreground">{persona.income}</p>
        </div>
      </div>

      {/* Traits */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {persona.traits.slice(0, 3).map((trait, index) => (
          <span
            key={index}
            className="px-2 py-0.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground"
          >
            {trait}
          </span>
        ))}
      </div>

      {/* Buying Behavior */}
      <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
        {persona.buyingBehavior}
      </p>
    </div>
  );
}
