import { useState } from "react";
import { ShoppingBag, ExternalLink, Loader2, CheckCircle, XCircle, RefreshCw, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/hooks/useOrganization";

interface ShopifyConnectProps {
  existingConnection?: {
    shop_domain: string;
    created_at: string;
  } | null;
  onConnectionChange?: () => void;
}

export function ShopifyConnect({ existingConnection, onConnectionChange }: ShopifyConnectProps) {
  const [shopDomain, setShopDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const { organization, refetch: refetchOrg } = useOrganization();

  const productCount = Array.isArray(organization?.products) ? organization.products.length : 0;

  const handleConnect = async () => {
    if (!shopDomain) {
      toast({
        title: "Shop domain required",
        description: "Please enter your Shopify store domain",
        variant: "destructive",
      });
      return;
    }

    // Clean the domain
    let cleanDomain = shopDomain.trim().toLowerCase();
    cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
    cleanDomain = cleanDomain.replace(/\/$/, '');
    if (!cleanDomain.includes('.myshopify.com')) {
      cleanDomain = cleanDomain.replace('.myshopify.com', '') + '.myshopify.com';
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('shopify-auth', {
        body: { shop: cleanDomain, action: 'init' }
      });

      if (error) throw error;
      if (!data?.authUrl) throw new Error('No auth URL returned');

      // Redirect to Shopify OAuth
      window.location.href = data.authUrl;
    } catch (error: any) {
      console.error('Shopify connect error:', error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to initiate Shopify connection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('shopify-auth', {
        body: { action: 'disconnect' }
      });

      if (error) throw error;

      toast({
        title: "Disconnected",
        description: "Your Shopify store has been disconnected",
      });
      onConnectionChange?.();
    } catch (error: any) {
      toast({
        title: "Disconnect failed",
        description: error.message || "Failed to disconnect Shopify store",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('shopify-sync');

      if (error) throw error;

      toast({
        title: "Products synced",
        description: `Successfully synced ${data.synced} products from Shopify`,
      });
      
      refetchOrg();
    } catch (error: any) {
      console.error('Shopify sync error:', error);
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync products from Shopify",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (existingConnection) {
    return (
      <Card className="border-sidebar-border bg-sidebar/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#96BF48]/20">
              <ShoppingBag className="h-5 w-5 text-[#96BF48]" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Shopify
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </CardTitle>
              <CardDescription className="text-xs">Connected</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Store</span>
            <a 
              href={`https://${existingConnection.shop_domain}/admin`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              {existingConnection.shop_domain.replace('.myshopify.com', '')}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Connected</span>
            <span>{new Date(existingConnection.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" />
              Products Synced
            </span>
            <span className="font-medium">{productCount}</span>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={handleSync}
              disabled={syncing || loading}
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {syncing ? "Syncing..." : "Sync Products"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={loading || syncing}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-sidebar-border bg-sidebar/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#96BF48]/20">
            <ShoppingBag className="h-5 w-5 text-[#96BF48]" />
          </div>
          <div>
            <CardTitle className="text-base">Shopify</CardTitle>
            <CardDescription className="text-xs">Connect your store</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shop-domain" className="text-xs">Store Domain</Label>
          <Input
            id="shop-domain"
            placeholder="yourstore.myshopify.com"
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <Button
          className="w-full"
          onClick={handleConnect}
          disabled={loading || !shopDomain}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ShoppingBag className="h-4 w-4 mr-2" />
          )}
          Connect Shopify
        </Button>
      </CardContent>
    </Card>
  );
}
