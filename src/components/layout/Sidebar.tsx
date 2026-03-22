import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutGrid, 
  TrendingUp,
  Activity,
  ShoppingBag, 
  Target, 
  Mail, 
  Wand2, 
  Palette, 
  BarChart3,
  ChevronDown,
  Settings,
  Tag,
  Package,
  Shield,
  PenTool,
  Image,
  Dna,
  Brain,
  Paintbrush,
  Book,
  Component,
  CreditCard,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { useBrand } from "@/contexts/BrandContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { useSidebarVisibility } from "@/hooks/useSidebarVisibility";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SubscriptionStatus } from "./SubscriptionStatus";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
  visibilityKey: string;
}

interface NavItemWithSubmenu {
  icon: React.ElementType;
  label: string;
  submenu: NavItem[];
}

// Updated nav items to match InstinctsAI screenshot
const navItems: NavItem[] = [
  { icon: LayoutGrid, label: "Dashboard", href: "/dashboard", visibilityKey: "commandCenter" },
  { icon: ShoppingBag, label: "Product Catalog", href: "/catalog", visibilityKey: "brandCatalog" },
  { icon: Target, label: "Campaigns", href: "/deployment", visibilityKey: "activeDeployment" },
];

const trendsMenu: NavItemWithSubmenu = {
  icon: TrendingUp,
  label: "Trends & SKUs",
  submenu: [
    { icon: Activity, label: "Signal Intelligence", href: "/signals", visibilityKey: "signalIntelligence" },
  ]
};

const commerceLoopItem: NavItem = {
  icon: ShoppingBag,
  label: "Commerce Loop",
  href: "/commerce-loop",
  visibilityKey: "commerceLoop",
};

const toolsMenu: NavItemWithSubmenu = {
  icon: Wand2,
  label: "Tools Lab",
  submenu: [
    { icon: Image, label: "Visual Forge", href: "/visual-forge", visibilityKey: "visualForge" },
    { icon: PenTool, label: "Writing Forge", href: "/writing-forge", visibilityKey: "writingForge" },
    { icon: Brain, label: "AI Insights", href: "/ai-insights", visibilityKey: "aiInsights" },
  ]
};

const creativeMenu: NavItemWithSubmenu = {
  icon: Palette,
  label: "Creative Lab",
  submenu: [
    { icon: Paintbrush, label: "Brand Theme", href: "/brand-theme", visibilityKey: "brandTheme" },
    { icon: Dna, label: "Brand DNA", href: "/brand-dna", visibilityKey: "brandDna" },
    { icon: Target, label: "Simulation Studio", href: "/simulation", visibilityKey: "simulationStudio" },
  ]
};

const bottomNavItems: NavItem[] = [
  { icon: BarChart3, label: "Media Reports", href: "/analytics", visibilityKey: "analytics" },
  { icon: Settings, label: "Onboard", href: "/settings", visibilityKey: "settings" },
  { icon: CreditCard, label: "Platform Plans", href: "/subscription", visibilityKey: "subscription" },
];

// Product type for sidebar display
interface ProductData {
  name: string;
  sku?: string;
}

