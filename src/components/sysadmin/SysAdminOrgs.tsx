import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  Search, 
  ExternalLink, 
  MoreHorizontal,
  Eye,
  Trash2,
  Crown,
  Users,
  Calendar,
  Globe,
  Package,
  RefreshCw,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Organization {
  id: string;
  name: string;
  website_url: string;
  owner_id: string;
  subscription_status: string | null;
  trial_ends_at: string | null;
  created_at: string;
  logo_url: string | null;
  primary_color: string | null;
  products: any;
  taxonomy: any;
}

interface OrgUser {
  user_id: string;
  display_name: string | null;
  email?: string;
}

export function SysAdminOrgs() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrgs(data || []);
    } catch (error) {
      console.error('Error fetching orgs:', error);
      toast.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgUsers = async (orgId: string) => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('org_id', orgId);

      if (error) throw error;

      // Get emails
      const userIds = profiles?.map(p => p.user_id) || [];
      const { data: emails } = await supabase
        .from('email_verifications')
        .select('user_id, email')
        .in('user_id', userIds);

      const usersWithEmails = (profiles || []).map(p => ({
        ...p,
        email: emails?.find(e => e.user_id === p.user_id)?.email
      }));

      setOrgUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching org users:', error);
    }
  };

  const getStatusBadge = (status: string | null, trialEndsAt: string | null) => {
    if (status === 'active') {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
    }
    if (status === 'trial') {
      const daysLeft = trialEndsAt ? Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Trial ({daysLeft}d)</Badge>;
    }
    if (status === 'expired') {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Expired</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const filteredOrgs = orgs.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.website_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const productCount = (org: Organization) => {
    if (!org.products) return 0;
    if (Array.isArray(org.products)) return org.products.length;
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Organizations</h2>
          <p className="text-muted-foreground">{orgs.length} total organizations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={fetchOrgs} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/15">
                <Crown className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {orgs.filter(o => o.subscription_status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15">
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {orgs.filter(o => o.subscription_status === 'trial').length}
                </p>
                <p className="text-sm text-muted-foreground">In Trial</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/15">
                <Building2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {orgs.filter(o => o.subscription_status === 'expired').length}
                </p>
                <p className="text-sm text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/15">
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {orgs.reduce((sum, o) => sum + productCount(o), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Table */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>All Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : filteredOrgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Plus className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No organizations found</p>
              <p className="text-sm">
                {searchQuery ? 'Try adjusting your search' : 'Organizations will appear here when users sign up'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrgs.map((org) => (
                  <TableRow key={org.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {org.logo_url ? (
                          <img 
                            src={org.logo_url} 
                            alt={org.name} 
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: org.primary_color || 'hsl(var(--primary))' }}
                          >
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <span className="font-medium">{org.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={org.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Globe className="w-3 h-3" />
                        {new URL(org.website_url).hostname}
                      </a>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(org.subscription_status, org.trial_ends_at)}
                    </TableCell>
                    <TableCell>{productCount(org)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(org.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedOrg(org);
                            fetchOrgUsers(org.id);
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit Website
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Organization Detail Dialog */}
      <Dialog open={!!selectedOrg} onOpenChange={() => setSelectedOrg(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedOrg?.logo_url ? (
                <img 
                  src={selectedOrg.logo_url} 
                  alt={selectedOrg.name} 
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedOrg?.primary_color || 'hsl(var(--primary))' }}
                >
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              )}
              {selectedOrg?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Website</p>
                <a 
                  href={selectedOrg?.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {selectedOrg?.website_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                {selectedOrg && getStatusBadge(selectedOrg.subscription_status, selectedOrg.trial_ends_at)}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <p>{selectedOrg && format(new Date(selectedOrg.created_at), 'PPP')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Products</p>
                <p>{selectedOrg && productCount(selectedOrg)} products</p>
              </div>
            </div>

            {/* Brand Colors */}
            {selectedOrg?.primary_color && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Brand Colors</p>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg border" 
                    style={{ backgroundColor: selectedOrg.primary_color }}
                    title="Primary"
                  />
                </div>
              </div>
            )}

            {/* Users */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Members ({orgUsers.length})
              </p>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {orgUsers.map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{user.display_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
