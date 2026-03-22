import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Shield, Clock, AlertCircle } from "lucide-react";

export const ApiReference = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">API Reference</h2>
        <p className="text-muted-foreground">
          Complete REST API documentation for programmatic access to Instincts AI
        </p>
      </div>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Authentication
          </CardTitle>
          <CardDescription>
            All API requests require authentication via API token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm">
            <p className="text-muted-foreground mb-2"># Include your API key in the header</p>
            <p>X-API-Key: your_api_token_here</p>
            <p className="text-muted-foreground mt-2"># Or use Bearer token</p>
            <p>Authorization: Bearer your_api_token_here</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Generating API Tokens</h4>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Navigate to Settings → Developer section</li>
              <li>Click "Create New Token"</li>
              <li>Set token name, scopes, and optional expiration</li>
              <li>Copy the token immediately (it won't be shown again)</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Base URL */}
      <Card>
        <CardHeader>
          <CardTitle>Base URL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm">
            https://smlcnrwkhiyvwkpjxhjs.supabase.co/functions/v1/api-gateway
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Rate Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Rate limits are configurable per token. Default limits:
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Requests/Hour</TableHead>
                <TableHead>Window</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Starter</TableCell>
                <TableCell>100</TableCell>
                <TableCell>1 hour</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Growth</TableCell>
                <TableCell>1,000</TableCell>
                <TableCell>1 hour</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Enterprise</TableCell>
                <TableCell>10,000</TableCell>
                <TableCell>1 hour</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="space-y-2">
            <h4 className="font-semibold">Rate Limit Headers</h4>
            <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm space-y-1">
              <p>X-RateLimit-Limit: 1000</p>
              <p>X-RateLimit-Remaining: 999</p>
              <p>X-RateLimit-Reset: 2024-01-01T12:00:00Z</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="campaigns" className="space-y-4">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="brands">Brands</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="space-y-4">
              <EndpointDoc
                method="GET"
                path="/campaigns"
                description="List all campaigns for the organization"
                scopes={["campaigns:read"]}
                response={`[
  {
    "id": "uuid",
    "name": "Summer Sale Campaign",
    "status": "active",
    "total_budget": 5000,
    "daily_budget": 250,
    "spent": 1250,
    "impressions": 50000,
    "clicks": 2500,
    "conversions": 125
  }
]`}
              />
              <EndpointDoc
                method="GET"
                path="/campaigns/:id"
                description="Get a specific campaign by ID"
                scopes={["campaigns:read"]}
              />
              <EndpointDoc
                method="POST"
                path="/campaigns"
                description="Create a new campaign"
                scopes={["campaigns:write"]}
                body={`{
  "name": "New Campaign",
  "total_budget": 5000,
  "daily_budget": 250,
  "platform": "meta"
}`}
              />
              <EndpointDoc
                method="PUT"
                path="/campaigns/:id"
                description="Update an existing campaign"
                scopes={["campaigns:write"]}
              />
              <EndpointDoc
                method="DELETE"
                path="/campaigns/:id"
                description="Delete a campaign"
                scopes={["campaigns:write"]}
              />
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <EndpointDoc
                method="GET"
                path="/inventory"
                description="Get product inventory and taxonomy"
                scopes={["inventory:read"]}
                response={`{
  "products": [
    {
      "id": "sku-001",
      "name": "Summer Dress",
      "category": "Dresses",
      "price": 89.99,
      "stock": 150
    }
  ],
  "taxonomy": ["Dresses", "Tops", "Accessories"]
}`}
              />
              <EndpointDoc
                method="PUT"
                path="/inventory"
                description="Update inventory data"
                scopes={["inventory:write"]}
                body={`{
  "products": [...],
  "taxonomy": [...]
}`}
              />
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <EndpointDoc
                method="GET"
                path="/trends"
                description="Get saved trends for the organization"
                scopes={["trends:read"]}
                response={`[
  {
    "id": "uuid",
    "trend_name": "Coastal Grandmother",
    "platform": "tiktok",
    "velocity": "rising",
    "volume": "500K",
    "sentiment_score": 0.85,
    "ai_analysis": "..."
  }
]`}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <EndpointDoc
                method="GET"
                path="/analytics"
                description="Get aggregated analytics for all campaigns"
                scopes={["analytics:read"]}
                response={`{
  "impressions": 250000,
  "clicks": 12500,
  "conversions": 625,
  "spent": 7500,
  "active_campaigns": 5,
  "ctr": "5.00",
  "conversion_rate": "5.00"
}`}
              />
            </TabsContent>

            <TabsContent value="brands" className="space-y-4">
              <EndpointDoc
                method="GET"
                path="/brands"
                description="List all brands in the organization"
                scopes={["brands:read"]}
                response={`[
  {
    "id": "uuid",
    "name": "Main Brand",
    "website_url": "https://example.com",
    "primary_color": "#FF5733",
    "is_active": true
  }
]`}
              />
              <EndpointDoc
                method="GET"
                path="/brands/:id"
                description="Get a specific brand by ID"
                scopes={["brands:read"]}
              />
              <EndpointDoc
                method="PUT"
                path="/brands/:id"
                description="Update brand settings"
                scopes={["brands:write"]}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Error Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Error Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono">UNAUTHORIZED</TableCell>
                <TableCell>401</TableCell>
                <TableCell>Missing or invalid API key</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">TOKEN_EXPIRED</TableCell>
                <TableCell>401</TableCell>
                <TableCell>API token has expired</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">FORBIDDEN</TableCell>
                <TableCell>403</TableCell>
                <TableCell>Token lacks required scopes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">NOT_FOUND</TableCell>
                <TableCell>404</TableCell>
                <TableCell>Endpoint or resource not found</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">RATE_LIMITED</TableCell>
                <TableCell>429</TableCell>
                <TableCell>Rate limit exceeded</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">INTERNAL_ERROR</TableCell>
                <TableCell>500</TableCell>
                <TableCell>Internal server error</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

interface EndpointDocProps {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  scopes: string[];
  body?: string;
  response?: string;
}

const EndpointDoc = ({ method, path, description, scopes, body, response }: EndpointDocProps) => {
  const methodColors: Record<string, string> = {
    GET: "bg-green-500/10 text-green-600 border-green-500/20",
    POST: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    PUT: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    PATCH: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    DELETE: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <div className="p-4 rounded-lg border space-y-3">
      <div className="flex items-center gap-3">
        <Badge className={methodColors[method]}>{method}</Badge>
        <code className="text-sm font-mono">{path}</code>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Required scopes:</span>
        {scopes.map((scope) => (
          <Badge key={scope} variant="outline" className="text-xs">
            {scope}
          </Badge>
        ))}
      </div>
      {body && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Request Body:</p>
          <pre className="p-3 rounded bg-muted/50 text-xs overflow-x-auto">
            {body}
          </pre>
        </div>
      )}
      {response && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Response:</p>
          <pre className="p-3 rounded bg-muted/50 text-xs overflow-x-auto">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
};
