import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Zap, ShoppingCart, Globe } from "lucide-react";

interface TickerItem {
  id: number;
  type: "trend" | "match" | "sale" | "deploy";
  message: string;
}

const generateItem = (id: number): TickerItem => {
  const types: TickerItem["type"][] = ["trend", "match", "sale", "deploy"];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const messages = {
    trend: [
      "#CleanGirlMakeup detected on TikTok — 847K views/hr",
      "Emerging: 'Tomato Girl Summer' rising across platforms",
      "Pinterest: 'Coastal Grandmother' +234% this week",
      "'Quiet Luxury' aesthetic trending in EU markets",
    ],
    match: [
      "3 SKUs matched to #GlazedSkin trend — $12K potential",
      "Inventory match: Summer Collection → Beach Aesthetic",
      "New bundle opportunity: 5 products, 89% style match",
      "Dead stock alert: 12 items match rising trend",
    ],
    sale: [
      "Luxe Beauty: $4,200 from trend-matched campaign",
      "Conversion: #SummerGlow ad → 47 units sold",
      "Urban Style Co: 312% ROAS on AI-generated creative",
      "Flash sale triggered: Trend velocity hit threshold",
    ],
    deploy: [
      "Campaign live: Meta + TikTok in 47 seconds",
      "Auto-morphing: Creative updated for EU audience",
      "Bid adjusted: +15% for high-intent segment",
      "New market opened: UK campaign launched",
    ],
  };

  return {
    id,
    type,
    message: messages[type][Math.floor(Math.random() * messages[type].length)],
  };
};

const icons = {
  trend: TrendingUp,
  match: Zap,
  sale: ShoppingCart,
  deploy: Globe,
};

const colors = {
  trend: "text-primary",
  match: "text-signal-rising",
  sale: "text-signal-stable",
  deploy: "text-accent",
};

export function LiveDataTicker() {
  const [items, setItems] = useState<TickerItem[]>(() => [
    generateItem(0),
    generateItem(1),
    generateItem(2),
    generateItem(3),
    generateItem(4),
  ]);
  const [counter, setCounter] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => {
        const newCounter = prev + 1;
        setItems(prevItems => {
          const newItems = [...prevItems.slice(1), generateItem(newCounter)];
          return newItems;
        });
        return newCounter;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl bg-background/30 backdrop-blur-sm border border-border/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Activity</span>
      </div>
      
      {/* Fixed height container - exactly 5 items */}
      <div className="h-[140px] overflow-hidden">
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = icons[item.type];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 text-sm h-[24px]"
              >
                <Icon className={`w-4 h-4 ${colors[item.type]} shrink-0`} />
                <span className="text-foreground/80 truncate">{item.message}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
