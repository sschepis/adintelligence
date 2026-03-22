import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Persona } from "@/components/simulation/PersonaCard";
import type { BrandDNA } from "@/hooks/useBrandDNA";

interface EmotionalPoint {
  time: number;
  emotion: string;
  intensity: number;
}

interface PersonaReaction {
  personaIndex: number;
  emotionalTimeline: EmotionalPoint[];
  overallSentiment: number;
  purchaseIntent: number;
  feedback: string;
  keyMoment?: string;
  objection?: string;
}

interface AggregateMetrics {
  averageSentiment: number;
  averagePurchaseIntent: number;
  engagementRate: number;
  recommendation: string;
}

interface SimulationResult {
  reactions: PersonaReaction[];
  aggregateMetrics: AggregateMetrics;
}

export function useSimulateFocusGroup() {
  const [isLoading, setIsLoading] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const { toast } = useToast();

  const simulateFocusGroup = async (
    adDescription: string,
    trendName: string,
    personas: Persona[],
    brandDNA?: BrandDNA
  ) => {
    setIsLoading(true);
    setSimulation(null);

    try {
      const { data, error } = await supabase.functions.invoke("simulate-focus-group", {
        body: {
          adDescription,
          trendName,
          personas: personas.map(p => ({
            name: p.name,
            age: p.age,
            occupation: p.occupation,
            income: p.income,
            traits: p.traits,
            buyingBehavior: p.buyingBehavior,
          })),
          brandDNA: brandDNA ? {
            voice: brandDNA.voice,
            personality: brandDNA.personality,
            story: brandDNA.story,
            guardrails: brandDNA.guardrails,
          } : undefined,
        },
      });

      if (error) throw error;

      if (data?.success && data?.simulation) {
        setSimulation(data.simulation);
        toast({
          title: "Simulation Complete",
          description: "AI focus group feedback generated",
        });
        return data.simulation;
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error simulating focus group:", error);
      toast({
        title: "Simulation Failed",
        description: error.message || "Failed to run focus group simulation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { simulateFocusGroup, isLoading, simulation };
}
