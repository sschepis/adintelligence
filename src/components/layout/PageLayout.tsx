import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { GlassBoxAssistant } from "@/components/shared";

interface PageLayoutProps {
  children: ReactNode;
  showAssistant?: boolean;
}

export function PageLayout({ children, showAssistant = true }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
      {showAssistant && <GlassBoxAssistant />}
    </div>
  );
}
