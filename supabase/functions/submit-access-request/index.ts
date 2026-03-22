import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AccessRequest {
  email: string;
  websiteUrl: string;
  companyName?: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, websiteUrl, companyName, message }: AccessRequest = await req.json();

    if (!email || !websiteUrl) {
      return new Response(
        JSON.stringify({ error: "Email and website URL are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store the access request
    const { error: insertError } = await supabase
      .from("access_requests")
      .insert({
        email,
        website_url: websiteUrl,
        company_name: companyName,
        message,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to submit request" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send confirmation email to requester
    await resend.emails.send({
      from: "Instincts AI <noreply@resend.dev>",
      to: [email],
      subject: "We Received Your Access Request - Instincts AI",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; margin: 0;">
          <div style="max-width: 480px; margin: 0 auto; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; padding: 40px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 24px; font-weight: bold; margin: 0; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                Instincts AI
              </h1>
            </div>
            
            <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
              We've Received Your Request!
            </h2>
            
            <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
              Thank you for your interest in Instincts AI! We've received your access request for:
            </p>
            
            <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; color: #a1a1aa; font-size: 13px;">
                <strong style="color: #ffffff;">Website:</strong> ${websiteUrl}
              </p>
              ${companyName ? `<p style="margin: 8px 0 0 0; color: #a1a1aa; font-size: 13px;"><strong style="color: #ffffff;">Company:</strong> ${companyName}</p>` : ''}
            </div>
            
            <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
              Our team will review your request and get back to you within 1-2 business days. 
              We're excited to potentially help you transform your commerce strategy!
            </p>
            
            <p style="color: #71717a; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
              If you have any questions, just reply to this email.
            </p>
          </div>
          
          <p style="color: #52525b; font-size: 11px; text-align: center; margin-top: 24px;">
            © ${new Date().getFullYear()} Instincts AI. All rights reserved.
          </p>
        </body>
        </html>
      `,
    });

    console.log("Access request submitted for:", email);

    return new Response(
      JSON.stringify({ success: true, message: "Request submitted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in submit-access-request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
