import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const steps = [
  { step: "01", title: "Enter Your URL", desc: "We scan your brand and extract products, colors, and taxonomy automatically" },
  { step: "02", title: "Detect Trends", desc: "AI monitors TikTok, Instagram & Pinterest for signals matching your catalog" },
  { step: "03", title: "Test & Validate", desc: "Synthetic focus groups preview ad reactions before you spend a dollar" },
  { step: "04", title: "Deploy & Sell", desc: "One-click campaign launch with real-time optimization and inventory sync" },
];

export function HowItWorks() {
  return (
    <motion.section 
      className="py-24 max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-16">
        <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">Get Started in Minutes</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          No complex setup. No integration headaches. Just results.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {steps.map((item, i) => (
          <motion.div
            key={item.step}
            className="relative group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div className="p-6 h-full rounded-2xl bg-card/90 border border-border/30 backdrop-blur-xl shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 group-hover:-translate-y-1">
              <div className="text-5xl font-display font-bold bg-gradient-to-br from-primary/30 to-accent/20 bg-clip-text text-transparent mb-3">{item.step}</div>
              <h3 className="font-display font-semibold text-lg mb-2 text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
            {i < 3 && (
              <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-6 h-6 text-primary/40" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
