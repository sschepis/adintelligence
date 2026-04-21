import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, ArrowRight, Loader2, CheckCircle2, Building2, Edit2, Dna, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState, NoticeState } from "@/components/shared";
import { emailMatchesDomain, extractDomainFromUrl } from "@/lib/domainValidation";
import { BrandDNAPreview } from "./BrandDNAPreview";

interface BrandDNA {
  voice?: any;
  personality?: any;
  story?: any;
  guardrails?: any;
}

interface ScanResult {
  isBrand: boolean;
  brandName: string;
  confidence: number;
  reason: string;
  branding: {
    logo: string | null;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
  };
  taxonomy: string[];
  products: { name: string; category: string }[];
  brandDNA?: BrandDNA;
}

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanResult: ScanResult;
  websiteUrl: string;
  onRegister: (email: string, password: string, brandName?: string, brandDNA?: BrandDNA) => Promise<void>;
  isRegistering: boolean;
}

export function RegistrationModal({
  isOpen,
  onClose,
  scanResult,
  websiteUrl,
  onRegister,
  isRegistering,
}: RegistrationModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [brandName, setBrandName] = useState(scanResult.brandName);
  const [isEditingBrandName, setIsEditingBrandName] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'dna' | 'register'>(scanResult.brandDNA ? 'dna' : 'register');
  const [editedDNA, setEditedDNA] = useState<BrandDNA | undefined>(scanResult.brandDNA);

  const expectedDomain = extractDomainFromUrl(websiteUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Email domain validation disabled for testing
    // if (!emailMatchesDomain(email, websiteUrl)) {
    //   setError(`Please use an email address from @${expectedDomain}`);
    //   return;
    // }

    // Validate password
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!brandName.trim()) {
      setError("Please enter a brand name");
      return;
    }

    await onRegister(email, password, brandName.trim(), editedDNA);
  };

  const hasBrandDNA = scanResult.brandDNA && (
    scanResult.brandDNA.voice ||
    scanResult.brandDNA.personality ||
    scanResult.brandDNA.story ||
    scanResult.brandDNA.guardrails
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent">
                <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                {isEditingBrandName ? (
                  <Input
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    onBlur={() => setIsEditingBrandName(false)}
                    onKeyDown={(e) => e.key === "Enter" && setIsEditingBrandName(false)}
                    className="font-display text-xl font-bold h-8 p-1"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold">
                      Welcome, {brandName}!
                    </h2>
                    <button
                      onClick={() => setIsEditingBrandName(true)}
                      className="p-1 rounded hover:bg-secondary transition-colors"
                      title="Edit brand name"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Create your account to continue
                </p>
              </div>
            </div>
          </div>

          {/* Step indicator */}
          {hasBrandDNA && (
            <div className="px-6 py-2 bg-secondary/20 border-b border-border flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-xs ${step === 'dna' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                <Dna className="h-3 w-3" />
                <span>1. Review DNA</span>
              </div>
              <div className="h-px flex-1 bg-border" />
              <div className={`flex items-center gap-1.5 text-xs ${step === 'register' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                <Mail className="h-3 w-3" />
                <span>2. Create Account</span>
              </div>
            </div>
          )}

          {/* Brand Preview */}
          <div className="px-6 py-4 bg-secondary/30 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {Object.entries(scanResult.branding.colors).slice(0, 4).map(([key, color]) => (
                  <div
                    key={key}
                    className="w-6 h-6 rounded-md border border-border/50"
                    style={{ backgroundColor: color }}
                    title={key}
                  />
                ))}
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex flex-wrap gap-1">
                {scanResult.taxonomy.slice(0, 3).map((cat) => (
                  <span key={cat} className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Brand DNA Preview Step */}
          {step === 'dna' && hasBrandDNA && (
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <BrandDNAPreview 
                brandDNA={editedDNA} 
                onUpdate={setEditedDNA}
              />
              
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('register')}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep('register')}
                  className="flex-1 bg-gradient-to-r from-primary to-accent"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                You can always edit Brand DNA later in settings.
              </p>
            </div>
          )}

          {/* Registration Form */}
          {step === 'register' && (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {hasBrandDNA && (
                <button
                  type="button"
                  onClick={() => setStep('dna')}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Brand DNA
                </button>
              )}


              <div className="space-y-2">
                <Label htmlFor="reg-email">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-background/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-background/50"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-confirm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12 bg-background/50"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ErrorState
                    variant="inline"
                    title="Registration Error"
                    message={error}
                  />
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isRegistering}
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account & Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Start your 7-day free trial. No credit card required.
              </p>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
