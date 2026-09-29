import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useBrandTheme } from "@/hooks/useBrandTheme";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { organization, needsSubscription, loading: orgLoading } = useOrganization();
  const navigate = useNavigate();
  const location = useLocation();
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [checkingVerification, setCheckingVerification] = useState(true);
  
  // Apply brand theming
  useBrandTheme();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // Send users without a brand workspace to the post-login brand scan
  useEffect(() => {
    if (authLoading || orgLoading || !user || organization) return;
    const exempt = ['/onboarding', '/verify-email', '/subscription'];
    if (exempt.includes(location.pathname)) return;
    if (localStorage.getItem('skip_brand_setup')) return;
    navigate('/onboarding');
  }, [authLoading, orgLoading, user, organization, location.pathname, navigate]);

  // Check email verification status
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (!user) {
        setCheckingVerification(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email_verified')
          .eq('user_id', user.id)
          .single();

        setEmailVerified(profile?.email_verified ?? false);
      } catch (error) {
        console.error('Error checking email verification:', error);
        setEmailVerified(false);
      } finally {
        setCheckingVerification(false);
      }
    };

    if (user && !authLoading) {
      checkEmailVerification();
    }
  }, [user, authLoading]);

  // Redirect to verify email if not verified
  // TEMPORARILY DISABLED - Allow anyone to use the app
  // useEffect(() => {
  //   // Skip redirect if on verify-email or subscription pages
  //   if (location.pathname === '/verify-email' || location.pathname === '/subscription') return;
  //   
  //   if (!checkingVerification && user && emailVerified === false) {
  //     navigate("/verify-email");
  //   }
  // }, [emailVerified, checkingVerification, user, navigate, location.pathname]);

  // TEMPORARILY DISABLED - Allow anyone to use the app
  // useEffect(() => {
  //   // Don't redirect if we're already on the subscription or verify-email page
  //   if (location.pathname === '/subscription' || location.pathname === '/verify-email') return;
  //   
  //   if (!orgLoading && user && needsSubscription && emailVerified) {
  //     navigate("/subscription");
  //   }
  // }, [needsSubscription, orgLoading, user, emailVerified, navigate, location.pathname]);

  if (authLoading || orgLoading || checkingVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
