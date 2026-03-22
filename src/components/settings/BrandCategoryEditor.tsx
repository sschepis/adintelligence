import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface BrandCategoryEditorProps {
  categories: string[];
  onChange: (categories: string[]) => void;
}

export function BrandCategoryEditor({ categories, onChange }: BrandCategoryEditorProps) {
  const [newCategory, setNewCategory] = useState("");

  const handleAdd = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      onChange([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const handleRemove = (category: string) => {
    onChange(categories.filter((c) => c !== category));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Add a category..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button variant="glass" size="sm" onClick={handleAdd} disabled={!newCategory.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories added</p>
        ) : (
          categories.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1 pr-1">
              {category}
              <button
                onClick={() => handleRemove(category)}
                className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
