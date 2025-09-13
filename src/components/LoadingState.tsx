import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

export interface LoadingStateProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyIcon?: keyof typeof Ionicons.glyphMap;
  errorTitle?: string;
  errorSubtitle?: string;
  errorIcon?: keyof typeof Ionicons.glyphMap;
  loadingText?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'minimal' | 'card' | 'overlay';
  onRetry?: () => void;
  retryText?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  loading = false,
  error = null,
  empty = false,
  emptyTitle = 'No Data Available',
  emptySubtitle = 'There\'s nothing to show here yet.',
  emptyIcon = 'folder-open-outline',
  errorTitle = 'Something went wrong',
  errorSubtitle = 'Please try again later.',
  errorIcon = 'alert-circle-outline',
  loadingText = 'Loading...',
  children,
  style,
  variant = 'default',
  onRetry,
  retryText = 'Try Again',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (loading || error || empty) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, error, empty, fadeAnim, scaleAnim]);

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    };

    switch (variant) {
      case 'minimal':
        return {
          ...baseStyle,
          padding: theme.spacing.lg,
        };
      case 'card':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.lg,
          margin: theme.spacing.md,
          ...theme.shadows.sm,
        };
      case 'overlay':
        return {
          ...baseStyle,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          zIndex: 1000,
        };
      default:
        return baseStyle;
    }
  };

  const renderLoadingState = () => (
    <Animated.View
      style={[
        getContainerStyle(),
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary[500]}
          style={styles.activityIndicator}
        />
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    </Animated.View>
  );

  const renderErrorState = () => (
    <Animated.View
      style={[
        getContainerStyle(),
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <View style={styles.stateContainer}>
        <View style={[styles.iconContainer, styles.errorIconContainer]}>
          <Ionicons
            name={errorIcon}
            size={48}
            color={theme.colors.error[500]}
          />
        </View>
        <Text style={[styles.stateTitle, styles.errorTitle]}>{errorTitle}</Text>
        <Text style={styles.stateSubtitle}>{errorSubtitle}</Text>
        {error && typeof error === 'string' && (
          <Text style={styles.errorMessage}>{error}</Text>
        )}
        {onRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View
      style={[
        getContainerStyle(),
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <View style={styles.stateContainer}>
        <View style={[styles.iconContainer, styles.emptyIconContainer]}>
          <Ionicons
            name={emptyIcon}
            size={48}
            color={theme.colors.text.tertiary}
          />
        </View>
        <Text style={styles.stateTitle}>{emptyTitle}</Text>
        <Text style={styles.stateSubtitle}>{emptySubtitle}</Text>
      </View>
    </Animated.View>
  );

  // Show loading state
  if (loading) {
    return renderLoadingState();
  }

  // Show error state
  if (error) {
    return renderErrorState();
  }

  // Show empty state
  if (empty) {
    return renderEmptyState();
  }

  // Show children when not in any loading/error/empty state
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
  },
  
  activityIndicator: {
    marginBottom: theme.spacing.lg,
  },
  
  loadingText: {
    ...globalStyles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  
  stateContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  
  emptyIconContainer: {
    backgroundColor: theme.colors.neutral[100],
  },
  
  errorIconContainer: {
    backgroundColor: theme.colors.error[50],
  },
  
  stateTitle: {
    ...globalStyles.h4,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  errorTitle: {
    color: theme.colors.error[600],
  },
  
  stateSubtitle: {
    ...globalStyles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  errorMessage: {
    ...globalStyles.bodySmall,
    color: theme.colors.error[500],
    textAlign: 'center',
    backgroundColor: theme.colors.error[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  
  retryButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  
  retryButtonText: {
    ...globalStyles.bodyLarge,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
});

export default LoadingState;