import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Palette, 
  Clock, 
  Play, 
  Pause, 
  CheckCircle2,
  Eye,
  MessageSquare,
  Upload,
  Send,
  Trash2,
  DollarSign,
  User,
  Timer,
  FileImage,
  Link as LinkIcon,
  Video,
  Image,
  Layout,
  Monitor,
  Instagram,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, differenceInMinutes } from "date-fns";

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
  hourly_rate: number;
  total_time_minutes: number;
  total_cost: number;
}

interface TimeEntry {
  id: string;
  request_id: string;
  creative_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
}

interface Deliverable {
  id: string;
  type: string;
  url: string;
  name: string;
  version: number;
}

export function SysAdminCreatives() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<VisualRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VisualRequest | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [newDeliverableUrl, setNewDeliverableUrl] = useState("");
  const [newDeliverableName, setNewDeliverableName] = useState("");
  const [newDeliverableType, setNewDeliverableType] = useState<'image' | 'video' | 'webpage'>('image');
  const [timeNotes, setTimeNotes] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, requestId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${requestId}/${crypto.randomUUID()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('deliverables')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('deliverables')
        .getPublicUrl(fileName);

      setNewDeliverableUrl(urlData.publicUrl);
      setNewDeliverableName(file.name);
      
      // Auto-detect type
      if (file.type.startsWith('video/')) {
        setNewDeliverableType('video');
      } else if (file.type.startsWith('image/')) {
        setNewDeliverableType('image');
      }

      toast.success("File uploaded successfully");
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error("Failed to upload file");
    } finally {
      setUploadingFile(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer && timerStartTime) {
      interval = setInterval(() => {
        setElapsedTime(differenceInMinutes(new Date(), timerStartTime));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, timerStartTime]);

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

  const fetchTimeEntries = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from("creative_time_entries")
        .select("*")
        .eq("request_id", requestId)
        .order("started_at", { ascending: false });

      if (error) throw error;
      setTimeEntries(data || []);

      // Check if there's an active timer
      const activeEntry = data?.find(e => !e.ended_at);
      if (activeEntry) {
        setActiveTimer(activeEntry.id);
        setTimerStartTime(new Date(activeEntry.started_at));
      }
    } catch (error) {
      console.error("Error fetching time entries:", error);
    }
  };

  const startTimer = async (requestId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("creative_time_entries")
        .insert({
          request_id: requestId,
          creative_id: user.id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setActiveTimer(data.id);
      setTimerStartTime(new Date());
      setElapsedTime(0);
      setTimeEntries(prev => [data, ...prev]);

      // Update request status to in-progress
      await supabase
        .from("visual_forge_requests")
        .update({ status: 'in-progress', assigned_to: user.id })
        .eq("id", requestId);

      setRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'in-progress', assigned_to: user.id } : r
      ));

      toast.success("Timer started");
    } catch (error) {
      console.error("Error starting timer:", error);
      toast.error("Failed to start timer");
    }
  };

  const stopTimer = async () => {
    if (!activeTimer) return;

    const endTime = new Date();
    const durationMinutes = timerStartTime 
      ? differenceInMinutes(endTime, timerStartTime) 
      : 0;

    try {
      const { error } = await supabase
        .from("creative_time_entries")
        .update({
          ended_at: endTime.toISOString(),
          duration_minutes: Math.max(1, durationMinutes), // Minimum 1 minute
          notes: timeNotes || null,
        })
        .eq("id", activeTimer);

      if (error) throw error;

      // Update request total time and cost
      if (selectedRequest) {
        const newTotalMinutes = (selectedRequest.total_time_minutes || 0) + Math.max(1, durationMinutes);
        const newTotalCost = (newTotalMinutes / 60) * (selectedRequest.hourly_rate || 75);

        await supabase
          .from("visual_forge_requests")
          .update({ 
            total_time_minutes: newTotalMinutes,
            total_cost: newTotalCost
          })
          .eq("id", selectedRequest.id);

        setRequests(prev => prev.map(r => 
          r.id === selectedRequest.id 
            ? { ...r, total_time_minutes: newTotalMinutes, total_cost: newTotalCost } 
            : r
        ));
        setSelectedRequest(prev => prev 
          ? { ...prev, total_time_minutes: newTotalMinutes, total_cost: newTotalCost }
          : null
        );
      }

      setTimeEntries(prev => prev.map(e => 
        e.id === activeTimer 
          ? { ...e, ended_at: endTime.toISOString(), duration_minutes: Math.max(1, durationMinutes), notes: timeNotes }
          : e
      ));

      setActiveTimer(null);
      setTimerStartTime(null);
      setElapsedTime(0);
      setTimeNotes("");
      toast.success(`Timer stopped: ${Math.max(1, durationMinutes)} minutes recorded`);
    } catch (error) {
      console.error("Error stopping timer:", error);
      toast.error("Failed to stop timer");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("visual_forge_requests")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updateData } : r));
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, ...updateData } : null);
      }

      // Send notification
      const request = requests.find(r => r.id === id);
      if (request) {
        sendNotification(request, 'status_change', { newStatus: status });
      }

      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const sendNotification = async (request: VisualRequest, type: string, extras?: any) => {
    try {
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
    }
  };

  const addDeliverable = async (id: string) => {
    if (!newDeliverableUrl.trim()) return;

    setUpdating(true);
    try {
      const currentRequest = requests.find(r => r.id === id);
      const currentDeliverables: Deliverable[] = currentRequest?.deliverables || [];
      const version = currentDeliverables.length + 1;

      const newDeliverable = {
        id: crypto.randomUUID(),
        type: newDeliverableType,
        url: newDeliverableUrl,
        name: newDeliverableName || `Deliverable v${version}`,
        version,
      };

      const updatedDeliverables = [...currentDeliverables, newDeliverable];

      const { error } = await supabase
        .from("visual_forge_requests")
        .update({ deliverables: updatedDeliverables as any, status: 'review' })
        .eq("id", id);

      if (error) throw error;

      setRequests(prev => prev.map(r => r.id === id ? { ...r, deliverables: updatedDeliverables, status: 'review' } : r));
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, deliverables: updatedDeliverables, status: 'review' } : null);
      }

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

  const sendFeedback = async (id: string) => {
    if (!feedback.trim()) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("visual_forge_requests")
        .update({ feedback, status: 'revision' })
        .eq("id", id);

      if (error) throw error;

      setRequests(prev => prev.map(r => r.id === id ? { ...r, feedback, status: 'revision' } : r));
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, feedback, status: 'revision' } : null);
      }

      const request = requests.find(r => r.id === id);
      if (request) {
        sendNotification(request, 'feedback', { feedback });
      }

      setFeedback("");
      toast.success("Feedback sent");
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error("Failed to send feedback");
    } finally {
      setUpdating(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatElapsedTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const secs = Math.floor((Date.now() - (timerStartTime?.getTime() || 0)) / 1000) % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const getAssetType = (typeId: string) => ASSET_TYPES.find(t => t.id === typeId);

  const statusCounts = {
    pending: requests.filter(r => r.status === 'pending').length,
    'in-progress': requests.filter(r => r.status === 'in-progress').length,
    review: requests.filter(r => r.status === 'review').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  const totalCreativeTime = requests.reduce((sum, r) => sum + (r.total_time_minutes || 0), 0);
  const totalCreativeCost = requests.reduce((sum, r) => sum + (r.total_cost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Creative Studio</h2>
          <p className="text-muted-foreground">Manage visual requests with time tracking</p>
        </div>
        <Button onClick={fetchRequests} variant="outline" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/15">
                <Play className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts['in-progress']}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15">
                <Eye className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.review}</p>
                <p className="text-sm text-muted-foreground">Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/15">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/15">
                <Timer className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatDuration(totalCreativeTime)}</p>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/15">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalCreativeCost.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Total Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-1">
          <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Pending ({statusCounts.pending})</TabsTrigger>
          <TabsTrigger value="in-progress" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">In Progress ({statusCounts['in-progress']})</TabsTrigger>
          <TabsTrigger value="review" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Review ({statusCounts.review})</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Completed ({statusCounts.completed})</TabsTrigger>
        </TabsList>

        {["pending", "in-progress", "review", "completed"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="grid grid-cols-2 gap-4">
              {requests
                .filter(r => r.status === tab)
                .map((request) => {
                  const assetType = getAssetType(request.request_type);
                  const Icon = assetType?.icon || Image;
                  
                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => {
                        setSelectedRequest(request);
                        setFeedback(request.feedback || "");
                        fetchTimeEntries(request.id);
                      }}
                      className="cursor-pointer"
                    >
                      <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 hover:shadow-md transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${assetType?.color || "from-gray-500 to-gray-600"}`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">{request.title}</h3>
                                {getStatusBadge(request.status)}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {request.description || 'No description'}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Timer className="w-3 h-3" />
                                  {formatDuration(request.total_time_minutes || 0)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  ${(request.total_cost || 0).toFixed(0)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileImage className="w-3 h-3" />
                                  {request.deliverables?.length || 0} deliverables
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => {
        if (activeTimer) {
          toast.error("Please stop the timer before closing");
          return;
        }
        setSelectedRequest(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedRequest && getAssetType(selectedRequest.request_type) && (
                <div className={`p-2 rounded-lg bg-gradient-to-br ${getAssetType(selectedRequest.request_type)?.color}`}>
                  {(() => {
                    const Icon = getAssetType(selectedRequest.request_type)?.icon || Image;
                    return <Icon className="w-5 h-5 text-white" />;
                  })()}
                </div>
              )}
              {selectedRequest?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Timer Section */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-mono font-bold">
                        {activeTimer ? formatElapsedTime(elapsedTime) : '00:00:00'}
                      </div>
                      <div>
                        <p className="font-medium">Time Tracker</p>
                        <p className="text-sm text-muted-foreground">
                          Total: {formatDuration(selectedRequest.total_time_minutes || 0)} • 
                          Cost: ${(selectedRequest.total_cost || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeTimer ? (
                        <>
                          <Input
                            placeholder="Add notes..."
                            value={timeNotes}
                            onChange={(e) => setTimeNotes(e.target.value)}
                            className="w-48"
                          />
                          <Button onClick={stopTimer} variant="destructive" className="gap-2">
                            <Pause className="w-4 h-4" />
                            Stop
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={() => startTimer(selectedRequest.id)} 
                          className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4" />
                          Start Timer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status & Actions */}
              <div className="flex items-center gap-4">
                <Select
                  value={selectedRequest.status}
                  onValueChange={(value) => updateStatus(selectedRequest.id, value)}
                  disabled={updating || !!activeTimer}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="revision">Revision</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                {getStatusBadge(selectedRequest.status)}
              </div>

              {/* Description */}
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{selectedRequest.description || 'No description provided'}</p>
              </div>

              {/* Reference URLs */}
              {selectedRequest.reference_urls && selectedRequest.reference_urls.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">References</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedRequest.reference_urls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <LinkIcon className="w-3 h-3" />
                        Reference {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Entries */}
              <div>
                <Label className="text-muted-foreground mb-2 block">Time Log</Label>
                <ScrollArea className="h-32 border rounded-lg">
                  <div className="p-2 space-y-2">
                    {timeEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span>{format(new Date(entry.started_at), 'MMM d, HH:mm')}</span>
                          {entry.ended_at && (
                            <span className="text-muted-foreground">
                              → {format(new Date(entry.ended_at), 'HH:mm')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          {entry.notes && (
                            <span className="text-muted-foreground italic">{entry.notes}</span>
                          )}
                          <Badge variant="secondary">
                            {entry.duration_minutes ? `${entry.duration_minutes}m` : 'Active'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {timeEntries.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No time entries yet</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Deliverables */}
              <div>
                <Label className="text-muted-foreground mb-2 block">Deliverables</Label>
                <div className="space-y-2 mb-4">
                  {(selectedRequest.deliverables || []).map((d: Deliverable) => (
                    <div key={d.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileImage className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{d.name}</p>
                          <p className="text-xs text-muted-foreground">Version {d.version} • {d.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={d.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Deliverable */}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Deliverable URL..."
                      value={newDeliverableUrl}
                      onChange={(e) => setNewDeliverableUrl(e.target.value)}
                    />
                  </div>
                  <Input
                    placeholder="Name"
                    value={newDeliverableName}
                    onChange={(e) => setNewDeliverableName(e.target.value)}
                    className="w-32"
                  />
                  <Select value={newDeliverableType} onValueChange={(v: any) => setNewDeliverableType(v)}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="webpage">Webpage</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => addDeliverable(selectedRequest.id)} disabled={updating || !newDeliverableUrl}>
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <Label className="text-muted-foreground mb-2 block">Send Feedback to Client</Label>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Write feedback or revision notes..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={() => sendFeedback(selectedRequest.id)} 
                    disabled={updating || !feedback.trim()}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
