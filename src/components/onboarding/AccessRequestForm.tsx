import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Globe, Building2, MessageSquare, ArrowRight, Loader2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AccessRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  websiteUrl?: string;
}

export function AccessRequestForm({ isOpen, onClose, websiteUrl = "" }: AccessRequestFormProps) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(websiteUrl);
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !website) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('submit-access-request', {
        body: { 
          email, 
          websiteUrl: website,
          companyName: companyName || undefined,
          message: message || undefined
        }
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Your request has been submitted!");
    } catch (error) {
      console.error('Submit error:', error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
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
        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <h2 className="font-display text-xl font-bold">Request Access</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tell us about your business and we'll be in touch
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="req-email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="req-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-background/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="req-website">Website URL *</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="req-website"
                    type="url"
                    placeholder="https://yourbrand.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="pl-10 h-12 bg-background/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="req-company">Company Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="req-company"
                    type="text"
                    placeholder="Your Company Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="pl-10 h-12 bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="req-message">Tell us about your business</Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="req-message"
                    placeholder="What products/services do you offer? How do you think Instincts AI could help?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="pl-10 min-h-[100px] bg-background/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                We typically respond within 1-2 business days
              </p>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            
            <h2 className="font-display text-xl font-bold mb-2">Request Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for your interest in Instincts AI. We've sent a confirmation to your email and will be in touch soon.
            </p>
            
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
