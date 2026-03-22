import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Sparkles, Palette, Eye, Zap, CheckCircle2, RefreshCw } from "lucide-react";
import { GlowingCard } from "@/components/effects/GlowingCard";

const analysisSteps = [
  { icon: Eye, label: "Scanning brand assets...", color: "hsl(350 85% 55%)" },
  { icon: Palette, label: "Applying Theme 1...", color: "hsl(38 92% 50%)" },
  { icon: RefreshCw, label: "Switching to Theme 2...", color: "hsl(280 60% 55%)" },
  { icon: Zap, label: "Restoring original...", color: "hsl(170 50% 50%)" },
];

// Demo brand theme 1 - Warm gold/orange luxury theme (LIGHT mode)
const demoTheme1 = {
  name: "Luxury Gold",
  primary: "38 92% 50%",           // Vibrant gold
  accent: "24 100% 55%",           // Warm orange
  ring: "38 92% 50%",
  background: "40 50% 97%",        // Light warm cream
  foreground: "38 30% 15%",        // Dark warm brown for text
  card: "40 40% 99%",              
  cardForeground: "38 30% 15%",
  border: "38 30% 85%",            
  secondary: "38 40% 92%",         
  muted: "38 25% 94%",
  mutedForeground: "38 25% 45%",
  gradient: "linear-gradient(135deg, hsl(38 92% 50%) 0%, hsl(24 100% 55%) 100%)",
};

// Demo brand theme 2 - Cool purple/magenta creative theme (LIGHT mode)
const demoTheme2 = {
  name: "Creative Purple",
  primary: "280 60% 55%",          // Deep purple
  accent: "320 70% 60%",           // Vibrant magenta
  ring: "280 60% 55%",
  background: "280 40% 98%",       // Light purple-tinted
  foreground: "280 30% 15%",       // Dark purple for text
  card: "280 30% 99%",             
  cardForeground: "280 30% 15%",
  border: "280 25% 88%",           
  secondary: "280 30% 94%",        
  muted: "280 20% 94%",
  mutedForeground: "280 20% 45%",
  gradient: "linear-gradient(135deg, hsl(280 60% 55%) 0%, hsl(320 70% 60%) 100%)",
};

// Original theme values to restore - matches the beauty pastel theme from index.css
const originalTheme = {
  name: "Instincts AI",
  primary: "350 85% 55%",        // Coral primary
  accent: "25 80% 70%",          // Peach accent
  ring: "350 85% 55%",
  background: "30 50% 98%",      // Warm cream background
  foreground: "340 20% 20%",     // Dark text
  card: "0 0% 100%",
  cardForeground: "340 20% 20%",
  border: "330 20% 90%",
  secondary: "280 30% 95%",      // Soft lavender
  muted: "330 25% 94%",
  mutedForeground: "340 15% 45%",
  gradient: "linear-gradient(135deg, hsl(350 85% 55%) 0%, hsl(25 80% 70%) 100%)",
};

type Theme = typeof originalTheme;

