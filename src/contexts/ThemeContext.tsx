import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme as lightTheme } from '../styles/theme';

// Define dark theme colors
const darkTheme = {
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

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: typeof lightTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // Default to system preference or light mode
        setIsDarkMode(false);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      setIsDarkMode(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('themePreference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};