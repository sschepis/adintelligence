import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Check, Trash2, Star, Moon, Sun, Sparkles } from "lucide-react";

export interface ThemePreset {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  createdAt: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: number;
    headingWeight: string;
    bodyWeight: string;
    lineHeight: number;
  };
  spacing: {
    baseUnit: number;
    borderRadius: number;
  };
  effects: {
    enableGradients: boolean;
    enableShadows: boolean;
    shadowIntensity: number;
  };
}

interface ThemePresetsProps {
  presets: ThemePreset[];
  activePresetId?: string;
  onApplyPreset: (preset: ThemePreset) => void;
  onSavePreset: (preset: Omit<ThemePreset, 'id' | 'createdAt'>) => void;
  onDeletePreset: (presetId: string) => void;
  onSetDefault: (presetId: string) => void;
  currentTheme: Omit<ThemePreset, 'id' | 'name' | 'createdAt'>;
}

const PRESET_ICONS: Record<string, React.ElementType> = {
  'light': Sun,
  'dark': Moon,
  'default': Star,
};

export function ThemePresets({
  presets,
  activePresetId,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
  onSetDefault,
  currentTheme,
}: ThemePresetsProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetDescription, setNewPresetDescription] = useState("");

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }

    onSavePreset({
      name: newPresetName.trim(),
      description: newPresetDescription.trim() || undefined,
      ...currentTheme,
    });

    setNewPresetName("");
    setNewPresetDescription("");
    setSaveDialogOpen(false);
    toast.success("Theme preset saved");
  };

  const getPresetIcon = (preset: ThemePreset) => {
    const nameLower = preset.name.toLowerCase();
    if (nameLower.includes('light')) return Sun;
    if (nameLower.includes('dark')) return Moon;
    if (preset.isDefault) return Star;
    return Sparkles;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Theme Presets
          </CardTitle>
          <CardDescription>Save and switch between theme variations</CardDescription>
        </div>
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Save Current
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Theme Preset</DialogTitle>
              <DialogDescription>
                Save your current theme settings as a reusable preset
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="preset-name">Preset Name</Label>
                <Input
                  id="preset-name"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="e.g., Holiday Theme, Dark Mode"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preset-description">Description (optional)</Label>
                <Input
                  id="preset-description"
                  value={newPresetDescription}
                  onChange={(e) => setNewPresetDescription(e.target.value)}
                  placeholder="Brief description of this theme"
                />
              </div>
              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="flex gap-2">
                  {Object.entries(currentTheme.colors).map(([key, color]) => (
                    <div
                      key={key}
                      className="w-8 h-8 rounded-md border border-border"
                      style={{ backgroundColor: color }}
                      title={`${key}: ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSavePreset}>Save Preset</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {presets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No presets saved yet</p>
            <p className="text-sm">Save your current theme to create your first preset</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset) => {
              const Icon = getPresetIcon(preset);
              const isActive = activePresetId === preset.id;
              
              return (
                <div
                  key={preset.id}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                    isActive 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => onApplyPreset(preset)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: preset.colors.primary }}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{preset.name}</h4>
                        {preset.isDefault && (
                          <Badge variant="secondary" className="text-[10px] h-4">Default</Badge>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <Badge className="bg-primary text-primary-foreground">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>

                  {/* Color Preview */}
                  <div className="flex gap-1 mb-3">
                    {Object.values(preset.colors).map((color, i) => (
                      <div
                        key={i}
                        className="flex-1 h-6 first:rounded-l-md last:rounded-r-md"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Description */}
                  {preset.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {preset.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-2">
                    {!preset.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetDefault(preset.id);
                        }}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePreset(preset.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
