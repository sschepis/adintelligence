import { motion } from "framer-motion";
import {
  HeroBackground,
  HeroContent,
  HeroBottomStats,
  OnboardingFlow,
  LandingFooter,
  FinalCTA,
  HowItWorks,
  LandingHeader,
  WorkflowDemo,
  PlatformShowcase,
  LiveDataTicker,
  ComparisonTable,
  ROICalculator,
  PricingSection,
  StatsGrid,
  StatsBar,
  IntelligentUIDemo,
  FAQSection,
  TestimonialsSection,
} from "@/components/landing";
import { RegistrationModal } from "@/components/onboarding/RegistrationModal";
import { AccessRequestForm } from "@/components/onboarding/AccessRequestForm";
import { useLandingOnboarding } from "@/hooks/useLandingOnboarding";
import { useParallaxEffects } from "@/hooks/useParallaxEffects";

const Landing = () => {
  const {
    brandUrl,
    setBrandUrl,
    step,
    scanResult,
    isRegistering,
    showRegistrationModal,
    setShowRegistrationModal,
    showAccessRequestForm,
    setShowAccessRequestForm,
    handleScanWebsite,
    handleRegister,
    handleReset,
  } = useLandingOnboarding();

  const parallax = useParallaxEffects();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" onMouseMove={parallax.handleMouseMove}>
      <LandingHeader />
      
      <HeroBackground
        parallaxY={parallax.parallaxY}
        parallaxOpacity={parallax.parallaxOpacity}
        parallaxScale={parallax.parallaxScale}
        floatingOrb1Y={parallax.floatingOrb1Y}
        floatingOrb1Scale={parallax.floatingOrb1Scale}
        floatingOrb1Rotate={parallax.floatingOrb1Rotate}
        floatingOrb2Y={parallax.floatingOrb2Y}
        floatingOrb2Scale={parallax.floatingOrb2Scale}
        floatingOrb2Rotate={parallax.floatingOrb2Rotate}
        floatingOrb3Y={parallax.floatingOrb3Y}
        floatingOrb3Scale={parallax.floatingOrb3Scale}
        floatingOrb3Rotate={parallax.floatingOrb3Rotate}
        floatingOrb4Y={parallax.floatingOrb4Y}
        floatingOrb4Scale={parallax.floatingOrb4Scale}
        orb1X={parallax.orb1X}
        orb1Y={parallax.orb1Y}
        orb2X={parallax.orb2X}
        orb2Y={parallax.orb2Y}
        orb3X={parallax.orb3X}
        orb3Y={parallax.orb3Y}
        mouseXSpring={parallax.mouseXSpring}
        mouseYSpring={parallax.mouseYSpring}
      />

      <div className="relative z-10 container mx-auto px-6 pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <HeroContent
            heroTextY={parallax.heroTextY}
            heroTextOpacity={parallax.heroTextOpacity}
            heroTextMoveX={parallax.heroTextMoveX}
            heroTextMoveY={parallax.heroTextMoveY}
            featureCardsY={parallax.featureCardsY}
          />

          <OnboardingFlow
            step={step}
            brandUrl={brandUrl}
            setBrandUrl={setBrandUrl}
            scanResult={scanResult}
            onScan={handleScanWebsite}
            onReset={handleReset}
            onOpenRegistration={() => setShowRegistrationModal(true)}
            onOpenAccessRequest={() => setShowAccessRequestForm(true)}
          />

          <HeroBottomStats />
        </div>

        {/* Live Activity Ticker */}
        <motion.section 
          className="py-12 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <LiveDataTicker />
        </motion.section>

        {/* Interactive Workflow Demo */}
        <motion.section 
          className="py-24 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">The Complete Cycle</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch how Instincts AI turns cultural signals into revenue in real-time
            </p>
          </div>
          <WorkflowDemo />
        </motion.section>

        <IntelligentUIDemo />

        {/* Platform Capabilities */}
        <motion.section 
          id="features"
          className="py-24 max-w-6xl mx-auto scroll-mt-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">Platform Capabilities</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every tool you need to dominate trend-driven commerce
            </p>
          </div>
          <PlatformShowcase />
        </motion.section>

        {/* Stats Break 1 */}
        <motion.section 
          className="py-16 max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <StatsGrid 
            stats={[
              { value: 2847, label: "Brands Powered", suffix: "+" },
              { value: 47, label: "Avg. ROAS Lift", suffix: "%" },
              { value: 12, label: "Revenue Generated", prefix: "$", suffix: "M+" },
              { value: 94, label: "Inventory Match Rate", suffix: "%" },
            ]}
          />
        </motion.section>

        <HowItWorks />

        {/* Comparison Table */}
        <motion.section 
          className="py-24 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">The Old Way vs The Instincts Way</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See why leading brands are switching to AI-powered commerce
            </p>
          </div>
          <ComparisonTable />
        </motion.section>

        {/* ROI Calculator */}
        <motion.section 
          id="roi"
          className="py-24 max-w-4xl mx-auto scroll-mt-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">Calculate Your ROI</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how much revenue Instincts AI could generate for your brand
            </p>
          </div>
          <ROICalculator />
        </motion.section>

        {/* Stats Break 2 */}
        <motion.section 
          className="py-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <StatsBar 
            stats={[
              { value: 156, label: "Countries Served" },
              { value: 2.4, label: "Billion Data Points", suffix: "B" },
              { value: 99.9, label: "Uptime", suffix: "%" },
              { value: 50, label: "Faster Than Manual", suffix: "x" },
            ]}
          />
        </motion.section>

        <TestimonialsSection />

        {/* Pricing */}
        <motion.section 
          id="pricing"
          className="py-24 max-w-6xl mx-auto scroll-mt-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <PricingSection />
        </motion.section>

        <FAQSection />

        <FinalCTA />

        <LandingFooter />
      </div>

      {/* Modals */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        scanResult={scanResult || {
          isBrand: false,
          brandName: "",
          confidence: 0,
          reason: "",
          branding: { logo: null, colors: { primary: "", secondary: "", accent: "", background: "", text: "" } },
          taxonomy: [],
          products: []
        }}
        websiteUrl={brandUrl}
        onRegister={handleRegister}
        isRegistering={isRegistering}
      />
      
      <AccessRequestForm
        isOpen={showAccessRequestForm}
        onClose={() => setShowAccessRequestForm(false)}
        websiteUrl={brandUrl}
      />
    </div>
  );
};

export default Landing;
