import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertEmailRequest {
  alert_type: string;
  service_name: string;
  message: string;
  severity: "info" | "warning" | "error" | "critical";
  details?: Record<string, any>;
}

async function getAlertRecipients(): Promise<string[]> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error } = await supabase
      .from("sysadmin_settings")
      .select("setting_value")
      .eq("setting_key", "alert_email_recipients")
      .single();

    if (error) {
      console.error("[AlertEmail] Failed to fetch recipients from DB:", error);
      return ["admin@instincts.ai"];
    }

    const value = data?.setting_value as { emails: string[] };
    return value?.emails?.length ? value.emails : ["admin@instincts.ai"];
  } catch (err) {
    console.error("[AlertEmail] Error fetching recipients:", err);
    return ["admin@instincts.ai"];
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { alert_type, service_name, message, severity, details }: AlertEmailRequest = await req.json();

    // Only send emails for error and critical alerts
    if (severity !== "error" && severity !== "critical") {
      console.log(`[AlertEmail] Skipping non-critical alert: ${severity}`);
      return new Response(JSON.stringify({ skipped: true, reason: "Not critical" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch recipients from database
    const recipients = await getAlertRecipients();
    console.log(`[AlertEmail] Recipients from DB: ${recipients.join(", ")}`);

    const severityColor = severity === "critical" ? "#dc2626" : "#f59e0b";
    const severityLabel = severity.toUpperCase();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>System Alert - ${severityLabel}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: ${severityColor}; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ ${severityLabel} Alert</h1>
            </div>
            <div style="padding: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Service:</td>
                  <td style="padding: 8px 0; color: #111827;">${service_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Alert Type:</td>
                  <td style="padding: 8px 0; color: #111827;">${alert_type}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Severity:</td>
                  <td style="padding: 8px 0;">
                    <span style="background: ${severityColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                      ${severityLabel}
                    </span>
                  </td>
                </tr>
              </table>
              
              <div style="margin-top: 20px; padding: 16px; background: #fef2f2; border-radius: 8px; border-left: 4px solid ${severityColor};">
                <p style="margin: 0; color: #991b1b; font-weight: 500;">Message:</p>
                <p style="margin: 8px 0 0 0; color: #7f1d1d;">${message}</p>
              </div>
              
              ${details ? `
                <div style="margin-top: 20px;">
                  <p style="color: #6b7280; font-weight: 500; margin-bottom: 8px;">Details:</p>
                  <pre style="background: #f3f4f6; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 12px; color: #374151;">${JSON.stringify(details, null, 2)}</pre>
                </div>
              ` : ""}
              
              <div style="margin-top: 24px; text-align: center;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app')}/sysadmin" 
                   style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                  View Dashboard
                </a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Instincts AI System Monitoring • ${new Date().toISOString()}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log(`[AlertEmail] Sending ${severity} alert to ${recipients.join(", ")}`);

    const emailResponse = await resend.emails.send({
      from: "Instincts AI Alerts <onboarding@resend.dev>",
      to: recipients,
      subject: `[${severityLabel}] ${service_name}: ${alert_type}`,
      html: emailHtml,
    });

    console.log("[AlertEmail] Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[AlertEmail] Error sending alert email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
