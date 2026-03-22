import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Palette, 
  Video, 
  Image, 
  Layout, 
  Monitor, 
  Instagram,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  MessageSquare,
  Loader2,
  Upload,
  Sparkles,
  Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { AICreativeGenerator } from "@/components/creative/AICreativeGenerator";
import { VisualForgeHeader } from "@/components/forge/VisualForgeHeader";
import { AssetTypeGrid } from "@/components/forge/AssetTypeGrid";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { NoticeState } from "@/components/shared";

const ASSET_TYPES = [
  { id: "tiktok-video", name: "TikTok Feed Video", icon: Video, color: "from-pink-500 to-red-500" },
  { id: "instagram-story", name: "Instagram Story Ad", icon: Instagram, color: "from-purple-500 to-pink-500" },
  { id: "instagram-feed", name: "Instagram Feed Post", icon: Image, color: "from-orange-500 to-pink-500" },
  { id: "landing-hero", name: "Landing Page Hero", icon: Layout, color: "from-blue-500 to-cyan-500" },
  { id: "display-banner", name: "Display Banner Ad", icon: Monitor, color: "from-green-500 to-teal-500" },
  { id: "facebook-ad", name: "Facebook Feed Ad", icon: Image, color: "from-blue-600 to-blue-400" },
];

interface VisualRequest {
  id: string;
  request_type: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
  feedback: string | null;
  deliverables: any;
}

