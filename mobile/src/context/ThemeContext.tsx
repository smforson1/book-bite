import React, { createContext, useContext, ReactNode } from 'react';
import { UserTheme, ManagerTheme, SPACING, SIZES, FONTS, SHADOWS } from '../theme';

type ThemeType = typeof UserTheme;

interface ThemeContextType {
    colors: ThemeType;
    spacing: typeof SPACING;
    sizes: typeof SIZES;
    fonts: typeof FONTS;
    shadows: typeof SHADOWS;
    isManager: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children, isManager = false }: { children: ReactNode; isManager?: boolean }) => {
    const colors = isManager ? ManagerTheme : UserTheme;

    const theme = {
        colors,
        spacing: SPACING,
        sizes: SIZES,
        fonts: FONTS,
        shadows: SHADOWS,
        isManager,
    };

    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
