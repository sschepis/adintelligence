import { motion } from "framer-motion";
import { 
  Zap, 
  Eye, 
  ShoppingBag, 
  Target,
  Layers,
  LineChart
} from "lucide-react";
import { GlowingCard } from "@/components/effects/GlowingCard";

const capabilities = [
  {
    icon: Eye,
    title: "Visual Signal Detection",
    description: "AI vision models scan millions of social posts to detect emerging color palettes, styles, and visual trends before they peak.",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    icon: Layers,
    title: "Inventory Intelligence",
    description: "Real-time matching between trending signals and your actual SKUs. Never miss a viral moment because of stock issues.",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Target,
    title: "Synthetic Focus Groups",
    description: "AI personas trained on real consumer behavior predict reactions to your creative before you spend a dollar.",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    icon: ShoppingBag,
    title: "Smart Bundling",
    description: "Automatically create product bundles based on trending combinations and complementary color/style matching.",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: Zap,
    title: "Real-Time Morphing",
    description: "Live campaigns auto-adjust creatives, bids, and targeting as trends evolve—no manual intervention needed.",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: LineChart,
    title: "Predictive Analytics",
    description: "Know which trends will drive revenue before they happen. Our models predict commercial viability with 87% accuracy.",
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
];

export function PlatformShowcase() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {capabilities.map((cap, i) => (
        <motion.div
          key={cap.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        >
          <GlowingCard className="p-6 h-full group hover:scale-[1.02] transition-transform duration-300">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cap.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <cap.icon className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">{cap.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
          </GlowingCard>
        </motion.div>
      ))}
    </div>
  );
}
