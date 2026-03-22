import { useState, KeyboardEvent } from "react";
import { Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchFilterBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  onFilter?: () => void;
  placeholder?: string;
  isSearching?: boolean;
  showSearchButton?: boolean;
  showFilterButton?: boolean;
  searchButtonLabel?: string;
  className?: string;
}

export function SearchFilterBar({
  value,
  onChange,
  onSearch,
  onFilter,
  placeholder = "Search...",
  isSearching = false,
  showSearchButton = true,
  showFilterButton = true,
  searchButtonLabel = "Search",
  className,
}: SearchFilterBarProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/40 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
        />
      </div>
      
      {showSearchButton && onSearch && (
        <Button
          variant="glass"
          size="sm"
          className="gap-2"
          onClick={onSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {searchButtonLabel}
        </Button>
      )}
      
      {showFilterButton && onFilter && (
        <Button variant="glass" size="sm" className="gap-2" onClick={onFilter}>
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      )}
    </div>
  );
}
