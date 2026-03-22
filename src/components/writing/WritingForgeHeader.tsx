import { PenTool, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WritingForgeHeaderProps {
  showCreateButton: boolean;
  onCreateClick: () => void;
}

export function WritingForgeHeader({ showCreateButton, onCreateClick }: WritingForgeHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/80 to-accent/80 shadow-sm shadow-primary/20">
          <PenTool className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Writing Forge</h1>
          <p className="text-muted-foreground">AI-powered content creation for your campaigns</p>
        </div>
      </div>
      
      {showCreateButton && (
        <Button onClick={onCreateClick} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Content
        </Button>
      )}
    </div>
  );
}
