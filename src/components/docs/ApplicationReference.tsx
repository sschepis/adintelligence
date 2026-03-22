import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Palette, Shield, Users, Database, Key } from "lucide-react";

interface ApplicationReferenceProps {
  activeSection: string;
}

export const ApplicationReference = ({ activeSection }: ApplicationReferenceProps) => {
  if (activeSection === "app-overview") {
    return <AppOverview />;
  }
  if (activeSection === "brand-management") {
    return <BrandManagement />;
  }
  if (activeSection === "security") {
    return <SecurityReference />;
  }
  return <AppOverview />;
};

const AppOverview = () => (
  <div className="space-y-8">
    <div>
      <h2 className="text-2xl font-bold mb-2">Application Overview</h2>
      <p className="text-muted-foreground">
        Complete reference for the Instincts AI platform architecture and features
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Platform Architecture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Instincts AI is a Predictive Commerce Engine built on modern cloud infrastructure. 
          The platform integrates multiple data sources, AI models, and deployment capabilities 
          into a unified workflow.
        </p>

        <div className="space-y-4">
          <h4 className="font-semibold">Core Components</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Data Sources</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Signal Intelligence</TableCell>
                <TableCell>Trend detection and analysis engine</TableCell>
                <TableCell>DataForSEO, Apify (TikTok, Instagram, Pinterest)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Commerce Loop</TableCell>
                <TableCell>Inventory-to-trend matching</TableCell>
                <TableCell>Product catalog, Rainforest API</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Creative Engine</TableCell>
                <TableCell>AI content and asset generation</TableCell>
                <TableCell>Gemini 2.5 Flash, Brand DNA</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Simulation Studio</TableCell>
                <TableCell>Campaign testing with AI personas</TableCell>
                <TableCell>Custom personas, AI reactions</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Deployment Hub</TableCell>
                <TableCell>Campaign management and optimization</TableCell>
                <TableCell>Campaign database, real-time metrics</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Data Model
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Key Fields</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Organizations</TableCell>
              <TableCell>Top-level account container</TableCell>
              <TableCell>name, website_url, subscription_status, brand_dna</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Brands</TableCell>
              <TableCell>Individual brand within organization</TableCell>
              <TableCell>name, colors, products, taxonomy, brand_voice</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Campaigns</TableCell>
              <TableCell>Marketing campaign record</TableCell>
              <TableCell>name, budget, status, metrics (impressions, clicks, etc.)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Saved Trends</TableCell>
              <TableCell>User-saved trend data</TableCell>
              <TableCell>trend_name, platform, velocity, ai_analysis</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Personas</TableCell>
              <TableCell>Custom simulation personas</TableCell>
              <TableCell>name, traits, demographics, buying_behavior</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">API Tokens</TableCell>
              <TableCell>Developer API authentication</TableCell>
              <TableCell>name, scopes, rate_limits, token_hash</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Subscription Tiers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Features</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Starter</TableCell>
              <TableCell>$49/month</TableCell>
              <TableCell>Basic trend detection, 1 brand, limited API</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Growth</TableCell>
              <TableCell>$149/month</TableCell>
              <TableCell>Full features, 3 brands, standard API</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Enterprise</TableCell>
              <TableCell>$499/month</TableCell>
              <TableCell>Unlimited brands, priority support, custom integrations</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

const BrandManagement = () => (
  <div className="space-y-8">
    <div>
      <h2 className="text-2xl font-bold mb-2">Brand Management</h2>
      <p className="text-muted-foreground">
        Complete reference for multi-brand architecture and brand configuration
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Multi-Brand Architecture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Organizations can manage multiple brands with complete data isolation. Each brand has its own:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Badge variant="outline">Products</Badge>
            <span>Separate product catalog and taxonomy</span>
          </li>
          <li className="flex items-center gap-2">
            <Badge variant="outline">Campaigns</Badge>
            <span>Independent campaign management</span>
          </li>
          <li className="flex items-center gap-2">
            <Badge variant="outline">Brand DNA</Badge>
            <span>Distinct voice, personality, and guardrails</span>
          </li>
          <li className="flex items-center gap-2">
            <Badge variant="outline">Colors</Badge>
            <span>Unique visual identity</span>
          </li>
        </ul>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Brand DNA Components</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead>Fields</TableHead>
              <TableHead>Usage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Brand Voice</TableCell>
              <TableCell>tone_spectrum, vocabulary, emotional_signature</TableCell>
              <TableCell>Controls AI content tone and word choice</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Brand Personality</TableCell>
              <TableCell>archetype, traits, communication_style</TableCell>
              <TableCell>Influences overall content character</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Brand Story</TableCell>
              <TableCell>mission, vision, tagline, origin</TableCell>
              <TableCell>Provides context for messaging</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Guardrails</TableCell>
              <TableCell>forbidden_words, avoided_topics, visual_restrictions</TableCell>
              <TableCell>Prevents off-brand content generation</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Brand Settings Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border space-y-2">
            <h4 className="font-semibold">Visual Identity</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Primary, secondary, accent colors</li>
              <li>• Logo upload and management</li>
              <li>• Typography settings</li>
              <li>• WCAG accessibility checker</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border space-y-2">
            <h4 className="font-semibold">Product Catalog</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Manual product entry</li>
              <li>• CSV/Excel bulk import</li>
              <li>• Shopify sync integration</li>
              <li>• Category/taxonomy management</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border space-y-2">
            <h4 className="font-semibold">Data Management</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• JSON export/import</li>
              <li>• Version history with restore</li>
              <li>• Reset & rescan website</li>
              <li>• Style guide PDF generation</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border space-y-2">
            <h4 className="font-semibold">Asset Library</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Logo variations</li>
              <li>• Brand fonts</li>
              <li>• Image assets</li>
              <li>• Organized by category</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const SecurityReference = () => (
  <div className="space-y-8">
    <div>
      <h2 className="text-2xl font-bold mb-2">Security & Permissions</h2>
      <p className="text-muted-foreground">
        User roles, permissions, and security configuration
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          User Roles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Owner</TableCell>
              <TableCell>Organization owner</TableCell>
              <TableCell>Full access to all features and settings</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Admin</TableCell>
              <TableCell>Organization administrator</TableCell>
              <TableCell>Manage users, brands, billing</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Member</TableCell>
              <TableCell>Standard team member</TableCell>
              <TableCell>Create/edit campaigns, content, view analytics</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Viewer</TableCell>
              <TableCell>Read-only access</TableCell>
              <TableCell>View dashboards, reports, campaigns</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Brand Access Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Users can be granted access to specific brands within an organization:
        </p>
        <ul className="space-y-2 text-sm">
          <li><strong>All Brands:</strong> Access to all current and future brands</li>
          <li><strong>Specific Brands:</strong> Access limited to selected brands only</li>
          <li><strong>Brand Switching:</strong> Users can switch between accessible brands using the brand selector</li>
        </ul>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          API Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Token Hashing</TableCell>
              <TableCell>API tokens are SHA-256 hashed before storage</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Scoped Access</TableCell>
              <TableCell>Tokens can be limited to specific endpoints</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Rate Limiting</TableCell>
              <TableCell>Configurable per-token rate limits</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Expiration</TableCell>
              <TableCell>Optional token expiration dates</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Revocation</TableCell>
              <TableCell>Instant token revocation capability</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);
