import { motion } from "framer-motion";
import { ChevronRight, Megaphone, Mail, FileText, Layout, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ContentType {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

export const CONTENT_TYPES: ContentType[] = [
  { id: "multi-platform-ad", name: "Multi-Platform Ad", icon: Megaphone, description: "Ad copy for Facebook, Instagram, Google & LinkedIn", color: "from-orange-500 to-red-500" },
  { id: "email-campaign", name: "Email Campaign", icon: Mail, description: "Engaging email sequences with high conversion", color: "from-blue-500 to-cyan-500" },
  { id: "blog-post", name: "Blog Post", icon: FileText, description: "SEO-optimized articles and thought leadership", color: "from-green-500 to-teal-500" },
  { id: "landing-page", name: "Landing Page", icon: Layout, description: "High-converting landing page copy", color: "from-purple-500 to-pink-500" },
];

export const TONES = [
  "Professional", "Casual", "Friendly", "Authoritative", "Playful", "Urgent", "Inspirational", "Educational"
];

interface ContentTypeGridProps {
  contents: { content_type: string }[];
  onSelectType: (typeId: string) => void;
}

export function ContentTypeGrid({ contents, onSelectType }: ContentTypeGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {CONTENT_TYPES.map((type) => {
        const Icon = type.icon;
        const count = contents.filter(c => c.content_type === type.id).length;
        return (
          <motion.div
            key={type.id}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
            onClick={() => onSelectType(type.id)}
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:shadow-sm hover:shadow-primary/10 transition-all rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${type.color} shadow-sm`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{type.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                    <Badge variant="secondary">{count} created</Badge>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

export function getContentType(typeId: string) {
  return CONTENT_TYPES.find(t => t.id === typeId);
}
