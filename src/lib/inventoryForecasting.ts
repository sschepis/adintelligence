import { InventoryItem, InventoryMovement } from "@/hooks/useInventorySync";
import { Campaign } from "@/hooks/useCampaigns";
import { differenceInDays, subDays, addDays, format } from "date-fns";

export interface ForecastResult {
  productId: string;
  productName: string;
  currentStock: number;
  averageDailyUsage: number;
  daysUntilStockout: number | null;
  predictedStockoutDate: Date | null;
  confidence: "high" | "medium" | "low";
  riskLevel: "critical" | "warning" | "safe";
  recommendedReorderDate: Date | null;
  linkedCampaigns: string[];
}

export interface CampaignROI {
  campaignId: string;
  campaignName: string;
  status: string;
  totalSpent: number;
  totalConversions: number;
  inventoryTurnover: number;
  unitsReserved: number;
  unitsSold: number;
  costPerUnit: number;
  revenuePerUnit: number;
  roi: number;
  efficiency: "excellent" | "good" | "average" | "poor";
}

export function calculateForecast(
  inventory: InventoryItem[],
  movements: InventoryMovement[],
  campaigns: Campaign[],
  lookbackDays: number = 14
): ForecastResult[] {
  const today = new Date();
  const lookbackStart = subDays(today, lookbackDays);

  return inventory.map(item => {
    // Get movements for this product in the lookback period
    const productMovements = movements.filter(
      m => m.productId === item.id && new Date(m.timestamp) >= lookbackStart
    );

    // Calculate average daily usage
    const totalUsage = productMovements
      .filter(m => m.type === "reserve" || m.type === "sale")
      .reduce((sum, m) => sum + m.quantity, 0);

    const daysWithData = Math.max(
      differenceInDays(today, lookbackStart),
      1
    );
    const averageDailyUsage = totalUsage / daysWithData;

    // Get linked campaigns
    const linkedCampaignIds = [...new Set(
      productMovements
        .filter(m => m.campaignId)
        .map(m => m.campaignId!)
    )];
    const linkedCampaigns = campaigns
      .filter(c => linkedCampaignIds.includes(c.id))
      .map(c => c.name);

    // Calculate days until stockout
    let daysUntilStockout: number | null = null;
    let predictedStockoutDate: Date | null = null;

    if (averageDailyUsage > 0) {
      daysUntilStockout = Math.floor(item.available / averageDailyUsage);
      predictedStockoutDate = addDays(today, daysUntilStockout);
    }

    // Determine confidence based on data availability
    let confidence: ForecastResult["confidence"] = "low";
    if (productMovements.length >= 10) {
      confidence = "high";
    } else if (productMovements.length >= 5) {
      confidence = "medium";
    }

    // Determine risk level
    let riskLevel: ForecastResult["riskLevel"] = "safe";
    if (daysUntilStockout !== null) {
      if (daysUntilStockout <= 3) {
        riskLevel = "critical";
      } else if (daysUntilStockout <= 7) {
        riskLevel = "warning";
      }
    } else if (item.available <= item.lowStockThreshold) {
      riskLevel = "warning";
    }

    // Calculate recommended reorder date (5 days before stockout for lead time)
    const recommendedReorderDate = predictedStockoutDate && daysUntilStockout && daysUntilStockout > 5
      ? subDays(predictedStockoutDate, 5)
      : null;

    return {
      productId: item.id,
      productName: item.name,
      currentStock: item.available,
      averageDailyUsage: Math.round(averageDailyUsage * 100) / 100,
      daysUntilStockout,
      predictedStockoutDate,
      confidence,
      riskLevel,
      recommendedReorderDate,
      linkedCampaigns,
    };
  }).sort((a, b) => {
    // Sort by risk level, then by days until stockout
    const riskOrder = { critical: 0, warning: 1, safe: 2 };
    if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }
    const aDays = a.daysUntilStockout ?? Infinity;
    const bDays = b.daysUntilStockout ?? Infinity;
    return aDays - bDays;
  });
}

