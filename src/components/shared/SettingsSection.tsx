import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  icon?: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
  animationDelay?: string;
}

export function SettingsSection({ 
  icon: Icon, 
  title, 
  children, 
  className,
  animationDelay 
}: SettingsSectionProps) {
  return (
    <section 
      className={cn(
        "glass-card rounded-xl p-6 mb-6 animate-slide-up",
        className
      )}
      style={animationDelay ? { animationDelay } : undefined}
    >
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        <h2 className="font-display font-semibold text-lg">{title}</h2>
      </div>
      {children}
    </section>
  );
}
