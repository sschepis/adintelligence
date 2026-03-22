import { useEffect } from "react";
import { useBrand } from "@/contexts/BrandContext";
import { meetsWCAG_AA, getCompliantTextColor } from "@/lib/colorContrast";

function hexToHsl(hex: string): string {
  hex = hex.replace(/^#/, '');
  
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface ThemeColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
  ctaPrimary?: string;
  ctaHover?: string;
  ctaText?: string;
  ctaGradientStart?: string;
  ctaGradientEnd?: string;
  ctaGradientEnabled?: boolean;
  ctaGradientAngle?: number;
  ctaGradientHoverEffect?: 'none' | 'shift' | 'shimmer' | 'pulse';
  linkDefault?: string;
  linkHover?: string;
  linkVisited?: string;
  menuBackground?: string;
  menuText?: string;
  menuHover?: string;
  menuActive?: string;
}

interface ThemeTypography {
  headingFont?: string;
  bodyFont?: string;
  baseFontSize?: number;
  headingWeight?: string;
  bodyWeight?: string;
  lineHeight?: number;
}

interface ThemeSpacing {
  baseUnit?: number;
  borderRadius?: number;
}

interface ThemeEffects {
  enableGradients?: boolean;
  enableShadows?: boolean;
  shadowIntensity?: number;
}

interface ThemeMetadata {
  colors?: ThemeColors;
  typography?: ThemeTypography;
  spacing?: ThemeSpacing;
  effects?: ThemeEffects;
}

function isValidHex(color: string | undefined): color is string {
  return !!color && /^#[0-9A-Fa-f]{6}$/.test(color);
}

export function useBrandTheme() {
  const { activeBrand } = useBrand();

  useEffect(() => {
    if (!activeBrand) return;

    const root = document.documentElement;
    const metadata = (activeBrand.metadata as { theme?: ThemeMetadata } | null)?.theme;
    const colors = metadata?.colors;
    const typography = metadata?.typography;
    const spacing = metadata?.spacing;
    const effects = metadata?.effects;
    
    const appliedProperties: string[] = [];
    
    try {
      // ===== COLORS =====
      // Primary color (from brand or theme)
      const primaryColor = colors?.primary || activeBrand.primary_color;
      if (isValidHex(primaryColor)) {
        root.style.setProperty('--primary', hexToHsl(primaryColor));
        appliedProperties.push('--primary');
      }
      
      // Secondary color
      const secondaryColor = colors?.secondary || activeBrand.secondary_color;
      if (isValidHex(secondaryColor)) {
        root.style.setProperty('--secondary', hexToHsl(secondaryColor));
        appliedProperties.push('--secondary');
      }
      
      // Accent color
      const accentColor = colors?.accent || activeBrand.accent_color;
      if (isValidHex(accentColor)) {
        root.style.setProperty('--accent', hexToHsl(accentColor));
        appliedProperties.push('--accent');
      }

      // Background color
      const bgColor = colors?.background || activeBrand.background_color;
      if (isValidHex(bgColor)) {
        root.style.setProperty('--background', hexToHsl(bgColor));
        appliedProperties.push('--background');
      }

      // Text/foreground color - enforce ADA compliance
      let textColor = colors?.text || activeBrand.text_color;
      if (isValidHex(textColor) && isValidHex(bgColor)) {
        // Auto-correct text color if it doesn't meet WCAG AA against background
        if (!meetsWCAG_AA(textColor, bgColor)) {
          textColor = getCompliantTextColor(bgColor);
          console.info(`[ADA] Auto-corrected text color to ${textColor} for WCAG AA compliance`);
        }
        root.style.setProperty('--foreground', hexToHsl(textColor));
        appliedProperties.push('--foreground');
      } else if (isValidHex(textColor)) {
        root.style.setProperty('--foreground', hexToHsl(textColor));
        appliedProperties.push('--foreground');
      }

      // ===== CTA COLORS =====
      const ctaPrimaryColor = colors?.ctaPrimary;
      let ctaTextColor = colors?.ctaText;
      
      if (isValidHex(ctaPrimaryColor)) {
        root.style.setProperty('--cta-primary', hexToHsl(ctaPrimaryColor));
        appliedProperties.push('--cta-primary');
        
        // Auto-correct CTA text if needed for ADA compliance
        if (isValidHex(ctaTextColor) && !meetsWCAG_AA(ctaTextColor, ctaPrimaryColor)) {
          ctaTextColor = getCompliantTextColor(ctaPrimaryColor);
          console.info(`[ADA] Auto-corrected CTA text color to ${ctaTextColor} for WCAG AA compliance`);
        }
      }
      
      if (isValidHex(colors?.ctaHover)) {
        root.style.setProperty('--cta-hover', hexToHsl(colors.ctaHover));
        appliedProperties.push('--cta-hover');
      }
      
      if (isValidHex(ctaTextColor)) {
        root.style.setProperty('--cta-text', hexToHsl(ctaTextColor));
        appliedProperties.push('--cta-text');
      }

      // ===== CTA GRADIENT =====
      if (isValidHex(colors?.ctaGradientStart)) {
        root.style.setProperty('--cta-gradient-start', colors.ctaGradientStart);
        appliedProperties.push('--cta-gradient-start');
      }
      
      if (isValidHex(colors?.ctaGradientEnd)) {
        root.style.setProperty('--cta-gradient-end', colors.ctaGradientEnd);
        appliedProperties.push('--cta-gradient-end');
      }
      
      if (colors?.ctaGradientEnabled !== undefined) {
        root.style.setProperty('--cta-gradient-enabled', colors.ctaGradientEnabled ? '1' : '0');
        appliedProperties.push('--cta-gradient-enabled');
      }
      
      if (colors?.ctaGradientAngle !== undefined) {
        root.style.setProperty('--cta-gradient-angle', `${colors.ctaGradientAngle}deg`);
        appliedProperties.push('--cta-gradient-angle');
      }
      
      if (colors?.ctaGradientHoverEffect) {
        root.style.setProperty('--cta-gradient-hover-effect', colors.ctaGradientHoverEffect);
        appliedProperties.push('--cta-gradient-hover-effect');
      }

      // ===== LINK COLORS =====
      if (isValidHex(colors?.linkDefault)) {
        root.style.setProperty('--link-default', hexToHsl(colors.linkDefault));
        appliedProperties.push('--link-default');
      }
      
      if (isValidHex(colors?.linkHover)) {
        root.style.setProperty('--link-hover', hexToHsl(colors.linkHover));
        appliedProperties.push('--link-hover');
      }
      
      if (isValidHex(colors?.linkVisited)) {
        root.style.setProperty('--link-visited', hexToHsl(colors.linkVisited));
        appliedProperties.push('--link-visited');
      }

      // ===== MENU/NAVIGATION COLORS =====
      const menuBgColor = colors?.menuBackground;
      let menuTextColor = colors?.menuText;
      
      if (isValidHex(menuBgColor)) {
        root.style.setProperty('--sidebar-background', hexToHsl(menuBgColor));
        root.style.setProperty('--menu-background', hexToHsl(menuBgColor));
        appliedProperties.push('--sidebar-background', '--menu-background');
        
        // Auto-correct menu text if needed for ADA compliance
        if (isValidHex(menuTextColor) && !meetsWCAG_AA(menuTextColor, menuBgColor)) {
          menuTextColor = getCompliantTextColor(menuBgColor);
          console.info(`[ADA] Auto-corrected menu text color to ${menuTextColor} for WCAG AA compliance`);
        }
      }
      
      if (isValidHex(menuTextColor)) {
        root.style.setProperty('--sidebar-foreground', hexToHsl(menuTextColor));
        root.style.setProperty('--menu-text', hexToHsl(menuTextColor));
        appliedProperties.push('--sidebar-foreground', '--menu-text');
      }
      
      if (isValidHex(colors?.menuHover)) {
        root.style.setProperty('--sidebar-accent', hexToHsl(colors.menuHover));
        root.style.setProperty('--menu-hover', hexToHsl(colors.menuHover));
        appliedProperties.push('--sidebar-accent', '--menu-hover');
      }
      
      if (isValidHex(colors?.menuActive)) {
        root.style.setProperty('--sidebar-primary', hexToHsl(colors.menuActive));
        root.style.setProperty('--menu-active', hexToHsl(colors.menuActive));
        appliedProperties.push('--sidebar-primary', '--menu-active');
      }

      // ===== TYPOGRAPHY =====
      if (typography?.headingFont) {
        const headingFont = typography.headingFont;
        loadGoogleFont(headingFont);
        root.style.setProperty('--font-display', `'${headingFont}', sans-serif`);
        appliedProperties.push('--font-display');
      }
      
      if (typography?.bodyFont) {
        const bodyFont = typography.bodyFont;
        loadGoogleFont(bodyFont);
        root.style.setProperty('--font-sans', `'${bodyFont}', sans-serif`);
        appliedProperties.push('--font-sans');
      }
      
      if (typography?.baseFontSize) {
        root.style.setProperty('--base-font-size', `${typography.baseFontSize}px`);
        root.style.fontSize = `${typography.baseFontSize}px`;
        appliedProperties.push('--base-font-size');
      }
      
      if (typography?.headingWeight) {
        root.style.setProperty('--heading-weight', typography.headingWeight);
        appliedProperties.push('--heading-weight');
      }
      
      if (typography?.bodyWeight) {
        root.style.setProperty('--body-weight', typography.bodyWeight);
        appliedProperties.push('--body-weight');
      }
      
      if (typography?.lineHeight) {
        root.style.setProperty('--line-height', typography.lineHeight.toString());
        appliedProperties.push('--line-height');
      }

      // ===== SPACING =====
      if (spacing?.borderRadius !== undefined) {
        root.style.setProperty('--radius', `${spacing.borderRadius}px`);
        appliedProperties.push('--radius');
      }
      
      if (spacing?.baseUnit !== undefined) {
        root.style.setProperty('--spacing-unit', `${spacing.baseUnit}px`);
        appliedProperties.push('--spacing-unit');
      }

      // ===== EFFECTS =====
      if (effects?.enableGradients !== undefined) {
        root.style.setProperty('--gradients-enabled', effects.enableGradients ? '1' : '0');
        appliedProperties.push('--gradients-enabled');
      }
      
      if (effects?.enableShadows !== undefined) {
        root.style.setProperty('--shadows-enabled', effects.enableShadows ? '1' : '0');
        appliedProperties.push('--shadows-enabled');
      }
      
      if (effects?.shadowIntensity !== undefined) {
        root.style.setProperty('--shadow-intensity', (effects.shadowIntensity / 100).toString());
        appliedProperties.push('--shadow-intensity');
      }

      // Update gradient variables if primary/accent are set
      if (isValidHex(primaryColor) && isValidHex(accentColor)) {
        const primaryHsl = hexToHsl(primaryColor);
        const accentHsl = hexToHsl(accentColor);
        root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${primaryHsl}) 0%, hsl(${accentHsl}) 100%)`);
        root.style.setProperty('--gradient-accent', `linear-gradient(135deg, hsl(${primaryHsl}) 0%, hsl(${accentHsl}) 100%)`);
        root.style.setProperty('--glow-primary', `0 0 40px hsl(${primaryHsl} / 0.3)`);
        appliedProperties.push('--gradient-primary', '--gradient-accent', '--glow-primary');
      }

    } catch (error) {
      console.error('Error applying brand theme:', error);
    }

    // Cleanup function to remove applied properties
    return () => {
      appliedProperties.forEach(prop => {
        root.style.removeProperty(prop);
      });
      // Reset font size
      root.style.fontSize = '';
    };
  }, [activeBrand]);

  return { activeBrand };
}

// Helper to load Google Fonts (skips system fonts)
function loadGoogleFont(fontName: string) {
  const systemFonts = ['Helvetica Neue', 'Arial', 'Georgia', 'Times New Roman'];
  if (systemFonts.includes(fontName)) return;
  
  const linkId = `font-${fontName.replace(/\s+/g, '-')}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }
}
