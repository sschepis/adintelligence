import { useState, useCallback } from "react";
import { useBrandDNA } from "./useBrandDNA";
import { toast } from "sonner";

export interface DriftAlert {
  id: string;
  message: string;
  severity: "low" | "medium" | "high";
  category: "voice" | "personality" | "guardrails" | "visual";
  contentSample?: string;
  score: number;
  createdAt: string;
}

export interface DriftAnalysis {
  overallDrift: number;
  alerts: DriftAlert[];
  recommendation: string;
}

const DRIFT_THRESHOLD = 15;

function normalizeDriftAlerts(alerts: any[]): DriftAlert[] {
  if (!alerts || !Array.isArray(alerts)) return [];
  return alerts.map((alert, idx) => {
    if (alert.id && alert.category && alert.createdAt) return alert as DriftAlert;
    return {
      id: `legacy-${idx}-${Date.now()}`,
      message: alert.message || "Unknown drift detected",
      severity: alert.severity === "high" || alert.severity === "medium" || alert.severity === "low" ? alert.severity : "medium",
      category: "voice" as const,
      score: 0,
      createdAt: alert.date || new Date().toISOString()
    };
  });
}

export function useBrandDNADrift() {
  const { brandDNA, updateScore, scoreConsistency } = useBrandDNA();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [driftAlerts, setDriftAlerts] = useState<DriftAlert[]>(normalizeDriftAlerts(brandDNA.score.driftAlerts || []));

  const analyzeContentForDrift = useCallback(async (content: string): Promise<DriftAnalysis | null> => {
    setIsAnalyzing(true);
    try {
      const result = await scoreConsistency(content);
      if (!result) return null;

      const alerts: DriftAlert[] = [];
      const now = new Date().toISOString();

      if (result.breakdown?.voiceScore && result.breakdown.voiceScore < (100 - DRIFT_THRESHOLD)) {
        alerts.push({
          id: `voice-${Date.now()}`,
          message: `Voice consistency at ${result.breakdown.voiceScore}%`,
          severity: result.breakdown.voiceScore < 50 ? "high" : result.breakdown.voiceScore < 70 ? "medium" : "low",
          category: "voice",
          contentSample: content.substring(0, 100) + "...",
          score: result.breakdown.voiceScore,
          createdAt: now
        });
      }

      if (result.guardrailViolations && result.guardrailViolations.length > 0) {
        alerts.push({
          id: `guardrails-${Date.now()}`,
          message: `Guardrail violations: ${result.guardrailViolations.join(", ")}`,
          severity: "high",
          category: "guardrails",
          contentSample: content.substring(0, 100) + "...",
          score: result.breakdown?.guardrailsScore || 0,
          createdAt: now
        });
      }

      const overallDrift = 100 - (result.overallScore || 0);

      if (alerts.length > 0) {
        const updatedAlerts = [...alerts, ...driftAlerts].slice(0, 20);
        setDriftAlerts(updatedAlerts);
        const dbAlerts = updatedAlerts.map(a => ({ date: a.createdAt, message: a.message, severity: a.severity }));
        await updateScore({ ...brandDNA.score, overall: result.overallScore, lastCalculated: now, driftAlerts: dbAlerts });
      }

      return { overallDrift, alerts, recommendation: result.suggestions?.join(" ") || "Content is aligned with Brand DNA." };
    } catch (error) {
      console.error("Drift analysis error:", error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [brandDNA.score, driftAlerts, scoreConsistency, updateScore]);

  const dismissAlert = useCallback(async (alertId: string) => {
    const updatedAlerts = driftAlerts.filter(a => a.id !== alertId);
    setDriftAlerts(updatedAlerts);
    const dbAlerts = updatedAlerts.map(a => ({ date: a.createdAt, message: a.message, severity: a.severity }));
    await updateScore({ ...brandDNA.score, driftAlerts: dbAlerts as any });
  }, [brandDNA.score, driftAlerts, updateScore]);

  const clearAllAlerts = useCallback(async () => {
    setDriftAlerts([]);
    await updateScore({ ...brandDNA.score, driftAlerts: [] });
    toast.success("All drift alerts cleared");
  }, [brandDNA.score, updateScore]);

  const getAlertsSummary = useCallback(() => {
    const high = driftAlerts.filter(a => a.severity === "high").length;
    const medium = driftAlerts.filter(a => a.severity === "medium").length;
    const low = driftAlerts.filter(a => a.severity === "low").length;
    return { high, medium, low, total: driftAlerts.length };
  }, [driftAlerts]);

  return { isAnalyzing, driftAlerts, analyzeContentForDrift, dismissAlert, clearAllAlerts, getAlertsSummary, driftThreshold: DRIFT_THRESHOLD };
}