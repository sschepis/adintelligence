import { useState } from 'react';
import { Key, Plus, Copy, Trash2, Clock, Shield, Eye, EyeOff, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SettingsSection, NoticeState } from '@/components/shared';
import { useDeveloperSettings, API_SCOPES, ApiToken, RATE_LIMIT_PRESETS } from '@/hooks/useDeveloperSettings';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export function ApiTokenManager() {
  const { tokens, loading, createToken, revokeToken } = useDeveloperSettings();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read']);
  const [expiresIn, setExpiresIn] = useState<string>('never');
  const [rateLimitPreset, setRateLimitPreset] = useState<string>('standard');
  const [customRateLimit, setCustomRateLimit] = useState<number>(1000);
  const [customRateWindow, setCustomRateWindow] = useState<number>(3600);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateToken = async () => {
    if (!newTokenName.trim()) {
      toast.error('Please enter a token name');
      return;
    }

    setIsCreating(true);
    
    let expiresAt: Date | undefined;
    if (expiresIn !== 'never') {
      expiresAt = new Date();
      switch (expiresIn) {
        case '7d': expiresAt.setDate(expiresAt.getDate() + 7); break;
        case '30d': expiresAt.setDate(expiresAt.getDate() + 30); break;
        case '90d': expiresAt.setDate(expiresAt.getDate() + 90); break;
        case '1y': expiresAt.setFullYear(expiresAt.getFullYear() + 1); break;
      }
    }

    // Get rate limit values
    let rateLimit = customRateLimit;
    let rateWindow = customRateWindow;
    if (rateLimitPreset !== 'custom') {
      const preset = RATE_LIMIT_PRESETS.find(p => p.value === rateLimitPreset);
      if (preset) {
        rateLimit = preset.requests;
        rateWindow = preset.windowSeconds;
      }
    }

    const token = await createToken(newTokenName, selectedScopes, expiresAt, rateLimit, rateWindow);
    setIsCreating(false);

    if (token) {
      setCreatedToken(token);
    }
  };

  const handleCopyToken = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken);
      toast.success('Token copied to clipboard');
    }
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    setNewTokenName('');
    setSelectedScopes(['read']);
    setExpiresIn('never');
    setRateLimitPreset('standard');
    setCreatedToken(null);
    setShowToken(false);
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes(prev => 
      prev.includes(scope) 
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
  };

  return (
    <SettingsSection
      icon={Key}
      title="API Tokens"
      animationDelay="100ms"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Create API tokens to access the Instincts API programmatically.
          </p>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Token
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {createdToken ? 'Token Created' : 'Create API Token'}
                </DialogTitle>
              </DialogHeader>

              {createdToken ? (
                <div className="space-y-4">
                  <NoticeState
                    type="caution"
                    message="Make sure to copy your token now. You won't be able to see it again!"
                  />
                  
                  <div className="space-y-2">
                    <Label>Your API Token</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          value={showToken ? createdToken : '•'.repeat(40)}
                          readOnly
                          className="font-mono text-sm pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => setShowToken(!showToken)}
                        >
                          {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button variant="outline" size="icon" onClick={handleCopyToken}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button onClick={handleCloseCreate}>Done</Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="token-name">Token Name</Label>
                    <Input
                      id="token-name"
                      placeholder="e.g., Production API, CI/CD Pipeline"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Scopes</Label>
                    <div className="grid gap-2">
                      {API_SCOPES.map((scope) => (
                        <div
                          key={scope.value}
                          className="flex items-start space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleScope(scope.value)}
                        >
                          <Checkbox
                            checked={selectedScopes.includes(scope.value)}
                            onCheckedChange={() => toggleScope(scope.value)}
                          />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{scope.label}</p>
                            <p className="text-xs text-muted-foreground">{scope.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Expiration</Label>
                    <Select value={expiresIn} onValueChange={setExpiresIn}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never expires</SelectItem>
                        <SelectItem value="7d">7 days</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                        <SelectItem value="90d">90 days</SelectItem>
                        <SelectItem value="1y">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      Rate Limit
                    </Label>
                    <Select value={rateLimitPreset} onValueChange={setRateLimitPreset}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RATE_LIMIT_PRESETS.map((preset) => (
                          <SelectItem key={preset.value} value={preset.value}>
                            {preset.label} - {preset.description}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {rateLimitPreset === 'custom' && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <Label className="text-xs">Requests</Label>
                          <Input
                            type="number"
                            value={customRateLimit}
                            onChange={(e) => setCustomRateLimit(parseInt(e.target.value) || 1000)}
                            min={10}
                            max={100000}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Window (seconds)</Label>
                          <Input
                            type="number"
                            value={customRateWindow}
                            onChange={(e) => setCustomRateWindow(parseInt(e.target.value) || 3600)}
                            min={60}
                            max={86400}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={handleCloseCreate}>Cancel</Button>
                    <Button onClick={handleCreateToken} disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create Token'}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No API tokens created yet</p>
            <p className="text-sm">Create a token to get started with the API</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tokens.map((token) => (
              <TokenRow key={token.id} token={token} onRevoke={revokeToken} />
            ))}
          </div>
        )}

        <div className="rounded-lg bg-muted/30 p-4 mt-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            API Documentation
          </h4>
          <p className="text-sm text-muted-foreground mb-2">
            Use your API token in the Authorization header:
          </p>
          <code className="text-xs bg-background/80 px-2 py-1 rounded font-mono block overflow-x-auto mb-3">
            Authorization: Bearer inst_your_token_here
          </code>
          <Link to="/api-docs" className="text-sm text-primary hover:underline">
            View full API documentation →
          </Link>
        </div>
      </div>
    </SettingsSection>
  );
}

function TokenRow({ token, onRevoke }: { token: ApiToken; onRevoke: (id: string) => void }) {
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevoke = async () => {
    setIsRevoking(true);
    await onRevoke(token.id);
    setIsRevoking(false);
  };

  const formatRateLimit = () => {
    const requests = token.rate_limit_requests;
    const window = token.rate_limit_window_seconds;
    if (requests >= 1000000) return 'Unlimited';
    if (window === 3600) return `${requests.toLocaleString()}/hr`;
    if (window === 60) return `${requests.toLocaleString()}/min`;
    return `${requests.toLocaleString()}/${window}s`;
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-4 bg-card/50">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{token.name}</span>
          <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
            {token.token_prefix}...
          </code>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Created {formatDistanceToNow(new Date(token.created_at), { addSuffix: true })}
          </span>
          {token.expires_at && (
            <span>
              Expires {format(new Date(token.expires_at), 'MMM d, yyyy')}
            </span>
          )}
          {token.last_used_at && (
            <span>
              Last used {formatDistanceToNow(new Date(token.last_used_at), { addSuffix: true })}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Gauge className="h-3 w-3" />
            {formatRateLimit()}
          </span>
        </div>
        <div className="flex gap-1 mt-1">
          {token.scopes.map((scope) => (
            <Badge key={scope} variant="secondary" className="text-xs">
              {scope}
            </Badge>
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleRevoke}
        disabled={isRevoking}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
