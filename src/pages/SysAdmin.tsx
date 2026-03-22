import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Palette,
  Settings
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SysAdminDashboard } from "@/components/sysadmin/SysAdminDashboard";
import { SysAdminOrgs } from "@/components/sysadmin/SysAdminOrgs";
import { SysAdminUsers } from "@/components/sysadmin/SysAdminUsers";
import { SysAdminAnalytics } from "@/components/sysadmin/SysAdminAnalytics";
import { SysAdminCreatives } from "@/components/sysadmin/SysAdminCreatives";
import { SysAdminSettings } from "@/components/sysadmin/SysAdminSettings";

export default function SysAdmin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState("dashboard");

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
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/80 via-accent/80 to-primary/60 shadow-sm shadow-primary/20">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                System Admin
              </h1>
              <p className="text-muted-foreground">Complete platform management and oversight</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-1 h-auto">
              <TabsTrigger value="dashboard" className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="organizations" className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">
                <Building2 className="w-4 h-4" />
                Organizations
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="creatives" className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">
                <Palette className="w-4 h-4" />
                Creatives
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="dashboard" className="mt-0">
                  <SysAdminDashboard />
                </TabsContent>

                <TabsContent value="organizations" className="mt-0">
                  <SysAdminOrgs />
                </TabsContent>

                <TabsContent value="users" className="mt-0">
                  <SysAdminUsers />
                </TabsContent>

                <TabsContent value="analytics" className="mt-0">
                  <SysAdminAnalytics />
                </TabsContent>

                <TabsContent value="creatives" className="mt-0">
                  <SysAdminCreatives />
                </TabsContent>

                <TabsContent value="settings" className="mt-0">
                  <SysAdminSettings />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
