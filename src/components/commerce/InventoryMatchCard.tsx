import { useState } from "react";
import { cn } from "@/lib/utils";
import { Package, Check, AlertTriangle, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisualPatternMatcher } from "./VisualPatternMatcher";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { RankChangeIndicator } from "./RankChangeIndicator";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  matchScore: number;
  keywordScore?: number;
  visualScore?: number;
  hasVisualScore?: boolean;
  image?: string;
  price: number;
  category: string;
}

interface InventoryMatchCardProps {
  item: InventoryItem;
  selected?: boolean;
  onSelect?: () => void;
  delay?: number;
  trendColors?: string[];
  onVisualScoreUpdate?: (id: string, visualScore: number, fullAnalysis?: any) => void;
  currentRank?: number;
  previousRank?: number;
}

export function InventoryMatchCard({ 
  item, 
  selected, 
  onSelect, 
  delay = 0,
  trendColors = [],
  onVisualScoreUpdate,
  currentRank = 0,
  previousRank = 0
}: InventoryMatchCardProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const stockStatus = item.stock > 50 ? "good" : item.stock > 10 ? "low" : "critical";

  const keywordScore = item.keywordScore ?? item.matchScore;
  const visualScore = item.visualScore ?? 0;
  const hasVisualScore = item.hasVisualScore ?? false;
  const displayScore = item.matchScore;

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-4 transition-all duration-200 animate-slide-up",
        selected ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/30",
        previousRank !== currentRank && previousRank > 0 && "ring-2 ring-primary/30"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div 
          className="w-20 h-20 rounded-lg bg-secondary/80 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer relative"
          onClick={onSelect}
        >
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="h-8 w-8 text-muted-foreground" />
          )}
          {/* Rank badge */}
          {currentRank > 0 && (
            <div className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {currentRank}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="cursor-pointer" onClick={onSelect}>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm truncate">{item.name}</h4>
                <RankChangeIndicator 
                  previousRank={previousRank} 
                  currentRank={currentRank} 
                />
              </div>
              <p className="text-xs text-muted-foreground">{item.sku}</p>
            </div>
            {selected && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Score Breakdown Toggle */}
          <div className="mt-2">
            <button
              onClick={() => setShowScoreDetails(!showScoreDetails)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ScoreBreakdown
                keywordScore={keywordScore}
                visualScore={visualScore}
                combinedScore={displayScore}
                hasVisualScore={hasVisualScore}
                compact={!showScoreDetails}
              />
              {showScoreDetails ? (
                <ChevronUp className="h-3 w-3 ml-1" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-1" />
              )}
            </button>
          </div>

          {/* Detailed Score Breakdown */}
          {showScoreDetails && (
            <div className="mt-2 pt-2 border-t border-border/30 animate-fade-in">
              <ScoreBreakdown
                keywordScore={keywordScore}
                visualScore={visualScore}
                combinedScore={displayScore}
                hasVisualScore={hasVisualScore}
                compact={false}
              />
            </div>
          )}

          <div className="flex items-center gap-4 mt-2">
            {/* Stock */}
            <div className={cn(
              "flex items-center gap-1 text-xs",
              stockStatus === "good" && "text-signal-rising",
              stockStatus === "low" && "text-accent",
              stockStatus === "critical" && "text-destructive"
            )}>
              {stockStatus === "critical" && <AlertTriangle className="h-3 w-3" />}
              <span>{item.stock} in stock</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{item.category}</span>
              {item.image && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-5 px-1.5 text-xs gap-1",
                    hasVisualScore && "text-violet-400"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAnalysis(!showAnalysis);
                  }}
                >
                  <Eye className="h-3 w-3" />
                  {hasVisualScore ? "Analyzed" : showAnalysis ? "Hide" : "AI Vision"}
                </Button>
              )}
            </div>
            <span className="font-semibold text-sm">${item.price}</span>
          </div>
        </div>
      </div>

      {/* Visual Pattern Matcher */}
      {showAnalysis && item.image && (
        <div className="mt-3 pt-3 border-t border-border/50 animate-fade-in">
          <VisualPatternMatcher
            productImage={item.image}
            productName={item.name}
            trendColors={trendColors}
            onAnalysisComplete={(result) => {
              onVisualScoreUpdate?.(item.id, result.colorMatchScore, result);
            }}
          />
        </div>
      )}
    </div>
  );
}
