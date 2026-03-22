import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Mail, Plus, X, Save, Loader2, Gauge, RefreshCw } from "lucide-react";
import { useSysadminSettings } from "@/hooks/useSysadminSettings";
import { toast } from "sonner";

export function SysAdminSettings() {
  const {
    loading,
    alertRecipients,
    rateLimits,
    retrySettings,
    fetchAlertRecipients,
    updateAlertRecipients,
    fetchRateLimits,
    updateRateLimits,
    fetchRetrySettings,
    updateRetrySettings,
  } = useSysadminSettings();

  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [savingEmails, setSavingEmails] = useState(false);

  const [localRateLimits, setLocalRateLimits] = useState({
    dataforSeoLimit: 1000,
    apifyLimit: 500,
    rainforestLimit: 200,
  });
  const [savingRateLimits, setSavingRateLimits] = useState(false);

  const [localRetrySettings, setLocalRetrySettings] = useState({
    retryIntervalMinutes: 15,
    maxRetryAttempts: 3,
    autoRetryEnabled: true,
  });
  const [savingRetrySettings, setSavingRetrySettings] = useState(false);

  useEffect(() => {
    fetchAlertRecipients().then(setEmails);
    fetchRateLimits().then(setLocalRateLimits);
    fetchRetrySettings().then(setLocalRetrySettings);
  }, [fetchAlertRecipients, fetchRateLimits, fetchRetrySettings]);

  const handleAddEmail = () => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (emails.includes(trimmed)) {
      toast.error("This email is already in the list");
      return;
    }

    setEmails([...emails, trimmed]);
    setNewEmail("");
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleSaveEmails = async () => {
    if (emails.length === 0) {
      toast.error("Please add at least one email recipient");
      return;
    }

    setSavingEmails(true);
    const success = await updateAlertRecipients(emails);
    setSavingEmails(false);

    if (success) {
      toast.success("Alert recipients updated successfully");
    } else {
      toast.error("Failed to update alert recipients");
    }
  };

  const handleSaveRateLimits = async () => {
    setSavingRateLimits(true);
    const success = await updateRateLimits(localRateLimits);
    setSavingRateLimits(false);

    if (success) {
      toast.success("Rate limits updated successfully");
    } else {
      toast.error("Failed to update rate limits");
    }
  };

  const handleSaveRetrySettings = async () => {
    setSavingRetrySettings(true);
    const success = await updateRetrySettings(localRetrySettings);
    setSavingRetrySettings(false);

    if (success) {
      toast.success("Retry settings updated successfully");
    } else {
      toast.error("Failed to update retry settings");
    }
  };

  const hasEmailChanges = JSON.stringify(emails) !== JSON.stringify(alertRecipients);
  const hasRateLimitChanges = JSON.stringify(localRateLimits) !== JSON.stringify(rateLimits);
  const hasRetryChanges = JSON.stringify(localRetrySettings) !== JSON.stringify(retrySettings);

  return (
    <div className="space-y-6">
      {/* Alert Email Recipients */}
      <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Alert Email Recipients</CardTitle>
              <CardDescription>
                Configure who receives email notifications for critical system alerts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {emails.map((email) => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="pl-3 pr-1 py-1.5 text-sm flex items-center gap-2"
                  >
                    {email}
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}
                {emails.length === 0 && (
                  <p className="text-sm text-muted-foreground">No recipients configured</p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address..."
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                  className="flex-1"
                />
                <Button onClick={handleAddEmail} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveEmails}
                  disabled={!hasEmailChanges || savingEmails}
                  className="gap-2"
                >
                  {savingEmails ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* API Rate Limits */}
      <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Gauge className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-lg">API Rate Limits</CardTitle>
              <CardDescription>
                Configure daily request limits for external API providers
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>DataForSEO Daily Limit</Label>
                <span className="text-sm font-medium">{localRateLimits.dataforSeoLimit} requests</span>
              </div>
              <Slider
                value={[localRateLimits.dataforSeoLimit]}
                onValueChange={([value]) =>
                  setLocalRateLimits({ ...localRateLimits, dataforSeoLimit: value })
                }
                min={100}
                max={5000}
                step={100}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Limits keyword intelligence and trending searches API calls
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Apify Daily Limit</Label>
                <span className="text-sm font-medium">{localRateLimits.apifyLimit} requests</span>
              </div>
              <Slider
                value={[localRateLimits.apifyLimit]}
                onValueChange={([value]) =>
                  setLocalRateLimits({ ...localRateLimits, apifyLimit: value })
                }
                min={50}
                max={2000}
                step={50}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Limits TikTok, Instagram, and Pinterest social scraping
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Rainforest API Daily Limit</Label>
                <span className="text-sm font-medium">{localRateLimits.rainforestLimit} requests</span>
              </div>
              <Slider
                value={[localRateLimits.rainforestLimit]}
                onValueChange={([value]) =>
                  setLocalRateLimits({ ...localRateLimits, rainforestLimit: value })
                }
                min={50}
                max={1000}
                step={50}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Limits Amazon product and bestseller data requests
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveRateLimits}
              disabled={!hasRateLimitChanges || savingRateLimits}
              className="gap-2"
            >
              {savingRateLimits ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Rate Limits
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Automatic Retry Settings */}
      <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <RefreshCw className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Automatic Retry Settings</CardTitle>
              <CardDescription>
                Configure how the system handles API failures and retries
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Automatic Retry</Label>
              <p className="text-xs text-muted-foreground">
                Automatically retry failed API calls after cooldown
              </p>
            </div>
            <Switch
              checked={localRetrySettings.autoRetryEnabled}
              onCheckedChange={(checked) =>
                setLocalRetrySettings({ ...localRetrySettings, autoRetryEnabled: checked })
              }
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Retry Interval</Label>
                <span className="text-sm font-medium">{localRetrySettings.retryIntervalMinutes} minutes</span>
              </div>
              <Slider
                value={[localRetrySettings.retryIntervalMinutes]}
                onValueChange={([value]) =>
                  setLocalRetrySettings({ ...localRetrySettings, retryIntervalMinutes: value })
                }
                min={5}
                max={60}
                step={5}
                disabled={!localRetrySettings.autoRetryEnabled}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Time to wait before retrying a failed API call
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Maximum Retry Attempts</Label>
                <span className="text-sm font-medium">{localRetrySettings.maxRetryAttempts} attempts</span>
              </div>
              <Slider
                value={[localRetrySettings.maxRetryAttempts]}
                onValueChange={([value]) =>
                  setLocalRetrySettings({ ...localRetrySettings, maxRetryAttempts: value })
                }
                min={1}
                max={10}
                step={1}
                disabled={!localRetrySettings.autoRetryEnabled}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Stop retrying after this many failed attempts
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveRetrySettings}
              disabled={!hasRetryChanges || savingRetrySettings}
              className="gap-2"
            >
              {savingRetrySettings ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Retry Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
