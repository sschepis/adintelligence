import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageContainer, PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton, SkeletonCard, SkeletonList, SkeletonMetric, SkeletonTable, SkeletonChart } from "@/components/ui/skeleton";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Bell, Check, AlertTriangle, Info, X, Sparkles, Zap, Heart, Star, Search, Mail, User, Send, PanelRight, Layers } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters." }).max(160, { message: "Bio must not exceed 160 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
});

const ComponentShowcase = () => {
  const [showSkeletons, setShowSkeletons] = useState(true);
  const [selectValue, setSelectValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      bio: "",
      category: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    toast.success("Form submitted successfully!", {
      description: `Welcome, ${values.username}!`,
    });
    form.reset();
  };

  const handleToast = (type: string) => {
    switch (type) {
      case "default":
        toast("This is a default toast", {
          description: "With a description for more context",
        });
        break;
      case "success":
        toast.success("Operation completed successfully!", {
          description: "Your changes have been saved.",
        });
        break;
      case "error":
        toast.error("Something went wrong", {
          description: "Please try again later.",
        });
        break;
      case "warning":
        toast.warning("Please review your input", {
          description: "Some fields may need attention.",
        });
        break;
      case "info":
        toast.info("Did you know?", {
          description: "You can customize these toasts.",
        });
        break;
    }
  };

  return (
    <PageContainer>
      <PageHeader
            title="Component Showcase"
            description="Beauty theme UI components • Design system preview"
            badge={<Badge variant="gradient">Preview</Badge>}
          />

          {/* Buttons Section */}
          <section className="mb-12">
            <h2 className="font-display font-bold text-2xl mb-6">Buttons</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="gradient">Gradient</Button>
                  <Button variant="glass">Glass</Button>
                  <Button variant="soft">Soft</Button>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon"><Sparkles className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Badges Section */}
          <section className="mb-12">
            <h2 className="font-display font-bold text-2xl mb-6">Badges</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="soft">Soft</Badge>
                  <Badge variant="accent">Accent</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="muted">Muted</Badge>
                  <Badge variant="gradient">Gradient</Badge>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="success" className="gap-1">
                    <Check className="h-3 w-3" /> Verified
                  </Badge>
                  <Badge variant="warning" className="gap-1">
                    <AlertTriangle className="h-3 w-3" /> Pending
                  </Badge>
                  <Badge variant="info" className="gap-1">
                    <Info className="h-3 w-3" /> New
                  </Badge>
                  <Badge variant="gradient" className="gap-1">
                    <Sparkles className="h-3 w-3" /> Featured
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Form Inputs Section */}
          <section className="mb-12">
            <h2 className="font-display font-bold text-2xl mb-6">Form Inputs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Text Inputs</CardTitle>
                  <CardDescription>Various input variants and sizes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Input</label>
                    <Input placeholder="Enter your name..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">With Icon</label>
                    <Input 
                      placeholder="Search..." 
                      icon={<Search className="h-4 w-4" />}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Icon Right</label>
                    <Input 
                      placeholder="Email address" 
                      icon={<Mail className="h-4 w-4" />}
                      iconPosition="right"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ghost Variant</label>
                    <Input variant="ghost" placeholder="Ghost input..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Filled Variant</label>
                    <Input variant="filled" placeholder="Filled input..." />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Input Sizes</CardTitle>
                  <CardDescription>Small, default, and large sizes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Small</label>
                    <Input inputSize="sm" placeholder="Small input" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default</label>
                    <Input inputSize="default" placeholder="Default input" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Large</label>
                    <Input inputSize="lg" placeholder="Large input" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Disabled</label>
                    <Input placeholder="Disabled input" disabled />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Textarea</CardTitle>
                  <CardDescription>Multi-line text input variants</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default</label>
                    <Textarea placeholder="Write your message here..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ghost</label>
                    <Textarea variant="ghost" placeholder="Ghost textarea..." />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Select</CardTitle>
                  <CardDescription>Dropdown selection component</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Select</label>
                    <Select value={selectValue} onValueChange={setSelectValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Option One</SelectItem>
                        <SelectItem value="option2">Option Two</SelectItem>
                        <SelectItem value="option3">Option Three</SelectItem>
                        <SelectItem value="option4">Option Four</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">With Categories</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beauty">💄 Beauty</SelectItem>
                        <SelectItem value="fashion">👗 Fashion</SelectItem>
                        <SelectItem value="jewelry">💎 Jewelry</SelectItem>
                        <SelectItem value="accessories">👜 Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Form Validation Section */}
          <section className="mb-12">
            <h2 className="font-display font-bold text-2xl mb-6">Form with Validation</h2>
            <Card>
              <CardHeader>
                <CardTitle>User Registration</CardTitle>
                <CardDescription>Complete form with Zod validation and error messages</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your username" 
                                icon={<User className="h-4 w-4" />}
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              This will be your public display name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="you@example.com" 
                                type="email"
                                icon={<Mail className="h-4 w-4" />}
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              We'll never share your email.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us a little about yourself..." 
                              className="resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Brief description for your profile. Max 160 characters.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your specialty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beauty">💄 Beauty</SelectItem>
                              <SelectItem value="fashion">👗 Fashion</SelectItem>
                              <SelectItem value="jewelry">💎 Jewelry</SelectItem>
                              <SelectItem value="accessories">👜 Accessories</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose your primary focus area.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-3">
                      <Button type="submit" className="gap-2">
                        <Send className="h-4 w-4" /> Submit Form
                      </Button>
                      <Button type="button" variant="outline" onClick={() => form.reset()}>
                        Reset
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </section>

          {/* Dialogs & Sheets Section */}
          <section className="mb-12">
            <h2 className="font-display font-bold text-2xl mb-6">Dialogs & Sheets</h2>
            <Card>
              <CardHeader>
                <CardTitle>Modal Components</CardTitle>
                <CardDescription>Dialog and Sheet overlays with beauty theme styling</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Layers className="h-4 w-4" /> Open Dialog
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Beauty Theme Dialog</DialogTitle>
                      <DialogDescription>
                        This dialog features rounded corners, backdrop blur, and subtle shadow effects that match the beauty aesthetic.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        Dialog content goes here. You can add forms, information, or any other content.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button onClick={() => {
                        toast.success("Action confirmed!");
                        setIsDialogOpen(false);
                      }}>Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <PanelRight className="h-4 w-4" /> Open Sheet
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Beauty Theme Sheet</SheetTitle>
                      <SheetDescription>
                        Sliding panel with frosted glass effect and rounded edges.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-6 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Sheets are great for side panels, navigation menus, or detailed views without leaving the current page.
                      </p>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Quick Action</label>
                        <Input placeholder="Enter something..." />
                      </div>
                      <Button className="w-full" onClick={() => {
                        toast.success("Sheet action completed!");
                        setIsSheetOpen(false);
                      }}>
                        Save Changes
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </CardContent>
            </Card>
          </section>

          {/* Toast Section */}
          <section className="mb-12">
            <h2 className="font-display font-bold text-2xl mb-6">Toasts / Notifications</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => handleToast("default")} className="gap-2">
                    <Bell className="h-4 w-4" /> Default Toast
                  </Button>
                  <Button variant="outline" onClick={() => handleToast("success")} className="gap-2 text-emerald-600">
                    <Check className="h-4 w-4" /> Success Toast
                  </Button>
                  <Button variant="outline" onClick={() => handleToast("error")} className="gap-2 text-rose-600">
                    <X className="h-4 w-4" /> Error Toast
                  </Button>
                  <Button variant="outline" onClick={() => handleToast("warning")} className="gap-2 text-amber-600">
                    <AlertTriangle className="h-4 w-4" /> Warning Toast
                  </Button>
                  <Button variant="outline" onClick={() => handleToast("info")} className="gap-2 text-sky-600">
                    <Info className="h-4 w-4" /> Info Toast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Cards Section */}
          <section className="mb-12">
            <h2 className="font-display font-bold text-2xl mb-6">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>With header and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Cards have soft shadows, rounded corners, and subtle hover effects.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/80 to-accent/80 text-primary-foreground">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Gradient Card</CardTitle>
                      <CardDescription>With icon accent</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Enhanced with gradient backgrounds and icon highlights.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20 shadow-lg shadow-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Featured Card
                  </CardTitle>
                  <CardDescription>With enhanced styling</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Featured cards have colored borders and enhanced shadows.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Skeletons Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl">Skeleton Loading States</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSkeletons(!showSkeletons)}
              >
                {showSkeletons ? "Hide Skeletons" : "Show Skeletons"}
              </Button>
            </div>
            
            {showSkeletons && (
              <div className="space-y-8">
                {/* Basic Skeletons */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Skeletons</CardTitle>
                    <CardDescription>Simple loading placeholders</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-24 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </CardContent>
                </Card>

                {/* Metric Skeletons */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Metric Cards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <SkeletonMetric />
                    <SkeletonMetric />
                    <SkeletonMetric />
                    <SkeletonMetric />
                  </div>
                </div>

                {/* Card Skeletons */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Content Cards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                </div>

                {/* List Skeleton */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">List Items</h3>
                  <SkeletonList count={4} />
                </div>

                {/* Table Skeleton */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Data Table</h3>
                  <SkeletonTable rows={5} columns={5} />
                </div>

                {/* Chart Skeleton */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Chart</h3>
                  <SkeletonChart />
                </div>
              </div>
            )}
          </section>

          {/* Color Palette */}
          <section className="mb-12">
            <h2 className="font-display font-bold text-2xl mb-6">Color Palette</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <div className="h-16 rounded-xl bg-primary" />
                    <p className="text-sm font-medium">Primary</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-xl bg-secondary" />
                    <p className="text-sm font-medium">Secondary</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-xl bg-accent" />
                    <p className="text-sm font-medium">Accent</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-xl bg-muted" />
                    <p className="text-sm font-medium">Muted</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-xl bg-destructive" />
                    <p className="text-sm font-medium">Destructive</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="space-y-2">
                    <div className="h-12 rounded-xl bg-gradient-to-r from-primary to-accent" />
                    <p className="text-sm font-medium">Gradient Primary</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30" />
                    <p className="text-sm font-medium">Success</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30" />
                    <p className="text-sm font-medium">Warning</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30" />
                    <p className="text-sm font-medium">Info</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
    </PageContainer>
  );
};

export default ComponentShowcase;
