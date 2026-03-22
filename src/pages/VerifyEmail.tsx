import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Loader2, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { NoticeState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ParticleBackground } from "@/components/effects/ParticleBackground";
import { GlowingCard } from "@/components/effects/GlowingCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Check if already verified
    const checkVerification = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('user_id', user.id)
        .single();

      if (profile?.email_verified) {
        navigate('/dashboard');
      }
    };

    checkVerification();
  }, [user, navigate]);

  const sendVerificationEmail = async () => {
    if (!user) return;

    setIsSendingEmail(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Get brand name from org
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('user_id', user.id)
        .single();

      let brandName = '';
      if (profile?.org_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', profile.org_id)
          .single();
        brandName = org?.name || '';
      }

      const { error } = await supabase.functions.invoke('send-verification-email', {
        body: { email: user.email, brandName },
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success("Verification code sent to your email!");
    } catch (error) {
      console.error('Send email error:', error);
      toast.error("Failed to send verification email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsVerifying(true);
    try {
      const { error } = await supabase.functions.invoke('verify-email-code', {
        body: { code: verificationCode },
      });

      if (error) throw error;

      setIsVerified(true);
      toast.success("Email verified successfully!");
      
      // Redirect after a brief delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Verify error:', error);
      toast.error(error.message || "Invalid or expired verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <ParticleBackground />
      
      <motion.div 
        className="w-full max-w-md px-6 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlowingCard className="p-8">
          {!isVerified ? (
            <>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="font-display text-2xl font-bold mb-2 text-center">
                Verify Your Email
              </h2>
              <p className="text-muted-foreground text-center mb-6">
                We need to verify that you own <strong className="text-foreground">{user?.email}</strong>
              </p>

              {!emailSent ? (
                <Button
                  onClick={sendVerificationEmail}
                  disabled={isSendingEmail}
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <NoticeState
                    type="success"
                    message="Verification code sent! Check your inbox."
                    className="mb-4"
                  />

                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Enter 6-character code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                      className="h-14 text-center text-2xl tracking-widest font-mono bg-background/50"
                      maxLength={6}
                    />
                  </div>

                  <Button
                    onClick={handleVerify}
                    disabled={isVerifying || verificationCode.length < 6}
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Email
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <button
                    onClick={sendVerificationEmail}
                    disabled={isSendingEmail}
                    className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSendingEmail ? 'animate-spin' : ''}`} />
                    Resend code
                  </button>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center mt-6">
                Didn't receive the email? Check your spam folder or try resending.
              </p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold mb-2">Email Verified!</h2>
              <p className="text-muted-foreground">
                Redirecting you to your dashboard...
              </p>
            </motion.div>
          )}
        </GlowingCard>
      </motion.div>
    </div>
  );
}
