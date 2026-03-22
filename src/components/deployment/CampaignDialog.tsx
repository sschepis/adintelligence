import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Campaign, CampaignInput } from "@/hooks/useCampaigns";

const campaignSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  daily_budget: z.number().min(0, "Budget must be positive"),
  total_budget: z.number().min(0, "Budget must be positive"),
  platform: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "scheduled"]).optional(),
});

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign | null;
  onSave: (data: CampaignInput) => Promise<{ success: boolean }>;
}

export function CampaignDialog({
  open,
  onOpenChange,
  campaign,
  onSave,
}: CampaignDialogProps) {
  const [name, setName] = useState("");
  const [dailyBudget, setDailyBudget] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "paused" | "scheduled">("draft");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!campaign;

  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setDailyBudget(campaign.daily_budget.toString());
      setTotalBudget(campaign.total_budget.toString());
      setPlatform(campaign.platform || "");
      setStatus(campaign.status);
    } else {
      setName("");
      setDailyBudget("");
      setTotalBudget("");
      setPlatform("");
      setStatus("draft");
    }
    setErrors({});
  }, [campaign, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const data = {
      name: name.trim(),
      daily_budget: parseFloat(dailyBudget) || 0,
      total_budget: parseFloat(totalBudget) || 0,
      platform: platform || undefined,
      status,
    };

    const result = campaignSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const { success } = await onSave(data);
    setIsSubmitting(false);

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Edit Campaign" : "Create New Campaign"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Spring Collection Launch"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dailyBudget">Daily Budget ($)</Label>
              <Input
                id="dailyBudget"
                type="number"
                min="0"
                step="0.01"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(e.target.value)}
                placeholder="500"
                className={errors.daily_budget ? "border-destructive" : ""}
              />
              {errors.daily_budget && (
                <p className="text-sm text-destructive">{errors.daily_budget}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalBudget">Total Budget ($)</Label>
              <Input
                id="totalBudget"
                type="number"
                min="0"
                step="0.01"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="10000"
                className={errors.total_budget ? "border-destructive" : ""}
              />
              {errors.total_budget && (
                <p className="text-sm text-destructive">{errors.total_budget}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="pinterest">Pinterest</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                  <SelectItem value="meta">Meta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="glass"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEditing ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>{isEditing ? "Save Changes" : "Create Campaign"}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
