import { motion } from "framer-motion";
import { Check, X, Clock, Zap } from "lucide-react";
import { GlowingCard } from "@/components/effects/GlowingCard";

const comparisons = [
  {
    feature: "Trend Detection",
    traditional: { value: "Manual research", time: "2-4 weeks", icon: X },
    instincts: { value: "AI-powered real-time", time: "24-72 hours early", icon: Check },
  },
  {
    feature: "Inventory Matching",
    traditional: { value: "Spreadsheets & guesswork", time: "Days of analysis", icon: X },
    instincts: { value: "Automatic SKU matching", time: "Instant", icon: Check },
  },
  {
    feature: "Creative Generation",
    traditional: { value: "Agency or in-house team", time: "1-2 weeks", icon: X },
    instincts: { value: "AI-generated variants", time: "Seconds", icon: Check },
  },
  {
    feature: "Ad Testing",
    traditional: { value: "Live A/B tests", time: "Weeks + wasted spend", icon: X },
    instincts: { value: "Synthetic focus groups", time: "Before spending $1", icon: Check },
  },
  {
    feature: "Campaign Launch",
    traditional: { value: "Manual platform setup", time: "Hours per platform", icon: X },
    instincts: { value: "One-click multi-platform", time: "47 seconds", icon: Check },
  },
  {
    feature: "Optimization",
    traditional: { value: "Weekly manual reviews", time: "Reactive adjustments", icon: X },
    instincts: { value: "Real-time auto-morphing", time: "Continuous", icon: Check },
  },
  {
    feature: "Time to Market",
    traditional: { value: "Weeks to months", time: "Miss the trend", icon: X },
    instincts: { value: "Signal to sale", time: "Under 2 hours", icon: Check },
  },
];

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">Traditional Marketing</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-primary">Instincts AI</span>
            </div>
          </motion.div>
        </div>

        {/* Rows */}
        <div className="space-y-3">
          {comparisons.map((row, i) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-3 gap-4 items-center"
            >
              {/* Feature Name */}
              <div className="font-medium text-foreground">{row.feature}</div>

              {/* Traditional */}
              <GlowingCard className="p-4 bg-muted/30 border-border/30">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-destructive" />
                  </div>
                  <div>
                    <div className="text-sm text-foreground/80">{row.traditional.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{row.traditional.time}</div>
                  </div>
                </div>
              </GlowingCard>

              {/* Instincts */}
              <GlowingCard className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-signal-stable/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-signal-stable" />
                  </div>
                  <div>
                    <div className="text-sm text-foreground">{row.instincts.value}</div>
                    <div className="text-xs text-primary mt-1 font-medium">{row.instincts.time}</div>
                  </div>
                </div>
              </GlowingCard>
            </motion.div>
          ))}
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-3 gap-4"
        >
          <div />
          <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/30">
            <div className="text-2xl font-display font-bold text-muted-foreground">4-8 weeks</div>
            <div className="text-xs text-muted-foreground mt-1">Average campaign cycle</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
            <div className="text-2xl font-display font-bold text-primary">&lt;2 hours</div>
            <div className="text-xs text-primary/80 mt-1">Signal to live campaign</div>
          </div>
        </motion.div>

        {/* Bottom Line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-lg text-muted-foreground">
            While competitors are still in meetings, you are already selling.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
