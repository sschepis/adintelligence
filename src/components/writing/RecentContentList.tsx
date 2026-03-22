import { motion } from "framer-motion";
import { PenTool, Sparkles, FileText, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ContentItem } from "@/hooks/useWritingForge";
import { getContentType } from "./ContentTypeGrid";
import { EmptyState, LoadingSpinner } from "@/components/shared";

interface RecentContentListProps {
  contents: ContentItem[];
  loading: boolean;
  onSelectContent: (content: ContentItem) => void;
  onCreateNew: () => void;
}

export function RecentContentList({ 
  contents, 
  loading, 
  onSelectContent, 
  onCreateNew 
}: RecentContentListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Recent Content</h2>
      {loading ? (
        <LoadingSpinner text="Loading content..." />
      ) : contents.length === 0 ? (
        <EmptyState
          icon={PenTool}
          title="No content created yet"
          action={
            <Button onClick={onCreateNew} variant="outline" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Create Your First Content
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {contents.slice(0, 10).map((content) => {
            const contentType = getContentType(content.content_type);
            const Icon = contentType?.icon || FileText;
            return (
              <motion.div
                key={content.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="cursor-pointer"
                onClick={() => onSelectContent(content)}
              >
                <Card className="border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${contentType?.color || "from-gray-500 to-gray-600"}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{content.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{contentType?.name}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(content.created_at), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
