import { ReactNode } from "react";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { UserMenu } from "@/components/layout/UserMenu";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconGradient?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  showNotifications?: boolean;
  showUserMenu?: boolean;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconGradient = "from-primary to-accent",
  badge,
  actions,
  showNotifications = true,
  showUserMenu = true,
}: PageHeaderProps) {
  return (
    <header className="mb-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${iconGradient}`}>
              <Icon className="w-6 h-6 text-primary-foreground" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display font-bold text-3xl tracking-tight">
                {title}
              </h1>
              {badge}
            </div>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {actions}
          {showNotifications && <NotificationCenter />}
          {showUserMenu && <UserMenu />}
        </div>
      </div>
    </header>
  );
}
