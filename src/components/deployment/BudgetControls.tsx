import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, AlertTriangle, Settings } from "lucide-react";

interface BudgetControlsProps {
  totalBudget: number;
  spent: number;
  dailyLimit: number;
  onUpdateBudget: (budget: number) => void;
  className?: string;
}

export function BudgetControls({
  totalBudget,
  spent,
  dailyLimit,
  onUpdateBudget,
  className,
}: BudgetControlsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(totalBudget);
  
  const remaining = totalBudget - spent;
  const percentUsed = (spent / totalBudget) * 100;
  const daysRemaining = Math.ceil(remaining / dailyLimit);

  return (
    <div className={cn("glass-card rounded-xl p-5 animate-slide-up", className)}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-lg">Budget Controls</h3>
        <Button variant="glass" size="sm" className="gap-1.5">
          <Settings className="h-4 w-4" />
          Configure
        </Button>
      </div>

      {/* Main Budget Display */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="p-4 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Total Budget</span>
          </div>
          <p className="text-2xl font-display font-bold">${totalBudget.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Spent</span>
          </div>
          <p className="text-2xl font-display font-bold">${spent.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs">Remaining</span>
          </div>
          <p className={cn(
            "text-2xl font-display font-bold",
            remaining < totalBudget * 0.2 ? "text-destructive" : "text-signal-rising"
          )}>
            ${remaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Budget Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Budget Utilization</span>
          <span className="font-medium">{percentUsed.toFixed(1)}%</span>
        </div>
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500",
              percentUsed > 90 ? "bg-gradient-to-r from-destructive to-red-400" :
              percentUsed > 70 ? "bg-gradient-to-r from-accent to-amber-400" :
              "bg-gradient-to-r from-primary to-blue-400"
            )}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Daily Limit & Pace */}
      <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Daily Spend Limit</p>
          <p className="font-semibold">${dailyLimit.toLocaleString()}/day</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Est. Days Remaining</p>
          <p className="font-semibold">{daysRemaining} days</p>
        </div>
      </div>

      {/* Guardrails */}
      <div className="mt-4 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Active Guardrails</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 rounded-md bg-signal-rising/10 text-signal-rising text-xs font-medium">
            Auto-pause at 95%
          </span>
          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
            ROAS floor: 2.5x
          </span>
          <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium">
            CPM cap: $12
          </span>
        </div>
      </div>
    </div>
  );
}
