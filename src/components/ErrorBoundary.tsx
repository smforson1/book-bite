import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { errorHandlingService } from '../services/errorHandlingService';
import { ghanaSMSService } from '../services/ghanaSMSService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  showDetails: boolean;
  isOffline: boolean;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private fadeAnim = new Animated.Value(0);
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      showDetails: false,
      isOffline: false,
      retryCount: 0,
    };
  }

  componentDidMount() {
    // Check connection status periodically
    this.connectionCheckInterval = setInterval(() => {
      const connectionStatus = errorHandlingService.getConnectionStatus();
      if (connectionStatus.isConnected !== this.state.isOffline) {
        this.setState({ isOffline: !connectionStatus.isConnected });
      }
    }, 5000);

    // Animate in
    Animated.timing(this.fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }

  componentWillUnmount() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    try {
      // Log error with Ghana context
      const errorId = await errorHandlingService.logError({
        type: 'ui',
        severity: 'high',
        message: `React Error: ${error.message}`,
        stack: error.stack,
        context: {
          action: 'component_error',
          screen: 'unknown', // Would be passed as prop in real implementation
        },
        userImpact: 'severe'
      });

      this.setState({ errorId });

      // Call custom error handler if provided
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }

      // For critical UI errors, try Ghana-specific recovery
      await errorHandlingService.attemptGhanaSpecificRecovery('ui_crash');

      console.error('React Error Boundary caught an error:', error, errorInfo);
    } catch (loggingError) {
      console.error('Failed to log error in boundary:', loggingError);
    }
  }

  handleRetry = async () => {
    try {
      this.setState(prevState => ({ 
        retryCount: prevState.retryCount + 1 
      }));

      // Check if we can recover
      const connectionStatus = errorHandlingService.getConnectionStatus();
      
      if (!connectionStatus.isConnected) {
        Alert.alert(
          'No Internet Connection',
          'Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Reset error state
      this.setState({
        hasError: false,
        error: null,
        errorId: null,
        showDetails: false,
      });

      // Mark error as resolved if we have an errorId
      if (this.state.errorId) {
        await errorHandlingService.markErrorResolved(this.state.errorId);
      }
    } catch (error) {
      console.error('Error during retry:', error);
      Alert.alert(
        'Retry Failed',
        'Unable to recover from error. Please restart the app.',
        [{ text: 'OK' }]
      );
    }
  };

  handleReportError = async () => {
    try {
      if (!this.state.error) return;

      const errorDetails = `
Error: ${this.state.error.message}
Stack: ${this.state.error.stack?.substring(0, 500) || 'N/A'}
Time: ${new Date().toISOString()}
Retry Count: ${this.state.retryCount}
      `.trim();

      // Try to send error report via SMS (Ghana-specific)
      const userData = { phone: '+233123456789' }; // Would get from auth context
      
      try {
        await ghanaSMSService.sendSMS({
          to: userData.phone,
          message: `BookBite Error Report: ${this.state.error.message}. Our team has been notified.`,
          type: 'promo',
          priority: 'high'
        });

        Alert.alert(
          'Error Reported',
          'Thank you for reporting this error. Our support team has been notified via SMS.',
          [{ text: 'OK' }]
        );
      } catch (smsError) {
        Alert.alert(
          'Error Report Saved',
          'Your error report has been saved locally and will be sent when connection is restored.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to report error:', error);
    }
  };

  renderGhanaOfflineMessage = () => (
    <View style={styles.offlineContainer}>
      <Ionicons name="wifi" size={24} color={theme.colors.warning[500]} />
      <Text style={styles.offlineText}>
        No internet connection. Using offline mode.
      </Text>
      <Text style={styles.offlineSubtext}>
        🇬🇭 BookBite works offline in Ghana! Your actions will sync when connected.
      </Text>
    </View>
  );

  renderErrorScreen = () => {
    const { error, showDetails, retryCount } = this.state;

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <Animated.View style={[styles.errorContainer, { opacity: this.fadeAnim }]}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle" size={80} color={theme.colors.error[500]} />
        </View>
        
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        
        <Text style={styles.errorMessage}>
          {error?.message || 'An unexpected error occurred'}
        </Text>

        <Text style={styles.ghanaMessage}>
          🇬🇭 Don't worry! BookBite is designed for Ghana's network conditions.
        </Text>

        {retryCount > 2 && (
          <View style={styles.persistentErrorInfo}>
            <Ionicons name="information-circle" size={16} color={theme.colors.warning[500]} />
            <Text style={styles.persistentErrorText}>
              Multiple retry attempts detected. This might be a network issue common in some Ghana areas.
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.retryButton]} 
            onPress={this.handleRetry}
          >
            <Ionicons name="refresh" size={20} color={theme.colors.neutral[0]} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.detailsButton]} 
            onPress={() => this.setState({ showDetails: !showDetails })}
          >
            <Ionicons name="information" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.detailsButtonText}>
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.reportButton]} 
            onPress={this.handleReportError}
          >
            <Ionicons name="send" size={20} color={theme.colors.warning[500]} />
            <Text style={styles.reportButtonText}>Report Error</Text>
          </TouchableOpacity>
        </View>

        {showDetails && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorDetailsTitle}>Error Details:</Text>
            <Text style={styles.errorDetailsText}>
              {error?.stack || error?.message || 'No details available'}
            </Text>
            <Text style={styles.errorDetailsText}>
              Error ID: {this.state.errorId || 'Unknown'}
            </Text>
            <Text style={styles.errorDetailsText}>
              Retry Count: {retryCount}
            </Text>
          </View>
        )}

        <View style={styles.supportInfo}>
          <Text style={styles.supportText}>
            Need help? Contact BookBite Ghana Support
          </Text>
          <Text style={styles.supportContact}>
            📞 +233 XX XXX XXXX | 📧 support@bookbite.com.gh
          </Text>
        </View>
      </Animated.View>
    );
  };

  render() {
    if (this.state.hasError) {
      return this.renderErrorScreen();
    }

    return (
      <View style={styles.container}>
        {this.state.isOffline && this.renderGhanaOfflineMessage()}
        {this.props.children}
      </View>
    );
  }
}

