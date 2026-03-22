import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Users, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  Loader2,
  RefreshCw,
  Mail,
  Globe,
  Building2,
  MessageSquare,
  Trash2,
  UserCog,
  Crown,
  UserCheck,
  History,
  UserPlus,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface AccessRequest {
  id: string;
  email: string;
  website_url: string;
  company_name: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

interface UserWithRole {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  role: 'admin' | 'moderator' | 'user' | null;
  role_id: string | null;
}

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: unknown;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  status: string;
  expires_at: string;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

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
      fetchAccessRequests();
      fetchUsers();
      fetchAuditLogs();
      fetchInvitations();
    }
  }, [isAdmin]);

  const fetchAccessRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccessRequests(data || []);
    } catch (error) {
      console.error('Error fetching access requests:', error);
      toast.error("Failed to load access requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      // Fetch profiles with display names
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Fetch email verifications to get emails
      const { data: emailVerifications, error: emailError } = await supabase
        .from('email_verifications')
        .select('user_id, email');

      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        const emailRecord = emailVerifications?.find(e => e.user_id === profile.user_id);
        return {
          id: profile.user_id,
          email: emailRecord?.email || 'Unknown',
          display_name: profile.display_name,
          created_at: profile.created_at,
          role: userRole?.role || null,
          role_id: userRole?.id || null,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setAuditLoading(false);
    }
  };

  const fetchInvitations = async () => {
    setInvitationsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setInvitationsLoading(false);
    }
  };

  const logAuditAction = async (action: string, targetType: string, targetId: string | null, details?: Record<string, any>) => {
    if (!user) return;
    try {
      await supabase.from('admin_audit_logs').insert({
        admin_id: user.id,
        action,
        target_type: targetType,
        target_id: targetId,
        details: details || null,
      });
      fetchAuditLogs();
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail) return;
    setSendingInvite(true);
    try {
      const { error } = await supabase.functions.invoke('send-user-invitation', {
        body: { email: inviteEmail, message: inviteMessage },
      });

      if (error) throw error;

      toast.success(`Invitation sent to ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteMessage("");
      fetchInvitations();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error("Failed to send invitation");
    } finally {
      setSendingInvite(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user', existingRoleId: string | null) => {
    const targetUser = users.find(u => u.id === userId);
    const oldRole = targetUser?.role;
    
    setProcessingId(userId);
    try {
      if (existingRoleId) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('id', existingRoleId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
        if (error) throw error;
      }

      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );
      
      await logAuditAction('update_role', 'user', userId, { 
        old_role: oldRole, 
        new_role: newRole,
        email: targetUser?.email 
      });
      
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error("Failed to update role");
    } finally {
      setProcessingId(null);
    }
  };

  const removeUserRole = async (userId: string, roleId: string) => {
    const targetUser = users.find(u => u.id === userId);
    
    setProcessingId(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, role: null, role_id: null } : u)
      );
      
      await logAuditAction('remove_role', 'user', userId, { 
        removed_role: targetUser?.role,
        email: targetUser?.email 
      });
      
      toast.success("Role removed");
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error("Failed to remove role");
    } finally {
      setProcessingId(null);
    }
  };

  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
    const request = accessRequests.find(r => r.id === id);
    if (!request) return;

    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('access_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Log the audit action
      await logAuditAction(
        status === 'approved' ? 'approve_request' : 'reject_request', 
        'access_request', 
        id, 
        { email: request.email, company: request.company_name }
      );

      // Send email notification
      try {
        const { error: emailError } = await supabase.functions.invoke('send-access-notification', {
          body: {
            email: request.email,
            status,
            company_name: request.company_name,
          },
        });

        if (emailError) {
          console.error('Failed to send notification email:', emailError);
          toast.warning(`Request ${status}, but notification email failed to send`);
        } else {
          toast.success(`Request ${status} and notification sent`);
        }
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        toast.warning(`Request ${status}, but notification email failed`);
      }

      setAccessRequests(prev => 
        prev.map(req => req.id === id ? { ...req, status } : req)
      );
      
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error("Failed to update request");
    } finally {
      setProcessingId(null);
    }
  };

  const deleteRequest = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('access_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAccessRequests(prev => prev.filter(req => req.id !== id));
      toast.success("Request deleted");
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error("Failed to delete request");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>;
    }
  };

  const pendingCount = accessRequests.filter(r => r.status === 'pending').length;

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
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      <Sidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/80 to-accent/80 shadow-sm shadow-primary/20">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage access requests and users</p>
              </div>
            </div>
            
            <Button onClick={() => { fetchAccessRequests(); fetchUsers(); }} variant="outline" className="gap-2">
              <RefreshCw className={`w-4 h-4 ${loading || usersLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/15">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/15">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {accessRequests.filter(r => r.status === 'approved').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/15">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {accessRequests.filter(r => r.status === 'rejected').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/15">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-secondary">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="w-4 h-4" />
                Pending
                {pendingCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-primary rounded-full">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <FileText className="w-4 h-4" />
                All Requests
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <UserCog className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="invitations" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Invitations
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-2">
                <History className="w-4 h-4" />
                Audit Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <RequestsTable 
                requests={accessRequests.filter(r => r.status === 'pending')}
                loading={loading}
                onSelect={setSelectedRequest}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>

            <TabsContent value="all">
              <RequestsTable 
                requests={accessRequests}
                loading={loading}
                onSelect={setSelectedRequest}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>

            <TabsContent value="users">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => setShowInviteModal(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Invite User
                  </Button>
                </div>
                <UsersTable 
                  users={users}
                  loading={usersLoading}
                  processingId={processingId}
                  onUpdateRole={updateUserRole}
                  onRemoveRole={removeUserRole}
                />
              </div>
            </TabsContent>

            <TabsContent value="invitations">
              <InvitationsTable 
                invitations={invitations}
                loading={invitationsLoading}
                onInvite={() => setShowInviteModal(true)}
              />
            </TabsContent>

            <TabsContent value="audit">
              <AuditLogTable logs={auditLogs} loading={auditLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Access Request Details</DialogTitle>
            <DialogDescription>
              Review and take action on this request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(selectedRequest.status)}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedRequest.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <Globe className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a 
                      href={selectedRequest.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      {selectedRequest.website_url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {selectedRequest.company_name && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                    <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{selectedRequest.company_name}</p>
                    </div>
                  </div>
                )}

                {selectedRequest.message && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                    <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Message</p>
                      <p className="text-sm">{selectedRequest.message}</p>
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Submitted {format(new Date(selectedRequest.created_at), 'PPp')}
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-400 border-red-500/30 hover:bg-red-500/10"
                    onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                    disabled={processingId === selectedRequest.id}
                  >
                    {processingId === selectedRequest.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </>
                    )}
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => updateRequestStatus(selectedRequest.id, 'approved')}
                    disabled={processingId === selectedRequest.id}
                  >
                    {processingId === selectedRequest.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              )}

              {selectedRequest.status !== 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => deleteRequest(selectedRequest.id)}
                    disabled={processingId === selectedRequest.id}
                  >
                    {processingId === selectedRequest.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite User Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation email to grant access
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input 
                id="invite-email"
                type="email" 
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invite-message">Personal Message (optional)</Label>
              <Textarea 
                id="invite-message"
                placeholder="Add a personal message to the invitation..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={sendInvitation} 
              disabled={!inviteEmail || sendingInvite}
              className="gap-2"
            >
              {sendingInvite ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequestsTable({ 
  requests, 
  loading, 
  onSelect,
  getStatusBadge 
}: { 
  requests: AccessRequest[];
  loading: boolean;
  onSelect: (request: AccessRequest) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No requests found</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {requests.map((request) => (
              <motion.tr
                key={request.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border-b border-border hover:bg-secondary/50 cursor-pointer"
                onClick={() => onSelect(request)}
              >
                <TableCell className="font-medium">{request.email}</TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                  {request.website_url}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {request.company_name || '-'}
                </TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(request.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}

function UsersTable({ 
  users, 
  loading, 
  processingId,
  onUpdateRole,
  onRemoveRole
}: { 
  users: UserWithRole[];
  loading: boolean;
  processingId: string | null;
  onUpdateRole: (userId: string, role: 'admin' | 'moderator' | 'user', existingRoleId: string | null) => void;
  onRemoveRole: (userId: string, roleId: string) => void;
}) {
  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><Crown className="w-3 h-3 mr-1" /> Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><UserCheck className="w-3 h-3 mr-1" /> Moderator</Badge>;
      case 'user':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">User</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">No Role</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No users found</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[280px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {users.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border-b border-border"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{user.display_name || 'Unnamed'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.email}
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(user.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {processingId === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={user.role === 'admin' ? 'bg-purple-500/20 border-purple-500/30' : ''}
                          onClick={() => onUpdateRole(user.id, 'admin', user.role_id)}
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          Admin
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={user.role === 'moderator' ? 'bg-blue-500/20 border-blue-500/30' : ''}
                          onClick={() => onUpdateRole(user.id, 'moderator', user.role_id)}
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          Mod
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={user.role === 'user' ? 'bg-green-500/20 border-green-500/30' : ''}
                          onClick={() => onUpdateRole(user.id, 'user', user.role_id)}
                        >
                          User
                        </Button>
                        {user.role_id && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-400 hover:bg-red-500/10"
                            onClick={() => onRemoveRole(user.id, user.role_id!)}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}

function InvitationsTable({ 
  invitations, 
  loading,
  onInvite
}: { 
  invitations: Invitation[];
  loading: boolean;
  onInvite: () => void;
}) {
  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    if (isExpired && status === 'pending') {
      return <Badge className="bg-muted text-muted-foreground">Expired</Badge>;
    }
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Accepted</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="mb-4">No invitations sent yet</p>
        <Button onClick={onInvite} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Send First Invitation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onInvite} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Invite User
        </Button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {invitations.map((invitation) => (
                <motion.tr
                  key={invitation.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-border"
                >
                  <TableCell className="font-medium">{invitation.email}</TableCell>
                  <TableCell>{getStatusBadge(invitation.status, invitation.expires_at)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(invitation.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AuditLogTable({ logs, loading }: { logs: AuditLog[]; loading: boolean }) {
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'approve_request':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>;
      case 'reject_request':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
      case 'update_role':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Role Change</Badge>;
      case 'remove_role':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Role Removed</Badge>;
      case 'invite_user':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Invited</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">{action}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No audit logs yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <ScrollArea className="h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="border-b border-border">
                <TableCell>{getActionBadge(log.action)}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground max-w-[150px] truncate">
                  {log.target_id || '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {log.details && typeof log.details === 'object' 
                    ? JSON.stringify(log.details) 
                    : '-'}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                  {format(new Date(log.created_at), 'MMM d, HH:mm')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
