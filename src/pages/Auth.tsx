import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Mail, Lock, ArrowRight, Loader2, Globe, UserPlus } from "lucide-react";
import { NoticeState } from "@/components/shared";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleBackground } from "@/components/effects/ParticleBackground";
import { GlowingCard } from "@/components/effects/GlowingCard";
import { supabase } from "@/integrations/supabase/client";
import { getEmailDomain, extractDomainFromUrl } from "@/lib/domainValidation";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type AuthMode = 'signin' | 'signup' | 'scanning';

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; website?: string }>({});
  const [mode, setMode] = useState<AuthMode>('signin');
  const [needsWebsite, setNeedsWebsite] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const validateSignInForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUpForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    // Free email provider check disabled for testing
    // else if (isFreeEmailProvider(email)) {
    //   newErrors.email = "Please use a business email address (no Gmail, Yahoo, etc.)";
    // }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    } else if (password !== confirmPassword) {
      newErrors.password = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignInForm()) return;
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message.includes("Invalid login credentials") 
            ? "Invalid email or password." 
            : error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Welcome back!", description: "You've successfully signed in." });
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkDomainInSystem = async (emailDomain: string): Promise<boolean> => {
    // Check if there's an organization with a website matching this domain
    const { data } = await supabase
      .from('organizations')
      .select('id, website_url')
      .ilike('website_url', `%${emailDomain}%`)
      .limit(1);
    
    return data && data.length > 0;
  };

  const handleSignUpStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUpForm()) return;
    
    const emailDomain = getEmailDomain(email);
    if (!emailDomain) {
      setErrors({ email: "Invalid email address" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if domain already exists in system
      const domainExists = await checkDomainInSystem(emailDomain);
      
      if (domainExists) {
        // Domain exists, just create the account
        await createAccount();
      } else {
        // Domain doesn't exist, need to scan website first
        setNeedsWebsite(true);
        setWebsiteUrl(emailDomain);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to verify domain.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWebsiteScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim()) {
      setErrors({ website: "Please enter your website URL" });
      return;
    }

    setIsSubmitting(true);
    setMode('scanning');

    try {
      const { data, error } = await supabase.functions.invoke('scan-website', {
        body: { url: websiteUrl }
      });

      if (error) throw error;

      if (!data.isBrand || !data.products || data.products.length === 0) {
        toast({
          title: "Website Not Eligible",
          description: "We couldn't find products or services for sale. Instincts AI is designed for brands selling products.",
          variant: "destructive",
        });
        setMode('signup');
        setNeedsWebsite(true);
        return;
      }

      setScanResult(data);
      await createAccount(data);
    } catch (error) {
      console.error('Scan error:', error);
      toast({ title: "Error", description: "Failed to scan website. Please try again.", variant: "destructive" });
      setMode('signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createAccount = async (scanData?: any) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create account");

      // Wait for profile trigger
      await new Promise(resolve => setTimeout(resolve, 500));

      // If we have scan data, create org and brand
      if (scanData) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            owner_id: authData.user.id,
            name: scanData.brandName || 'My Brand',
            website_url: websiteUrl,
            logo_url: scanData.branding?.logo,
            primary_color: scanData.branding?.colors?.primary || '#6366f1',
            secondary_color: scanData.branding?.colors?.secondary || '#8b5cf6',
            accent_color: scanData.branding?.colors?.accent || '#ec4899',
            background_color: scanData.branding?.colors?.background || '#0a0a0a',
            text_color: scanData.branding?.colors?.text || '#ffffff',
            taxonomy: scanData.taxonomy || [],
            products: scanData.products || [],
          })
          .select()
          .single();

        if (orgError) throw orgError;

        // Build Brand DNA objects for database
        const brandVoice = scanData.brandDNA?.voice ? {
          analyzedAt: new Date().toISOString(),
          toneSpectrum: scanData.brandDNA.voice.toneSpectrum,
          vocabulary: scanData.brandDNA.voice.vocabulary,
          emotionalSignature: scanData.brandDNA.voice.emotionalSignature,
          communicationPatterns: scanData.brandDNA.voice.communicationPatterns,
          sentenceStyle: scanData.brandDNA.voice.sentenceStyle,
        } : undefined;

        const brandPersonality = scanData.brandDNA?.personality ? {
          archetype: scanData.brandDNA.personality.archetype,
          secondaryArchetype: scanData.brandDNA.personality.secondaryArchetype,
          traits: scanData.brandDNA.personality.traits,
          values: scanData.brandDNA.personality.values,
          emotionalTone: scanData.brandDNA.personality.emotionalTone,
          completedAt: scanData.brandDNA.personality.archetype ? new Date().toISOString() : null,
        } : undefined;

        const brandStory = scanData.brandDNA?.story || undefined;
        const brandGuardrails = scanData.brandDNA?.guardrails ? {
          ...scanData.brandDNA.guardrails,
          enabled: true,
        } : undefined;

        // Create brand with Brand DNA
        const brandInsertData: any = {
          org_id: orgData.id,
          name: scanData.brandName || 'My Brand',
          website_url: websiteUrl,
          logo_url: scanData.branding?.logo,
          primary_color: scanData.branding?.colors?.primary || '#6366f1',
          secondary_color: scanData.branding?.colors?.secondary || '#8b5cf6',
          accent_color: scanData.branding?.colors?.accent || '#ec4899',
          background_color: scanData.branding?.colors?.background || '#0a0a0a',
          text_color: scanData.branding?.colors?.text || '#ffffff',
          taxonomy: scanData.taxonomy || [],
          products: scanData.products || [],
        };

        if (brandVoice) brandInsertData.brand_voice = brandVoice;
        if (brandPersonality) brandInsertData.brand_personality = brandPersonality;
        if (brandStory) brandInsertData.brand_story = brandStory;
        if (brandGuardrails) brandInsertData.brand_guardrails = brandGuardrails;

        const { data: brandData, error: brandError } = await supabase
          .from('brands')
          .insert(brandInsertData)
          .select()
          .single();

        // Update profile with org_id and active_brand_id
        await supabase
          .from('profiles')
          .update({ 
            org_id: orgData.id,
            active_brand_id: brandData?.id || null,
          })
          .eq('user_id', authData.user.id);

        // Create owner membership if brand was created
        if (brandData) {
          await supabase
            .from('user_org_memberships')
            .insert({
              user_id: authData.user.id,
              org_id: orgData.id,
              role: 'owner',
              brand_access: [brandData.id],
            });
        }
      }

      toast({ title: "Welcome!", description: "Please verify your email to continue." });
      navigate('/verify-email');
    } catch (error: any) {
      console.error('Account creation error:', error);
      if (error.message?.includes('already registered')) {
        toast({ 
          title: "Email Already Registered", 
          description: "Please sign in instead.",
          variant: "destructive" 
        });
        setMode('signin');
      } else {
        toast({ title: "Error", description: error.message || "Failed to create account.", variant: "destructive" });
      }
      throw error;
    }
  };

  if (loading) {
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
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-2xl">Instincts AI</span>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'signin' && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <GlowingCard className="p-8">
                <h2 className="font-display text-2xl font-bold mb-2 text-center">Welcome Back</h2>
                <p className="text-muted-foreground text-center mb-6">Sign in to your account</p>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-background/50"
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 bg-background/50"
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>Sign In <ArrowRight className="h-4 w-4 ml-2" /></>
                    )}
                  </Button>
                </form>

                <button
                  onClick={() => navigate('/reset-password')}
                  className="w-full mt-4 text-sm text-muted-foreground hover:text-primary"
                >
                  Forgot your password?
                </button>

                <p className="mt-4 text-center text-muted-foreground text-sm">
                  Don't have an account?{" "}
                  <button 
                    onClick={() => {
                      setMode('signup');
                      setErrors({});
                    }} 
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </GlowingCard>
            </motion.div>
          )}

          {mode === 'signup' && !needsWebsite && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlowingCard className="p-8">
                <h2 className="font-display text-2xl font-bold mb-2 text-center">Create Account</h2>
                <p className="text-muted-foreground text-center mb-6">Use your business email to get started</p>

                <NoticeState
                  type="warning"
                  message="Personal emails (Gmail, Yahoo, etc.) are not accepted. Please use your company email."
                  className="mb-6"
                />

                <form onSubmit={handleSignUpStart} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Business Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@yourbrand.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-background/50"
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 h-12 bg-background/50"
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>Continue <ArrowRight className="h-4 w-4 ml-2" /></>
                    )}
                  </Button>
                </form>

                <p className="mt-6 text-center text-muted-foreground text-sm">
                  Already have an account?{" "}
                  <button 
                    onClick={() => {
                      setMode('signin');
                      setErrors({});
                    }} 
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </GlowingCard>
            </motion.div>
          )}

          {mode === 'signup' && needsWebsite && (
            <motion.div
              key="website"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlowingCard className="p-8">
                <h2 className="font-display text-2xl font-bold mb-2 text-center">One More Step</h2>
                <p className="text-muted-foreground text-center mb-6">
                  We need to verify your brand's website
                </p>

                <form onSubmit={handleWebsiteScan} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Your Brand's Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://yourbrand.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="pl-10 h-12 bg-background/50"
                      />
                    </div>
                    {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    We'll scan your website to set up your brand profile and product catalog.
                  </p>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>Scan & Create Account <ArrowRight className="h-4 w-4 ml-2" /></>
                    )}
                  </Button>
                </form>

                <button 
                  onClick={() => {
                    setNeedsWebsite(false);
                    setMode('signup');
                  }}
                  className="mt-4 text-sm text-muted-foreground hover:text-foreground text-center w-full"
                >
                  ← Back
                </button>
              </GlowingCard>
            </motion.div>
          )}

          {mode === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlowingCard className="p-8 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-display font-bold mb-2">Setting Up Your Brand...</h2>
                <p className="text-muted-foreground">
                  Scanning your website and creating your workspace
                </p>
                <div className="mt-6 flex justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
              </GlowingCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
