export const theme = {
  colors: {
    primary: {
      50: '#FFF7ED',
      100: '#FFEDD5', 
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316', // Main primary color (orange) - represents warmth of Ghana
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
    },
    secondary: {
      50: '#F0F9FF',
      100: '#E0F2FE',
      200: '#BAE6FD',
      300: '#7DD3FC',
      400: '#38BDF8',
      500: '#0EA5E9', // Sky blue - represents clear Ghanaian skies
      600: '#0284C7',
      700: '#0369A1',
      800: '#075985',
      900: '#0C4A6E',
    },
    // Ghana flag colors
    ghanaRed: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
    ghanaGold: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    ghanaGreen: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
    },
    // Traditional Ghanaian colors
    kenteGold: '#FFD700',
    kenteRed: '#B22222',
    kenteGreen: '#006400',
    kenteBlue: '#1E90FF',
    adinkraBlack: '#2F2F2F',
    adinkraRed: '#8B0000',
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
      // Ghana-inspired backgrounds
      kentePattern: '#FFF8E1',
      adinkraPattern: '#F5F5F5',
    },
    border: {
      primary: '#E5E7EB',
      secondary: '#D1D5DB',
      tertiary: '#9CA3AF',
      // Ghana-inspired borders
      kenteGold: '#F59E0B',
      adinkraBlack: '#2F2F2F',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
    // Ghana-inspired rounded corners
    kente: 6, // Slightly angular to represent kente cloth patterns
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    // Ghana-inspired weights
    kenteBold: '800', // Bold for important Ghanaian elements
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    // Ghana-inspired shadows
    kente: {
      shadowColor: '#F59E0B',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
  },
  // Ghana-specific design elements
  ghanaDesign: {
    // Patterns inspired by traditional Ghanaian art
    patterns: {
      kente: {
        primary: '#F59E0B',
        secondary: '#B22222',
        accent: '#006400',
      },
      adinkra: {
        primary: '#2F2F2F',
        secondary: '#8B0000',
      },
    },
    // Cultural elements
    culturalElements: {
      kenteBorder: {
        borderWidth: 2,
        borderStyle: 'solid',
      },
      adinkraSymbol: {
        fontSize: 24,
        color: '#2F2F2F',
      },
    },
  },
};