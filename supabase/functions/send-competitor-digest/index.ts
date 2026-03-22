import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DigestRequest {
  email: string;
  digestType: "daily" | "weekly";
  organizationName?: string;
  data: {
    competitors: Array<{
      domain: string;
      estimatedAdSpend: string;
      shareOfVoice: number;
      estimatedTraffic: number;
    }>;
    whiteSpaces: Array<{
      keyword: string;
      opportunity: string;
      searchVolume: number;
      cpc: number;
    }>;
    alerts: Array<{
      type: string;
      competitor: string;
      message: string;
      change: string;
      severity: string;
    }>;
    marketOverview?: {
      totalMarketVolume: number;
      averageCpc: number;
      topCategories: string[];
    };
  };
  periodStart: string;
  periodEnd: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, digestType, organizationName, data, periodStart, periodEnd }: DigestRequest = await req.json();

    console.log(`Sending ${digestType} digest to ${email}`);

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const formatNumber = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num.toString();
    };

    const highPriorityAlerts = data.alerts.filter(a => a.severity === "high");
    const topOpportunities = data.whiteSpaces.filter(w => w.opportunity === "high").slice(0, 3);

    const alertRows = data.alerts.slice(0, 5).map(alert => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ${
            alert.severity === "high" ? "#fee2e2" : alert.severity === "medium" ? "#fef3c7" : "#e5e7eb"
          }; color: ${
            alert.severity === "high" ? "#dc2626" : alert.severity === "medium" ? "#d97706" : "#6b7280"
          };">
            ${alert.severity.toUpperCase()}
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 500;">${alert.competitor}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${alert.message}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: ${
          alert.change.startsWith("+") ? "#10b981" : "#ef4444"
        };">${alert.change}</td>
      </tr>
    `).join("");

    const competitorRows = data.competitors.slice(0, 5).map(comp => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 500;">${comp.domain}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${comp.estimatedAdSpend}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${comp.shareOfVoice}%</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${formatNumber(comp.estimatedTraffic)}</td>
      </tr>
    `).join("");

    const opportunityRows = topOpportunities.map(opp => `
      <div style="background: #f0fdf4; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
        <div style="font-weight: 600; color: #166534;">${opp.keyword}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
          Volume: ${formatNumber(opp.searchVolume)} | CPC: $${opp.cpc.toFixed(2)}
        </div>
      </div>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; padding: 24px; color: white; margin-bottom: 24px;">
          <h1 style="margin: 0 0 8px 0; font-size: 24px;">
            ${digestType === "daily" ? "📊 Daily" : "📈 Weekly"} Competitor Intelligence
          </h1>
          <p style="margin: 0; opacity: 0.9; font-size: 14px;">
            ${organizationName ? `${organizationName} • ` : ""}${formatDate(periodStart)} - ${formatDate(periodEnd)}
          </p>
        </div>

        <!-- Summary Stats -->
        <div style="display: flex; gap: 12px; margin-bottom: 24px;">
          <div style="flex: 1; background: #f8fafc; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #6366f1;">${data.competitors.length}</div>
            <div style="font-size: 12px; color: #6b7280;">Competitors</div>
          </div>
          <div style="flex: 1; background: #f8fafc; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: ${highPriorityAlerts.length > 0 ? "#ef4444" : "#10b981"};">${data.alerts.length}</div>
            <div style="font-size: 12px; color: #6b7280;">Alerts</div>
          </div>
          <div style="flex: 1; background: #f8fafc; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #10b981;">${topOpportunities.length}</div>
            <div style="font-size: 12px; color: #6b7280;">Opportunities</div>
          </div>
        </div>

        ${highPriorityAlerts.length > 0 ? `
        <!-- High Priority Alert Banner -->
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 8px; color: #dc2626; font-weight: 600; margin-bottom: 8px;">
            ⚠️ ${highPriorityAlerts.length} High-Priority Alert${highPriorityAlerts.length > 1 ? "s" : ""}
          </div>
          <p style="margin: 0; font-size: 14px; color: #7f1d1d;">
            ${highPriorityAlerts[0].message}
          </p>
        </div>
        ` : ""}

        <!-- Competitor Alerts -->
        ${data.alerts.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; margin: 0 0 12px 0;">🔔 Recent Alerts</h2>
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">Severity</th>
                <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">Competitor</th>
                <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">Change</th>
                <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">Impact</th>
              </tr>
            </thead>
            <tbody>
              ${alertRows}
            </tbody>
          </table>
        </div>
        ` : ""}

        <!-- Competitor Landscape -->
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; margin: 0 0 12px 0;">🏢 Competitor Landscape</h2>
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">Competitor</th>
                <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">Ad Spend</th>
                <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">SOV</th>
                <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">Traffic</th>
              </tr>
            </thead>
            <tbody>
              ${competitorRows}
            </tbody>
          </table>
        </div>

        <!-- White Space Opportunities -->
        ${topOpportunities.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; margin: 0 0 12px 0;">🎯 Top Opportunities</h2>
          ${opportunityRows}
        </div>
        ` : ""}

        <!-- Market Overview -->
        ${data.marketOverview ? `
        <div style="background: #f0f9ff; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0369a1;">Market Overview</h3>
          <div style="display: flex; gap: 24px;">
            <div>
              <div style="font-size: 12px; color: #6b7280;">Total Volume</div>
              <div style="font-weight: 600;">${formatNumber(data.marketOverview.totalMarketVolume)}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6b7280;">Avg CPC</div>
              <div style="font-weight: 600;">$${data.marketOverview.averageCpc.toFixed(2)}</div>
            </div>
          </div>
        </div>
        ` : ""}

        <!-- Footer -->
        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p>This is your ${digestType} competitor intelligence digest from Instincts AI.</p>
          <p style="margin-top: 8px;">
            <a href="#" style="color: #6366f1; text-decoration: none;">View Full Dashboard</a> • 
            <a href="#" style="color: #6b7280; text-decoration: none;">Manage Preferences</a>
          </p>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Instincts AI <digest@resend.dev>",
      to: [email],
      subject: `${digestType === "daily" ? "📊 Daily" : "📈 Weekly"} Competitor Intelligence - ${formatDate(periodEnd)}`,
      html,
    });

    console.log("Digest email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending digest:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
