import { motion } from "framer-motion";
import { ChevronRight, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContentTypeCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  count: number;
  onClick: () => void;
}

export function ContentTypeCard({
  name,
  description,
  icon: Icon,
  color,
  count,
  onClick,
}: ContentTypeCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{description}</p>
              <Badge variant="secondary">{count} created</Badge>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
