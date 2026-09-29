import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { streamEdgeFunction } from "@/lib/sse";
import { supabase } from "@/integrations/supabase/client";
import { createBrandWorkspace } from "@/lib/brandSetup";

export const SKIP_BRAND_SETUP_KEY = "skip_brand_setup";

export default function BrandSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const runScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const target = url.trim();
    if (!target) return;
    setBusy(true);
    setProgress(5);
    setMessage("Starting scan…");
    try {
      let result: any = null;
      try {
        await streamEdgeFunction("scan-website", { url: target }, {
          onEvent: (event: string, data: any) => {
            if (event === "phase") {
              if (typeof data?.progress === "number") setProgress(data.progress);
              if (data?.message) setMessage(data.message);
            } else if (event === "result") result = data;
          },
        } as any);
      } catch (err) {
        console.warn("Streaming scan failed, falling back:", err);
      }
      if (!result) {
        const { data, error } = await supabase.functions.invoke("scan-website", { body: { url: target } });
        if (error) throw error;
        result = data;
      }
      if (result?.success === false) throw new Error(result.error || "Scan failed");

      setMessage("Creating your workspace…");
      const normalized = /^https?:\/\//i.test(target) ? target : `https://${target}`;
      await createBrandWorkspace(user.id, normalized, result);
      localStorage.removeItem(SKIP_BRAND_SETUP_KEY);
      toast({ title: "Brand set up!", description: `${result.brandName || "Your brand"} is ready.` });
      window.location.assign("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast({ title: "Scan failed", description: err?.message || "Please try again.", variant: "destructive" });
      setBusy(false);
    }
  };

  const skip = () => {
    localStorage.setItem(SKIP_BRAND_SETUP_KEY, "1");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg p-8 rounded-2xl bg-card border border-border">
        <h1 className="font-display text-2xl font-bold mb-2 text-foreground">Set up your brand</h1>
        <p className="text-muted-foreground mb-6">
          Enter your brand's website and we'll pull in your colors, products, and brand voice.
        </p>
        <form onSubmit={runScan} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website">Brand website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="website"
                placeholder="yourbrand.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={busy}
                className="pl-10 h-12"
              />
            </div>
          </div>
          {busy && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          )}
          <Button type="submit" disabled={busy || !url.trim()} className="w-full h-12">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Scan my brand <ArrowRight className="h-4 w-4 ml-2" /></>}
          </Button>
        </form>
        {!busy && (
          <button onClick={skip} className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground">
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
