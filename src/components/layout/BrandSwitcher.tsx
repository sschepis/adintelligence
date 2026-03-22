import { useState } from "react";
import { useBrand } from "@/contexts/BrandContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Building2, Plus, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface BrandSwitcherProps {
  collapsed?: boolean;
}

export function BrandSwitcher({ collapsed = false }: BrandSwitcherProps) {
  const { brands, activeBrand, switching, switchBrand, loading } = useBrand();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className={cn(
        "flex items-center gap-3 px-4 py-3",
        collapsed && "justify-center px-2"
      )}>
        <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />
        {!collapsed && <div className="h-4 w-24 rounded bg-muted animate-pulse" />}
      </div>
    );
  }

  if (!activeBrand) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-3 w-full px-4 py-3 hover:bg-sidebar-accent/50 transition-colors outline-none",
          collapsed && "justify-center px-2"
        )}
        disabled={switching}
      >
        {/* Brand Logo/Icon */}
        {activeBrand.logo_url ? (
          <img
            src={activeBrand.logo_url}
            alt={activeBrand.name}
            className="h-9 w-9 rounded-xl object-contain shadow-sm ring-1 ring-border/50"
          />
        ) : (
          <div 
            className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm"
            style={{ 
              background: `linear-gradient(135deg, ${activeBrand.primary_color}, ${activeBrand.accent_color})` 
            }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        )}

        {!collapsed && (
          <>
            <div className="flex-1 text-left min-w-0">
              <div className="font-semibold text-sm truncate text-foreground">
                {activeBrand.name}
              </div>
              {brands.length > 1 && (
                <div className="text-xs text-muted-foreground">
                  {brands.length} brands
                </div>
              )}
            </div>

            {brands.length > 1 && (
              switching ? (
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              ) : (
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  open && "rotate-180"
                )} />
              )
            )}
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side={collapsed ? "right" : "bottom"}
        className="w-64"
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          Switch Brand
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {brands.map((brand) => (
          <DropdownMenuItem
            key={brand.id}
            onClick={() => {
              if (brand.id !== activeBrand.id) {
                switchBrand(brand.id);
              }
              setOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer"
          >
            {/* Brand Logo/Icon */}
            {brand.logo_url ? (
              <img
                src={brand.logo_url}
                alt={brand.name}
                className="h-8 w-8 rounded-lg object-contain ring-1 ring-border/50"
              />
            ) : (
              <div 
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${brand.primary_color}, ${brand.accent_color})` 
                }}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{brand.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {brand.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </div>
            </div>

            {brand.id === activeBrand.id && (
              <Check className="h-4 w-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            to="/settings/brands"
            className="flex items-center gap-2 text-muted-foreground cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add new brand</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
