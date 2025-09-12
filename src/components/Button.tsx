import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../styles/theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const buttonTextStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    (disabled || loading) && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.colors.neutral[0] : theme.colors.primary[500]}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={buttonTextStyle}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  
  // Variants
  primary: {
    backgroundColor: theme.colors.primary[500],
  },
  
  secondary: {
    backgroundColor: theme.colors.secondary[500],
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
  },
  
  ghost: {
    backgroundColor: 'transparent',
  },
  
  danger: {
    backgroundColor: theme.colors.error[500],
  },
  
  // Sizes
  small: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    minHeight: 36,
  },
  
  medium: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    minHeight: 44,
  },
  
  large: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[4],
    minHeight: 52,
  },
  
  // Text styles
  text: {
    fontWeight: theme.typography.fontWeight.semiBold,
    marginHorizontal: theme.spacing[1],
  },
  
  primaryText: {
    color: theme.colors.neutral[0],
  },
  
  secondaryText: {
    color: theme.colors.neutral[0],
  },
  
  outlineText: {
    color: theme.colors.primary[500],
  },
  
  ghostText: {
    color: theme.colors.primary[500],
  },
  
  dangerText: {
    color: theme.colors.neutral[0],
  },
  
  smallText: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.sm,
  },
  
  mediumText: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.md,
  },
  
  largeText: {
    fontSize: theme.typography.fontSize.lg,
    lineHeight: theme.typography.lineHeight.lg,
  },
  
  // States
  disabled: {
    opacity: 0.6,
  },
  
  disabledText: {
    opacity: 0.8,
  },
  
  fullWidth: {
    width: '100%',
  },
});