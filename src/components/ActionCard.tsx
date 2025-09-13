import React, { useRef } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

export interface ActionCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gradient';
  style?: ViewStyle;
  disabled?: boolean;
  enableHover?: boolean;
  gradientColors?: string[];
}

export const ActionCard: React.FC<ActionCardProps> = ({
  children,
  onPress,
  variant = 'default',
  style,
  disabled = false,
  enableHover = true,
  gradientColors,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (enableHover && !disabled) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0.95,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (enableHover && !disabled) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const getGradientColors = (): [string, string, ...string[]] => {
    if (gradientColors && gradientColors.length >= 2) {
      return gradientColors as [string, string, ...string[]];
    }
    
    switch (variant) {
      case 'primary':
        return [theme.colors.primary[400], theme.colors.primary[600]];
      case 'secondary':
        return [theme.colors.secondary[400], theme.colors.secondary[600]];
      case 'success':
        return [theme.colors.success[400], theme.colors.success[600]];
      case 'warning':
        return [theme.colors.warning[400], theme.colors.warning[600]];
      case 'error':
        return [theme.colors.error[400], theme.colors.error[600]];
      case 'gradient':
        return [theme.colors.primary[500], theme.colors.secondary[500]];
      default:
        return [theme.colors.background.primary, theme.colors.background.secondary];
    }
  };

  const cardStyle = [
    styles.base,
    variant !== 'gradient' && styles[variant],
    disabled && styles.disabled,
    style,
  ];

  const animatedStyle = {
    transform: [{ scale: scaleValue }],
    opacity: opacityValue,
  };

  if (onPress && !disabled) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={cardStyle}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {variant === 'gradient' ? (
            <LinearGradient
              colors={getGradientColors()}
              style={styles.gradientContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {children}
            </LinearGradient>
          ) : (
            children
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={cardStyle}>
      {variant === 'gradient' ? (
        <LinearGradient
          colors={getGradientColors()}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    ...theme.shadows.lg,
    overflow: 'hidden',
  },
  
  gradientContainer: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    margin: -theme.spacing[4],
  },
  
  // Variants
  default: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.neutral[300],
    backgroundColor: theme.colors.background.primary,
  },
  
  primary: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  
  secondary: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.secondary[500],
    backgroundColor: theme.colors.secondary[50],
  },
  
  success: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success[500],
    backgroundColor: theme.colors.success[50],
  },
  
  warning: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning[500],
    backgroundColor: theme.colors.warning[50],
  },
  
  error: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error[500],
    backgroundColor: theme.colors.error[50],
  },
  
  disabled: {
    opacity: 0.6,
  },
});