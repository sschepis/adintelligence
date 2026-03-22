import { motion, MotionValue } from "framer-motion";

interface HeroBackgroundProps {
  parallaxY: MotionValue<number>;
  parallaxOpacity: MotionValue<number>;
  parallaxScale: MotionValue<number>;
  floatingOrb1Y: MotionValue<number>;
  floatingOrb1Scale: MotionValue<number>;
  floatingOrb1Rotate: MotionValue<number>;
  floatingOrb2Y: MotionValue<number>;
  floatingOrb2Scale: MotionValue<number>;
  floatingOrb2Rotate: MotionValue<number>;
  floatingOrb3Y: MotionValue<number>;
  floatingOrb3Scale: MotionValue<number>;
  floatingOrb3Rotate: MotionValue<number>;
  floatingOrb4Y: MotionValue<number>;
  floatingOrb4Scale: MotionValue<number>;
  orb1X: MotionValue<number>;
  orb1Y: MotionValue<number>;
  orb2X: MotionValue<number>;
  orb2Y: MotionValue<number>;
  orb3X: MotionValue<number>;
  orb3Y: MotionValue<number>;
  mouseXSpring: MotionValue<number>;
  mouseYSpring: MotionValue<number>;
}

export function HeroBackground({
  parallaxY,
  parallaxOpacity,
  parallaxScale,
  floatingOrb1Y,
  floatingOrb1Scale,
  floatingOrb1Rotate,
  floatingOrb2Y,
  floatingOrb2Scale,
  floatingOrb2Rotate,
  floatingOrb3Y,
  floatingOrb3Scale,
  floatingOrb3Rotate,
  floatingOrb4Y,
  floatingOrb4Scale,
  orb1X,
  orb1Y,
  orb2X,
  orb2Y,
  orb3X,
  orb3Y,
  mouseXSpring,
  mouseYSpring,
}: HeroBackgroundProps) {
  return (
    <>
      {/* Beauty Gradient Hero Background - Primary layer */}
      <motion.div 
        className="fixed inset-0 pointer-events-none"
        style={{ 
          y: parallaxY, 
          opacity: parallaxOpacity,
          scale: parallaxScale
        }}
      >
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background/50 to-transparent" />
      </motion.div>
      
      {/* Floating orbs with enhanced parallax + mouse-follow */}
      <motion.div 
        className="fixed top-1/4 left-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ 
          y: floatingOrb1Y,
          x: orb1X,
          scale: floatingOrb1Scale,
          rotate: floatingOrb1Rotate,
          translateY: orb1Y 
        }}
      />
      <motion.div 
        className="fixed top-1/3 right-1/4 w-80 h-80 bg-accent/40 rounded-full blur-3xl opacity-50 pointer-events-none"
        style={{ 
          y: floatingOrb2Y,
          x: orb2X,
          scale: floatingOrb2Scale,
          rotate: floatingOrb2Rotate,
          translateY: orb2Y 
        }}
      />
      <motion.div 
        className="fixed bottom-1/4 left-1/3 w-72 h-72 bg-muted rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ 
          y: floatingOrb3Y,
          x: orb3X,
          scale: floatingOrb3Scale,
          rotate: floatingOrb3Rotate,
          translateY: orb3Y 
        }}
      />
      <motion.div 
        className="fixed top-1/2 right-1/3 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ 
          y: floatingOrb4Y,
          scale: floatingOrb4Scale,
        }}
      />
      
      {/* Interactive cursor glow */}
      <motion.div 
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
          x: mouseXSpring,
          y: mouseYSpring,
          left: '50%',
          top: '50%',
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
    </>
  );
}
