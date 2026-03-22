import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { WCAGAlertBanner } from "./WCAGAlertBanner";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Whether to show the sidebar (default: true) */
  showSidebar?: boolean;
  /** Additional gradient classes for background */
  gradient?: string;
}

export function PageContainer({ 
  children, 
  className,
  showSidebar = true,
  gradient = "from-background to-background"
}: PageContainerProps) {
  const { collapsed } = useSidebarContext();
  
  return (
    <div className={cn("min-h-screen bg-background", gradient !== "from-background to-background" && `bg-gradient-to-br ${gradient}`)}>
      {showSidebar && <Sidebar />}
      
      <main className={cn(
        "min-h-screen transition-all duration-300 flex flex-col",
        showSidebar && (collapsed ? "pl-[72px]" : "pl-64"),
        className
      )}>
        <WCAGAlertBanner />
        <div className="p-8 animate-fade-in flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
