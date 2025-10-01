import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

interface ErrorFeedbackProps {
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
  onDismiss?: () => void;
  actionText?: string;
  onAction?: () => void;
  retryAction?: () => void;
}

const ErrorFeedback: React.FC<ErrorFeedbackProps> = ({
  message,
  type,
  duration = 5000,
  onDismiss,
  actionText,
  onAction,
  retryAction,
}) => {
  const [visible, setVisible] = useState(true);
  const [slideAnim] = useState(new Animated.Value(-100));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after duration
    if (duration > 0) {
      const timer = setTimeout(() => {
        dismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  };

  const getIconName = () => {
    switch (type) {
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      case 'success':
        return 'checkmark-circle';
      default:
        return 'information-circle';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return theme.colors.error[50];
      case 'warning':
        return theme.colors.warning[50];
      case 'info':
        return theme.colors.info[50];
      case 'success':
        return theme.colors.success[50];
      default:
        return theme.colors.info[50];
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'error':
        return theme.colors.error[500];
      case 'warning':
        return theme.colors.warning[500];
      case 'info':
        return theme.colors.info[500];
      case 'success':
        return theme.colors.success[500];
      default:
        return theme.colors.info[500];
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return theme.colors.error[500];
      case 'warning':
        return theme.colors.warning[500];
      case 'info':
        return theme.colors.info[500];
      case 'success':
        return theme.colors.success[500];
      default:
        return theme.colors.info[500];
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderLeftColor: getBorderColor(),
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={getIconName() as any}
          size={24}
          color={getIconColor()}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={[globalStyles.body, styles.message]}>{message}</Text>
          {retryAction && (
            <TouchableOpacity onPress={retryAction} style={styles.retryButton}>
              <Text style={[globalStyles.bodySmall, styles.retryText]}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.actions}>
          {actionText && onAction && (
            <TouchableOpacity onPress={onAction} style={styles.actionButton}>
              <Text style={[globalStyles.bodySmall, styles.actionText]}>{actionText}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={dismiss} style={styles.dismissButton}>
            <Ionicons name="close" size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 80,
    left: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 1000,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    ...theme.shadows.md,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.md,
  },
  icon: {
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.sm,
  },
  message: {
    color: theme.colors.text.primary,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semiBold as '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionButton: {
    marginRight: theme.spacing.sm,
  },
  actionText: {
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semiBold as '600',
  },
  dismissButton: {
    padding: theme.spacing.xs,
  },
});

export default ErrorFeedback;