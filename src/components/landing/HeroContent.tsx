import { motion, MotionValue } from "framer-motion";
import { Sparkles, Zap, TrendingUp, Target } from "lucide-react";
import { TextReveal } from "@/components/effects/TextReveal";
import { AnimatedCounter } from "@/components/effects/AnimatedCounter";

interface Feature {
  icon: typeof Sparkles;
  label: string;
  value: string;
}

const features: Feature[] = [
  { icon: Sparkles, label: "AI Trend Detection", value: "Real-time" },
  { icon: Zap, label: "Speed to Shelf", value: "<2hrs" },
  { icon: TrendingUp, label: "Revenue Lift", value: "+47%" },
  { icon: Target, label: "Inventory Match", value: "94%" },
];

interface HeroContentProps {
  heroTextY: MotionValue<number>;
  heroTextOpacity: MotionValue<number>;
  heroTextMoveX: MotionValue<number>;
  heroTextMoveY: MotionValue<number>;
  featureCardsY: MotionValue<number>;
}

export function HeroContent({
  heroTextY,
  heroTextOpacity,
  heroTextMoveX,
  heroTextMoveY,
  featureCardsY,
}: HeroContentProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ 
          y: heroTextY, 
          opacity: heroTextOpacity,
          x: heroTextMoveX,
          translateY: heroTextMoveY
        }}
      >
        <TextReveal className="font-display font-bold text-5xl md:text-7xl mb-4">
          From Signal to Sale
        </TextReveal>
        <motion.p 
          className="text-xl md:text-2xl text-muted-foreground mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          in Minutes, Not Months
        </motion.p>
      </motion.div>

      {/* Feature Stats */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{ y: featureCardsY }}
      >
        {features.map((feature, i) => (
          <motion.div
            key={feature.label}
            className="relative p-6 rounded-2xl bg-card/90 border border-border/30 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.08)] hover:shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.15)] hover:border-primary/20 transition-all duration-300 group cursor-default"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <motion.div 
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-3"
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <feature.icon className="w-6 h-6 text-primary" />
            </motion.div>
            <div className="text-3xl font-bold font-display bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{feature.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{feature.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}

export function HeroBottomStats() {
  return (
    <motion.div 
      className="mt-20 flex items-center justify-center gap-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <div>
        <AnimatedCounter value={2847} duration={2} className="text-3xl font-bold" />
        <div className="text-sm text-muted-foreground">Brands Onboarded</div>
      </div>
      <div className="w-px h-12 bg-border" />
      <div>
        <AnimatedCounter value={12} duration={1.5} prefix="$" suffix="M" className="text-3xl font-bold" />
        <div className="text-sm text-muted-foreground">Revenue Generated</div>
      </div>
      <div className="w-px h-12 bg-border" />
      <div>
        <AnimatedCounter value={89} duration={1.8} suffix="%" className="text-3xl font-bold" />
        <div className="text-sm text-muted-foreground">Avg. Inventory Match</div>
      </div>
    </motion.div>
  );
}
