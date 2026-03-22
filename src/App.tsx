import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { BrandProvider } from "@/contexts/BrandContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PageTransition } from "@/components/layout/PageTransition";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import Subscription from "./pages/Subscription";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import BrandSettings from "./pages/BrandSettings";
import SignalIntelligence from "./pages/SignalIntelligence";
import CommerceLoop from "./pages/CommerceLoop";
import TrendsAndSkus from "./pages/TrendsAndSkus";
import SimulationStudio from "./pages/SimulationStudio";
import ActiveDeployment from "./pages/ActiveDeployment";
import Analytics from "./pages/Analytics";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Admin from "./pages/Admin";
import SysAdmin from "./pages/SysAdmin";
import VisualForge from "./pages/VisualForge";
import VisualForgeAdmin from "./pages/VisualForgeAdmin";
import WritingForge from "./pages/WritingForge";
import ComponentShowcase from "./pages/ComponentShowcase";
import BrandDNA from "./pages/BrandDNA";
import BrandManagement from "./pages/BrandManagement";
import BrandCatalog from "./pages/BrandCatalog";
import BrandTheme from "./pages/BrandTheme";
import ProductDetail from "./pages/ProductDetail";
import AIInsights from "./pages/AIInsights";
import AIDashboard from "./pages/AIDashboard";
import OptimizationHub from "./pages/OptimizationHub";
import CompetitiveIntelligence from "./pages/CompetitiveIntelligence";
import ApiDocs from "./pages/ApiDocs";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/update-password" element={<PageTransition><UpdatePassword /></PageTransition>} />
        <Route path="/verify-email" element={<ProtectedRoute><PageTransition><VerifyEmail /></PageTransition></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><PageTransition><Subscription /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Index /></PageTransition></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute>} />
        <Route path="/settings/brands" element={<ProtectedRoute><PageTransition><BrandManagement /></PageTransition></ProtectedRoute>} />
        <Route path="/brand-settings" element={<ProtectedRoute><PageTransition><BrandSettings /></PageTransition></ProtectedRoute>} />
        <Route path="/brand-dna" element={<ProtectedRoute><PageTransition><BrandDNA /></PageTransition></ProtectedRoute>} />
        <Route path="/brand-theme" element={<ProtectedRoute><PageTransition><BrandTheme /></PageTransition></ProtectedRoute>} />
        <Route path="/signals" element={<ProtectedRoute><PageTransition><SignalIntelligence /></PageTransition></ProtectedRoute>} />
        <Route path="/trends-skus" element={<ProtectedRoute><PageTransition><TrendsAndSkus /></PageTransition></ProtectedRoute>} />
        <Route path="/commerce-loop" element={<ProtectedRoute><PageTransition><CommerceLoop /></PageTransition></ProtectedRoute>} />
        <Route path="/catalog" element={<ProtectedRoute><PageTransition><BrandCatalog /></PageTransition></ProtectedRoute>} />
        <Route path="/product/:productId" element={<ProtectedRoute><PageTransition><ProductDetail /></PageTransition></ProtectedRoute>} />
        <Route path="/simulation" element={<ProtectedRoute><PageTransition><SimulationStudio /></PageTransition></ProtectedRoute>} />
        <Route path="/deployment" element={<ProtectedRoute><PageTransition><ActiveDeployment /></PageTransition></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><PageTransition><Analytics /></PageTransition></ProtectedRoute>} />
        <Route path="/ai-insights" element={<ProtectedRoute><PageTransition><AIInsights /></PageTransition></ProtectedRoute>} />
        <Route path="/ai-dashboard" element={<ProtectedRoute><PageTransition><AIDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/optimization" element={<ProtectedRoute><PageTransition><OptimizationHub /></PageTransition></ProtectedRoute>} />
        <Route path="/competitive" element={<ProtectedRoute><PageTransition><CompetitiveIntelligence /></PageTransition></ProtectedRoute>} />
        <Route path="/visual-forge" element={<ProtectedRoute><PageTransition><VisualForge /></PageTransition></ProtectedRoute>} />
        <Route path="/writing-forge" element={<ProtectedRoute><PageTransition><WritingForge /></PageTransition></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><PageTransition><Admin /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/visual-forge" element={<ProtectedRoute><PageTransition><VisualForgeAdmin /></PageTransition></ProtectedRoute>} />
        <Route path="/sysadmin" element={<ProtectedRoute><PageTransition><SysAdmin /></PageTransition></ProtectedRoute>} />
        <Route path="/components" element={<ProtectedRoute><PageTransition><ComponentShowcase /></PageTransition></ProtectedRoute>} />
        <Route path="/api-docs" element={<ProtectedRoute><PageTransition><ApiDocs /></PageTransition></ProtectedRoute>} />
        <Route path="/docs" element={<ProtectedRoute><PageTransition><Documentation /></PageTransition></ProtectedRoute>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SidebarProvider>
        <BrowserRouter>
          <BrandProvider>
            <Toaster />
            <Sonner />
            <AnimatedRoutes />
          </BrandProvider>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
