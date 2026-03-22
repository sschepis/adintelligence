import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-user-invitation function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { email, message }: InviteRequest = await req.json();
    console.log(`Sending invitation to ${email}`);

    // Generate a unique token
    const token = crypto.randomUUID();
    
    // Create the invitation record
    const { error: insertError } = await supabase
      .from('user_invitations')
      .insert({
        email,
        invited_by: user.id,
        token,
      });

    if (insertError) {
      console.error("Error creating invitation:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create invitation" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get the app URL from the Supabase URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const appUrl = supabaseUrl.replace('.supabase.co', '.lovable.app');
    const signupUrl = `${appUrl}/auth?invite=${token}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #6366f1; font-size: 28px; margin: 0;">You're Invited to Instincts AI</h1>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi there,</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          You've been invited to join Instincts AI, the predictive commerce platform that helps brands 
          go from signal to sale in minutes.
        </p>
        
        ${message ? `
        <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 14px; color: #666; margin: 0;"><strong>Personal message:</strong></p>
          <p style="font-size: 14px; color: #333; margin: 8px 0 0 0;">${message}</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${signupUrl}" 
             style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          This invitation expires in 7 days. If you didn't expect this invitation, you can safely ignore this email.
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 40px;">
          Welcome aboard!<br/>
          <strong>The Instincts AI Team</strong>
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Instincts AI <onboarding@resend.dev>",
      to: [email],
      subject: "🎉 You're Invited to Instincts AI",
      html,
    });

    console.log("Invitation email sent:", emailResponse);

    // Log the admin action
    await supabase.from('admin_audit_logs').insert({
      admin_id: user.id,
      action: 'invite_user',
      target_type: 'user_invitation',
      target_id: email,
      details: { email, message: message || null },
    });

    return new Response(JSON.stringify({ success: true, token }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-user-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
