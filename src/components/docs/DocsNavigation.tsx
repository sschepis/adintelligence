import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface DocsNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  sections: Section[];
}

export const DocsNavigation = ({
  activeSection,
  onSectionChange,
  sections,
}: DocsNavigationProps) => {
  return (
    <div className="space-y-1">
      <h3 className="font-medium text-sm text-muted-foreground mb-3 px-3">
        Navigation
      </h3>
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <Button
            key={section.id}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              activeSection === section.id && "bg-primary/10 text-primary"
            )}
            onClick={() => onSectionChange(section.id)}
          >
            <Icon className="h-4 w-4" />
            {section.label}
          </Button>
        );
      })}
    </div>
  );
};
