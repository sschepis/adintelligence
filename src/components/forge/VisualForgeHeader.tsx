import { Button } from "@/components/ui/button";
import { Palette, Plus } from "lucide-react";

interface VisualForgeHeaderProps {
  onNewRequest: () => void;
}

export function VisualForgeHeader({ onNewRequest }: VisualForgeHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent">
          <Palette className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Visual Forge</h1>
          <p className="text-muted-foreground">Custom-crafted visual assets for your campaigns</p>
        </div>
      </div>
      
      <Button onClick={onNewRequest} className="gap-2">
        <Plus className="w-4 h-4" />
        New Request
      </Button>
    </div>
  );
}
