import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  /** Additional actions to render after tabs */
  actions?: ReactNode;
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  className,
  actions,
}: TabNavigationProps) {
  return (
    <div className={cn("flex gap-2 flex-wrap", className)}>
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange(tab.id)}
          className="gap-1"
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && ` (${tab.count})`}
        </Button>
      ))}
      
      {actions && (
        <>
          <div className="flex-1" />
          {actions}
        </>
      )}
    </div>
  );
}
