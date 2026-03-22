import { motion } from "framer-motion";
import { Eye, Image, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";

interface RequestListItemProps {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  assetTypeName: string;
  assetTypeColor: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function RequestListItem({
  title,
  status,
  createdAt,
  assetTypeName,
  assetTypeColor,
  icon: Icon,
  onClick,
}: RequestListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="border-border/50 hover:border-primary/30 transition-all">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${assetTypeColor}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold">{title}</h3>
                <StatusBadge status={status as any} />
              </div>
              <p className="text-sm text-muted-foreground">
                {assetTypeName} • Created {format(new Date(createdAt), "MMM d, yyyy")}
              </p>
            </div>
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
