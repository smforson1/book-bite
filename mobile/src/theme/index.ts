export const UserTheme = {
    primary: '#FF6D00', // Sunset Orange (Vibrant primary)
    primaryLight: '#FF9E40',
    primaryDark: '#E65100',
    secondary: '#1A237E', // Midnight Indigo (Deep secondary)
    background: '#F8F9FE', // Very subtle cool-tinted white
    surface: '#FFFFFF',
    text: '#263238',
    textLight: '#78909C',
    white: '#FFFFFF',
    error: '#D32F2F',
    success: '#388E3C',
    warning: '#FFA000',
    border: '#ECEFF1',
};

export const ManagerTheme = {
    primary: '#1565C0', // Navy Blue
    primaryLight: '#90CAF9',
    primaryDark: '#0D47A1',
    secondary: '#37474F', // Blue Grey
    background: '#F5F7FA', // Cool Grey
    surface: '#FFFFFF',
    text: '#263238',
    textLight: '#78909C',
    white: '#FFFFFF',
    error: '#D32F2F',
    success: '#388E3C',
    warning: '#FFA000',
    border: '#CFD8DC',
};

export const DarkColors = {
    primary: '#FF8A50', // Lighter burnt orange for dark mode
    primaryLight: '#FFCC80',
    primaryDark: '#E65100',
    secondary: '#B0BEC5', // Light grey for dark backgrounds
    background: '#121212', // True dark background
    surface: '#1E1E1E', // Slightly lighter surface
    card: '#2C2C2C', // Card background
    text: '#FFFFFF', // White text
    textLight: '#B3B3B3', // Light grey text
    white: '#FFFFFF',
    error: '#EF5350', // Brighter red for dark mode
    success: '#66BB6A', // Brighter green for dark mode
    warning: '#FFA726', // Brighter orange for dark mode
    border: '#3A3A3A', // Dark border
    divider: '#2A2A2A', // Subtle divider
};

export const LightColors = UserTheme; // Alias for clarity

export const COLORS = UserTheme; // Default backward compatibility for now

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const SIZES = {
    width: 375, // Default width, will be overridden by Dimensions
    radius: {
        s: 8,
        m: 12,
        l: 16,
        xl: 24,
    },
    icon: {
        s: 16,
        m: 24,
        l: 32,
    }
};

export const FONTS = {
    regular: 'System', // Replace with custom font if loaded
    medium: 'System',
    bold: 'System',
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.secondary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.secondary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 5.46,
        elevation: 5,
    },
};
