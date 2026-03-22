import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  email: string;
  type: 'status_change' | 'deliverable_added' | 'feedback';
  requestTitle: string;
  oldStatus?: string;
  newStatus?: string;
  deliverableName?: string;
  feedback?: string;
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'review': 'Ready for Review',
    'revision': 'Revision Requested',
    'completed': 'Completed',
  };
  return labels[status] || status;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'pending': '#f59e0b',
    'in-progress': '#3b82f6',
    'review': '#8b5cf6',
    'revision': '#ec4899',
    'completed': '#10b981',
  };
  return colors[status] || '#6b7280';
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-visual-forge-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, requestTitle, oldStatus, newStatus, deliverableName, feedback }: NotificationRequest = await req.json();
    console.log(`Sending ${type} notification to ${email} for "${requestTitle}"`);

    let subject: string;
    let html: string;

    if (type === 'status_change' && newStatus) {
      const statusColor = getStatusColor(newStatus);
      const statusLabel = getStatusLabel(newStatus);
      
      subject = newStatus === 'completed' 
        ? `✨ Your Visual Asset "${requestTitle}" is Complete!`
        : `📋 Status Update: "${requestTitle}" is now ${statusLabel}`;

      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0a; color: #fff;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #fff; font-size: 24px; margin: 0;">Visual Forge Update</h1>
          </div>
          
          <div style="background: #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #888; margin: 0 0 8px 0;">Project</p>
            <h2 style="font-size: 20px; margin: 0 0 16px 0; color: #fff;">${requestTitle}</h2>
            
            <div style="display: flex; align-items: center; gap: 12px;">
              ${oldStatus ? `
                <span style="background: #333; padding: 6px 12px; border-radius: 6px; font-size: 12px; color: #888;">
                  ${getStatusLabel(oldStatus)}
                </span>
                <span style="color: #888;">→</span>
              ` : ''}
              <span style="background: ${statusColor}22; color: ${statusColor}; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; border: 1px solid ${statusColor}44;">
                ${statusLabel}
              </span>
            </div>
          </div>
          
          ${newStatus === 'completed' ? `
            <p style="font-size: 16px; line-height: 1.6; color: #ccc; text-align: center;">
              🎉 Your visual asset is ready! Log in to view and download your deliverables.
            </p>
          ` : newStatus === 'review' ? `
            <p style="font-size: 16px; line-height: 1.6; color: #ccc; text-align: center;">
              Your asset is ready for review. Please check the deliverables and let us know if you need any revisions.
            </p>
          ` : ''}
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/visual-forge" 
               style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              View Project
            </a>
          </div>
          
          <p style="font-size: 12px; color: #666; text-align: center; margin-top: 40px;">
            Instincts AI Visual Forge
          </p>
        </div>
      `;
    } else if (type === 'deliverable_added' && deliverableName) {
      subject = `📦 New Deliverable Added: "${requestTitle}"`;

      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0a; color: #fff;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #fff; font-size: 24px; margin: 0;">New Deliverable Available</h1>
          </div>
          
          <div style="background: #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #888; margin: 0 0 8px 0;">Project</p>
            <h2 style="font-size: 20px; margin: 0 0 16px 0; color: #fff;">${requestTitle}</h2>
            
            <div style="background: #10b98122; border: 1px solid #10b98144; border-radius: 8px; padding: 16px;">
              <p style="font-size: 14px; color: #10b981; margin: 0 0 4px 0; font-weight: 600;">📎 New File Added</p>
              <p style="font-size: 16px; color: #fff; margin: 0;">${deliverableName}</p>
            </div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #ccc; text-align: center;">
            A new deliverable has been uploaded to your project. Log in to view and download it.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/visual-forge" 
               style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              View Deliverable
            </a>
          </div>
          
          <p style="font-size: 12px; color: #666; text-align: center; margin-top: 40px;">
            Instincts AI Visual Forge
          </p>
        </div>
      `;
    } else if (type === 'feedback' && feedback) {
      subject = `💬 Feedback on Your Request: "${requestTitle}"`;

      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0a; color: #fff;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #fff; font-size: 24px; margin: 0;">Revision Requested</h1>
          </div>
          
          <div style="background: #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #888; margin: 0 0 8px 0;">Project</p>
            <h2 style="font-size: 20px; margin: 0 0 16px 0; color: #fff;">${requestTitle}</h2>
            
            <div style="background: #ec489922; border: 1px solid #ec489944; border-radius: 8px; padding: 16px;">
              <p style="font-size: 14px; color: #ec4899; margin: 0 0 8px 0; font-weight: 600;">Feedback from Creative Team</p>
              <p style="font-size: 14px; color: #fff; margin: 0; line-height: 1.6;">${feedback}</p>
            </div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #ccc; text-align: center;">
            Please review the feedback and update your request if needed.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/visual-forge" 
               style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              View Request
            </a>
          </div>
          
          <p style="font-size: 12px; color: #666; text-align: center; margin-top: 40px;">
            Instincts AI Visual Forge
          </p>
        </div>
      `;
    } else {
      throw new Error("Invalid notification type or missing required fields");
    }

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
    console.error("Error in send-visual-forge-notification:", error);
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