export function calculateCampaignROI(
  campaigns: Campaign[],
  movements: InventoryMovement[],
  inventory: InventoryItem[]
): CampaignROI[] {
  return campaigns.map(campaign => {
    const campaignMovements = movements.filter(m => m.campaignId === campaign.id);
    
    const unitsReserved = campaignMovements
      .filter(m => m.type === "reserve")
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const unitsSold = campaignMovements
      .filter(m => m.type === "sale")
      .reduce((sum, m) => sum + m.quantity, 0);

    // Calculate average product price for revenue estimation
    const productIds = [...new Set(campaignMovements.map(m => m.productId))];
    const avgPrice = productIds.length > 0
      ? productIds.reduce((sum, id) => {
          const item = inventory.find(i => i.id === id);
          return sum + (item?.price || 50);
        }, 0) / productIds.length
      : 50;

    const estimatedRevenue = unitsSold * avgPrice;
    const totalSpent = campaign.spent;
    
    // Calculate inventory turnover (units moved / units reserved)
    const inventoryTurnover = unitsReserved > 0 
      ? Math.round((unitsSold / unitsReserved) * 100) / 100 
      : 0;

    // Calculate ROI
    const roi = totalSpent > 0 
      ? Math.round(((estimatedRevenue - totalSpent) / totalSpent) * 100) 
      : 0;

    const costPerUnit = unitsReserved > 0 ? Math.round(totalSpent / unitsReserved) : 0;
    const revenuePerUnit = unitsSold > 0 ? Math.round(estimatedRevenue / unitsSold) : 0;

    // Determine efficiency rating
    let efficiency: CampaignROI["efficiency"] = "average";
    if (roi >= 100 && inventoryTurnover >= 0.8) {
      efficiency = "excellent";
    } else if (roi >= 50 && inventoryTurnover >= 0.5) {
      efficiency = "good";
    } else if (roi < 0 || inventoryTurnover < 0.2) {
      efficiency = "poor";
    }

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      status: campaign.status,
      totalSpent,
      totalConversions: campaign.conversions,
      inventoryTurnover,
      unitsReserved,
      unitsSold,
      costPerUnit,
      revenuePerUnit,
      roi,
      efficiency,
    };
  }).sort((a, b) => b.roi - a.roi);
}

export function generateForecastChartData(
  forecasts: ForecastResult[],
  daysAhead: number = 14
): Array<{ date: string; [key: string]: number | string }> {
  const today = new Date();
  const data: Array<{ date: string; [key: string]: number | string }> = [];

  for (let i = 0; i <= daysAhead; i++) {
    const date = addDays(today, i);
    const point: { date: string; [key: string]: number | string } = {
      date: format(date, "MMM dd"),
    };

    forecasts.slice(0, 5).forEach(forecast => {
      const predictedStock = forecast.averageDailyUsage > 0
        ? Math.max(0, forecast.currentStock - (forecast.averageDailyUsage * i))
        : forecast.currentStock;
      point[forecast.productName] = Math.round(predictedStock);
    });

    data.push(point);
  }

  return data;
}

// Demand Planning Types and Functions
export interface ScheduledCampaign {
  id: string;
  name: string;
  status: string;
  scheduledDate: Date;
  estimatedDailyDemand: number;
  duration: number; // days
  products: string[];
}

export interface DemandPlanningResult {
  productId: string;
  productName: string;
  currentStock: number;
  projectedDemand: number;
  scheduledCampaignDemand: number;
  totalProjectedDemand: number;
  stockAfterDemand: number;
  shortfall: number;
  recommendedRestock: number;
  urgency: "critical" | "high" | "medium" | "low";
  affectedCampaigns: string[];
}

export interface DemandTimelinePoint {
  date: string;
  baselineDemand: number;
  campaignDemand: number;
  totalDemand: number;
  projectedStock: number;
}

