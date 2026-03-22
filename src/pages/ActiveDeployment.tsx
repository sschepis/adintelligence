import { useState, useEffect, useMemo } from "react";
import { PageContainer, CampaignList, DialogConfirm, PageHeader, GlassBoxAssistant, PerformanceChart } from "@/components/shared";
import { CampaignDialog } from "@/components/deployment/CampaignDialog";
import { CampaignDeployWizard } from "@/components/deployment/CampaignDeployWizard";
import { BudgetControls } from "@/components/deployment/BudgetControls";
import { RealTimeMorphing } from "@/components/deployment/RealTimeMorphing";
import { CompetitorGhosting } from "@/components/deployment/CompetitorGhosting";
import { CampaignPerformanceDashboard } from "@/components/deployment/CampaignPerformanceDashboard";
import { GeoLocationTargeting } from "@/components/deployment/GeoLocationTargeting";
import { InventorySyncPanel } from "@/components/commerce/InventorySyncPanel";
import { InventoryAnalytics } from "@/components/commerce/InventoryAnalytics";
import { InventoryForecast } from "@/components/commerce/InventoryForecast";
import { CampaignInventoryROI } from "@/components/commerce/CampaignInventoryROI";
import { InventoryDemandPlanning } from "@/components/commerce/InventoryDemandPlanning";
import { SectionHeader } from "@/components/ui/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCampaigns, Campaign, CampaignInput } from "@/hooks/useCampaigns";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useInventorySync } from "@/hooks/useInventorySync";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter, X, BarChart3, Package, Rocket, TrendingUp, LineChart, DollarSign, CalendarClock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type StatusFilter = "all" | "active" | "paused" | "draft";
type PlatformFilter = string | "all";

