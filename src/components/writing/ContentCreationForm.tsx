import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CONTENT_TYPES, TONES } from "./ContentTypeGrid";
import { ContentFormData } from "@/hooks/useWritingForge";

interface ContentCreationFormProps {
  selectedType: string | null;
  formData: ContentFormData;
  generating: boolean;
  onTypeChange: (type: string) => void;
  onFormChange: (data: Partial<ContentFormData>) => void;
  onGenerate: () => void;
}

export function ContentCreationForm({
  selectedType,
  formData,
  generating,
  onTypeChange,
  onFormChange,
  onGenerate,
}: ContentCreationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Content Brief
        </CardTitle>
        <CardDescription>
          Provide details about the content you want to create
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Content Type</Label>
          <Select value={selectedType || ""} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Title / Topic</Label>
          <Input 
            placeholder="e.g., Summer Collection Launch"
            value={formData.title}
            onChange={(e) => onFormChange({ title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Content Brief</Label>
          <Textarea 
            placeholder="Describe what you want to communicate, key points to cover, and any specific requirements..."
            rows={4}
            value={formData.brief}
            onChange={(e) => onFormChange({ brief: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={formData.tone} onValueChange={(v) => onFormChange({ tone: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((tone) => (
                  <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Input 
              placeholder="e.g., Young professionals"
              value={formData.targetAudience}
              onChange={(e) => onFormChange({ targetAudience: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Keywords (comma-separated)</Label>
          <Input 
            placeholder="e.g., sustainable, luxury, limited edition"
            value={formData.keywords}
            onChange={(e) => onFormChange({ keywords: e.target.value })}
          />
        </div>

        <Button 
          onClick={onGenerate}
          disabled={!selectedType || !formData.title || !formData.brief || generating}
          className="w-full gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Content
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
