import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../styles/theme';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  style,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[padding],
    style,
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
  },
  
  // Variants
  default: {
    ...theme.shadows.sm,
  },
  
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  
  elevated: {
    ...theme.shadows.lg,
  },
  
  // Padding
  none: {
    padding: 0,
  },
  
  small: {
    padding: theme.spacing[3],
  },
  
  medium: {
    padding: theme.spacing[4],
  },
  
  large: {
    padding: theme.spacing[6],
  },
});