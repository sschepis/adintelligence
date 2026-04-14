import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBrand } from "@/contexts/BrandContext";
import { toast } from "sonner";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  reserved: number;
  available: number;
  image_url?: string;
  price?: number;
  category?: string;
  lowStockThreshold: number;
  lastUpdated: string;
}

export interface InventoryReservation {
  id: string;
  productId: string;
  campaignId: string;
  quantity: number;
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: "reserve" | "release" | "sale" | "restock";
  quantity: number;
  campaignId?: string;
  campaignName?: string;
  timestamp: string;
  stockAfter: number;
}

export function useInventorySync() {
  const { activeBrand, refetchBrands } = useBrand();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [reservations, setReservations] = useState<InventoryReservation[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Parse products from brand into inventory items
  const parseInventory = useCallback(() => {
    if (!activeBrand?.products) {
      setInventory([]);
      setLoading(false);
      return;
    }

    const items: InventoryItem[] = activeBrand.products.map((product: any, index: number) => {
      const stock = product.stock ?? 0;
      const reserved = Math.floor(stock * 0.1);

      return {
        id: product.id || `product-${index}`,
        name: product.name || `Product ${index + 1}`,
        sku: product.sku || "Unassigned",
        stock,
        reserved,
        available: stock - reserved,
        image_url: product.image_url,
        price: product.price,
        category: product.category,
        lowStockThreshold: 20,
        lastUpdated: new Date().toISOString(),
      };
    });

    setInventory(items);
    setLoading(false);
  }, [activeBrand]);

  useEffect(() => {
    parseInventory();
  }, [parseInventory]);

  // Pause campaign when inventory sells out
  const pauseCampaignForStockout = useCallback(async (campaignId: string, productName: string) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ status: "paused" })
        .eq("id", campaignId);

      if (!error) {
        toast.warning(`Campaign paused: ${productName} is out of stock`, {
          description: "Campaign will resume when inventory is restocked",
          duration: 5000,
        });
        
        // Record the movement
        const movement: InventoryMovement = {
          id: `mov-${Date.now()}`,
          productId: "",
          productName,
          type: "reserve",
          quantity: 0,
          campaignId,
          campaignName: "Auto-paused due to stockout",
          timestamp: new Date().toISOString(),
          stockAfter: 0,
        };
        setMovements(prev => [movement, ...prev]);
      }
    } catch (error) {
      console.error("Failed to pause campaign:", error);
    }
  }, []);

  // Check and pause campaigns for out-of-stock items
  const checkAndPauseCampaigns = useCallback(async () => {
    const outOfStockItems = inventory.filter(item => item.available <= 0);
    
    for (const item of outOfStockItems) {
      const affectedReservations = reservations.filter(r => r.productId === item.id);
      
      for (const reservation of affectedReservations) {
        await pauseCampaignForStockout(reservation.campaignId, item.name);
      }
    }
  }, [inventory, reservations, pauseCampaignForStockout]);

  // Monitor inventory levels and auto-pause campaigns
  useEffect(() => {
    const outOfStockItems = inventory.filter(item => item.available <= 0);
    if (outOfStockItems.length > 0) {
      checkAndPauseCampaigns();
    }
  }, [inventory, checkAndPauseCampaigns]);

  // Record inventory movement
  const recordMovement = useCallback((
    item: InventoryItem,
    type: InventoryMovement["type"],
    quantity: number,
    campaignId?: string,
    campaignName?: string
  ) => {
    const movement: InventoryMovement = {
      id: `mov-${Date.now()}-${item.id}`,
      productId: item.id,
      productName: item.name,
      type,
      quantity,
      campaignId,
      campaignName,
      timestamp: new Date().toISOString(),
      stockAfter: item.available - (type === "reserve" || type === "sale" ? quantity : -quantity),
    };
    setMovements(prev => [movement, ...prev].slice(0, 100)); // Keep last 100 movements
  }, []);

  // Reserve inventory for a campaign
  const reserveInventory = useCallback(async (
    productIds: string[],
    campaignId: string,
    quantities: Record<string, number>,
    campaignName?: string
  ) => {
    setSyncing(true);
    
    try {
      const updatedInventory: InventoryItem[] = [];
      
      // Update local inventory state
      setInventory(prev => prev.map(item => {
        if (productIds.includes(item.id)) {
          const reserveQty = quantities[item.id] || 1;
          const newReserved = item.reserved + reserveQty;
          const newAvailable = item.stock - newReserved;
          
          if (newAvailable < 0) {
            throw new Error(`Insufficient stock for ${item.name}`);
          }
          
          const updatedItem = {
            ...item,
            reserved: newReserved,
            available: newAvailable,
            lastUpdated: new Date().toISOString(),
          };
          
          updatedInventory.push(updatedItem);
          recordMovement(item, "reserve", reserveQty, campaignId, campaignName);
          
          // Check if this reservation causes stockout
          if (newAvailable <= 0) {
            pauseCampaignForStockout(campaignId, item.name);
          }
          
          return updatedItem;
        }
        return item;
      }));

      // Add reservation records
      const newReservations: InventoryReservation[] = productIds.map(productId => ({
        id: `res-${Date.now()}-${productId}`,
        productId,
        campaignId,
        quantity: quantities[productId] || 1,
        createdAt: new Date().toISOString(),
      }));

      setReservations(prev => [...prev, ...newReservations]);

      // Update brand products in database
      if (activeBrand) {
        const updatedProducts = activeBrand.products.map((product: any) => {
          if (productIds.includes(product.id)) {
            return {
              ...product,
              stock: (product.stock || 100) - (quantities[product.id] || 1),
            };
          }
          return product;
        });

        await supabase
          .from("brands")
          .update({ products: updatedProducts })
          .eq("id", activeBrand.id);

        await refetchBrands();
      }

      toast.success("Inventory reserved for campaign");
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || "Failed to reserve inventory");
      return { success: false, error: error.message };
    } finally {
      setSyncing(false);
    }
  }, [activeBrand, refetchBrands, recordMovement, pauseCampaignForStockout]);

  // Release inventory reservation
  const releaseReservation = useCallback(async (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return { success: false };

    setSyncing(true);

    try {
      const item = inventory.find(i => i.id === reservation.productId);
      
      // Update local inventory
      setInventory(prev => prev.map(item => {
        if (item.id === reservation.productId) {
          const updatedItem = {
            ...item,
            reserved: item.reserved - reservation.quantity,
            available: item.available + reservation.quantity,
            lastUpdated: new Date().toISOString(),
          };
          
          if (item) {
            recordMovement(item, "release", reservation.quantity, reservation.campaignId);
          }
          
          return updatedItem;
        }
        return item;
      }));

      // Remove reservation
      setReservations(prev => prev.filter(r => r.id !== reservationId));

      toast.success("Inventory reservation released");
      return { success: true };
    } catch (error) {
      toast.error("Failed to release reservation");
      return { success: false };
    } finally {
      setSyncing(false);
    }
  }, [reservations, inventory, recordMovement]);

  // Check if stock is available
  const checkAvailability = useCallback((productId: string, quantity: number): boolean => {
    const item = inventory.find(i => i.id === productId);
    return item ? item.available >= quantity : false;
  }, [inventory]);

  // Get low stock items
  const lowStockItems = inventory.filter(item => item.available <= item.lowStockThreshold);
  
  // Get out of stock items
  const outOfStockItems = inventory.filter(item => item.available <= 0);

  // Get reservations by campaign
  const getReservationsByCampaign = useCallback((campaignId: string) => {
    return reservations.filter(r => r.campaignId === campaignId);
  }, [reservations]);

  // Get movements by product
  const getMovementsByProduct = useCallback((productId: string) => {
    return movements.filter(m => m.productId === productId);
  }, [movements]);

  // Get movements by campaign
  const getMovementsByCampaign = useCallback((campaignId: string) => {
    return movements.filter(m => m.campaignId === campaignId);
  }, [movements]);

  // Sync inventory with external source (simulated)
  const syncInventory = useCallback(async () => {
    setSyncing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      parseInventory();
      
      toast.success("Inventory synchronized");
      return { success: true };
    } catch (error) {
      toast.error("Failed to sync inventory");
      return { success: false };
    } finally {
      setSyncing(false);
    }
  }, [parseInventory]);

  return {
    inventory,
    reservations,
    movements,
    loading,
    syncing,
    lowStockItems,
    outOfStockItems,
    reserveInventory,
    releaseReservation,
    checkAvailability,
    getReservationsByCampaign,
    getMovementsByProduct,
    getMovementsByCampaign,
    syncInventory,
    refetch: parseInventory,
  };
}