// Offline indicator component
export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = React.useState(false);
  const [queueSize, setQueueSize] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const connectionStatus = errorHandlingService.getConnectionStatus();
      const queueStatus = errorHandlingService.getOfflineQueueStatus();
      
      setIsOffline(!connectionStatus.isConnected);
      setQueueSize(queueStatus.queueSize);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!isOffline && queueSize === 0) {
    return null;
  }

  return (
    <View style={styles.offlineIndicator}>
      <Ionicons 
        name={isOffline ? "wifi" : "refresh"} 
        size={16} 
        color={theme.colors.neutral[0]} 
      />
      <Text style={styles.offlineIndicatorText}>
        {isOffline 
          ? `Offline (${queueSize} pending)` 
          : `Syncing (${queueSize} items)`
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.primary,
  },
  errorIcon: {
    marginBottom: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  errorMessage: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  ghanaMessage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
  },
  persistentErrorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  persistentErrorText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning[700],
  },
  actionButtons: {
    width: '100%',
    gap: theme.spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  retryButton: {
    backgroundColor: theme.colors.primary[500],
  },
  retryButtonText: {
    color: theme.colors.neutral[0],
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  detailsButton: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  detailsButtonText: {
    color: theme.colors.primary[500],
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  reportButton: {
    backgroundColor: theme.colors.warning[50],
    borderWidth: 1,
    borderColor: theme.colors.warning[500],
  },
  reportButtonText: {
    color: theme.colors.warning[600],
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  errorDetails: {
    width: '100%',
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
  },
  errorDetailsTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  errorDetailsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    fontFamily: 'monospace',
    marginBottom: theme.spacing.xs,
  },
  supportInfo: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  supportText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  supportContact: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  offlineContainer: {
    backgroundColor: theme.colors.warning[100],
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.warning[200],
  },
  offlineText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning[700],
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  offlineSubtext: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.warning[600],
    marginTop: theme.spacing.xs,
  },
  offlineIndicator: {
    position: 'absolute',
    top: 50,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.warning[500],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    zIndex: 1000,
  },
  offlineIndicatorText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[0],
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
});

export default ErrorBoundary;