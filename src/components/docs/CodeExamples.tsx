import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const CodeExamples = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Code Examples</h2>
        <p className="text-muted-foreground">
          Sample implementations in multiple languages to help you integrate with the Instincts AI API
        </p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Make your first API call in minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl" className="space-y-4">
            <TabsList>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
            </TabsList>

            <TabsContent value="curl">
              <CodeBlock
                language="bash"
                code={`# List all campaigns
curl -X GET "https://smlcnrwkhiyvwkpjxhjs.supabase.co/functions/v1/api-gateway/campaigns" \\
  -H "X-API-Key: your_api_token_here" \\
  -H "Content-Type: application/json"

# Create a new campaign
curl -X POST "https://smlcnrwkhiyvwkpjxhjs.supabase.co/functions/v1/api-gateway/campaigns" \\
  -H "X-API-Key: your_api_token_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Summer Sale Campaign",
    "total_budget": 5000,
    "daily_budget": 250,
    "platform": "meta"
  }'`}
              />
            </TabsContent>

            <TabsContent value="javascript">
              <CodeBlock
                language="javascript"
                code={`// Initialize the API client
const API_BASE = 'https://smlcnrwkhiyvwkpjxhjs.supabase.co/functions/v1/api-gateway';
const API_KEY = 'your_api_token_here';

// List all campaigns
async function listCampaigns() {
  const response = await fetch(\`\${API_BASE}/campaigns\`, {
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

// Create a new campaign
async function createCampaign(data) {
  const response = await fetch(\`\${API_BASE}/campaigns\`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

// Usage
const campaigns = await listCampaigns();
console.log(campaigns);

const newCampaign = await createCampaign({
  name: 'Summer Sale Campaign',
  total_budget: 5000,
  daily_budget: 250,
  platform: 'meta'
});
console.log(newCampaign);`}
              />
            </TabsContent>

            <TabsContent value="python">
              <CodeBlock
                language="python"
                code={`import requests

API_BASE = 'https://smlcnrwkhiyvwkpjxhjs.supabase.co/functions/v1/api-gateway'
API_KEY = 'your_api_token_here'

headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
}

# List all campaigns
def list_campaigns():
    response = requests.get(f'{API_BASE}/campaigns', headers=headers)
    return response.json()

# Create a new campaign
def create_campaign(data):
    response = requests.post(
        f'{API_BASE}/campaigns',
        headers=headers,
        json=data
    )
    return response.json()

# Usage
campaigns = list_campaigns()
print(campaigns)

new_campaign = create_campaign({
    'name': 'Summer Sale Campaign',
    'total_budget': 5000,
    'daily_budget': 250,
    'platform': 'meta'
})
print(new_campaign)`}
              />
            </TabsContent>

            <TabsContent value="php">
              <CodeBlock
                language="php"
                code={`<?php
define('API_BASE', 'https://smlcnrwkhiyvwkpjxhjs.supabase.co/functions/v1/api-gateway');
define('API_KEY', 'your_api_token_here');

function apiRequest($endpoint, $method = 'GET', $data = null) {
    $ch = curl_init(API_BASE . $endpoint);
    
    $headers = [
        'X-API-Key: ' . API_KEY,
        'Content-Type: application/json'
    ];
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// List all campaigns
$campaigns = apiRequest('/campaigns');
print_r($campaigns);

// Create a new campaign
$newCampaign = apiRequest('/campaigns', 'POST', [
    'name' => 'Summer Sale Campaign',
    'total_budget' => 5000,
    'daily_budget' => 250,
    'platform' => 'meta'
]);
print_r($newCampaign);`}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Common Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Common Use Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sync Inventory */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge>Inventory Sync</Badge>
              <span className="text-sm text-muted-foreground">Keep your inventory in sync with external systems</span>
            </div>
            <CodeBlock
              language="javascript"
              code={`// Sync inventory from your system to Instincts AI
async function syncInventory(products) {
  const response = await fetch(\`\${API_BASE}/inventory\`, {
    method: 'PUT',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      products: products.map(p => ({
        id: p.sku,
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.quantity,
        image_url: p.image
      }))
    })
  });
  
  if (!response.ok) {
    throw new Error('Inventory sync failed');
  }
  
  return response.json();
}

// Example: Sync after inventory update
const updatedProducts = await fetchFromYourSystem();
await syncInventory(updatedProducts);`}
            />
          </div>

          {/* Campaign Automation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge>Campaign Automation</Badge>
              <span className="text-sm text-muted-foreground">Automatically create campaigns from trends</span>
            </div>
            <CodeBlock
              language="javascript"
              code={`// Automated campaign creation based on saved trends
async function createCampaignsFromTrends() {
  // Get saved trends
  const trends = await fetch(\`\${API_BASE}/trends\`, {
    headers: { 'X-API-Key': API_KEY }
  }).then(r => r.json());
  
  // Filter high-velocity trends
  const hotTrends = trends.filter(t => 
    t.velocity === 'rising' && t.sentiment_score > 0.7
  );
  
  // Create campaigns for each trend
  for (const trend of hotTrends) {
    await fetch(\`\${API_BASE}/campaigns\`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: \`Trend: \${trend.trend_name}\`,
        total_budget: 1000,
        daily_budget: 100,
        platform: 'meta'
      })
    });
  }
}

// Run daily
createCampaignsFromTrends();`}
            />
          </div>

          {/* Analytics Dashboard */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge>Analytics Integration</Badge>
              <span className="text-sm text-muted-foreground">Pull analytics into your own dashboard</span>
            </div>
            <CodeBlock
              language="python"
              code={`import requests
from datetime import datetime

class InstinctsAnalytics:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://smlcnrwkhiyvwkpjxhjs.supabase.co/functions/v1/api-gateway'
    
    def get_analytics(self):
        """Fetch aggregated analytics."""
        response = requests.get(
            f'{self.base_url}/analytics',
            headers={'X-API-Key': self.api_key}
        )
        return response.json()
    
    def get_campaigns(self):
        """Fetch all campaigns with metrics."""
        response = requests.get(
            f'{self.base_url}/campaigns',
            headers={'X-API-Key': self.api_key}
        )
        return response.json()
    
    def generate_report(self):
        """Generate a performance report."""
        analytics = self.get_analytics()
        campaigns = self.get_campaigns()
        
        return {
            'generated_at': datetime.now().isoformat(),
            'summary': analytics,
            'top_campaigns': sorted(
                campaigns,
                key=lambda c: c.get('conversions', 0),
                reverse=True
            )[:5]
        }

# Usage
client = InstinctsAnalytics('your_api_token_here')
report = client.generate_report()
print(report)`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Handling */}
      <Card>
        <CardHeader>
          <CardTitle>Error Handling</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            language="javascript"
            code={`// Robust API client with error handling and retries
class InstinctsAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://smlcnrwkhiyvwkpjxhjs.supabase.co/functions/v1/api-gateway';
    this.maxRetries = 3;
  }

  async request(endpoint, options = {}) {
    const url = \`\${this.baseUrl}\${endpoint}\`;
    const headers = {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
      ...options.headers
    };

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, { ...options, headers });
        
        // Check rate limit headers
        const remaining = response.headers.get('X-RateLimit-Remaining');
        if (remaining && parseInt(remaining) < 10) {
          console.warn('Rate limit nearly exhausted:', remaining);
        }

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 60;
          console.log(\`Rate limited. Waiting \${retryAfter}s...\`);
          await this.sleep(retryAfter * 1000);
          continue;
        }

        // Handle errors
        if (!response.ok) {
          const error = await response.json();
          throw new APIError(error.code, error.error, response.status);
        }

        return response.json();
      } catch (error) {
        if (attempt === this.maxRetries) throw error;
        await this.sleep(1000 * attempt); // Exponential backoff
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Convenience methods
  getCampaigns() { return this.request('/campaigns'); }
  getAnalytics() { return this.request('/analytics'); }
  getTrends() { return this.request('/trends'); }
}

class APIError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// Usage
const api = new InstinctsAPI('your_api_token_here');
try {
  const campaigns = await api.getCampaigns();
} catch (error) {
  if (error instanceof APIError) {
    console.error(\`API Error [\${error.code}]: \${error.message}\`);
  }
}`}
          />
        </CardContent>
      </Card>
    </div>
  );
};

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock = ({ language, code }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      <pre className="p-4 rounded-lg bg-muted/50 font-mono text-xs overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};
