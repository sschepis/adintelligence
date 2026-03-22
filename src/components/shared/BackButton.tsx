import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function BackButton({ 
  onClick, 
  label = "Back",
  className 
}: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn("gap-2 mb-4", className)}
      onClick={onClick}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
}
