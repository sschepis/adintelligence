import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ProductData {
  name: string;
  category: string;
  price?: number;
  currency?: string;
  originalPrice?: number;
  description?: string;
  image?: string;
  images?: string[];
  sku?: string;
  inStock?: boolean;
  stockQuantity?: number;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  variants?: string[];
  tags?: string[];
  url?: string;
}

interface Organization {
  id: string;
  name: string;
  website_url: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  taxonomy: string[];
  products: ProductData[];
  trial_ends_at: string;
  subscription_status: string;
}

export function useOrganization() {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [needsSubscription, setNeedsSubscription] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrganization();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrganization = async () => {
    if (!user) return;

    try {
      // Get profile with org_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile?.org_id) {
        setNeedsSubscription(true);
        setLoading(false);
        return;
      }

      // Get organization
      const { data: org, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.org_id)
        .single();

      if (error) throw error;

      // Parse JSON fields safely
      const taxonomy = Array.isArray(org.taxonomy) 
        ? (org.taxonomy as unknown[]).filter((t): t is string => typeof t === 'string')
        : [];
      
      // Parse products with full data structure
      const products: ProductData[] = Array.isArray(org.products)
        ? (org.products as unknown[])
            .filter((p): p is Record<string, unknown> => typeof p === 'object' && p !== null && 'name' in p)
            .map(p => ({
              name: String(p.name || ''),
              category: String(p.category || 'Uncategorized'),
              price: typeof p.price === 'number' ? p.price : undefined,
              currency: typeof p.currency === 'string' ? p.currency : undefined,
              originalPrice: typeof p.originalPrice === 'number' ? p.originalPrice : undefined,
              description: typeof p.description === 'string' ? p.description : undefined,
              image: typeof p.image === 'string' ? p.image : undefined,
              images: Array.isArray(p.images) ? p.images.filter((i): i is string => typeof i === 'string') : undefined,
              sku: typeof p.sku === 'string' ? p.sku : undefined,
              inStock: typeof p.inStock === 'boolean' ? p.inStock : undefined,
              stockQuantity: typeof p.stockQuantity === 'number' ? p.stockQuantity : undefined,
              rating: typeof p.rating === 'number' ? p.rating : undefined,
              reviewCount: typeof p.reviewCount === 'number' ? p.reviewCount : undefined,
              brand: typeof p.brand === 'string' ? p.brand : undefined,
              variants: Array.isArray(p.variants) ? p.variants.filter((v): v is string => typeof v === 'string') : undefined,
              tags: Array.isArray(p.tags) ? p.tags.filter((t): t is string => typeof t === 'string') : undefined,
              url: typeof p.url === 'string' ? p.url : undefined,
            }))
        : [];

      const parsedOrg: Organization = {
        ...org,
        taxonomy,
        products,
      };

      setOrganization(parsedOrg);

      // Check subscription status
      const trialEnd = new Date(org.trial_ends_at);
      const now = new Date();
      const expired = trialEnd < now && org.subscription_status === 'trial';
      
      setIsTrialExpired(expired);
      setNeedsSubscription(expired || org.subscription_status === 'expired');
    } catch (error) {
      console.error('Error fetching organization:', error);
    } finally {
      setLoading(false);
    }
  };

  return { 
    organization, 
    loading, 
    isTrialExpired, 
    needsSubscription,
    refetch: fetchOrganization 
  };
}
