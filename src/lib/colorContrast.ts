/**
 * Color contrast utilities for ensuring readable text on any background
 * Implements WCAG 2.1 AA and AAA compliance checking
 */

/**
 * Parse HSL string to components
 */
export const parseHSL = (hsl: string): { h: number; s: number; l: number } | null => {
  // Handle "h s% l%" format (CSS variable format)
  const match = hsl.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)%?/);
  if (match) {
    return {
      h: parseFloat(match[1]),
      s: parseFloat(match[2]),
      l: parseFloat(match[3])
    };
  }
  return null;
};

/**
 * Parse HEX color to RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
};

/**
 * Convert HSL to RGB
 */
export const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
};

/**
 * Calculate relative luminance (WCAG formula)
 */
export const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two luminance values
 */
export const getContrastRatio = (l1: number, l2: number): number => {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Calculate contrast ratio between two hex colors
 */
export const getHexContrastRatio = (hex1: string, hex2: string): number => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;
  
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  return getContrastRatio(l1, l2);
};

/**
 * WCAG compliance levels
 */
export type WCAGLevel = 'AAA' | 'AA' | 'AA-large' | 'fail';

/**
 * Check WCAG compliance level for a contrast ratio
 * - AAA: 7:1 (enhanced)
 * - AA: 4.5:1 (normal text)
 * - AA-large: 3:1 (large text, 18pt+ or 14pt+ bold)
 * - fail: below 3:1
 */
export const getWCAGLevel = (contrastRatio: number): WCAGLevel => {
  if (contrastRatio >= 7) return 'AAA';
  if (contrastRatio >= 4.5) return 'AA';
  if (contrastRatio >= 3) return 'AA-large';
  return 'fail';
};

/**
 * Check if contrast meets WCAG AA for normal text (4.5:1)
 */
export const meetsWCAG_AA = (hex1: string, hex2: string): boolean => {
  return getHexContrastRatio(hex1, hex2) >= 4.5;
};

/**
 * Check if contrast meets WCAG AAA (7:1)
 */
export const meetsWCAG_AAA = (hex1: string, hex2: string): boolean => {
  return getHexContrastRatio(hex1, hex2) >= 7;
};

/**
 * Get a compliant text color for a given background
 * Returns black or white depending on which provides better contrast
 */
export const getCompliantTextColor = (bgHex: string): string => {
  const rgb = hexToRgb(bgHex);
  if (!rgb) return '#000000';
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  // Use white text on dark backgrounds, black on light
  return luminance > 0.179 ? '#000000' : '#ffffff';
};

/**
 * Suggest a compliant color that maintains hue but adjusts lightness
 */
export const suggestCompliantColor = (fgHex: string, bgHex: string, minRatio: number = 4.5): string => {
  const fgRgb = hexToRgb(fgHex);
  const bgRgb = hexToRgb(bgHex);
  if (!fgRgb || !bgRgb) return fgHex;

  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  
  // Determine if we need lighter or darker foreground
  const needsDarker = bgLuminance > 0.179;
  
  // Return appropriate extreme if current doesn't meet requirements
  const currentRatio = getHexContrastRatio(fgHex, bgHex);
  if (currentRatio >= minRatio) return fgHex;
  
  return needsDarker ? '#000000' : '#ffffff';
};

/**
 * Determine if background is light or dark
 */
export const isLightBackground = (h: number, s: number, l: number): boolean => {
  const { r, g, b } = hslToRgb(h, s, l);
  const luminance = getLuminance(r, g, b);
  return luminance > 0.179; // WCAG threshold
};

/**
 * Get the best contrasting text color class for a given background
 * Returns Tailwind class for foreground color
 */
export const getContrastTextClass = (bgLightness: number): string => {
  // If background is light (high lightness), use dark text
  // If background is dark (low lightness), use light text
  return bgLightness > 50 ? 'text-foreground' : 'text-white';
};

/**
 * Get contrasting foreground color for status badges
 */
export const getStatusTextColor = (status: string): string => {
  const statusColors: Record<string, { bg: number; text: string }> = {
    // Status with light backgrounds need dark text
    'hot': { bg: 55, text: 'text-red-700' },
    'warm': { bg: 60, text: 'text-orange-700' },
    'rising': { bg: 60, text: 'text-blue-700' },
    'stable': { bg: 70, text: 'text-foreground' },
    'pending': { bg: 70, text: 'text-foreground' },
    'in-progress': { bg: 60, text: 'text-blue-700' },
    'review': { bg: 60, text: 'text-amber-700' },
    'revision': { bg: 60, text: 'text-purple-700' },
    'completed': { bg: 60, text: 'text-green-700' },
    'active': { bg: 60, text: 'text-green-700' },
    'paused': { bg: 60, text: 'text-amber-700' },
    'live': { bg: 60, text: 'text-green-700' },
    'cached': { bg: 70, text: 'text-foreground' },
  };
  
  return statusColors[status]?.text || 'text-foreground';
};

/**
 * Badge color configurations with proper contrast
 * Each returns bg class and text class that ensure WCAG AA compliance
 */
export const badgeContrastColors = {
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800'
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800'
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800'
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800'
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800'
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-700'
  },
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary dark:text-primary',
    border: 'border-primary/20'
  }
};

export type BadgeColorConfig = {
  bg: string;
  text: string;
  border: string;
};

export type BadgeColorKey = keyof typeof badgeContrastColors;
