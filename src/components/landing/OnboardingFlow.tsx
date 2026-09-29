import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnboardingStep, ScanResult } from "@/hooks/useLandingOnboarding";

interface OnboardingFlowProps {
  step: OnboardingStep;
  brandUrl: string;
  setBrandUrl: (url: string) => void;
  scanResult: ScanResult | null;
  onScan: () => void;
  onReset: () => void;
  onOpenRegistration: () => void;
  onOpenAccessRequest: () => void;
}

export function OnboardingFlow({
  step,
  brandUrl,
  setBrandUrl,
  scanResult,
  onScan,
  onReset,
  onOpenRegistration,
  onOpenAccessRequest,
}: OnboardingFlowProps) {
  return (
    <AnimatePresence mode="wait">
      {step === 'input' && (
        <InputStep 
          brandUrl={brandUrl}
          setBrandUrl={setBrandUrl}
          onScan={onScan}
        />
      )}

      {(step === 'scanning' || step === 'analyzing') && (
        <ScanningStep step={step} />
      )}

      {step === 'rejected' && (
        <RejectedStep 
          onReset={onReset}
          onOpenAccessRequest={onOpenAccessRequest}
        />
      )}

      {step === 'success' && scanResult && (
        <SuccessStep 
          scanResult={scanResult}
          onOpenRegistration={onOpenRegistration}
        />
      )}
    </AnimatePresence>
  );
}

function InputStep({ 
  brandUrl, 
  setBrandUrl, 
  onScan 
}: { 
  brandUrl: string; 
  setBrandUrl: (url: string) => void; 
  onScan: () => void;
}) {
  return (
    <motion.div
      key="input"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-xl mx-auto"
    >
      <div className="p-8 rounded-2xl bg-card/90 border border-border/30 backdrop-blur-xl shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.15)]">
        <h2 className="text-2xl font-display font-bold mb-2 text-foreground">
          Let's Get Started
        </h2>
        <p className="text-muted-foreground mb-6">
          Enter your brand's website and we'll set everything up for you
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="url"
            placeholder="yourbrand.com (optional)"
            value={brandUrl}
            onChange={(e) => setBrandUrl(e.target.value)}
            className="flex-1 h-12 bg-background/60 border-border/50 text-lg"
            onKeyDown={(e) => e.key === 'Enter' && brandUrl.trim() && onScan()}
          />
          <Button
            size="lg"
            onClick={() => (brandUrl.trim() ? onScan() : (window.location.href = '/auth'))}
            className="h-12 px-6 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <span className="mr-2">{brandUrl.trim() ? 'Scan' : 'Sign Up'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          No website handy? Sign up now and scan your brand after you log in.
        </p>
      </div>
    </motion.div>
  );
}

function ScanningStep({ step }: { step: 'scanning' | 'analyzing' }) {
  return (
    <motion.div
      key="scanning"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-xl mx-auto"
    >
      <div className="p-8 rounded-2xl bg-card/90 border border-border/30 backdrop-blur-xl shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.15)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2 text-foreground">
          {step === 'scanning' ? 'Scanning Your Brand...' : 'Analyzing Content...'}
        </h2>
        <p className="text-muted-foreground">
          {step === 'scanning' 
            ? 'Extracting your brand identity, colors, and products'
            : 'Understanding your catalog and preparing your workspace'
          }
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
      </div>
    </motion.div>
  );
}

function RejectedStep({ 
  onReset, 
  onOpenAccessRequest 
}: { 
  onReset: () => void; 
  onOpenAccessRequest: () => void;
}) {
  return (
    <motion.div
      key="rejected"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-xl mx-auto"
    >
      <div className="p-8 rounded-2xl bg-card/90 border border-destructive/20 backdrop-blur-xl shadow-[0_8px_40px_-12px_hsl(var(--destructive)/0.15)]">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2 text-foreground">
          Thanks for Your Interest!
        </h2>
        <p className="text-muted-foreground mb-4">
          Instincts AI is designed specifically for brands selling products or services.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          We couldn't find products or services on this website. If you believe this is an error, try again with your main store URL, or request access and our team will review your application.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onReset} variant="outline">
            Try Another URL
          </Button>
          <Button 
            onClick={onOpenAccessRequest}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            Request Access
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function SuccessStep({ 
  scanResult, 
  onOpenRegistration 
}: { 
  scanResult: ScanResult; 
  onOpenRegistration: () => void;
}) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-xl mx-auto"
    >
      <div className="p-8 rounded-2xl bg-card/90 border border-green-500/20 backdrop-blur-xl shadow-[0_8px_40px_-12px_hsl(140_60%_40%/0.15)]">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2 text-foreground">
          {scanResult.brandName} Verified!
        </h2>
        <p className="text-muted-foreground mb-4">
          We've analyzed your brand and found {scanResult.products?.length || 0} products across {scanResult.taxonomy?.length || 0} categories.
        </p>
        <Button 
          onClick={onOpenRegistration}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          Create Your Account
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
