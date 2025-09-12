import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../styles/theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'outlined',
  size = 'medium',
  fullWidth = true,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const containerStyle = [
    styles.container,
    fullWidth && styles.fullWidth,
    style,
  ];

  const inputContainerStyle = [
    styles.inputContainer,
    styles[variant],
    styles[size],
    isFocused && styles.focused,
    error && styles.error,
  ];

  const textInputStyle = [
    styles.input,
    styles[`${size}Input`],
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    inputStyle,
  ].filter(Boolean);

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={inputContainerStyle}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={textInputStyle as any}
          placeholderTextColor={theme.colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[4],
  },
  
  fullWidth: {
    width: '100%',
  },
  
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
  },
  
  // Variants
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    backgroundColor: theme.colors.background.primary,
  },
  
  filled: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 0,
  },
  
  // Sizes
  small: {
    minHeight: 36,
    paddingHorizontal: theme.spacing[3],
  },
  
  medium: {
    minHeight: 44,
    paddingHorizontal: theme.spacing[4],
  },
  
  large: {
    minHeight: 52,
    paddingHorizontal: theme.spacing[5],
  },
  
  // States
  focused: {
    borderColor: theme.colors.primary[500],
    borderWidth: 2,
  },
  
  error: {
    borderColor: theme.colors.error[500],
    borderWidth: 1,
  },
  
  // Input
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    padding: 0,
  },
  
  smallInput: {
    fontSize: theme.typography.fontSize.sm,
  },
  
  mediumInput: {
    fontSize: theme.typography.fontSize.md,
  },
  
  largeInput: {
    fontSize: theme.typography.fontSize.lg,
  },
  
  inputWithLeftIcon: {
    marginLeft: theme.spacing[2],
  },
  
  inputWithRightIcon: {
    marginRight: theme.spacing[2],
  },
  
  // Icons
  leftIcon: {
    marginRight: theme.spacing[2],
  },
  
  rightIcon: {
    marginLeft: theme.spacing[2],
  },
  
  // Helper text
  helperText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing[1],
    marginLeft: theme.spacing[1],
  },
  
  errorText: {
    color: theme.colors.error[500],
  },
});