export default function VisualForge() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { trackPageView, trackFeatureUse, trackAIGeneration } = useUsageTracking();
  const [requests, setRequests] = useState<VisualRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VisualRequest | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<"requests" | "ai-generator">("requests");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "normal",
    referenceUrls: "",
  });

  useEffect(() => {
    trackPageView("visual_forge");
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("visual_forge_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!user || !selectedType || !formData.title) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("visual_forge_requests")
        .insert({
          user_id: user.id,
          request_type: selectedType,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          reference_urls: formData.referenceUrls ? formData.referenceUrls.split("\n").filter(Boolean) : [],
        });

      if (error) throw error;

      trackFeatureUse("visual_forge", { action: "submit_request", type: selectedType });
      toast.success("Request submitted successfully!");
      setShowNewRequest(false);
      setSelectedType(null);
      setFormData({ title: "", description: "", priority: "normal", referenceUrls: "" });
      fetchRequests();
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssetGenerated = (asset: { id: string; url: string; prompt: string }) => {
    trackAIGeneration("visual_forge", "creative_asset", { assetId: asset.id });
  };

  const getAssetType = (typeId: string) => ASSET_TYPES.find(t => t.id === typeId);

  const brandColors = organization?.primary_color 
    ? [organization.primary_color, organization.secondary_color, organization.accent_color].filter(Boolean) as string[]
    : undefined;

  const assetTypesForGrid = ASSET_TYPES.map(type => ({
    id: type.id,
    name: type.name,
    icon: type.icon,
    color: type.color,
    count: requests.filter(r => r.request_type === type.id).length,
  }));

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      <Sidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-6xl mx-auto">
          <VisualForgeHeader onNewRequest={() => setShowNewRequest(true)} />

          {/* Main Tabs */}
          <Tabs value={activeMainTab} onValueChange={(v) => setActiveMainTab(v as any)} className="mb-6">
            <TabsList className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-1">
              <TabsTrigger value="requests" className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Palette className="h-4 w-4" />
                Requests
              </TabsTrigger>
              <TabsTrigger value="ai-generator" className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Wand2 className="h-4 w-4" />
                AI Generator
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {activeMainTab === "ai-generator" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AICreativeGenerator 
                brandColors={brandColors} 
                onAssetGenerated={handleAssetGenerated}
              />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Tips for Great Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Be Specific</h4>
                    <p className="text-sm text-muted-foreground">
                      Include details about style, mood, colors, and composition.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Use Brand Colors</h4>
                    <p className="text-sm text-muted-foreground">
                      Your brand colors are automatically included for consistency.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Iterate</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate multiple variations and refine your prompts.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMainTab === "requests" && (
            <>
              {/* Asset Types Grid */}
              {!showNewRequest && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {assetTypesForGrid.map((type) => {
                    const Icon = type.icon;
                    return (
                      <motion.div
                        key={type.id}
                        whileHover={{ scale: 1.02 }}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedType(type.id);
                          setShowNewRequest(true);
                        }}
                      >
                        <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:shadow-sm hover:shadow-primary/10 transition-all rounded-2xl">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl bg-gradient-to-br ${type.color} shadow-sm`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{type.name}</h3>
                                <p className="text-sm text-muted-foreground">{type.count} requests</p>
                              </div>
                              <Plus className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* New Request Form */}
              <AnimatePresence>
                {showNewRequest && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-8"
                  >
                    <Card className="border-primary/20">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-primary" />
                              Create Visual Asset Request
                            </CardTitle>
                            <CardDescription>
                              Our creative team will craft custom visuals for your campaign
                            </CardDescription>
                          </div>
                          <Button variant="ghost" onClick={() => {
                            setShowNewRequest(false);
                            setSelectedType(null);
                          }}>
                            <XCircle className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Asset Type Selection */}
                        <div className="space-y-2">
                          <Label>Asset Type</Label>
                          <div className="grid grid-cols-3 gap-3">
                            {ASSET_TYPES.map((type) => {
                              const Icon = type.icon;
                              return (
                                <button
                                  key={type.id}
                                  onClick={() => setSelectedType(type.id)}
                                  className={`p-4 rounded-xl border text-left transition-all ${
                                    selectedType === type.id 
                                      ? "border-primary bg-primary/10" 
                                      : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  <Icon className={`w-5 h-5 mb-2 ${selectedType === type.id ? "text-primary" : "text-muted-foreground"}`} />
                                  <p className="font-medium text-sm">{type.name}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {selectedType && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="title">Project Title</Label>
                                <Input 
                                  id="title"
                                  placeholder="e.g., Summer Sale Campaign Hero"
                                  value={formData.title}
                                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select 
                                  value={formData.priority} 
                                  onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low - 5-7 days</SelectItem>
                                    <SelectItem value="normal">Normal - 3-5 days</SelectItem>
                                    <SelectItem value="high">High - 1-2 days</SelectItem>
                                    <SelectItem value="urgent">Urgent - 24 hours</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="description">Creative Brief</Label>
                              <Textarea 
                                id="description"
                                placeholder="Describe your vision, key messaging, target audience, and any specific requirements..."
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="references">Reference URLs (one per line)</Label>
                              <Textarea 
                                id="references"
                                placeholder="https://example.com/inspiration1&#10;https://example.com/inspiration2"
                                rows={3}
                                value={formData.referenceUrls}
                                onChange={(e) => setFormData(prev => ({ ...prev, referenceUrls: e.target.value }))}
                              />
                            </div>

                            <div className="flex justify-end gap-3">
                              <Button variant="outline" onClick={() => {
                                setShowNewRequest(false);
                                setSelectedType(null);
                              }}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleSubmitRequest}
                                disabled={!formData.title || submitting}
                                className="gap-2"
                              >
                                {submitting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Upload className="w-4 h-4" />
                                )}
                                Submit Request
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Requests List */}
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-1">
                  <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">All Requests</TabsTrigger>
                  <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Pending</TabsTrigger>
                  <TabsTrigger value="in-progress" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">In Progress</TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Completed</TabsTrigger>
                </TabsList>

                {["all", "pending", "in-progress", "completed"].map((tab) => (
                  <TabsContent key={tab} value={tab}>
                    {loading ? (
                      <LoadingState />
                    ) : (
                      <div className="space-y-4">
                        {requests
                          .filter(r => tab === "all" || r.status === tab)
                          .map((request) => {
                            const assetType = getAssetType(request.request_type);
                            const Icon = assetType?.icon || Image;
                            return (
                              <motion.div
                                key={request.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="cursor-pointer"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <Card className="border-border/50 hover:border-primary/30 transition-all">
                                  <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                      <div className={`p-3 rounded-xl bg-gradient-to-br ${assetType?.color || "from-gray-500 to-gray-600"}`}>
                                        <Icon className="w-5 h-5 text-white" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                          <h3 className="font-semibold">{request.title}</h3>
                                          <StatusBadge status={request.status as any} />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          {assetType?.name} • Created {format(new Date(request.created_at), "MMM d, yyyy")}
                                        </p>
                                      </div>
                                      <Button variant="ghost" size="sm">
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })}
                        {requests.filter(r => tab === "all" || r.status === tab).length === 0 && (
                          <EmptyState
                            icon={Palette}
                            title="No requests found"
                          />
                        )}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </>
          )}
        </div>
      </main>

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.title}</DialogTitle>
            <DialogDescription>
              {getAssetType(selectedRequest?.request_type || "")?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <StatusBadge status={selectedRequest.status as any} />
                <Badge variant="outline">{selectedRequest.priority} priority</Badge>
              </div>
              
              {selectedRequest.description && (
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-1">Creative Brief</p>
                  <p>{selectedRequest.description}</p>
                </div>
              )}

              {selectedRequest.feedback && (
                <NoticeState
                  type="warning"
                  title="Team Feedback"
                  message={selectedRequest.feedback}
                />
              )}

              {selectedRequest.deliverables && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-400 mb-2">Deliverables</p>
                  <pre className="text-sm">{JSON.stringify(selectedRequest.deliverables, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