export const IntelligentUIDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);
  const [activeTheme, setActiveTheme] = useState<"original" | "theme1" | "theme2">("original");
  const [showPulse, setShowPulse] = useState(false);
  const [pulseColor, setPulseColor] = useState("hsl(280 80% 55%)");
  const activeThemeRef = useRef<"original" | "theme1" | "theme2">("original");
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });
  
  // Transform scroll progress to analysis phases
  const analysisProgress = useTransform(scrollYProgress, [0, 1], [0, 100]);
  
  // Trigger pulse effect
  const triggerPulse = (color: string) => {
    setPulseColor(color);
    setShowPulse(true);
    setTimeout(() => setShowPulse(false), 800);
  };

  // Apply a theme to the page
  const applyTheme = (theme: Theme, themeName: "original" | "theme1" | "theme2") => {
    if (activeThemeRef.current === themeName) return;
    
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--ring', theme.ring);
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--foreground', theme.foreground);
    root.style.setProperty('--card', theme.card);
    root.style.setProperty('--card-foreground', theme.cardForeground);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--muted', theme.muted);
    root.style.setProperty('--muted-foreground', theme.mutedForeground);
    
    if (themeName !== "original") {
      root.classList.add('demo-theme-active');
    } else {
      root.classList.remove('demo-theme-active');
    }
    
    activeThemeRef.current = themeName;
    setActiveTheme(themeName);
    triggerPulse(`hsl(${theme.primary})`);
  };

  useEffect(() => {
    const unsubscribe = analysisProgress.on("change", (value) => {
      // Step 0: Before animation starts
      if (value < 5) {
        setCurrentStep(-1);
        setIsComplete(false);
        applyTheme(originalTheme, "original");
      } else if (value < 18) {
        // Step 0: Scanning brand assets
        setCurrentStep(0);
        setIsComplete(false);
        applyTheme(originalTheme, "original");
      } else if (value < 35) {
        // Step 1: Apply Theme 1 (Gold)
        setCurrentStep(1);
        applyTheme(demoTheme1, "theme1");
      } else if (value < 55) {
        // Step 2: Switch to Theme 2 (Purple)
        setCurrentStep(2);
        applyTheme(demoTheme2, "theme2");
      } else if (value < 75) {
        // Step 3: Restoring original
        setCurrentStep(3);
        applyTheme(originalTheme, "original");
      } else {
        // Complete - back to original theme
        setIsComplete(true);
        applyTheme(originalTheme, "original");
      }
    });
    
    return () => {
      unsubscribe();
      // Cleanup - restore original theme
      const root = document.documentElement;
      root.style.setProperty('--primary', originalTheme.primary);
      root.style.setProperty('--accent', originalTheme.accent);
      root.style.setProperty('--ring', originalTheme.ring);
      root.style.setProperty('--background', originalTheme.background);
      root.style.setProperty('--foreground', originalTheme.foreground);
      root.style.setProperty('--card', originalTheme.card);
      root.style.setProperty('--card-foreground', originalTheme.cardForeground);
      root.style.setProperty('--border', originalTheme.border);
      root.style.setProperty('--secondary', originalTheme.secondary);
      root.style.setProperty('--muted', originalTheme.muted);
      root.style.setProperty('--muted-foreground', originalTheme.mutedForeground);
      root.classList.remove('demo-theme-active');
      activeThemeRef.current = "original";
    };
  }, [analysisProgress]);
  
  // Calculate theme transition
  const themeOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);
  const glowIntensity = useTransform(scrollYProgress, [0.5, 0.9], [0, 1]);

  return (
    <section ref={containerRef} className="relative min-h-[120vh] py-16">
      <div className="sticky top-20 max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Intelligent UI Adaptation
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch as we analyze your brand and transform the experience in real-time
          </p>
          <p className="text-sm text-primary/70 mt-2">
            {activeTheme === "original" 
              ? "Scroll to begin analysis" 
              : activeTheme === "theme1" 
                ? `✨ ${demoTheme1.name} applied - keep scrolling` 
                : `✨ ${demoTheme2.name} applied - keep scrolling`}
          </p>
        </motion.div>
        
        {/* Theme Pulse Effect Overlay */}
        <AnimatePresence>
          {showPulse && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 pointer-events-none z-50 rounded-2xl"
              style={{
                background: `radial-gradient(circle at center, ${pulseColor} 0%, transparent 70%)`,
                opacity: 0.3,
              }}
            />
          )}
        </AnimatePresence>

        {/* Main Demo Card */}
        <motion.div 
          className="relative"
          style={{ 
            filter: useTransform(glowIntensity, (v) => `drop-shadow(0 0 ${v * 60}px hsl(var(--primary) / 0.3))`),
          }}
        >
          <GlowingCard 
            className="p-8 md:p-12 overflow-hidden"
            glowColor={currentStep >= 3 ? "hsla(280, 60%, 55%, 0.2)" : "hsla(350, 85%, 55%, 0.15)"}
          >
            {/* Animated background gradient during transformation */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: useTransform(
                  themeOpacity,
                  (v) => `radial-gradient(ellipse at center, hsl(var(--primary) / ${v * 0.1}), transparent 70%)`
                ),
              }}
            />
            
            <div className="relative z-10">
              {/* Analysis Status */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <motion.div
                  className="w-3 h-3 rounded-full"
                  animate={{
                    backgroundColor: currentStep >= 0 
                      ? isComplete ? "hsl(170 50% 50%)" : "hsl(350 85% 55%)"
                      : "hsl(var(--muted))",
                    scale: currentStep >= 0 && !isComplete ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ repeat: isComplete ? 0 : Infinity, duration: 1 }}
                />
                <span className="text-sm font-medium">
                  {currentStep < 0 && "Scroll to begin analysis"}
                  {currentStep >= 0 && !isComplete && "Analyzing..."}
                  {isComplete && "Analysis Complete"}
                </span>
              </div>
              
              {/* Analysis Steps */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {analysisSteps.map((step, i) => (
                  <motion.div
                    key={step.label}
                    className="relative p-4 rounded-xl border border-border/50 bg-background/30"
                    animate={{
                      borderColor: currentStep >= i 
                        ? step.color 
                        : "hsl(var(--border) / 0.5)",
                      backgroundColor: currentStep >= i 
                        ? `${step.color.replace(')', ' / 0.1)')}` 
                        : "hsl(var(--background) / 0.3)",
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      animate={{ 
                        opacity: currentStep >= i ? 1 : 0.3,
                        scale: currentStep === i ? [1, 1.1, 1] : 1,
                      }}
                      transition={{ 
                        opacity: { duration: 0.3 },
                        scale: { repeat: currentStep === i ? Infinity : 0, duration: 0.8 }
                      }}
                    >
                      <step.icon 
                        className="w-6 h-6 mx-auto mb-2" 
                        style={{ color: currentStep >= i ? step.color : 'hsl(var(--muted-foreground))' }}
                      />
                      <p className="text-xs text-center text-muted-foreground">
                        {currentStep >= i ? step.label : "Waiting..."}
                      </p>
                    </motion.div>
                    
                    {/* Completion check */}
                    <AnimatePresence>
                      {currentStep > i && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute -top-1 -right-1"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
              
              {/* Demo UI Preview */}
              <motion.div
                className="rounded-xl border border-border/50 overflow-hidden"
                animate={{
                  borderColor: isComplete ? "hsl(280 60% 55% / 0.5)" : "hsl(var(--border) / 0.5)",
                }}
              >
                {/* Simulated Dashboard Header */}
                <motion.div 
                  className="flex items-center justify-between p-4 border-b border-border/50"
                  animate={{
                    backgroundColor: isComplete 
                      ? "hsl(280 30% 96%)" 
                      : "hsl(var(--card) / 0.5)",
                  }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      animate={{
                        background: isComplete 
                          ? "linear-gradient(135deg, hsl(280 60% 55%), hsl(320 70% 60%))"
                          : "linear-gradient(135deg, hsl(350 85% 55%), hsl(25 80% 70%))",
                      }}
                      transition={{ duration: 0.8 }}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </motion.div>
                    <span className="font-display font-semibold text-sm">Your Brand</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        animate={{
                          backgroundColor: isComplete 
                            ? "hsl(280 60% 55%)" 
                            : "hsl(var(--muted-foreground))",
                        }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                </motion.div>
                
                {/* Simulated Content */}
                <div className="p-6 grid grid-cols-3 gap-4">
                  {[
                    { label: "Signals", value: "24" },
                    { label: "Match Rate", value: "94%" },
                    { label: "Revenue", value: "$12K" },
                  ].map((metric, i) => (
                    <motion.div
                      key={metric.label}
                      className="p-4 rounded-lg border"
                      animate={{
                        borderColor: isComplete 
                          ? "hsl(280 60% 55% / 0.3)" 
                          : "hsl(var(--border) / 0.5)",
                        backgroundColor: isComplete 
                          ? "hsl(280 60% 55% / 0.05)" 
                          : "hsl(var(--card) / 0.3)",
                      }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    >
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Action Button */}
                <div className="p-4 border-t border-border/50">
                  <motion.div
                    className="w-full py-3 rounded-lg text-center text-sm font-medium text-white"
                    animate={{
                      background: isComplete 
                        ? "linear-gradient(135deg, hsl(280 60% 55%), hsl(320 70% 60%))"
                        : "linear-gradient(135deg, hsl(350 85% 55%), hsl(25 80% 70%))",
                    }}
                    transition={{ duration: 0.8 }}
                  >
                    Deploy Campaign
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Result Message */}
              <AnimatePresence>
                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center mt-6"
                  >
                    <p className="text-sm text-muted-foreground">
                      ✨ UI automatically adapted to your brand identity
                    </p>
                    <p className="text-xs text-primary/60 mt-1">
                      Notice the header and buttons changed color!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlowingCard>
        </motion.div>
        
        {/* Progress Indicator */}
        <div className="flex justify-center mt-8 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-12 h-1 rounded-full"
              animate={{
                backgroundColor: currentStep >= i 
                  ? analysisSteps[i]?.color || "hsl(187 100% 50%)"
                  : "hsl(var(--border))",
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
