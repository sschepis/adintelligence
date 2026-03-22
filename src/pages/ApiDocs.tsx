import { useState } from 'react';
import { Book, Code, Key, Webhook, Shield, Zap, Copy, Check, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { PageContainer, NoticeState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

const API_BASE_URL = 'https://api.instincts.ai/v1';

const ENDPOINTS = [
  {
    category: 'Campaigns',
    endpoints: [
      { method: 'GET', path: '/campaigns', description: 'List all campaigns', scopes: ['read', 'campaigns'] },
      { method: 'POST', path: '/campaigns', description: 'Create a new campaign', scopes: ['write', 'campaigns'] },
      { method: 'GET', path: '/campaigns/:id', description: 'Get campaign details', scopes: ['read', 'campaigns'] },
      { method: 'PATCH', path: '/campaigns/:id', description: 'Update a campaign', scopes: ['write', 'campaigns'] },
      { method: 'DELETE', path: '/campaigns/:id', description: 'Delete a campaign', scopes: ['delete', 'campaigns'] },
      { method: 'POST', path: '/campaigns/:id/deploy', description: 'Deploy a campaign', scopes: ['write', 'campaigns'] },
      { method: 'POST', path: '/campaigns/:id/pause', description: 'Pause a campaign', scopes: ['write', 'campaigns'] },
    ],
  },
  {
    category: 'Inventory',
    endpoints: [
      { method: 'GET', path: '/inventory', description: 'List all inventory items', scopes: ['read', 'inventory'] },
      { method: 'POST', path: '/inventory', description: 'Add inventory item', scopes: ['write', 'inventory'] },
      { method: 'GET', path: '/inventory/:id', description: 'Get inventory item details', scopes: ['read', 'inventory'] },
      { method: 'PATCH', path: '/inventory/:id', description: 'Update inventory item', scopes: ['write', 'inventory'] },
      { method: 'DELETE', path: '/inventory/:id', description: 'Delete inventory item', scopes: ['delete', 'inventory'] },
      { method: 'POST', path: '/inventory/sync', description: 'Sync inventory from external source', scopes: ['write', 'inventory'] },
    ],
  },
  {
    category: 'Trends',
    endpoints: [
      { method: 'GET', path: '/trends', description: 'List detected trends', scopes: ['read'] },
      { method: 'GET', path: '/trends/:id', description: 'Get trend details with analysis', scopes: ['read'] },
      { method: 'POST', path: '/trends/:id/save', description: 'Save a trend for tracking', scopes: ['write'] },
      { method: 'GET', path: '/trends/saved', description: 'List saved trends', scopes: ['read'] },
      { method: 'DELETE', path: '/trends/saved/:id', description: 'Remove saved trend', scopes: ['delete'] },
    ],
  },
  {
    category: 'Analytics',
    endpoints: [
      { method: 'GET', path: '/analytics/campaigns', description: 'Campaign performance metrics', scopes: ['read', 'analytics'] },
      { method: 'GET', path: '/analytics/inventory', description: 'Inventory analytics', scopes: ['read', 'analytics'] },
      { method: 'GET', path: '/analytics/trends', description: 'Trend performance data', scopes: ['read', 'analytics'] },
      { method: 'GET', path: '/analytics/revenue', description: 'Revenue forecasts', scopes: ['read', 'analytics'] },
    ],
  },
  {
    category: 'Content',
    endpoints: [
      { method: 'POST', path: '/content/generate', description: 'Generate content with AI', scopes: ['write'] },
      { method: 'GET', path: '/content', description: 'List generated content', scopes: ['read'] },
      { method: 'GET', path: '/content/:id', description: 'Get content details', scopes: ['read'] },
      { method: 'POST', path: '/content/:id/variants', description: 'Generate content variants', scopes: ['write'] },
    ],
  },
  {
    category: 'Brand',
    endpoints: [
      { method: 'GET', path: '/brand', description: 'Get brand profile', scopes: ['read'] },
      { method: 'PATCH', path: '/brand', description: 'Update brand profile', scopes: ['write'] },
      { method: 'GET', path: '/brand/dna', description: 'Get Brand DNA profile', scopes: ['read'] },
      { method: 'POST', path: '/brand/dna/analyze', description: 'Analyze and update Brand DNA', scopes: ['write'] },
    ],
  },
];

const CODE_EXAMPLES = {
  curl: `# List all campaigns
curl -X GET "${API_BASE_URL}/campaigns" \\
  -H "Authorization: Bearer inst_your_token_here" \\
  -H "Content-Type: application/json"

# Create a new campaign
curl -X POST "${API_BASE_URL}/campaigns" \\
  -H "Authorization: Bearer inst_your_token_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Summer Sale 2024",
    "total_budget": 5000,
    "daily_budget": 200,
    "platform": "meta"
  }'`,

  javascript: `// Using fetch
const API_KEY = 'inst_your_token_here';
const BASE_URL = '${API_BASE_URL}';

// List all campaigns
const response = await fetch(\`\${BASE_URL}/campaigns\`, {
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json',
  },
});
const campaigns = await response.json();

// Create a new campaign
const newCampaign = await fetch(\`\${BASE_URL}/campaigns\`, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Summer Sale 2024',
    total_budget: 5000,
    daily_budget: 200,
    platform: 'meta',
  }),
}).then(res => res.json());`,

  python: `import requests

API_KEY = 'inst_your_token_here'
BASE_URL = '${API_BASE_URL}'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json',
}

# List all campaigns
response = requests.get(f'{BASE_URL}/campaigns', headers=headers)
campaigns = response.json()

# Create a new campaign
new_campaign = requests.post(
    f'{BASE_URL}/campaigns',
    headers=headers,
    json={
        'name': 'Summer Sale 2024',
        'total_budget': 5000,
        'daily_budget': 200,
        'platform': 'meta',
    }
).json()`,

  php: `<?php
$api_key = 'inst_your_token_here';
$base_url = '${API_BASE_URL}';

// List all campaigns
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$base_url/campaigns");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $api_key",
    "Content-Type: application/json"
]);
$campaigns = json_decode(curl_exec($ch), true);
curl_close($ch);

// Create a new campaign
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$base_url/campaigns");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $api_key",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'name' => 'Summer Sale 2024',
    'total_budget' => 5000,
    'daily_budget' => 200,
    'platform' => 'meta'
]));
$new_campaign = json_decode(curl_exec($ch), true);
curl_close($ch);`,
};

const WEBHOOK_VERIFICATION = {
  nodejs: `const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  const providedSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(providedSignature)
  );
}

// Express.js example
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-instincts-signature'];
  const payload = req.body.toString();
  
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(payload);
  console.log('Received event:', event.type);
  
  // Handle the event
  switch (event.type) {
    case 'campaign.created':
      // Handle campaign creation
      break;
    case 'trend.detected':
      // Handle new trend
      break;
  }
  
  res.status(200).send('OK');
});`,

  python: `import hmac
import hashlib

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    provided_signature = signature.replace('sha256=', '')
    
    return hmac.compare_digest(expected_signature, provided_signature)

# Flask example
from flask import Flask, request, abort

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Instincts-Signature', '')
    payload = request.get_data()
    
    if not verify_webhook_signature(payload, signature, WEBHOOK_SECRET):
        abort(401, 'Invalid signature')
    
    event = request.get_json()
    print(f"Received event: {event['type']}")
    
    # Handle the event
    if event['type'] == 'campaign.created':
        # Handle campaign creation
        pass
    elif event['type'] == 'trend.detected':
        # Handle new trend
        pass
    
    return 'OK', 200`,

  php: `<?php
function verifyWebhookSignature($payload, $signature, $secret) {
    $expectedSignature = hash_hmac('sha256', $payload, $secret);
    $providedSignature = str_replace('sha256=', '', $signature);
    
    return hash_equals($expectedSignature, $providedSignature);
}

// Handle webhook
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_INSTINCTS_SIGNATURE'] ?? '';

if (!verifyWebhookSignature($payload, $signature, WEBHOOK_SECRET)) {
    http_response_code(401);
    echo 'Invalid signature';
    exit;
}

$event = json_decode($payload, true);
error_log("Received event: " . $event['type']);

// Handle the event
switch ($event['type']) {
    case 'campaign.created':
        // Handle campaign creation
        break;
    case 'trend.detected':
        // Handle new trend
        break;
}

http_response_code(200);
echo 'OK';`,
};

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    POST: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    PATCH: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    DELETE: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  return (
    <Badge variant="outline" className={`font-mono text-xs ${colors[method] || ''}`}>
      {method}
    </Badge>
  );
}

function EndpointCategory({ category, endpoints }: { category: string; endpoints: typeof ENDPOINTS[0]['endpoints'] }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-4 h-auto">
          <span className="font-semibold">{category}</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{endpoints.length} endpoints</Badge>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 px-4 pb-4">
          {endpoints.map((endpoint, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex items-center gap-3">
                <MethodBadge method={endpoint.method} />
                <code className="text-sm font-mono">{endpoint.path}</code>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                <div className="flex gap-1">
                  {endpoint.scopes.map((scope) => (
                    <Badge key={scope} variant="outline" className="text-xs">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function ApiDocs() {
  return (
    <PageContainer>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Book className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">API Documentation</h1>
          </div>
          <p className="text-muted-foreground">
            Complete reference for the Instincts AI REST API. Build powerful integrations with your commerce stack.
          </p>
        </div>

        {/* Quick Start */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Quick Start</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">1</span>
                Create API Token
              </div>
              <p className="text-sm text-muted-foreground">Generate a token in Settings → Developer</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">2</span>
                Add Authorization Header
              </div>
              <p className="text-sm text-muted-foreground">Include your token in all API requests</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">3</span>
                Make Requests
              </div>
              <p className="text-sm text-muted-foreground">Start integrating with the API endpoints</p>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Authentication</h2>
          </div>
          <p className="text-muted-foreground">
            All API requests require authentication using a Bearer token. Include your API token in the Authorization header:
          </p>
          <CodeBlock
            code="Authorization: Bearer inst_your_token_here"
            language="text"
          />
          <NoticeState
            type="caution"
            title="Security Note"
            description="Never expose your API token in client-side code. Always make API calls from your server."
          />

          <h3 className="font-semibold mt-6">Rate Limiting</h3>
          <p className="text-sm text-muted-foreground">
            API requests are rate limited based on your token configuration. Rate limit information is included in response headers:
          </p>
          <CodeBlock
            code={`X-RateLimit-Limit: 1000          # Maximum requests per window
X-RateLimit-Remaining: 950       # Remaining requests in current window
X-RateLimit-Reset: 1703123456    # Unix timestamp when limit resets`}
            language="text"
          />
        </div>

        {/* Endpoints */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">API Endpoints</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Base URL: <code className="bg-muted px-2 py-1 rounded text-sm">{API_BASE_URL}</code>
          </p>
          <div className="space-y-2 border rounded-lg divide-y">
            {ENDPOINTS.map((group) => (
              <EndpointCategory key={group.category} category={group.category} endpoints={group.endpoints} />
            ))}
          </div>
        </div>

        {/* Code Examples */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Code Examples</h2>
          </div>
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
            </TabsList>
            <TabsContent value="curl" className="mt-4">
              <CodeBlock code={CODE_EXAMPLES.curl} language="bash" />
            </TabsContent>
            <TabsContent value="javascript" className="mt-4">
              <CodeBlock code={CODE_EXAMPLES.javascript} language="javascript" />
            </TabsContent>
            <TabsContent value="python" className="mt-4">
              <CodeBlock code={CODE_EXAMPLES.python} language="python" />
            </TabsContent>
            <TabsContent value="php" className="mt-4">
              <CodeBlock code={CODE_EXAMPLES.php} language="php" />
            </TabsContent>
          </Tabs>
        </div>

        {/* Webhook Verification */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Webhook Signature Verification</h2>
          </div>
          <p className="text-muted-foreground">
            All webhook payloads include a signature header (<code className="bg-muted px-1 rounded">X-Instincts-Signature</code>) 
            that you should verify to ensure the request came from Instincts AI.
          </p>
          
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 space-y-2">
            <h4 className="font-medium text-blue-600 dark:text-blue-400">How it works</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>We compute an HMAC-SHA256 hash of the raw request body using your webhook secret</li>
              <li>The signature is sent in the <code className="bg-muted px-1 rounded">X-Instincts-Signature</code> header as <code className="bg-muted px-1 rounded">sha256=&lt;hash&gt;</code></li>
              <li>You compute the same hash and compare it to verify authenticity</li>
            </ol>
          </div>

          <Tabs defaultValue="nodejs" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="nodejs">Node.js</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
            </TabsList>
            <TabsContent value="nodejs" className="mt-4">
              <CodeBlock code={WEBHOOK_VERIFICATION.nodejs} language="javascript" />
            </TabsContent>
            <TabsContent value="python" className="mt-4">
              <CodeBlock code={WEBHOOK_VERIFICATION.python} language="python" />
            </TabsContent>
            <TabsContent value="php" className="mt-4">
              <CodeBlock code={WEBHOOK_VERIFICATION.php} language="php" />
            </TabsContent>
          </Tabs>
        </div>

        {/* Webhook Events */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Webhook Events</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Configure webhooks to receive real-time notifications when events occur in your account.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { event: 'campaign.created', description: 'A new campaign was created' },
              { event: 'campaign.updated', description: 'A campaign was modified' },
              { event: 'campaign.deployed', description: 'A campaign was deployed' },
              { event: 'campaign.paused', description: 'A campaign was paused' },
              { event: 'trend.detected', description: 'A new trend was detected' },
              { event: 'trend.saved', description: 'A trend was saved for tracking' },
              { event: 'inventory.low', description: 'Inventory fell below threshold' },
              { event: 'inventory.synced', description: 'Inventory sync completed' },
              { event: 'content.generated', description: 'AI content was generated' },
              { event: 'asset.created', description: 'A creative asset was created' },
              { event: 'brand.updated', description: 'Brand settings were updated' },
            ].map((item) => (
              <div key={item.event} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <code className="text-sm font-mono text-primary">{item.event}</code>
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </div>
            ))}
          </div>

          <h3 className="font-semibold mt-6">Webhook Payload Format</h3>
          <CodeBlock
            code={`{
  "id": "evt_abc123",
  "type": "campaign.created",
  "created_at": "2024-01-15T10:30:00Z",
  "data": {
    "id": "camp_xyz789",
    "name": "Summer Sale 2024",
    "status": "draft",
    "total_budget": 5000,
    "daily_budget": 200
  }
}`}
            language="json"
          />
        </div>

        {/* Error Codes */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Error Codes</h2>
          <div className="space-y-2">
            {[
              { code: 400, name: 'Bad Request', description: 'Invalid request parameters' },
              { code: 401, name: 'Unauthorized', description: 'Invalid or missing API token' },
              { code: 403, name: 'Forbidden', description: 'Token lacks required scope' },
              { code: 404, name: 'Not Found', description: 'Resource not found' },
              { code: 429, name: 'Too Many Requests', description: 'Rate limit exceeded' },
              { code: 500, name: 'Internal Server Error', description: 'Server error, try again later' },
            ].map((error) => (
              <div key={error.code} className="flex items-center gap-4 p-3 rounded-lg border bg-card/50">
                <Badge variant={error.code >= 500 ? 'destructive' : error.code >= 400 ? 'outline' : 'default'}>
                  {error.code}
                </Badge>
                <span className="font-medium">{error.name}</span>
                <span className="text-sm text-muted-foreground">{error.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="text-center py-8 text-muted-foreground">
          <p>
            Need help? Contact our developer support team or check out more examples on{' '}
            <a href="#" className="text-primary hover:underline inline-flex items-center gap-1">
              GitHub <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
