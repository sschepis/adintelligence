import { useScroll, useTransform, useMotionValue, useSpring, MotionValue } from "framer-motion";

interface ParallaxValues {
  // Background parallax
  parallaxY: MotionValue<number>;
  parallaxOpacity: MotionValue<number>;
  parallaxScale: MotionValue<number>;
  
  // Floating orbs
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
  
  // Hero text
  heroTextY: MotionValue<number>;
  heroTextOpacity: MotionValue<number>;
  featureCardsY: MotionValue<number>;
  
  // Mouse follow
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  mouseXSpring: MotionValue<number>;
  mouseYSpring: MotionValue<number>;
  orb1X: MotionValue<number>;
  orb1Y: MotionValue<number>;
  orb2X: MotionValue<number>;
  orb2Y: MotionValue<number>;
  orb3X: MotionValue<number>;
  orb3Y: MotionValue<number>;
  heroTextMoveX: MotionValue<number>;
  heroTextMoveY: MotionValue<number>;
  
  // Handler
  handleMouseMove: (e: React.MouseEvent) => void;
}

export function useParallaxEffects(): ParallaxValues {
  const { scrollY } = useScroll();
  
  // Background parallax
  const parallaxY = useTransform(scrollY, [0, 500], [0, 150]);
  const parallaxOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const parallaxScale = useTransform(scrollY, [0, 500], [1, 1.1]);
  
  // Floating orb parallax
  const floatingOrb1Y = useTransform(scrollY, [0, 800], [0, 200]);
  const floatingOrb1Scale = useTransform(scrollY, [0, 600], [1, 0.7]);
  const floatingOrb1Rotate = useTransform(scrollY, [0, 800], [0, 45]);
  
  const floatingOrb2Y = useTransform(scrollY, [0, 800], [0, 280]);
  const floatingOrb2Scale = useTransform(scrollY, [0, 600], [1, 0.6]);
  const floatingOrb2Rotate = useTransform(scrollY, [0, 800], [0, -30]);
  
  const floatingOrb3Y = useTransform(scrollY, [0, 800], [0, 150]);
  const floatingOrb3Scale = useTransform(scrollY, [0, 600], [1, 0.8]);
  const floatingOrb3Rotate = useTransform(scrollY, [0, 800], [0, 60]);
  
  const floatingOrb4Y = useTransform(scrollY, [0, 800], [0, 320]);
  const floatingOrb4Scale = useTransform(scrollY, [0, 600], [1, 0.5]);
  
  // Hero text parallax
  const heroTextY = useTransform(scrollY, [0, 300], [0, 40]);
  const heroTextOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  const featureCardsY = useTransform(scrollY, [0, 400], [0, 30]);
  
  // Mouse follow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);
  
  const orb1X = useTransform(mouseXSpring, [-500, 500], [-30, 30]);
  const orb1Y = useTransform(mouseYSpring, [-500, 500], [-20, 20]);
  const orb2X = useTransform(mouseXSpring, [-500, 500], [25, -25]);
  const orb2Y = useTransform(mouseYSpring, [-500, 500], [15, -15]);
  const orb3X = useTransform(mouseXSpring, [-500, 500], [-15, 15]);
  const orb3Y = useTransform(mouseYSpring, [-500, 500], [-25, 25]);
  const heroTextMoveX = useTransform(mouseXSpring, [-500, 500], [-8, 8]);
  const heroTextMoveY = useTransform(mouseYSpring, [-500, 500], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    mouseX.set(clientX - centerX);
    mouseY.set(clientY - centerY);
  };

  return {
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
    heroTextY,
    heroTextOpacity,
    featureCardsY,
    mouseX,
    mouseY,
    mouseXSpring,
    mouseYSpring,
    orb1X,
    orb1Y,
    orb2X,
    orb2Y,
    orb3X,
    orb3Y,
    heroTextMoveX,
    heroTextMoveY,
    handleMouseMove,
  };
}
