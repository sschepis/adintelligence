import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Briefcase, 
  DollarSign, 
  Heart, 
  ShoppingBag,
  Sparkles,
  Save,
  X
} from "lucide-react";
import type { Persona } from "./PersonaCard";

interface PersonaBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona?: Persona | null;
  initialData?: Omit<Persona, 'id' | 'selected'> | null;
  onSave: (persona: Omit<Persona, 'id' | 'selected'>) => void;
}

const avatarOptions = ["👩‍💼", "👨‍💻", "👩‍🎨", "👨‍🎤", "👩‍⚕️", "👨‍🍳", "👩‍🏫", "👨‍💼", "👩‍🔬", "👨‍🎓", "👵", "👴"];

const occupationOptions = [
  "Marketing Director",
  "Software Engineer",
  "UX Designer",
  "Content Creator",
  "Physician",
  "Teacher",
  "Entrepreneur",
  "Financial Analyst",
  "Consultant",
  "Artist",
  "Other",
];

const incomeRanges = [
  "$30K - $50K",
  "$50K - $75K",
  "$75K - $100K",
  "$100K - $150K",
  "$150K - $200K",
  "$200K+",
];

const traitOptions = [
  "Brand-conscious",
  "Quality-focused",
  "Trendsetter",
  "Minimalist",
  "Eco-conscious",
  "Digital-native",
  "Status-driven",
  "Time-poor",
  "Premium buyer",
  "Value-seeker",
  "Social-first",
  "Aspirational",
  "Practical",
  "Impulsive",
  "Research-heavy",
];

export function PersonaBuilder({ open, onOpenChange, persona, initialData, onSave }: PersonaBuilderProps) {
  const source = initialData || persona;
  const [formData, setFormData] = useState({
    name: source?.name || "",
    avatar: source?.avatar || "👩‍💼",
    age: source?.age || "30",
    occupation: source?.occupation || "",
    income: source?.income || "$75K - $100K",
    traits: source?.traits || [],
    buyingBehavior: source?.buyingBehavior || "",
  });

  // Reset form when initialData changes (e.g., from template selection)
  useState(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        avatar: initialData.avatar || "👩‍💼",
        age: initialData.age || "30",
        occupation: initialData.occupation || "",
        income: initialData.income || "$75K - $100K",
        traits: initialData.traits || [],
        buyingBehavior: initialData.buyingBehavior || "",
      });
    }
  });

  const [newTrait, setNewTrait] = useState("");

  const handleTraitToggle = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.includes(trait)
        ? prev.traits.filter(t => t !== trait)
        : prev.traits.length < 5 ? [...prev.traits, trait] : prev.traits
    }));
  };

  const addCustomTrait = () => {
    if (newTrait.trim() && formData.traits.length < 5) {
      setFormData(prev => ({
        ...prev,
        traits: [...prev.traits, newTrait.trim()]
      }));
      setNewTrait("");
    }
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.occupation) return;
    onSave(formData);
    onOpenChange(false);
  };

  const isValid = formData.name.trim() && formData.occupation && formData.traits.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {persona ? "Edit Persona" : "Create New Persona"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Avatar Selection */}
          <div className="space-y-2">
            <Label>Avatar</Label>
            <div className="flex flex-wrap gap-2">
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setFormData(prev => ({ ...prev, avatar: emoji }))}
                  className={cn(
                    "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all",
                    formData.avatar === emoji
                      ? "bg-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "bg-secondary hover:bg-secondary/80"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Age */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Sarah Mitchell"
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[parseInt(formData.age) || 30]}
                  onValueChange={([v]) => setFormData(prev => ({ ...prev, age: String(v) }))}
                  min={18}
                  max={70}
                  step={1}
                  className="flex-1"
                />
                <span className="w-10 text-center font-medium">{formData.age}</span>
              </div>
            </div>
          </div>

          {/* Occupation */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Occupation
            </Label>
            <Select
              value={formData.occupation}
              onValueChange={(v) => setFormData(prev => ({ ...prev, occupation: v }))}
            >
              <SelectTrigger className="bg-secondary/50">
                <SelectValue placeholder="Select occupation" />
              </SelectTrigger>
              <SelectContent>
                {occupationOptions.map((occ) => (
                  <SelectItem key={occ} value={occ}>{occ}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Income */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Income Range
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {incomeRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setFormData(prev => ({ ...prev, income: range }))}
                  className={cn(
                    "p-2 rounded-lg text-xs font-medium transition-all",
                    formData.income === range
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Traits */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Personality Traits ({formData.traits.length}/5)
            </Label>
            <div className="flex flex-wrap gap-2">
              {traitOptions.map((trait) => (
                <button
                  key={trait}
                  onClick={() => handleTraitToggle(trait)}
                  disabled={!formData.traits.includes(trait) && formData.traits.length >= 5}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    formData.traits.includes(trait)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {trait}
                </button>
              ))}
            </div>
            
            {/* Custom trait input */}
            <div className="flex gap-2 mt-2">
              <Input
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
                placeholder="Add custom trait..."
                className="bg-secondary/50 text-sm"
                onKeyDown={(e) => e.key === "Enter" && addCustomTrait()}
              />
              <Button 
                variant="glass" 
                size="sm" 
                onClick={addCustomTrait}
                disabled={formData.traits.length >= 5}
              >
                Add
              </Button>
            </div>

            {/* Selected traits */}
            {formData.traits.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.traits.map((trait) => (
                  <Badge 
                    key={trait} 
                    className="gap-1 cursor-pointer"
                    onClick={() => handleTraitToggle(trait)}
                  >
                    {trait}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Buying Behavior */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Buying Behavior
            </Label>
            <Textarea
              value={formData.buyingBehavior}
              onChange={(e) => setFormData(prev => ({ ...prev, buyingBehavior: e.target.value }))}
              placeholder="Describe how this persona typically shops and makes purchase decisions..."
              className="bg-secondary/50 min-h-[80px] resize-none"
            />
          </div>

          {/* AI Suggestion */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary">AI Enhancement</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  After saving, AI will analyze this persona and suggest optimal targeting parameters based on historical campaign data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="gradient" 
            onClick={handleSave}
            disabled={!isValid}
          >
            <Save className="h-4 w-4 mr-2" />
            {persona ? "Update Persona" : "Create Persona"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
