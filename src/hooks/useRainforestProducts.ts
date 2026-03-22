import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AmazonProduct {
  asin: string;
  title: string;
  link: string;
  image: string;
  price?: number;
  currency?: string;
  rating?: number;
  ratingsTotal?: number;
  isPrime?: boolean;
  isBestSeller?: boolean;
  categories?: string[];
  delivery?: string;
  rank?: number;
  availability?: string;
  features?: string[];
  description?: string;
}

interface ProductSearchResult {
  success: boolean;
  data: AmazonProduct[];
  pagination?: {
    currentPage: number;
    totalPages?: number;
    totalResults?: number;
  };
  categories?: any[];
}

export function useRainforestProducts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  const searchProducts = useCallback(async (searchTerm: string, options?: {
    categoryId?: string;
    sortBy?: string;
    page?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("rainforest-products", {
        body: {
          action: "search",
          params: {
            search_term: searchTerm,
            category_id: options?.categoryId,
            sort_by: options?.sortBy,
            page: options?.page || 1,
          },
        },
      });

      if (fnError) throw fnError;
      
      // Check for API unavailable response
      if (data?.apiUnavailable) {
        setApiUnavailable(true);
        return { success: false, data: [] } as ProductSearchResult;
      }
      
      if (!data?.success) throw new Error(data?.error || "Failed to search products");
      
      setApiUnavailable(false);
      return data as ProductSearchResult;
    } catch (err: any) {
      const message = err.message || "Failed to search products";
      setError(message);
      if (message.includes("401") || message.includes("403") || message.includes("unavailable")) {
        setApiUnavailable(true);
      }
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBestSellers = useCallback(async (categoryId = "aps", page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("rainforest-products", {
        body: {
          action: "bestsellers",
          params: { category_id: categoryId, page },
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "Failed to fetch best sellers");

      return data as ProductSearchResult;
    } catch (err: any) {
      const message = err.message || "Failed to fetch best sellers";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductDetails = useCallback(async (asin: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("rainforest-products", {
        body: {
          action: "product",
          params: { asin },
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "Failed to fetch product details");

      return data.data[0] as AmazonProduct;
    } catch (err: any) {
      const message = err.message || "Failed to fetch product details";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDeals = useCallback(async (dealTypes?: string, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("rainforest-products", {
        body: {
          action: "deals",
          params: { deal_types: dealTypes, page },
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "Failed to fetch deals");

      return data as ProductSearchResult;
    } catch (err: any) {
      const message = err.message || "Failed to fetch deals";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    apiUnavailable,
    searchProducts,
    fetchBestSellers,
    fetchProductDetails,
    fetchDeals,
  };
}