const ActiveDeployment = () => {
  const { campaigns, loading, createCampaign, updateCampaign, toggleCampaignStatus, deleteCampaign } = useCampaigns(true);
  const { inventory, movements, reserveInventory } = useInventorySync();
  const { trackPageView, trackFeatureUse } = useUsageTracking();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [deployWizardOpen, setDeployWizardOpen] = useState(false);
  const [deployingCampaign, setDeployingCampaign] = useState<Campaign | null>(null);
  const [activeView, setActiveView] = useState<"campaigns" | "performance" | "inventory" | "analytics" | "forecast" | "roi" | "demand" | "geo">("campaigns");
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique platforms from campaigns
  const platforms = useMemo(() => {
    const uniquePlatforms = new Set(campaigns.map(c => c.platform).filter(Boolean));
    return Array.from(uniquePlatforms) as string[];
  }, [campaigns]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
      const matchesPlatform = platformFilter === "all" || campaign.platform === platformFilter;
      return matchesStatus && matchesPlatform;
    });
  }, [campaigns, statusFilter, platformFilter]);

  const activeFiltersCount = (statusFilter !== "all" ? 1 : 0) + (platformFilter !== "all" ? 1 : 0);

  const clearFilters = () => {
    setStatusFilter("all");
    setPlatformFilter("all");
  };

  useEffect(() => {
    trackPageView("active_deployment");
  }, []);

  const handleCreate = () => {
    setEditingCampaign(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: CampaignInput) => {
    if (editingCampaign) {
      return await updateCampaign(editingCampaign.id, data);
    } else {
      return await createCampaign(data);
    }
  };

  const handleDeploy = (campaign: Campaign) => {
    setDeployingCampaign(campaign);
    setDeployWizardOpen(true);
  };

  const handleDelete = async () => {
    if (deletingCampaign) {
      await deleteCampaign(deletingCampaign.id);
      setDeletingCampaign(null);
    }
  };

  const totalBudget = filteredCampaigns.reduce((sum, c) => sum + c.total_budget, 0);
  const totalSpent = filteredCampaigns.reduce((sum, c) => sum + c.spent, 0);
  const activeCampaigns = filteredCampaigns.filter(c => c.status === "active").length;

  const headerActions = (
    <>
      <Button variant="glass" size="sm" className="gap-2">
        <Download className="h-4 w-4" />
        Export Report
      </Button>
      
      <DropdownMenu open={showFilters} onOpenChange={setShowFilters}>
        <DropdownMenuTrigger asChild>
          <Button variant="glass" size="sm" className="gap-2 relative">
            <Filter className="h-4 w-4" />
            Filter
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-[10px] absolute -top-1.5 -right-1.5">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center justify-between">
            Filters
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs gap-1">
                <X className="h-3 w-3" />
                Clear
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">Status</DropdownMenuLabel>
          <DropdownMenuCheckboxItem 
            checked={statusFilter === "all"} 
            onCheckedChange={() => setStatusFilter("all")}
          >
            All Statuses
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem 
            checked={statusFilter === "active"} 
            onCheckedChange={() => setStatusFilter("active")}
          >
            Active
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem 
            checked={statusFilter === "paused"} 
            onCheckedChange={() => setStatusFilter("paused")}
          >
            Paused
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem 
            checked={statusFilter === "draft"} 
            onCheckedChange={() => setStatusFilter("draft")}
          >
            Draft
          </DropdownMenuCheckboxItem>
          
          {platforms.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Platform</DropdownMenuLabel>
              <DropdownMenuCheckboxItem 
                checked={platformFilter === "all"} 
                onCheckedChange={() => setPlatformFilter("all")}
              >
                All Platforms
              </DropdownMenuCheckboxItem>
              {platforms.map(platform => (
                <DropdownMenuCheckboxItem 
                  key={platform}
                  checked={platformFilter === platform} 
                  onCheckedChange={() => setPlatformFilter(platform)}
                >
                  {platform}
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="gradient" size="sm" className="gap-2" onClick={handleCreate}>
        <Plus className="h-4 w-4" />
        New Campaign
      </Button>
    </>
  );

  return (
    <PageContainer>
      <PageHeader
        title="Active Deployment"
        description="Campaign management • Real-time optimization"
        actions={headerActions}
      />

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="mb-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="campaigns" className="gap-2">
            <Rocket className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="forecast" className="gap-2">
            <LineChart className="h-4 w-4" />
            Forecast
          </TabsTrigger>
          <TabsTrigger value="roi" className="gap-2">
            <DollarSign className="h-4 w-4" />
            ROI Report
          </TabsTrigger>
          <TabsTrigger value="demand" className="gap-2">
            <CalendarClock className="h-4 w-4" />
            Demand Planning
          </TabsTrigger>
          <TabsTrigger value="geo" className="gap-2">
            <MapPin className="h-4 w-4" />
            Geo Targeting
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeView === "campaigns" && (
        <>
          {/* Performance Chart */}
          <section className="mb-6">
            <PerformanceChart />
          </section>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Campaigns */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <SectionHeader
                  title="Campaigns"
                  subtitle={`${activeCampaigns} running`}
                />

                <CampaignList
                  campaigns={filteredCampaigns}
                  loading={loading}
                  onToggle={(campaign) => toggleCampaignStatus(campaign.id, campaign.status)}
                  onEdit={handleEdit}
                  onDelete={setDeletingCampaign}
                  onDeploy={handleDeploy}
                  emptyAction={
                    activeFiltersCount > 0 ? (
                      <Button variant="outline" onClick={clearFilters} className="gap-2">
                        <X className="h-4 w-4" />
                        Clear Filters
                      </Button>
                    ) : (
                      <Button variant="gradient" onClick={handleCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Your First Campaign
                      </Button>
                    )
                  }
                />
              </div>

              <CompetitorGhosting />
            </div>

            {/* Right Column - Controls */}
            <div className="space-y-6">
              <BudgetControls
                totalBudget={totalBudget}
                spent={totalSpent}
                dailyLimit={5000}
                onUpdateBudget={() => {}}
              />
              <RealTimeMorphing campaigns={filteredCampaigns} />
            </div>
          </div>
        </>
      )}

      {activeView === "performance" && (
        <CampaignPerformanceDashboard campaigns={filteredCampaigns} loading={loading} />
      )}

      {activeView === "inventory" && (
        <InventorySyncPanel />
      )}

      {activeView === "analytics" && (
        <InventoryAnalytics 
          inventory={inventory} 
          movements={movements} 
          campaigns={filteredCampaigns} 
        />
      )}

      {activeView === "forecast" && (
        <InventoryForecast 
          inventory={inventory} 
          movements={movements} 
          campaigns={filteredCampaigns} 
        />
      )}

      {activeView === "roi" && (
        <CampaignInventoryROI 
          inventory={inventory} 
          movements={movements} 
          campaigns={filteredCampaigns} 
        />
      )}

      {activeView === "demand" && (
        <InventoryDemandPlanning 
          inventory={inventory} 
          movements={movements} 
          campaigns={filteredCampaigns} 
        />
      )}

      {activeView === "geo" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GeoLocationTargeting />
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <h3 className="font-semibold mb-4">Region Performance Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="font-medium">Top Performing Region</span>
                  <span className="text-signal-rising font-bold">California (8.2%)</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="font-medium">Total Reach</span>
                  <span className="font-bold">312K impressions</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="font-medium">Avg. Conversion Rate</span>
                  <span className="font-bold">3.2%</span>
                </div>
              </div>
            </div>
            <RealTimeMorphing campaigns={filteredCampaigns} />
          </div>
        </div>
      )}

      <GlassBoxAssistant />

      <CampaignDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        campaign={editingCampaign}
        onSave={handleSave}
      />

      <DialogConfirm
        open={!!deletingCampaign}
        onOpenChange={() => setDeletingCampaign(null)}
        title="Delete Campaign"
        description={`Are you sure you want to delete "${deletingCampaign?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />

      <CampaignDeployWizard
        open={deployWizardOpen}
        onOpenChange={setDeployWizardOpen}
        campaignName={deployingCampaign?.name}
        onDeploy={(config) => {
          console.log("Deployed:", config);
          setDeployWizardOpen(false);
          setDeployingCampaign(null);
        }}
      />
    </PageContainer>
  );
};

export default ActiveDeployment;
