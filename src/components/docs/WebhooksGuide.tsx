import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Webhook, Shield, CheckCircle2 } from "lucide-react";
import { NoticeState } from "@/components/shared";

export const WebhooksGuide = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Webhooks</h2>
        <p className="text-muted-foreground">
          Receive real-time notifications when events occur in your Instincts AI account
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            Webhook Overview
          </CardTitle>
          <CardDescription>
            Webhooks allow external systems to receive notifications when events occur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NoticeState
            type="info"
            title="How it works"
            description="When you configure a webhook, Instincts AI sends HTTP POST requests to your specified URL whenever subscribed events occur. Each request includes event data and a signature for verification."
          />

          <div className="space-y-2">
            <h4 className="font-semibold">Creating a Webhook</h4>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Navigate to Settings → Developer → Webhooks</li>
              <li>Click "Add Webhook"</li>
              <li>Enter your endpoint URL (must be HTTPS)</li>
              <li>Select the events you want to subscribe to</li>
              <li>Save and copy the generated secret for verification</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Events */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Payload</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">campaign.created</TableCell>
                <TableCell>A new campaign was created</TableCell>
                <TableCell>Campaign object</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">campaign.updated</TableCell>
                <TableCell>A campaign was updated</TableCell>
                <TableCell>Campaign object with changes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">campaign.status_changed</TableCell>
                <TableCell>Campaign status changed (active/paused)</TableCell>
                <TableCell>Campaign ID, old/new status</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">trend.saved</TableCell>
                <TableCell>A trend was saved</TableCell>
                <TableCell>Saved trend object</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">inventory.low_stock</TableCell>
                <TableCell>Product stock fell below threshold</TableCell>
                <TableCell>Product ID, current stock</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">content.generated</TableCell>
                <TableCell>AI content was generated</TableCell>
                <TableCell>Content type, ID</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">visual_forge.completed</TableCell>
                <TableCell>Visual Forge request completed</TableCell>
                <TableCell>Request ID, deliverables</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payload Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Payload Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            All webhook payloads follow this structure:
          </p>
          <pre className="p-4 rounded-lg bg-muted/50 font-mono text-sm overflow-x-auto">
{`{
  "id": "evt_abc123",
  "type": "campaign.created",
  "created_at": "2024-01-15T10:30:00Z",
  "org_id": "org_xyz789",
  "data": {
    // Event-specific data
    "id": "camp_def456",
    "name": "Summer Sale",
    "status": "active"
  }
}`}
          </pre>
        </CardContent>
      </Card>

      {/* Signature Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Signature Verification
          </CardTitle>
          <CardDescription>
            Always verify webhook signatures to ensure requests are from Instincts AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NoticeState
            type="caution"
            title="Important"
            description="Always verify webhook signatures to ensure requests are genuinely from Instincts AI. Never process unverified webhooks."
          />
          <p className="text-sm text-muted-foreground">
            Each webhook request includes an <code className="px-1 py-0.5 rounded bg-muted">X-Webhook-Signature</code> header 
            containing an HMAC-SHA256 signature of the request body.
          </p>

          <div className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-2">Node.js</Badge>
              <pre className="p-4 rounded-lg bg-muted/50 font-mono text-xs overflow-x-auto">
{`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// In your webhook handler:
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const isValid = verifyWebhook(
    JSON.stringify(req.body),
    signature,
    process.env.WEBHOOK_SECRET
  );
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook...
  res.status(200).send('OK');
});`}
              </pre>
            </div>

            <div>
              <Badge variant="outline" className="mb-2">Python</Badge>
              <pre className="p-4 rounded-lg bg-muted/50 font-mono text-xs overflow-x-auto">
{`import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected)

# In your webhook handler:
@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.get_data(as_text=True)
    
    if not verify_webhook(payload, signature, WEBHOOK_SECRET):
        return 'Invalid signature', 401
    
    # Process the webhook...
    return 'OK', 200`}
              </pre>
            </div>

            <div>
              <Badge variant="outline" className="mb-2">PHP</Badge>
              <pre className="p-4 rounded-lg bg-muted/50 font-mono text-xs overflow-x-auto">
{`<?php
function verifyWebhook($payload, $signature, $secret) {
    $expected = hash_hmac('sha256', $payload, $secret);
    return hash_equals($expected, $signature);
}

// In your webhook handler:
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'];

if (!verifyWebhook($payload, $signature, WEBHOOK_SECRET)) {
    http_response_code(401);
    exit('Invalid signature');
}

// Process the webhook...
http_response_code(200);
echo 'OK';`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "Always verify webhook signatures before processing",
            "Respond with 2xx status quickly (within 5 seconds)",
            "Process webhooks asynchronously for long operations",
            "Implement idempotency using the event ID",
            "Log all received webhooks for debugging",
            "Set up retry handling for failed deliveries",
          ].map((practice, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm text-muted-foreground">{practice}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
