/**
 * Monochrome zinc color scheme for a developer-focused, emotionally neutral UI.
 * No warm colors, no blues, no gradients - just pure grayscale with exceptional restraint.
 */

import { Platform } from "react-native";

// Core monochrome palette - strictly grayscale
export const Colors = {
  // Background layers
  background: "#09090b",        // Near-black zinc - terminal at midnight
  surface: "#18181b",            // Card/panel background - subtle lift
  surfaceAlt: "#27272a",         // Secondary surfaces, muted areas
  
  // Borders & separators
  border: "#27272a",             // Barely-there borders - intentional minimalism
  borderSubtle: "#3f3f46",       // Slightly more visible borders when needed
  
  // Text hierarchy
  foreground: "#f4f4f5",         // Primary text - clean off-white
  foregroundAlt: "#e4e4e7",      // Secondary text - slightly dimmed
  muted: "#a1a1aa",              // Tertiary text, descriptions
  mutedDark: "#71717a",          // Even more subtle text
  subtle: "#52525b",             // Placeholder text, disabled states
  
  // Focus & interaction states
  ring: "#a1a1aa",               // Soft gray focus state - visible but restrained
  
  // Feedback (destructive only - no success/warning colors)
  destructive: "#7f1d1d",        // Dark blood-red - serious errors only
  destructiveForeground: "#fef2f2", // High readability on destructive background
  destructiveText: "#fca5a5",    // Error text on dark backgrounds - better visibility
  
  // Selection & highlights
  selection: "rgba(161, 161, 170, 0.15)", // Dark gray, low opacity
  
  // Legacy support (for gradual migration)
  light: {
    text: "#11181C",
    background: "#fff",
    tint: "#a1a1aa",
    icon: "#71717a",
    tabIconDefault: "#71717a",
    tabIconSelected: "#f4f4f5",
  },
  dark: {
    text: "#f4f4f5",
    background: "#09090b",
    tint: "#a1a1aa",
    icon: "#a1a1aa",
    tabIconDefault: "#71717a",
    tabIconSelected: "#f4f4f5",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