export function calculateDemandPlanning(
  inventory: InventoryItem[],
  movements: InventoryMovement[],
  campaigns: Campaign[],
  planningHorizonDays: number = 30
): DemandPlanningResult[] {
  const today = new Date();
  const lookbackDays = 14;
  const lookbackStart = subDays(today, lookbackDays);

  // Get scheduled and active campaigns
  const relevantCampaigns = campaigns.filter(
    c => c.status === "scheduled" || c.status === "active"
  );

  return inventory.map(item => {
    // Calculate baseline daily demand from historical movements
    const productMovements = movements.filter(
      m => m.productId === item.id && new Date(m.timestamp) >= lookbackStart
    );

    const historicalUsage = productMovements
      .filter(m => m.type === "reserve" || m.type === "sale")
      .reduce((sum, m) => sum + m.quantity, 0);

    const daysWithData = Math.max(differenceInDays(today, lookbackStart), 1);
    const baselineDailyDemand = historicalUsage / daysWithData;

    // Calculate projected baseline demand over planning horizon
    const baselineProjectedDemand = baselineDailyDemand * planningHorizonDays;

    // Find campaigns that might affect this product
    const affectedCampaigns: string[] = [];
    let scheduledCampaignDemand = 0;

    relevantCampaigns.forEach(campaign => {
      // Check if campaign has reservations for this product
      const campaignReservations = movements.filter(
        m => m.productId === item.id && m.campaignId === campaign.id && m.type === "reserve"
      );

      if (campaignReservations.length > 0) {
        affectedCampaigns.push(campaign.name);
        
        // Estimate additional demand based on campaign budget
        // Higher budget campaigns typically drive more demand
        const budgetFactor = campaign.total_budget / 1000;
        const estimatedCampaignDemand = Math.ceil(budgetFactor * 5); // 5 units per $1000
        scheduledCampaignDemand += estimatedCampaignDemand;
      }
    });

    // For scheduled campaigns, add projected demand
    const scheduledCampaigns = campaigns.filter(c => c.status === "scheduled");
    scheduledCampaigns.forEach(campaign => {
      // Assume scheduled campaigns will need inventory proportional to budget
      const budgetFactor = campaign.total_budget / 1000;
      const estimatedDemand = Math.ceil(budgetFactor * 3);
      scheduledCampaignDemand += estimatedDemand;
      if (!affectedCampaigns.includes(campaign.name)) {
        affectedCampaigns.push(campaign.name);
      }
    });

    const totalProjectedDemand = Math.round(baselineProjectedDemand + scheduledCampaignDemand);
    const stockAfterDemand = item.available - totalProjectedDemand;
    const shortfall = Math.max(0, -stockAfterDemand);
    
    // Recommend restock with 20% buffer
    const recommendedRestock = shortfall > 0 ? Math.ceil(shortfall * 1.2) : 0;

    // Determine urgency
    let urgency: DemandPlanningResult["urgency"] = "low";
    if (shortfall > item.available * 0.5) {
      urgency = "critical";
    } else if (shortfall > 0) {
      urgency = "high";
    } else if (stockAfterDemand < item.lowStockThreshold) {
      urgency = "medium";
    }

    return {
      productId: item.id,
      productName: item.name,
      currentStock: item.available,
      projectedDemand: Math.round(baselineProjectedDemand),
      scheduledCampaignDemand,
      totalProjectedDemand,
      stockAfterDemand,
      shortfall,
      recommendedRestock,
      urgency,
      affectedCampaigns,
    };
  }).sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
}

export function generateDemandTimeline(
  inventory: InventoryItem[],
  movements: InventoryMovement[],
  campaigns: Campaign[],
  daysAhead: number = 30
): DemandTimelinePoint[] {
  const today = new Date();
  const lookbackDays = 14;
  const lookbackStart = subDays(today, lookbackDays);
  const timeline: DemandTimelinePoint[] = [];

  // Calculate total baseline daily demand
  const totalHistoricalUsage = movements
    .filter(m => new Date(m.timestamp) >= lookbackStart && (m.type === "reserve" || m.type === "sale"))
    .reduce((sum, m) => sum + m.quantity, 0);

  const daysWithData = Math.max(differenceInDays(today, lookbackStart), 1);
  const baselineDailyDemand = totalHistoricalUsage / daysWithData;

  // Get scheduled campaigns
  const scheduledCampaigns = campaigns.filter(c => c.status === "scheduled");
  const activeCampaigns = campaigns.filter(c => c.status === "active");

  // Calculate total current stock
  const totalStock = inventory.reduce((sum, item) => sum + item.available, 0);
  let runningStock = totalStock;

  for (let i = 0; i <= daysAhead; i++) {
    const date = addDays(today, i);
    
    // Calculate campaign demand for this day
    let campaignDemand = 0;
    
    // Active campaigns contribute daily
    activeCampaigns.forEach(campaign => {
      const dailyBudgetDemand = (campaign.daily_budget / 100) * 2; // 2 units per $100 daily spend
      campaignDemand += Math.ceil(dailyBudgetDemand);
    });

    // Scheduled campaigns contribute starting from their estimated launch
    scheduledCampaigns.forEach((campaign, idx) => {
      // Estimate launch day based on campaign index
      const estimatedLaunchDay = (idx + 1) * 7; // Every 7 days
      if (i >= estimatedLaunchDay) {
        const dailyBudgetDemand = (campaign.daily_budget / 100) * 2;
        campaignDemand += Math.ceil(dailyBudgetDemand);
      }
    });

    const totalDemand = Math.round(baselineDailyDemand + campaignDemand);
    runningStock = Math.max(0, runningStock - totalDemand);

    timeline.push({
      date: format(date, "MMM dd"),
      baselineDemand: Math.round(baselineDailyDemand),
      campaignDemand,
      totalDemand,
      projectedStock: runningStock,
    });
  }

  return timeline;
}
