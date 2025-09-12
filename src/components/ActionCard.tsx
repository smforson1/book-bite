import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../styles/theme';

export interface ActionCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  style?: ViewStyle;
  disabled?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  children,
  onPress,
  variant = 'default',
  style,
  disabled = false,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

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
    padding: theme.spacing[4],
    ...theme.shadows.md,
  },
  
  // Variants
  default: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.neutral[300],
  },
  
  primary: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[500],
  },
  
  secondary: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.secondary[500],
  },
  
  success: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success[500],
  },
  
  warning: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning[500],
  },
  
  error: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error[500],
  },
  
  disabled: {
    opacity: 0.6,
  },
});