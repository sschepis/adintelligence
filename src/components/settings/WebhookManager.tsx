import { useState } from 'react';
import { Webhook, Plus, Trash2, Play, Pause, ExternalLink, CheckCircle2, XCircle, AlertCircle, Send, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { SettingsSection } from '@/components/shared';
import { useDeveloperSettings, WEBHOOK_EVENTS, Webhook as WebhookType } from '@/hooks/useDeveloperSettings';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export function WebhookManager() {
  const { webhooks, loading, createWebhook, updateWebhook, deleteWebhook, testWebhook } = useDeveloperSettings();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWebhook = async () => {
    if (!newWebhookName.trim()) {
      toast.error('Please enter a webhook name');
      return;
    }
    if (!newWebhookUrl.trim()) {
      toast.error('Please enter a webhook URL');
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event');
      return;
    }

    // Basic URL validation
    try {
      new URL(newWebhookUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsCreating(true);
    const success = await createWebhook(newWebhookName, newWebhookUrl, selectedEvents);
    setIsCreating(false);

    if (success) {
      handleCloseCreate();
    }
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    setNewWebhookName('');
    setNewWebhookUrl('');
    setSelectedEvents([]);
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev => 
      prev.includes(event) 
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  const toggleAllEvents = () => {
    if (selectedEvents.length === WEBHOOK_EVENTS.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(WEBHOOK_EVENTS.map(e => e.value));
    }
  };

  return (
    <SettingsSection
      icon={Webhook}
      title="Webhooks"
      animationDelay="150ms"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Receive real-time notifications when events happen in your account.
          </p>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Webhook</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-name">Name</Label>
                  <Input
                    id="webhook-name"
                    placeholder="e.g., Slack Notifications, Zapier Integration"
                    value={newWebhookName}
                    onChange={(e) => setNewWebhookName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Endpoint URL</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://your-server.com/webhook"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Events</Label>
                    <Button variant="ghost" size="sm" onClick={toggleAllEvents}>
                      {selectedEvents.length === WEBHOOK_EVENTS.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-lg border p-2">
                    {WEBHOOK_EVENTS.map((event) => (
                      <div
                        key={event.value}
                        className="flex items-center space-x-2 rounded p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleEvent(event.value)}
                      >
                        <Checkbox
                          checked={selectedEvents.includes(event.value)}
                          onCheckedChange={() => toggleEvent(event.value)}
                        />
                        <span className="text-sm">{event.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseCreate}>Cancel</Button>
                  <Button onClick={handleCreateWebhook} disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Webhook'}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : webhooks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Webhook className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No webhooks configured yet</p>
            <p className="text-sm">Add a webhook to receive real-time event notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <WebhookRow
                key={webhook.id}
                webhook={webhook}
                onUpdate={updateWebhook}
                onDelete={deleteWebhook}
                onTest={testWebhook}
              />
            ))}
          </div>
        )}

        <div className="rounded-lg bg-muted/30 p-4 mt-4 space-y-3">
          <h4 className="text-sm font-medium">Webhook Payload</h4>
          <p className="text-sm text-muted-foreground">
            Each webhook request includes a signature header for verification:
          </p>
          <code className="text-xs bg-background/80 px-2 py-1 rounded font-mono block overflow-x-auto">
            X-Instincts-Signature: sha256=...
          </code>
          <div className="flex items-center gap-2 pt-2">
            <Code className="h-4 w-4 text-muted-foreground" />
            <Link to="/api-docs" className="text-sm text-primary hover:underline">
              View signature verification examples (Node.js, Python, PHP) →
            </Link>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}

function WebhookRow({ 
  webhook, 
  onUpdate, 
  onDelete,
  onTest
}: { 
  webhook: WebhookType; 
  onUpdate: (id: string, updates: Partial<WebhookType>) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleToggleActive = () => {
    onUpdate(webhook.id, { is_active: !webhook.is_active });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(webhook.id);
    setIsDeleting(false);
  };

  const handleTest = async () => {
    setIsTesting(true);
    await onTest(webhook.id);
    setIsTesting(false);
  };

  const getStatusIcon = () => {
    if (!webhook.last_status_code) return null;
    if (webhook.last_status_code >= 200 && webhook.last_status_code < 300) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    if (webhook.failure_count > 3) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    return <AlertCircle className="h-4 w-4 text-amber-500" />;
  };

  return (
    <div className="rounded-lg border p-4 bg-card/50 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{webhook.name}</span>
            <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
              {webhook.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {getStatusIcon()}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{webhook.url}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={webhook.is_active}
            onCheckedChange={handleToggleActive}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {webhook.events.slice(0, 4).map((event) => (
          <Badge key={event} variant="outline" className="text-xs">
            {WEBHOOK_EVENTS.find(e => e.value === event)?.label || event}
          </Badge>
        ))}
        {webhook.events.length > 4 && (
          <Badge variant="outline" className="text-xs">
            +{webhook.events.length - 4} more
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="text-xs text-muted-foreground">
          {webhook.last_triggered_at ? (
            <>
              Last triggered {formatDistanceToNow(new Date(webhook.last_triggered_at), { addSuffix: true })}
              {webhook.last_status_code && (
                <span className="ml-2">
                  (Status: {webhook.last_status_code})
                </span>
              )}
            </>
          ) : (
            'Never triggered'
          )}
          {webhook.failure_count > 0 && (
            <span className="ml-2 text-amber-500">
              {webhook.failure_count} failures
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTest}
            disabled={isTesting}
            className="gap-1"
          >
            <Send className="h-3 w-3" />
            Test
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
