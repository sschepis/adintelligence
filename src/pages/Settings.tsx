import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageContainer, SettingsSection, SettingsPageHeader, SettingsToggle } from "@/components/shared";
import { BrandRescanSection } from "@/components/settings/BrandRescanSection";
import { NotificationPreferencesPanel } from "@/components/settings/NotificationPreferencesPanel";
import { ApiTokenManager } from "@/components/settings/ApiTokenManager";
import { WebhookManager } from "@/components/settings/WebhookManager";
import { ApiUsageAnalytics } from "@/components/settings/ApiUsageAnalytics";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShopifyConnect } from "@/components/integrations/ShopifyConnect";
import { useShopifyConnection } from "@/hooks/useShopifyConnection";
import { supabase } from "@/integrations/supabase/client";
import { 
  Link2, Shield, Save, Loader2,
  Slack, Building2, ChevronRight, Code2
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { connection: shopifyConnection, loading: shopifyLoading, refetch: refetchShopify } = useShopifyConnection();

  // Handle Shopify OAuth callback
  useEffect(() => {
    const handleShopifyCallback = async () => {
      const isCallback = searchParams.get('shopify_callback');
      const code = searchParams.get('code');
      const shop = searchParams.get('shop');
      
      if (isCallback && code && shop) {
        try {
          const { error } = await supabase.functions.invoke('shopify-auth', {
            body: { action: 'callback', code, shop }
          });
          
          if (error) throw error;
          
          toast({
            title: "Shopify connected",
            description: `Successfully connected to ${shop}`,
          });
          refetchShopify();
          
          // Clean up URL
          window.history.replaceState({}, '', '/settings');
        } catch (error: any) {
          toast({
            title: "Connection failed",
            description: error.message || "Failed to complete Shopify connection",
            variant: "destructive",
          });
        }
      }
    };
    
    handleShopifyCallback();
  }, [searchParams, toast, refetchShopify]);

  // API integrations (placeholder states)
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [slackConnected, setSlackConnected] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  const handleConnectIntegration = (name: string) => {
    toast({
      title: "Coming soon",
      description: `${name} integration will be available in a future update.`,
    });
  };

  return (
    <PageContainer>
      <SettingsPageHeader
        title="Settings"
        description="Manage your preferences and integrations"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Brand Management Link */}
          <SettingsSection icon={Building2} title="Brand Management" animationDelay="50ms">
            <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium text-sm">Manage Brands</p>
                <p className="text-xs text-muted-foreground">Add, edit, or switch between brands in your organization</p>
              </div>
              <Button 
                variant="glass" 
                size="sm"
                onClick={() => navigate('/settings/brands')}
                className="gap-2"
              >
                Manage
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </SettingsSection>

          {/* Brand Reset & Rescan */}
          <BrandRescanSection />

          {/* AI Notification Preferences */}
          <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <NotificationPreferencesPanel />
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Shopify Integration */}
          <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <ShopifyConnect 
              existingConnection={shopifyConnection} 
              onConnectionChange={refetchShopify}
            />
          </section>

          {/* Other API Integrations */}
          <SettingsSection icon={Link2} title="Other Integrations" animationDelay="150ms">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                    📱
                  </div>
                  <div>
                    <p className="font-medium text-sm">TikTok Ads</p>
                    <p className="text-xs text-muted-foreground">Connect your TikTok Ads account</p>
                  </div>
                </div>
                <Button 
                  variant={tiktokConnected ? "glass" : "gradient"} 
                  size="sm"
                  onClick={() => handleConnectIntegration("TikTok Ads")}
                >
                  {tiktokConnected ? "Connected" : "Connect"}
                </Button>
              </div>

              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                    📸
                  </div>
                  <div>
                    <p className="font-medium text-sm">Instagram / Meta</p>
                    <p className="text-xs text-muted-foreground">Connect your Meta Business account</p>
                  </div>
                </div>
                <Button 
                  variant={instagramConnected ? "glass" : "gradient"} 
                  size="sm"
                  onClick={() => handleConnectIntegration("Instagram / Meta")}
                >
                  {instagramConnected ? "Connected" : "Connect"}
                </Button>
              </div>

              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Slack className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Slack</p>
                    <p className="text-xs text-muted-foreground">Get alerts in your Slack workspace</p>
                  </div>
                </div>
                <Button 
                  variant={slackConnected ? "glass" : "gradient"} 
                  size="sm"
                  onClick={() => handleConnectIntegration("Slack")}
                >
                  {slackConnected ? "Connected" : "Connect"}
                </Button>
              </div>
            </div>
          </SettingsSection>

          {/* Security */}
          <SettingsSection icon={Shield} title="Security" animationDelay="250ms">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="glass" size="sm" onClick={() => handleConnectIntegration("2FA")}>
                  Enable
                </Button>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm">Active Sessions</p>
                  <p className="text-xs text-muted-foreground">Manage your active login sessions</p>
                </div>
                <Button variant="glass" size="sm" onClick={() => handleConnectIntegration("Sessions")}>
                  View
                </Button>
              </div>
            </div>
          </SettingsSection>
        </div>
      </div>

      {/* Developer Section - Full Width */}
      <div className="mt-8 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Developer</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ApiTokenManager />
          <WebhookManager />
        </div>

        {/* API Usage Analytics - Full Width */}
        <ApiUsageAnalytics />
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button
          variant="gradient"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </PageContainer>
  );
}
