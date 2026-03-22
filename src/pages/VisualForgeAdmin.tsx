import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Palette, 
  Video, 
  Image, 
  Layout, 
  Monitor, 
  Instagram,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  MessageSquare,
  Loader2,
  Upload,
  Play,
  RefreshCw,
  Send,
  FileImage,
  Link as LinkIcon,
  Trash2,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

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
  user_id: string;
  request_type: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
  feedback: string | null;
  deliverables: any;
  reference_urls: string[] | null;
  assigned_to: string | null;
}

interface Deliverable {
  id: string;
  type: string;
  url: string;
  name: string;
  version: number;
  [key: string]: string | number;
}

export default function VisualForgeAdmin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [requests, setRequests] = useState<VisualRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VisualRequest | null>(null);
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [newDeliverableUrl, setNewDeliverableUrl] = useState("");
  const [newDeliverableName, setNewDeliverableName] = useState("");
  const [newDeliverableType, setNewDeliverableType] = useState<'image' | 'video' | 'webpage'>('image');

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        toast.error("Access denied. Admin privileges required.");
        navigate('/dashboard');
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin]);

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

  const sendNotification = async (
    request: VisualRequest, 
    type: 'status_change' | 'deliverable_added' | 'feedback',
    extras?: { oldStatus?: string; newStatus?: string; deliverableName?: string; feedback?: string }
  ) => {
    try {
      // Get user email from profiles/email_verifications
      const { data: emailData } = await supabase
        .from('email_verifications')
        .select('email')
        .eq('user_id', request.user_id)
        .single();

      if (emailData?.email) {
        await supabase.functions.invoke('send-visual-forge-notification', {
          body: {
            email: emailData.email,
            type,
            requestTitle: request.title,
            ...extras,
          },
        });
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Don't fail the main operation if notification fails
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const currentRequest = requests.find(r => r.id === id);
      const oldStatus = currentRequest?.status;
      
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("visual_forge_requests")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      setRequests(prev => prev.map(r => r.id === id ? { ...r, status, ...updateData } : r));
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, status, ...updateData } : null);
      }
      
      // Send notification
      if (currentRequest && oldStatus !== status) {
        sendNotification(currentRequest, 'status_change', { oldStatus, newStatus: status });
      }
      
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const updateFeedback = async (id: string) => {
    if (!feedback.trim()) return;
    
    setUpdating(true);
    try {
      const currentRequest = requests.find(r => r.id === id);
      
      const { error } = await supabase
        .from("visual_forge_requests")
        .update({ feedback, status: 'revision' })
        .eq("id", id);

      if (error) throw error;

      setRequests(prev => prev.map(r => r.id === id ? { ...r, feedback, status: 'revision' } : r));
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, feedback, status: 'revision' } : null);
      }
      
      // Send notification
      if (currentRequest) {
        sendNotification(currentRequest, 'feedback', { feedback });
      }
      
      setFeedback("");
      toast.success("Feedback sent to user");
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error("Failed to send feedback");
    } finally {
      setUpdating(false);
    }
  };

  const addDeliverable = async (id: string) => {
    if (!newDeliverableUrl.trim()) return;

    setUpdating(true);
    try {
      const currentRequest = requests.find(r => r.id === id);
      const currentDeliverables: Deliverable[] = currentRequest?.deliverables || [];
      const version = currentDeliverables.length + 1;

      const newDeliverable: Deliverable = {
        id: crypto.randomUUID(),
        type: newDeliverableType,
        url: newDeliverableUrl,
        name: newDeliverableName || `Deliverable v${version}`,
        version,
      };

      const updatedDeliverables = [...currentDeliverables, newDeliverable];

      const { error } = await supabase
        .from("visual_forge_requests")
        .update({ deliverables: updatedDeliverables, status: 'review' })
        .eq("id", id);

      if (error) throw error;

      setRequests(prev => prev.map(r => r.id === id ? { ...r, deliverables: updatedDeliverables, status: 'review' } : r));
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, deliverables: updatedDeliverables, status: 'review' } : null);
      }
      
      // Send notification
      if (currentRequest) {
        sendNotification(currentRequest, 'deliverable_added', { 
          deliverableName: newDeliverable.name,
          newStatus: 'review'
        });
      }
      
      setNewDeliverableUrl("");
      setNewDeliverableName("");
      toast.success("Deliverable added");
    } catch (error) {
      console.error("Error adding deliverable:", error);
      toast.error("Failed to add deliverable");
    } finally {
      setUpdating(false);
    }
  };

  const removeDeliverable = async (requestId: string, deliverableId: string) => {
    setUpdating(true);
    try {
      const currentRequest = requests.find(r => r.id === requestId);
      const updatedDeliverables = (currentRequest?.deliverables || []).filter(
        (d: Deliverable) => d.id !== deliverableId
      );

      const { error } = await supabase
        .from("visual_forge_requests")
        .update({ deliverables: updatedDeliverables })
        .eq("id", requestId);

      if (error) throw error;

      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, deliverables: updatedDeliverables } : r));
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(prev => prev ? { ...prev, deliverables: updatedDeliverables } : null);
      }
      toast.success("Deliverable removed");
    } catch (error) {
      console.error("Error removing deliverable:", error);
      toast.error("Failed to remove deliverable");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Play className="w-3 h-3 mr-1" /> In Progress</Badge>;
      case "review":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Eye className="w-3 h-3 mr-1" /> In Review</Badge>;
      case "revision":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><MessageSquare className="w-3 h-3 mr-1" /> Revision</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">High</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getAssetType = (typeId: string) => ASSET_TYPES.find(t => t.id === typeId);

  const statusCounts = {
    pending: requests.filter(r => r.status === 'pending').length,
    'in-progress': requests.filter(r => r.status === 'in-progress').length,
    review: requests.filter(r => r.status === 'review').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Palette className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">Visual Forge Admin</h1>
                <p className="text-muted-foreground">Manage and fulfill creative requests</p>
              </div>
            </div>
            
            <Button onClick={fetchRequests} variant="outline" className="gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-2xl font-bold">{statusCounts.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold">{statusCounts['in-progress']}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-2xl font-bold">{statusCounts.review}</p>
                    <p className="text-sm text-muted-foreground">In Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold">{statusCounts.completed}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requests Table */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-secondary">
              <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress ({statusCounts['in-progress']})</TabsTrigger>
              <TabsTrigger value="review">Review ({statusCounts.review})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({statusCounts.completed})</TabsTrigger>
            </TabsList>

            {["all", "pending", "in-progress", "review", "completed"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests
                      .filter(r => tab === "all" || r.status === tab)
                      .map((request) => {
                        const assetType = getAssetType(request.request_type);
                        const Icon = assetType?.icon || Image;
                        const deliverableCount = request.deliverables?.length || 0;
                        
                        return (
                          <motion.div
                            key={request.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedRequest(request);
                              setFeedback(request.feedback || "");
                            }}
                          >
                            <Card className="border-border/50 hover:border-primary/30 transition-all">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <div className={`p-3 rounded-xl bg-gradient-to-br ${assetType?.color || "from-gray-500 to-gray-600"}`}>
                                    <Icon className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                      <h3 className="font-semibold">{request.title}</h3>
                                      {getStatusBadge(request.status)}
                                      {getPriorityBadge(request.priority)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {assetType?.name} • Created {format(new Date(request.created_at), "MMM d, yyyy")}
                                      {deliverableCount > 0 && ` • ${deliverableCount} deliverable(s)`}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Select
                                      value={request.status}
                                      onValueChange={(status) => updateStatus(request.id, status)}
                                    >
                                      <SelectTrigger className="w-32" onClick={(e) => e.stopPropagation()}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="review">In Review</SelectItem>
                                        <SelectItem value="revision">Revision</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    {requests.filter(r => tab === "all" || r.status === tab).length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No requests found</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedRequest.title}
                  {getStatusBadge(selectedRequest.status)}
                </DialogTitle>
                <DialogDescription>
                  {getAssetType(selectedRequest.request_type)?.name} • {getPriorityBadge(selectedRequest.priority)}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 pr-4">
                  {/* Brief */}
                  <div>
                    <Label className="text-muted-foreground">Creative Brief</Label>
                    <p className="mt-1">{selectedRequest.description || "No description provided"}</p>
                  </div>

                  {/* Reference URLs */}
                  {selectedRequest.reference_urls && selectedRequest.reference_urls.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground">Reference URLs</Label>
                      <div className="mt-1 space-y-1">
                        {selectedRequest.reference_urls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <LinkIcon className="w-3 h-3" />
                            {url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deliverables */}
                  <div>
                    <Label className="text-muted-foreground mb-2 block">Deliverables</Label>
                    <div className="space-y-2 mb-4">
                      {selectedRequest.deliverables?.map((d: Deliverable) => (
                        <div key={d.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                          <FileImage className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{d.name}</p>
                            <a 
                              href={d.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              {d.url}
                            </a>
                          </div>
                          <Badge variant="outline">v{d.version}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDeliverable(selectedRequest.id, d.id)}
                            disabled={updating}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      {(!selectedRequest.deliverables || selectedRequest.deliverables.length === 0) && (
                        <p className="text-sm text-muted-foreground">No deliverables yet</p>
                      )}
                    </div>

                    {/* Add Deliverable Form */}
                    <Card className="border-dashed">
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-medium">Add Deliverable</p>
                        <div className="grid grid-cols-3 gap-2">
                          <Select
                            value={newDeliverableType}
                            onValueChange={(v) => setNewDeliverableType(v as any)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="webpage">Webpage</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Name (optional)"
                            value={newDeliverableName}
                            onChange={(e) => setNewDeliverableName(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Input
                              placeholder="URL"
                              value={newDeliverableUrl}
                              onChange={(e) => setNewDeliverableUrl(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              onClick={() => addDeliverable(selectedRequest.id)}
                              disabled={!newDeliverableUrl.trim() || updating}
                              size="sm"
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Feedback */}
                  <div>
                    <Label className="text-muted-foreground mb-2 block">Feedback / Request Revision</Label>
                    <Textarea
                      placeholder="Enter feedback for the user..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                    />
                    <Button
                      className="mt-2 gap-2"
                      onClick={() => updateFeedback(selectedRequest.id)}
                      disabled={!feedback.trim() || updating}
                    >
                      <Send className="w-4 h-4" />
                      Send Feedback
                    </Button>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter>
                <div className="flex gap-2 w-full">
                  <Select
                    value={selectedRequest.status}
                    onValueChange={(status) => updateStatus(selectedRequest.id, status)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">In Review</SelectItem>
                      <SelectItem value="revision">Revision</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => setSelectedRequest(null)} className="ml-auto">
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