export function Sidebar() {
  const { collapsed, toggle } = useSidebarContext();
  const [taxonomyOpen, setTaxonomyOpen] = useState(true);
  const [productsOpen, setProductsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [creativeOpen, setCreativeOpen] = useState(false);
  const [trendsOpen, setTrendsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { activeBrand } = useBrand();
  const { isAdmin } = useUserRole();
  const { isVisible } = useSidebarVisibility();

  const currentPath = location.pathname;
  
  // Filter nav items based on visibility
  const visibleNavItems = navItems.filter(item => isVisible(item.visibilityKey as any));
  const visibleToolsSubmenu = toolsMenu.submenu.filter(item => isVisible(item.visibilityKey as any));
  const visibleCreativeSubmenu = creativeMenu.submenu;
  const visibleBottomNavItems = bottomNavItems.filter(item => isVisible(item.visibilityKey as any));
  const visibleTrendsSubmenu = trendsMenu.submenu.filter(item => isVisible(item.visibilityKey as any));
  
  // Auto-expand menus if their routes are active
  const isToolActive = visibleToolsSubmenu.some(item => currentPath === item.href);
  const isTrendsActive = visibleTrendsSubmenu.some(item => currentPath === item.href) || currentPath === "/trends-skus";
  const isCreativeActive = visibleCreativeSubmenu.some(item => currentPath === item.href);

  const handleProductClick = (product: ProductData, index: number) => {
    const productId = product.sku || `product-${index}`;
    navigate(`/product/${productId}`);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-64"
      )}
      style={{ 
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        backgroundColor: "#f5f4f7",
        borderColor: "#e8e6ed",
        color: "#0a0a0a"
      }}
    >
      {/* InstinctsAI Logo Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-4" style={{ borderBottom: "1px solid #e8e6ed" }}>
        <Link to="/" className="flex items-center">
          {!collapsed ? (
            <span className="text-xl font-bold tracking-tight" style={{ color: "#0a0a0a" }}>
              instincts<span style={{ color: "#e53935" }}>AI</span><span className="text-xs align-top" style={{ color: "#0a0a0a" }}>™</span>
            </span>
          ) : (
            <span className="text-lg font-bold" style={{ color: "#e53935" }}>AI</span>
          )}
        </Link>
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "#0a0a0a" }}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {/* Dashboard link first */}
          {visibleNavItems.filter(item => item.href === '/dashboard').map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group",
                  isActive && "bg-[#eae8ef]"
                )}
                style={{ color: isActive ? "#0a0a0a" : "#3a3a3a" }}
              >
                <item.icon className="h-5 w-5 transition-colors shrink-0" />
                {!collapsed && (
                  <span className="text-base font-normal">{item.label}</span>
                )}
              </Link>
            );
          })}

          {/* Trends & SKUs (main link) + optional submenu */}
          {visibleTrendsSubmenu.length > 0 && (
            <div>
              <div
                className={cn(
                  "flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group",
                  (currentPath === "/trends-skus" || isTrendsActive) && "bg-[#eae8ef]"
                )}
              >
                <Link
                  to="/trends-skus"
                  className="flex min-w-0 flex-1 items-center gap-4"
                  style={{ color: (currentPath === "/trends-skus" || isTrendsActive) ? "#0a0a0a" : "#3a3a3a" }}
                >
                  <trendsMenu.icon className="h-5 w-5 transition-colors shrink-0" />
                  {!collapsed && (
                    <span className="text-base font-normal truncate">{trendsMenu.label}</span>
                  )}
                </Link>

                {!collapsed && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTrendsOpen(!trendsOpen);
                    }}
                    className="ml-auto rounded-md p-1.5 transition-colors hover:bg-[#eae8ef]"
                    aria-label={trendsOpen ? "Collapse Trends & SKUs menu" : "Expand Trends & SKUs menu"}
                    style={{ color: "#3a3a3a" }}
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        trendsOpen ? "rotate-0" : "-rotate-90"
                      )}
                    />
                  </button>
                )}
              </div>

              {/* Submenu */}
              {!collapsed && trendsOpen && (
                <div className="ml-6 mt-1 space-y-0.5 pl-4" style={{ borderLeft: "1px solid #e8e6ed" }}>
                  {visibleTrendsSubmenu.map((subItem) => {
                    const isSubActive = currentPath === subItem.href;
                    return (
                      <Link
                        key={subItem.href}
                        to={subItem.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                          isSubActive && "bg-[#eae8ef]"
                        )}
                        style={{ color: isSubActive ? "#0a0a0a" : "#3a3a3a" }}
                      >
                        <subItem.icon className="h-4 w-4 transition-colors shrink-0" />
                        <span className="text-sm">{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Commerce Loop - separate from Trends & SKUs */}
          {isVisible('commerceLoop') && (
            <Link
              to="/commerce-loop"
              className={cn(
                "flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group",
                currentPath === "/commerce-loop" && "bg-[#eae8ef]"
              )}
              style={{ color: currentPath === "/commerce-loop" ? "#0a0a0a" : "#3a3a3a" }}
            >
              <ShoppingBag className="h-5 w-5 transition-colors shrink-0" />
              {!collapsed && (
                <span className="text-base font-normal">Commerce Loop</span>
              )}
            </Link>
          )}

          {/* Rest of nav items */}
          {visibleNavItems.filter(item => item.href !== '/dashboard').map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group",
                  isActive && "bg-[#eae8ef]"
                )}
                style={{ color: isActive ? "#0a0a0a" : "#3a3a3a" }}
              >
                <item.icon className="h-5 w-5 transition-colors shrink-0" />
                {!collapsed && (
                  <span className="text-base font-normal">{item.label}</span>
                )}
              </Link>
            );
          })}

          {/* Tools Lab Menu with Submenu */}
          {visibleToolsSubmenu.length > 0 && (
            <div>
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className={cn(
                  "flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group w-full",
                  isToolActive && "bg-[#eae8ef]"
                )}
                style={{ color: isToolActive ? "#0a0a0a" : "#3a3a3a" }}
              >
                <toolsMenu.icon className="h-5 w-5 transition-colors shrink-0" />
                {!collapsed && (
                  <>
                    <span className="text-base font-normal">{toolsMenu.label}</span>
                    <ChevronDown className={cn(
                      "ml-auto h-4 w-4 transition-transform",
                      (toolsOpen || isToolActive) ? "rotate-0" : "-rotate-90"
                    )} />
                  </>
                )}
              </button>
              
              {/* Submenu */}
              {!collapsed && (toolsOpen || isToolActive) && (
                <div className="ml-6 mt-1 space-y-0.5 pl-4" style={{ borderLeft: "1px solid #e8e6ed" }}>
                  {visibleToolsSubmenu.map((subItem) => {
                    const isSubActive = currentPath === subItem.href;
                    return (
                      <Link
                        key={subItem.href}
                        to={subItem.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                          isSubActive && "bg-[#eae8ef]"
                        )}
                        style={{ color: isSubActive ? "#0a0a0a" : "#3a3a3a" }}
                      >
                        <subItem.icon className="h-4 w-4 transition-colors shrink-0" />
                        <span className="text-sm">{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Creative Lab Menu with Submenu */}
          <div>
            <button
              onClick={() => setCreativeOpen(!creativeOpen)}
              className={cn(
                "flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group w-full",
                isCreativeActive && "bg-[#eae8ef]"
              )}
              style={{ color: isCreativeActive ? "#0a0a0a" : "#3a3a3a" }}
            >
              <creativeMenu.icon className="h-5 w-5 transition-colors shrink-0" />
              {!collapsed && (
                <>
                  <span className="text-base font-normal">{creativeMenu.label}</span>
                  <ChevronDown className={cn(
                    "ml-auto h-4 w-4 transition-transform",
                    (creativeOpen || isCreativeActive) ? "rotate-0" : "-rotate-90"
                  )} />
                </>
              )}
            </button>
            
            {/* Submenu */}
            {!collapsed && (creativeOpen || isCreativeActive) && (
              <div className="ml-6 mt-1 space-y-0.5 pl-4" style={{ borderLeft: "1px solid #e8e6ed" }}>
                {visibleCreativeSubmenu.map((subItem) => {
                  const isSubActive = currentPath === subItem.href;
                  return (
                    <Link
                      key={subItem.href}
                      to={subItem.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                        isSubActive && "bg-[#eae8ef]"
                      )}
                      style={{ color: isSubActive ? "#0a0a0a" : "#3a3a3a" }}
                    >
                      <subItem.icon className="h-4 w-4 transition-colors shrink-0" />
                      <span className="text-sm">{subItem.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom nav items inline */}
          {visibleBottomNavItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group",
                  isActive && "bg-[#eae8ef]"
                )}
                style={{ color: isActive ? "#0a0a0a" : "#3a3a3a" }}
              >
                <item.icon className="h-5 w-5 transition-colors shrink-0" />
                {!collapsed && (
                  <span className="text-base font-normal">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Taxonomy Section */}
        {!collapsed && isVisible("categories") && activeBrand?.taxonomy && activeBrand.taxonomy.length > 0 && (
          <div className="px-4 pb-4">
            <button
              onClick={() => setTaxonomyOpen(!taxonomyOpen)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={{ color: "#5a5a5a" }}
            >
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" />
                <span>Categories</span>
              </div>
              <ChevronDown className={cn(
                "h-3.5 w-3.5 transition-transform",
                !taxonomyOpen && "-rotate-90"
              )} />
            </button>
            {taxonomyOpen && (
              <div className="space-y-0.5 mt-1">
                {activeBrand.taxonomy.slice(0, 8).map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer hover:bg-[#eae8ef]"
                    style={{ color: "#3a3a3a" }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#8a8a8a" }} />
                    <span className="truncate">{category}</span>
                  </div>
                ))}
                {activeBrand.taxonomy.length > 8 && (
                  <div className="px-3 py-1.5 text-xs" style={{ color: "#6a6a6a" }}>
                    +{activeBrand.taxonomy.length - 8} more
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Products Section */}
        {!collapsed && isVisible("products") && activeBrand?.products && activeBrand.products.length > 0 && (
          <div className="px-4 pb-4">
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={{ color: "#5a5a5a" }}
            >
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5" />
                <span>Products</span>
                <span className="text-[10px] font-normal normal-case">({activeBrand.products.length})</span>
              </div>
              <ChevronDown className={cn(
                "h-3.5 w-3.5 transition-transform",
                !productsOpen && "-rotate-90"
              )} />
            </button>
            {productsOpen && (
              <div className="space-y-0.5 mt-1">
                {activeBrand.products.slice(0, 6).map((product: ProductData, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleProductClick(product, index)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer w-full text-left hover:bg-[#eae8ef]"
                    style={{ color: "#3a3a3a" }}
                  >
                    <Package className="h-3.5 w-3.5 shrink-0 opacity-50" />
                    <span className="truncate">{product.name}</span>
                  </button>
                ))}
                {activeBrand.products.length > 6 && (
                  <div className="px-3 py-1.5 text-xs" style={{ color: "#6a6a6a" }}>
                    +{activeBrand.products.length - 6} more
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Subscription Status */}
      <div className="shrink-0" style={{ borderTop: "1px solid #e8e6ed" }}>
        <SubscriptionStatus collapsed={collapsed} />
      </div>

      {/* Admin section */}
      {isAdmin && (
        <div className="p-3 shrink-0 space-y-1" style={{ borderTop: "1px solid #e8e6ed" }}>
          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-4 px-3 py-3 rounded-lg transition-colors",
              currentPath === '/admin' && "bg-[#eae8ef]"
            )}
            style={{ color: currentPath === '/admin' ? "#0a0a0a" : "#3a3a3a" }}
          >
            <Shield className="h-5 w-5" />
            {!collapsed && <span className="text-base font-normal">Admin</span>}
          </Link>
          <Link
            to="/sysadmin"
            className={cn(
              "flex items-center gap-4 px-3 py-3 rounded-lg transition-colors",
              currentPath === '/sysadmin' && "bg-[#eae8ef]"
            )}
            style={{ color: currentPath === '/sysadmin' ? "#0a0a0a" : "#3a3a3a" }}
          >
            <Shield className="h-5 w-5" />
            {!collapsed && <span className="text-base font-normal">SysAdmin</span>}
          </Link>
          <Link
            to="/components"
            className={cn(
              "flex items-center gap-4 px-3 py-3 rounded-lg transition-colors",
              currentPath === '/components' && "bg-[#eae8ef]"
            )}
            style={{ color: currentPath === '/components' ? "#0a0a0a" : "#3a3a3a" }}
          >
            <Component className="h-5 w-5" />
            {!collapsed && <span className="text-base font-normal">Components</span>}
          </Link>
          <Link
            to="/docs"
            className={cn(
              "flex items-center gap-4 px-3 py-3 rounded-lg transition-colors",
              currentPath === '/docs' && "bg-[#eae8ef]"
            )}
            style={{ color: currentPath === '/docs' ? "#0a0a0a" : "#3a3a3a" }}
          >
            <Book className="h-5 w-5" />
            {!collapsed && <span className="text-base font-normal">Docs</span>}
          </Link>
        </div>
      )}
    </aside>
  );
}
