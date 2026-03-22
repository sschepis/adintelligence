import { useState } from "react";
import { PageContainer } from "@/components/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Code, Rocket, Settings, Zap, Users, TrendingUp, Palette, Shield, Webhook, Key, FileCode } from "lucide-react";
import { DocsNavigation } from "@/components/docs/DocsNavigation";
import { GettingStartedGuide } from "@/components/docs/GettingStartedGuide";
import { FeatureGuides } from "@/components/docs/FeatureGuides";
import { BestPractices } from "@/components/docs/BestPractices";
import { ApplicationReference } from "@/components/docs/ApplicationReference";
import { ApiReference } from "@/components/docs/ApiReference";
import { WebhooksGuide } from "@/components/docs/WebhooksGuide";
import { CodeExamples } from "@/components/docs/CodeExamples";

const Documentation = () => {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [activeTab, setActiveTab] = useState("user");

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Book className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
            <p className="text-muted-foreground">
              Complete guides and reference documentation for Instincts AI
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="user" className="gap-2">
              <Users className="h-4 w-4" />
              User Guide
            </TabsTrigger>
            <TabsTrigger value="reference" className="gap-2">
              <Book className="h-4 w-4" />
              Reference
            </TabsTrigger>
            <TabsTrigger value="developer" className="gap-2">
              <Code className="h-4 w-4" />
              Developer
            </TabsTrigger>
          </TabsList>

          {/* User Guide Tab */}
          <TabsContent value="user" className="space-y-6">
            <div className="grid lg:grid-cols-[250px_1fr] gap-6">
              <DocsNavigation
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                sections={[
                  { id: "getting-started", label: "Getting Started", icon: Rocket },
                  { id: "features", label: "Feature Guides", icon: Zap },
                  { id: "best-practices", label: "Best Practices", icon: TrendingUp },
                ]}
              />
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="pr-4">
                  {activeSection === "getting-started" && <GettingStartedGuide />}
                  {activeSection === "features" && <FeatureGuides />}
                  {activeSection === "best-practices" && <BestPractices />}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Reference Tab */}
          <TabsContent value="reference" className="space-y-6">
            <div className="grid lg:grid-cols-[250px_1fr] gap-6">
              <DocsNavigation
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                sections={[
                  { id: "app-overview", label: "Application Overview", icon: Settings },
                  { id: "brand-management", label: "Brand Management", icon: Palette },
                  { id: "security", label: "Security & Permissions", icon: Shield },
                ]}
              />
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="pr-4">
                  <ApplicationReference activeSection={activeSection} />
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Developer Tab */}
          <TabsContent value="developer" className="space-y-6">
            <div className="grid lg:grid-cols-[250px_1fr] gap-6">
              <DocsNavigation
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                sections={[
                  { id: "api-reference", label: "API Reference", icon: Key },
                  { id: "webhooks", label: "Webhooks", icon: Webhook },
                  { id: "code-examples", label: "Code Examples", icon: FileCode },
                ]}
              />
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="pr-4">
                  {activeSection === "api-reference" && <ApiReference />}
                  {activeSection === "webhooks" && <WebhooksGuide />}
                  {activeSection === "code-examples" && <CodeExamples />}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default Documentation;
