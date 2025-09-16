// Design System Theme Configuration

// Light Theme
export const lightTheme = {
  // Color Palette
  colors: {
    // Primary Colors
    primary: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3', // Main primary
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
    
    // Secondary Colors
    secondary: {
      50: '#FFF3E0',
      100: '#FFE0B2',
      200: '#FFCC80',
      300: '#FFB74D',
      400: '#FFA726',
      500: '#FF9800', // Main secondary
      600: '#FB8C00',
      700: '#F57C00',
      800: '#EF6C00',
      900: '#E65100',
    },
    
    // Success Colors
    success: {
      50: '#E8F5E8',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#4CAF50', // Main success
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
    },
    
    // Error Colors (alias for danger)
    error: {
      50: '#FFEBEE',
      100: '#FFCDD2',
      200: '#EF9A9A',
      300: '#E57373',
      400: '#EF5350',
      500: '#F44336', // Main error
      600: '#E53935',
      700: '#D32F2F',
      800: '#C62828',
      900: '#B71C1C',
    },
    
    // Danger Colors (same as error)
    danger: {
      50: '#FFEBEE',
      100: '#FFCDD2',
      200: '#EF9A9A',
      300: '#E57373',
      400: '#EF5350',
      500: '#F44336', // Main danger
      600: '#E53935',
      700: '#D32F2F',
      800: '#C62828',
      900: '#B71C1C',
    },
    
    // Info Colors
    info: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3', // Main info
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
    
    // Warning Colors
    warning: {
      50: '#FFF8E1',
      100: '#FFECB3',
      200: '#FFE082',
      300: '#FFD54F',
      400: '#FFCA28',
      500: '#FFC107', // Main warning
      600: '#FFB300',
      700: '#FFA000',
      800: '#FF8F00',
      900: '#FF6F00',
    },
    
    // Neutral Colors
    neutral: {
      0: '#FFFFFF',
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      1000: '#000000',
    },
    
    // Semantic Colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      tertiary: '#F1F3F4',
    },
    
    text: {
      primary: '#212121',
      secondary: '#616161',
      tertiary: '#9E9E9E',
      inverse: '#FFFFFF',
    },
    
    border: {
      light: '#E0E0E0',
      medium: '#BDBDBD',
      dark: '#757575',
    },
    
    shadow: {
      light: 'rgba(0, 0, 0, 0.1)',
      medium: 'rgba(0, 0, 0, 0.15)',
      dark: 'rgba(0, 0, 0, 0.25)',
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
    },
    
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
      '5xl': 36,
      '6xl': 42,
    },
    
    lineHeight: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 26,
      xl: 28,
      '2xl': 32,
      '3xl': 36,
      '4xl': 40,
      '5xl': 44,
      '6xl': 48,
    },
    
    fontWeight: {
      normal: '400' as '400',
      medium: '500' as '500',
      semiBold: '600' as '600',
      bold: '700' as '700',
      extraBold: '800' as '800',
    },
  },
  
  // Spacing
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
    32: 128,
    // Named spacing aliases
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  
  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Animation Durations
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
};

// Dark Theme
export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    // Primary Colors (darker variants)
    primary: {
      50: '#0D47A1',
      100: '#1565C0',
      200: '#1976D2',
      300: '#1E88E5',
      400: '#2196F3',
      500: '#42A5F5', // Main primary
      600: '#64B5F6',
      700: '#90CAF9',
      800: '#BBDEFB',
      900: '#E3F2FD',
    },
    
    // Secondary Colors (darker variants)
    secondary: {
      50: '#E65100',
      100: '#EF6C00',
      200: '#F57C00',
      300: '#FB8C00',
      400: '#FF9800',
      500: '#FFA726', // Main secondary
      600: '#FFB74D',
      700: '#FFCC80',
      800: '#FFE0B2',
      900: '#FFF3E0',
    },
    
    // Success Colors (darker variants)
    success: {
      50: '#1B5E20',
      100: '#2E7D32',
      200: '#388E3C',
      300: '#43A047',
      400: '#4CAF50',
      500: '#66BB6A', // Main success
      600: '#81C784',
      700: '#A5D6A7',
      800: '#C8E6C9',
      900: '#E8F5E8',
    },
    
    // Error/Danger Colors (darker variants)
    error: {
      50: '#B71C1C',
      100: '#C62828',
      200: '#D32F2F',
      300: '#E53935',
      400: '#F44336',
      500: '#EF5350', // Main error
      600: '#E57373',
      700: '#EF9A9A',
      800: '#FFCDD2',
      900: '#FFEBEE',
    },
    
    danger: {
      50: '#B71C1C',
      100: '#C62828',
      200: '#D32F2F',
      300: '#E53935',
      400: '#F44336',
      500: '#EF5350', // Main danger
      600: '#E57373',
      700: '#EF9A9A',
      800: '#FFCDD2',
      900: '#FFEBEE',
    },
    
    // Info Colors (darker variants)
    info: {
      50: '#0D47A1',
      100: '#1565C0',
      200: '#1976D2',
      300: '#1E88E5',
      400: '#2196F3',
      500: '#42A5F5', // Main info
      600: '#64B5F6',
      700: '#90CAF9',
      800: '#BBDEFB',
      900: '#E3F2FD',
    },
    
    // Warning Colors (darker variants)
    warning: {
      50: '#FF6F00',
      100: '#FF8F00',
      200: '#FFA000',
      300: '#FFB300',
      400: '#FFC107',
      500: '#FFCA28', // Main warning
      600: '#FFD54F',
      700: '#FFE082',
      800: '#FFECB3',
      900: '#FFF8E1',
    },
    
    // Neutral Colors (inverted for dark mode)
    neutral: {
      0: '#000000',
      50: '#212121',
      100: '#424242',
      200: '#616161',
      300: '#757575',
      400: '#9E9E9E',
      500: '#BDBDBD',
      600: '#E0E0E0',
      700: '#EEEEEE',
      800: '#F5F5F5',
      900: '#FAFAFA',
      1000: '#FFFFFF',
    },
    
    // Semantic Colors for dark mode
    background: {
      primary: '#121212',
      secondary: '#1E1E1E',
      tertiary: '#2D2D2D',
    },
    
    text: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
      tertiary: '#BDBDBD',
      inverse: '#212121',
    },
    
    border: {
      light: '#424242',
      medium: '#616161',
      dark: '#757575',
    },
    
    shadow: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.15)',
      dark: 'rgba(255, 255, 255, 0.25)',
    },
  },
};

// Default export for backward compatibility
export const theme = lightTheme;

// Type definitions for TypeScript
export type Theme = typeof lightTheme;
export type ThemeColors = typeof lightTheme.colors;
export type ThemeSpacing = typeof lightTheme.spacing;
export type ThemeBorderRadius = typeof lightTheme.borderRadius;
export type ThemeTypography = typeof lightTheme.typography;