import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, X } from "lucide-react";

interface TrendAnalysis {
  summary: string;
  demographics: {
    primaryAge: string;
    gender: string;
    income: string;
  };
  visualElements: string[];
  productCategories: string[];
  peakTiming: string;
  longevity: string;
  brandOpportunity: string;
  riskFactors: string[];
  confidenceScore: number;
}

interface TrendAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  trendName: string;
  analysis: TrendAnalysis | null;
  isLoading: boolean;
}

export function TrendAnalysisModal({
  isOpen,
  onClose,
  trendName,
  analysis,
  isLoading,
}: TrendAnalysisModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">AI Trend Analysis</h2>
              <p className="text-sm text-muted-foreground">"{trendName}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Generating AI insights...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-muted-foreground">{analysis.summary}</p>
              </div>

              {/* Confidence */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-sm text-muted-foreground">AI Confidence</span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500"
                    style={{ width: `${analysis.confidenceScore}%` }}
                  />
                </div>
                <span className="font-bold text-primary">{analysis.confidenceScore}%</span>
              </div>

              {/* Demographics */}
              <div>
                <h3 className="font-semibold mb-3">Target Demographics</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Age Range</p>
                    <p className="font-medium">{analysis.demographics.primaryAge}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="font-medium">{analysis.demographics.gender}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Income</p>
                    <p className="font-medium">{analysis.demographics.income}</p>
                  </div>
                </div>
              </div>

              {/* Visual Elements */}
              <div>
                <h3 className="font-semibold mb-2">Key Visual Elements</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.visualElements.map((element, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                      {element}
                    </span>
                  ))}
                </div>
              </div>

              {/* Product Categories */}
              <div>
                <h3 className="font-semibold mb-2">Aligned Product Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.productCategories.map((category, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm font-medium">
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Timing & Longevity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Peak Timing</p>
                  <p className="font-medium">{analysis.peakTiming}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Longevity</p>
                  <p className="font-medium capitalize">{analysis.longevity}</p>
                </div>
              </div>

              {/* Brand Opportunity */}
              <div className="p-4 rounded-lg bg-signal-rising/5 border border-signal-rising/20">
                <h3 className="font-semibold text-signal-rising mb-2">Brand Opportunity</h3>
                <p className="text-sm text-muted-foreground">{analysis.brandOpportunity}</p>
              </div>

              {/* Risk Factors */}
              <div>
                <h3 className="font-semibold mb-2">Risk Factors</h3>
                <ul className="space-y-2">
                  {analysis.riskFactors.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No analysis available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
