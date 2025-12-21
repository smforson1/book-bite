export const UserTheme = {
    primary: '#E65100', // Burnt Orange
    primaryLight: '#FFCC80',
    primaryDark: '#BF360C',
    secondary: '#263238', // Dark Charcoal
    background: '#FFF8F6', // Very subtle warm white
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
