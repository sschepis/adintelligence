import { motion } from "framer-motion";
import { LucideIcon, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AssetType {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description?: string;
}

interface AssetTypeGridProps {
  assetTypes: AssetType[];
  counts: Record<string, number>;
  onSelect: (typeId: string) => void;
  columns?: 2 | 3;
}

export function AssetTypeGrid({ 
  assetTypes, 
  counts, 
  onSelect,
  columns = 3 
}: AssetTypeGridProps) {
  return (
    <div className={`grid grid-cols-${columns} gap-4 mb-8`}>
      {assetTypes.map((type) => {
        const Icon = type.icon;
        const count = counts[type.id] || 0;
        return (
          <motion.div
            key={type.id}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
            onClick={() => onSelect(type.id)}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${type.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{type.name}</h3>
                    {type.description ? (
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">{count} requests</p>
                    )}
                  </div>
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
