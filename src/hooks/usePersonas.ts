import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Persona } from "@/components/simulation/PersonaCard";

interface DBPersona {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  age: string | null;
  occupation: string | null;
  income: string | null;
  traits: string[] | null;
  buying_behavior: string | null;
  is_template: boolean;
  template_category: string | null;
  created_at: string;
  updated_at: string;
}

// Preset persona templates for common audience types
export const PERSONA_TEMPLATES: Omit<Persona, 'id' | 'selected'>[] = [
  {
    name: "Budget-Conscious Millennial",
    avatar: "👩‍💻",
    age: "28-35",
    occupation: "Marketing Coordinator",
    income: "$45,000 - $65,000",
    traits: ["Price-sensitive", "Trend-aware", "Social media native", "Values authenticity"],
    buyingBehavior: "Researches extensively, reads reviews, waits for sales, influenced by peer recommendations"
  },
  {
    name: "Affluent Professional",
    avatar: "👨‍💼",
    age: "35-50",
    occupation: "Senior Manager / Director",
    income: "$120,000 - $200,000",
    traits: ["Quality-focused", "Time-poor", "Brand loyal", "Values convenience"],
    buyingBehavior: "Pays premium for quality, values excellent service, prefers established brands"
  },
  {
    name: "Gen Z Trendsetter",
    avatar: "🧑‍🎤",
    age: "18-24",
    occupation: "Student / Entry-level",
    income: "$15,000 - $35,000",
    traits: ["Early adopter", "Sustainability-conscious", "Visual-first", "Values uniqueness"],
    buyingBehavior: "Discovers products on TikTok/Instagram, impulse purchases, values brand values over legacy"
  },
  {
    name: "Suburban Parent",
    avatar: "👨‍👩‍👧",
    age: "32-45",
    occupation: "Various / Dual-income household",
    income: "$85,000 - $150,000",
    traits: ["Family-focused", "Safety-conscious", "Practical", "Value-oriented"],
    buyingBehavior: "Prioritizes family needs, bulk purchases, brand loyalty for trusted products"
  },
  {
    name: "Luxury Enthusiast",
    avatar: "💎",
    age: "40-60",
    occupation: "Executive / Business Owner",
    income: "$250,000+",
    traits: ["Status-conscious", "Quality-obsessed", "Exclusive taste", "Experience-driven"],
    buyingBehavior: "Seeks exclusivity, values craftsmanship, willing to pay premium for best-in-class"
  },
  {
    name: "Health & Wellness Advocate",
    avatar: "🧘",
    age: "25-40",
    occupation: "Various",
    income: "$55,000 - $95,000",
    traits: ["Health-conscious", "Research-driven", "Ingredient-aware", "Eco-friendly"],
    buyingBehavior: "Reads labels carefully, prefers organic/natural, willing to pay more for health benefits"
  }
];

export function usePersonas() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPersonas = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_template", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedPersonas: Persona[] = (data as DBPersona[]).map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        age: p.age || "",
        occupation: p.occupation || "",
        income: p.income || "",
        traits: p.traits || [],
        buyingBehavior: p.buying_behavior || "",
        selected: false
      }));

      setPersonas(mappedPersonas);
    } catch (error) {
      console.error("Error fetching personas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, [user]);

  const savePersona = async (personaData: Omit<Persona, 'id' | 'selected'>): Promise<Persona | null> => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save personas.",
        variant: "destructive"
      });
      return null;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("personas")
        .insert({
          user_id: user.id,
          name: personaData.name,
          avatar: personaData.avatar,
          age: personaData.age || null,
          occupation: personaData.occupation || null,
          income: personaData.income || null,
          traits: personaData.traits,
          buying_behavior: personaData.buyingBehavior || null,
          is_template: false
        })
        .select()
        .single();

      if (error) throw error;

      const newPersona: Persona = {
        id: data.id,
        name: data.name,
        avatar: data.avatar,
        age: data.age || "",
        occupation: data.occupation || "",
        income: data.income || "",
        traits: data.traits || [],
        buyingBehavior: data.buying_behavior || "",
        selected: true
      };

      setPersonas(prev => [newPersona, ...prev]);
      
      toast({
        title: "Persona saved",
        description: `${personaData.name} has been added to your personas.`
      });

      return newPersona;
    } catch (error: any) {
      console.error("Error saving persona:", error);
      toast({
        title: "Error",
        description: "Failed to save persona. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updatePersona = async (id: string, updates: Partial<Omit<Persona, 'id' | 'selected'>>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("personas")
        .update({
          name: updates.name,
          avatar: updates.avatar,
          age: updates.age || null,
          occupation: updates.occupation || null,
          income: updates.income || null,
          traits: updates.traits,
          buying_behavior: updates.buyingBehavior || null
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setPersonas(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ));

      toast({
        title: "Persona updated",
        description: "Your changes have been saved."
      });

      return true;
    } catch (error) {
      console.error("Error updating persona:", error);
      toast({
        title: "Error",
        description: "Failed to update persona.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deletePersona = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("personas")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setPersonas(prev => prev.filter(p => p.id !== id));

      toast({
        title: "Persona deleted",
        description: "The persona has been removed."
      });

      return true;
    } catch (error) {
      console.error("Error deleting persona:", error);
      toast({
        title: "Error",
        description: "Failed to delete persona.",
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleSelection = (id: string) => {
    setPersonas(prev => prev.map(p => 
      p.id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const selectAll = () => {
    setPersonas(prev => prev.map(p => ({ ...p, selected: true })));
  };

  const deselectAll = () => {
    setPersonas(prev => prev.map(p => ({ ...p, selected: false })));
  };

  return {
    personas,
    loading,
    saving,
    savePersona,
    updatePersona,
    deletePersona,
    toggleSelection,
    selectAll,
    deselectAll,
    refetch: fetchPersonas
  };
}
