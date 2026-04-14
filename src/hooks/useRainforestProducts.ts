import { useCallback } from "react";
import { useSupabaseFunction } from "./useSupabaseFunction";
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
  const { loading, error, apiUnavailable, invoke } = useSupabaseFunction({
    functionName: "rainforest-products",
    serviceName: "Rainforest",
    onError: "return-null",
    enableSysadminAlerts: false,
  });

  const searchProducts = useCallback(
    async (searchTerm: string, options?: {
      categoryId?: string;
      sortBy?: string;
      page?: number;
    }) => {
      const result = await invoke<ProductSearchResult>("search", {
        search_term: searchTerm,
        category_id: options?.categoryId,
        sort_by: options?.sortBy,
        page: options?.page || 1,
      });
      if (!result) toast.error("Failed to search products");
      return result as ProductSearchResult | null;
    },
    [invoke]
  );

  const fetchBestSellers = useCallback(
    async (categoryId = "aps", page = 1) => {
      const result = await invoke<ProductSearchResult>("bestsellers", {
        category_id: categoryId,
        page,
      });
      if (!result) toast.error("Failed to fetch best sellers");
      return result as ProductSearchResult | null;
    },
    [invoke]
  );

  const fetchProductDetails = useCallback(
    async (asin: string) => {
      const result = await invoke<{ data: AmazonProduct[] }>("product", { asin });
      if (!result) {
        toast.error("Failed to fetch product details");
        return null;
      }
      return (result as any).data?.[0] as AmazonProduct | null;
    },
    [invoke]
  );

  const fetchDeals = useCallback(
    async (dealTypes?: string, page = 1) => {
      const result = await invoke<ProductSearchResult>("deals", {
        deal_types: dealTypes,
        page,
      });
      if (!result) toast.error("Failed to fetch deals");
      return result as ProductSearchResult | null;
    },
    [invoke]
  );

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
