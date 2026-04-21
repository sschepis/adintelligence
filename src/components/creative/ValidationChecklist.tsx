import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { PlanValidationError } from "@/types/videoAd";

interface ValidationChecklistProps {
  errors: PlanValidationError[];
  onAutoFix?: () => void;
  autoFixLabel?: string;
}

export function ValidationChecklist({ errors, onAutoFix, autoFixLabel = "Auto-fix tiling" }: ValidationChecklistProps) {
  if (errors.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Alert className="border-success/40 bg-success/10">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertTitle>Manifest looks good</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            All shots tile correctly and pass validation. Ready to render.
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  // Detect tiling errors → enable auto-fix
  const hasTilingError = errors.some(
    (e) => e.path.endsWith(".startSeconds") || e.path === "shots" || e.path === "durationSeconds",
  );

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between gap-2">
            <span>{errors.length} issue{errors.length === 1 ? "" : "s"} block render</span>
            {hasTilingError && onAutoFix && (
              <Button size="sm" variant="outline" onClick={onAutoFix} className="h-7 text-xs">
                {autoFixLabel}
              </Button>
            )}
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1 text-xs">
              {errors.map((e, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-mono opacity-70 shrink-0">{e.path || "manifest"}:</span>
                  <span>{e.message}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
