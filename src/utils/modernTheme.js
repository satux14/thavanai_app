/**
 * Modern Color Theme for eThavanai Book
 * 2025 Trendy Color Palette
 */

export const ModernColors = {
  // Primary Brand Colors
  primary: '#6366F1',      // Modern Indigo - vibrant and professional
  primaryDark: '#4F46E5',  // Deep Indigo
  primaryLight: '#818CF8', // Light Indigo
  
  // Secondary/Accent Colors
  accent: '#EC4899',       // Hot Pink - modern and eye-catching
  accentLight: '#F472B6', // Light Pink
  
  // Success/Money/Positive
  success: '#10B981',      // Emerald Green - fresh and modern
  successLight: '#34D399', // Light Emerald
  successBg: '#D1FAE5',    // Very light green background
  
  // Warning/Alert
  warning: '#F59E0B',      // Amber - warm and inviting
  warningLight: '#FCA5A5',
  warningBg: '#FEF3C7',    // Light amber background
  
  // Danger/Negative
  danger: '#EF4444',       // Modern Red
  dangerLight: '#F87171',
  
  // Info/Balance
  info: '#06B6D4',         // Cyan - cool and trustworthy
  infoLight: '#22D3EE',
  infoBg: '#CFFAFE',       // Light cyan background
  
  // Neutral/Background Colors
  background: '#F9FAFB',   // Light gray - clean
  backgroundDark: '#F3F4F6',
  surface: '#FFFFFF',      // White
  
  // Text Colors
  textPrimary: '#111827',  // Almost black
  textSecondary: '#6B7280', // Gray
  textTertiary: '#9CA3AF', // Light gray
  textOnPrimary: '#FFFFFF', // White text on colored backgrounds
  
  // Border Colors
  border: '#E5E7EB',       // Light border
  borderDark: '#D1D5DB',   // Darker border
  
  // Gradient Colors (for advanced styling)
  gradientStart: '#6366F1', // Indigo
  gradientEnd: '#EC4899',   // Pink
  
  // Additional Feature Colors
  favorite: '#FBBF24',     // Gold - for favorites
  closed: '#6B7280',       // Gray - for closed books
  shared: '#8B5CF6',       // Purple - for shared items
  premium: '#F59E0B',      // Amber - for premium features
};

export const ModernShadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const ModernSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const ModernBorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  round: 50,
};

export default {
  colors: ModernColors,
  shadows: ModernShadows,
  spacing: ModernSpacing,
  borderRadius: ModernBorderRadius,
};

