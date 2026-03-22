import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  email: string;
  status: 'approved' | 'rejected';
  company_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-access-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, status, company_name }: NotificationRequest = await req.json();
    console.log(`Sending ${status} notification to ${email}`);

    const isApproved = status === 'approved';
    const companyDisplay = company_name || 'your brand';

    const subject = isApproved 
      ? "🎉 Your Instincts AI Access Request Has Been Approved!"
      : "Update on Your Instincts AI Access Request";

    const html = isApproved 
      ? `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #10b981; font-size: 28px; margin: 0;">Great News! You're In!</h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi there,</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            We're excited to let you know that your access request for <strong>${companyDisplay}</strong> 
            has been approved! You can now sign up and start using Instincts AI.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/auth" 
               style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Get Started Now
            </a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            With Instincts AI, you'll be able to:
          </p>
          <ul style="font-size: 14px; line-height: 1.8; color: #555;">
            <li>Detect trending cultural signals in real-time</li>
            <li>Match trends to your inventory automatically</li>
            <li>Test creative with AI-powered focus groups</li>
            <li>Deploy optimized campaigns in minutes</li>
          </ul>
          
          <p style="font-size: 14px; color: #666; margin-top: 40px;">
            Welcome to the future of commerce!<br/>
            <strong>The Instincts AI Team</strong>
          </p>
        </div>
      `
      : `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #333; font-size: 28px; margin: 0;">Thank You for Your Interest</h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi there,</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Thank you for your interest in Instincts AI. After reviewing your access request for 
            <strong>${companyDisplay}</strong>, we've determined that our platform isn't the best fit 
            for your needs at this time.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Instincts AI is specifically designed for product-based brands with active e-commerce 
            operations. If your business model changes or you have questions about our requirements, 
            please don't hesitate to reach out.
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 40px;">
            Best regards,<br/>
            <strong>The Instincts AI Team</strong>
          </p>
        </div>
      `;

    const emailResponse = await resend.emails.send({
      from: "Instincts AI <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-access-notification:", error);
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
