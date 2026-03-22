import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, 
  BarChart3, Bell, Settings, Home, Search, Menu, ChevronRight,
  Mail, Lock, Eye, Heart, Star, MessageSquare, Share2
} from "lucide-react";

interface ThemePreviewModeProps {
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      ctaPrimary: string;
      ctaHover: string;
      ctaText: string;
      ctaGradientStart: string;
      ctaGradientEnd: string;
      ctaGradientEnabled: boolean;
      ctaGradientAngle: number;
      ctaGradientHoverEffect: 'none' | 'shift' | 'shimmer' | 'pulse';
      linkDefault: string;
      linkHover: string;
      linkVisited: string;
      menuBackground: string;
      menuText: string;
      menuHover: string;
      menuActive: string;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
      baseFontSize: number;
      headingWeight: string;
      bodyWeight: string;
      lineHeight: number;
    };
    spacing: {
      baseUnit: number;
      borderRadius: number;
    };
    effects: {
      enableGradients: boolean;
      enableShadows: boolean;
      shadowIntensity: number;
    };
  };
}

export function ThemePreviewMode({ theme }: ThemePreviewModeProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Generate inline styles from theme
  const headingStyle = {
    fontFamily: `'${theme.typography.headingFont}', sans-serif`,
    fontWeight: theme.typography.headingWeight,
  };
  
  const bodyStyle = {
    fontFamily: `'${theme.typography.bodyFont}', sans-serif`,
    fontWeight: theme.typography.bodyWeight,
    lineHeight: theme.typography.lineHeight,
  };
  
  const cardStyle = {
    borderRadius: `${theme.spacing.borderRadius}px`,
    boxShadow: theme.effects.enableShadows 
      ? `0 4px 6px -1px rgba(0, 0, 0, ${0.1 * (theme.effects.shadowIntensity / 100)})` 
      : 'none',
  };

  const ctaStyle = theme.colors.ctaGradientEnabled
    ? {
        background: `linear-gradient(${theme.colors.ctaGradientAngle}deg, ${theme.colors.ctaGradientStart}, ${theme.colors.ctaGradientEnd})`,
        color: theme.colors.ctaText,
      }
    : {
        backgroundColor: theme.colors.ctaPrimary,
        color: theme.colors.ctaText,
      };

  const linkStyle = {
    color: theme.colors.linkDefault,
  };

  const menuStyle = {
    backgroundColor: theme.colors.menuBackground,
    color: theme.colors.menuText,
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={headingStyle}>
          <Eye className="h-5 w-5" />
          Theme Preview Mode
        </CardTitle>
        <CardDescription style={bodyStyle}>
          See how your theme looks across different page types and components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
          </TabsList>

          {/* Dashboard Preview */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric Cards */}
              <Card style={cardStyle}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground" style={bodyStyle}>Total Revenue</p>
                      <p className="text-2xl font-bold" style={headingStyle}>$45,231</p>
                    </div>
                    <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.primary + '20' }}>
                      <DollarSign className="h-6 w-6" style={{ color: theme.colors.primary }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+12.5%</span>
                  </div>
                </CardContent>
              </Card>

              <Card style={cardStyle}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground" style={bodyStyle}>Active Users</p>
                      <p className="text-2xl font-bold" style={headingStyle}>2,847</p>
                    </div>
                    <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.secondary + '20' }}>
                      <Users className="h-6 w-6" style={{ color: theme.colors.secondary }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+8.2%</span>
                  </div>
                </CardContent>
              </Card>

              <Card style={cardStyle}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground" style={bodyStyle}>Orders</p>
                      <p className="text-2xl font-bold" style={headingStyle}>1,234</p>
                    </div>
                    <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.accent + '20' }}>
                      <ShoppingCart className="h-6 w-6" style={{ color: theme.colors.accent }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
                    <TrendingDown className="h-4 w-4" />
                    <span>-3.1%</span>
                  </div>
                </CardContent>
              </Card>

              <Card style={cardStyle}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground" style={bodyStyle}>Conversion</p>
                      <p className="text-2xl font-bold" style={headingStyle}>4.28%</p>
                    </div>
                    <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.primary + '20' }}>
                      <BarChart3 className="h-6 w-6" style={{ color: theme.colors.primary }} />
                    </div>
                  </div>
                  <Progress value={42.8} className="mt-3" />
                </CardContent>
              </Card>
            </div>

            {/* Chart Placeholder */}
            <Card style={cardStyle}>
              <CardHeader>
                <CardTitle style={headingStyle}>Revenue Overview</CardTitle>
                <CardDescription style={bodyStyle}>Monthly revenue for the current year</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="h-48 rounded-lg flex items-center justify-center"
                  style={{ 
                    background: theme.effects.enableGradients 
                      ? `linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.accent}10)` 
                      : theme.colors.background + '50'
                  }}
                >
                  <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cards Preview */}
          <TabsContent value="cards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Product Card */}
              <Card style={cardStyle} className="overflow-hidden">
                <div 
                  className="h-40 flex items-center justify-center"
                  style={{ 
                    background: theme.effects.enableGradients 
                      ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` 
                      : theme.colors.primary
                  }}
                >
                  <ShoppingCart className="h-12 w-12 text-white" />
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge style={{ backgroundColor: theme.colors.accent, color: 'white' }}>New</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">4.8</span>
                    </div>
                  </div>
                  <h3 className="font-semibold" style={headingStyle}>Product Name</h3>
                  <p className="text-sm text-muted-foreground" style={bodyStyle}>A brief description of this product.</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold" style={{ color: theme.colors.primary }}>$99.00</span>
                    <Button size="sm" style={ctaStyle}>Add to Cart</Button>
                  </div>
                </CardContent>
              </Card>

              {/* User Card */}
              <Card style={cardStyle}>
                <CardContent className="pt-6 text-center">
                  <div 
                    className="h-20 w-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` 
                    }}
                  >
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="font-semibold" style={headingStyle}>John Doe</h3>
                  <p className="text-sm text-muted-foreground" style={bodyStyle}>Product Designer</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" /> Message
                    </Button>
                    <Button size="sm" style={ctaStyle}>Follow</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card style={cardStyle}>
                <CardHeader>
                  <CardTitle style={headingStyle}>Campaign Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={bodyStyle}>Impressions</span>
                    <span className="font-semibold">12.4K</span>
                  </div>
                  <Progress value={75} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={bodyStyle}>Clicks</span>
                    <span className="font-semibold">2.1K</span>
                  </div>
                  <Progress value={45} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={bodyStyle}>Conversions</span>
                    <span className="font-semibold">342</span>
                  </div>
                  <Progress value={25} />
                </CardContent>
                <CardFooter>
                  <Button className="w-full" style={ctaStyle}>View Report</Button>
                </CardFooter>
              </Card>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card style={cardStyle}>
                <CardContent className="pt-6 flex items-center gap-4">
                  <div 
                    className="h-14 w-14 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: theme.colors.primary + '20' }}
                  >
                    <Heart className="h-7 w-7" style={{ color: theme.colors.primary }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={headingStyle}>Engagement Rate</h3>
                    <p className="text-sm text-muted-foreground" style={bodyStyle}>
                      Your engagement is up 24% this month
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>

              <Card style={cardStyle}>
                <CardContent className="pt-6 flex items-center gap-4">
                  <div 
                    className="h-14 w-14 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: theme.colors.accent + '20' }}
                  >
                    <Share2 className="h-7 w-7" style={{ color: theme.colors.accent }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={headingStyle}>Social Reach</h3>
                    <p className="text-sm text-muted-foreground" style={bodyStyle}>
                      Reached 45K people across platforms
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forms Preview */}
          <TabsContent value="forms" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Login Form */}
              <Card style={cardStyle}>
                <CardHeader>
                  <CardTitle style={headingStyle}>Sign In</CardTitle>
                  <CardDescription style={bodyStyle}>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label style={bodyStyle}>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="email@example.com" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label style={bodyStyle}>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="remember" />
                      <Label htmlFor="remember" className="text-sm" style={bodyStyle}>Remember me</Label>
                    </div>
                    <a href="#" style={linkStyle} className="text-sm hover:underline">Forgot password?</a>
                  </div>
                  <Button className="w-full" style={ctaStyle}>Sign In</Button>
                  <p className="text-center text-sm" style={bodyStyle}>
                    Don't have an account?{" "}
                    <a href="#" style={linkStyle} className="hover:underline">Sign up</a>
                  </p>
                </CardContent>
              </Card>

              {/* Contact Form */}
              <Card style={cardStyle}>
                <CardHeader>
                  <CardTitle style={headingStyle}>Contact Us</CardTitle>
                  <CardDescription style={bodyStyle}>Send us a message and we'll get back to you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label style={bodyStyle}>First Name</Label>
                      <Input placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label style={bodyStyle}>Last Name</Label>
                      <Input placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label style={bodyStyle}>Subject</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label style={bodyStyle}>Message</Label>
                    <Textarea placeholder="How can we help you?" rows={4} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="newsletter" />
                    <Label htmlFor="newsletter" className="text-sm" style={bodyStyle}>Subscribe to newsletter</Label>
                  </div>
                  <Button className="w-full" style={ctaStyle}>Send Message</Button>
                </CardContent>
              </Card>
            </div>

            {/* Settings Form */}
            <Card style={cardStyle}>
              <CardHeader>
                <CardTitle style={headingStyle}>Notification Settings</CardTitle>
                <CardDescription style={bodyStyle}>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Email notifications", desc: "Receive updates via email" },
                    { label: "Push notifications", desc: "Get alerts on your device" },
                    { label: "Weekly digest", desc: "Summary of activity each week" },
                    { label: "Marketing emails", desc: "News about products and features" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium" style={bodyStyle}>{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={i < 2} />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button style={ctaStyle}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Navigation Preview */}
          <TabsContent value="navigation" className="space-y-6">
            {/* Sidebar Preview */}
            <Card style={cardStyle}>
              <CardHeader>
                <CardTitle style={headingStyle}>Sidebar Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="w-64 rounded-lg overflow-hidden"
                  style={menuStyle}
                >
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                      >
                        <span className="text-white font-bold">B</span>
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: theme.colors.menuText }}>Brand Name</p>
                        <p className="text-xs opacity-60" style={{ color: theme.colors.menuText }}>Pro Plan</p>
                      </div>
                    </div>
                  </div>
                  <nav className="p-2 space-y-1">
                    {[
                      { icon: Home, label: "Dashboard", active: true },
                      { icon: BarChart3, label: "Analytics" },
                      { icon: Users, label: "Customers" },
                      { icon: ShoppingCart, label: "Orders" },
                      { icon: Settings, label: "Settings" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                        style={{
                          backgroundColor: item.active ? theme.colors.menuHover : 'transparent',
                          color: item.active ? theme.colors.menuActive : theme.colors.menuText,
                        }}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                    ))}
                  </nav>
                </div>
              </CardContent>
            </Card>

            {/* Header Navigation */}
            <Card style={cardStyle}>
              <CardHeader>
                <CardTitle style={headingStyle}>Header Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-background">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-8 w-8 rounded-lg flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                        >
                          <span className="text-white font-bold text-sm">B</span>
                        </div>
                        <span className="font-semibold" style={headingStyle}>Brand</span>
                      </div>
                      <nav className="flex items-center gap-4">
                        {["Home", "Products", "About", "Contact"].map((item, i) => (
                          <a 
                            key={i} 
                            href="#" 
                            className="text-sm transition-colors"
                            style={{ 
                              color: i === 0 ? theme.colors.linkDefault : 'inherit',
                              fontWeight: i === 0 ? '600' : '400',
                              ...bodyStyle 
                            }}
                          >
                            {item}
                          </a>
                        ))}
                      </nav>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." className="pl-10 w-48" />
                      </div>
                      <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                      </Button>
                      <Button style={ctaStyle}>Get Started</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Breadcrumbs & Links */}
            <Card style={cardStyle}>
              <CardHeader>
                <CardTitle style={headingStyle}>Links & Breadcrumbs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Breadcrumb Navigation</p>
                  <div className="flex items-center gap-2 text-sm">
                    <a href="#" style={linkStyle} className="hover:underline">Home</a>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <a href="#" style={linkStyle} className="hover:underline">Products</a>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Category</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Link States</p>
                  <div className="flex items-center gap-6">
                    <a href="#" style={{ color: theme.colors.linkDefault }} className="hover:underline">Default Link</a>
                    <a href="#" style={{ color: theme.colors.linkHover }} className="underline">Hover State</a>
                    <a href="#" style={{ color: theme.colors.linkVisited }} className="hover:underline">Visited Link</a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Preview */}
          <TabsContent value="typography" className="space-y-6">
            <Card style={cardStyle}>
              <CardHeader>
                <CardTitle style={headingStyle}>Typography Scale</CardTitle>
                <CardDescription style={bodyStyle}>
                  Heading: {theme.typography.headingFont} | Body: {theme.typography.bodyFont}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">H1 - Display</p>
                    <h1 className="text-4xl" style={headingStyle}>The quick brown fox</h1>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">H2 - Title</p>
                    <h2 className="text-3xl" style={headingStyle}>The quick brown fox jumps</h2>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">H3 - Subtitle</p>
                    <h3 className="text-2xl" style={headingStyle}>The quick brown fox jumps over</h3>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">H4 - Section</p>
                    <h4 className="text-xl" style={headingStyle}>The quick brown fox jumps over the lazy</h4>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Body - Paragraph</p>
                    <p style={bodyStyle}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                      exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Body - Small</p>
                    <p className="text-sm" style={bodyStyle}>
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                      fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Font Weights */}
            <Card style={cardStyle}>
              <CardHeader>
                <CardTitle style={headingStyle}>Font Weights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["300", "400", "500", "600", "700"].map((weight) => (
                    <div key={weight} className="text-center p-4 border rounded-lg">
                      <p 
                        className="text-2xl mb-2" 
                        style={{ 
                          fontFamily: `'${theme.typography.bodyFont}', sans-serif`,
                          fontWeight: weight 
                        }}
                      >
                        Aa
                      </p>
                      <p className="text-xs text-muted-foreground">Weight {weight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Badges & Labels */}
            <Card style={cardStyle}>
              <CardHeader>
                <CardTitle style={headingStyle}>Badges & Labels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Badge style={{ backgroundColor: theme.colors.primary, color: 'white' }}>Primary</Badge>
                  <Badge style={{ backgroundColor: theme.colors.secondary, color: 'white' }}>Secondary</Badge>
                  <Badge style={{ backgroundColor: theme.colors.accent, color: 'white' }}>Accent</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="secondary">Muted</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Buttons */}
            <Card style={cardStyle}>
              <CardHeader>
                <CardTitle style={headingStyle}>Button Styles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button style={ctaStyle}>Primary CTA</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link" style={linkStyle}>Link</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
