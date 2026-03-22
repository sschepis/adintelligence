import { motion } from "framer-motion";
import { ChevronRight, Clock, FileText, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface ContentListItemProps {
  id: string;
  title: string;
  contentType: string;
  createdAt: string;
  icon: LucideIcon;
  color: string;
  typeName: string;
  onClick: () => void;
}

export function ContentListItem({
  title,
  createdAt,
  icon: Icon,
  color,
  typeName,
  onClick,
}: ContentListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="border-border/50 hover:border-primary/30 transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{typeName}</span>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{format(new Date(createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
