import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/UserMenu";
import { ArrowLeft } from "lucide-react";

interface SettingsPageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  showUserMenu?: boolean;
  actions?: ReactNode;
}

export function SettingsPageHeader({
  title,
  description,
  showBackButton = true,
  showUserMenu = true,
  actions,
}: SettingsPageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="mb-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3">
        {actions}
        {showUserMenu && <UserMenu />}
      </div>
    </header>
  );
}
